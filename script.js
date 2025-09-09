/**
 * ==========================================
 * 🎵 BETANIA MUSIC - SISTEMA COMPLETO JS
 * CON EDITAR/ELIMINAR/RE-ANALIZAR
 * ==========================================
 */

// ==========================================
// CONFIGURACIÓN MUSICAL
// ==========================================

// Notas cromáticas (base para transposición)
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Equivalencias bemol/sostenido
const SHARP_TO_FLAT = {
    'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
};

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
let editingSong = null; // Nueva variable para modo edición

// ==========================================
// SISTEMA DE DETECCIÓN AUTOMÁTICA
// ==========================================

// Patrones para detectar secciones
const sectionPatterns = {
    'Estrofa': /(?:^|\n)\s*(?:estrofa|verso|verse)\s*(?:\d+|i+)?\s*[:\-]?\s*\n/gi,
    'Estrofa 1': /(?:^|\n)\s*(?:estrofa|verso|verse)\s*(?:1|i|uno|primera?)\s*[:\-]?\s*\n/gi,
    'Estrofa 2': /(?:^|\n)\s*(?:estrofa|verso|verse)\s*(?:2|ii|dos|segunda?)\s*[:\-]?\s*\n/gi,
    'Estrofa 3': /(?:^|\n)\s*(?:estrofa|verso|verse)\s*(?:3|iii|tres|tercera?)\s*[:\-]?\s*\n/gi,
    
    'Coro': /(?:^|\n)\s*(?:coro|chorus|estribillo)\s*(?:\d+)?\s*[:\-]?\s*\n/gi,
    'Coro 1': /(?:^|\n)\s*(?:coro|chorus|estribillo)\s*(?:1|i|uno|primer)\s*[:\-]?\s*\n/gi,
    'Coro 2': /(?:^|\n)\s*(?:coro|chorus|estribillo)\s*(?:2|ii|dos|segundo)\s*[:\-]?\s*\n/gi,
    
    'Pre-Coro': /(?:^|\n)\s*(?:pre-?coro|pre-?chorus|precoro|prechorus)\s*[:\-]?\s*\n/gi,
    'Puente': /(?:^|\n)\s*(?:puente|bridge)\s*[:\-]?\s*\n/gi,
    'Intro': /(?:^|\n)\s*(?:intro|introducción|introduction)\s*[:\-]?\s*\n/gi,
    'Outro': /(?:^|\n)\s*(?:outro|final|ending|coda)\s*[:\-]?\s*\n/gi,
    'Solo': /(?:^|\n)\s*(?:solo|instrumental)\s*[:\-]?\s*\n/gi,
    'Interludio': /(?:^|\n)\s*(?:interludio|interlude)\s*[:\-]?\s*\n/gi,
    'Tag': /(?:^|\n)\s*(?:tag|repetir|repeat)\s*[:\-]?\s*\n/gi
};

// ==========================================
// FUNCIONES DE TRANSPOSICIÓN
// ==========================================

// Función para calcular semitonos entre dos tonalidades
function calculateSemitones(fromKey, toKey) {
    // Normalizar las tonalidades (convertir bemoles a sostenidos)
    const normalizedFrom = FLAT_TO_SHARP[fromKey] || fromKey;
    const normalizedTo = FLAT_TO_SHARP[toKey] || toKey;
    
    const fromIndex = NOTES.indexOf(normalizedFrom);
    const toIndex = NOTES.indexOf(normalizedTo);
    
    if (fromIndex === -1 || toIndex === -1) return 0;
    
    let semitones = toIndex - fromIndex;
    if (semitones < 0) semitones += 12;
    
    return semitones;
}

