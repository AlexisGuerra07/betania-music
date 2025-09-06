/**
 * ==========================================
 * 🎵 BETANIA MUSIC - SISTEMA COMPLETO JS
 * CON DETECCIÓN AUTOMÁTICA DE PARTES
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

/**
 * Función principal de detección automática
 */
function autoDetectSections(text) {
    if (!text.trim()) return {};
    
    const sections = {};
    
    // Primero, buscar etiquetas explícitas de secciones
    const foundSections = {};
    
    for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
        const matches = [...text.matchAll(pattern)];
        if (matches.length > 0) {
            foundSections[sectionName] = matches.map(match => ({
                index: match.index,
                match: match[0]
            }));
        }
    }

    // Ordenar secciones por posición en el texto
    const sortedSections = Object.entries(foundSections)
        .flatMap(([name, matches]) => 
            matches.map(match => ({ name, ...match }))
        )
        .sort((a, b) => a.index - b.index);

    if (sortedSections.length === 0) {
        // No se encontraron etiquetas explícitas, usar detección inteligente
        return smartDetection(text);
    }

    // Procesar secciones encontradas
    let textPosition = 0;
    let unassignedLines = [];
    
    for (let i = 0; i < sortedSections.length; i++) {
        const section = sortedSections[i];
        const nextSection = sortedSections[i + 1];
        
        // Contenido antes de esta sección
        if (section.index > textPosition && unassignedLines.length === 0) {
            const beforeText = text.substring(textPosition, section.index).trim();
            if (beforeText) {
                unassignedLines = beforeText.split('\n').filter(line => line.trim());
            }
        }
        
        // Encontrar el final de esta sección
        const sectionStart = section.index + section.match.length;
        const sectionEnd = nextSection ? nextSection.index : text.length;
        const sectionContent = text.substring(sectionStart, sectionEnd).trim();
        
        if (sectionContent) {
            const sectionLines = sectionContent.split('\n')
                .filter(line => line.trim())
                .map(line => line.trim());
            
            sections[section.name] = sectionLines;
        }
        
        textPosition = sectionEnd;
    }
    
    // Asignar líneas no asignadas como Intro si existen
    if (unassignedLines.length > 0) {
        sections['Intro'] = unassignedLines;
    }

    return sections;
}

/**
 * Detección inteligente cuando no hay etiquetas explícitas
 */
function smartDetection(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const sections = {};
    
    // Buscar patrones de acordes
    const chordPattern = /\b[A-G][#b]?(?:m|maj|min|sus|add|dim|aug|\d)*(?:\/[A-G][#b]?)?\b/g;
    
    let currentSection = [];
    let sectionCount = 1;
    let isInChordSection = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const hasChords = chordPattern.test(line);
        const isEmptyLine = !line;
        
        // Detectar cambios de sección por líneas vacías o cambios de patrón
        if (isEmptyLine || (i > 0 && hasChords !== isInChordSection)) {
            if (currentSection.length > 0) {
                const sectionName = guessSectionName(currentSection, sectionCount);
                sections[sectionName] = [...currentSection];
                currentSection = [];
                sectionCount++;
            }
            if (!isEmptyLine) {
                currentSection.push(line);
                isInChordSection = hasChords;
            }
        } else {
            currentSection.push(line);
            isInChordSection = hasChords;
        }
    }
    
    // Última sección
    if (currentSection.length > 0) {
        const sectionName = guessSectionName(currentSection, sectionCount);
        sections[sectionName] = currentSection;
    }
    
    return sections;
}

/**
 * Adivinar el nombre de la sección basado en el contenido
 */
function guessSectionName(lines, count) {
    const content = lines.join(' ').toLowerCase();
    
    // Palabras que sugieren coro
    const chorusWords = ['coro', 'aleluya', 'gloria', 'santo', 'alabanza', 'adorar', 'repetir'];
    // Palabras que sugieren verso/estrofa
    const verseWords = ['cuando', 'si', 'donde', 'como', 'era', 'fue', 'historia'];
    // Palabras que sugieren puente
    const bridgeWords = ['puente', 'bridge', 'solo', 'instrumental'];
    
    const hasChorusWords = chorusWords.some(word => content.includes(word));
    const hasVerseWords = verseWords.some(word => content.includes(word));
    const hasBridgeWords = bridgeWords.some(word => content.includes(word));
    
    if (hasBridgeWords) return 'Puente';
    if (hasChorusWords) return count === 1 ? 'Coro' : `Coro ${count}`;
    if (hasVerseWords || count <= 2) return `Estrofa ${count}`;
    
    return `Sección ${count}`;
}

