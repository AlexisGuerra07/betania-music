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

// ============ WAKE LOCK ============
const WakeLockManager = {
    sentinel: null,
    async request() {
        try {
            if ('wakeLock' in navigator) {
                this.sentinel = await navigator.wakeLock.request('screen');
                this.sentinel.addEventListener('release', () => { this.sentinel = null; });
            }
        } catch (err) {
            console.log('No se pudo activar Wake Lock:', err);
        }
    },
    release() {
        if (this.sentinel) {
            this.sentinel.release();
            this.sentinel = null;
        }
    }
};

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && AppState.currentView === 'song-reader') {
        WakeLockManager.request();
    }
});

// ============ CONTROL DEL BOTÓN DE SALIR EN PANTALLA COMPLETA ============
const FullscreenUI = {
    hideTimer: null,
    activityBound: false,

    show() {
        const btn = document.getElementById('btn-fullscreen-exit');
        if (btn) btn.style.display = 'inline-flex';
        this.scheduleHide();
    },

    hide() {
        const btn = document.getElementById('btn-fullscreen-exit');
        if (btn) btn.style.display = 'none';
        if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = null; }
    },

    scheduleHide() {
        if (this.hideTimer) clearTimeout(this.hideTimer);
        this.hideTimer = setTimeout(() => {
            const btn = document.getElementById('btn-fullscreen-exit');
            if (btn) btn.style.display = 'none';
        }, 3000);
    },

    bindActivityListeners() {
        if (this.activityBound) return;
        this.activityBound = true;
        const reveal = () => {
            if (!AppState.fullscreenMode) return;
            this.show();
        };
        document.addEventListener('touchstart', reveal, { passive: true });
        document.addEventListener('mousemove', reveal, { passive: true });
        document.addEventListener('click', reveal, { passive: true });
    }
};

// ============ HISTORIAL DE NAVEGACIÓN ============
const HistoryManager = {
    init() {
        history.replaceState({ view: 'canciones' }, '', location.href);
        window.addEventListener('popstate', (e) => this.handlePopState(e));
    },

    push(state) {
        history.pushState(state, '', location.href);
    },

    handlePopState(e) {
        const state = e.state || { view: 'canciones' };

        if (AppState.fullscreenMode && !state.fullscreen) {
            Router.exitFullscreenMode();
            return;
        }

        if (AppState.currentView === 'edicion' && AppState.currentSong) {
            Router.saveCurrentSong();
        }

        if (state.view === 'song-reader' && state.songId) {
            if (state.setlistId) {
                const sl = AppState.setlists.find(s => s.id === state.setlistId);
                if (sl) AppState.currentSetlist = sl;
                Router.viewSetlistSong(state.songId, false);
            } else {
                Router.viewSong(state.songId, false);
            }
            if (state.fullscreen) {
                AppState.fullscreenMode = true;
                document.body.classList.add('fullscreen-active');
                FullscreenUI.show();
            }
        } else if (state.view === 'repertorio-detail' && state.setlistId) {
            const sl = AppState.setlists.find(s => s.id === state.setlistId);
            if (sl) {
                AppState.currentSetlist = sl;
                Router.navigate('repertorio-detail', false);
            } else {
                Router.navigate('repertorio', false);
            }
        } else {
            Router.navigate(state.view || 'canciones', false);
        }
    }
};

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
    baseTransposeOffset: 0,
    notationMode: 'chords',
    voiceMode: false,
    fullscreenMode: false,
    isSaving: false,
    lastSaveTime: 0,
    settings: { fontSize: 14, autoSections: true, sortBy: 'alpha', readerFontScale: 1 },
    isCreatingNew: false,
    pendingImports: [],
    isAdmin: false,
    currentUser: null
};