// Función mejorada para transponer acordes individuales
function transposeChord(chord, semitones) {
    if (!chord || typeof chord !== 'string') return chord;
    
    // Patrón mejorado para detectar acordes complejos
    const chordRegex = /^([A-G][#b]?)((?:maj7|min7|m7|add9|add11|sus2|sus4|dim|aug|\+|7|9|11|13|maj|min|m|°|ø|\/).*)?$/;
    const trimmed = chord.trim();
    const match = trimmed.match(chordRegex);
    
    if (!match) return chord;
    
    let [, rootNote, suffix] = match;
    suffix = suffix || '';
    
    // Convertir bemol a sostenido si es necesario
    if (FLAT_TO_SHARP[rootNote]) {
        rootNote = FLAT_TO_SHARP[rootNote];
    }
    
    // Encontrar índice de la nota en el array cromático
    const noteIndex = NOTES.indexOf(rootNote);
    if (noteIndex === -1) return chord;
    
    // Calcular nueva posición
    let newIndex = (noteIndex + semitones) % 12;
    if (newIndex < 0) newIndex += 12;
    
    const newNote = NOTES[newIndex];
    
    // Manejar acordes con barra (ej: C/E)
    if (suffix.includes('/')) {
        const parts = suffix.split('/');
        const bassNote = parts[1];
        const transposedBass = transposeChord(bassNote, semitones);
        suffix = parts[0] + '/' + transposedBass;
    }
    
    return newNote + suffix;
}

// Función para transponer una línea completa
function transposeLine(line, semitones) {
    if (!line || typeof line !== 'string') return line;
    if (semitones === 0) return line;
    
    // Dividir la línea en palabras para procesar cada acorde
    const words = line.split(/(\s+)/);
    
    return words.map(word => {
        // Detectar si la palabra es un acorde
        const chordPattern = /^[A-G][#b]?(?:maj7|min7|m7|add9|add11|sus2|sus4|dim|aug|\+|7|9|11|13|maj|min|m|°|ø|\/[A-G][#b]?)*$/;
        
        if (chordPattern.test(word.trim())) {
            return transposeChord(word, semitones);
        }
        return word;
    }).join('');
}

// Función para detectar automáticamente las secciones
function detectSongSections(text) {
    if (!text) return [];
    
    const detectedSections = [];
    const lines = text.split('\n');
    let currentSection = null;
    let sectionContent = [];
    
    // Primero intentar detectar con patrones explícitos
    for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
            // Si encuentra patrones explícitos, usar método dirigido
            return detectWithExplicitPatterns(text);
        }
    }
    
    // Si no hay patrones explícitos, usar detección inteligente
    return detectWithIntelligentAnalysis(text);
}

// Detección con patrones explícitos (ej: "Estrofa 1:", "Coro:")
function detectWithExplicitPatterns(text) {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = null;
    let currentContent = [];
    
    for (const line of lines) {
        let foundSection = false;
        
        // Buscar patrones de sección
        for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
            if (pattern.test(line)) {
                // Guardar sección anterior si existe
                if (currentSection) {
                    const content = currentContent.join('\n').trim();
                    if (content) {
                        sections.push(parseSection(currentSection, content));
                    }
                }
                
                // Iniciar nueva sección
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
    
    // Guardar última sección
    if (currentSection && currentContent.length > 0) {
        const content = currentContent.join('\n').trim();
        if (content) {
            sections.push(parseSection(currentSection, content));
        }
    }
    
    return sections;
}

// Detección inteligente sin patrones explícitos
function detectWithIntelligentAnalysis(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const sections = [];
    
    let currentChords = '';
    let currentLyrics = '';
    let sectionCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (isChordLine(line)) {
            // Si ya tenemos contenido, guardar sección anterior
            if (currentChords || currentLyrics) {
                sectionCount++;
                const sectionName = getSectionName(sectionCount, currentChords + '\n' + currentLyrics);
                sections.push({
                    id: Date.now() + Math.random(),
                    name: sectionName,
                    chords: currentChords.trim(),
                    lyrics: currentLyrics.trim()
                });
            }
            
            // Iniciar nueva sección
            currentChords = line;
            currentLyrics = '';
            
            // Buscar líneas de letra que siguen
            let j = i + 1;
            while (j < lines.length && !isChordLine(lines[j])) {
                currentLyrics += lines[j] + '\n';
                j++;
            }
            i = j - 1; // Ajustar índice
        }
    }
    
    // Guardar última sección
    if (currentChords || currentLyrics) {
        sectionCount++;
        const sectionName = getSectionName(sectionCount, currentChords + '\n' + currentLyrics);
        sections.push({
            id: Date.now() + Math.random(),
            name: sectionName,
            chords: currentChords.trim(),
            lyrics: currentLyrics.trim()
        });
    }
    
    return sections;
}

// Función para detectar si una línea contiene acordes
function isChordLine(line) {
    if (!line.trim()) return false;
    
    const words = line.trim().split(/\s+/);
    let chordCount = 0;
    
    for (const word of words) {
        if (/^[A-G][#b]?(?:maj7|min7|m7|add9|add11|sus2|sus4|dim|aug|\+|7|9|11|13|maj|min|m|°|ø|\/[A-G][#b]?)*$/.test(word)) {
            chordCount++;
        }
    }
    
    // Si más del 50% son acordes, considerarla línea de acordes
    return chordCount / words.length > 0.5;
}

// Función para determinar el nombre de la sección automáticamente
function getSectionName(sectionNumber, content) {
    const lowerContent = content.toLowerCase();
    
    // Detectar coros por contenido repetitivo
    if (lowerContent.includes('aleluya') || lowerContent.includes('gloria') || 
        lowerContent.includes('santo') || lowerContent.includes('hosanna')) {
        return sectionNumber === 1 ? 'Coro' : `Coro ${sectionNumber}`;
    }
    
    // Detectar puentes por palabras clave
    if (lowerContent.includes('puente') || content.length < 100) {
        return 'Puente';
    }
    
    // Por defecto, usar estrofas numeradas
    return sectionNumber === 1 ? 'Estrofa' : `Estrofa ${sectionNumber}`;
}

// Función para parsear una sección detectada
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
// FUNCIONES DE GESTIÓN DE CANCIONES
// ==========================================

// Cargar canciones desde localStorage
function loadSongs() {
    const saved = localStorage.getItem('betaniaSongs');
    if (saved) {
        songs = JSON.parse(saved);
    }
}

// Guardar canciones en localStorage
function saveSongs() {
    localStorage.setItem('betaniaSongs', JSON.stringify(songs));
}

// Añadir nueva canción
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
        artist: artist,
        key: originalKey,
        sections: sections,
        createdAt: editingSong ? editingSong.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (editingSong) {
        // Actualizar canción existente
        const index = songs.findIndex(song => song.id === editingSong.id);
        if (index !== -1) {
            songs[index] = songData;
        }
    } else {
        // Añadir nueva canción
        songs.push(songData);
    }
    
    saveSongs();
    clearForm();
    showView('songList');
    renderSongList();
}

// NUEVA: Función para editar canción
function editSong(songId) {
    const song = songs.find(s => s.id === songId);
    if (!song) return;
    
    editingSong = song;
    
    // Cargar datos en el formulario
    document.getElementById('songTitle').value = song.title;
    document.getElementById('artist').value = song.artist;
    document.getElementById('originalKey').value = song.key;
    
    currentKey = song.key;
    originalKey = song.key;
    sections = [...song.sections];
    
    // Actualizar interfaz
    document.getElementById('addTitle').textContent = '✏️ Editar Canción';
    document.getElementById('saveBtn').innerHTML = '💾 Actualizar Canción';
    document.getElementById('reAnalyzeBtn').classList.remove('hidden');
    
    renderSections();
    showView('addSong');
}

// NUEVA: Función para eliminar canción
function deleteSong(songId) {
    const song = songs.find(s => s.id === songId);
    if (!song) return;
    
    // Mostrar modal de confirmación
    document.getElementById('deleteSongTitle').textContent = song.title;
    document.getElementById('deleteSongArtist').textContent = song.artist;
    
    document.getElementById('deleteModal').classList.remove('hidden');
    
    // Configurar botón de confirmación
    document.getElementById('confirmDelete').onclick = () => {
        songs = songs.filter(s => s.id !== songId);
        saveSongs();
        renderSongList();
        hideModal('deleteModal');
    };
}

// NUEVA: Función para re-analizar canción
function reAnalyzeSong() {
    if (!editingSong) return;
    
    // Reconstruir texto de la canción
    const songText = sections.map(section => {
        return `${section.name}:\n${section.chords}\n${section.lyrics}\n`;
    }).join('\n');
    
    document.getElementById('reAnalyzeText').value = songText;
    showModal('reAnalyzeModal');
}

// NUEVA: Procesar re-análisis
function processReAnalysis() {
    const text = document.getElementById('reAnalyzeText').value;
    const detectedSections = detectSongSections(text);
    
    sections = detectedSections;
    renderSections();
    hideModal('reAnalyzeModal');
}

// Limpiar formulario
function clearForm() {
    document.getElementById('songTitle').value = '';
    document.getElementById('artist').value = '';
    document.getElementById('originalKey').value = 'C';
    
    currentKey = 'C';
    originalKey = 'C';
    sections = [];
    editingSong = null;
    
    // Restaurar interfaz
    document.getElementById('addTitle').textContent = '➕ Añadir Nueva Canción';
    document.getElementById('saveBtn').innerHTML = '💾 Guardar Canción';
    document.getElementById('reAnalyzeBtn').classList.add('hidden');
    
    renderSections();
}

// ==========================================
// FUNCIONES DE INTERFAZ
// ==========================================

// Mostrar vista específica
function showView(viewName) {
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.getElementById(viewName).classList.remove('hidden');
    
    // Actualizar navegación
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (viewName === 'songList') {
        document.getElementById('homeBtn').classList.add('active');
    } else if (viewName === 'addSong') {
        document.getElementById('addBtn').classList.add('active');
    }
}

// Mostrar modal
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

// Ocultar modal
function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Renderizar lista de canciones
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
                <p>No hay canciones disponibles</p>
                <button onclick="showView('addSong')" class="btn btn-primary">
                    Añadir Primera Canción
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
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteSong(${song.id})" class="action-btn delete-btn" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
                <button onclick="viewSong(${song.id})" class="btn btn-primary">
                    Ver Canción
                </button>
            </div>
        </div>
    `).join('');
}

// Ver canción individual
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

// Renderizar contenido de la canción
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

// Renderizar secciones en el formulario
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
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="section-inputs">
                <textarea placeholder="Acordes" 
                         onchange="updateSectionChords(${index}, this.value)"
                         class="section-textarea chords">${section.chords}</textarea>
                <textarea placeholder="Letra" 
                         onchange="updateSectionLyrics(${index}, this.value)"
                         class="section-textarea lyrics">${section.lyrics}</textarea>
            </div>
        </div>
    `).join('');
}

