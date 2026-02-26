/* ==========================================
   1. ESTADO GLOBAL DE LA APP
   ========================================== */
const AppState = {
    currentView: 'canciones',
    songs: [],
    setlists: [], // Nueva matriz para guardar los cultos
    currentSong: null,
    currentTranspose: 0
};

/* ==========================================
   2. BASE DE DATOS LOCAL (Offline Storage)
   ========================================== */
const Storage = {
    SONGS_KEY: 'betania_songs_v1',
    SETLISTS_KEY: 'betania_setlists_v1',

    loadAll() {
        try {
            const savedSongs = localStorage.getItem(this.SONGS_KEY);
            if (savedSongs) AppState.songs = JSON.parse(savedSongs);

            const savedSetlists = localStorage.getItem(this.SETLISTS_KEY);
            if (savedSetlists) AppState.setlists = JSON.parse(savedSetlists);
        } catch (error) {
            console.error('Error cargando datos locales:', error);
        }
    },

    saveSongs() {
        localStorage.setItem(this.SONGS_KEY, JSON.stringify(AppState.songs));
    },

    saveSetlists() {
        localStorage.setItem(this.SETLISTS_KEY, JSON.stringify(AppState.setlists));
    }
};

/* ==========================================
   3. MOTOR DE TRANSPOSICIÓN DE ACORDES
   ========================================== */
const Transposer = {
    notes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    notesFlat: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
    chordRegex: /\b([A-G])([#b])?(maj7|maj9|m7|m9|m|dim|aug|add\d+|sus2|sus4|7|9|11|13|°|ø)?(?:\/([A-G])([#b])?)?\b/g,

    transpose(chordString, semitones) {
        if (!chordString || semitones === 0) return chordString;
        
        return chordString.replace(this.chordRegex, (match, root, accidental, suffix, bassRoot, bassAccidental) => {
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
        
        if (noteIndex === -1) noteIndex = this.notesFlat.indexOf(fullNote);
        if (noteIndex === -1) noteIndex = this
