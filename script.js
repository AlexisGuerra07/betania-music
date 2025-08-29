// Estado global de la aplicación
const AppState = {
    currentView: 'canciones',
    currentSong: null,
    editingSongId: null,
    songs: [],
    currentTranspose: 0,
    settings: {
        notation: 'latin',
        fontSize: 14,
        shortcuts: true
    }
};

// Utilidades para localStorage
const Storage = {
    SONGS_KEY: 'betania_songs_v3',
    SETTINGS_KEY: 'betania_settings_v3',

    saveSongs() {
        try {
            localStorage.setItem(this.SONGS_KEY, JSON.stringify(AppState.songs));
            this.updateSaveStatus('saved');
            return true;
        } catch (error) {
            console.error('Error saving songs:', error);
            return false;
        }
    },

    loadSongs() {
        try {
            const data = localStorage.getItem(this.SONGS_KEY);
            if (data) {
                AppState.songs = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading songs:', error);
        }
    },

    saveSettings() {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(AppState.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    },

    loadSettings() {
        try {
            const data = localStorage.getItem(this.SETTINGS_KEY);
            if (data) {
                AppState.settings = { ...AppState.settings, ...JSON.parse(data) };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    },

    updateSaveStatus(status) {
        const indicator = document.getElementById('save-indicator');
        if (indicator) {
            indicator.textContent = status === 'saved' ? 'Guardado' : 'Sin guardar';
            indicator.className = `save-indicator ${status === 'saved' ? '' : 'unsaved'}`;
        }
    }
};

// Parser de acordes mejorado
const ChordParser = {
    chordRegexes: {
        latin: /\b(Do|Re|Mi|Fa|Sol|La|Si)([#b])?(maj7|maj9|m7|m9|m|dim|aug|add\d+|sus2|sus4|7|9|11|13|°|ø)?(?:\/(Do|Re|Mi|Fa|Sol|La|Si)([#b])?)?\b/g,
        anglo: /\b([A-G])([#b])?(maj7|maj9|m7|m9|m|dim|aug|add\d+|sus2|sus4|7|9|11|13|°|ø)?(?:\/([A-G])([#b])?)?\b/g
    },

    isChordLine(line, notation = 'latin') {
        if (!line.trim()) return false;
        
        const regex = this.chordRegexes[notation];
        const matches = [...line.matchAll(regex)];
        
        if (matches.length === 0) return false;
        
        // Calcular densidad de acordes
        const chordChars = matches.reduce((acc, match) => acc + match[0].length, 0);
        const totalChars = line.replace(/\s/g, '').length;
        
        return totalChars > 0 && (chordChars / totalChars) >= 0.30;
    },

    detectAndParse(text, notation = 'latin') {
        const lines = text.split('\n');
        const sections = [];
        let currentSection = { label: 'Intro', pairs: [] };
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // Detectar encabezados de sección
            if (this.isSectionHeader(trimmed)) {
                if (currentSection.pairs.length > 0) {
                    sections.push(currentSection);
                }
                currentSection = {
                    label: this.normalizeSectionName(trimmed),
                    pairs: []
                };
                continue;
            }
            
            // Saltar líneas vacías
            if (!trimmed) continue;
            
            // Detectar líneas de acordes
            if (this.isChordLine(line, notation)) {
                const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
                const nextTrimmed = nextLine.trim();
                
                if (!nextTrimmed || this.isChordLine(nextLine, notation)) {
                    // Línea de acordes sin letra correspondiente
                    currentSection.pairs.push({
                        acordes: line,
                        letra: ''
                    });
                } else {
                    // Línea de acordes con letra
                    currentSection.pairs.push({
                        acordes: line,
                        letra: nextLine
                    });
                    i++; // Saltar la línea de letra
                }
            } else {
                // Línea de letra sin acordes
                if (currentSection.pairs.length > 0 && !currentSection.pairs[currentSection.pairs.length - 1].letra.trim()) {
                    currentSection.pairs[currentSection.pairs.length - 1].letra = line;
                } else {
                    currentSection.pairs.push({
                        acordes: '',
                        letra: line
                    });
                }
            }
        }
        
        if (currentSection.pairs.length > 0) {
            sections.push(currentSection);
        }
        
        return sections;
    },

    isSectionHeader(line) {
        const sectionPatterns = [
            /^(INTRO|VERSO|PRE|CORO|PUENTE|SOLO|OUTRO|BRIDGE|CHORUS|VERSE)\s*\d*$/i,
            /^\[.+\]$/,
            /^[A-Z][A-Z\s]+:?$/
        ];
        return sectionPatterns.some(pattern => pattern.test(line.trim()));
    },

    normalizeSectionName(line) {
        const normalized = line.replace(/[\[\]:]/g, '').trim();
        const translations = {
            'INTRO': 'Intro',
            'VERSO': 'Verso',
            'VERSE': 'Verso',
            'PRE': 'Pre-Coro',
            'CORO': 'Coro',
            'CHORUS': 'Coro',
            'PUENTE': 'Puente',
            'BRIDGE': 'Puente',
            'SOLO': 'Solo',
            'OUTRO': 'Outro'
        };
        return translations[normalized.toUpperCase()] || normalized;
    }
};

// Transpositor de acordes
const Transposer = {
    notes: {
        latin: ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'],
        anglo: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    },

    flatMap: {
        latin: { 'Do#': 'Reb', 'Re#': 'Mib', 'Fa#': 'Solb', 'Sol#': 'Lab', 'La#': 'Sib' },
        anglo: { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' }
    },

    transpose(chord, semitones, notation = 'latin') {
        if (!chord || semitones === 0) return chord;
        
        const notes = this.notes[notation];
        const regex = ChordParser.chordRegexes[notation];
        
        return chord.replace(regex, (match, root, accidental, suffix, bassRoot, bassAccidental) => {
            // Transponer raíz
            let rootIndex = notes.indexOf(root + (accidental || ''));
            if (rootIndex === -1) rootIndex = notes.indexOf(root);
            
            let newRootIndex = (rootIndex + semitones) % 12;
            if (newRootIndex < 0) newRootIndex += 12;
            
            let newRoot = notes[newRootIndex];
            
            // Transponer bajo si existe
            let newBass = '';
            if (bassRoot) {
                let bassIndex = notes.indexOf(bassRoot + (bassAccidental || ''));
                if (bassIndex === -1) bassIndex = notes.indexOf(bassRoot);
                
                let newBassIndex = (bassIndex + semitones) % 12;
                if (newBassIndex < 0) newBassIndex += 12;
                
                newBass = '/' + notes[newBassIndex];
            }
            
            return newRoot + (suffix || '') + newBass;
        });
    }
};

// Router de navegación
const Router = {
    init() {
        // Configurar eventos de navegación
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.navigate(tab.dataset.route);
            });
        });

        // Configurar botones principales
        this.setupMainButtons();
        
        // Navegar a la vista inicial
        this.navigate('canciones');
    },

    navigate(view) {
        // Actualizar estado
        AppState.currentView = view;
        
        // Actualizar tabs activas
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.route === view) {
                tab.classList.add('active');
            }
        });
        
        // Mostrar vista correspondiente
        document.querySelectorAll('.view').forEach(viewEl => {
            viewEl.classList.remove('active');
        });
        
        const targetView = document.getElementById(`view-${view}`);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        // Ejecutar lógica específica de cada vista
        switch (view) {
            case 'canciones':
                this.renderSongsList();
                break;
            case 'edicion':
                this.showInitialDialog();
                break;
            case 'configuracion':
                this.loadConfigurationView();
                break;
        }
    },

    setupMainButtons() {
        // Botón añadir canción
        document.getElementById('btn-add-song').addEventListener('click', () => {
            this.navigate('edicion');
        });

        // Botón volver desde reader
        document.getElementById('btn-back-to-list').addEventListener('click', () => {
            this.navigate('canciones');
        });

        // Botón volver desde editor
        document.getElementById('btn-back-from-editor').addEventListener('click', () => {
            this.saveCurrentSong();
            this.navigate('canciones');
        });

        // Botón editar desde reader
        document.getElementById('btn-edit-song').addEventListener('click', () => {
            if (AppState.currentSong) {
                this.editSong(AppState.currentSong.id);
            }
        });

        // Botones de transposición en reader
        document.getElementById('btn-transpose-up-reader').addEventListener('click', () => {
            this.transposeSong(1);
        });

        document.getElementById('btn-transpose-down-reader').addEventListener('click', () => {
            this.transposeSong(-1);
        });

        document.getElementById('btn-reset-key-reader').addEventListener('click', () => {
            this.resetTransposition();
        });

        // Selector de notación en reader
        document.getElementById('notation-reader').addEventListener('change', (e) => {
            AppState.settings.notation = e.target.value;
            Storage.saveSettings();
            if (AppState.currentSong) {
                this.renderSongContent();
            }
        });

        // Botones del editor
        document.getElementById('btn-save-song').addEventListener('click', () => {
            this.saveCurrentSong();
        });

        document.getElementById('btn-add-section').addEventListener('click', () => {
            Editor.addSection();
        });

        document.getElementById('btn-add-pair-editor').addEventListener('click', () => {
            Editor.addPair();
        });

        // Botones de transposición en editor
        document.getElementById('btn-transpose-up').addEventListener('click', () => {
            Editor.transpose(1);
        });

        document.getElementById('btn-transpose-down').addEventListener('click', () => {
            Editor.transpose(-1);
        });

        document.getElementById('btn-reset-transpose').addEventListener('click', () => {
            Editor.resetTranspose();
        });

        // Botones de exportación/importación
        document.getElementById('btn-export-json').addEventListener('click', () => {
            Editor.exportJSON();
        });

        document.getElementById('btn-import-json').addEventListener('click', () => {
            Editor.importJSON();
        });

        // Búsqueda de canciones
        document.getElementById('search-box').addEventListener('input', (e) => {
            this.filterSongs(e.target.value);
        });

        // Configuración
        document.getElementById('default-notation').addEventListener('change', (e) => {
            AppState.settings.notation = e.target.value;
            Storage.saveSettings();
        });

        document.getElementById('editor-font-size').addEventListener('change', (e) => {
            AppState.settings.fontSize = parseInt(e.target.value);
            Storage.saveSettings();
        });

        document.getElementById('btn-export-data').addEventListener('click', () => {
            Config.exportData();
        });

        document.getElementById('btn-import-data').addEventListener('click', () => {
            Config.importData();
        });

        document.getElementById('btn-clear-data').addEventListener('click', () => {
            Config.clearData();
        });
    },

    renderSongsList() {
        const grid = document.getElementById('songs-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (AppState.songs.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            grid.style.display = 'grid';
            
            grid.innerHTML = AppState.songs.map(song => `
                <div class="song-card" onclick="Router.viewSong('${song.id}')">
                    <div class="song-title">${song.title}</div>
                    <div class="song-meta">
                        ${song.artist ? `${song.artist} • ` : ''}
                        ${song.keyBase} • 
                        ${song.notation === 'latin' ? 'Latina' : 'Anglosajona'}
                    </div>
                    <div class="song-actions" onclick="event.stopPropagation()">
                        <button class="btn-sm btn-primary" onclick="Router.editSong('${song.id}')">Editar</button>
                        <button class="btn-sm btn-danger" onclick="Router.deleteSong('${song.id}')">Eliminar</button>
                    </div>
                </div>
            `).join('');
        }
    },

    filterSongs(query) {
        const cards = document.querySelectorAll('.song-card');
        const lowerQuery = query.toLowerCase();
        
        cards.forEach(card => {
            const title = card.querySelector('.song-title').textContent.toLowerCase();
            const meta = card.querySelector('.song-meta').textContent.toLowerCase();
            
            if (title.includes(lowerQuery) || meta.includes(lowerQuery)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    },

    viewSong(songId) {
        const song = AppState.songs.find(s => s.id === songId);
        if (!song) return;
        
        AppState.currentSong = song;
        AppState.currentTranspose = 0;
        
        // Actualizar header del reader
        document.getElementById('reader-title').textContent = song.title;
        document.getElementById('reader-meta').textContent = `${song.artist || 'Sin autor'} • ${song.keyBase}`;
        document.getElementById('current-key-reader').textContent = song.keyBase;
        document.getElementById('notation-reader').value = song.notation;
        
        this.renderSongContent();
        this.navigate('song-reader');
    },

    editSong(songId) {
        const song = AppState.songs.find(s => s.id === songId);
        if (!song) return;
        
        AppState.editingSongId = songId;
        AppState.currentSong = JSON.parse(JSON.stringify(song)); // Deep copy
        
        this.navigate('edicion');
        Editor.loadSong(AppState.currentSong);
    },

    deleteSong(songId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta canción?')) {
            AppState.songs = AppState.songs.filter(s => s.id !== songId);
            Storage.saveSongs();
            this.renderSongsList();
        }
    },

    renderSongContent() {
        const content = document.getElementById('song-content');
        if (!AppState.currentSong) return;
        
        content.innerHTML = AppState.currentSong.sections.map(section => `
            <div class="section">
                <div class="section-label">${section.label}</div>
                ${section.pairs.map(pair => `
                    <div class="pair">
                        ${pair.acordes ? `<div class="chord-line">${pair.acordes}</div>` : ''}
                        ${pair.letra ? `<div class="lyric-line">${pair.letra}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `).join('');
    },

    transposeSong(semitones) {
        if (!AppState.currentSong) return;
        
        AppState.currentTranspose += semitones;
        
        // Actualizar visualización de la tonalidad actual
        const baseKey = AppState.currentSong.keyBase;
        const currentKey = Transposer.transpose(baseKey, AppState.currentTranspose, AppState.currentSong.notation);
        document.getElementById('current-key-reader').textContent = currentKey;
        
        // Transponer contenido
        const chordLines = document.querySelectorAll('.chord-line');
        chordLines.forEach(line => {
            const originalText = line.textContent;
            const transposedText = Transposer.transpose(originalText, semitones, AppState.currentSong.notation);
            line.textContent = transposedText;
        });
    },

    resetTransposition() {
        if (AppState.currentTranspose === 0) return;
        
        this.transposeSong(-AppState.currentTranspose);
        AppState.currentTranspose = 0;
    },

    showInitialDialog() {
        // Mostrar formulario inicial para nueva canción
        const modal = this.createModal({
            title: 'Nueva Canción',
            content: `
                <div class="form-group">
                    <label class="form-label">Título *</label>
                    <input type="text" class="form-input" id="modal-title" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Autor/Intérprete</label>
                    <input type="text" class="form-input" id="modal-artist">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Notación</label>
                        <select class="form-select" id="modal-notation">
                            <option value="latin" ${AppState.settings.notation === 'latin' ? 'selected' : ''}>Latina (Do, Re, Mi...)</option>
                            <option value="anglo" ${AppState.settings.notation === 'anglo' ? 'selected' : ''}>Anglosajona (C, D, E...)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tonalidad Base</label>
                        <select class="form-select" id="modal-key">
                            ${this.getKeyOptions(AppState.settings.notation)}
                        </select>
                    </div>
                </div>
            `,
            actions: [
                { text: 'Cancelar', action: () => { this.closeModal(); this.navigate('canciones'); } },
                { 
                    text: 'Continuar', 
                    primary: true, 
                    action: () => this.proceedToCreation() 
                }
            ]
        });

        // Actualizar opciones de tonalidad cuando cambie la notación
        document.getElementById('modal-notation').addEventListener('change', (e) => {
            const keySelect = document.getElementById('modal-key');
            keySelect.innerHTML = this.getKeyOptions(e.target.value);
        });
    },

    getKeyOptions(notation) {
        const keys = notation === 'latin' 
            ? ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si']
            : ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        
        return keys.map(key => `<option value="${key}">${key}</option>`).join('');
    },

    proceedToCreation() {
        const title = document.getElementById('modal-title').value.trim();
        if (!title) {
            alert('El título es obligatorio');
            return;
        }
        
        const songData = {
            id: this.generateId(),
            title: title,
            artist: document.getElementById('modal-artist').value.trim(),
            notation: document.getElementById('modal-notation').value,
            keyBase: document.getElementById('modal-key').value,
            sections: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        AppState.currentSong = songData;
        AppState.editingSongId = null; // Es una canción nueva
        
        this.closeModal();
        this.showCreationOptions();
    },

    showCreationOptions() {
        const modal = this.createModal({
            title: 'Método de creación',
            content: `
                <div class="creation-options">
                    <div class="option-card recommended" onclick="Router.showTextInput()">
                        <div class="option-recommended">Recomendado</div>
                        <div class="option-title">📝 Pegar texto</div>
                        <p>Pega el texto completo de tu canción y se convertirá automáticamente a pares acordes/letra</p>
                    </div>
                    <div class="option-card" onclick="Router.showPDFInput()">
                        <div class="option-title">📄 Importar PDF</div>
                        <p>Sube un archivo PDF y extrae el texto automáticamente</p>
                        <small>⚠️ Beta: puede alterar espacios</small>
                    </div>
                </div>
            `,
            actions: [
                { text: 'Cancelar', action: () => { this.closeModal(); this.navigate('canciones'); } }
            ]
        });
    },

    showTextInput() {
        this.closeModal();
        const modal = this.createModal({
            title: 'Pegar texto de la canción',
            content: `
                <div class="form-group">
                                            <div class="toggle-switch" id="soft-wrap-toggle"></div>
                        <span>ON/OFF</span>
                    </div>
                    <textarea class="form-textarea" id="song-text-input" placeholder="Pega aquí el texto completo de tu canción con acordes y letra...

Ejemplo:
CORO
                Em              D
//Ningún principado, ni las potestades
        C                       Am
Ni armas forjadas. ¿Quién podrá? ¿Quién podrá?"></textarea>
                </div>
            `,
            actions: [
                { text: 'Cancelar', action: () => { this.closeModal(); this.showCreationOptions(); } },
                { text: 'Convertir a pares', primary: true, action: () => this.parseTextInput() }
            ]
        });

        // Configurar toggle de soft wrap
        const toggle = document.getElementById('soft-wrap-toggle');
        const textarea = document.getElementById('song-text-input');
        
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            if (toggle.classList.contains('active')) {
                textarea.style.whiteSpace = 'pre-wrap';
                textarea.style.overflowX = 'hidden';
            } else {
                textarea.style.whiteSpace = 'pre';
                textarea.style.overflowX = 'auto';
            }
        });
    },

    showPDFInput() {
        this.closeModal();
        const modal = this.createModal({
            title: 'Importar PDF',
            content: `
                <div style="background: rgba(237, 137, 54, 0.1); border: 1px solid var(--warning-color); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; color: var(--warning-color);">
                    <strong>⚠️ Funcionalidad Beta</strong><br>
                    La importación de PDF puede alterar espacios y saltos de línea. Revisa el resultado antes de guardar.
                </div>
                <div class="form-group">
                    <label class="form-label">Seleccionar archivo PDF</label>
                    <input type="file" class="form-input" id="pdf-file-input" accept=".pdf">
                </div>
                <div id="pdf-status" style="margin-top: 1rem; font-size: 0.9rem;"></div>
            `,
            actions: [
                { text: 'Cancelar', action: () => { this.closeModal(); this.showCreationOptions(); } }
            ]
        });

        document.getElementById('pdf-file-input').addEventListener('change', (e) => {
            this.handlePDFFile(e.target.files[0]);
        });
    },

    async handlePDFFile(file) {
        if (!file) return;
        
        const statusEl = document.getElementById('pdf-status');
        statusEl.innerHTML = '🔄 Procesando PDF...';
        
        try {
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js no está cargado');
            }
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }
            
            statusEl.innerHTML = '✅ PDF procesado exitosamente';
            
            // Parsear automáticamente el texto extraído
            setTimeout(() => {
                this.parseExtractedText(fullText);
            }, 1000);
            
        } catch (error) {
            console.error('Error processing PDF:', error);
            statusEl.innerHTML = '❌ Error al procesar el PDF. Verifica que el archivo sea válido.';
        }
    },

    parseTextInput() {
        const text = document.getElementById('song-text-input').value;
        if (!text.trim()) {
            alert('Por favor, ingresa el texto de la canción.');
            return;
        }
        this.parseExtractedText(text);
    },

    parseExtractedText(text) {
        const sections = ChordParser.detectAndParse(text, AppState.currentSong.notation);
        if (sections.length === 0) {
            alert('No se pudieron detectar acordes o letra en el texto. Verifica el formato.');
            return;
        }
        
        AppState.currentSong.sections = sections;
        this.closeModal();
        this.showPreview(sections);
    },

    showPreview(sections) {
        const modal = this.createModal({
            title: 'Vista previa - Revisa antes de guardar',
            content: `
                <p class="mb-4">Revisa la conversión automática. Los pares se pueden editar después:</p>
                <div class="preview-container">
                    ${sections.map(section => `
                        <div class="preview-section">
                            <div class="preview-section-title">${section.label}</div>
                            ${section.pairs.map(pair => `
                                <div class="preview-pair">
                                    ${pair.acordes ? `<div class="preview-chords">${pair.acordes}</div>` : ''}
                                    ${pair.letra ? `<div class="preview-lyrics">${pair.letra}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            `,
            actions: [
                { text: 'Volver atrás', action: () => { this.closeModal(); this.showCreationOptions(); } },
                { text: 'Crear canción', primary: true, action: () => this.saveFromPreview() }
            ]
        });
    },

    saveFromPreview() {
        // Guardar la canción
        if (AppState.editingSongId) {
            // Actualizando canción existente
            const index = AppState.songs.findIndex(s => s.id === AppState.editingSongId);
            if (index !== -1) {
                AppState.currentSong.updatedAt = new Date().toISOString();
                AppState.songs[index] = AppState.currentSong;
            }
        } else {
            // Nueva canción
            AppState.songs.push(AppState.currentSong);
        }
        
        Storage.saveSongs();
        this.closeModal();
        
        // Ir a la vista de edición para refinamiento
        Editor.loadSong(AppState.currentSong);
    },

    saveCurrentSong() {
        if (!AppState.currentSong) return;
        
        // Actualizar título desde el editor
        const titleInput = document.getElementById('song-title-editor');
        if (titleInput && titleInput.value.trim()) {
            AppState.currentSong.title = titleInput.value.trim();
        }
        
        if (AppState.editingSongId) {
            // Actualizando canción existente
            const index = AppState.songs.findIndex(s => s.id === AppState.editingSongId);
            if (index !== -1) {
                AppState.currentSong.updatedAt = new Date().toISOString();
                AppState.songs[index] = AppState.currentSong;
            }
        } else {
            // Nueva canción
            AppState.songs.push(AppState.currentSong);
        }
        
        Storage.saveSongs();
        Storage.updateSaveStatus('saved');
    },

    loadConfigurationView() {
        // Cargar valores actuales en la configuración
        document.getElementById('default-notation').value = AppState.settings.notation;
        document.getElementById('editor-font-size').value = AppState.settings.fontSize;
    },

    createModal({ title, content, actions = [] }) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'modal-overlay';
        
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="btn-xs" onclick="Router.closeModal()">✕</button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${actions.map((action, index) => 
                        `<button class="btn ${action.primary ? 'btn-primary' : ''}" onclick="Router.executeModalAction(${index})">${action.text}</button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        // Guardar acciones en el overlay para poder ejecutarlas
        overlay._actions = actions;
        
        document.body.appendChild(overlay);
        
        // Cerrar al hacer clic en el overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal();
            }
        });
        
        return overlay;
    },

    executeModalAction(index) {
        const overlay = document.getElementById('modal-overlay');
        if (overlay && overlay._actions && overlay._actions[index]) {
            overlay._actions[index].action();
        }
    },

    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.remove();
        }
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Editor de canciones
const Editor = {
    currentTranspose: 0,

    loadSong(song) {
        AppState.currentSong = song;
        document.getElementById('song-title-editor').value = song.title;
        this.render();
        this.renderOutline();
        Storage.updateSaveStatus('saved');
    },

    render() {
        const content = document.getElementById('editor-content');
        if (!AppState.currentSong || !AppState.currentSong.sections) {
            content.innerHTML = '<div class="empty-state"><h3>No hay contenido</h3><p>Usa los métodos de creación para añadir contenido a tu canción.</p></div>';
            return;
        }
        
        content.innerHTML = AppState.currentSong.sections.map((section, sIndex) => `
            <div class="section-editor" data-section="${sIndex}">
                <div class="section-header-editor">
                    <input type="text" class="section-label-input" value="${section.label}" 
                           onchange="Editor.updateSectionLabel(${sIndex}, this.value)">
                    <div class="section-actions">
                        <button class="btn-xs" onclick="Editor.addPairToSection(${sIndex})">+ Par</button>
                        <button class="btn-xs" onclick="Editor.moveSection(${sIndex}, -1)">↑</button>
                        <button class="btn-xs" onclick="Editor.moveSection(${sIndex}, 1)">↓</button>
                        <button class="btn-xs" onclick="Editor.deleteSection(${sIndex})">🗑️</button>
                    </div>
                </div>
                ${section.pairs ? section.pairs.map((pair, pIndex) => this.renderPair(pair, sIndex, pIndex)).join('') : ''}
            </div>
        `).join('');
        
        this.setupTextareaAutoResize();
    },

    renderPair(pair, sIndex, pIndex) {
        return `
            <div class="pair-editor" data-section="${sIndex}" data-pair="${pIndex}">
                <div class="pair-header">
                    <span class="pair-label">Acordes/Letra ${pIndex + 1}</span>
                    <div class="pair-actions">
                        <button class="btn-xs" onclick="Editor.duplicatePair(${sIndex}, ${pIndex})">📋</button>
                        <button class="btn-xs" onclick="Editor.movePair(${sIndex}, ${pIndex}, -1)">↑</button>
                        <button class="btn-xs" onclick="Editor.movePair(${sIndex}, ${pIndex}, 1)">↓</button>
                        <button class="btn-xs" onclick="Editor.deletePair(${sIndex}, ${pIndex})">🗑️</button>
                    </div>
                </div>
                <textarea class="chord-input" placeholder="Acordes..." 
                          onchange="Editor.updatePair(${sIndex}, ${pIndex}, 'acordes', this.value)"
                          style="font-size: ${AppState.settings.fontSize}px;">${pair.acordes || ''}</textarea>
                <textarea class="lyric-input" placeholder="Letra..." 
                          onchange="Editor.updatePair(${sIndex}, ${pIndex}, 'letra', this.value)"
                          style="font-size: ${AppState.settings.fontSize}px;">${pair.letra || ''}</textarea>
            </div>
        `;
    },

    renderOutline() {
        const outline = document.getElementById('sections-outline');
        if (!AppState.currentSong || !AppState.currentSong.sections) {
            outline.innerHTML = '<div class="text-center">Sin secciones</div>';
            return;
        }
        
        outline.innerHTML = AppState.currentSong.sections.map((section, index) => `
            <div class="outline-item" onclick="Editor.scrollToSection(${index})">
                <span>${section.label}</span>
                <span style="font-size: 0.8rem; opacity: 0.7;">${section.pairs ? section.pairs.length : 0}</span>
            </div>
        `).join('');
    },

    setupTextareaAutoResize() {
        document.querySelectorAll('.chord-input, .lyric-input').forEach(textarea => {
            textarea.addEventListener('input', () => {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            });
            
            // Ajustar altura inicial
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        });
    },

    updateSectionLabel(sIndex, value) {
        if (!AppState.currentSong.sections[sIndex]) return;
        AppState.currentSong.sections[sIndex].label = value;
        this.renderOutline();
        Storage.updateSaveStatus('unsaved');
    },

    updatePair(sIndex, pIndex, field, value) {
        if (!AppState.currentSong.sections[sIndex] || !AppState.currentSong.sections[sIndex].pairs[pIndex]) return;
        AppState.currentSong.sections[sIndex].pairs[pIndex][field] = value;
        Storage.updateSaveStatus('unsaved');
    },

    addSection() {
        const sectionName = prompt('Nombre de la nueva sección:', 'Nueva sección');
        if (!sectionName) return;
        
        if (!AppState.currentSong.sections) {
            AppState.currentSong.sections = [];
        }
        
        AppState.currentSong.sections.push({
            label: sectionName,
            pairs: []
        });
        
        this.render();
        this.renderOutline();
        Storage.updateSaveStatus('unsaved');
    },

    addPair() {
        if (!AppState.currentSong.sections || AppState.currentSong.sections.length === 0) {
            this.addSection();
        }
        
        const lastSectionIndex = AppState.currentSong.sections.length - 1;
        this.addPairToSection(lastSectionIndex);
    },

    addPairToSection(sIndex) {
        if (!AppState.currentSong.sections[sIndex]) return;
        
        if (!AppState.currentSong.sections[sIndex].pairs) {
            AppState.currentSong.sections[sIndex].pairs = [];
        }
        
        AppState.currentSong.sections[sIndex].pairs.push({
            acordes: '',
            letra: ''
        });
        
        this.render();
        this.renderOutline();
        Storage.updateSaveStatus('unsaved');
    },

    duplicatePair(sIndex, pIndex) {
        const pair = AppState.currentSong.sections[sIndex].pairs[pIndex];
        if (!pair) return;
        
        AppState.currentSong.sections[sIndex].pairs.splice(pIndex + 1, 0, {
            acordes: pair.acordes,
            letra: pair.letra
        });
        
        this.render();
        Storage.updateSaveStatus('unsaved');
    },

    movePair(sIndex, pIndex, direction) {
        const section = AppState.currentSong.sections[sIndex];
        if (!section || !section.pairs) return;
        
        const newIndex = pIndex + direction;
        if (newIndex < 0 || newIndex >= section.pairs.length) return;
        
        const pair = section.pairs.splice(pIndex, 1)[0];
        section.pairs.splice(newIndex, 0, pair);
        
        this.render();
        Storage.updateSaveStatus('unsaved');
    },

    deletePair(sIndex, pIndex) {
        if (confirm('¿Eliminar este par?')) {
            AppState.currentSong.sections[sIndex].pairs.splice(pIndex, 1);
            this.render();
            Storage.updateSaveStatus('unsaved');
        }
    },

    moveSection(sIndex, direction) {
        const newIndex = sIndex + direction;
        if (newIndex < 0 || newIndex >= AppState.currentSong.sections.length) return;
        
        const section = AppState.currentSong.sections.splice(sIndex, 1)[0];
        AppState.currentSong.sections.splice(newIndex, 0, section);
        
        this.render();
        this.renderOutline();
        Storage.updateSaveStatus('unsaved');
    },

    deleteSection(sIndex) {
        if (confirm('¿Eliminar esta sección y todos sus pares?')) {
            AppState.currentSong.sections.splice(sIndex, 1);
            this.render();
            this.renderOutline();
            Storage.updateSaveStatus('unsaved');
        }
    },

    scrollToSection(sIndex) {
        const section = document.querySelector(`[data-section="${sIndex}"]`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    transpose(semitones) {
        this.currentTranspose += semitones;
        
        if (!AppState.currentSong.sections) return;
        
        AppState.currentSong.sections.forEach(section => {
            if (section.pairs) {
                section.pairs.forEach(pair => {
                    if (pair.acordes && pair.acordes.trim()) {
                        pair.acordes = Transposer.transpose(pair.acordes, semitones, AppState.currentSong.notation);
                    }
                });
            }
        });
        
        this.render();
        Storage.updateSaveStatus('unsaved');
    },

    resetTranspose() {
        if (this.currentTranspose === 0) return;
        
        this.transpose(-this.currentTranspose);
        this.currentTranspose = 0;
    },

    exportJSON() {
        if (!AppState.currentSong) return;
        
        const dataStr = JSON.stringify(AppState.currentSong, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${AppState.currentSong.title}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const songData = JSON.parse(e.target.result);
                    AppState.currentSong = songData;
                    document.getElementById('song-title-editor').value = songData.title || '';
                    this.render();
                    this.renderOutline();
                    Storage.updateSaveStatus('unsaved');
                } catch (error) {
                    alert('Error al leer el archivo JSON: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
};

// Configuración
const Config = {
    exportData() {
        const data = {
            songs: AppState.songs,
            settings: AppState.settings,
            exportDate: new Date().toISOString(),
            version: 'v3'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `betania-music-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.songs && Array.isArray(data.songs)) {
                        const confirmMsg = `Esto importará ${data.songs.length} canción(es). ¿Continuar?`;
                        if (confirm(confirmMsg)) {
                            AppState.songs = [...AppState.songs, ...data.songs];
                            if (data.settings) {
                                AppState.settings = { ...AppState.settings, ...data.settings };
                            }
                            Storage.saveSongs();
                            Storage.saveSettings();
                            alert('Datos importados exitosamente');
                            Router.renderSongsList();
                        }
                    } else {
                        alert('Archivo de respaldo inválido');
                    }
                } catch (error) {
                    alert('Error al leer el archivo: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    clearData() {
        const confirmMsg = '⚠️ ADVERTENCIA: Esto eliminará TODAS las canciones y configuración.\n\n¿Estás absolutamente seguro?';
        if (confirm(confirmMsg)) {
            const doubleConfirm = prompt('Para confirmar, escribe "ELIMINAR TODO":');
            if (doubleConfirm === 'ELIMINAR TODO') {
                localStorage.removeItem(Storage.SONGS_KEY);
                localStorage.removeItem(Storage.SETTINGS_KEY);
                alert('Todos los datos han sido eliminados');
                window.location.reload();
            }
        }
    }
};

// Inicialización de PDF.js
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos guardados
    Storage.loadSongs();
    Storage.loadSettings();
    
    // Agregar canción de ejemplo si no hay canciones
    if (AppState.songs.length === 0) {
        const exampleSong = {
            id: 'example-quien-podra',
            title: 'QUIEN PODRÁ',
            artist: 'Ejemplo',
            notation: 'anglo',
            keyBase: 'Em',
            sections: [
                {
                    label: 'Coro',
                    pairs: [
                        {
                            acordes: '                Em              D',
                            letra: '//Ningún principado, ni las potestades'
                        },
                        {
                            acordes: '        C                       Am',
                            letra: 'Ni armas forjadas. ¿Quién podrá? ¿Quién podrá?'
                        },
                        {
                            acordes: '                Em              D',
                            letra: 'No han prevalecido, ha caído el enemigo'
                        },
                        {
                            acordes: '            C               Am',
                            letra: 'Al infierno has vencido. ¿Quién podrá? ¿Quién podrá?'
                        }
                    ]
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        AppState.songs.push(exampleSong);
        Storage.saveSongs();
    }
    
    // Inicializar router
    Router.init();
    
    // Configurar atajos de teclado globales
    document.addEventListener('keydown', (e) => {
        if (!AppState.settings.shortcuts) return;
        
        const isCtrlCmd = e.ctrlKey || e.metaKey;
        
        if (isCtrlCmd && e.key === 's') {
            e.preventDefault();
            if (AppState.currentView === 'edicion') {
                Router.saveCurrentSong();
            }
        } else if (e.key === 'Escape') {
            if (AppState.currentView === 'edicion') {
                Router.saveCurrentSong();
                Router.navigate('canciones');
            }
        }
    });
});
