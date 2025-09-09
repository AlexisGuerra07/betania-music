/**
 * BETANIA MUSIC - VERSIÓN SIMPLE
 * Solo las funciones básicas que funcionan
 */

// ==========================================
// DATOS BÁSICOS
// ==========================================

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Base de datos simple de canciones
const SONGS = [
    {
        id: 1,
        title: "Es El",
        artist: "TTL",
        key: "C",
        sections: [
            {
                name: "Estrofa",
                chords: "C           Am\nF           G",
                lyrics: "Es el Señor quien nos ama\nCon amor eterno"
            },
            {
                name: "Coro", 
                chords: "F           C\nG           Am",
                lyrics: "Aleluya, aleluya\nCantamos su amor"
            }
        ]
    },
    {
        id: 2,
        title: "Casa de Oración",
        artist: "Betania",
        key: "G",
        sections: [
            {
                name: "Estrofa",
                chords: "G           Em\nC           D",
                lyrics: "Tu casa es casa de oración\nDonde tu pueblo se reúne"
            },
            {
                name: "Coro",
                chords: "C           G\nD           Em",
                lyrics: "Santo, santo es el Señor\nEn su presencia estamos"
            }
        ]
    },
    {
        id: 3,
        title: "Duelo de mis Días",
        artist: "Betania",
        key: "D",
        sections: [
            {
                name: "Fuente",
                chords: "C\n            Bb\nAm7\nGm7\nF\n                G",
                lyrics: "Él volverá!\nSoberano en poder\nÉl volverá!\nY el gobierno en Él está\nF\nVean! Él traerá\nG\nEn sus manos la recompensa"
            }
        ]
    }
];

// Variables globales
let currentSong = null;
let currentKey = 'C';
let originalKey = 'C';

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    loadSongList();
});

// ==========================================
// FUNCIONES PRINCIPALES
// ==========================================

function loadSongList() {
    const container = document.getElementById('songsContainer');
    
    container.innerHTML = SONGS.map(song => `
        <div class="song-item" onclick="viewSong(${song.id})">
            <div class="song-info">
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
            <div class="song-key">${song.key}</div>
        </div>
    `).join('');
}

function viewSong(songId) {
    currentSong = SONGS.find(song => song.id === songId);
    if (!currentSong) return;
    
    originalKey = currentSong.key;
    currentKey = currentSong.key;
    
    // Actualizar interfaz
    document.getElementById('currentSongTitle').textContent = currentSong.title;
    document.getElementById('currentKey').textContent = currentKey;
    
    // Mostrar contenido
    renderSongContent();
    
    // Cambiar vista
    document.getElementById('songList').classList.add('hidden');
    document.getElementById('songView').classList.remove('hidden');
}

function showSongList() {
    document.getElementById('songView').classList.add('hidden');
    document.getElementById('songList').classList.remove('hidden');
}

function renderSongContent() {
    if (!currentSong) return;
    
    const container = document.getElementById('songContent');
    const semitones = calculateSemitones(originalKey, currentKey);
    
    container.innerHTML = currentSong.sections.map(section => `
        <div class="section">
            <div class="section-title">${section.name}</div>
            <div class="chords">${transposeLine(section.chords, semitones)}</div>
            <div class="lyrics">${section.lyrics}</div>
        </div>
    `).join('');
}

// ==========================================
// TRANSPOSICIÓN
// ==========================================

function calculateSemitones(fromKey, toKey) {
    const fromIndex = NOTES.indexOf(fromKey);
    const toIndex = NOTES.indexOf(toKey);
    
    if (fromIndex === -1 || toIndex === -1) return 0;
    
    let semitones = toIndex - fromIndex;
    if (semitones < 0) semitones += 12;
    
    return semitones;
}

function transposeChord(chord, semitones) {
    if (!chord || semitones === 0) return chord;
    
    // Patrón simple para detectar acordes
    const match = chord.match(/^([A-G][#b]?)(.*)?$/);
    if (!match) return chord;
    
    const [, rootNote, suffix] = match;
    const noteIndex = NOTES.indexOf(rootNote);
    
    if (noteIndex === -1) return chord;
    
    const newIndex = (noteIndex + semitones) % 12;
    const newNote = NOTES[newIndex];
    
    return newNote + (suffix || '');
}

function transposeLine(line, semitones) {
    if (!line || semitones === 0) return line;
    
    return line.split(/(\s+)/).map(word => {
        // Si parece un acorde, transponerlo
        if (/^[A-G][#b]?/.test(word.trim())) {
            return transposeChord(word, semitones);
        }
        return word;
    }).join('');
}

function changeKey(direction) {
    const currentIndex = NOTES.indexOf(currentKey);
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) newIndex = 11;
    if (newIndex > 11) newIndex = 0;
    
    currentKey = NOTES[newIndex];
    document.getElementById('currentKey').textContent = currentKey;
    
    renderSongContent();
}

// ==========================================
// FUNCIONES GLOBALES
// ==========================================

// Hacer funciones accesibles globalmente para onclick
window.viewSong = viewSong;
window.showSongList = showSongList;
window.changeKey = changeKey;
