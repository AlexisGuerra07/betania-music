// Gestor de Canciones - Betania Music
class SongManager {
    constructor() {
        this.songs = this.loadSongs();
        this.currentSong = null;
        this.currentTransposition = 0;
        this.editMode = false;
        
        // Key mappings
        this.latinKeys = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
        this.angloKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.latinFlats = ['Do', 'Reb', 'Re', 'Mib', 'Mi', 'Fa', 'Solb', 'Sol', 'Lab', 'La', 'Sib', 'Si'];
        this.angloFlats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderSongsList();
        this.populateKeySelectors();
    }

    // Event Bindings
    bindEvents() {
        // Navigation
        document.getElementById('nav-songs').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSongsView();
        });

        // Add song button
        document.getElementById('btn-add-song').addEventListener('click', () => {
            this.openAddSongModal();
        });

        // Search
        document.getElementById('search-box').addEventListener('input', (e) => {
            this.filterSongs(e.target.value);
        });

        // Modal controls
        document.getElementById('btn-close-modal').addEventListener('click', () => {
            this.closeSongModal();
        });

        document.getElementById('btn-cancel').addEventListener('click', () => {
            this.closeSongModal();
        });

        document.getElementById('btn-save').addEventListener('click', () => {
            this.saveSong();
        });

        // Delete modal
        document.getElementById('btn-close-delete').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('btn-cancel-delete').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        document.getElementById('btn-confirm-delete').addEventListener('click', () => {
            this.deleteSong();
        });

        // Editor controls
        document.getElementById('btn-add-pair').addEventListener('click', () => {
            this.addPair();
        });

        // Notation change
        document.getElementById('notation-type').addEventListener('change', () => {
            this.updateKeySelector();
            if (this.editMode) {
                this.updateTransposeControls();
            }
        });

        // Transpose controls
        document.getElementById('btn-transpose-down').addEventListener('click', () => {
            this.transpose(-1);
        });

        document.getElementById('btn-transpose-up').addEventListener('click', () => {
            this.transpose(1);
        });

        document.getElementById('btn-reset-key').addEventListener('click', () => {
            this.resetToBaseKey();
        });

        // Modal backdrop close
        document.getElementById('song-modal').addEventListener('click', (e) => {
            if (e.target.id === 'song-modal') {
                this.closeSongModal();
            }
        });

        document.getElementById('delete-modal').addEventListener('click', (e) => {
            if (e.target.id === 'delete-modal') {
                this.closeDeleteModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSongModal();
                this.closeDeleteModal();
            }
        });
    }

    // Data Management
    loadSongs() {
        const stored = localStorage.getItem('songs_v1');
        return stored ? JSON.parse(stored) : [];
    }

    saveSongs() {
        localStorage.setItem('songs_v1', JSON.stringify(this.songs));
    }

    generateId() {
        return 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // UI Management
    showSongsView() {
        // Update navigation
        document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
        document.getElementById('nav-songs').classList.add('active');
        
        this.renderSongsList();
    }

    renderSongsList() {
        const emptyState = document.getElementById('empty-state');
        const songsGrid = document.getElementById('songs-grid');
        
        if (this.songs.length === 0) {
            emptyState.style.display = 'block';
            songsGrid.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            songsGrid.style.display = 'grid';
            this.populateSongsGrid();
        }
    }

    populateSongsGrid() {
        const grid = document.getElementById('songs-grid');
        grid.innerHTML = '';

        this.songs.forEach(song => {
            const card = this.createSongCard(song);
            grid.appendChild(card);
        });
    }

    createSongCard(song) {
        const card = document.createElement('div');
        card.className = 'song-card';
        
        const updatedDate = new Date(song.updatedAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        card.innerHTML = `
            <div class="song-title">${this.escapeHtml(song.title)}</div>
            <div class="song-meta">
                <div>${song.artist ? this.escapeHtml(song.artist) : 'Sin autor'}</div>
                <div>Tonalidad: ${song.keyBase} • ${updatedDate}</div>
            </div>
            <div class="song-actions">
                <button class="btn-sm btn-primary" onclick="songManager.editSong('${song.id}')">Ver/Editar</button>
                <button class="btn-sm" onclick="songManager.duplicateSong('${song.id}')">Duplicar</button>
                <button class="btn-sm btn-danger" onclick="songManager.confirmDeleteSong('${song.id}')">Eliminar</button>
            </div>
        `;

        return card;
    }

    filterSongs(query) {
        const filteredSongs = this.songs.filter(song => 
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            (song.artist && song.artist.toLowerCase().includes(query.toLowerCase()))
        );

        const grid = document.getElementById('songs-grid');
        grid.innerHTML = '';

        if (filteredSongs.length === 0 && query) {
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #718096; padding: 2rem;">No se encontraron canciones que coincidan con la búsqueda.</div>';
        } else {
            filteredSongs.forEach(song => {
                const card = this.createSongCard(song);
                grid.appendChild(card);
            });
        }
    }

    // Modal Management
    // Modal Management
    openAddSongModal() {
        this.currentSong = null;
        this.currentTransposition = 0;
        this.editMode = false;
        
        document.getElementById('modal-title').textContent = 'Añadir Canción';
        document.getElementById('transpose-section').style.display = 'none';
        
        this.clearForm();
        this.addPair(); // Start with one pair
        document.getElementById('song-modal').classList.add('active');
        
        // Focus on title input
        setTimeout(() => {
            document.getElementById('song-title').focus();
        }, 100);
    }

    editSong(songId) {
        const song = this.songs.find(s => s.id === songId);
        if (!song) return;

        this.currentSong = song;
        this.currentTransposition = 0;
        this.editMode = true;

        document.getElementById('modal-title').textContent = 'Editar Canción';
        document.getElementById('transpose-section').style.display = 'block';

        this.populateForm(song);
        document.getElementById('song-modal').classList.add('active');
    }

    duplicateSong(songId) {
        const song = this.songs.find(s => s.id === songId);
        if (!song) return;

        const duplicatedSong = {
            ...song,
            id: this.generateId(),
            title: song.title + ' (Copia)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.songs.push(duplicatedSong);
        this.saveSongs();
        this.renderSongsList();
    }

    confirmDeleteSong(songId) {
        const song = this.songs.find(s => s.id === songId);
        if (!song) return;

        document.getElementById('delete-song-title').textContent = song.title;
        document.getElementById('delete-modal').classList.add('active');
        document.getElementById('delete-modal').dataset.songId = songId;
    }

    deleteSong() {
        const songId = document.getElementById('delete-modal').dataset.songId;
        this.songs = this.songs.filter(s => s.id !== songId);
        this.saveSongs();
        this.closeDeleteModal();
        this.renderSongsList();
    }

    closeSongModal() {
        document.getElementById('song-modal').classList.remove('active');
        this.clearForm();
    }

    closeDeleteModal() {
        document.getElementById('delete-modal').classList.remove('active');
    }

    // Form Management
    clearForm() {
        document.getElementById('song-title').value = '';
        document.getElementById('song-artist').value = '';
        document.getElementById('notation-type').value = 'latin';
        document.getElementById('base-key').value = 'Do';
        document.getElementById('pairs-container').innerHTML = '';
        this.updateKeySelector();
    }

    populateForm(song) {
        document.getElementById('song-title').value = song.title;
        document.getElementById('song-artist').value = song.artist || '';
        document.getElementById('notation-type').value = song.notation;
        
        this.updateKeySelector();
        document.getElementById('base-key').value = song.keyBase;
        
        // Populate pairs
        document.getElementById('pairs-container').innerHTML = '';
        song.pairs.forEach(pair => {
            this.addPair(pair.acordes, pair.letra);
        });

        this.updateTransposeControls();
    }

    populateKeySelectors() {
        this.updateKeySelector();
    }

    updateKeySelector() {
        const notation = document.getElementById('notation-type').value;
        const keySelect = document.getElementById('base-key');
        const keys = notation === 'latin' ? this.latinKeys : this.angloKeys;
        
        keySelect.innerHTML = '';
        keys.forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            keySelect.appendChild(option);
        });
    }

    updateTransposeControls() {
        if (!this.editMode || !this.currentSong) return;

        const notation = document.getElementById('notation-type').value;
        const baseKey = this.currentSong.keyBase;
        const currentKey = this.transposeKey(baseKey, this.currentTransposition, notation);
        
        document.getElementById('current-key').textContent = currentKey;
    }

    // Pair Management
    addPair(chords = '', lyrics = '') {
        const container = document.getElementById('pairs-container');
        const pairIndex = container.children.length;
        
        const pairElement = document.createElement('div');
        pairElement.className = 'pair-item';
        pairElement.dataset.index = pairIndex;
        
        pairElement.innerHTML = `
            <div class="pair-header">
                <span class="pair-label">Par ${pairIndex + 1}</span>
                <div class="pair-actions">
                    <button type="button" class="btn-xs" onclick="songManager.duplicatePair(${pairIndex})">Duplicar</button>
                    <button type="button" class="btn-xs" onclick="songManager.removePair(${pairIndex})">Eliminar</button>
                </div>
            </div>
            <textarea class="chord-input" placeholder="Acordes (ej: Do    Sol    Lam   Fa)" rows="2">${this.escapeHtml(chords)}</textarea>
            <textarea class="lyric-input" placeholder="Letra de la canción" rows="2">${this.escapeHtml(lyrics)}</textarea>
        `;

        container.appendChild(pairElement);
        this.updatePairLabels();

        // Focus on new pair if it's empty
        if (!chords && !lyrics) {
            const chordInput = pairElement.querySelector('.chord-input');
            setTimeout(() => chordInput.focus(), 50);
        }
    }

    duplicatePair(index) {
        const container = document.getElementById('pairs-container');
        const pairElement = container.children[index];
        
        if (!pairElement) return;

        const chords = pairElement.querySelector('.chord-input').value;
        const lyrics = pairElement.querySelector('.lyric-input').value;
        
        this.addPair(chords, lyrics);
    }

    removePair(index) {
        const container = document.getElementById('pairs-container');
        const pairElement = container.children[index];
        
        if (!pairElement) return;
        if (container.children.length === 1) {
            alert('Debe haber al menos un par de acordes/letra');
            return;
        }

        pairElement.remove();
        this.updatePairLabels();
    }

    updatePairLabels() {
        const container = document.getElementById('pairs-container');
        Array.from(container.children).forEach((pair, index) => {
            pair.dataset.index = index;
            pair.querySelector('.pair-label').textContent = `Par ${index + 1}`;
            
            // Update onclick handlers
            const duplicateBtn = pair.querySelector('.pair-actions .btn-xs:first-child');
            const removeBtn = pair.querySelector('.pair-actions .btn-xs:last-child');
            
            duplicateBtn.onclick = () => this.duplicatePair(index);
            removeBtn.onclick = () => this.removePair(index);
        });
    }

    // Save/Load Operations
    saveSong() {
        const title = document.getElementById('song-title').value.trim();
        const artist = document.getElementById('song-artist').value.trim();
        const notation = document.getElementById('notation-type').value;
        const keyBase = document.getElementById('base-key').value;

        // Validation
        if (!title) {
            alert('El título es obligatorio');
            document.getElementById('song-title').focus();
            return;
        }

        // Get pairs
        const pairs = [];
        const pairElements = document.getElementById('pairs-container').children;
        
        for (let pairElement of pairElements) {
            const chords = pairElement.querySelector('.chord-input').value;
            const lyrics = pairElement.querySelector('.lyric-input').value;
            pairs.push({ acordes: chords, letra: lyrics });
        }

        if (pairs.length === 0) {
            alert('Debe haber al menos un par de acordes/letra');
            return;
        }

        // Create or update song
        const now = new Date().toISOString();
        const songData = {
            title,
            artist: artist || null,
            notation,
            keyBase,
            pairs
        };

        if (this.currentSong) {
            // Update existing song
            const song = this.songs.find(s => s.id === this.currentSong.id);
            Object.assign(song, songData, { updatedAt: now });
        } else {
            // Create new song
            const newSong = {
                id: this.generateId(),
                ...songData,
                createdAt: now,
                updatedAt: now
            };
            this.songs.push(newSong);
        }

        this.saveSongs();
        this.closeSongModal();
        this.renderSongsList();
    }

    // Transposition Logic
    transpose(semitones) {
        this.currentTransposition += semitones;
        this.updateTransposeControls();
        this.applyTransposition();
    }

    resetToBaseKey() {
        this.currentTransposition = 0;
        this.updateTransposeControls();
        this.applyTransposition();
    }

    applyTransposition() {
        if (!this.editMode || !this.currentSong) return;

        const notation = document.getElementById('notation-type').value;
        const pairElements = document.getElementById('pairs-container').children;

        for (let pairElement of pairElements) {
            const chordInput = pairElement.querySelector('.chord-input');
            const originalIndex = parseInt(pairElement.dataset.index);
            const originalChords = this.currentSong.pairs[originalIndex]?.acordes || '';
            
            if (originalChords) {
                const transposedChords = this.transposeChordLine(originalChords, this.currentTransposition, notation);
                chordInput.value = transposedChords;
            }
        }
    }

    transposeChordLine(chordLine, semitones, notation) {
        if (semitones === 0) return chordLine;

        // Regular expression to match chords
        const chordRegex = /\b([A-G][#b]?)(m|maj|sus|add|dim|aug|\d|°|ø|\+)*(\/?([A-G][#b]?))?\b/g;
        
        return chordLine.replace(chordRegex, (match, root, suffix, slashPart, bassNote) => {
            let transposedRoot = this.transposeKey(root, semitones, notation);
            let result = transposedRoot + (suffix || '');
            
            if (slashPart && bassNote) {
                let transposedBass = this.transposeKey(bassNote, semitones, notation);
                result += '/' + transposedBass;
            }
            
            return result;
        });
    }

    transposeKey(key, semitones, notation) {
        // Convert to standard format first
        const standardKey = this.convertToStandard(key, notation);
        if (standardKey === null) return key;

        // Get the key array based on notation and direction
        let keyArray;
        if (notation === 'latin') {
            keyArray = semitones >= 0 ? this.latinKeys : this.latinFlats;
        } else {
            keyArray = semitones >= 0 ? this.angloKeys : this.angloFlats;
        }

        // Find current position
        const currentIndex = keyArray.indexOf(standardKey);
        if (currentIndex === -1) return key;

        // Calculate new position
        const newIndex = (currentIndex + semitones + 12) % 12;
        return keyArray[newIndex];
    }

    convertToStandard(key, notation) {
        // Convert various key representations to standard format
        const keyMaps = {
            latin: {
                'Do': 'Do', 'Do#': 'Do#', 'Reb': 'Do#',
                'Re': 'Re', 'Re#': 'Re#', 'Mib': 'Re#',
                'Mi': 'Mi',
                'Fa': 'Fa', 'Fa#': 'Fa#', 'Solb': 'Fa#',
                'Sol': 'Sol', 'Sol#': 'Sol#', 'Lab': 'Sol#',
                'La': 'La', 'La#': 'La#', 'Sib': 'La#',
                'Si': 'Si'
            },
            anglo: {
                'C': 'C', 'C#': 'C#', 'Db': 'C#',
                'D': 'D', 'D#': 'D#', 'Eb': 'D#',
                'E': 'E',
                'F': 'F', 'F#': 'F#', 'Gb': 'F#',
                'G': 'G', 'G#': 'G#', 'Ab': 'G#',
                'A': 'A', 'A#': 'A#', 'Bb': 'A#',
                'B': 'B'
            }
        };

        return keyMaps[notation][key] || null;
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
const songManager = new SongManager();

// Export for debugging
window.songManager = songManager;
