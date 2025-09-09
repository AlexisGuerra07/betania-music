/**
 * ==========================================
 * 🎵 BETANIA MUSIC - SISTEMA LIMPIO
 * SIN CONFLICTOS - ARCHIVO ÚNICO
 * ==========================================
 */

// ==========================================
// CONFIGURACIÓN GLOBAL
// ==========================================

const STORAGE_KEY = 'betania_music_songs';
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_TO_SHARP = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
};

// ==========================================
// VARIABLES GLOBALES
// ==========================================

let allSongs = [];
let currentSong = null;
let currentKey = 'C';
let originalKey = 'C';
let editingSong = null;
let songSections = [];

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    showLoadingScreen();
    setTimeout(() => {
        initializeApp();
        hideLoadingScreen();
    }, 1500);
});

function showLoadingScreen() {
    document.getElementById('loadingScreen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
}

function hideLoadingScreen() {
    document.getElementById('loadingScreen').classList.add('fade-out');
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    }, 500);
}

function initializeApp() {
    loadSongs();
    setupEventListeners();
    renderSongsList();
    
    // Añadir canción de ejemplo si no hay ninguna
    if (allSongs.length === 0) {
        addExampleSong();
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    // Navegación
    document.getElementById('homeBtn').addEventListener('click', () => showView('home'));
    document.getElementById('addBtn').addEventListener('click', () => showAddView());
    document.getElementById('addNewSongBtn').addEventListener('click', () => showAddView());
    
    // Formulario
    document.getElementById('saveBtn').addEventListener('click', saveSong);
    document.getElementById('cancelBtn').addEventListener('click', () => showView('home'));
    document.getElementById('addSectionBtn').addEventListener('click', addNewSection);
    
    // Búsqueda
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Vista de canción
    document.getElementById('backBtn').addEventListener('click', () => showView('home'));
    document.getElementById('editCurrentBtn').addEventListener('click', editCurrentSong);
    document.getElementById('keyUp').addEventListener('click', () => changeKey(1));
    document.getElementById('keyDown').addEventListener('click', () => changeKey(-1));
    document.getElementById('keyReset').addEventListener('click', resetKey);
    
    // Modales
    setupModalListeners();
}

function setupModalListeners() {
    // Modal Pegar Canción
    document.getElementById('pasteBtn').addEventListener('click', () => showModal('pasteModal'));
    document.getElementById('closePasteModal').addEventListener('click', () => hideModal('pasteModal'));
    document.getElementById('cancelPaste').addEventListener('click', () => hideModal('pasteModal'));
    document.getElementById('processPaste').addEventListener('click', processPastedSong);
    
    // Modal Re-analizar
    document.getElementById('reAnalyzeBtn').addEventListener('click', showReAnalyzeModal);
    document.getElementById('closeReAnalyzeModal').addEventListener('click', () => hideModal('reAnalyzeModal'));
    document.getElementById('cancelReAnalyze').addEventListener('click', () => hideModal('reAnalyzeModal'));
    document.getElementById('processReAnalyze').addEventListener('click', processReAnalysis);
    
    // Modal Eliminar
    document.getElementById('closeDeleteModal').addEventListener('click', () => hideModal('deleteModal'));
    document.getElementById('cancelDelete').addEventListener('click', () => hideModal('deleteModal'));
    
    // Cerrar modales al hacer clic en overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            hideModal(e.target.closest('.modal').id);
        });
    });
}

// ==========================================
// GESTIÓN DE VISTAS
// ==========================================

function showView(viewName) {
    // Ocultar todas las vistas
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Mostrar vista seleccionada
    document.getElementById(viewName + 'View').classList.add('active');
    
    // Actualizar navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (viewName === 'home') {
        document.getElementById('homeBtn').classList.add('active');
        renderSongsList();
    } else if (viewName === 'add') {
        document.getElementById('addBtn').classList.add('active');
    }
}

function showAddView() {
    clearForm();
    showView('add');
}

// ==========================================
// GESTIÓN DE CANCIONES
// ==========================================

function loadSongs() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            allSongs = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading songs:', e);
            allSongs = [];
        }
    }
}

