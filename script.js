// Estado global de la aplicación mejorado
const AppState = {
    currentView: 'canciones',
    currentSong: null,
    editingSongId: null,
    songs: [],
    currentTranspose: 0,
    isSaving: false,
    lastSaveTime: 0,
    settings: {
        notation: 'latin',
        fontSize: 14,
        shortcuts: true,
        autoSections: true // Nueva configuración
    }
};

// Utilidades para localStorage con migración a v4
const Storage = {
    SONGS_KEY: 'betania_songs_v4',
    SETTINGS_KEY: 'betania_settings_v4',
    OLD_SONGS_KEY: 'betania_songs_v3',

    saveSongs() {
        try {
            // Deduplicar por ID antes de guardar
            const deduplicatedSongs = this.deduplicateSongs(AppState.songs);
            localStorage.setItem(this.SONGS_KEY, JSON.stringify(deduplicatedSongs));
            AppState.songs = deduplicatedSongs;
            this.updateSaveStatus('saved');
            return true;
        } catch (error) {
            console.error('Error saving songs:', error);
            return false;
        }
    },

    loadSongs() {
        try {
            // Intentar cargar v4 primero
            let data = localStorage.getItem(this.SONGS_KEY);
            
            if (!data) {
                // Migrar desde v3 si existe
                data = localStorage.getItem(this.OLD_SONGS_KEY);
                if (data) {
                    const oldSongs = JSON.parse(data);
                    // Migrar estructura
                    AppState.songs = oldSongs.map(song => ({
                        ...song,
                        autoSections: true // Valor por defecto para canciones migradas
                    }));
                    this.saveSongs(); // Guardar en v4
                    console.log('Migrated songs from v3 to v4');
                }
            } else {
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
    },

    deduplicateSongs(songs) {
        const songMap = new Map();
        songs.forEach(song => {
            if (song.id) {
                songMap.set(song.id, song);
            }
        });
        return Array.from(songMap.values());
    }
};

// Parser de acordes mejorado con detección robusta de secciones
const ChordParser = {
    chordRegexes: {
        latin: /\b(Do|Re|Mi|Fa|Sol|La|Si)([#b])?(maj7|maj9|m7|m9|m|dim|aug|add\d+|sus2|sus4|7|9|11|13|°|ø)?(?:\/(Do|Re|Mi|Fa|Sol|La|Si)([#b])?)?\b/g,
        anglo: /\b([A-G])([#b])?(maj7|maj9|m7|m9|m|dim|aug|add\d+|sus2|sus4|7|9|11|13|°|ø)?(?:\/([A-G])([#b])?)?\b/g
    },

    // Regex mejorada para detección de secciones
    sectionHeaderRegex: /^\s*(intro|estrofa|verso|pre[\s\-]?coro|coro|puente|bridge|interludio|solo|outro|final|tag)\s*(?:[:\-]|\b)?\s*(\d+|i{1,3}|[ivx]{1,4}|[1-9]ª|x\d+|\(.*?\))?\s*$/i,

    normalizeTildes(text) {
        const tildeMap = {
            'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
            'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'
        };
        return text.replace(/[áéíóúÁÉÍÓÚ]/g, char => tildeMap[char] || char);
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

    isSectionHeader(line) {
        const normalized = this.normalizeTildes(line.trim());
        return this.sectionHeaderRegex.test(normalized);
    },

    normalizeSectionName(line) {
        const normalized = this.normalizeTildes(line.replace(/[\[\]:]/g, '').trim());
        const match = normalized.match(this.sectionHeaderRegex);
        
        if (!match) return line;
        
        const [, sectionType, number] = match;
        
        const translations = {
            'intro': 'Intro',
            'estrofa': 'Estrofa',
            'verso': 'Estrofa',
            'verse': 'Estrofa',
            'pre coro': 'Pre-Coro',
            'precoro': 'Pre-Coro',
            'pre-coro': 'Pre-Coro',
            'coro': 'Coro',
            'chorus': 'Coro',
            'puente': 'Puente',
            'bridge': 'Puente',
            'interludio': 'Interludio',
            'solo': 'Solo',
            'outro': 'Outro',
            'final': 'Final',
            'tag': 'Tag'
        };
        
        const normalizedType = sectionType.toLowerCase().replace(/[\s\-]/g, ' ');
        let baseName = translations[normalizedType] || sectionType;
        
        if (number) {
            // Normalizar numeración
            let suffix = '';
            if (/^\d+$/.test(number)) {
                suffix = ` ${number}`;
            } else if (/^i{1,3}$/i.test(number)) {
                const romanToArabic = { 'i': '1', 'ii': '2', 'iii': '3' };
                suffix = ` ${romanToArabic[number.toLowerCase()] || number}`;
            } else if (/^\d+ª$/.test(number)) {
                suffix = ` ${number.charAt(0)}`;
            } else if (/^x\d+$/.test(number)) {
                suffix = ` ${number.substring(1)}`;
            } else {
                suffix = ` ${number.replace(/[()]/g, '')}`;
            }
            baseName += suffix;
        }
        
        return baseName;
    },

    detectAndParse(text, notation = 'latin', useAutoSections = true) {
        const lines = text.split('\n');
        const sections = [];
        let currentSection = { label: useAutoSections ? 'Intro' : 'Sin sección', pairs: [] };
        
        console.log(`Parsing with autoSections: ${useAutoSections}`);
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // Detectar encabezados de sección solo si autoSections está activado
            if (useAutoSections && this.isSectionHeader(trimmed)) {
                if (currentSection.pairs.length > 0) {
                    sections.push(currentSection);
                }
                
                const normalizedName = this.normalizeSectionName(trimmed);
                console.log(`Detected section: "${trimmed}" → "${normalizedName}"`);
                
                currentSection = {
                    label: normalizedName,
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
        
        console.log(`Parsed ${sections.length} sections:`, sections.map(s => `${s.label} (${s.pairs.length} pairs)`));
        
        return sections;
    }
};

// Transpositor de acordes
const Transposer = {
    notes: {
        latin: ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'],
        anglo: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
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

// Router mejorado con protección contra duplicados
const Router = {
    debounceTimers: new Map(),

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

    debounce(func, delay, key) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }
        
        const timer = setTimeout(() => {
            func();
            this.debounceTimers.delete(key);
        }, delay);
        
        this.debounceTimers.set(key, timer);
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
        // Botón añadir canción (una sola vez)
        const btnAddSong = document.getElementById('btn-add-song');
        if (btnAddSong && !btnAddSong.hasAttribute('data-bound')) {
            btnAddSong.addEventListener('click', () => {
                this.navigate('edicion');
            });
            btnAddSong.setAttribute('data-bound', 'true');
        }

        // Resto de botones con protección similar
        this.bindButton('btn-back-to-list', () => this.navigate('canciones'));
        this.bindButton('btn-back-from-editor', () => {
            this.saveCurrentSong();
            this.navigate('canciones');
        });
        this.bindButton('btn-edit-song', () => {
            if (AppState.currentSong) {
                this.editSong(AppState.currentSong.id);
            }
        });

        // Botones de transposición en reader
        this.bindButton('btn-transpose-up-reader', () => this.transposeSong(1));
        this.bindButton('btn-transpose-down-reader', () => this.transposeSong(-1));
        this.bindButton('btn-reset-key-reader', () => this.resetTransposition());

        // Selector de notación en reader
        this.bindSelect('notation-reader', (e) => {
            AppState.settings.notation = e.target.value;
            Storage.saveSettings();
            if (AppState.currentSong) {
                this.renderSongContent();
            }
        });

        // Botones del editor con protección anti-duplicados
        this.bindButton('btn-save-song', () => this.saveCurrentSong());
        this.bindButton('btn-add-section', () => Editor.addSection());
        this.bindButton('btn-add-pair-editor', () => Editor.addPair());
        this.bindButton('btn-reanalyze', () => Editor.reanalyzeContent());

        // Botones de transposición en editor
        this.bindButton('btn-transpose-up', () => Editor.transpose(1));
        this.bindButton('btn-transpose-down', () => Editor.transpose(-1));
        this.bindButton('btn-reset-transpose', () => Editor.resetTranspose());

        // Botones de exportación/importación
        this.bindButton('btn-export-json', () => Editor.exportJSON());
        this.bindButton('btn-import-json', () => Editor.importJSON());

        // Búsqueda de canciones
        this.bindInput('search-box', (e) => this.filterSongs(e.target.value));

        // Configuración
        this.bindSelect('default-notation', (e) => {
            AppState.settings.notation = e.target.value;
            Storage.saveSettings();
        });

        this.bindSelect('editor-font-size', (e) => {
            AppState.settings.fontSize = parseInt(e.target.value);
            Storage.saveSettings();
        });

        // Toggle de auto-secciones
        this.bindButton('auto-sections-toggle', () => this.toggleAutoSections());

        // Botones de gestión de datos
        this.bindButton('btn-export-data', () => Config.exportData());
        this.bindButton('btn-import-data', () => Config.importData());
        this.bindButton('btn-clear-data', () => Config.clearData());
    },

    bindButton(id, handler) {
        const element = document.getElementById(id);
        if (element && !element.hasAttribute('data-bound')) {
            element.addEventListener('click', handler);
            element.setAttribute('data-bound', 'true');
        }
    },

    bindSelect(id, handler) {
        const element = document.getElementById(id);
        if (element && !element.hasAttribute('data-bound')) {
            element.addEventListener('change', handler);
            element.setAttribute('data-bound', 'true');
        }
    },

    bindInput(id, handler) {
        const element = document.getElementById(id);
        if (element && !element.hasAttribute('data-bound')) {
            element.addEventListener('input', handler);
            element.setAttribute('data-bound', 'true');
        }
    },

    toggleAutoSections() {
        AppState.settings.autoSections = !AppState.settings.autoSections;
        Storage.saveSettings();
        this.updateAutoSectionsUI();
    },

    updateAutoSectionsUI() {
        const toggle = document.getElementById('auto-sections-toggle');
        const label = document.getElementById('auto-sections-label');
        const chip = document.getElementById('auto-sections-chip');
        const status = document.getElementById('auto-sections-status');
        const reanalyzeBtn = document.getElementById('btn-reanalyze');

        if (toggle) {
            toggle.classList.toggle('active', AppState.settings.autoSections);
        }
        if (label) {
            label.textContent = AppState.settings.autoSections ? 'ON' : 'OFF';
        }
        if (chip) {
            chip.className = `chip ${AppState.settings.autoSections ? 'active' : 'inactive'}`;
        }
        if (status) {
            status.textContent = AppState.settings.autoSections ? 'ON' : 'OFF';
        }
        if (reanalyzeBtn) {
            reanalyzeBtn.style.display = AppState.settings.autoSections ? 'inline-flex' : 'none';
        }
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

    saveCurrentSong() {
        // Protección anti-duplicados
        if (AppState.isSaving) {
            console.log('Save already in progress, skipping...');
            return;
        }
        
        const now = Date.now();
        if (now - AppState.lastSaveTime < 800) {
            console.log('Save too soon after last save, skipping...');
            return;
        }

        if (!AppState.currentSong) return;

        AppState.isSaving = true;
        AppState.lastSaveTime = now;

        // Deshabilitar botón de guardar
        const saveBtn = document.getElementById('btn-save-song');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Guardando...';
        }

        try {
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
                // Nueva canción - solo añadir si no existe ya
                const exists = AppState.songs.find(s => s.id === AppState.currentSong.id);
                if (!exists) {
                    AppState.songs.push(AppState.currentSong);
                }
            }

            Storage.saveSongs();
            Storage.updateSaveStatus('saved');
            
        } finally {
            // Rehabilitar botón después de un delay
            setTimeout(() => {
                AppState.isSaving = false;
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Guardar';
                }
            }, 800);
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
        // Crear ID único para nueva canción
        const newSongId = this.generateId();
        
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
                    action: () => this.proceedToCreation(newSongId) 
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

    proceedToCreation(songId) {
        const title = document.getElementById('modal-title').value.trim();
        if (!title) {
            alert('El título es obligatorio');
            return;
        }
        
        const songData = {
            id: songId, // Usar el ID generado previamente
            title: title,
            artist: document.getElementById('modal-artist').value.trim(),
            notation: document.getElementById('modal-notation').value,
            keyBase: document.getElementById('modal-key').value,
            autoSections: AppState.settings.autoSections, // Usar configuración actual
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
                <div style="margin-bottom: 1.5rem;">
                    <div class="toggle-container">
                        <span class="toggle-label">Detector automático de secciones</span>
                        <div class="toggle-switch ${AppState.settings.autoSections ? 'active' : ''}" id="creation-auto-sections-toggle"></div>
                        <span class="toggle-label">${AppState.settings.autoSections ? 'ON' : 'OFF'}</span>
                    </div>
                    <small style="color: var(--gray-500);">
                        Detecta automáticamente estrofas, coros y otras secciones en el texto pegado.
                    </small>
                </div>
                
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

        // Configurar toggle dentro del modal
        const toggle = document.getElementById('creation-auto-sections-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                AppState.settings.autoSections = !AppState.settings.autoSections;
                AppState.currentSong.autoSections = AppState.settings.autoSections;
                Storage.saveSettings();
                
                toggle.classList.toggle('active', AppState.settings.autoSections);
                const label = toggle.nextElementSibling;
                if (label) {
                    label.textContent = AppState.settings.autoSections ? 'ON' : 'OFF';
                }
            });
        }
    },

    showTextInput() {
        this.closeModal();
        const modal = this.createModal({
            title: 'Pegar texto de la canción',
            content: `
                <div class="form-group">
                    <div class="toggle-container">
                        <label>Ajuste de línea:</label>
                        <div class="toggle-switch" id="soft-wrap-toggle"></div>
                        <span>ON/OFF</span>
                    </div>
                    <textarea class="form-textarea" id="song-text-input" placeholder="Pega aquí el texto completo de tu canción con acordes y letra...

Ejemplo:
ESTROFA (segunda vuelta)
F G F AmG C
Estoy preparando el camino
Am    F(Bb)      C(Am)
Enderezando las veredas

PRE CORO:
F             Am
Mi placer en Él está
                C    G
Yo no soy digno de desatar sus sandalias

CORO:
F    G                   Am
Es Él por el que estoy gastando mi vida
     C/E              F
Perdiendo todo por amor y con alegría"></textarea>
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
        
        if (toggle && textarea) {
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
        }
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
        const useAutoSections = AppState.currentSong.autoSections;
        const sections = ChordParser.detectAndParse(text, AppState.currentSong.notation, useAutoSections);
        
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
        this.closeModal();
        // Ir a la vista de edición para refinamiento
        Editor.loadSong(AppState.currentSong);
    },

    loadConfigurationView() {
        // Cargar valores actuales en la configuración
        document.getElementById('default-notation').value = AppState.settings.notation;
        document.getElementById('editor-font-size').value = AppState.settings.fontSize;
        this.updateAutoSectionsUI();
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

// Editor mejorado con funcionalidad de reanálisis
const Editor = {
    currentTranspose: 0,

    loadSong(song) {
        AppState.currentSong = song;
        document.getElementById('song-title-editor').value = song.title;
        this.render();
        this.renderOutline();
        this.updateChips();
        Storage.updateSaveStatus('saved');
    },

    updateChips() {
        // Actualizar chips en la toolbar
        const notationStatus = document.getElementById('notation-status');
        const keyStatus = document.getElementById('key-status');
        
        if (notationStatus) {
            notationStatus.textContent = AppState.currentSong.notation === 'latin' ? 'Latina' : 'Anglo';
        }
        
        if (keyStatus) {
            keyStatus.textContent = AppState.currentSong.keyBase;
        }

        // Actualizar estado de auto-secciones
        Router.updateAutoSectionsUI();
    },

    render() {
        const content = document.getElementById('editor-content');
        if (!AppState.currentSong || !AppState.currentSong.sections || AppState.currentSong.sections.length === 0) {
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

    reanalyzeContent() {
        if (!AppState.currentSong || !AppState.settings.autoSections) return;

        // Recopilar todo el contenido actual
        let allContent = '';
        AppState.currentSong.sections.forEach(section => {
            allContent += section.label + '\n';
            section.pairs.forEach(pair => {
                if (pair.acordes) allContent += pair.acordes + '\n';
                if (pair.letra) allContent += pair.letra + '\n';
            });
            allContent += '\n';
        });

        // Re-parsear con auto-secciones
        const newSections = ChordParser.detectAndParse(allContent, AppState.currentSong.notation, true);
        
        if (newSections.length === 0) {
            alert('No se pudieron detectar secciones en el contenido actual.');
            return;
        }

        // Mostrar diff antes de aplicar
        this.showReanalyzeDiff(AppState.currentSong.sections, newSections);
    },

    showReanalyzeDiff(oldSections, newSections) {
        const diffContent = `
            <div class="diff-preview">
                <h4>Cambios detectados:</h4>
                <div class="diff-item diff-added">✓ Se detectaron ${newSections.length} secciones</div>
                <div class="diff-item diff-moved">📝 ${newSections.reduce((acc, s) => acc + s.pairs.length, 0)} pares reorganizados</div>
            </div>
            
            <h4>Nueva estructura:</h4>
            <div class="preview-container" style="max-height: 200px;">
                ${newSections.map(section => `
                    <div><strong>${section.label}</strong> (${section.pairs.length} pares)</div>
                `).join('')}
            </div>
        `;

        const modal = Router.createModal({
            title: 'Reanálisis automático',
            content: diffContent,
            actions: [
                { text: 'Cancelar', action: () => Router.closeModal() },
                { text: 'Aplicar cambios', primary: true, action: () => this.applyReanalysis(newSections) }
            ]
        });
    },

    applyReanalysis(newSections) {
        AppState.currentSong.sections = newSections;
        AppState.currentSong.updatedAt = new Date().toISOString();
        
        this.render();
        this.renderOutline();
        Storage.updateSaveStatus('unsaved');
        
        Router.closeModal();
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
                    this.updateChips();
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

// Configuración mejorada
const Config = {
    exportData() {
        const data = {
            songs: AppState.songs,
            settings: AppState.settings,
            exportDate: new Date().toISOString(),
            version: 'v4'
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
                            // Migrar canciones sin autoSections
                            const migratedSongs = data.songs.map(song => ({
                                ...song,
                                autoSections: song.autoSections !== undefined ? song.autoSections : true
                            }));
                            
                            AppState.songs = [...AppState.songs, ...migratedSongs];
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
                // También limpiar versiones anteriores
                localStorage.removeItem(Storage.OLD_SONGS_KEY);
                localStorage.removeItem('betania_settings_v3');
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

// Inicialización mejorada de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos guardados
    Storage.loadSongs();
    Storage.loadSettings();
    
    // Agregar canción de ejemplo solo si no hay canciones
    if (AppState.songs.length === 0) {
        const exampleSongs = [
            {
                id: 'example-quien-podra',
                title: 'QUIEN PODRÁ',
                artist: 'Ejemplo',
                notation: 'anglo',
                keyBase: 'Em',
                autoSections: true,
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
            },
            {
                id: 'example-es-el',
                title: 'ES ÉL',
                artist: 'TTL',
                notation: 'anglo',
                keyBase: 'C',
                autoSections: true,
                sections: [
                    {
                        label: 'Estrofa 2',
                        pairs: [
                            {
                                acordes: 'F G  F G  Am G  C',
                                letra: 'Estoy preparando el camino'
                            },
                            {
                                acordes: 'Am    F(Bb)      C(Am)',
                                letra: 'Enderezando las veredas'
                            },
                            {
                                acordes: 'C',
                                letra: 'Y cada vez más disminuyendo'
                            },
                            {
                                acordes: 'Am       F(Bb)       C',
                                letra: 'Porque importa que Él crezca'
                            }
                        ]
                    },
                    {
                        label: 'Pre-Coro',
                        pairs: [
                            {
                                acordes: 'F             Am',
                                letra: 'Mi placer en Él está'
                            },
                            {
                                acordes: '                C    G',
                                letra: 'Yo no soy digno de desatar sus sandalias'
                            },
                            {
                                acordes: 'F            Am',
                                letra: 'Mi vida entera en Él está'
                            },
                            {
                                acordes: '                C',
                                letra: 'Y yo camino con la certeza'
                            },
                            {
                                acordes: '           G',
                                letra: 'De que volverá'
                            }
                        ]
                    },
                    {
                        label: 'Coro',
                        pairs: [
                            {
                                acordes: 'F    G                   Am',
                                letra: 'Es Él por el que estoy gastando mi vida'
                            },
                            {
                                acordes: '     C/E              F',
                                letra: 'Perdiendo todo por amor y con alegría'
                            },
                            {
                                acordes: '       G',
                                letra: 'Dueño de mis días'
                            }
                        ]
                    },
                    {
                        label: 'Puente',
                        pairs: [
                            {
                                acordes: '    C',
                                letra: 'Él volverá!'
                            },
                            {
                                acordes: '    Bb',
                                letra: 'Soberano en poder'
                            },
                            {
                                acordes: '       Am7',
                                letra: 'Él volverá!'
                            },
                            {
                                acordes: '       Gm7',
                                letra: 'Y el gobierno en Él está'
                            },
                            {
                                acordes: 'F',
                                letra: 'Vean! Él traerá'
                            },
                            {
                                acordes: '           G',
                                letra: 'En sus manos la recompensa'
                            }
                        ]
                    }
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        AppState.songs = exampleSongs;
        Storage.saveSongs();
        console.log('Added example songs');
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

    console.log('Betania Music v4 initialized');
});
