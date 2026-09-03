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

        (sections || []).forEach(section => {
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

            let scoreMinor = 0;
            chordEntries.forEach(c => {
                const offset = (c.idx - root + 12) % 12;
                const pos = this.minorOffsets.indexOf(offset);
                if (pos !== -1) {
                    const expected = this.minorQualities[pos];
                    if (expected === c.quality) {
                        scoreMinor += c.count;
                    } else if (pos === 4 && (c.quality === 'maj' || c.quality === 'min')) {
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
        this.bindButton('btn-bulk-detect-keys', () => this.bulkDetectKeys());
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

    // Recalcula la tonalidad de TODAS las canciones ya guardadas, en un solo clic
    bulkDetectKeys() {
        if (AppState.songs.length === 0) {
            alert('No hay canciones cargadas todavía.');
            return;
        }
        if (!confirm(`Se recalculará la tonalidad de las ${AppState.songs.length} canciones cargadas según sus acordes. ¿Continuar?`)) return;

        let updatedCount = 0;
        AppState.songs.forEach(song => {
            const detected = KeyDetector.detectKey(song.sections);
            if (detected && detected !== song.keyBase) {
                song.keyBase = detected;
                updatedCount++;
            }
        });

        Storage.saveSongs();
        this.renderSongsList();
        alert(`✅ Listo. Se actualizó la tonalidad de
