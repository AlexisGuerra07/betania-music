// Estado global de la aplicación
const AppState = {
    currentView: 'canciones',
    currentSong: null,
    editingSongId: null,
    songs: [],
    currentTranspose: 0,
    isSaving: false,
    lastSaveTime: 0,
    settings: { fontSize: 14, autoSections: true },
    isCreatingNew: false,
    pendingImports: []
};

// Storage
const Storage = {
    SONGS_KEY: 'betania_songs_v4',
    SETTINGS_KEY: 'betania_settings_v4',

    saveSongs() {
        try {
            const deduplicated = this.deduplicateSongs(AppState.songs);
            localStorage.setItem(this.SONGS_KEY, JSON.stringify(deduplicated));
            AppState.songs = deduplicated;
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
            if (data) AppState.songs = JSON.parse(data);
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
            if (data) AppState.settings = { ...AppState.settings, ...JSON.parse(data) };
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
        const map = new Map();
        songs.forEach(song => { if (song.id) map.set(song.id, song); });
        return Array.from(map.values());
    }
};

// Parser de acordes
const ChordParser = {
    chordRegex: /\b([A-G])([#b])?(maj7|maj9|m7|m9|m|dim|aug|add\d+|sus2|sus4|7|9|11|13|°|ø)?(?:\/([A-G])([#b])?)?\b/g,
    sectionHeaderRegex: /^\s*(intro|estrofa|verso|pre[\s\-]?coro|coro|puente|bridge|interludio|solo|outro|final|tag|estribillo|modulaci[oó]n|leyenda)\s*(?:[:\-]|\b)?\s*(\d+|i{1,3}|[ivx]{1,4}|[1-9]ª|x\d+|\(.*?\))?\s*$/i,

    normalizeTildes(text) {
        const map = { 'á':'a','é':'e','í':'i','ó':'o','ú':'u','Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U' };
        return text.replace(/[áéíóúÁÉÍÓÚ]/g, c => map[c] || c);
    },

    isChordLine(line) {
        if (!line.trim()) return false;
        const matches = [...line.matchAll(this.chordRegex)];
        if (matches.length === 0) return false;
        const chordChars = matches.reduce((acc, m) => acc + m[0].length, 0);
        const totalChars = line.replace(/\s/g, '').length;
        return totalChars > 0 && (chordChars / totalChars) >= 0.30;
    },

    isSectionHeader(line) {
        return this.sectionHeaderRegex.test(this.normalizeTildes(line.trim()));
    },

    normalizeSectionName(line) {
        const normalized = this.normalizeTildes(line.replace(/[\[\]:]/g, '').trim());
        const match = normalized.match(this.sectionHeaderRegex);
        if (!match) return line;
        const [, sectionType, number] = match;
        const translations = {
            'intro':'Intro','estrofa':'Estrofa','verso':'Estrofa','verse':'Estrofa',
            'pre coro':'Pre-Coro','precoro':'Pre-Coro','pre-coro':'Pre-Coro',
            'coro':'Coro','chorus':'Coro','estribillo':'Estribillo','puente':'Puente','bridge':'Puente',
            'interludio':'Interludio','solo':'Solo','outro':'Outro','final':'Final','tag':'Tag',
            'modulacion':'Modulación','leyenda':'Leyenda'
        };
        const normalizedType = sectionType.toLowerCase().replace(/[\s\-]/g, ' ');
        let baseName = translations[normalizedType] || sectionType;
        if (number) {
            let suffix = '';
            if (/^\d+$/.test(number)) suffix = ` ${number}`;
            else if (/^i{1,3}$/i.test(number)) {
                const r = { 'i':'1','ii':'2','iii':'3' };
                suffix = ` ${r[number.toLowerCase()] || number}`;
            } else if (/^\d+ª$/.test(number)) suffix = ` ${number.charAt(0)}`;
            else if (/^x\d+$/.test(number)) suffix = ` ${number.substring(1)}`;
            else suffix = ` ${number.replace(/[()]/g, '')}`;
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
                if (currentSection.pairs.length > 0) sections.push(currentSection);
                currentSection = { label: this.normalizeSectionName(trimmed), pairs: [] };
                continue;
            }

            if (!trimmed) continue;

            if (this.isChordLine(line)) {
                const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
                const nextTrimmed = nextLine.trim();
                if (!nextTrimmed || this.isChordLine(nextLine)) {
                    currentSection.pairs.push({ acordes: line, letra: '' });
                } else {
                    currentSection.pairs.push({ acordes: line, letra: nextLine });
                    i++;
                }
            } else {
                if (currentSection.pairs.length > 0 && !currentSection.pairs[currentSection.pairs.length - 1].letra.trim()) {
                    currentSection.pairs[currentSection.pairs.length - 1].letra = line;
                } else {
                    currentSection.pairs.push({ acordes: '', letra: line });
                }
            }
        }

        if (currentSection.pairs.length > 0) sections.push(currentSection);
        return sections;
    }
};

// Transpositor
const Transposer = {
    notes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    notesFlat: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],

    transpose(chord, semitones) {
        if (!chord || semitones === 0) return chord;
        return chord.replace(ChordParser.chordRegex, (match, root, accidental, suffix, bassRoot, bassAccidental) => {
            const newRoot = this.transposeNote(root, accidental, semitones);
            let newBass = '';
            if (bassRoot) newBass = '/' + this.transposeNote(bassRoot, bassAccidental, semitones);
            return newRoot + (suffix || '') + newBass;
        });
    },

    transposeNote(root, accidental, semitones) {
        const fullNote = root + (accidental || '');
        let idx = this.notes.indexOf(fullNote);
        if (idx === -1) idx = this.notesFlat.indexOf(fullNote);
        if (idx === -1) idx = this.notes.indexOf(root);
        if (idx === -1) return fullNote;
        let newIdx = (idx + semitones) % 12;
        if (newIdx < 0) newIdx += 12;
        return this.chooseBestEnharmonic(newIdx, semitones);
    },

    chooseBestEnharmonic(idx, semitones) {
        const sharp = this.notes[idx];
        const flat = this.notesFlat[idx];
        if (!sharp.includes('#') && !sharp.includes('b')) return sharp;
        if (semitones < 0) {
            if (sharp === 'F#' || sharp === 'C#') return sharp;
            return flat;
        }
        return sharp;
    },

    cleanChord(chord) {
        const map = {
            'C##':'D','D##':'E','E##':'F#','F##':'G','G##':'A','A##':'B','B##':'C#',
            'Cbb':'Bb','Dbb':'C','Ebb':'D','Fbb':'Eb','Gbb':'F','Abb':'G','Bbb':'A'
        };
        let result = chord;
        for (const [d, s] of Object.entries(map)) {
            result = result.replace(new RegExp(d, 'g'), s);
        }
        return result;
    }
};

// Detector automático de tonalidad a partir de los acordes usados
const KeyDetector = {
    majorQualities: ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'],
    majorOffsets: [0, 2, 4, 5, 7, 9, 11],
    minorQualities: ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'],
    minorOffsets: [0, 2, 3, 5, 7, 8, 10],

    simplifyQuality(suffix) {
        if (!suffix) return 'maj';
        if (/^(dim|°|ø)/.test(suffix)) return 'dim';
        if (/^m(?!aj)/.test(suffix)) return 'min';
        return 'maj';
    },

    extractChords(sections) {
        const freq = {};
        let firstChord = null;
        let lastChord = null;

        sections.forEach(section => {
            (section.pairs || []).forEach(pair => {
                if (!pair.acordes) return;
                const matches = [...pair.acordes.matchAll(ChordParser.chordRegex)];
                matches.forEach(m => {
                    const root = m[1];
                    const accidental = m[2] || '';
                    const suffix = m[3] || '';
                    const fullNote = root + accidental;
                    let idx = Transposer.notes.indexOf(fullNote);
                    if (idx === -1) idx = Transposer.notesFlat.indexOf(fullNote);
                    if (idx === -1) idx = Transposer.notes.indexOf(root);
                    if (idx === -1) return;
                    const quality = this.simplifyQuality(suffix);
                    const key = idx + '-' + quality;
                    freq[key] = (freq[key] || 0) + 1;
                    if (!firstChord) firstChord = { idx, quality };
                    lastChord = { idx, quality };
                });
            });
        });

        return { freq, firstChord, lastChord };
    },

    detectKey(sections) {
        const { freq, firstChord, lastChord } = this.extractChords(sections);
        const chordEntries = Object.entries(freq).map(([k, count]) => {
            const [idx, quality] = k.split('-');
            return { idx: parseInt(idx), quality, count };
        });

        if (chordEntries.length === 0) return null;

        let bestKey = null;
        let bestScore = -1;

        for (let root = 0; root < 12; root++) {
            // Evaluar como tonalidad Mayor
            let scoreMajor = 0;
            chordEntries.forEach(c => {
                const offset = (c.idx - root + 12) % 12;
                const pos = this.majorOffsets.indexOf(offset);
                if (pos !== -1 && this.majorQualities[pos] === c.quality) {
                    scoreMajor += c.count;
                }
            });
            let bonusMajor = 0;
            if (firstChord && firstChord.idx === root && firstChord.quality === 'maj') bonusMajor += 2;
            if (lastChord && lastChord.idx === root && lastChord.quality === 'maj') bonusMajor += 3;
            const totalMajor = scoreMajor + bonusMajor;

            if (totalMajor > bestScore) {
                bestScore = totalMajor;
                bestKey = Transposer.notes[root];
            }

            // Evaluar como tonalidad menor
            let scoreMinor = 0;
            chordEntries.forEach(c => {
                const offset = (c.idx - root + 12) % 12;
                const pos = this.minorOffsets.indexOf(offset);
                if (pos !== -1) {
                    const expected = this.minorQualities[pos];
                    if (expected === c.quality) {
                        scoreMinor += c.count;
                    } else if (pos === 4 && (c.quality === 'maj' || c.quality === 'min')) {
                        // Grado V: aceptar mayor (dominante) o menor (natural)
                        scoreMinor += c.count;
                    }
                }
            });
            let bonusMinor = 0;
            if (firstChord && firstChord.idx === root && firstChord.quality === 'min') bonusMinor += 2;
            if (lastChord && lastChord.idx === root && lastChord.quality === 'min') bonusMinor += 3;
            const totalMinor = scoreMinor + bonusMinor;

            if (totalMinor > bestScore) {
                bestScore = totalMinor;
                bestKey = Transposer.notes[root] + 'm';
            }
        }

        return bestKey;
    }
};

// Router
const Router = {
    init() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => this.navigate(tab.dataset.route));
        });
        this.setupMainButtons();
        this.navigate('canciones');
    },

    navigate(view) {
        AppState.currentView = view;
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.route === view);
        });
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const target = document.getElementById(`view-${view}`);
        if (target) target.classList.add('active');

        if (view === 'canciones') this.renderSongsList();
        if (view === 'edicion' && AppState.isCreatingNew) this.showInitialDialog();
    },

    setupMainButtons() {
        this.bindButton('logo-home', () => {
            if (AppState.currentView === 'edicion' && AppState.currentSong) this.saveCurrentSong();
            this.navigate('canciones');
        });
        this.bindButton('btn-add-song', () => {
            AppState.isCreatingNew = true;
            this.navigate('edicion');
        });
        this.bindButton('btn-import-pdfs', () => this.showBulkPDFImport());
        this.bindButton('btn-back-to-list', () => this.navigate('canciones'));
        this.bindButton('btn-back-from-editor', () => {
            this.saveCurrentSong();
            this.navigate('canciones');
        });
        this.bindButton('btn-edit-song', () => {
            if (AppState.currentSong) this.editSong(AppState.currentSong.id);
        });
        this.bindButton('btn-transpose-up-reader', () => this.transposeSong(1));
        this.bindButton('btn-transpose-down-reader', () => this.transposeSong(-1));
        this.bindButton('btn-reset-key-reader', () => this.resetTransposition());
        this.bindButton('btn-save-song', () => this.saveCurrentSong());
        this.bindButton('btn-add-section', () => Editor.addSection());
        this.bindButton('btn-add-pair-editor', () => Editor.addPair());
        this.bindButton('btn-transpose-up', () => Editor.transpose(1));
        this.bindButton('btn-transpose-down', () => Editor.transpose(-1));
        this.bindButton('btn-reset-transpose', () => Editor.resetTranspose());
        this.bindButton('btn-detect-key', () => Editor.detectKey());
        this.bindInput('search-box', (e) => this.filterSongs(e.target.value));
        this.bindSelect('key-editor-select', (e) => {
            if (!AppState.currentSong) return;
            AppState.currentSong.keyBase = e.target.value;
            Storage.updateSaveStatus('unsaved');
        });
    },

    bindButton(id, handler) {
        const el = document.getElementById(id);
        if (el && !el.hasAttribute('data-bound')) {
            el.addEventListener('click', handler);
            el.setAttribute('data-bound', 'true');
        }
    },

    bindInput(id, handler) {
        const el = document.getElementById(id);
        if (el && !el.hasAttribute('data-bound')) {
            el.addEventListener('input', handler);
            el.setAttribute('data-bound', 'true');
        }
    },

    bindSelect(id, handler) {
        const el = document.getElementById(id);
        if (el && !el.hasAttribute('data-bound')) {
            el.addEventListener('change', handler);
            el.setAttribute('data-bound', 'true');
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
        if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Guardando...'; }

        try {
            const titleInput = document.getElementById('song-title-editor');
            if (titleInput && titleInput.value.trim()) AppState.currentSong.title = titleInput.value.trim();

            if (AppState.editingSongId) {
                const index = AppState.songs.findIndex(s => s.id === AppState.editingSongId);
                if (index !== -1) {
                    AppState.currentSong.updatedAt = new Date().toISOString();
                    AppState.songs[index] = AppState.currentSong;
                }
            } else {
                const exists = AppState.songs.find(s => s.id === AppState.currentSong.id);
                if (!exists) AppState.songs.push(AppState.currentSong);
            }
            Storage.saveSongs();
            Storage.updateSaveStatus('saved');
        } finally {
            setTimeout(() => {
                AppState.isSaving = false;
                if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Guardar'; }
            }, 800);
        }
    },

    filterSongs(query) {
        const items = document.querySelectorAll('.song-item');
        const q = query.toLowerCase();
        items.forEach(item => {
            const title = item.querySelector('.song-title').textContent.toLowerCase();
            const meta = item.querySelector('.song-meta').textContent.toLowerCase();
            item.style.display = (title.includes(q) || meta.includes(q)) ? 'flex' : 'none';
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
        AppState.isCreatingNew = false;
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
        let currentKey = Transposer.cleanChord(Transposer.transpose(baseKey, AppState.currentTranspose));
        document.getElementById('current-key-reader').textContent = currentKey;

        document.querySelectorAll('.chord-line').forEach(line => {
            let t = Transposer.transpose(line.textContent, semitones);
            line.textContent = Transposer.cleanChord(t);
        });
    },

    resetTransposition() {
        if (AppState.currentTranspose === 0) return;
        this.transposeSong(-AppState.currentTranspose);
        AppState.currentTranspose = 0;
    },

    showInitialDialog() {
        const newSongId = this.generateId();
        this.createModal({
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
                    <label class="form-label">Tonalidad Base (se puede detectar automáticamente después)</label>
                    <select class="form-select" id="modal-key">
                        <option value="C">C</option><option value="C#">C#</option><option value="D">D</option>
                        <option value="D#">D#</option><option value="E">E</option><option value="F">F</option>
                        <option value="F#">F#</option><option value="G">G</option><option value="G#">G#</option>
                        <option value="A">A</option><option value="A#">A#</option><option value="B">B</option>
                    </select>
                </div>
            `,
            actions: [
                { text: 'Cancelar', action: () => { this.closeModal(); AppState.isCreatingNew = false; this.navigate('canciones'); } },
                { text: 'Continuar', primary: true, action: () => this.proceedToCreation(newSongId) }
            ]
        });
    },

    proceedToCreation(songId) {
        const title = document.getElementById('modal-title').value.trim();
        if (!title) { alert('El título es obligatorio'); return; }
        const songData = {
            id: songId, title, artist: document.getElementById('modal-artist').value.trim(),
            keyBase: document.getElementById('modal-key').value, autoSections: AppState.settings.autoSections,
            sections: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
        AppState.currentSong = songData;
        AppState.editingSongId = null;
        this.closeModal();
        this.showTextInput();
    },

    showTextInput() {
        this.createModal({
            title: 'Pegar texto de la canción',
            content: `<div class="form-group"><textarea class="form-textarea" id="song-text-input" placeholder="Pega aquí el texto completo de tu canción con acordes y letra..."></textarea></div>`,
            actions: [
                { text: 'Cancelar', action: () => { this.closeModal(); AppState.isCreatingNew = false; this.navigate('canciones'); } },
                { text: 'Convertir a pares', primary: true, action: () => this.parseTextInput() }
            ]
        });
    },

    parseTextInput() {
        const text = document.getElementById('song-text-input').value;
        if (!text.trim()) { alert('Por favor, ingresa el texto de la canción.'); return; }
        const sections = ChordParser.detectAndParse(text, AppState.currentSong.autoSections);
        if (sections.length === 0) { alert('No se pudieron detectar acordes o letra en el texto.'); return; }
        AppState.currentSong.sections = sections;

        // Detección automática de tonalidad a partir de los acordes
        const detectedKey = KeyDetector.detectKey(sections);
        if (detectedKey) AppState.currentSong.keyBase = detectedKey;

        AppState.isCreatingNew = false;
        this.closeModal();
        Editor.loadSong(AppState.currentSong);
    },

    // ============ IMPORTACIÓN MASIVA DE PDFs ============
    showBulkPDFImport() {
        this.createModal({
            title: '📄 Importar PDFs en lote',
            content: `
                <p style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                    Selecciona varios PDFs a la vez (en tono original, no en grados). La tonalidad se detecta automáticamente a partir de los acordes. Podrás editar cada una después.
                </p>
                <div class="form-group">
                    <input type="file" class="form-input" id="pdf-bulk-input" accept=".pdf" multiple>
                </div>
                <div id="pdf-bulk-status" style="font-size: 0.9rem; color: var(--text-secondary);"></div>
            `,
            actions: [
                { text: 'Cancelar', action: () => this.closeModal() }
            ]
        });

        document.getElementById('pdf-bulk-input').addEventListener('change', (e) => {
            this.handleBulkPDFFiles(Array.from(e.target.files));
        });
    },

    async handleBulkPDFFiles(files) {
        if (!files.length) return;
        const statusEl = document.getElementById('pdf-bulk-status');
        AppState.pendingImports = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (statusEl) statusEl.innerHTML = `🔄 Procesando ${i + 1} de ${files.length}: ${file.name}...`;

            try {
                let text = await this.extractPDFText(file);

                // Intentar leer "KEY:" explícito del PDF (más confiable si existe)
                let explicitKey = null;
                const keyMatch = text.match(/KEY:\s*([A-G][#b]?m?)/i);
                if (keyMatch) {
                    explicitKey = keyMatch[1].charAt(0).toUpperCase() + keyMatch[1].slice(1);
                }

                // Limpiar líneas de metadatos
                const lines = text.split('\n');
                const cleanedLines = lines.filter(line => {
                    const t = line.trim();
                    if (!t) return true;
                    if (/TEMPO:|TIME:\s*\d/i.test(t)) return false;
                    if (/^KEY:/i.test(t)) return false;
                    if (/^([A-Z0-9]{1,3}\s+){2,}[A-Z0-9]{1,3}$/.test(t) && !ChordParser.isChordLine(t)) return false;
                    return true;
                });
                text = cleanedLines.join('\n');

                const sections = ChordParser.detectAndParse(text, true);

                // Detección automática por acordes (fallback o verificación)
                const autoDetectedKey = KeyDetector.detectKey(sections);
                const finalKey = explicitKey || autoDetectedKey || 'C';

                const title = file.name.replace(/\.pdf$/i, '').trim();

                AppState.pendingImports.push({
                    id: this.generateId(),
                    title: title || 'Sin título',
                    artist: '',
                    keyBase: finalKey,
                    autoSections: true,
                    sections: sections.length > 0 ? sections : [{ label: 'Sin sección', pairs: [{ acordes: '', letra: '(No se detectaron acordes, revisa manualmente)' }] }],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            } catch (error) {
                console.error(`Error procesando ${file.name}:`, error);
            }
        }

        this.showBulkImportPreview();
    },

    extractPDFText(file) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof pdfjsLib === 'undefined') {
                    reject(new Error('pdf.js no está cargado'));
                    return;
                }
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += this.reconstructPageText(textContent) + '\n';
                }
                resolve(fullText);
            } catch (error) {
                reject(error);
            }
        });
    },

    reconstructPageText(textContent) {
        const items = textContent.items;
        if (!items.length) return '';

        const lineGroups = [];
        const tolerance = 2;

        items.forEach(item => {
            const y = item.transform[5];
            const x = item.transform[4];
            let group = lineGroups.find(g => Math.abs(g.y - y) <= tolerance);
            if (!group) {
                group = { y: y, items: [] };
                lineGroups.push(group);
            }
            group.items.push({ x, str: item.str, width: item.width || 0 });
        });

        lineGroups.sort((a, b) => b.y - a.y);

        const lines = lineGroups.map(group => {
            group.items.sort((a, b) => a.x - b.x);
            let lineText = '';
            let lastEndX = null;
            group.items.forEach(it => {
                if (lastEndX !== null) {
                    const gap = it.x - lastEndX;
                    const spaces = Math.max(1, Math.round(gap / 5));
                    lineText += ' '.repeat(Math.min(spaces, 20));
                }
                lineText += it.str;
                lastEndX = it.x + it.width;
            });
            return lineText;
        });

        return lines.join('\n');
    },

    showBulkImportPreview() {
        this.closeModal();
        const imports = AppState.pendingImports;

        if (imports.length === 0) {
            alert('No se pudo procesar ningún PDF.');
            return;
        }

        this.createModal({
            title: `Revisar ${imports.length} canción(es) importada(s)`,
            content: `
                <p style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                    Desmarca las que no quieras guardar. Podrás editar título, tonalidad y contenido después.
                </p>
                <div id="import-preview-list">
                    ${imports.map((song, idx) => `
                        <div class="import-preview-item">
                            <input type="checkbox" checked data-idx="${idx}" class="import-checkbox">
                            <div class="import-preview-info">
                                <div class="import-preview-title">${song.title}</div>
                                <div class="import-preview-meta">Tonalidad detectada: ${song.keyBase} • ${song.sections.length} sección(es)</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `,
            actions: [
                { text: 'Cancelar todo', action: () => { AppState.pendingImports = []; this.closeModal(); } },
                { text: 'Guardar seleccionadas', primary: true, action: () => this.saveBulkImports() }
            ]
        });
    },

    saveBulkImports() {
        const checkboxes = document.querySelectorAll('.import-checkbox');
        let savedCount = 0;

        checkboxes.forEach(cb => {
            if (cb.checked) {
                const idx = parseInt(cb.dataset.idx);
                const song = AppState.pendingImports[idx];
                AppState.songs.push(song);
                savedCount++;
            }
        });

        Storage.saveSongs();
        AppState.pendingImports = [];
        this.closeModal();
        this.renderSongsList();
        alert(`✅ Se guardaron ${savedCount} canción(es).`);
    },
    // ============ FIN IMPORTACIÓN MASIVA ============

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
                <div class="modal-content">${content}</div>
                <div class="modal-footer">
                    ${actions.map((a, i) => `<button class="btn ${a.primary ? 'btn-primary' : ''}" onclick="Router.executeModalAction(${i})">${a.text}</button>`).join('')}
                </div>
            </div>
        `;
        overlay._actions = actions;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.closeModal(); });
        return overlay;
    },

    executeModalAction(index) {
        const overlay = document.getElementById('modal-overlay');
        if (overlay && overlay._actions && overlay._actions[index]) overlay._actions[index].action();
    },

    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.remove();
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
        const keySelect = document.getElementById('key-editor-select');
        if (keySelect) keySelect.value = AppState.currentSong.keyBase;
    },

    detectKey() {
        if (!AppState.currentSong || !AppState.currentSong.sections) return;
        const detected = KeyDetector.detectKey(AppState.currentSong.sections);
        if (!detected) {
            alert('No se pudieron detectar suficientes acordes para calcular la tonalidad.');
            return;
        }
        AppState.currentSong.keyBase = detected;
        this.updateChips();
        Storage.updateSaveStatus('unsaved');
        alert(`Tonalidad detectada: ${detected}`);
    },

    render() {
        const content = document.getElementById('editor-content');
        if (!AppState.currentSong || !AppState.currentSong.sections || AppState.currentSong.sections.length === 0) {
            content.innerHTML = '<div class="empty-state"><h3>No hay contenido</h3><p>Usa "+ Sección" para empezar a añadir contenido.</p></div>';
            return;
        }
        content.innerHTML = AppState.currentSong.sections.map((section, sIndex) => `
            <div class="section-editor" data-section="${sIndex}">
                <div class="section-header-editor">
                    <input type="text" class="section-label-input" value="${section.label}" onchange="Editor.updateSectionLabel(${sIndex}, this.value)">
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
            <div class="pair-editor">
                <div class="pair-header">
                    <span class="pair-label">Acordes/Letra ${pIndex + 1}</span>
                    <div class="pair-actions">
                        <button class="btn-xs" onclick="Editor.duplicatePair(${sIndex}, ${pIndex})">📋</button>
                        <button class="btn-xs" onclick="Editor.movePair(${sIndex}, ${pIndex}, -1)">↑</button>
                        <button class="btn-xs" onclick="Editor.movePair(${sIndex}, ${pIndex}, 1)">↓</button>
                        <button class="btn-xs" onclick="Editor.deletePair(${sIndex}, ${pIndex})">🗑️</button>
                    </div>
                </div>
                <textarea class="chord-input" placeholder="Acordes..." onchange="Editor.updatePair(${sIndex}, ${pIndex}, 'acordes', this.value)" style="font-size: ${AppState.settings.fontSize}px;">${pair.acordes || ''}</textarea>
                <textarea class="lyric-input" placeholder="Letra..." onchange="Editor.updatePair(${sIndex}, ${pIndex}, 'letra', this.value)" style="font-size: ${AppState.settings.fontSize}px;">${pair.letra || ''}</textarea>
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
        document.querySelectorAll('.chord-input, .lyric-input').forEach(t => {
            t.addEventListener('input', () => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; });
            t.style.height = 'auto';
            t.style.height = t.scrollHeight + 'px';
        });
    },

    updateSectionLabel(sIndex, value) {
        AppState.currentSong.sections[sIndex].label = value;
        this.renderOutline();
        Storage.updateSaveStatus('unsaved');
    },

    updatePair(sIndex, pIndex, field, value) {
        AppState.currentSong.sections[sIndex].pairs[pIndex][field] = value;
        Storage.updateSaveStatus('unsaved');
    },

    addSection() {
        const name = prompt('Nombre de la nueva sección:', 'Nueva sección');
        if (!name) return;
        if (!AppState.currentSong.sections) AppState.currentSong.sections = [];
        AppState.currentSong.sections.push({ label: name, pairs: [] });
        this.render(); this.renderOutline();
        Storage.updateSaveStatus('unsaved');
    },

    addPair() {
        if (!AppState.currentSong.sections || AppState.currentSong.sections.length === 0) this.addSection();
        this.addPairToSection(AppState.currentSong.sections.length - 1);
    },

    addPairToSection(sIndex) {
        if (!AppState.currentSong.sections[sIndex]) return;
        if (!AppState.currentSong.sections[sIndex].pairs) AppState.currentSong.sections[sIndex].pairs = [];
        AppState.currentSong.sections[sIndex].pairs.push({ acordes: '', letra: '' });
        this.render(); this.renderOutline();
        Storage.updateSaveStatus('unsaved');
    },

    duplicatePair(sIndex, pIndex) {
        const pair = AppState.currentSong.sections[sIndex].pairs[pIndex];
        if (!pair) return;
        AppState.currentSong.sections[sIndex].pairs.splice(pIndex + 1, 0, { acordes: pair.acordes, letra: pair.letra });
        this.render();
        Storage.updateSaveStatus('unsaved');
    },

    movePair(sIndex, pIndex, direction) {
        const section = AppState.currentSong.sections[sIndex];
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
        this.render(); this.renderOutline();
        Storage.updateSaveStatus('unsaved');
    },

    deleteSection(sIndex) {
        if (confirm('¿Eliminar esta sección y todos sus pares?')) {
            AppState.currentSong.sections.splice(sIndex, 1);
            this.render(); this.renderOutline();
            Storage.updateSaveStatus('unsaved');
        }
    },

    scrollToSection(sIndex) {
        const el = document.querySelector(`[data-section="${sIndex}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    transpose(semitones) {
        this.currentTranspose += semitones;
        if (!AppState.currentSong.sections) return;
        AppState.currentSong.sections.forEach(section => {
            if (section.pairs) {
                section.pairs.forEach(pair => {
                    if (pair.acordes && pair.acordes.trim()) {
                        pair.acordes = Transposer.cleanChord(Transposer.transpose(pair.acordes, semitones));
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

    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    Router.init();

    document.addEventListener('keydown', (e) => {
        const isCtrlCmd = e.ctrlKey || e.metaKey;
        if (isCtrlCmd && e.key === 's') {
            e.preventDefault();
            if (AppState.currentView === 'edicion') Router.saveCurrentSong();
        } else if (e.key === 'Escape') {
            if (AppState.currentView === 'edicion') {
                Router.saveCurrentSong();
                Router.navigate('canciones');
            }
        }
    });
});
