// ============ FIREBASE ============
const firebaseConfig = {
  apiKey: "AIzaSyAq6nR416IldHvVbt0E5ECl-8Rb9PCM0S4",
  authDomain: "betania-music.firebaseapp.com",
  projectId: "betania-music",
  storageBucket: "betania-music.firebasestorage.app",
  messagingSenderId: "651916728496",
  appId: "1:651916728496:web:1848e1c6579941c7660375"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const ADMIN_EMAIL = 'alexisg898@gmail.com';

// Estado global de la aplicación
const AppState = {
    currentView: 'canciones',
    currentSong: null,
    editingSongId: null,
    songs: [],
    setlists: [],
    currentSetlist: null,
    cameFromSetlistId: null,
    currentTranspose: 0,
    notationMode: 'chords',
    voiceMode: false,
    isSaving: false,
    lastSaveTime: 0,
    settings: { fontSize: 14, autoSections: true, sortBy: 'alpha' },
    isCreatingNew: false,
    pendingImports: [],
    isAdmin: false,
    currentUser: null
};

// Storage — ahora usa Firestore en vez de localStorage
const Storage = {
    SETTINGS_KEY: 'betania_settings_v4',
    songsUnsub: null,
    setlistsUnsub: null,

    saveSongs() {
        try {
            const deduplicated = this.deduplicateSongs(AppState.songs);
            AppState.songs = deduplicated;
            db.collection('appdata').doc('songs').set({ songs: deduplicated })
                .then(() => this.updateSaveStatus('saved'))
                .catch(err => { console.error('Error guardando canciones:', err); alert('Error al guardar: ' + err.message); });
            return true;
        } catch (error) {
            console.error('Error saving songs:', error);
            return false;
        }
    },

    listenSongs(callback) {
        if (this.songsUnsub) this.songsUnsub();
        this.songsUnsub = db.collection('appdata').doc('songs').onSnapshot(doc => {
            AppState.songs = doc.exists ? (doc.data().songs || []) : [];
            if (callback) callback();
        }, err => console.error('Error escuchando canciones:', err));
    },

    saveSetlists() {
        try {
            db.collection('appdata').doc('setlists').set({ setlists: AppState.setlists })
                .catch(err => { console.error('Error guardando repertorios:', err); alert('Error al guardar: ' + err.message); });
            return true;
        } catch (error) {
            console.error('Error saving setlists:', error);
            return false;
        }
    },

    listenSetlists(callback) {
        if (this.setlistsUnsub) this.setlistsUnsub();
        this.setlistsUnsub = db.collection('appdata').doc('setlists').onSnapshot(doc => {
            AppState.setlists = doc.exists ? (doc.data().setlists || []) : [];
            if (callback) callback();
        }, err => console.error('Error escuchando repertorios:', err));
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
    },

    // Sube canciones/repertorios que quedaron en localStorage de versiones anteriores
    migrateLocalData() {
        const localSongsRaw = localStorage.getItem('betania_songs_v4');
        const localSetlistsRaw = localStorage.getItem('betania_setlists_v1');

        let addedSongs = 0;
        let addedSetlists = 0;

        if (localSongsRaw) {
            const localSongs = JSON.parse(localSongsRaw);
            const existingIds = new Set(AppState.songs.map(s => s.id));
            const newSongs = localSongs.filter(s => !existingIds.has(s.id));
            if (newSongs.length > 0) {
                AppState.songs = [...AppState.songs, ...newSongs];
                addedSongs = newSongs.length;
            }
        }

        if (localSetlistsRaw) {
            const localSetlists = JSON.parse(localSetlistsRaw);
            const existingIds = new Set(AppState.setlists.map(s => s.id));
            const newSetlists = localSetlists.filter(s => !existingIds.has(s.id));
            if (newSetlists.length > 0) {
                AppState.setlists = [...AppState.setlists, ...newSetlists];
                addedSetlists = newSetlists.length;
            }
        }

        if (addedSongs === 0 && addedSetlists === 0) {
            alert('No se encontraron datos locales nuevos para migrar.');
            return;
        }

        if (!confirm(`Se subirán ${addedSongs} canción(es) y ${addedSetlists} repertorio(s) locales a la nube. ¿Continuar?`)) return;

        if (addedSongs > 0) this.saveSongs();
        if (addedSetlists > 0) this.saveSetlists();

        alert(`✅ Migración completa: ${addedSongs} canción(es) y ${addedSetlists} repertorio(s) subidos.`);
    }
};

// ============ AUTENTICACIÓN ============
const Auth = {
    init() {
        firebase.auth().onAuthStateChanged(user => {
            AppState.currentUser = user;
            AppState.isAdmin = !!(user && user.email === ADMIN_EMAIL);
            this.updateUI();
        });
        this.bindButtons();
    },

    bindButtons() {
        const loginBtn = document.getElementById('btn-login');
        if (loginBtn && !loginBtn.hasAttribute('data-bound')) {
            loginBtn.addEventListener('click', () => this.signIn());
            loginBtn.setAttribute('data-bound', 'true');
        }
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn && !logoutBtn.hasAttribute('data-bound')) {
            logoutBtn.addEventListener('click', () => this.signOut());
            logoutBtn.setAttribute('data-bound', 'true');
        }
    },

    signIn() {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).catch(err => {
            console.error(err);
            alert('Error al iniciar sesión: ' + err.message);
        });
    },

    signOut() {
        firebase.auth().signOut();
    },

    updateUI() {
        const loginBtn = document.getElementById('btn-login');
        const logoutBtn = document.getElementById('btn-logout');
        const userLabel = document.getElementById('user-email-label');

        if (AppState.isAdmin) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-flex';
            if (userLabel) { userLabel.style.display = 'inline'; userLabel.textContent = AppState.currentUser.email; }
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-flex';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userLabel) userLabel.style.display = 'none';
        }

        const showIfAdmin = (id, displayValue) => {
            const el = document.getElementById(id);
            if (el) el.style.display = AppState.isAdmin ? displayValue : 'none';
        };

        showIfAdmin('nav-tab-edicion', 'inline-block');
        showIfAdmin('btn-add-song', 'inline-flex');
        showIfAdmin('btn-import-pdfs', 'inline-flex');
        showIfAdmin('btn-bulk-detect-keys', 'inline-flex');
        showIfAdmin('btn-migrate-local', 'inline-flex');
        showIfAdmin('btn-edit-song', 'inline-flex');
        showIfAdmin('btn-new-setlist', 'inline-flex');
        showIfAdmin('btn-add-songs-to-setlist', 'inline-flex');

        const setlistNameInput = document.getElementById('setlist-name-input');
        if (setlistNameInput) setlistNameInput.readOnly = !AppState.isAdmin;

        if (AppState.currentView === 'canciones') Router.renderSongsList();
        if (AppState.currentView === 'repertorio') Router.renderSetlistsList();
        if (AppState.currentView === 'repertorio-detail') Router.renderSetlistDetail();

        if (!AppState.isAdmin && AppState.currentView === 'edicion') {
            Router.navigate('canciones');
        }
    }
};