// Funciones para actualizar secciones
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

// Cambiar tonalidad
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

// Procesar canción pegada
function processPastedSong() {
    const text = document.getElementById('pasteText').value;
    const detectedSections = detectSongSections(text);
    
    sections.push(...detectedSections);
    renderSections();
    
    document.getElementById('pasteText').value = '';
    hideModal('pasteModal');
}

// ==========================================
// INICIALIZACIÓN Y EVENT LISTENERS
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    loadSongs();
    renderSongList();
    
    // Navegación principal
    document.getElementById('homeBtn').addEventListener('click', () => showView('songList'));
    document.getElementById('addBtn').addEventListener('click', () => {
        clearForm();
        showView('addSong');
    });
    document.getElementById('addNewBtn').addEventListener('click', () => {
        clearForm();
        showView('addSong');
    });
    
    // Formulario de canción
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
    
    // NUEVOS: Modales - Re-analizar
    document.getElementById('reAnalyzeBtn').addEventListener('click', reAnalyzeSong);
    document.getElementById('closeReAnalyzeModal').addEventListener('click', () => hideModal('reAnalyzeModal'));
    document.getElementById('cancelReAnalyze').addEventListener('click', () => hideModal('reAnalyzeModal'));
    document.getElementById('processReAnalyze').addEventListener('click', processReAnalysis);
    
    // NUEVOS: Modales - Eliminar
    document.getElementById('closeDeleteModal').addEventListener('click', () => hideModal('deleteModal'));
    document.getElementById('cancelDelete').addEventListener('click', () => hideModal('deleteModal'));
    
    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
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