function saveSongs() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allSongs));
        showToast('Canciones guardadas correctamente', 'success');
    } catch (e) {
        console.error('Error saving songs:', e);
        showToast('Error al guardar canciones', 'error');
    }
}

function saveSong() {
    const title = document.getElementById('songTitle').value.trim();
    const artist = document.getElementById('songArtist').value.trim();
    const key = document.getElementById('songKey').value;
    
    if (!title) {
        showToast('Por favor ingresa un título para la canción', 'error');
        return;
    }
    
    if (songSections.length === 0) {
        showToast('Añade al menos una sección a la canción', 'error');
        return;
    }
    
    const songData = {
        id: editingSong ? editingSong.id : Date.now(),
        title: title,
        artist: artist || 'Artista desconocido',
        key: key,
        sections: [...songSections],
        createdAt: editingSong ? editingSong.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (editingSong) {
        const index = allSongs.findIndex(song => song.id === editingSong.id);
        if (index !== -1) {
            allSongs[index] = songData;
            showToast('Canción actualizada correctamente', 'success');
        }
    } else {
        allSongs.push(songData);
        showToast('Canción guardada correctamente', 'success');
    }
    
    saveSongs();
    showView('home');
}

function editSong(songId) {
    const song = allSongs.find(s => s.id === songId);
    if (!song) return;
    
    editingSong = song;
    
    // Llenar formulario
    document.getElementById('songTitle').value = song.title;
    document.getElementById('songArtist').value = song.artist;
    document.getElementById('songKey').value = song.key;
    
    songSections = [...song.sections];
    
    // Actualizar interfaz
    document.getElementById('addTitle').textContent = '✏️ Editar Canción';
    document.getElementById('saveBtn').innerHTML = '💾 Actualizar Canción';
    document.getElementById('reAnalyzeBtn').classList.remove('hidden');
    
    renderSections();
    showView('add');
}

function deleteSong(songId) {
    const song = allSongs.find(s => s.id === songId);
    if (!song) return;
    
    document.getElementById('deleteSongTitle').textContent = song.title;
    document.getElementById('deleteSongArtist').textContent = song.artist;
    
    showModal('deleteModal');
    
    document.getElementById('confirmDelete').onclick = () => {
        allSongs = allSongs.filter(s => s.id !== songId);
        saveSongs();
        renderSongsList();
        hideModal('deleteModal');
        showToast('Canción eliminada', 'success');
    };
}

function clearForm() {
    document.getElementById('songTitle').value = '';
    document.getElementById('songArtist').value = '';
    document.getElementById('songKey').value = 'C';
    
    songSections = [];
    editingSong = null;
    
    document.getElementById('addTitle').textContent = '➕ Añadir Nueva Canción';
    document.getElementById('saveBtn').innerHTML = '💾 Guardar Canción';
    document.getElementById('reAnalyzeBtn').classList.add('hidden');
    
    renderSections();
}

// ==========================================
// RENDERIZADO
// ==========================================

function renderSongsList() {
    const container = document.getElementById('songsGrid');
    const emptyState = document.getElementById('emptyState');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filteredSongs = allSongs;
    if (searchTerm) {
        filteredSongs = allSongs.filter(song => 
            song.title.toLowerCase().includes(searchTerm) ||
            song.artist.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filteredSongs.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    container.innerHTML = filteredSongs.map(song => `
        <div class="song-card" data-song-id="${song.id}">
            <div class="song-card-header">
                <div class="song-info">
                    <h3 class="song-title">${escapeHtml(song.title)}</h3>
                    <p class="song-artist">${escapeHtml(song.artist)}</p>
                </div>
                <div class="song-key-badge">${song.key}</div>
            </div>
            
            <div class="song-card-content">
                <div class="song-sections-preview">
                    ${song.sections.slice(0, 2).map(section => 
                        `<span class="section-tag">${section.name}</span>`
                    ).join('')}
                    ${song.sections.length > 2 ? `<span class="section-tag more">+${song.sections.length - 2}</span>` : ''}
                </div>
            </div>
            
            <div class="song-card-actions">
                <button class="action-btn edit-btn" onclick="editSong(${song.id})" title="Editar">
                    ✏️
                </button>
                <button class="action-btn delete-btn" onclick="deleteSong(${song.id})" title="Eliminar">
                    🗑️
                </button>
                <button class="btn btn-primary view-btn" onclick="viewSong(${song.id})">
                    Ver Canción
                </button>
            </div>
        </div>
    `).join('');
}

function renderSections() {
    const container = document.getElementById('sectionsContainer');
    const noSectionsMsg = document.getElementById('noSectionsMsg');
    
    if (songSections.length === 0) {
        container.classList.add('hidden');
        noSectionsMsg.classList.remove('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    noSectionsMsg.classList.add('hidden');
    
    container.innerHTML = songSections.map((section, index) => `
        <div class="section-item" data-index="${index}">
            <div class="section-header">
                <input type="text" class="section-name-input" value="${escapeHtml(section.name)}" 
                       onchange="updateSectionName(${index}, this.value)">
                <button class="remove-section-btn" onclick="removeSection(${index})" title="Eliminar sección">
                    ×
                </button>
            </div>
            <div class="section-content">
                <div class="input-group">
                    <label>Acordes</label>
                    <textarea class="chords-input" placeholder="Ej: C Am F G" 
                             onchange="updateSectionChords(${index}, this.value)">${escapeHtml(section.chords)}</textarea>
                </div>
                <div class="input-group">
                    <label>Letra</label>
                    <textarea class="lyrics-input" placeholder="Letra de la canción" 
                             onchange="updateSectionLyrics(${index}, this.value)">${escapeHtml(section.lyrics)}</textarea>
                </div>
            </div>
        </div>
    `).join('');
}

// ==========================================
// GESTIÓN DE SECCIONES
// ==========================================

function addNewSection() {
    const newSection = {
        id: Date.now() + Math.random(),
        name: `Sección ${songSections.length + 1}`,
        chords: '',
        lyrics: ''
    };
    
    songSections.push(newSection);
    renderSections();
    
    // Enfocar en el nombre de la nueva sección
    setTimeout(() => {
        const lastInput = document.querySelector('.section-name-input:last-of-type');
        if (lastInput) lastInput.focus();
    }, 100);
}

function removeSection(index) {
    songSections.splice(index, 1);
    renderSections();
}

function updateSectionName(index, value) {
    if (songSections[index]) {
        songSections[index].name = value;
    }
}

function updateSectionChords(index, value) {
    if (songSections[index]) {
        songSections[index].chords = value;
    }
}

function updateSectionLyrics(index, value) {
    if (songSections[index]) {
        songSections[index].lyrics = value;
    }
}

// ==========================================
// DETECCIÓN AUTOMÁTICA
// ==========================================

const SECTION_PATTERNS = {
    'Intro': /^(intro|introducción)/i,
    'Estrofa 1': /^(estrofa\s*1|verso\s*1|v1)/i,
    'Estrofa 2': /^(estrofa\s*2|verso\s*2|v2)/i,
    'Estrofa 3': /^(estrofa\s*3|verso\s*3|v3)/i,
    'Pre-Coro': /^(pre-?coro|pre-?chorus)/i,
    'Coro': /^(coro|chorus|estribillo)/i,
    'Coro 2': /^(coro\s*2|chorus\s*2)/i,
    'Puente': /^(puente|bridge)/i,
    'Solo': /^(solo|instrumental)/i,
    'Outro': /^(outro|final|ending)/i
};

function detectSongSections(text) {
    if (!text.trim()) return [];
    
    const lines = text.split('\n');
    const sections = [];
    let currentSection = null;
    let currentContent = [];
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Buscar etiquetas de sección
        let foundSection = false;
        for (const [sectionName, pattern] of Object.entries(SECTION_PATTERNS)) {
            if (pattern.test(trimmedLine) && trimmedLine.includes(':')) {
                // Guardar sección anterior
                if (currentSection && currentContent.length > 0) {
                    sections.push(parseContentToSection(currentSection, currentContent));
                }
                
                // Iniciar nueva sección
                currentSection = sectionName;
                currentContent = [];
                foundSection = true;
                break;
            }
        }
        
        if (!foundSection && trimmedLine) {
            currentContent.push(line);
        }
    }
    
    // Guardar última sección
    if (currentSection && currentContent.length > 0) {
        sections.push(parseContentToSection(currentSection, currentContent));
    }
    
    // Si no se encontraron secciones con etiquetas, detectar inteligentemente
    if (sections.length === 0) {
        return detectIntelligentSections(text);
    }
    
    return sections;
}

function detectIntelligentSections(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const sections = [];
    
    let currentChords = '';
    let currentLyrics = '';
    let sectionCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (isChordLine(line)) {
            // Guardar sección anterior si existe
            if (currentChords || currentLyrics) {
                sectionCount++;
                sections.push({
                    id: Date.now() + Math.random(),
                    name: getSectionNameByIndex(sectionCount),
                    chords: currentChords.trim(),
                    lyrics: currentLyrics.trim()
                });
            }
            
            // Iniciar nueva sección
            currentChords = line;
            currentLyrics = '';
            
            // Buscar letras que siguen
            let j = i + 1;
            while (j < lines.length && !isChordLine(lines[j])) {
                currentLyrics += lines[j] + '\n';
                j++;
            }
            i = j - 1;
        }
    }
    
    // Guardar última sección
    if (currentChords || currentLyrics) {
        sectionCount++;
        sections.push({
            id: Date.now() + Math.random(),
            name: getSectionNameByIndex(sectionCount),
            chords: currentChords.trim(),
            lyrics: currentLyrics.trim()
        });
    }
    
    return sections;
}

function parseContentToSection(sectionName, contentLines) {
    let chords = '';
    let lyrics = '';
    
    for (const line of contentLines) {
        if (isChordLine(line)) {
            chords += line + '\n';
        } else if (line.trim()) {
            lyrics += line + '\n';
        }
    }
    
    return {
        id: Date.now() + Math.random(),
        name: sectionName,
        chords: chords.trim(),
        lyrics: lyrics.trim()
    };
}

function isChordLine(line) {
    if (!line.trim()) return false;
    
    const words = line.trim().split(/\s+/);
    let chordCount = 0;
    
    for (const word of words) {
        if (/^[A-G][#b]?(?:maj7?|min7?|m7?|add9|add11|sus[24]|dim|aug|\+|[679]|11|13|\/[A-G][#b]?)*$/i.test(word)) {
            chordCount++;
        }
    }
    
    return chordCount / words.length >= 0.6;
}

function getSectionNameByIndex(index) {
    const names = ['Estrofa', 'Coro', 'Estrofa 2', 'Puente', 'Coro 2', 'Outro'];
    return names[index - 1] || `Sección ${index}`;
}

// ==========================================
// TRANSPOSICIÓN
// ==========================================

function calculateSemitones(fromKey, toKey) {
    const fromIndex = NOTES.indexOf(FLAT_TO_SHARP[fromKey] || fromKey);
    const toIndex = NOTES.indexOf(FLAT_TO_SHARP[toKey] || toKey);
    
    if (fromIndex === -1 || toIndex === -1) return 0;
    
    let semitones = toIndex - fromIndex;
    if (semitones < 0) semitones += 12;
    
    return semitones;
}

function transposeChord(chord, semitones) {
    if (!chord || typeof chord !== 'string' || semitones === 0) return chord;
    
    const chordRegex = /^([A-G][#b]?)(.*)?$/;
    const match = chord.trim().match(chordRegex);
    
    if (!match) return chord;
    
    let [, rootNote, suffix] = match;
    suffix = suffix || '';
    
    // Normalizar nota
    rootNote = FLAT_TO_SHARP[rootNote] || rootNote;
    
    const noteIndex = NOTES.indexOf(rootNote);
    if (noteIndex === -1) return chord;
    
    const newIndex = (noteIndex + semitones) % 12;
    const newNote = NOTES[newIndex];
    
    // Manejar acordes con barra
    if (suffix.includes('/')) {
        const parts = suffix.split('/');
        const bassNote = parts[1];
        const transposedBass = transposeChord(bassNote, semitones);
        suffix = parts[0] + '/' + transposedBass;
    }
    
    return newNote + suffix;
}

function transposeLine(line, semitones) {
    if (!line || semitones === 0) return line;
    
    return line.split(/(\s+)/).map(word => {
        if (/^[A-G][#b]?(?:maj7?|min7?|m7?|add9|add11|sus[24]|dim|aug|\+|[679]|11|13|\/[A-G][#b]?)*$/i.test(word.trim())) {
            return transposeChord(word, semitones);
        }
        return word;
    }).join('');
}

// ==========================================
// VISTA DE CANCIÓN
// ==========================================

function viewSong(songId) {
    currentSong = allSongs.find(song => song.id === songId);
    if (!currentSong) return;
    
    originalKey = currentSong.key;
    currentKey = currentSong.key;
    
    document.getElementById('currentSongTitle').textContent = currentSong.title;
    document.getElementById('currentSongArtist').textContent = currentSong.artist;
    document.getElementById('currentKey').textContent = currentKey;
    
    renderSongContent();
    showView('song');
}

function renderSongContent() {
    if (!currentSong) return;
    
    const container = document.getElementById('songContent');
    const semitones = calculateSemitones(originalKey, currentKey);
    
    container.innerHTML = currentSong.sections.map(section => `
        <div class="song-section">
            <div class="section-title">${escapeHtml(section.name)}</div>
            <div class="section-music">
                <div class="chords-line">${transposeLine(section.chords, semitones)}</div>
                <div class="lyrics-line">${escapeHtml(section.lyrics)}</div>
            </div>
        </div>
    `).join('');
}

function changeKey(direction) {
    const currentIndex = NOTES.indexOf(currentKey);
    const newIndex = (currentIndex + direction + 12) % 12;
    currentKey = NOTES[newIndex];
    
    document.getElementById('currentKey').textContent = currentKey;
    renderSongContent();
}

function resetKey() {
    currentKey = originalKey;
    document.getElementById('currentKey').textContent = currentKey;
    renderSongContent();
}

function editCurrentSong() {
    if (currentSong) {
        editSong(currentSong.id);
    }
}

// ==========================================
// MODALES
// ==========================================

function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.body.style.overflow = '';
}

function processPastedSong() {
    const text = document.getElementById('pasteText').value.trim();
    if (!text) {
        showToast('Por favor pega el contenido de la canción', 'error');
        return;
    }
    
    const detectedSections = detectSongSections(text);
    if (detectedSections.length === 0) {
        showToast('No se pudieron detectar secciones en el texto', 'error');
        return;
    }
    
    songSections.push(...detectedSections);
    renderSections();
    
    document.getElementById('pasteText').value = '';
    hideModal('pasteModal');
    showToast(`Se detectaron ${detectedSections.length} secciones`, 'success');
}

function showReAnalyzeModal() {
    if (!editingSong) return;
    
    const songText = songSections.map(section => 
        `${section.name}:\n${section.chords}\n${section.lyrics}\n`
    ).join('\n');
    
    document.getElementById('reAnalyzeText').value = songText;
    showModal('reAnalyzeModal');
}

function processReAnalysis() {
    const text = document.getElementById('reAnalyzeText').value.trim();
    if (!text) {
        showToast('Por favor modifica el contenido para re-analizar', 'error');
        return;
    }
    
    const detectedSections = detectSongSections(text);
    if (detectedSections.length === 0) {
        showToast('No se pudieron detectar secciones en el texto', 'error');
        return;
    }
    
    songSections = detectedSections;
    renderSections();
    
    document.getElementById('reAnalyzeText').value = '';
    hideModal('reAnalyzeModal');
    showToast('Canción re-analizada correctamente', 'success');
}

// ==========================================
// UTILIDADES
// ==========================================

function handleSearch() {
    renderSongsList();
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function addExampleSong() {
    const exampleSong = {
        id: Date.now(),
        title: "Es El",
        artist: "TTL",
        key: "C",
        sections: [
            {
                id: 1,
                name: "Estrofa",
                chords: "C           Am\nF           G",
                lyrics: "Es el Señor quien nos ama\nCon amor eterno"
            },
            {
                id: 2,
                name: "Coro",
                chords: "F           C\nG           Am",
                lyrics: "Aleluya, aleluya\nCantamos su amor"
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    allSongs.push(exampleSong);
    saveSongs();
    renderSongsList();
}

// ==========================================
// PWA - SERVICE WORKER
// ==========================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}
