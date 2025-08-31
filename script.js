// ===== CONFIGURACIÓN Y DATOS =====
const CONFIG = {
    keys: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    chordPatterns: [
        // Mayores
        'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
        // Menores
        'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm',
        // Séptimas
        'C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7',
        // Menores séptimas
        'Cm7', 'Dm7', 'Em7', 'Fm7', 'Gm7', 'Am7', 'Bm7',
        // Mayores séptimas
        'Cmaj7', 'Dmaj7', 'Emaj7', 'Fmaj7', 'Gmaj7', 'Amaj7', 'Bmaj7',
        // Suspendidos
        'Csus2', 'Csus4', 'Dsus2', 'Dsus4', 'Esus4', 'Fsus2', 'Fsus4', 
        'Gsus2', 'Gsus4', 'Asus2', 'Asus4', 'Bsus4'
    ]
};

// ===== ESTADO GLOBAL =====
let state = {
    currentRoute: 'canciones',
    songs: [],
    currentSong: null,
    editingSong: null,
    originalKey: 'C',
    currentKey: 'C',
    searchTerm: '',
    filteredSongs: []
};

// ===== ELEMENTOS DOM =====
const elements = {
    // Navegación
    navTabs: document.querySelectorAll('.nav-tab'),
    views: document.querySelectorAll('.view'),
    logoHome: document.getElementById('logo-home'),
    
    // Vista de canciones
    searchBox: document.getElementById('search-box'),
    songsGrid: document.getElementById('songs-grid'),
    emptyState: document.getElementById('empty-state'),
    btnAddSong: document.getElementById('btn-add-song'),
    
    // Lector de canciones
    btnBackToList: document.getElementById('btn-back-to-list'),
    readerTitle: document.getElementById('reader-title'),
    readerMeta: document.getElementById('reader-meta'),
    songContent: document.getElementById('song-content'),
    currentKeyReader: document.getElementById('current-key-reader'),
    btnTransposeUpReader: document.getElementById('btn-transpose-up-reader'),
    btnTransposeDownReader: document.getElementById('btn-transpose-down-reader'),
    btnResetKeyReader: document.getElementById('btn-reset-key-reader'),
    btnEditSong: document.getElementById('btn-edit-song'),
    
    // Editor
    btnBackFromEditor: document.getElementById('btn-back-from-editor'),
    songTitleEditor: document.getElementById('song-title-editor'),
    keyStatus: document.getElementById('key-status'),
    saveIndicator: document.getElementById('save-indicator'),
    btnSaveSong: document.getElementById('btn-save-song'),
    btnAddPairEditor: document.getElementById('btn-add-pair-editor'),
    editorContent: document.getElementById('editor-content'),
    sectionsOutline: document.getElementById('sections-outline'),
    btnAddSection: document.getElementById('btn-add-section'),
    btnTransposeUp: document.getElementById('btn-transpose-up'),
    btnTransposeDown: document.getElementById('btn-transpose-down'),
    btnResetTranspose: document.getElementById('btn-reset-transpose'),
    
    // Modal
    modalOverlay: document.getElementById('modal-overlay'),
    modalTitle: document.getElementById('modal-title'),
    modalContent: document.getElementById('modal-content'),
    modalFooter: document.getElementById('modal-footer'),
    modalClose: document.getElementById('modal-close')
};

// ===== FUNCIONES DE UTILIDAD =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function isMobile() {
    return window.innerWidth < 768;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveToStorage() {
    try {
        localStorage.setItem('betania-songs', JSON.stringify(state.songs));
        console.log('Canciones guardadas:', state.songs.length);
    } catch (error) {
        console.error('Error al guardar:', error);
    }
}

function loadFromStorage() {
    try {
        const saved = localStorage.getItem('betania-songs');
        if (saved) {
            state.songs = JSON.parse(saved);
            state.filteredSongs = [...state.songs];
        } else {
            loadDefaultSongs();
        }
    } catch (error) {
        console.error('Error al cargar:', error);
        loadDefaultSongs();
    }
}

