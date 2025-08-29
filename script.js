// Gestor Avanzado de Canciones - Betania Music
class AdvancedSongManager {
    constructor() {
        this.songs = this.loadSongs();
        this.currentRoute = 'canciones';
        this.currentSong = null;
        this.currentSongId = null;
        this.currentTransposition = 0;
        this.unsavedChanges = false;
        this.autoSaveInterval = null;
        
        // Key mappings
        this.latinKeys = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
        this.angloKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.latinFlats = ['Do', 'Reb', 'Re', 'Mib', 'Mi', 'Fa', 'Solb', 'Sol', 'Lab', 'La', 'Sib', 'Si'];
        this.angloFlats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        
        // Section templates
        this.sectionTemplates = [
            'Intro', 'Verso 1', 'Pre-Coro', 'Coro', 'Verso 2', 
            'Puente', 'Solo', 'Coro Final', 'Outro'
        ];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initRouter();
        this.renderCurrentView();
        this.startAutoSave();
    }

    // Router System
    initRouter() {
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state) {
                this.navigateToRoute(e.state.route, e.state.params, false);
            }
        });
        
        // Initial route from URL hash
        const hash = window.location.hash.slice(1);
        if (hash) {
            const [route, ...params] = hash.split('/');
            this.navigateToRoute(route, params, false);
        }
    }

    navigateToRoute(route, params = [], pushState = true) {
        // Check for unsaved changes
        if (this.unsavedChanges && this.currentRoute === 'edicion') {
            if (!confirm('Tienes cambios sin guardar. ¿Quieres continuar sin guardar?')) {
                return;
            }
        }

        this.currentRoute = route;
        
        // Update URL
        const url = params.length > 0 ? `#${route}/${params.join('/')}` : `#${route}`;
        if (pushState) {
            window.history.pushState({ route, params }, '', url);
        }
        
        // Update navigation
        this.updateNavigation();
        
        // Handle specific routes
        switch (route) {
            case 'canciones':
                if (params[0]) {
                    this.showSongReader(params[0]);
                } else {
                    this.showSongsList();
                }
                break;
            case 'edicion':
                if (params[0] === 'nueva') {
                    this.showEditor();
                } else if (params[0]) {
                    this.showEditor(params[0]);
                } else {
                    this.showEditor();
                }
                break;
            case 'configuracion':
                this.showConfiguration();
                break;
            default:
                this.showSongsList();
        }
    }

    updateNavigation() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.route === this.currentRoute || 
                (this.currentRoute.includes('canciones') && tab.dataset.route === 'canciones') ||
                (this.currentRoute.includes('edicion') && tab.dataset.route === 'edicion')) {
                tab.classList.add('active');
            }
        });
    }

    renderCurrentView() {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show current view
        let viewId = 'view-canciones';
        if (this.currentRoute.includes('edicion')) {
            viewId = 'view-edicion';
        } else if (this.currentRoute.includes('configuracion')) {
            viewId = 'view-configuracion';
        } else if (this.currentSongId) {
            viewId = 'view-song-reader';
        }
        
        document.getElementById(viewId).classList.add('active');
    }

    // Event Bindings
    bindEvents() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.navigateToRoute(tab.dataset.route);
            });
        });

        // Songs list events
        document.getElementById('btn-add-song').addEventListener('click', () => {
            this.navigateToRoute('edicion', ['nueva']);
        });

        document.getElementById('search-box').addEventListener('input', (e) => {
            this.filterSongs(e.target.value);
        });

        // Reader events
        document.getElementById('btn-back-to-list').addEventListener('click', () => {
            this.navigateToRoute('canciones');
        });

        document.getElementById('btn-edit-song').addEventListener('click', () => {
            if (this.currentSongId) {
                this.navigateToRoute('edicion', [this.currentSongId]);
            }
        });

        // Reader transpose controls
        document.getElementById('btn-transpose-down-reader').addEventListener('click', () => {
            this.transposeReader(-1);
        });

        document.getElementById('btn-transpose-up-reader').addEventListener('click', () => {
            this.transposeReader(1);
        });

        document.getElementById('btn-reset-key-reader').addEventListener('click', () => {
            this.resetReaderKey();
        });

        document.getElementById('notation-reader').addEventListener('change', () => {
            this.updateReaderNotation();
        });

        // Editor events
        document.getElementById('btn-back-from-editor').addEventListener('click', () => {
            this.navigateToRoute('canciones');
        });

        document.getElementById('btn-save-song').addEventListener('click', () => {
            this.saveSong();
        });

        document.getElementById('song-title-editor').addEventListener('input', () => {
            this.markUnsaved();
        });

        document.getElementById('btn-add-section').addEventListener('click', () => {
            this.addSection();
        });

        document.getElementById('btn-add-pair-editor').addEventListener('click', () => {
            this.addPairToCurrentSection();
        });

        // Mass paste events
        document.getElementById('btn-parse-content').addEventListener('click', () => {
            this.parseContent();
        });

        document.getElementById('btn-clear-paste').addEventListener('click', () => {
            document.getElementById('mass-paste-area').value = '';
        });

        // Import/Export
        document.getElementById('btn-import-json').addEventListener('click', () => {
            this.importJSON();
        });

        document.getElementById('btn-export-json').addEventListener('click', () => {
            this.exportJSON();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Auto-resize textareas
        document.addEventListener('input', (e) => {
            if (e.target.matches('.chord-input, .lyric-input')) {
                this.autoResizeTextarea(e.target);
                this.markUnsaved();
            }
        });
    }

    // Data Management
    loadSongs() {
        const stored = localStorage.getItem('songs_v2');
        return stored ? JSON.parse(stored) : [];
    }

    saveSongs() {
        localStorage.setItem('songs_v2', JSON.stringify(this.songs));
    }

    generateId() {
        return 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Auto-save functionality
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.unsavedChanges && this.currentRoute === 'edicion') {
                this.saveSong(true); // Silent save
            }
        }, 30000); // Auto-save every 30 seconds
    }

    markUnsaved() {
        this.unsavedChanges = true;
        const indicator = document.getElementById('save-indicator');
        if (indicator) {
            indicator.textContent = 'Cambios sin guardar';
            indicator.classList.add('unsaved');
        }
    }

    markSaved() {
        this.unsavedChanges = false;
        const indicator = document.getElementById('save-indicator');
        if (indicator) {
            indicator.textContent = 'Guardado';
            indicator.classList.remove('unsaved');
        }
    }

    // Songs List View
    showSongsList() {
        this.currentSongId = null;
        this.renderCurrentView();
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
                <button class="btn-sm btn-primary" onclick="songManager.viewSong('${song.id}')">Ver</button>
                <button class="btn-sm" onclick="songManager.editSong('${song.id}')">Editar</button>
                <button class="btn-sm" onclick="songManager.duplicateSong('${song.id}')">Duplicar</button>
                <button class="btn-sm btn-danger" onclick="songManager.deleteSong('${song.id}')">Eliminar</button>
            </div>
        `;

        // Add click to view
        card.addEventListener('click', (e) => {
            if (!e.target.matches('button')) {
                this.viewSong(song.id);
            }
        });

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
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--gray-500); padding: 2rem;">No se encontraron canciones que coincidan con la búsqueda.</div>';
        } else {
            filteredSongs.forEach(song => {
                const card = this.createSongCard(song);
                grid.appendChild(card);
            });
        }
    }

    // Song Actions
    viewSong(songId) {
        this.navigateToRoute('canciones', [songId]);
    }

    editSong(songId) {
        this.navigateToRoute('edicion', [songId]);
    }

    duplicateSong(songId) {
        const song = this.songs.find(s => s.id === songId);
        if (!song) return;

        const duplicatedSong = {
            ...JSON.parse(JSON.stringify(song)),
            id: this.generateId(),
            title: song.title + ' (Copia)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.songs.push(duplicatedSong);
        this.saveSongs();
        this.renderSongsList();
    }

    deleteSong(songId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta canción?')) return;
        
        this.songs = this.songs.filter(s => s.id !== songId);
        this.saveSongs();
        this.renderSongsList();
    }

    // Song Reader View
    showSongReader(songId) {
        const song = this.songs.find(s => s.id === songId);
        if (!song) {
            this.navigateToRoute('canciones');
            return;
        }

        this.currentSong = song;
        this.currentSongId = songId;
        this.currentTransposition = 0;
        this.renderCurrentView();
        this.renderSongReader();
    }

    renderSongReader() {
        if (!this.currentSong) return;

        const song = this.currentSong;
        
        // Update header
        document.getElementById('reader-title').textContent = song.title;
        document.getElementById('reader-meta').textContent = 
            `${song.artist || 'Sin autor'} • Tonalidad base: ${song.keyBase}`;
        
        // Update controls
        document.getElementById('notation-reader').value = song.notation;
        this.updateReaderCurrentKey();
        
        // Render content
        this.renderSongContent();
    }

    renderSongContent() {
        const content = document.getElementById('song-content');
        content.innerHTML = '';

        this.currentSong.sections.forEach(section => {
            const sectionEl = document.createElement('div');
            sectionEl.className = 'section';
            
            const labelEl = document.createElement('div');
            labelEl.className = 'section-label';
            labelEl.textContent = section.label;
            sectionEl.appendChild(labelEl);

            section.pairs.forEach(pair => {
                const pairEl = document.createElement('div');
                pairEl.className = 'pair';
                
                if (pair.acordes && pair.acordes.trim()) {
                    const chordEl = document.createElement('div');
                    chordEl.className = 'chord-line';
                    chordEl.textContent = this.transposeChordLine(pair.acordes, this.currentTransposition);
                    pairEl.appendChild(chordEl);
                }
                
                if (pair.letra && pair.letra.trim()) {
                    const lyricEl = document.createElement('div');
                    lyricEl.className = 'lyric-line';
                    lyricEl.textContent = pair.letra;
                    pairEl.appendChild(lyricEl);
                }
                
                sectionEl.appendChild(pairEl);
            });

            content.appendChild(sectionEl);
        });
    }

    // Reader transpose controls
    transposeReader(semitones) {
        this.currentTransposition += semitones;
        this.updateReaderCurrentKey();
        this.renderSongContent();
    }

    resetReaderKey() {
        this.currentTransposition = 0;
        this.updateReaderCurrentKey();
        this.renderSongContent();
    }

    updateReaderCurrentKey() {
        const notation = document.getElementById('notation-reader').value;
        const baseKey = this.currentSong.keyBase;
        const currentKey = this.transposeKey(baseKey, this.currentTransposition, notation);
        document.getElementById('current-key-reader').textContent = currentKey;
    }

    updateReaderNotation() {
        this.updateReaderCurrentKey();
        this.renderSongContent();
    }

    // Editor View
    showEditor(songId = null) {
        if (songId) {
            const song = this.songs.find(s => s.id === songId);
            if (song) {
                this.currentSong = JSON.parse(JSON.stringify(song)); // Deep copy
                this.currentSongId = songId;
            } else {
                this.navigateToRoute('canciones');
                return;
            }
        } else {
            // New song
            this.currentSong = this.createNewSong();
            this.currentSongId = null;
        }

        this.currentTransposition = 0;
        this.unsavedChanges = false;
        this.renderCurrentView();
        this.renderEditor();
        this.markSaved();
    }

    createNewSong() {
        return {
            id: this.generateId(),
            title: '',
            artist: '',
            notation: 'latin',
            keyBase: 'Do',
            sections: [
                {
                    label: 'Verso 1',
                    pairs: [
                        { acordes: '', letra: '' }
                    ],
                    collapsed: false
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    renderEditor() {
        // Update title
        document.getElementById('song-title-editor').value = this.currentSong.title;
        
        // Render outline
        this.renderSectionsOutline();
        
        // Render editor content
        this.renderEditorContent();
        
        // Show/hide mass paste area for new songs
        const massContainer = document.getElementById('mass-paste-container');
        if (!this.currentSongId) {
            massContainer.style.display = 'block';
        } else {
            massContainer.style.display = 'none';
        }
    }

    renderSectionsOutline() {
        const outline = document.getElementById('sections-outline');
        outline.innerHTML = '';

        this.currentSong.sections.forEach((section, index) => {
            const item = document.createElement('div');
            item.className = 'outline-item';
            item.textContent = section.label;
            item.onclick = () => this.scrollToSection(index);
            outline.appendChild(item);
        });
    }

    renderEditorContent() {
        const content = document.getElementById('editor-content');
        content.innerHTML = '';

        this.currentSong.sections.forEach((section, sectionIndex) => {
            const sectionEl = this.createSectionEditor(section, sectionIndex);
            content.appendChild(sectionEl);
        });
    }

    createSectionEditor(section, sectionIndex) {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'section-editor';
        sectionEl.dataset.sectionIndex = sectionIndex;

        const headerEl = document.createElement('div');
        headerEl.className = 'section-header-editor';
        
        const labelInput = document.createElement('input');
        labelInput.className = 'section-label-input';
        labelInput.value = section.label;
        labelInput.onchange = () => {
            this.currentSong.sections[sectionIndex].label = labelInput.value;
            this.renderSectionsOutline();
            this.markUnsaved();
        };
        
        const actionsEl = document.createElement('div');
        actionsEl.className = 'section-actions';
        actionsEl.innerHTML = `
            <button class="btn-xs" onclick="songManager.duplicateSection(${sectionIndex})">Duplicar</button>
            <button class="btn-xs" onclick="songManager.moveSection(${sectionIndex}, -1)">↑</button>
            <button class="btn-xs" onclick="songManager.moveSection(${sectionIndex}, 1)">↓</button>
            <button class="btn-xs" onclick="songManager.deleteSection(${sectionIndex})">Eliminar</button>
        `;
        
        headerEl.appendChild(labelInput);
        headerEl.appendChild(actionsEl);
        sectionEl.appendChild(headerEl);

        // Render pairs
        section.pairs.forEach((pair, pairIndex) => {
            const pairEl = this.createPairEditor(pair, sectionIndex, pairIndex);
            sectionEl.appendChild(pairEl);
        });

        // Add pair button
        const addPairBtn = document.createElement('button');
        addPairBtn.className = 'btn btn-sm';
        addPairBtn.textContent = '+ Añadir par';
        addPairBtn.style.width = '100%';
        addPairBtn.onclick = () => this.addPair(sectionIndex);
        sectionEl.appendChild(addPairBtn);

        return sectionEl;
    }

    createPairEditor(pair, sectionIndex, pairIndex) {
        const pairEl = document.createElement('div');
        pairEl.className = 'pair-editor';
        pairEl.dataset.pairIndex = pairIndex;

        const headerEl = document.createElement('div');
        headerEl.className = 'pair-header';
        
        const labelEl = document.createElement('span');
        labelEl.className = 'pair-label';
        labelEl.textContent = `Par ${pairIndex + 1}`;
        
        const actionsEl = document.createElement('div');
        actionsEl.innerHTML = `
            <button class="btn-xs" onclick="songManager.duplicatePair(${sectionIndex}, ${pairIndex})">Duplicar</button>
            <button class="btn-xs" onclick="songManager.movePair(${sectionIndex}, ${pairIndex}, -1)">↑</button>
            <button class="btn-xs" onclick="songManager.movePair(${sectionIndex}, ${pairIndex}, 1)">↓</button>
            <button class="btn-xs" onclick="songManager.deletePair(${sectionIndex}, ${pairIndex})">Eliminar</button>
        `;
        
        headerEl.appendChild(labelEl);
        headerEl.appendChild(actionsEl);
        pairEl.appendChild(headerEl);

        // Chord input
        const chordInput = document.createElement('textarea');
        chordInput.className = 'chord-input';
        chordInput.placeholder = 'Acordes (ej: Do    Sol    Lam   Fa)';
        chordInput.rows = 1;
        chordInput.value = pair.acordes;
        chordInput.oninput = () => {
            this.currentSong.sections[sectionIndex].pairs[pairIndex].acordes = chordInput.value;
            this.autoResizeTextarea(chordInput);
            this.markUnsaved();
        };

        // Lyric input
        const lyricInput = document.createElement('textarea');
        lyricInput.className = 'lyric-input';
        lyricInput.placeholder = 'Letra de la canción';
        lyricInput.rows = 1;
        lyricInput.value = pair.letra;
        lyricInput.oninput = () => {
            this.currentSong.sections[sectionIndex].pairs[pairIndex].letra = lyricInput.value;
            this.autoResizeTextarea(lyricInput);
            this.markUnsaved();
        };

        pairEl.appendChild(chordInput);
        pairEl.appendChild(lyricInput);

        // Auto-resize on load
        setTimeout(() => {
            this.autoResizeTextarea(chordInput);
            this.autoResizeTextarea(lyricInput);
        }, 10);

        return pairEl;
    }

    // Mass Paste Parser
    parseContent() {
        const content = document.getElementById('mass-paste-area').value.trim();
        if (!content) return;

        const lines = content.split('\n');
        const sections = [];
        let currentSection = {
            label: 'Sección 1',
            pairs: [],
            collapsed: false
        };

        let i = 0;
        while (i < lines.length) {
            const line = lines[i];
            
            // Skip empty lines
            if (!line.trim()) {
                i++;
                continue;
            }

            // Check if this looks like a chord line
            if (this.isChordLine(line)) {
                const chordLine = line;
                const lyricLine = (i + 1 < lines.length) ? lines[i + 1] : '';
                
                currentSection.pairs.push({
                    acordes: chordLine,
                    letra: lyricLine
                });
                
                i += 2; // Skip both lines
            } else {
                // This is likely just a lyric line
                currentSection.pairs.push({
                    acordes: '',
                    letra: line
                });
                
                i++;
            }
        }

        if (currentSection.pairs.length > 0) {
            sections.push(currentSection);
        }

        // Update current song with parsed sections
        this.currentSong.sections = sections.length > 0 ? sections : this.currentSong.sections;
        
        // Clear paste area and re-render
        document.getElementById('mass-paste-area').value = '';
        document.getElementById('mass-paste-container').style.display = 'none';
        this.renderEditor();
        this.markUnsaved();
    }

    isChordLine(line) {
        // Regex to detect chord patterns
        const chordPattern = /\b([A-G][#b]?(?:m|maj|sus|add|dim|aug|\d|°|ø|\+)*(?:\/[A-G][#b]?)?)\b/g;
        const matches = line.match(chordPattern);
        
        // Consider it a chord line if it has chords and mostly non-letters
        if (matches && matches.length > 0) {
            const chordChars = matches.join('').length;
            const totalChars = line.replace(/\s/g, '').length;
            return chordChars / totalChars > 0.3; // 30% or more chord content
        }
        
        return false;
    }

    // Section Management
    addSection() {
        const newSection = {
            label: `Sección ${this.currentSong.sections.length + 1}`,
            pairs: [{ acordes: '', letra: '' }],
            collapsed: false
        };
        
        this.currentSong.sections.push(newSection);
        this.renderEditor();
        this.markUnsaved();
    }

    duplicateSection(sectionIndex) {
        const section = this.currentSong.sections[sectionIndex];
        const duplicated = JSON.parse(JSON.stringify(section));
        duplicated.label += ' (Copia)';
        
        this.currentSong.sections.splice(sectionIndex + 1, 0, duplicated);
        this.renderEditor();
        this.markUnsaved();
    }

    moveSection(sectionIndex, direction) {
        const sections = this.currentSong.sections;
        const newIndex = sectionIndex + direction;
        
        if (newIndex < 0 || newIndex >= sections.length) return;
        
        [sections[sectionIndex], sections[newIndex]] = [sections[newIndex], sections[sectionIndex]];
        this.renderEditor();
        this.markUnsaved();
    }

    deleteSection(sectionIndex) {
        if (this.currentSong.sections.length === 1) {
            alert('Debe haber al menos una sección');
            return;
        }
        
        this.currentSong.sections.splice(sectionIndex, 1);
        this.renderEditor();
        this.markUnsaved();
    }

    // Pair Management
    addPair(sectionIndex) {
        this.currentSong.sections[sectionIndex].pairs.push({
            acordes: '',
            letra: ''
        });
        
        this.renderEditor();
        this.markUnsaved();
    }

    addPairToCurrentSection() {
        // Add to first section by default
        this.addPair(0);
    }

    duplicatePair(sectionIndex, pairIndex) {
        const pair = this.currentSong.sections[sectionIndex].pairs[pairIndex];
        const duplicated = JSON.parse(JSON.stringify(pair));
        
        this.currentSong.sections[sectionIndex].pairs.splice(pairIndex + 1, 0, duplicated);
        this.renderEditor();
        this.markUnsaved();
    }

    movePair(sectionIndex, pairIndex, direction) {
        const pairs = this.currentSong.sections[sectionIndex].pairs;
        const newIndex = pairIndex + direction;
        
        if (newIndex < 0 || newIndex >= pairs.length) return;
        
        [pairs[pairIndex], pairs[newIndex]] = [pairs[newIndex], pairs[pairIndex]];
        this.renderEditor();
        this.markUnsaved();
    }

    deletePair(sectionIndex, pairIndex) {
        const section = this.currentSong.sections[sectionIndex];
        if (section.pairs.length === 1) {
            alert('Debe haber al menos un par en cada sección');
            return;
        }
        
        section.pairs.splice(pairIndex, 1);
        this.renderEditor();
        this.markUnsaved();
    }

    // Save Song
    saveSong(silent = false) {
        // Get title from editor
        const title = document.getElementById('song-title-editor').value.trim();
        
        if (!title) {
            if (!silent) alert('El título es obligatorio');
            return;
        }

        this.currentSong.title = title;
        this.currentSong.updatedAt = new Date().toISOString();

        if (this.currentSongId) {
            // Update existing song
            const songIndex = this.songs.findIndex(s => s.id === this.currentSongId);
            if (songIndex !== -1) {
                this.songs[songIndex] = JSON.parse(JSON.stringify(this.currentSong));
            }
        } else {
            // Create new song
            this.currentSongId = this.currentSong.id;
            this.songs.push(JSON.parse(JSON.stringify(this.currentSong)));
        }

        this.saveSongs();
        this.markSaved();
        
        if (!silent) {
            // Update URL to reflect we're now editing an existing song
            this.navigateToRoute('edicion', [this.currentSongId], false);
        }
    }

    // Import/Export JSON
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
                    const data = JSON.parse(e.target.result);
                    
                    if (Array.isArray(data)) {
                        // Multiple songs
                        data.forEach(song => {
                            if (this.validateSongData(song)) {
                                song.id = this.generateId();
                                song.createdAt = new Date().toISOString();
                                song.updatedAt = new Date().toISOString();
                                this.songs.push(song);
                            }
                        });
                    } else if (this.validateSongData(data)) {
                        // Single song
                        data.id = this.generateId();
                        data.createdAt = new Date().toISOString();
                        data.updatedAt = new Date().toISOString();
                        this.songs.push(data);
                    }
                    
                    this.saveSongs();
                    this.renderEditor();
                    alert('Canciones importadas correctamente');
                } catch (error) {
                    alert('Error al importar el archivo JSON');
                    console.error(error);
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    exportJSON() {
        const data = this.currentSong ? [this.currentSong] : this.songs;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentSong ? 
            `${this.currentSong.title.replace(/[^a-zA-Z0-9]/g, '_')}.json` : 
            'betania_songs.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    validateSongData(data) {
        return data && 
               typeof data.title === 'string' &&
               Array.isArray(data.sections) &&
               data.sections.every(section => 
                   typeof section.label === 'string' &&
                   Array.isArray(section.pairs) &&
                   section.pairs.every(pair => 
                       typeof pair.acordes === 'string' && 
                       typeof pair.letra === 'string'
                   )
               );
    }

    // Configuration View
    showConfiguration() {
        this.renderCurrentView();
    }

    // Transposition Logic
    transposeChordLine(chordLine, semitones) {
        if (semitones === 0) return chordLine;

        const notation = this.currentSong.notation;
        const chordRegex = /\b([A-G][#b]?|Do[#b]?|Re[#b]?|Mi[#b]?|Fa[#b]?|Sol[#b]?|La[#b]?|Si[#b]?)(m|maj|sus|add|dim|aug|\d|°|ø|\+)*(\/?([A-G][#b]?|Do[#b]?|Re[#b]?|Mi[#b]?|Fa[#b]?|Sol[#b]?|La[#b]?|Si[#b]?))?\b/g;
        
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
    scrollToSection(sectionIndex) {
        const sectionEl = document.querySelector(`[data-section-index="${sectionIndex}"]`);
        if (sectionEl) {
            sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Highlight section temporarily
            sectionEl.classList.add('active');
            setTimeout(() => sectionEl.classList.remove('active'), 2000);
            
            // Update outline
            document.querySelectorAll('.outline-item').forEach((item, index) => {
                item.classList.toggle('active', index === sectionIndex);
            });
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(textarea.scrollHeight, 24) + 'px';
    }

    handleKeyboardShortcuts(e) {
        const isEditor = this.currentRoute === 'edicion';
        const isCtrl = e.ctrlKey || e.metaKey;
        
        if (isEditor) {
            if (isCtrl) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveSong();
                        break;
                    case 'd':
                        e.preventDefault();
                        // Duplicate current pair (implementation would need to track focus)
                        break;
                    case 'ArrowUp':
                        if (e.shiftKey) {
                            e.preventDefault();
                            // Move current pair up (implementation would need to track focus)
                        }
                        break;
                    case 'ArrowDown':
                        if (e.shiftKey) {
                            e.preventDefault();
                            // Move current pair down (implementation would need to track focus)
                        }
                        break;
                }
            }
            
            if (e.key === 'Enter' && !e.shiftKey && e.target.matches('.chord-input, .lyric-input')) {
                // Add new pair below current one
                e.preventDefault();
                const pairEl = e.target.closest('.pair-editor');
                const sectionEl = pairEl.closest('.section-editor');
                const sectionIndex = parseInt(sectionEl.dataset.sectionIndex);
                const pairIndex = parseInt(pairEl.dataset.pairIndex);
                
                // Add new pair
                this.currentSong.sections[sectionIndex].pairs.splice(pairIndex + 1, 0, {
                    acordes: '',
                    letra: ''
                });
                
                this.renderEditor();
                this.markUnsaved();
                
                // Focus on new pair
                setTimeout(() => {
                    const newPairEl = sectionEl.querySelector(`[data-pair-index="${pairIndex + 1}"] .chord-input`);
                    if (newPairEl) newPairEl.focus();
                }, 50);
            }
        }
        
        // Global shortcuts
        if (e.key === 'Escape') {
            if (this.currentRoute === 'edicion' && this.unsavedChanges) {
                if (confirm('¿Quieres salir sin guardar los cambios?')) {
                    this.navigateToRoute('canciones');
                }
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Cleanup
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
}

// Initialize the application
const songManager = new AdvancedSongManager();

// Export for debugging and global access
window.songManager = songManager;

// Cleanup on page unload
window.addEventListener('beforeunload', (e) => {
    if (songManager.unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
    songManager.destroy();
});

console.log('🎵 Betania Music Advanced - Sistema inicializado correctamente');
console.log('Atajos de teclado:');
console.log('- Ctrl/Cmd + S: Guardar canción');
console.log('- Enter: Nuevo par (en editor)');
console.log('- Ctrl/Cmd + D: Duplicar par');
console.log('- Escape: Salir del editor');
