/**
 * ==========================================
 * 🎵 BETANIA MUSIC - VERSIÓN CORREGIDA
 * ==========================================
 */

// ==========================================
// CONFIGURACIÓN MUSICAL
// ==========================================

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const FLAT_TO_SHARP = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
};

// ==========================================
// VARIABLES GLOBALES
// ==========================================

let songs = [];
let currentSong = null;
let currentKey = 'C';
let originalKey = 'C';
let sections = [];
let editingSong = null;

// ==========================================
// FUNCIONES DE TRANSPOSICIÓN
// ==========================================

function calculateSemitones(fromKey, toKey) {
    const normalizedFrom = FLAT_TO_SHARP[fromKey] || fromKey;
    const normalizedTo = FLAT_TO_SHARP[toKey] || toKey;
    
    const fromIndex = NOTES.indexOf(normalizedFrom);
    const toIndex = NOTES.indexOf(normalizedTo);
    
    if (fromIndex === -1 || toIndex === -1) return 0;
    
    let semitones = toIndex - fromIndex;
    if (semitones < 0) semitones += 12;
    
    return semitones;
}

function transposeChord(chord, semitones) {
    if (!chord || typeof chord !== 'string') return chord;
    
    const chordRegex = /^([A-G][#b]?)(.*)?$/;
    const match = chord.trim().match(chordRegex);
    
    if (!match) return chord;
    
    let [, rootNote, suffix] = match;
    suffix = suffix || '';
    
    if (FLAT_TO_SHARP[rootNote]) {
        rootNote = FLAT_TO_SHARP[rootNote];
    }
    
    const noteIndex = NOTES.indexOf(rootNote);
    if (noteIndex === -1) return chord;
    
    let newIndex = (noteIndex + semitones) % 12;
    if (newIndex < 0) newIndex += 12;
    
    const newNote = NOTES[newIndex];
    
    if (suffix.includes('/')) {
        const parts = suffix.split('/');
        const bassNote = parts[1];
        const transposedBass = transposeChord(bassNote, semitones);
        suffix = parts[0] + '/' + transposedBass;
    }
    
    return newNote + suffix;
}

function transposeLine(line, semitones) {
    if (!line || typeof line !== 'string') return line;
    if (semitones === 0) return line;
    
    const words = line.split(/(\s+)/);
    
    return words.map(word => {
        const chordPattern = /^[A-G][#b]?(?:maj7|min7|m7|add9|add11|sus2|sus4|dim|aug|\+|7|9|11|13|maj|min|m|°|ø|\/[A-G][#b]?)*$/;
        
        if (chordPattern.test(word.trim())) {
            return transposeChord(word, semitones);
        }
        return word;
    }).join('');
}

// ==========================================
// DETECCIÓN AUTOMÁTICA DE SECCIONES
// ==========================================

const sectionPatterns = {
    'Intro': /(?:^|\n)\s*(?:intro|introducción)\s*[:\-]?\s*\n/gi,
    'Estrofa 1': /(?:^|\n)\s*(?:estrofa|verso)\s*(?:1|i|uno|primera?)\s*[:\-]?\s*\n/gi,
    'Estrofa 2': /(?:^|\n)\s*(?:estrofa|verso)\s*(?:2|ii|dos|segunda?)\s*[:\-]?\s*\n/gi,
    'Estrofa 3': /(?:^|\n)\s*(?:estrofa|verso)\s*(?:3|iii|tres|tercera?)\s*[:\-]?\s*\n/gi,
    'Coro': /(?:^|\n)\s*(?:coro|chorus|estribillo)\s*[:\-]?\s*\n/gi,
    'Pre-Coro': /(?:^|\n)\s*(?:pre-?coro|pre-?chorus)\s*[:\-]?\s*\n/gi,
    'Puente': /(?:^|\n)\s*(?:puente|bridge)\s*[:\-]?\s*\n/gi,
    'Outro': /(?:^|\n)\s*(?:outro|final)\s*[:\-]?\s*\n/gi
};

function detectSongSections(text) {
    if (!text) return [];
    
    // Intentar detección con patrones explícitos
    for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
            return detectWithExplicitPatterns(text);
        }
    }
    
    // Detección inteligente sin patrones
    return detectWithIntelligentAnalysis(text);
}

function detectWithExplicitPatterns(text) {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = null;
    let currentContent = [];
    
    for (const line of lines) {
        let foundSection = false;
        
        for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
            if (pattern.test(line)) {
                if (currentSection) {
                    const content = currentContent.join('\n').trim();
                    if (content) {
                        sections.push(parseSection(currentSection, content));
                    }
                }
                
                currentSection = sectionName;
                currentContent = [];
                foundSection = true;
                break;
            }
        }
        
        if (!foundSection && currentSection) {
            currentContent.push(line);
        }
    }
    
    if (currentSection && currentContent.length > 0) {
        const content = currentContent.join('\n').trim();
        if (content) {
            sections.push(parseSection(currentSection, content));
        }
    }
    
    return sections;
}