function loadDefaultSongs() {
    state.songs = [
        {
            id: '1',
            title: 'Es Él',
            author: 'TTL',
            originalKey: 'C',
            sections: [
                {
                    id: 's1',
                    label: 'Intro',
                    pairs: [
                        { id: 'p1', chords: '', lyrics: 'ES ÉL' },
                        { id: 'p2', chords: '', lyrics: '' },
                        { id: 'p3', chords: 'F G    F G    Am G.  C', lyrics: '' },
                        { id: 'p4', chords: '', lyrics: 'ESTROFA (segunda vuelta)' },
                        { id: 'p5', chords: '', lyrics: '' },
                        { id: 'p6', chords: 'C', lyrics: 'Estoy preparando el camino' },
                        { id: 'p7', chords: '', lyrics: '' },
                        { id: 'p8', chords: 'Am       F(Bb)         C(Am)', lyrics: '' }
                    ]
                }
            ]
        }
    ];
    
    state.filteredSongs = [...state.songs];
}

// ===== FUNCIONES DE TRANSPOSICIÓN =====
function getKeyIndex(key) {
    // Normalizar la clave (remover modificadores como m, 7, etc.)
    const baseKey = key.replace(/[^A-G#b]/g, '');
    return CONFIG.keys.indexOf(baseKey);
}

function transposeKey(key, semitones) {
    const baseKey = key.replace(/[^A-G#b]/g, '');
    const modifier = key.replace(baseKey, '');
    
    const currentIndex = CONFIG.keys.indexOf(baseKey);
    if (currentIndex === -1) return key;
    
    let newIndex = (currentIndex + semitones) % 12;
    if (newIndex < 0) newIndex += 12;
    
    return CONFIG.keys[newIndex] + modifier;
}

function transposeChordLine(chordLine, semitones) {
    if (!chordLine || semitones === 0) return chordLine;
    
    let result = chordLine;
    
    // Ordenar patrones por longitud (más largos primero)
    const sortedPatterns = [...CONFIG.chordPatterns].sort((a, b) => b.length - a.length);
    
    sortedPatterns.forEach(pattern => {
        const regex = new RegExp(`\\b${pattern.replace(/[#b]/g, '[$&]?')}\\b`, 'g');
        result = result.replace(regex, (match) => {
            return transposeKey(match, semitones);
        });
    });
    
    return result;
}

function calculateTransposition(originalKey, currentKey) {
    const originalIndex = getKeyIndex(originalKey);
    const currentIndex = getKeyIndex(currentKey);
    
    if (originalIndex === -1 || currentIndex === -1) return 0;
    
    let semitones = currentIndex - originalIndex;
    if (semitones > 6) semitones -= 12;
    if (semitones < -6) semitones += 12;
    
    return semitones;
}

// ===== FUNCIONES DE NAVEGACIÓN =====
function navigateToRoute(route) {
    state.currentRoute = route;
    
    // Actualizar tabs activos
    elements.navTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.route === route) {
            tab.classList.add('active');
        }
    });
    
    // Mostrar vista correspondiente
    elements.views.forEach(view => {
        view.classList.remove('active');
    });
    
    const targetView = document.getElementById(`view-${route}`);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // Acciones específicas según la ruta
    if (route === 'canciones') {
        renderSongsList();
    }
}

function navigateToSongReader(songId) {
    const song = state.songs.find(s => s.id === songId);
    if (!song) return;
    
    state.currentSong = song;
    state.originalKey = song.originalKey || 'C';
    state.currentKey = state.originalKey;
    
    navigateToRoute('song-reader');
    renderSongReader();
}

function navigateToEditor(songId = null) {
    if (songId) {
        const song = state.songs.find(s => s.id === songId);
        state.editingSong = song ? JSON.parse(JSON.stringify(song)) : createEmptySong();
    } else {
        state.editingSong = createEmptySong();
    }
    
    navigateToRoute('edicion');
    renderEditor();
}

// ===== FUNCIONES DE RENDERIZADO =====
function renderSongsList() {
    if (!elements.songsGrid || !elements.emptyState) return;
    
    if (state.filteredSongs.length === 0) {
        elements.songsGrid.style.display = 'none';
        elements.emptyState.style.display = 'block';
        return;
    }
    
    elements.emptyState.style.display = 'none';
    elements.songsGrid.style.display = 'flex';
    
    elements.songsGrid.innerHTML = state.filteredSongs.map(song => `
        <div class="song-item" data-song-id="${song.id}">
            <div class="song-info">
                <div class="song-title">${escapeHtml(song.title)}</div>
                <div class="song-meta">${escapeHtml(song.author)} • ${song.originalKey}</div>
            </div>
            <div class="song-actions">
                <button class="action-btn edit-btn" data-song-id="${song.id}" title="Editar">
                    ✏️
                </button>
                <button class="action-btn delete-btn" data-song-id="${song.id}" title="Eliminar">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
    
    // Agregar event listeners
    elements.songsGrid.querySelectorAll('.song-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.song-actions')) {
                const songId = item.dataset.songId;
                navigateToSongReader(songId);
            }
        });
    });
    
    elements.songsGrid.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const songId = btn.dataset.songId;
            navigateToEditor(songId);
        });
    });
    
    elements.songsGrid.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const songId = btn.dataset.songId;
            confirmDeleteSong(songId);
        });
    });
}

function renderSongReader() {
    if (!state.currentSong || !elements.songContent) return;
    
    const song = state.currentSong;
    const semitones = calculateTransposition(state.originalKey, state.currentKey);
    
    // Actualizar header
    if (elements.readerTitle) {
        elements.readerTitle.textContent = song.title;
    }
    if (elements.readerMeta) {
        elements.readerMeta.textContent = `${song.author} • Tonalidad base: ${state.originalKey}`;
    }
    if (elements.currentKeyReader) {
        elements.currentKeyReader.textContent = state.currentKey;
    }
    
    // Renderizar contenido de la canción
    let contentHtml = '';
    
    song.sections.forEach(section => {
        contentHtml += `<div class="section">`;
        contentHtml += `<div class="section-label">${escapeHtml(section.label)}</div>`;
        
        section.pairs.forEach(pair => {
            if (pair.chords || pair.lyrics) {
                contentHtml += `<div class="pair">`;
                
                if (pair.chords.trim()) {
                    const transposedChords = transposeChordLine(pair.chords, semitones);
                    contentHtml += `<div class="chord-line">${escapeHtml(transposedChords)}</div>`;
                }
                
                if (pair.lyrics.trim()) {
                    contentHtml += `<div class="lyric-line">${escapeHtml(pair.lyrics)}</div>`;
                }
                
                contentHtml += `</div>`;
            }
        });
        
        contentHtml += `</div>`;
    });
    
    elements.songContent.innerHTML = contentHtml;
}

function renderEditor() {
    if (!state.editingSong) return;
    
    const song = state.editingSong;
    
    // Actualizar título
    if (elements.songTitleEditor) {
        elements.songTitleEditor.value = song.title || '';
    }
    
    // Actualizar key status
    if (elements.keyStatus) {
        elements.keyStatus.textContent = song.originalKey || 'C';
    }
    
    // Renderizar outline
    renderSectionsOutline();
    
    // Renderizar contenido del editor
    renderEditorContent();
}

function renderSectionsOutline() {
    if (!elements.sectionsOutline || !state.editingSong) return;
    
    const sections = state.editingSong.sections || [];
    
    elements.sectionsOutline.innerHTML = sections.map((section, index) => `
        <div class="outline-item" data-section-index="${index}">
            <span>${escapeHtml(section.label)}</span>
            <button class="btn-xs btn-danger" onclick="removeSection(${index})">×</button>
        </div>
    `).join('');
}

function renderEditorContent() {
    if (!elements.editorContent || !state.editingSong) return;
    
    const sections = state.editingSong.sections || [];
    
    elements.editorContent.innerHTML = sections.map((section, sectionIndex) => `
        <div class="section-editor" data-section-index="${sectionIndex}">
            <div class="section-header-editor">
                <input type="text" class="section-label-input" 
                       value="${escapeHtml(section.label)}" 
                       onchange="updateSectionLabel(${sectionIndex}, this.value)"
                       placeholder="Nombre de la sección">
                <div class="section-actions">
                    <button class="btn-xs" onclick="addPairToSection(${sectionIndex})">+ Par</button>
                    <button class="btn-xs btn-danger" onclick="removeSection(${sectionIndex})">×</button>
                </div>
            </div>
            
            <div class="pairs-container">
                ${section.pairs.map((pair, pairIndex) => `
                    <div class="pair-editor" data-pair-index="${pairIndex}">
                        <div class="pair-header">
                            <span class="pair-label">Par ${pairIndex + 1}</span>
                            <div class="pair-actions">
                                <button class="btn-xs btn-danger" onclick="removePair(${sectionIndex}, ${pairIndex})">×</button>
                            </div>
                        </div>
                        <textarea class="chord-input" 
                                  placeholder="Acordes (ej: C Am F G)"
                                  onchange="updatePair(${sectionIndex}, ${pairIndex}, 'chords', this.value)"
                                  >${escapeHtml(pair.chords || '')}</textarea>
                        <textarea class="lyric-input" 
                                  placeholder="Letra"
                                  onchange="updatePair(${sectionIndex}, ${pairIndex}, 'lyrics', this.value)"
                                  >${escapeHtml(pair.lyrics || '')}</textarea>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    // Auto-resize de textareas
    setupTextareaAutoResize();
}

function setupTextareaAutoResize() {
    document.querySelectorAll('.chord-input, .lyric-input').forEach(textarea => {
        textarea.addEventListener('input', autoResizeTextarea);
        autoResizeTextarea.call(textarea);
    });
}

function autoResizeTextarea() {
    this.style.height = 'auto';
    this.style.height = Math.max(40, this.scrollHeight) + 'px';
}

// ===== FUNCIONES DE DATOS =====
function createEmptySong() {
    return {
        id: generateId(),
        title: '',
        author: '',
        originalKey: 'C',
        sections: [
            {
                id: generateId(),
                label: 'Verso 1',
                pairs: [
                    { id: generateId(), chords: '', lyrics: '' }
                ]
            }
        ]
    };
}

function addSong(songData) {
    const song = {
        ...songData,
        id: songData.id || generateId(),
        originalKey: songData.originalKey || 'C'
    };
    
    state.songs.push(song);
    state.filteredSongs = [...state.songs];
    saveToStorage();
    renderSongsList();
    
    return song;
}

function updateSong(songId, songData) {
    const index = state.songs.findIndex(s => s.id === songId);
    if (index === -1) return null;
    
    state.songs[index] = { ...state.songs[index], ...songData };
    state.filteredSongs = [...state.songs];
    saveToStorage();
    renderSongsList();
    
    return state.songs[index];
}

function deleteSong(songId) {
    state.songs = state.songs.filter(s => s.id !== songId);
    state.filteredSongs = [...state.songs];
    saveToStorage();
    renderSongsList();
}

function searchSongs(term) {
    state.searchTerm = term.toLowerCase().trim();
    
    if (!state.searchTerm) {
        state.filteredSongs = [...state.songs];
    } else {
        state.filteredSongs = state.songs.filter(song =>
            song.title.toLowerCase().includes(state.searchTerm) ||
            song.author.toLowerCase().includes(state.searchTerm)
        );
    }
    
    renderSongsList();
}

// ===== FUNCIONES DEL EDITOR =====
function updateSectionLabel(sectionIndex, newLabel) {
    if (!state.editingSong || !state.editingSong.sections[sectionIndex]) return;
    
    state.editingSong.sections[sectionIndex].label = newLabel;
    markAsUnsaved();
    renderSectionsOutline();
}

function updatePair(sectionIndex, pairIndex, field, value) {
    if (!state.editingSong || 
        !state.editingSong.sections[sectionIndex] || 
        !state.editingSong.sections[sectionIndex].pairs[pairIndex]) return;
    
    state.editingSong.sections[sectionIndex].pairs[pairIndex][field] = value;
    markAsUnsaved();
}

function addSection() {
    if (!state.editingSong) return;
    
    const newSection = {
        id: generateId(),
        label: `Sección ${state.editingSong.sections.length + 1}`,
        pairs: [
            { id: generateId(), chords: '', lyrics: '' }
        ]
    };
    
    state.editingSong.sections.push(newSection);
    markAsUnsaved();
    renderEditor();
}

function removeSection(sectionIndex) {
    if (!state.editingSong || !confirm('¿Eliminar esta sección?')) return;
    
    state.editingSong.sections.splice(sectionIndex, 1);
    markAsUnsaved();
    renderEditor();
}

function addPairToSection(sectionIndex) {
    if (!state.editingSong || !state.editingSong.sections[sectionIndex]) return;
    
    const newPair = { id: generateId(), chords: '', lyrics: '' };
    state.editingSong.sections[sectionIndex].pairs.push(newPair);
    markAsUnsaved();
    renderEditorContent();
}

function removePair(sectionIndex, pairIndex) {
    if (!state.editingSong || 
        !state.editingSong.sections[sectionIndex] ||
        !confirm('¿Eliminar este par?')) return;
    
    state.editingSong.sections[sectionIndex].pairs.splice(pairIndex, 1);
    markAsUnsaved();
    renderEditorContent();
}

function markAsUnsaved() {
    if (elements.saveIndicator) {
        elements.saveIndicator.textContent = 'Sin guardar';
        elements.saveIndicator.classList.add('unsaved');
    }
}

function markAsSaved() {
    if (elements.saveIndicator) {
        elements.saveIndicator.textContent = 'Guardado';
        elements.saveIndicator.classList.remove('unsaved');
    }
}

// ===== FUNCIONES DE MODAL =====
function showModal(title, content, buttons = []) {
    if (!elements.modalOverlay) return;
    
    elements.modalTitle.textContent = title;
    elements.modalContent.innerHTML = content;
    
    elements.modalFooter.innerHTML = buttons.map(btn => 
        `<button class="btn ${btn.class || ''}" onclick="${btn.onclick}">${btn.text}</button>`
    ).join('');
    
    elements.modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    if (elements.modalOverlay) {
        elements.modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function confirmDeleteSong(songId) {
    const song = state.songs.find(s => s.id === songId);
    if (!song) return;
    
    showModal(
        'Confirmar eliminación',
        `<p>¿Estás seguro de que quieres eliminar "<strong>${escapeHtml(song.title)}</strong>"?</p>
         <p style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.5rem;">Esta acción no se puede deshacer.</p>`,
        [
            { text: 'Cancelar', onclick: 'hideModal()' },
            { text: 'Eliminar', class: 'btn-danger', onclick: `deleteSongConfirmed('${songId}')` }
        ]
    );
}

function deleteSongConfirmed(songId) {
    deleteSong(songId);
    hideModal();
}

function showAddSongModal() {
    showModal(
        'Nueva canción',
        `<div class="form-group">
            <label class="form-label">Título de la canción</label>
            <input type="text" class="form-input" id="new-song-title" placeholder="Ej: Amazing Grace">
        </div>
        <div class="form-group">
            <label class="form-label">Autor</label>
            <input type="text" class="form-input" id="new-song-author" placeholder="Ej: Chris Tomlin">
        </div>
        <div class="form-group">
            <label class="form-label">Tonalidad original</label>
            <select class="form-select" id="new-song-key">
                ${CONFIG.keys.map(key => `<option value="${key}">${key}</option>`).join('')}
            </select>
        </div>`,
        [
            { text: 'Cancelar', onclick: 'hideModal()' },
            { text: 'Crear canción', class: 'btn-primary', onclick: 'createNewSong()' }
        ]
    );
    
    // Focus en el primer campo
    setTimeout(() => {
        document.getElementById('new-song-title')?.focus();
    }, 100);
}

function createNewSong() {
    const title = document.getElementById('new-song-title')?.value.trim();
    const author = document.getElementById('new-song-author')?.value.trim();
    const key = document.getElementById('new-song-key')?.value || 'C';
    
    if (!title) {
        alert('El título es requerido');
        return;
    }
    
    const newSong = {
        ...createEmptySong(),
        title,
        author,
        originalKey: key
    };
    
    addSong(newSong);
    hideModal();
    navigateToEditor(newSong.id);
}

function saveSong() {
    if (!state.editingSong) return;
    
    const title = elements.songTitleEditor?.value.trim();
    if (!title) {
        alert('El título es requerido');
        return;
    }
    
    state.editingSong.title = title;
    
    // Verificar si es una canción nueva o actualización
    const existingIndex = state.songs.findIndex(s => s.id === state.editingSong.id);
    
    if (existingIndex === -1) {
        addSong(state.editingSong);
    } else {
        updateSong(state.editingSong.id, state.editingSong);
    }
    
    markAsSaved();
}

// ===== FUNCIONES DE TRANSPOSICIÓN EN EDITOR =====
function transposeEditorSong(semitones) {
    if (!state.editingSong) return;
    
    state.editingSong.sections.forEach(section => {
        section.pairs.forEach(pair => {
            if (pair.chords) {
                pair.chords = transposeChordLine(pair.chords, semitones);
            }
        });
    });
    
    // Actualizar key
    const currentKeyIndex = getKeyIndex(state.editingSong.originalKey);
    if (currentKeyIndex !== -1) {
        let newKeyIndex = (currentKeyIndex + semitones) % 12;
        if (newKeyIndex < 0) newKeyIndex += 12;
        state.editingSong.originalKey = CONFIG.keys[newKeyIndex];
    }
    
    markAsUnsaved();
    renderEditor();
}

// ===== UTILIDADES =====
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== EVENT LISTENERS PRINCIPALES =====
function setupEventListeners() {
    // Navegación por tabs
    elements.navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const route = tab.dataset.route;
            navigateToRoute(route);
        });
    });
    
    // Logo home
    if (elements.logoHome) {
        elements.logoHome.addEventListener('click', () => {
            navigateToRoute('canciones');
        });
    }
    
    // Búsqueda con debounce
    if (elements.searchBox) {
        const debouncedSearch = debounce((term) => {
            searchSongs(term);
        }, 300);
        
        elements.searchBox.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }
    
    // Botones principales
    if (elements.btnAddSong) {
        elements.btnAddSong.addEventListener('click', showAddSongModal);
    }
    
    if (elements.btnBackToList) {
        elements.btnBackToList.addEventListener('click', () => {
            navigateToRoute('canciones');
        });
    }
    
    if (elements.btnBackFromEditor) {
        elements.btnBackFromEditor.addEventListener('click', () => {
            navigateToRoute('canciones');
        });
    }
    
    // Controles de transposición en lector
    if (elements.btnTransposeUpReader) {
        elements.btnTransposeUpReader.addEventListener('click', () => {
            const currentIndex = CONFIG.keys.indexOf(state.currentKey);
            if (currentIndex !== -1) {
                state.currentKey = CONFIG.keys[(currentIndex + 1) % 12];
                renderSongReader();
            }
        });
    }
    
    if (elements.btnTransposeDownReader) {
        elements.btnTransposeDownReader.addEventListener('click', () => {
            const currentIndex = CONFIG.keys.indexOf(state.currentKey);
            if (currentIndex !== -1) {
                let newIndex = currentIndex - 1;
                if (newIndex < 0) newIndex = 11;
                state.currentKey = CONFIG.keys[newIndex];
                renderSongReader();
            }
        });
    }
    
    if (elements.btnResetKeyReader) {
        elements.btnResetKeyReader.addEventListener('click', () => {
            state.currentKey = state.originalKey;
            renderSongReader();
        });
    }
    
    if (elements.btnEditSong) {
        elements.btnEditSong.addEventListener('click', () => {
            if (state.currentSong) {
                navigateToEditor(state.currentSong.id);
            }
        });
    }
    
    // Controles del editor
    if (elements.btnSaveSong) {
        elements.btnSaveSong.addEventListener('click', saveSong);
    }
    
    if (elements.btnAddSection) {
        elements.btnAddSection.addEventListener('click', addSection);
    }
    
    if (elements.btnAddPairEditor) {
        elements.btnAddPairEditor.addEventListener('click', () => {
            if (state.editingSong && state.editingSong.sections.length > 0) {
                addPairToSection(0); // Agregar al primer sección por defecto
            }
        });
    }
    
    // Transposición en editor
    if (elements.btnTransposeUp) {
        elements.btnTransposeUp.addEventListener('click', () => {
            transposeEditorSong(1);
        });
    }
    
    if (elements.btnTransposeDown) {
        elements.btnTransposeDown.addEventListener('click', () => {
            transposeEditorSong(-1);
        });
    }
    
    if (elements.btnResetTranspose) {
        elements.btnResetTranspose.addEventListener('click', () => {
            // Restablecer a tonalidad original
            if (state.editingSong) {
                // Recargar la canción original
                const originalSong = state.songs.find(s => s.id === state.editingSong.id);
                if (originalSong) {
                    state.editingSong = JSON.parse(JSON.stringify(originalSong));
                    renderEditor();
                }
            }
        });
    }
    
    // Modal
    if (elements.modalClose) {
        elements.modalClose.addEventListener('click', hideModal);
    }
    
    if (elements.modalOverlay) {
        elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === elements.modalOverlay) {
                hideModal();
            }
        });
    }
    
    // Teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal();
        }
    });
    
    // Responsive
    window.addEventListener('resize', handleResize);
}

function handleResize() {
    // Manejar cambios de tamaño de ventana
    if (isMobile()) {
        // Comportamiento móvil
    } else {
        // Comportamiento desktop
    }
}

// ===== FUNCIONES GLOBALES PARA ONCLICK =====
window.updateSectionLabel = updateSectionLabel;
window.updatePair = updatePair;
window.addSection = addSection;
window.removeSection = removeSection;
window.addPairToSection = addPairToSection;
window.removePair = removePair;
window.hideModal = hideModal;
window.deleteSongConfirmed = deleteSongConfirmed;
window.createNewSong = createNewSong;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando Betania Music...');
    
    // Cargar datos
    loadFromStorage();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Navegación inicial
    navigateToRoute('canciones');
    
    console.log('Aplicación inicializada correctamente');
});

// ===== EXPOSICIÓN GLOBAL PARA DEBUGGING =====
window.BetaniaMusic = {
    state,
    CONFIG,
    navigateToRoute,
    navigateToSongReader,
    navigateToEditor,
    searchSongs,
    addSong,
    updateSong,
    deleteSong
};