// Storage — usa Firestore en vez de localStorage
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

        const newSetlistBtn = document.getElementById('btn-new-setlist');
        if (newSetlistBtn) newSetlistBtn.style.display = 'inline-flex';
        const addSongsBtn = document.getElementById('btn-add-songs-to-setlist');
        if (addSongsBtn) addSongsBtn.style.display = 'inline-flex';
        const uniformKeyBtn = document.getElementById('btn-uniform-key');
        if (uniformKeyBtn) uniformKeyBtn.style.display = 'inline-flex';

        const setlistNameInput = document.getElementById('setlist-name-input');
        if (setlistNameInput) setlistNameInput.readOnly = false;

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
    sectionHeaderRegex: /^\s*(intro|estrofa|verso|pre[\s\-]?coro|coro|puente|bridge|interludio|instrumental|solo|outro|final|tag|estribillo|modulaci[oó]n|leyenda|espontaneo|espontáneo)\s*(?:[:\-.]|\b)?\s*(\d+|i{1,3}|[ivx]{1,4}|[1-9]ª|x\d+|\(.*?\)|-\s*[A-Z]\d?)?\s*$/i,

    normalizeTildes(text) {
        const map = { 'á':'a','é':'e','í':'i','ó':'o','ú':'u','Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U' };
        return text.replace(/\u00A0/g, ' ').replace(/[áéíóúÁÉÍÓÚ]/g, c => map[c] || c);
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
            'interludio':'Interludio','instrumental':'Instrumental','solo':'Solo','outro':'Outro','final':'Final','tag':'Tag',
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

// Detector automático de tonalidad — SOLO evaluamos tonalidades MAYORES
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
        this.setupSwipeNavigation();
        FullscreenUI.bindActivityListeners();
        this.navigate('canciones', false);
    },

    setupSwipeNavigation() {
        let touchStartX = null;
        let touchStartY = null;
        const edgeMargin = 30;

        document.addEventListener('touchstart', (e) => {
            if (AppState.currentView !== 'song-reader' || !AppState.currentSetlist) return;
            const x = e.touches[0].clientX;
            if (x < edgeMargin || x > window.innerWidth - edgeMargin) {
                touchStartX = null;
                return;
            }
            touchStartX = x;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (touchStartX === null || AppState.currentView !== 'song-reader' || !AppState.currentSetlist) return;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            touchStartX = null;
            touchStartY = null;

            if (Math.abs(diffX) < 70 || Math.abs(diffX) < Math.abs(diffY) * 1.5) return;

            if (diffX < 0) {
                Router.gotoSetlistSong(1);
            } else {
                Router.gotoSetlistSong(-1);
            }
        }, { passive: true });
    },

    navigate(view, push = true) {
        if (view === 'edicion' && !AppState.isAdmin) view = 'canciones';

        if (AppState.currentView === 'song-reader' && view !== 'song-reader') {
            WakeLockManager.release();
            this.exitFullscreenMode();
        }

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

        if (push) {
            HistoryManager.push({ view });
        }
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
        this.bindButton('btn-back-to-list', () => { history.back(); });
        this.bindButton('btn-back-from-editor', () => {
            this.saveCurrentSong();
            history.back();
        });
        this.bindButton('btn-edit-song', () => {
            if (AppState.currentSong && AppState.isAdmin) this.editSong(AppState.currentSong.id);
        });
        this.bindButton('btn-transpose-up-reader', () => this.transposeSong(1));
        this.bindButton('btn-transpose-down-reader', () => this.transposeSong(-1));
        this.bindButton('btn-reset-key-reader', () => this.resetTransposition());
        this.bindButton('btn-toggle-notation', () => this.toggleNotation());
        this.bindButton('btn-voice-mode', () => this.toggleVoiceMode());
        this.bindButton('btn-font-increase', () => this.adjustReaderFontSize(0.1));
        this.bindButton('btn-font-decrease', () => this.adjustReaderFontSize(-0.1));
        this.bindButton('btn-fullscreen-toggle', () => this.enterFullscreenMode());
        this.bindButton('btn-fullscreen-exit', () => this.requestExitFullscreen());
        this.bindButton('btn-save-song', () => this.saveCurrentSong());
        this.bindButton('btn-add-section', () => Editor.addSection());
        this.bindButton('btn-add-pair-editor', () => Editor.addPair());
        this.bindButton('btn-transpose-up', () => Editor.transpose(1));
        this.bindButton('btn-transpose-down', () =>
