// Estado global de la aplicación
const AppState = {
    currentView: 'canciones',
    currentSong: null,
    editingSongId: null,
    songs: [],
    currentTranspose: 0,
    isSaving: false,
    lastSaveTime: 0,
    settings: {
        fontSize: 14,
        autoSections: true
    },
    isCreatingNew: false // Nueva bandera para distinguir edición de creación
};

// Utilidades para localStorage
const Storage = {
    SONGS_KEY: 'betania_songs_v4',
    SETTINGS_KEY: 'betania_settings_v4',

    saveSongs() {
        try {
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

// Parser de acordes para notación anglosajona
const ChordParser = {
    chordRegex: /\b([A-G])([#b])?(maj7|maj9|m7|m9|m|dim|aug|add\d+|sus2|sus4|7|9|11|13|°|ø)?(?:\/([A-G])([#b])?)?\b/g,
    sectionHeaderRegex: /^\s*(intro|estrofa|verso|pre[\s\-]?coro|coro|puente|bridge|interludio|solo|outro|final|tag)\s*(?:[:\-]|\b)?\s*(\d+|i{1,3}|[ivx]{1,4}|[1-9]ª|x\d+|\(.*?\))?\s*$/i,

    normalizeTildes(text) {
        const tildeMap = {
            'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
            'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'
        };
        return text.replace(/[áéíóúÁÉÍÓÚ]/g, char => tildeMap[char] || char);
    },

    isChordLine(line) {
        if (!line.trim()) return false;
        
        const matches = [...line.matchAll(this.chordRegex)];
        
        if (matches.length === 0) return false;
        
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

    detectAndParse(text, useAutoSections = true) {
        const lines = text.split('\n');
        const sections = [];
        let currentSection = { label: useAutoSections ? 'Intro' : 'Sin sección', pairs: [] };
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            if (useAutoSections && this.isSectionHeader(trimmed)) {
                if (currentSection.pairs.length > 0) {
                    sections.push(currentSection);
                }
                
                const normalizedName = this.normalizeSectionName(trimmed);
                
                currentSection = {
                    label: normalizedName,
                    pairs: []
                };
                continue;
            }
            
            if (!trimmed) continue;
            
            if (this.isChordLine(line)) {
                const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
                const nextTrimmed = nextLine.trim();
                
                if (!nextTrimmed || this.isChordLine(nextLine)) {
                    currentSection.pairs.push({
                        acordes: line,
                        letra: ''
                    });
                } else {
                    currentSection.pairs.push({
                        acordes: line,
                        letra: nextLine
                    });
                    i++;
                }
            } else {
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
    }
};

// Transpositor de acordes corregido
const Transposer = {
    notes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    notesFlat: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],

    transpose(chord, semitones) {
        if (!chord || semitones === 0) return chord;
        
        return chord.replace(ChordParser.chordRegex, (match, root, accidental, suffix, bassRoot, bassAccidental) => {
            const newRoot = this.transposeNote(root, accidental, semitones);
            let newBass = '';
            if (bassRoot) {
                const transposedBass = this.transposeNote(bassRoot, bassAccidental, semitones);
                newBass = '/' + transposedBass;
            }
            
            return newRoot + (suffix || '') + newBass;
        });
    },

    transposeNote(root, accidental, semitones) {
        const fullNote = root + (accidental || '');
        
        let noteIndex = this.notes.indexOf(fullNote);
        if (noteIndex === -1) {
            noteIndex = this.notesFlat.indexOf(fullNote);
        }
        if (noteIndex === -1) {
            noteIndex = this.notes.indexOf(root);
        }
        
        if (noteIndex === -1) return fullNote;
        
        let newNoteIndex = (noteIndex + semitones) % 12;
        if (newNoteIndex < 0) newNoteIndex += 12;
        
        return this.chooseBestEnharmonic(newNoteIndex, semitones);
    },

    chooseBestEnharmonic(noteIndex, semitones) {
        const sharpNote = this.notes[noteIndex];
        const flatNote = this.notesFlat[noteIndex];
        
        if (!sharpNote.includes('#') && !sharpNote.includes('b')) {
            return sharpNote;
        }
        
        if (semitones < 0) {
            if (sharpNote === 'F#' || sharpNote === 'C#') {
                return sharpNote;
            }
            return flatNote;
        }
        
        return sharpNote;
    },

    cleanChord(chord) {
        const cleanupMap = {
            'C##': 'D', 'D##': 'E', 'E##': 'F#', 'F##': 'G',
            'G##': 'A', 'A##': 'B', 'B##': 'C#',
            'Cbb': 'Bb', 'Dbb': 'C', 'Ebb': 'D', 'Fbb': 'Eb',
            'Gbb': 'F', 'Abb': 'G', 'Bbb': 'A'
        };
        
        let cleanedChord = chord;
        for (const [double, single] of Object.entries(cleanupMap)) {
            cleanedChord = cleanedChord.replace(new RegExp(double, 'g'), single);
        }
        
        return cleanedChord;
    }
};

// Router principal
const Router = {
    debounceTimers: new Map(),

    init() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.navigate(tab.dataset.route);
            });
        });

        this.setupMainButtons();
        this.navigate('canciones');
    },

    navigate(view) {
        AppState.currentView = view;
        
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.route === view) {
                tab.classList.add('active');
            }
        });
        
        document.querySelectorAll('.view').forEach(viewEl => {
            viewEl.classList.remove('active');
        });
        
        const targetView = document.getElementById(`view-${view}`);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        switch (view) {
            case 'canciones':
                this.renderSongsList();
                break;
            case 'edicion':
                // Solo mostrar diálogo inicial si es una canción nueva
                if (AppState.isCreatingNew) {
                    this.showInitialDialog();
                } else {
                    // Si no es nueva, ya se cargó la canción en editSong()
                    // No hacer nada aquí, Editor.loadSong() ya se llamó
                }
                break;
        }
    },

    setupMainButtons() {
        this.bindButton('btn-add-song', () => {
            AppState.isCreatingNew = true;
            this.navigate('edicion');
        });
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

        this.bindButton('btn-transpose-up-reader', () => this.transposeSong(1));
        this.bindButton('btn-transpose-down-reader', () => this.transposeSong(-1));
        this.bindButton('btn-reset-key-reader', () => this.resetTransposition());

        this.bindButton('btn-save-song', () => this.saveCurrentSong());
        this.bindButton('btn-add-section', () => Editor.addSection());
        this.bindButton('btn-add-pair-editor', () => Editor.addPair());
        this.bindButton('btn-reanalyze', () => Editor.reanalyzeContent());

        this.bindButton('btn-transpose-up', () => Editor.transpose(1));
        this.bindButton('btn-transpose-down', () => Editor.transpose(-1));
        this.bindButton('btn-reset-transpose', () => Editor.resetTranspose());

        this.bindInput('search-box', (e) => this.filterSongs(e.target.value));
    },

    bindButton(id, handler) {
        const element = document.getElementById(id);
        if (element && !element.hasAttribute('data-bound')) {
            element.addEventListener('click', handler);
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

    renderSongsList() {
        const grid = document.getElementById('songs-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (AppState.songs.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            grid.style.display = 'block';
            
            // Cambiar a formato de lista con iconos discretos
            grid.innerHTML = AppState.songs.map(song => `
                <div class="song-item" onclick="Router.viewSong('${song.id}')">
                    <div class="song-info">
                        <div class="song-title">${song.title}</div>
                        <div class="song-meta">${song.artist ? `${song.artist} • ` : ''}${song.keyBase}</div>
                    </div>
                    <div class="song-actions" onclick="event.stopPropagation()">
                        <button class="action-btn edit-btn" onclick="Router.editSong('${song.id}')" title="Editar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="action-btn delete-btn" onclick="Router.deleteSong('${song.id}')" title="Eliminar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    },

    saveCurrentSong() {
        if (AppState.isSaving) return;
        
        const now = Date.now();
        if (now - AppState.lastSaveTime < 800) return;

        if (!AppState.currentSong) return;

        AppState.isSaving = true;
        AppState.lastSaveTime = now;

        const saveBtn = document.getElementById('btn-save-song');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Guardando...';
        }

        try {
            const titleInput = document.getElementById('song-title-editor');
            if (titleInput && titleInput.value.trim()) {
                AppState.currentSong.title = titleInput.value.trim();
            }

            if (AppState.editingSongId) {
                const index = AppState.songs.findIndex(s => s.id === AppState.editingSongId);
                if (index !== -1) {
                    AppState.currentSong.updatedAt = new Date().toISOString();
                    AppState.songs[index] = AppState.currentSong;
                }
            } else {
                const exists = AppState.songs.find(s => s.id === AppState.currentSong.id);
                if (!exists) {
                    AppState.songs.push(AppState.currentSong);
                }
            }

            Storage.saveSongs();
            Storage.updateSaveStatus('saved');
            
        } finally {
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
        const items = document.querySelectorAll('.song-item');
        const lowerQuery = query.toLowerCase();
        
        items.forEach(item => {
            const title = item.querySelector('.song-title').textContent.toLowerCase();
            const meta = item.querySelector('.song-meta').textContent.toLowerCase();
            
            if (title.includes(lowerQuery) || meta.includes(lowerQuery)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    },

    viewSong(songId) {
        const song = AppState.songs.find(s => s.id === songId);
        if (!song) return;
        
        AppState.currentSong = song;
        AppState.currentTranspose = 0;
        
        document.getElementById('reader-title').textContent = song.title;
        document.getElementById('reader-meta').textContent = `${song.artist || 'Sin autor'} • ${song.keyBase}`;
        document.getElementById('current-key-reader').textContent = song.keyBase;
        
        this.renderSongContent();
        this.navigate('song-reader');
    },

    editSong(songId) {
        const song = AppState.songs.find(s => s.id === songId);
        if (!song) return;
        
        AppState.editingSongId = songId;
        AppState.currentSong = JSON.parse(JSON.stringify(song));
        AppState.isCreatingNew = false; // Marcar que NO es una canción nueva
        
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
        
        const baseKey = AppState.currentSong.keyBase;
        let currentKey = Transposer.transpose(baseKey, AppState.currentTranspose);
        currentKey = Transposer.cleanChord(currentKey);
        document.getElementById('current-key-reader').textContent = currentKey;
        
        const chordLines = document.querySelectorAll('.chord-line');
        chordLines.forEach(line => {
            const originalText = line.textContent;
            let transposedText = Transposer.transpose(originalText, semitones);
            transposedText = Transposer.cleanChord(transposedText);
            line.textContent = transposedText;
        });
    },

    resetTransposition() {
        if (AppState.currentTranspose === 0) return;
        
        this.transposeSong(-AppState.currentTranspose);
        AppState.currentTranspose = 0;
    },

    showInitialDialog() {
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
                <div class="form-group">
                    <label class="form-label">Tonalidad Base</label>
                    <select class="form-select" id="modal-key">
                        <option value="C">C</option>
                        <option value="C#">C#</option>
                        <option value="D">D</option>
                        <option value="D#">D#</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                        <option value="F#">F#</option>
                        <option value="G">G</option>
                        <option value="G#">G#</option>
                        <option value="A">A</option>
                        <option value="A#">A#</option>
                        <option value="B">B</option>
                    </select>
                </div>
            `,
            actions: [
                { text: 'Cancelar', action: () => { this.closeModal(); this.navigate('canciones'); } },
                { text: 'Continuar', primary: true, action: () => this.proceedToCreation(newSongId) }
            ]
        });
    },

    proceedToCreation(songId) {
        const title = document.getElementById('modal-title').value.trim();
        if (!title) {
            alert('El título es obligatorio');
            return;
        }
        
        const songData = {
            id: songId,
            title: title,
            artist: document.getElementById('modal-artist').value.trim(),
            keyBase: document.getElementById('modal-key').value,
            autoSections: AppState.settings.autoSections,
            sections: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        AppState.currentSong = songData;
        AppState.editingSongId = null;
        
        this.closeModal();
        this.showTextInput();
    },

    showTextInput() {
        const modal = this.createModal({
            title: 'Pegar texto de la canción',
            content: `
                <div class="form-group">
                    <textarea class="form-textarea" id="song-text-input" placeholder="Pega aquí el texto completo de tu canción con acordes y letra...

Ejemplo:
ESTROFA
C G Am F
Estoy preparando el camino
Am    F         C
Enderezando las veredas

CORO:
C    G               Am
Es Él por el que estoy gastando mi vida
     F               G
Perdiendo todo por amor y con alegría"></textarea>
                </div>
            `,
            actions: [
                { text: 'Cancelar', action: () => { this.closeModal(); this.navigate('canciones'); } },
                { text: 'Convertir a pares', primary: true, action: () => this.parseTextInput() }
            ]
        });
    },

    parseTextInput() {
        const text = document.getElementById('song-text-input').value;
        if (!text.trim()) {
            alert('Por favor, ingresa el texto de la canción.');
            return;
        }
        
        const useAutoSections = AppState.currentSong.autoSections;
        const sections = ChordParser.detectAndParse(text, useAutoSections);
        
        if (sections.length === 0) {
            alert('No se pudieron detectar acordes o letra en el texto. Verifica el formato.');
            return;
        }
        
        AppState.currentSong.sections = sections;
        this.closeModal();
        Editor.loadSong(AppState.currentSong);
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
        
        overlay._actions = actions;
        document.body.appendChild(overlay);
        
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

// Editor
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
        const keyStatus = document.getElementById('key-status');
        if (keyStatus) {
            keyStatus.textContent = AppState.currentSong.keyBase;
        }
    },

    render() {
        const content = document.getElementById('editor-content');
        if (!AppState.currentSong || !AppState.currentSong.sections || AppState.currentSong.sections.length === 0) {
            content.innerHTML = '<div class="empty-state"><h3>No hay contenido</h3><p>Usa el método de creación para añadir contenido a tu canción.</p></div>';
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

        let allContent = '';
        AppState.currentSong.sections.forEach(section => {
            allContent += section.label + '\n';
            section.pairs.forEach(pair => {
                if (pair.acordes) allContent += pair.acordes + '\n';
                if (pair.letra) allContent += pair.letra + '\n';
            });
            allContent += '\n';
        });

        const newSections = ChordParser.detectAndParse(allContent, true);
        
        if (newSections.length === 0) {
            alert('No se pudieron detectar secciones en el contenido actual.');
            return;
        }

        AppState.currentSong.sections = newSections;
        AppState.currentSong.updatedAt = new Date().toISOString();
        
        this.render();
        this.renderOutline();
        Storage.updateSaveStatus('unsaved');
    },

    setupTextareaAutoResize() {
        document.querySelectorAll('.chord-input, .lyric-input').forEach(textarea => {
            textarea.addEventListener('input', () => {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            });
            
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
                        let transposed = Transposer.transpose(pair.acordes, semitones);
                        pair.acordes = Transposer.cleanChord(transposed);
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
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    Storage.loadSongs();
    Storage.loadSettings();
    
    // Añadir canción de ejemplo si no hay canciones
    if (AppState.songs.length === 0) {
        const exampleSong = {
            id: 'example-quien-podra',
            title: 'QUIEN PODRÁ',
            artist: 'Ejemplo',
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
        };
        
        AppState.songs = [exampleSong];
        Storage.saveSongs();
    }
    
    Router.init();
    
    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
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
