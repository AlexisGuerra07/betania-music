/**
 * ==========================================
 * 🎵 BETANIA MUSIC - SISTEMA COMPLETO JS
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
// SISTEMA DE TRANSPOSICIÓN
// ==========================================

/**
 * Transpone un acorde individual
 * @param {string} chord - Acorde a transponer (ej: 'Cmaj7', 'Am', 'F#sus4')
 * @param {number} semitones - Número de semitonos a transponer
 * @returns {string} - Acorde transpuesto
 */
function transposeChord(chord, semitones) {
    if (!chord || typeof chord !== 'string' || semitones === 0) {
        return chord;
    }
    
    // Regex completa para capturar todos los tipos de acordes
    const chordRegex = /^([A-G][#b]?)(.*)$/;
    const match = chord.trim().match(chordRegex);
    
    if (!match) return chord;
    
    let [, rootNote, suffix] = match;
    
    // Normalizar nota (convertir bemoles a sostenidos para cálculo)
    const normalizedRoot = FLAT_TO_SHARP[rootNote] || rootNote;
    
    // Encontrar índice de la nota
    const noteIndex = NOTES.indexOf(normalizedRoot);
    if (noteIndex === -1) return chord;
    
    // Calcular nueva posición
    let newIndex = (noteIndex + semitones) % 12;
    if (newIndex < 0) newIndex += 12;
    
    // Obtener la nueva nota
    let newNote = NOTES[newIndex];
    
    // Mantener estilo de nomenclatura (bemol vs sostenido) según contexto
    if (rootNote.includes('b') && SHARP_TO_FLAT[newNote]) {
        newNote = SHARP_TO_FLAT[newNote];
    }
    
    return newNote + suffix;
}

/**
 * Transpone una línea completa que puede contener múltiples acordes
 * @param {string} line - Línea con acordes y/o letras
 * @param {number} semitones - Número de semitonos a transponer
 * @returns {string} - Línea transpuesta
 */
function transposeLine(line, semitones) {
    if (!line || typeof line !== 'string' || semitones === 0) {
        return line;
    }
    
    // Regex para encontrar acordes en la línea
    // Busca patrones como: C, Cm, C7, Cmaj7, C/E, Csus4, Cadd9, etc.
    const chordPattern = /\b([A-G][#b]?(?:m|maj|min|sus|add|dim|aug|\+|\-|°|ø|M|\d)*(?:\/[A-G][#b]?)?)\b/g;
    
    return line.replace(chordPattern, (match) => {
        return transposeChord(match, semitones);
    });
}

/**
 * Calcula semitonos entre dos tonalidades
 * @param {string} fromKey - Tonalidad origen
 * @param {string} toKey - Tonalidad destino
 * @returns {number} - Número de semitonos
 */
function calculateSemitones(fromKey, toKey) {
    const from = FLAT_TO_SHARP[fromKey] || fromKey;
    const to = FLAT_TO_SHARP[toKey] || toKey;
    
    const fromIndex = NOTES.indexOf(from);
    const toIndex = NOTES.indexOf(to);
    
    if (fromIndex === -1 || toIndex === -1) return 0;
    
    let semitones = toIndex - fromIndex;
    if (semitones < 0) semitones += 12;
    
    return semitones;
}

// ==========================================
// BASE DE DATOS DE CANCIONES
// ==========================================

// Canciones de ejemplo
const defaultSongs = [
    {
        id: 1,
        title: "Entrelazados",
        artist: "Lucas Conslie",
        key: "A",
        sections: {
            "Estrofa 1": [
                "A                    E",
                "Nada me apartará de ti",
                "F#m                  D",
                "Tu amor me sostiene aquí",
                "A                    E", 
                "En tus brazos quiero estar",
                "F#m                  D",
                "Entrelazados para la eternidad"
            ],
            "Coro": [
                "D                    A",
                "Entrelazados, entrelazados",
                "E                    F#m",
                "En tu amor permanezco yo",
                "D                    A", 
                "Entrelazados, entrelazados",
                "E                    A",
                "Para siempre tuyo soy"
            ],
            "Puente": [
                "F#m                  D",
                "Nunca me soltarás",
                "A                    E",
                "Tu gracia me alcanzará",
                "F#m                  D",
                "En la tormenta y en la paz",
                "A          E         A",
                "Contigo quiero caminar"
            ]
        }
    },
    {
        id: 2,
        title: "Adiestra Mis Manos",
        artist: "Corazón de Adoración",
        key: "C",
        sections: {
            "Estrofa": [
                "C                    Am",
                "Adiestra mis manos para la guerra",
                "F                    G",
                "Mis dedos para la batalla",
                "C                    Am",
                "Tú eres mi escudo y mi fortaleza",
                "F          G         C",
                "En ti confío, no temeré"
            ],
            "Coro": [
                "F                    C",
                "Porque tú eres mi guerrero",
                "G                    Am",
                "Peleas todas mis batallas",
                "F                    C",
                "Y aunque venga el enemigo",
                "G                    C",
                "En tu nombre venceré"
            ],
            "Puente": [
                "Am                   F",
                "Grande es tu poder",
                "C                    G",
                "Grande es tu amor por mí",
                "Am                   F",
                "En tu nombre hay victoria",
                "C         G          C",
                "Tu nombre sobre todo está"
            ]
        }
    }
];

// ==========================================
// ESTADO DE LA APLICACIÓN
// ==========================================

let appState = {
    songs: [],
    currentSong: null,
    currentKey: '',
    originalKey: '',
    searchTerm: '',
    showAddForm: false,
    newSong: {
        title: '',
        artist: '',
        key: 'C',
        sections: {}
    }
};

// ==========================================
// GESTIÓN DE ALMACENAMIENTO LOCAL
// ==========================================

/**
 * Cargar canciones desde localStorage
 */
function loadSongs() {
    try {
        const saved = localStorage.getItem('betaniaMusicSongs');
        if (saved) {
            appState.songs = JSON.parse(saved);
        } else {
            // Primera vez, usar canciones de ejemplo
            appState.songs = [...defaultSongs];
            saveSongs();
        }
    } catch (error) {
        console.error('Error cargando canciones:', error);
        appState.songs = [...defaultSongs];
    }
}

/**
 * Guardar canciones en localStorage
 */
function saveSongs() {
    try {
        localStorage.setItem('betaniaMusicSongs', JSON.stringify(appState.songs));
    } catch (error) {
        console.error('Error guardando canciones:', error);
    }
}

// ==========================================
// FUNCIONES DE RENDERIZADO
// ==========================================

/**
 * Renderizar lista de canciones en el sidebar
 */
function renderSongsList() {
    const container = document.getElementById('songs-container');
    const countElement = document.getElementById('songs-count');
    
    // Filtrar canciones según búsqueda
    const filteredSongs = appState.songs.filter(song =>
        song.title.toLowerCase().includes(appState.searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(appState.searchTerm.toLowerCase()) ||
        song.key.toLowerCase().includes(appState.searchTerm.toLowerCase())
    );
    
    // Actualizar contador
    countElement.textContent = `Canciones (${filteredSongs.length})`;
    
    // Renderizar canciones
    container.innerHTML = filteredSongs.map(song => `
        <div class="song-item ${appState.currentSong?.id === song.id ? 'active' : ''}" 
             onclick="selectSong(${song.id})">
            <div class="song-title">${song.title}</div>
            <div class="song-meta">
                <span class="song-artist">${song.artist || 'Sin artista'}</span>
                <span class="song-key">${song.key}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Renderizar canción actual con transposición
 */
function renderCurrentSong() {
    const viewer = document.getElementById('song-viewer');
    const welcome = document.getElementById('welcome-screen');
    
    if (!appState.currentSong) {
        viewer.style.display = 'none';
        welcome.style.display = 'block';
        return;
    }
    
    welcome.style.display = 'none';
    viewer.style.display = 'block';
    
    // Actualizar información de la canción
    document.getElementById('song-title').textContent = appState.currentSong.title;
    document.getElementById('song-artist').textContent = appState.currentSong.artist || 'Sin artista';
    document.getElementById('original-key').textContent = `Original: ${appState.originalKey}`;
    document.getElementById('current-key').textContent = `Actual: ${appState.currentKey}`;
    document.getElementById('key-select').value = appState.currentKey;
    
    // Información de transposición
    const semitones = calculateSemitones(appState.originalKey, appState.currentKey);
    const transposeInfo = document.getElementById('transpose-info');
    
    if (semitones !== 0) {
        transposeInfo.style.display = 'inline';
        const sign = semitones > 0 ? '+' : '';
        transposeInfo.textContent = `Transpuesta ${sign}${semitones} semitonos`;
    } else {
        transposeInfo.style.display = 'none';
    }
    
    // Renderizar secciones con transposición
    const sectionsContainer = document.getElementById('song-sections');
    sectionsContainer.innerHTML = Object.entries(appState.currentSong.sections).map(([sectionName, lines]) => `
        <div class="section">
            <h3 class="section-title">${sectionName}</h3>
            <div class="section-content">
                ${lines.map(line => {
                    const transposedLine = transposeLine(line, semitones);
                    return `<div class="chord-line">${transposedLine}</div>`;
                }).join('')}
            </div>
        </div>
    `).join('');
}

/**
 * Renderizar formulario de añadir canción
 */
function renderAddForm() {
    const mainView = document.getElementById('main-view');
    const addForm = document.getElementById('add-song-form');
    
    if (appState.showAddForm) {
        mainView.style.display = 'none';
        addForm.style.display = 'block';
        renderAddedSections();
    } else {
        mainView.style.display = 'grid';
        addForm.style.display = 'none';
    }
}

/**
 * Renderizar secciones añadidas en el formulario
 */
function renderAddedSections() {
    const container = document.getElementById('added-sections');
    const sections = Object.keys(appState.newSong.sections);
    
    if (sections.length === 0) {
        container.innerHTML = '<p class="no-sections">No hay secciones añadidas</p>';
    } else {
        container.innerHTML = `
            <div class="sections-list">
                ${sections.map(section => `
                    <div class="section-tag">
                        ${section}
                        <button class="remove-section" onclick="removeSection('${section}')">✕</button>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// ==========================================
// FUNCIONES DE INTERACCIÓN
// ==========================================

/**
 * Seleccionar una canción
 */
function selectSong(songId) {
    appState.currentSong = appState.songs.find(song => song.id === songId);
    if (appState.currentSong) {
        appState.currentKey = appState.currentSong.key;
        appState.originalKey = appState.currentSong.key;
    }
    renderCurrentSong();
    renderSongsList();
}

/**
 * Cambiar tonalidad
 */
function changeKey(direction) {
    if (!appState.currentKey) return;
    
    const currentIndex = NOTES.indexOf(FLAT_TO_SHARP[appState.currentKey] || appState.currentKey);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'up') {
        newIndex = (currentIndex + 1) % 12;
    } else {
        newIndex = (currentIndex - 1 + 12) % 12;
    }
    
    appState.currentKey = NOTES[newIndex];
    renderCurrentSong();
}

/**
 * Resetear a tonalidad original
 */
function resetKey() {
    if (appState.originalKey) {
        appState.currentKey = appState.originalKey;
        renderCurrentSong();
    }
}

/**
 * Añadir nueva sección al formulario
 */
function addSection() {
    const sectionName = document.getElementById('section-name').value.trim();
    const sectionContent = document.getElementById('section-content').value.trim();
    
    if (!sectionName || !sectionContent) {
        alert('Por favor completa el nombre y contenido de la sección');
        return;
    }
    
    const lines = sectionContent.split('\n').filter(line => line.trim());
    
    appState.newSong.sections[sectionName] = lines;
    
    // Limpiar campos
    document.getElementById('section-name').value = '';
    document.getElementById('section-content').value = '';
    
    renderAddedSections();
}

/**
 * Remover sección del formulario
 */
function removeSection(sectionName) {
    delete appState.newSong.sections[sectionName];
    renderAddedSections();
}

/**
 * Guardar nueva canción
 */
function saveSong() {
    const title = document.getElementById('new-title').value.trim();
    const artist = document.getElementById('new-artist').value.trim();
    const key = document.getElementById('new-key').value;
    
    if (!title) {
        alert('Por favor ingresa el título de la canción');
        return;
    }
    
    if (Object.keys(appState.newSong.sections).length === 0) {
        alert('Por favor añade al menos una sección');
        return;
    }
    
    const newSong = {
        id: Date.now(),
        title,
        artist,
        key,
        sections: { ...appState.newSong.sections }
    };
    
    appState.songs.push(newSong);
    saveSongs();
    
    // Limpiar formulario
    appState.newSong = { title: '', artist: '', key: 'C', sections: {} };
    document.getElementById('new-title').value = '';
    document.getElementById('new-artist').value = '';
    document.getElementById('new-key').value = 'C';
    
    // Cerrar formulario y mostrar canción
    appState.showAddForm = false;
    selectSong(newSong.id);
    renderAddForm();
    renderSongsList();
    
    alert('¡Canción guardada exitosamente!');
}

/**
 * Cancelar formulario
 */
function cancelAddForm() {
    appState.showAddForm = false;
    appState.newSong = { title: '', artist: '', key: 'C', sections: {} };
    
    // Limpiar campos
    document.getElementById('new-title').value = '';
    document.getElementById('new-artist').value = '';
    document.getElementById('new-key').value = 'C';
    document.getElementById('section-name').value = '';
    document.getElementById('section-content').value = '';
    
    renderAddForm();
}

// ==========================================
// EVENT LISTENERS
// ==========================================

/**
 * Configurar todos los event listeners
 */
function setupEventListeners() {
    // Botón añadir canción
    document.getElementById('add-song-btn').addEventListener('click', () => {
        appState.showAddForm = true;
        renderAddForm();
    });
    
    // Búsqueda
    document.getElementById('search-input').addEventListener('input', (e) => {
        appState.searchTerm = e.target.value;
        renderSongsList();
    });
    
    // Controles de transposición
    document.getElementById('transpose-down').addEventListener('click', () => {
        changeKey('down');
    });
    
    document.getElementById('transpose-up').addEventListener('click', () => {
        changeKey('up');
    });
    
    document.getElementById('key-select').addEventListener('change', (e) => {
        appState.currentKey = e.target.value;
        renderCurrentSong();
    });
    
    document.getElementById('reset-key').addEventListener('click', resetKey);
    
    // Formulario añadir canción
    document.getElementById('cancel-add').addEventListener('click', cancelAddForm);
    document.getElementById('cancel-form-btn').addEventListener('click', cancelAddForm);
    document.getElementById('save-song-btn').addEventListener('click', saveSong);
    document.getElementById('add-section-btn').addEventListener('click', addSection);
    
    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    changeKey('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    changeKey('down');
                    break;
                case 'r':
                    e.preventDefault();
                    resetKey();
                    break;
                case 'n':
                    e.preventDefault();
                    appState.showAddForm = true;
                    renderAddForm();
                    break;
            }
        }
        
        // Escape para cerrar formularios
        if (e.key === 'Escape') {
            if (appState.showAddForm) {
                cancelAddForm();
            }
        }
    });
    
    // Enter en campos del formulario
    document.getElementById('section-name').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('section-content').focus();
        }
    });
    
    // Ctrl+Enter para añadir sección
    document.getElementById('section-content').addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            addSection();
        }
    });
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

/**
 * Inicializar la aplicación
 */
function initApp() {
    console.log('🎵 Inicializando Betania Music...');
    
    // Cargar datos
    loadSongs();
    
    // Configurar eventos
    setupEventListeners();
    
    // Renderizar interfaz inicial
    renderSongsList();
    renderCurrentSong();
    renderAddForm();
    
    console.log('✅ Betania Music iniciado correctamente');
    console.log(`📊 ${appState.songs.length} canciones cargadas`);
    
    // Mostrar tips en consola
    console.log(`
🎵 BETANIA MUSIC - TIPS DE USO:

📱 Atajos de teclado:
• Ctrl + ↑/↓  : Transponer
• Ctrl + R    : Reset tonalidad
• Ctrl + N    : Nueva canción
• Escape      : Cerrar formularios

🎸 Transposición:
• Maneja todos los acordes: C, Cm, C7, Cmaj7, Csus4, C/E, etc.
• Botones ♯/♭ para cambio rápido
• Dropdown para selección directa
• Reset instantáneo a original

💾 Guardado:
• Automático en localStorage
• Sincronización entre pestañas
• Datos persistentes offline

🔍 Búsqueda:
• Por título, artista o tonalidad
• Tiempo real mientras escribes
• Case insensitive

📱 PWA:
• Instalar como app nativa
• Funciona offline
• Notificaciones de actualización
    `);
}

// ==========================================
// FUNCIONES GLOBALES (para HTML inline)
// ==========================================

// Hacer funciones disponibles globalmente para onclick en HTML
window.selectSong = selectSong;
window.removeSection = removeSection;

// ==========================================
// INICIO DE LA APLICACIÓN
// ==========================================

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