// Parser de acordes
const ChordParser = {
    chordRegex: /\b([A-G])([#b])?(maj7|maj9|m7|m9|m|dim|aug|add\d+|sus2|sus4|7|9|11|13|°|ø)?(?:\/([A-G])([#b])?)?\b/g,
    sectionHeaderRegex: /^\s*(intro|estrofa|verso|pre[\s\-]?coro|coro|puente|bridge|interludio|solo|outro|final|tag|estribillo|modulaci[oó]n|leyenda|espontaneo|espontáneo)\s*(?:[:\-]|\b)?\s*(\d+|i{1,3}|[ivx]{1,4}|[1-9]ª|x\d+|\(.*?\)|-\s*[A-Z]\d?)?\s*$/i,

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
            'modulacion':'Modulación','leyenda':'Leyenda','espontaneo':'Espontáneo'
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
            else if (/^-\s*[A-Z]\d?$/i.test(number)) suffix = '';
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

// Detector automático de tonalidad — SOLO evaluamos tonalidades MAYORES, criterio unificado
const KeyDetector = {
    majorQualities: ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'],
    majorOffsets: [0, 2, 4, 5, 7, 9, 11],

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

        const totalDistinct = chordEntries.length;
        let best = null;

        for (let root = 0; root < 12; root++) {
            let matchedDistinct = 0;
            let matchedWeight = 0;
            let rootChordCount = 0;

            chordEntries.forEach(c => {
                const offset = (c.idx - root + 12) % 12;
                const pos = this.majorOffsets.indexOf(offset);
                const isMatch = pos !== -1 && this.majorQualities[pos] === c.quality;
                if (isMatch) {
                    matchedDistinct++;
                    matchedWeight += c.count;
                }
                if (c.idx === root && c.quality === 'maj') {
                    rootChordCount += c.count;
                }
            });

            const coverage = matchedDistinct / totalDistinct;

            let bonus = 0;
            if (firstChord && firstChord.idx === root && firstChord.quality === 'maj') bonus += 15;
            if (lastChord && lastChord.idx === root && lastChord.quality === 'maj') bonus += 30;

            const score = coverage * 10000 + rootChordCount * 20 + bonus + matchedWeight;

            if (!best || score > best.score) {
                best = { score, root };
            }
        }

        if (!best) return null;
        return Transposer.notes[best.root];
    }
};

// Conversión a grados
const KeyDegrees = {
    romanByOffset: ['I', 'bII', 'II', 'bIII', 'III', 'IV', '#IV', 'V', 'bVI', 'VI', 'bVII', 'VII'],

    getKeyRootIndex(keyBase) {
        if (!keyBase) return 0;
        const root = keyBase.replace('m', '');
        let idx = Transposer.notes.indexOf(root);
        if (idx === -1) idx = Transposer.notesFlat.indexOf(root);
        return idx === -1 ? 0 : idx;
    },

    noteToDegree(root, accidental, keyRootIdx) {
        const fullNote = root + (accidental || '');
        let idx = Transposer.notes.indexOf(fullNote);
        if (idx === -1) idx = Transposer.notesFlat.indexOf(fullNote);
        if (idx === -1) idx = Transposer.notes.indexOf(root);
        if (idx === -1) return '?';
        const offset = (idx - keyRootIdx + 12) % 12;
        return this.romanByOffset[offset];
    },

    toDegrees(chordLine, keyBase) {
        if (!chordLine || !chordLine.trim()) return chordLine;
        const keyRootIdx = this.getKeyRootIndex(keyBase);

        return chordLine.replace(ChordParser.chordRegex, (match, root, accidental, suffix, bassRoot, bassAccidental) => {
            let numeral = this.noteToDegree(root, accidental, keyRootIdx);
            const quality = KeyDetector.simplifyQuality(suffix);
            let suffixDisplay = suffix || '';

            if (quality === 'min') {
                numeral = numeral.toLowerCase();
                suffixDisplay = suffixDisplay.replace(/^m(?!aj)/, '');
            } else if (quality === 'dim') {
                numeral = numeral.toLowerCase() + '°';
                suffixDisplay = suffixDisplay.replace(/^(dim|°|ø)/, '');
            }

            let bassPart = '';
            if (bassRoot) {
                const bassNumeral = this.noteToDegree(bassRoot, bassAccidental, keyRootIdx);
                bassPart = '/' + bassNumeral;
            }

            return numeral + suffixDisplay + bassPart;
        });
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
        if (view === 'edicion' && !AppState.isAdmin) view = 'canciones';

        AppState.currentView = view;
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.route === view);
        });
        if (view === 'repertorio-detail') {
            const repTab = document.querySelector('.nav-tab[data-route="repertorio"]');
            if (repTab) repTab.classList.add('active');
        }

        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const target = document.getElementById(`view-${view}`);
        if (target) target.classList.add('active');

        if (view === 'canciones') {
            const sortSelect = document.getElementById('sort-select');
            if (sortSelect) sortSelect.value = AppState.settings.sortBy || 'alpha';
            this.renderSongsList();
        }
        if (view === 'repertorio') this.renderSetlistsList();
        if (view === 'repertorio-detail') this.renderSetlistDetail();
        if (view === 'edicion' && AppState.isCreatingNew) this.showInitialDialog();
    },

    setupMainButtons() {
        this.bindButton('logo-home', () => {
            if (AppState.currentView === 'edicion' && AppState.currentSong) this.saveCurrentSong();
            this.navigate('canciones');
        });
        this.bindButton('btn-add-song', () => {
            if (!AppState.isAdmin) return;
            AppState.isCreatingNew = true;
            this.navigate('edicion');
        });
        this.bindButton('btn-import-pdfs', () => { if (AppState.isAdmin) this.showBulkPDFImport(); });
        this.bindButton('btn-bulk-detect-keys', () => { if (AppState.isAdmin) this.bulkDetectKeys(); });
        this.bindButton('btn-migrate-local', () => { if (AppState.isAdmin) Storage.migrateLocalData(); });
        this.bindButton('btn-back-to-list', () => {
            if (AppState.cameFromSetlistId) {
                const sl = AppState.setlists.find(s => s.id === AppState.cameFromSetlistId);
                AppState.cameFromSetlistId = null;
                if (sl) {
                    AppState.currentSetlist = sl;
                    this.navigate('repertorio-detail');
                    return;
                }
            }
            this.navigate('canciones');
        });
        this.bindButton('btn-back-from-editor', () => {
            this.saveCurrentSong();
            this.navigate('canciones');
        });
        this.bindButton('btn-edit-song', () => {
            if (AppState.currentSong && AppState.isAdmin) this.editSong(AppState.currentSong.id);
        });
        this.bindButton('btn-transpose-up-reader', () => this.transposeSong(1));
        this.bindButton('btn-transpose-down-reader', () => this.transposeSong(-1));
        this.bindButton('btn-reset-key-reader', () => this.resetTransposition());
        this.bindButton('btn-toggle-notation', () => this.toggleNotation());
        this.bindButton('btn-voice-mode', () => this.toggleVoiceMode());
        this.bindButton('btn-save-song', () => this.saveCurrentSong());
        this.bindButton('btn-add-section', () => Editor.addSection());
        this.bindButton('btn-add-pair-editor', () => Editor.addPair());
        this.bindButton('btn-transpose-up', () => Editor.transpose(1));
        this.bindButton('btn-transpose-down', () => Editor.transpose(-1));
        this.bindButton('btn-reset-transpose', () => Editor.resetTranspose());
        this.bindButton('btn-detect-key', () => Editor.detectKey());
        this.bindInput('search-box', (e) => this.filterSongs(e.target.value));
        this.bindInput('bpm-editor-input', (e) => {
            if (!AppState.currentSong) return;
            const val = parseInt(e.target.value);
            AppState.currentSong.bpm = isNaN(val) ? null : val;
            Storage.updateSaveStatus('unsaved');
        });
        this.bindInput('compas-editor-input', (e) => {
            if (!AppState.currentSong) return;
            AppState.currentSong.compas = e.target.value.trim();
            Storage.updateSaveStatus('unsaved');
        });
        this.bindInput('song-artist-editor', (e) => {
            if (!AppState.currentSong) return;
            AppState.currentSong.artist = e.target.value;
            Storage.updateSaveStatus('unsaved');
        });
        this.bindSelect('key-editor-select', (e) => {
            if (!AppState.currentSong) return;
            AppState.currentSong.keyBase = e.target.value;
            Storage.updateSaveStatus('unsaved');
        });
        this.bindSelect('sort-select', (e) => {
            AppState.settings.sortBy = e.target.value;
            Storage.saveSettings();
            this.renderSongsList();
        });

        // Repertorio
        this.bindButton('btn-new-setlist', () => { if (AppState.isAdmin) this.showNewSetlistModal(); });
        this.bindButton('btn-back-to-repertorios', () => {
            AppState.currentSetlist = null;
            this.navigate('repertorio');
        });
        this.bindButton('btn-add-songs-to-setlist', () => { if (AppState.isAdmin) this.showAddSongsToSetlistModal(); });
        this.bindInput('setlist-name-input', (e) => {
            if (!AppState.currentSetlist || !AppState.isAdmin) return;
            AppState.currentSetlist.name = e.target.value;
            Storage.saveSetlists();
        });
        this.bindButton('btn-prev-setlist-song', () => this.gotoSetlistSong(-1));
        this.bindButton('btn-next-setlist-song', () => this.gotoSetlistSong(1));
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
        alert(`✅ Listo. Se actualizó la tonalidad de ${updatedCount} de ${AppState.songs.length} canción(es).`);
    },

    keyIndex(keyBase) {
        if (!keyBase) return 99;
        const root = keyBase.replace('m', '');
        let idx = Transposer.notes.indexOf(root);
        if (idx === -1) idx = Transposer.notesFlat.indexOf(root);
        return idx === -1 ? 99 : idx;
    },

    sortSongs(songs) {
        const sortBy = AppState.settings.sortBy || 'alpha';
        const arr = [...songs];
        switch (sortBy) {
            case 'alpha':
                arr.sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));
                break;
            case 'recent':
                arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'key':
                arr.sort((a, b) => this.keyIndex(a.keyBase) - this.keyIndex(b.keyBase));
                break;
            case 'bpm':
                arr.sort((a, b) => (b.bpm || 0) - (a.bpm || 0));
                break;
        }
        return arr;
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
            const sorted = this.sortSongs(AppState.songs);
            grid.innerHTML = sorted.map(song => `
                <div class="song-item" onclick="Router.viewSong('${song.id}')">
                    <div class="song-info">
                        <div class="song-title">${song.title}</div>
                        <div class="song-meta">${song.artist ? `${song.artist} • ` : ''}${song.keyBase}${song.bpm ? ` • ${song.bpm} BPM` : ''}</div>
                    </div>
                    ${AppState.isAdmin ? `
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
                    </div>` : ''}
                </div>
            `).join('');
        }
    },

    saveCurrentSong() {
        if (!AppState.isAdmin) return;
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

            const artistInput = document.getElementById('song-artist-editor');
            if (artistInput) AppState.currentSong.artist = artistInput.value.trim();

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
        } finally {
            setTimeout(() => {
                AppState.isSaving = false;
                if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Guardar'; }
            }, 800);
        }
    },

    filterSongs(query) {
        const items = document.querySelectorAll('#songs-grid .song-item');
        const q = query.toLowerCase();
        items.forEach(item => {
            const title = item.querySelector('.song-title').textContent.toLowerCase();
            const meta = item.querySelector('.song-meta').textContent.toLowerCase();
            item.style.display = (title.includes(q) || meta.includes(q)) ? 'flex' : 'none';
        });
    },

    formatReaderMeta(song) {
        const artist = song.artist ? song.artist : 'Sin autor';
        const bpm = song.bpm ? `${song.bpm} BPM` : 'Sin BPM';
        const compas = song.compas ? `Compás ${song.compas}` : null;
        return compas ? `${artist} • ${bpm} • ${compas}` : `${artist} • ${bpm}`;
    },

    viewSong(songId) {
        const song = AppState.songs.find(s => s.id === songId);
        if (!song) return;
        AppState.cameFromSetlistId = null;
        AppState.currentSong = song;
        AppState.currentTranspose = 0;
        AppState.notationMode = 'chords';
        AppState.voiceMode = false;

        this.resetReaderControlsUI();

        document.getElementById('reader-title').textContent = song.title;
        document.getElementById('reader-meta').textContent = this.formatReaderMeta(song);
        document.getElementById('current-key-reader').textContent = song.keyBase;
        this.renderSongContent();
        this.navigate('song-reader');
    },

    viewSetlistSong(songId) {
        if (!AppState.currentSetlist) return;
        const song = AppState.songs.find(s => s.id === songId);
        if (!song) return;

        AppState.cameFromSetlistId = AppState.currentSetlist.id;
        AppState.currentSong = song;
        AppState.currentTranspose = 0;
        AppState.notationMode = 'chords';
        AppState.voiceMode = false;

        this.resetReaderControlsUI();

        document.getElementById('reader-title').textContent = song.title;
        document.getElementById('reader-meta').textContent = this.formatReaderMeta(song);
        document.getElementById('current-key-reader').textContent = song.keyBase;
        this.renderSongContent();
        this.updateSetlistNavControls();
        this.navigate('song-reader');
    },

    resetReaderControlsUI() {
        const toggleBtn = document.getElementById('btn-toggle-notation');
        if (toggleBtn) toggleBtn.textContent = '🎼 Ver en grados';

        const voiceBtn = document.getElementById('btn-voice-mode');
        if (voiceBtn) voiceBtn.classList.remove('active-mode');

        const songContent = document.getElementById('song-content');
        if (songContent) songContent.classList.remove('voice-mode');

        const setlistNav = document.getElementById('setlist-nav-controls');
        if (setlistNav) setlistNav.style.display = 'none';

        const editBtn = document.getElementById('btn-edit-song');
        if (editBtn) editBtn.style.display = AppState.isAdmin ? 'inline-flex' : 'none';
    },

    updateSetlistNavControls() {
        const setlistNav = document.getElementById('setlist-nav-controls');
        const posLabel = document.getElementById('setlist-position-label');
        if (!setlistNav || !AppState.currentSetlist || !AppState.currentSong) return;

        const ids = AppState.currentSetlist.songIds || [];
        const idx = ids.indexOf(AppState.currentSong.id);
        if (idx === -1) { setlistNav.style.display = 'none'; return; }

        setlistNav.style.display = 'flex';
        posLabel.textContent = `${idx + 1} / ${ids.length}`;

        const prevBtn = document.getElementById('btn-prev-setlist-song');
        const nextBtn = document.getElementById('btn-next-setlist-song');
        if (prevBtn) prevBtn.disabled = idx <= 0;
        if (nextBtn) nextBtn.disabled = idx >= ids.length - 1;
    },

    gotoSetlistSong(direction) {
        if (!AppState.currentSetlist || !AppState.currentSong) return;
        const ids = AppState.currentSetlist.songIds || [];
        const idx = ids.indexOf(AppState.currentSong.id);
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= ids.length) return;
        this.viewSetlistSong(ids[newIdx]);
    },

    editSong(songId) {
        if (!AppState.isAdmin) return;
        const song = AppState.songs.find(s => s.id === songId);
        if (!song) return;
        AppState.editingSongId = songId;
        AppState.currentSong = JSON.parse(JSON.stringify(song));
        AppState.isCreatingNew = false;
        this.navigate('edicion');
        Editor.loadSong(AppState.currentSong);
    },

    deleteSong(songId) {
        if (!AppState.isAdmin) return;
        if (confirm('¿Estás seguro de que quieres eliminar esta canción?')) {
            AppState.songs = AppState.songs.filter(s => s.id !== songId);
            Storage.saveSongs();
            AppState.setlists.forEach(sl => {
                sl.songIds = (sl.songIds || []).filter(id => id !== songId);
            });
            Storage.saveSetlists();
            this.renderSongsList();
        }
    },

    renderSongContent() {
        const content = document.getElementById('song-content');
        if (!AppState.currentSong) return;
        const song = AppState.currentSong;
        const mode = AppState.notationMode || 'chords';

        content.innerHTML = song.sections.map(section => `
            <div class="section">
                <div class="section-label">${section.label}</div>
                ${section.pairs.map(pair => {
                    let chordDisplay = '';
                    if (pair.acordes) {
                        if (mode === 'degrees') {
                            chordDisplay = KeyDegrees.toDegrees(pair.acordes, song.keyBase);
                        } else {
                            chordDisplay = Transposer.cleanChord(Transposer.transpose(pair.acordes, AppState.currentTranspose));
                        }
                    }
                    return `
                        <div class="pair">
                            ${chordDisplay ? `<div class="chord-line">${chordDisplay}</div>` : ''}
                            ${pair.letra ? `<div class="lyric-line">${pair.letra}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `).join('');

        content.classList.toggle('voice-mode', !!AppState.voiceMode);
    },

    transposeSong(semitones) {
        if (!AppState.currentSong) return;
        AppState.currentTranspose += semitones;

        if (AppState.notationMode !== 'degrees') {
            const currentKey = Transposer.cleanChord(Transposer.transpose(AppState.currentSong.keyBase, AppState.currentTranspose));
            document.getElementById('current-key-reader').textContent = currentKey;
        }

        this.renderSongContent();
    },

    resetTransposition() {
        if (AppState.currentTranspose === 0) return;
        AppState.currentTranspose = 0;

        if (AppState.notationMode !== 'degrees') {
            document.getElementById('current-key-reader').textContent = AppState.currentSong.keyBase;
        }

        this.renderSongContent();
    },

    toggleNotation() {
        if (!AppState.currentSong) return;
        AppState.notationMode = AppState.notationMode === 'degrees' ? 'chords' : 'degrees';

        const btn = document.getElementById('btn-toggle-notation');
        if (btn) {
            btn.textContent = AppState.notationMode === 'degrees' ? '🎸 Ver acordes' : '🎼 Ver en grados';
        }

        const keyLabel = document.getElementById('current-key-reader');
        if (AppState.notationMode === 'degrees') {
            keyLabel.textContent = 'Grados';
        } else {
            keyLabel.textContent = Transposer.cleanChord(Transposer.transpose(AppState.currentSong.keyBase, AppState.currentTranspose));
        }

        this.renderSongContent();
    },

    toggleVoiceMode() {
        if (!AppState.currentSong) return;
        AppState.voiceMode = !AppState.voiceMode;

        const btn = document.getElementById('btn-voice-mode');
        if (btn) {
            btn.textContent = AppState.voiceMode ? '🎸 Ver acordes' : '🎤 Modo Voz';
            btn.classList.toggle('active-mode', AppState.voiceMode);
        }

        this.renderSongContent();
    },

    showInitialDialog() {
        if (!AppState.isAdmin) { AppState.isCreatingNew = false; this.navigate('canciones'); return; }
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
            keyBase: document.getElementById('modal-key').value, bpm: null, compas: '', autoSections: AppState.settings.autoSections,
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

        const detectedKey = KeyDetector.detectKey(sections);
        if (detectedKey) AppState.currentSong.keyBase = detectedKey;

        const bpmMatch = text.match(/TEMPO\s*:?\s*(\d+)/i);
        if (bpmMatch) AppState.currentSong.bpm = parseInt(bpmMatch[1]);

        const compasMatch = text.match(/Comp[aá]s\s*:?\s*(\d+\s*\/\s*\d+)/i);
        if (compasMatch) AppState.currentSong.compas = compasMatch[1].replace(/\s/g, '');

        AppState.isCreatingNew = false;
        this.closeModal();
        Editor.loadSong(AppState.currentSong);
    },

    // ============ REPERTORIO ============
    showNewSetlistModal() {
        const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const today = new Date();
        const defaultName = `${days[today.getDay()].charAt(0).toUpperCase() + days[today.getDay()].slice(1)} ${today.getDate()}/${today.getMonth() + 1}`;

        this.createModal({
            title: 'Nuevo repertorio',
            content: `
                <div class="form-group">
                    <label class="form-label">Nombre *</label>
                    <input type="text" class="form-input" id="modal-setlist-name" value="${defaultName}">
                </div>
            `,
            actions: [
                { text: 'Cancelar', action: () => this.closeModal() },
                { text: 'Crear', primary: true, action: () => this.createSetlist() }
            ]
        });
    },

    createSetlist() {
        const name = document.getElementById('modal-setlist-name').value.trim();
        if (!name) { alert('El nombre es obligatorio'); return; }
        const setlist = {
            id: this.generateId(),
            name,
            songIds: [],
            createdAt: new Date().toISOString()
        };
        AppState.setlists.push(setlist);
        Storage.saveSetlists();
        AppState.currentSetlist = setlist;
        this.closeModal();
        this.navigate('repertorio-detail');
    },

    renderSetlistsList() {
        const grid = document.getElementById('repertorio-grid');
        const emptyState = document.getElementById('repertorio-empty-state');

        if (AppState.setlists.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        grid.style.display = 'block';
        const sorted = [...AppState.setlists].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        grid.innerHTML = sorted.map(sl => `
            <div class="song-item" onclick="Router.openSetlist('${sl.id}')">
                <div class="song-info">
                    <div class="song-title">${sl.name}</div>
                    <div class="song-meta">${(sl.songIds || []).length} canción(es)</div>
                </div>
                ${AppState.isAdmin ? `
                <div class="song-actions" onclick="event.stopPropagation()">
                    <button class="action-btn delete-btn" onclick="Router.deleteSetlist('${sl.id}')" title="Eliminar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        </svg>
                    </button>
                </div>` : ''}
            </div>
        `).join('');
    },

    openSetlist(setlistId) {
        const sl = AppState.setlists.find(s => s.id === setlistId);
        if (!sl) return;
        AppState.currentSetlist = sl;
        this.navigate('repertorio-detail');
    },

    deleteSetlist(setlistId) {
        if (!AppState.isAdmin) return;
        if (confirm('¿Eliminar este repertorio?')) {
            AppState.setlists = AppState.setlists.filter(s => s.id !== setlistId);
            Storage.saveSetlists();
            this.renderSetlistsList();
        }
    },

    renderSetlistDetail() {
        if (!AppState.currentSetlist) { this.navigate('repertorio'); return; }
        const sl = AppState.currentSetlist;

        const nameInput = document.getElementById('setlist-name-input');
        if (nameInput) { nameInput.value = sl.name; nameInput.readOnly = !AppState.isAdmin; }

        const addBtn = document.getElementById('btn-add-songs-to-setlist');
        if (addBtn) addBtn.style.display = AppState.isAdmin ? 'inline-flex' : 'none';

        const list = document.getElementById('setlist-songs-list');
        const empty = document.getElementById('setlist-empty-state');

        const songs = (sl.songIds || []).map(id => AppState.songs.find(s => s.id === id)).filter(Boolean);

        if (songs.length === 0) {
            list.style.display = 'none';
            empty.style.display = 'block';
            return;
        }

        empty.style.display = 'none';
        list.style.display = 'block';

        list.innerHTML = songs.map((song, idx) => `
            <div class="song-item" onclick="Router.viewSetlistSong('${song.id}')">
                <div class="song-info">
                    <div class="song-title">${idx + 1}. ${song.title}</div>
                    <div class="song-meta">${song.keyBase}${song.bpm ? ` • ${song.bpm} BPM` : ''}</div>
                </div>
                ${AppState.isAdmin ? `
                <div class="song-actions" onclick="event.stopPropagation()">
                    <button class="action-btn" onclick="Router.moveSetlistSong(${idx}, -1)" title="Subir" ${idx === 0 ? 'style="opacity:0.3;pointer-events:none;"' : ''}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                    </button>
                    <button class="action-btn" onclick="Router.moveSetlistSong(${idx}, 1)" title="Bajar" ${idx === songs.length - 1 ? 'style="opacity:0.3;pointer-events:none;"' : ''}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                    </button>
                    <button class="action-btn delete-btn" onclick="Router.removeSetlistSong('${song.id}')" title="Quitar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        </svg>
                    </button>
                </div>` : ''}
            </div>
        `).join('');
    },

    moveSetlistSong(index, direction) {
        if (!AppState.isAdmin) return;
        const sl = AppState.currentSetlist;
        if (!sl) return;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= sl.songIds.length) return;
        const id = sl.songIds.splice(index, 1)[0];
        sl.songIds.splice(newIndex, 0, id);
        Storage.saveSetlists();
        this.renderSetlistDetail();
    },

    removeSetlistSong(songId) {
        if (!AppState.isAdmin) return;
        const sl = AppState.currentSetlist;
        if (!sl) return;
        sl.songIds = sl.songIds.filter(id => id !== songId);
        Storage.saveSetlists();
        this.renderSetlistDetail();
    },

    showAddSongsToSetlistModal() {
        if (!AppState.currentSetlist) return;
        const currentIds = AppState.currentSetlist.songIds || [];
        const available = AppState.songs.filter(s => !currentIds.includes(s.id));

        if (available.length === 0) {
            alert('Todas tus canciones ya están en este repertorio.');
            return;
        }

        const sorted = [...available].sort((a, b) => a.title.localeCompare(b.title, 'es'));

        this.createModal({
            title: 'Añadir canciones al repertorio',
            content: `
                <div class="form-group">
                    <input type="text" class="form-input" id="setlist-add-search" placeholder="Buscar...">
                </div>
                <div id="setlist-add-list">
                    ${sorted.map(song => `
                        <div class="import-preview-item" data-title="${song.title.toLowerCase()}">
                            <input type="checkbox" data-song-id="${song.id}" class="setlist-add-checkbox">
                            <div class="import-preview-info">
                                <div class="import-preview-title">${song.title}</div>
                                <div class="import-preview-meta">${song.keyBase}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `,
            actions: [
                { text: 'Cancelar', action: () => this.closeModal() },
                { text: 'Añadir seleccionadas', primary: true, action: () => this.confirmAddSongsToSetlist() }
            ]
        });

        document.getElementById('setlist-add-search').addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('#setlist-add-list .import-preview-item').forEach(el => {
                el.style.display = el.dataset.title.includes(q) ? 'flex' : 'none';
            });
        });
    },

    confirmAddSongsToSetlist() {
        if (!AppState.isAdmin) return;
        const checked = document.querySelectorAll('.setlist-add-checkbox:checked');
        const sl = AppState.currentSetlist;
        if (!sl) return;
        checked.forEach(cb => {
            const id = cb.dataset.songId;
            if (!sl.songIds.includes(id)) sl.songIds.push(id);
        });
        Storage.saveSetlists();
        this.closeModal();
        this.renderSetlistDetail();
    },
    // ============ FIN REPERTORIO ============

    // ============ IMPORTACIÓN MASIVA DE PDFs ============
    showBulkPDFImport() {
        this.createModal({
            title: '📄 Importar PDFs en lote',
            content: `
                <p style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                    Selecciona varios PDFs a la vez (en tono original, no en grados). Tonalidad, BPM y compás se detectan automáticamente. Podrás editar cada una después.
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

                let explicitKey = null;
                const keyMatch = text.match(/(?:KEY|TONALIDAD)\s*:?\s*([A-G][#b]?m?)\b/i);
                if (keyMatch) {
                    explicitKey = keyMatch[1].charAt(0).toUpperCase() + keyMatch[1].slice(1);
                }

                let bpm = null;
                const bpmMatch = text.match(/TEMPO\s*:?\s*(\d+)/i);
                if (bpmMatch) bpm = parseInt(bpmMatch[1]);

                let compas = '';
                const compasMatch = text.match(/Comp[aá]s\s*:?\s*(\d+\s*\/\s*\d+)/i);
                if (compasMatch) compas = compasMatch[1].replace(/\s/g, '');

                const lines = text.split('\n');
                const cleanedLines = lines.filter(line => {
                    const t = line.trim();
                    if (!t) return true;
                    if (/tonalidad\s*:|key\s*:|comp[aá]s\s*:|tempo\s*:/i.test(t)) return false;
                    if (/^estructura$/i.test(t)) return false;
                    if (/^([A-Za-z0-9]{1,3}\s+){2,}[A-Za-z0-9]{1,3}$/.test(t) && !ChordParser.isChordLine(t)) return false;
                    return true;
                });
                text = cleanedLines.join('\n');

                const sections = ChordParser.detectAndParse(text, true);

                const autoDetectedKey = KeyDetector.detectKey(sections);
                let finalKey = autoDetectedKey || explicitKey || 'C';
                if (explicitKey && !explicitKey.includes('m')) {
                    finalKey = explicitKey;
                }

                const title = file.name.replace(/\.pdf$/i, '').trim();

                AppState.pendingImports.push({
                    id: this.generateId(),
                    title: title || 'Sin título',
                    artist: '',
                    keyBase: finalKey,
                    bpm: bpm,
                    compas: compas,
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
                    const viewport = page.getViewport({ scale: 1 });
                    const textContent = await page.getTextContent();
                    fullText += this.reconstructPageText(textContent, viewport.width) + '\n';
                }
                resolve(fullText);
            } catch (error) {
                reject(error);
            }
        });
    },

    reconstructPageText(textContent, pageWidth) {
        const items = textContent.items.filter(it => it.str && it.str.trim());
        if (!items.length) return '';

        const buildLines = (its) => {
            const lineGroups = [];
            const tolerance = 2;
            its.forEach(item => {
                const y = item.transform[5];
                const x = item.transform[4];
                let group = lineGroups.find(g => Math.abs(g.y - y) <= tolerance);
                if (!group) {
                    group = { y, items: [] };
                    lineGroups.push(group);
                }
                group.items.push({ x, str: item.str, width: item.width || 0 });
            });
            lineGroups.sort((a, b) => b.y - a.y);
            return lineGroups.map(group => {
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
        };

        let leftItems = items;
        let rightItems = [];

        if (pageWidth) {
            const boundary = pageWidth * 0.5;
            const potentialLeft = items.filter(it => it.transform[4] < boundary);
            const potentialRight = items.filter(it => it.transform[4] >= boundary);
            if (potentialLeft.length >= 8 && potentialRight.length >= 8) {
                leftItems = potentialLeft;
                rightItems = potentialRight;
            }
        }

        if (rightItems.length > 0) {
            const leftLines = buildLines(leftItems);
            const rightLines = buildLines(rightItems);
            return leftLines.join('\n') + '\n' + rightLines.join('\n');
        }

        return buildLines(leftItems).join('\n');
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
                                <div class="import-preview-meta">Tonalidad: ${song.keyBase}${song.bpm ? ` • ${song.bpm} BPM` : ''}${song.compas ? ` • ${song.compas}` : ''} • ${song.sections.length} sección(es)</div>
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
        if (!AppState.isAdmin) return;
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
        const artistInput = document.getElementById('song-artist-editor');
        if (artistInput) artistInput.value = song.artist || '';
        this.render();
        this.renderOutline();
        this.updateChips();
        Storage.updateSaveStatus('saved');
    },

    updateChips() {
        const keySelect = document.getElementById('key-editor-select');
        if (keySelect) keySelect.value = AppState.currentSong.keyBase;
        const bpmInput = document.getElementById('bpm-editor-input');
        if (bpmInput) bpmInput.value = AppState.currentSong.bpm || '';
        const compasInput = document.getElementById('compas-editor-input');
        if (compasInput) compasInput.value = AppState.currentSong.compas || '';
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
    Storage.loadSettings();

    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    Storage.listenSongs(() => {
        if (AppState.currentView === 'canciones') Router.renderSongsList();
        if (AppState.currentView === 'repertorio-detail') Router.renderSetlistDetail();
    });
    Storage.listenSetlists(() => {
        if (AppState.currentView === 'repertorio') Router.renderSetlistsList();
        if (AppState.currentView === 'repertorio-detail') Router.renderSetlistDetail();
    });

    Auth.init();
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