function detectWithIntelligentAnalysis(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const sections = [];
    
    let currentChords = '';
    let currentLyrics = '';
    let sectionCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (isChordLine(line)) {
            if (currentChords || currentLyrics) {
                sectionCount++;
                const sectionName = getSectionName(sectionCount);
                sections.push({
                    id: Date.now() + Math.random(),
                    name: sectionName,
                    chords: currentChords.trim(),
                    lyrics: currentLyrics.trim()
                });
            }
            
            currentChords = line;
            currentLyrics = '';
            
            let j = i + 1;
            while (j < lines.length && !isChordLine(lines[j])) {
                currentLyrics += lines[j] + '\n';
                j++;
            }
            i = j - 1;
        }
    }
    
    if (currentChords || currentLyrics) {
        sectionCount++;
        const sectionName = getSectionName(sectionCount);
        sections.push({
            id: Date.now() + Math.random(),
            name: sectionName,
            chords: currentChords.trim(),
            lyrics: currentLyrics.trim()
        });
    }
    
    return sections;
}

function isChordLine(line) {
    if (!line.trim()) return false;
    
    const words = line.trim().split(/\s+/);
    let chordCount = 0;
    
    for (const word of words) {
        if (/^[A-G][#b]?(?:maj7|min7|m7|add9|add11|sus2|sus4|dim|aug|\+|7|9|11|13|maj|min|m|°|ø|\/[A-G][#b]?)*$/.test(word)) {
            chordCount++;
        }
    }
    
    return chordCount / words.length > 0.5;
}

function getSectionName(sectionNumber) {
    if (sectionNumber === 1) return 'Estrofa';
    if (sectionNumber === 2) return 'Coro';
    if (sectionNumber === 3) return 'Estrofa 2';
    if (sectionNumber === 4) return 'Puente';
    return `Sección ${sectionNumber}`;
}

function parseSection(sectionName, content) {
    const lines = content.split('\n');
    let chords = '';
    let lyrics = '';
    
    for (const line of lines) {
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

// ==========================================
// GESTIÓN DE CANCIONES
// ==========================================

function loadSongs() {
    const saved = localStorage.getItem('betaniaSongs');
    if (saved) {
        songs = JSON.parse(saved);
    }
}

function saveSongs() {
    localStorage.setItem('betaniaSongs', JSON.stringify(songs));
}

function addNewSong() {
    const title = document.getElementById('songTitle').value.trim();
    const artist = document.getElementById('artist').value.trim();
    
    if (!title) {
        alert('Por favor ingresa un título para la canción');
        return;
    }
    
    const songData = {
        id: editingSong ? editingSong.id : Date.now(),
        title: title,
        artist: artist || 'Artista desconocido',
        key: originalKey,
        sections: sections,
        createdAt: editingSong ? editingSong.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (editingSong) {
        const index = songs.findIndex(song => song.id === editingSong.id);
        if (index !== -1) {
            songs[index] = songData;
        }
    } else {
        songs.push(songData);
    }
    
    saveSongs();
    clearForm();
    showView('songList');
    renderSongList();
}

function editSong(songId) {
    const song = songs.find(s => s.id === songId);
    if (!song) return;
    
    editingSong = song;
    
    document.getElementById('songTitle').value = song.title;
    document.getElementById('artist').value = song.artist;
    document.getElementById('originalKey').value = song.key;
    
    currentKey = song.key;
    originalKey = song.key;
    sections = [...song.sections];
    
    document.getElementById('formTitle').textContent = '✏️ Editar Canción';
    document.getElementById('saveBtn').innerHTML = '💾 Actualizar Canción';
    document.getElementById('reAnalyzeBtn').classList.remove('hidden');
    
    renderSections();
    showView('addSong');
}

function deleteSong(songId) {
    const song = songs.find(s => s.id === songId);
    if (!song) return;
    
    document.getElementById('deleteSongTitle').textContent = song.title;
    document.getElementById('deleteSongArtist').textContent = song.artist;
    
    showModal('deleteModal');
    
    document.getElementById('confirmDelete').onclick = () => {
        songs = songs.filter(s => s.id !== songId);
        saveSongs();
        renderSongList();
        hideModal('deleteModal');
    };
}

function clearForm() {
    document.getElementById('songTitle').value = '';
    document.getElementById('artist').value = '';
    document.getElementById('originalKey').value = 'C';
    
    currentKey = 'C';
    originalKey = 'C';
    sections = [];
    editingSong = null;
    
    document.getElementById('formTitle').textContent = '➕ Añadir Nueva Canción';
    document.getElementById('saveBtn').innerHTML = '💾 Guardar Canción';
    document.getElementById('reAnalyzeBtn').classList.add('hidden');
    
    renderSections();
}

// ==========================================
// INTERFAZ
// ==========================================

function showView(viewName) {
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById(viewName).classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (viewName === 'songList') {
        document.getElementById('homeBtn').classList.add('active');
    } else if (viewName === 'addSong') {
        document.getElementById('addBtn').classList.add('active');
    }
}

function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function renderSongList() {
    const container = document.getElementById('songsContainer');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist.toLowerCase().includes(searchTerm)
    );
    
    if (filteredSongs.length === 0) {
        container.innerHTML = `
            <div class="no-songs">
                <h3>No hay canciones disponibles</h3>
                <p>Añade tu primera canción para comenzar</p>
                <button onclick="clearForm(); showView('addSong')" class="btn btn-primary">
                    ➕ Añadir Primera Canción
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredSongs.map(song => `
        <div class="song-card">
            <div class="song-info">
                <h3 class="song-title">${song.title}</h3>
                <p class="song-artist">${song.artist}</p>
                <p class="song-key">Tonalidad: ${song.key}</p>
            </div>
            <div class="song-actions">
                <button onclick="editSong(${song.id})" class="action-btn edit-btn" title="Editar">
                    ✏️
                </button>
                <button onclick="deleteSong(${song.id})" class="action-btn delete-btn" title="Eliminar">
                    🗑️
                </button>
                <button onclick="viewSong(${song.id})" class="btn btn-primary">
                    Ver Canción
                </button>
            </div>
        </div>
    `).join('');
}

function viewSong(songId) {
    currentSong = songs.find(song => song.id === songId);
    if (!currentSong) return;
    
    currentKey = currentSong.key;
    originalKey = currentSong.key;
    
    document.getElementById('currentSongTitle').textContent = currentSong.title;
    document.getElementById('currentArtist').textContent = currentSong.artist;
    document.getElementById('currentKeyDisplay').textContent = currentKey;
    
    renderSongContent();
    showView('songView');
}

function renderSongContent() {
    if (!currentSong) return;
    
    const container = document.getElementById('songContent');
    const semitones = calculateSemitones(originalKey, currentKey);
    
    container.innerHTML = currentSong.sections.map(section => `
        <div class="song-section">
            <h3 class="section-title">${section.name}</h3>
            <div class="section-content">
                <div class="chords-line">${transposeLine(section.chords, semitones)}</div>
                <div class="lyrics-line">${section.lyrics}</div>
            </div>
        </div>
    `).join('');
}

function renderSections() {
    const container = document.getElementById('sectionsContainer');
    
    if (sections.length === 0) {
        container.innerHTML = '<p class="no-sections">No hay secciones añadidas</p>';
        return;
    }
    
    container.innerHTML = sections.map((section, index) => `
        <div class="section-item">
            <div class="section-header">
                <input type="text" value="${section.name}" 
                       onchange="updateSectionName(${index}, this.value)"
                       class="section-name-input">
                <button onclick="removeSection(${index})" class="remove-btn">
                    ×
                </button>
            </div>
            <div class="section-inputs">
                <div class="input-group">
                    <label>Acordes:</label>
                    <textarea placeholder="Ej: C Am F G" 
                             onchange="updateSectionChords(${index}, this.value)"
                             class="section-textarea chords">${section.chords}</textarea>
                </div>
                <div class="input-group">
                    <label>Letra:</label>
                    <textarea placeholder="Letra de la canción" 
                             onchange="updateSectionLyrics(${index}, this.value)"
                             class="section-textarea lyrics">${section.lyrics}</textarea>
                </div>
            </div>
        </div>
    `).join('');
}

function updateSectionName(index, value) {
    sections[index].name = value;
}

function updateSectionChords(index, value) {
    sections[index].chords = value;
}

function updateSectionLyrics(index, value) {
    sections[index].lyrics = value;
}

function removeSection(index) {
    sections.splice(index, 1);
    renderSections();
}

function addSection() {
    sections.push({
        id: Date.now() + Math.random(),
        name: `Sección ${sections.length + 1}`,
        chords: '',
        lyrics: ''
    });
    renderSections();
}

function changeKey(direction) {
    const currentIndex = NOTES.indexOf(currentKey);
    let newIndex;
    
    if (direction === 'up') {
        newIndex = (currentIndex + 1) % 12;
    } else {
        newIndex = (currentIndex - 1 + 12) % 12;
    }
    
    currentKey = NOTES[newIndex];
    document.getElementById('currentKeyDisplay').textContent = currentKey;
    renderSongContent();
}

function processPastedSong() {
    const text = document.getElementById('pasteText').value;
    if (!text.trim()) {
        alert('Por favor pega el contenido de la canción');
        return;
    }
    
    const detectedSections = detectSongSections(text);
    sections.push(...detectedSections);
    renderSections();
    
    document.getElementById('pasteText').value = '';
    hideModal('pasteModal');
}

function reAnalyzeSong() {
    if (!editingSong) return;
    
    const songText = sections.map(section => {
        return `${section.name}:\n${section.chords}\n${section.lyrics}\n`;
    }).join('\n');
    
    document.getElementById('reAnalyzeText').value = songText;
    showModal('reAnalyzeModal');
}

function processReAnalysis() {
    const text = document.getElementById('reAnalyzeText').value;
    if (!text.trim()) {
        alert('Por favor modifica el contenido para re-analizar');
        return;
    }
    
    const detectedSections = detectSongSections(text);
    sections = detectedSections;
    renderSections();
    
    document.getElementById('reAnalyzeText').value = '';
    hideModal('reAnalyzeModal');
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    loadSongs();
    renderSongList();
    
    // Navegación
    document.getElementById('homeBtn').addEventListener('click', () => showView('songList'));
    document.getElementById('addBtn').addEventListener('click', () => {
        clearForm();
        showView('addSong');
    });
    document.getElementById('addNewBtn').addEventListener('click', () => {
        clearForm();
        showView('addSong');
    });
    
    // Formulario
    document.getElementById('saveBtn').addEventListener('click', addNewSong);
    document.getElementById('cancelBtn').addEventListener('click', () => {
        clearForm();
        showView('songList');
    });
    document.getElementById('addSectionBtn').addEventListener('click', addSection);
    
    // Búsqueda
    document.getElementById('searchInput').addEventListener('input', renderSongList);
    
    // Controles de tonalidad
    document.getElementById('keyUp').addEventListener('click', () => changeKey('up'));
    document.getElementById('keyDown').addEventListener('click', () => changeKey('down'));
    
    // Vista de canción
    document.getElementById('backBtn').addEventListener('click', () => showView('songList'));
    document.getElementById('editCurrentBtn').addEventListener('click', () => {
        if (currentSong) {
            editSong(currentSong.id);
        }
    });
    
    // Modales - Pegar canción
    document.getElementById('pasteBtn').addEventListener('click', () => showModal('pasteModal'));
    document.getElementById('closePasteModal').addEventListener('click', () => hideModal('pasteModal'));
    document.getElementById('cancelPaste').addEventListener('click', () => hideModal('pasteModal'));
    document.getElementById('processPaste').addEventListener('click', processPastedSong);
    
    // Modales - Re-analizar
    document.getElementById('reAnalyzeBtn').addEventListener('click', reAnalyzeSong);
    document.getElementById('closeReAnalyzeModal').addEventListener('click', () => hideModal('reAnalyzeModal'));
    document.getElementById('cancelReAnalyze').addEventListener('click', () => hideModal('reAnalyzeModal'));
    document.getElementById('processReAnalyze').addEventListener('click', processReAnalysis);
    
    // Modales - Eliminar
    document.getElementById('closeDeleteModal').addEventListener('click', () => hideModal('deleteModal'));
    document.getElementById('cancelDelete').addEventListener('click', () => hideModal('deleteModal'));
    
    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-overlay')) {
                hideModal(modal.id);
            }
        });
    });
    
    // Actualizar tonalidad original
    document.getElementById('originalKey').addEventListener('change', (e) => {
        originalKey = e.target.value;
        currentKey = e.target.value;
    });
});

// ==========================================
// FUNCIONES ADICIONALES
// ==========================================

// Restaurar canciones de ejemplo si no hay ninguna
function addExampleSongs() {
    if (songs.length === 0) {
        songs = [
            {
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
            }
        ];
        saveSongs();
        renderSongList();
    }
}