// ==========================================
// SISTEMA DE TRANSPOSICIÓN
// ==========================================

/**
 * Transpone un acorde individual
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
 */
function transposeLine(line, semitones) {
    if (!line || typeof line !== 'string' || semitones === 0) {
        return line;
    }
    
    // Regex para encontrar acordes en la línea
    const chordPattern = /\b([A-G][#b]?(?:m|maj|min|sus|add|dim|aug|\+|\-|°|ø|M|\d)*(?:\/[A-G][#b]?)?)\b/g;
    
    return line.replace(chordPattern, (match) => {
        return transposeChord(match, semitones);
    });
}

/**
 * Calcula semitonos entre dos tonalidades
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
    },
    // Nuevos estados para detección automática
    autoDetectionMode: false,
    detectedSections: {},
    showDetectionPreview: false,
    fullSongText: ''
};

// ==========================================
// GESTIÓN DE ALMACENAMIENTO LOCAL
// ==========================================

function loadSongs() {
    try {
        const saved = localStorage.getItem('betaniaMusicSongs');
        if (saved) {
            appState.songs = JSON.parse(saved);
        } else {
            appState.songs = [...defaultSongs];
            saveSongs();
        }
    } catch (error) {
        console.error('Error cargando canciones:', error);
        appState.songs = [...defaultSongs];
    }
}

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

function renderSongsList() {
    const container = document.getElementById('songs-container');
    const countElement = document.getElementById('songs-count');
    
    const filteredSongs = appState.songs.filter(song =>
        song.title.toLowerCase().includes(appState.searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(appState.searchTerm.toLowerCase()) ||
        song.key.toLowerCase().includes(appState.searchTerm.toLowerCase())
    );
    
    countElement.textContent = `Canciones (${filteredSongs.length})`;
    
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
    
    document.getElementById('song-title').textContent = appState.currentSong.title;
    document.getElementById('song-artist').textContent = appState.currentSong.artist || 'Sin artista';
    document.getElementById('original-key').textContent = `Original: ${appState.originalKey}`;
    document.getElementById('current-key').textContent = `Actual: ${appState.currentKey}`;
    document.getElementById('key-select').value = appState.currentKey;
    
    const semitones = calculateSemitones(appState.originalKey, appState.currentKey);
    const transposeInfo = document.getElementById('transpose-info');
    
    if (semitones !== 0) {
        transposeInfo.style.display = 'inline';
        const sign = semitones > 0 ? '+' : '';
        transposeInfo.textContent = `Transpuesta ${sign}${semitones} semitonos`;
    } else {
        transposeInfo.style.display = 'none';
    }
    
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

function renderAddForm() {
    const mainView = document.getElementById('main-view');
    const addForm = document.getElementById('add-song-form');
    
    if (appState.showAddForm) {
        mainView.style.display = 'none';
        addForm.style.display = 'block';
        renderFormContent();
    } else {
        mainView.style.display = 'grid';
        addForm.style.display = 'none';
    }
}

/**
 * Renderizar contenido del formulario según el modo
 */
function renderFormContent() {
    // Actualizar botón de modo automático
    const autoBtn = document.getElementById('auto-detection-btn');
    if (autoBtn) {
        autoBtn.textContent = appState.autoDetectionMode ? '📝 Modo Manual' : '🔮 Detección Automática';
        autoBtn.classList.toggle('active', appState.autoDetectionMode);
    }
    
    // Mostrar/ocultar elementos según el modo
    const manualSection = document.getElementById('manual-sections');
    const autoSection = document.getElementById('auto-detection-section');
    
    if (manualSection && autoSection) {
        if (appState.autoDetectionMode) {
            manualSection.style.display = 'none';
            autoSection.style.display = 'block';
            renderDetectionPreview();
        } else {
            manualSection.style.display = 'block';
            autoSection.style.display = 'none';
            renderAddedSections();
        }
    }
}

/**
 * Renderizar vista previa de detección automática
 */
function renderDetectionPreview() {
    const container = document.getElementById('detection-preview');
    const sections = appState.detectedSections;
    
    if (!container) return;
    
    if (Object.keys(sections).length === 0) {
        container.innerHTML = `
            <div class="no-detection">
                <p>🎯 Pega una canción completa arriba para ver la detección automática</p>
                <div class="detection-tips">
                    <h4>💡 Consejos para mejor detección:</h4>
                    <ul>
                        <li>Usa etiquetas como "Estrofa 1:", "Coro:", "Puente:"</li>
                        <li>Separa las secciones con líneas vacías</li>
                        <li>Incluye tanto acordes como letras</li>
                    </ul>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="preview-header">
            <span>🔍 ${Object.keys(sections).length} secciones detectadas</span>
            <div class="preview-actions">
                <button onclick="acceptDetection()" class="accept-btn">✅ Aceptar</button>
                <button onclick="editDetection()" class="edit-btn">✏️ Editar</button>
                <button onclick="clearDetection()" class="clear-btn">🗑️ Limpiar</button>
            </div>
        </div>
        <div class="sections-preview">
            ${Object.entries(sections).map(([name, lines]) => `
                <div class="section-preview">
                    <div class="section-header">
                        <input type="text" value="${name}" 
                               onchange="updateSectionName('${name}', this.value)"
                               class="section-name-input">
                        <span class="line-count">${lines.length} líneas</span>
                        <button onclick="removeSectionFromDetection('${name}')" class="remove-section-btn">✕</button>
                    </div>
                    <div class="section-content-preview">
                        ${lines.slice(0, 3).map(line => `<div class="line-preview">${line}</div>`).join('')}
                        ${lines.length > 3 ? `<div class="more-lines">... y ${lines.length - 3} líneas más</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderAddedSections() {
    const container = document.getElementById('added-sections');
    const sections = Object.keys(appState.newSong.sections);
    
    if (!container) return;
    
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
// FUNCIONES DE DETECCIÓN AUTOMÁTICA
// ==========================================

/**
 * Procesar texto completo para detección automática
 */
function processFullSongText() {
    const textArea = document.getElementById('full-song-text');
    if (!textArea) return;
    
    const text = textArea.value.trim();
    if (!text) {
        appState.detectedSections = {};
        renderDetectionPreview();
        return;
    }
    
    appState.fullSongText = text;
    appState.detectedSections = autoDetectSections(text);
    renderDetectionPreview();
}

/**
 * Aceptar detección automática
 */
function acceptDetection() {
    appState.newSong.sections = { ...appState.detectedSections };
    appState.autoDetectionMode = false;
    renderFormContent();
    
    // Mostrar mensaje de éxito
    const message = document.createElement('div');
    message.className = 'success-message';
    message.textContent = `✅ ${Object.keys(appState.detectedSections).length} secciones añadidas automáticamente`;
    document.getElementById('add-song-form').appendChild(message);
    
    setTimeout(() => message.remove(), 3000);
}

/**
 * Editar detección (cambiar a modo manual con secciones pre-cargadas)
 */
function editDetection() {
    appState.newSong.sections = { ...appState.detectedSections };
    appState.autoDetectionMode = false;
    renderFormContent();
}

/**
 * Limpiar detección
 */
function clearDetection() {
    appState.detectedSections = {};
    appState.fullSongText = '';
    const textArea = document.getElementById('full-song-text');
    if (textArea) textArea.value = '';
    renderDetectionPreview();
}

/**
 * Actualizar nombre de sección en detección
 */
function updateSectionName(oldName, newName) {
    if (oldName === newName || !newName.trim()) return;
    
    const sections = appState.detectedSections;
    if (sections[oldName]) {
        sections[newName] = sections[oldName];
        delete sections[oldName];
        renderDetectionPreview();
    }
}

/**
 * Remover sección de detección
 */
function removeSectionFromDetection(sectionName) {
    delete appState.detectedSections[sectionName];
    renderDetectionPreview();
}

/**
 * Alternar modo de detección automática
 */
function toggleAutoDetection() {
    appState.autoDetectionMode = !appState.autoDetectionMode;
    
    if (appState.autoDetectionMode) {
        // Al activar, limpiar secciones manuales
        appState.newSong.sections = {};
    } else {
        // Al desactivar, mantener secciones si había detección
        if (Object.keys(appState.detectedSections).length > 0) {
            appState.newSong.sections = { ...appState.detectedSections };
        }
    }
    
    renderFormContent();
}

// ==========================================
// FUNCIONES DE INTERACCIÓN (EXISTENTES)
// ==========================================

function selectSong(songId) {
    appState.currentSong = appState.songs.find(song => song.id === songId);
    if (appState.currentSong) {
        appState.currentKey = appState.currentSong.key;
        appState.originalKey = appState.currentSong.key;
    }
    renderCurrentSong();
    renderSongsList();
}

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

function resetKey() {
    if (appState.originalKey) {
        appState.currentKey = appState.originalKey;
        renderCurrentSong();
    }
}

function addSection() {
    const sectionName = document.getElementById('section-name').value.trim();
    const sectionContent = document.getElementById('section-content').value.trim();
    
    if (!sectionName || !sectionContent) {
        alert('Por favor completa el nombre y contenido de la sección');
        return;
    }
    
    const lines = sectionContent.split('\n').filter(line => line.trim());
    
    appState.newSong.sections[sectionName] = lines;
    
    document.getElementById('section-name').value = '';
    document.getElementById('section-content').value = '';
    
    renderAddedSections();
}

function removeSection(sectionName) {
    delete appState.newSong.sections[sectionName];
    renderAddedSections();
}

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
    
    // Limpiar formulario completamente
    appState.newSong = { title: '', artist: '', key: 'C', sections: {} };
    appState.autoDetectionMode = false;
    appState.detectedSections = {};
    appState.fullSongText = '';
    
    document.getElementById('new-title').value = '';
    document.getElementById('new-artist').value = '';
    document.getElementById('new-key').value = 'C';
    
    const fullSongTextArea = document.getElementById('full-song-text');
    if (fullSongTextArea) fullSongTextArea.value = '';
    
    appState.showAddForm = false;
    selectSong(newSong.id);
    renderAddForm();
    renderSongsList();
    
    alert('¡Canción guardada exitosamente!');
}

function cancelAddForm() {
    appState.showAddForm = false;
    appState.newSong = { title: '', artist: '', key: 'C', sections: {} };
    appState.autoDetectionMode = false;
    appState.detectedSections = {};
    appState.fullSongText = '';
    
    // Limpiar todos los campos
    document.getElementById('new-title').value = '';
    document.getElementById('new-artist').value = '';
    document.getElementById('new-key').value = 'C';
    document.getElementById('section-name').value = '';
    document.getElementById('section-content').value = '';
    
    const fullSongTextArea = document.getElementById('full-song-text');
    if (fullSongTextArea) fullSongTextArea.value = '';
    
    renderAddForm();
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    // Eventos existentes
    document.getElementById('add-song-btn').addEventListener('click', () => {
        appState.showAddForm = true;
        renderAddForm();
    });
    
    document.getElementById('search-input').addEventListener('input', (e) => {
        appState.searchTerm = e.target.value;
        renderSongsList();
    });
    
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
        
        if (e.key === 'Escape') {
            if (appState.showAddForm) {
                cancelAddForm();
            }
        }
    });
    
    document.getElementById('section-name').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('section-content').focus();
        }
    });
    
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

function initApp() {
    console.log('🎵 Inicializando Betania Music con Detección Automática...');
    
    loadSongs();
    setupEventListeners();
    renderSongsList();
    renderCurrentSong();
    renderAddForm();
    
    console.log('✅ Betania Music iniciado correctamente');
    console.log(`📊 ${appState.songs.length} canciones cargadas`);
    console.log('🔮 Detección automática de partes activada');
}

// Hacer funciones disponibles globalmente
window.selectSong = selectSong;
window.removeSection = removeSection;
window.toggleAutoDetection = toggleAutoDetection;
window.processFullSongText = processFullSongText;
window.acceptDetection = acceptDetection;
window.editDetection = editDetection;
window.clearDetection = clearDetection;
window.updateSectionName = updateSectionName;
window.removeSectionFromDetection = removeSectionFromDetection;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
