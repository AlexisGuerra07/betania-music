// Base de datos de canciones
const songs = {
    'sublime-gracia': {
        title: 'Sublime Gracia',
        key: 'C',
        originalKey: 'C',
        content: `[C]                [Am]              [F]           [G]
Sublime gracia del Señor que a un infeliz salvó
[Am]              [F]
Perdido me encontró, ciego me hizo ver

[C]                [Am]              [F]           [G]
Su gracia me enseñó mi corazón a temer
[Am]              [F]              [C]
Mis dudas ahuyentó, ¡qué dulce es su amor!

<div class="section-title">[Coro]</div>
[F]              [C]              [G]           [Am]
Sublime gracia, dulce son, que salvó al pecador
[F]              [C]              [G]           [C]
Perdido fui, mas ya me halló, soy suyo por amor`
    },
    'casa-oracion': {
        title: 'Casa de Oración',
        key: 'G',
        originalKey: 'G',
        content: `[G]              [C]              [G]
Tu casa es casa de oración
[D]              [G]
Lugar de adoración
[C]              [G]              [Em]
Donde tu pueblo viene a ti
[C]              [D]              [G]
A buscar tu bendición

<div class="section-title">[Coro]</div>
[C]              [G]              [D]              [G]
Santo, santo, santo es el Señor
[C]              [G]              [D]              [G]
Toda la tierra llena está de su gloria`
    },
    'es-el': {
        title: 'Es Él',
        key: 'D',
        originalKey: 'D',
        content: `[D]              [A]              [Bm]              [G]
Es Él quien me sostiene cada día
[D]              [A]              [G]              [D]
Es Él quien me da fuerzas para andar
[Bm]              [G]              [D]              [A]
Es Él mi roca fuerte, mi escudo
[G]              [A]              [D]
En Él confío, Él me guardará

<div class="section-title">[Coro]</div>
[G]              [D]              [A]              [Bm]
Es Él, es Él, mi Salvador
[G]              [D]              [A]              [D]
Es Él quien me amó y me salvó`
    },
    'quiero-adorarte': {
        title: 'Quiero Adorarte',
        key: 'A',
        originalKey: 'A',
        content: `[A]              [D]              [A]
Quiero adorarte, mi buen Jesús
[E]              [A]
Con todo mi corazón
[D]              [A]              [F#m]
Postrado ante ti, mi Salvador
[D]              [E]              [A]
Recibe mi adoración

<div class="section-title">[Coro]</div>
[D]              [A]              [E]              [F#m]
Santo, santo eres Tú, Señor
[D]              [A]              [E]              [A]
Digno de adoración`
    },
    'tu-fidelidad': {
        title: 'Tu Fidelidad',
        key: 'E',
        originalKey: 'E',
        content: `[E]              [B]              [C#m]              [A]
Tu fidelidad es grande, tu fidelidad
[E]              [B]              [A]              [E]
Incomparable es tu fidelidad
[C#m]              [A]              [E]              [B]
Cada mañana veo tu amor
[A]              [B]              [E]
Tu fidelidad, Señor

<div class="section-title">[Coro]</div>
[A]              [E]              [B]              [C#m]
Grande es tu fidelidad, oh Dios
[A]              [E]              [B]              [E]
Por siempre durará tu amor`
    }
};

// Círculo de quintas para transposición
const keyCircle = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab'];

// Mapeo de acordes para transposición
const chordTranspose = {
    'C': { 'C': 0, 'Dm': 1, 'Em': 2, 'F': 3, 'G': 4, 'Am': 5, 'Bdim': 6 },
    'G': { 'G': 0, 'Am': 1, 'Bm': 2, 'C': 3, 'D': 4, 'Em': 5, 'F#dim': 6 },
    'D': { 'D': 0, 'Em': 1, 'F#m': 2, 'G': 3, 'A': 4, 'Bm': 5, 'C#dim': 6 },
    'A': { 'A': 0, 'Bm': 1, 'C#m': 2, 'D': 3, 'E': 4, 'F#m': 5, 'G#dim': 6 },
    'E': { 'E': 0, 'F#m': 1, 'G#m': 2, 'A': 3, 'B': 4, 'C#m': 5, 'D#dim': 6 },
    'F': { 'F': 0, 'Gm': 1, 'Am': 2, 'Bb': 3, 'C': 4, 'Dm': 5, 'Edim': 6 }
};

// Variables globales
let currentSong = 'sublime-gracia';
let currentTranspose = 0;
let deferredPrompt = null;
let isInstalled = false;

// =====================================
// PWA FUNCTIONALITY
// =====================================

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registrado:', registration);
            })
            .catch(error => {
                console.log('SW registro falló:', error);
            });
    });
}

// Detectar si ya está instalada
function detectIfInstalled() {
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        isInstalled = true;
        hideBanner();
        return true;
    }
    return false;
}

// PWA Install Events
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt fired');
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
});

window.addEventListener('appinstalled', () => {
    console.log('App instalada');
    isInstalled = true;
    hideInstallButton();
    hideBanner();
    showInstalledMessage();
});

function showInstallButton() {
    const btn = document.getElementById('installButton');
    if (btn && !isInstalled) {
        btn.classList.add('show');
    }
}

function hideInstallButton() {
    const btn = document.getElementById('installButton');
    if (btn) {
        btn.classList.remove('show');
    }
}

async function installApp() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Resultado: ${outcome}`);
    
    deferredPrompt = null;
    hideInstallButton();
}

function hideBanner() {
    const banner = document.getElementById('pwa-banner');
    if (banner) {
        banner.classList.add('hidden');
    }
}

function showInstalledMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #76d802;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 1001;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-weight: 600;
        text-align: center;
    `;
    message.innerHTML = '🎉 ¡Betania Music instalada correctamente!';
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 4000);
}

// =====================================
// SONG FUNCTIONALITY
// =====================================

function loadSong(songId) {
    if (!songs[songId]) return;
    
    currentSong = songId;
    currentTranspose = 0;
    
    const song = songs[songId];
    
    // Restaurar tonalidad original
    song.key = song.originalKey;
    
    // Actualizar UI
    document.getElementById('currentSongTitle').textContent = song.title;
    document.getElementById('currentKey').textContent = song.key;
    
    updateSongContent();
    updateActiveListItem(songId);
    
    // Guardar en localStorage
    localStorage.setItem('lastSong', songId);
}

function updateSongContent() {
    const song = songs[currentSong];
    let content = song.content;
    
    // Procesar acordes y convertir a HTML
    content = content.replace(/\[([^\]]+)\]/g, '<span class="chord" onclick="showChordInfo(\'$1\')">$1</span>');
    
    document.getElementById('songContent').innerHTML = content;
}

function updateActiveListItem(songId) {
    // Remover clase active de todos
    document.querySelectorAll('.song-list li').forEach(li => {
        li.classList.remove('active');
    });
    
    // Agregar clase active al actual
    const activeItem = document.querySelector(`[data-song="${songId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

function transpose(direction) {
    const song = songs[currentSong];
    const currentKeyIndex = keyCircle.indexOf(song.key);
    
    if (currentKeyIndex === -1) return;
    
    const newKeyIndex = (currentKeyIndex + direction + keyCircle.length) % keyCircle.length;
    const newKey = keyCircle[newKeyIndex];
    
    // Actualizar la tonalidad de la canción
    song.key = newKey;
    currentTranspose += direction;
    
    // Actualizar UI
    document.getElementById('currentKey').textContent = newKey;
    
    // Aquí podrías agregar lógica más compleja para transponer acordes
    console.log(`Transponiendo ${direction > 0 ? 'subiendo' : 'bajando'} a ${newKey}`);
}

function resetSong() {
    const song = songs[currentSong];
    song.key = song.originalKey;
    currentTranspose = 0;
    
    document.getElementById('currentKey').textContent = song.key;
    updateSongContent();
    
    showMessage('🔄 Canción restaurada a tonalidad original');
}

// =====================================
// BUTTON FUNCTIONS
// =====================================

function toggleEdit() {
    showMessage('✏️ Función de edición - En desarrollo');
}

function addToSetlist() {
    const song = songs[currentSong];
    showMessage(`➕ "${song.title}" añadida al setlist`);
    
    // Aquí puedes agregar lógica para manejar setlists
    let setlist = JSON.parse(localStorage.getItem('setlist') || '[]');
    if (!setlist.includes(currentSong)) {
        setlist.push(currentSong);
        localStorage.setItem('setlist', JSON.stringify(setlist));
    }
}

function showChords() {
    showMessage('🎸 Diagramas de acordes - En desarrollo');
}

function showChordInfo(chord) {
    showMessage(`🎼 Información del acorde: ${chord}`);
}

// =====================================
// UTILITY FUNCTIONS
// =====================================

function showMessage(text) {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        z-index: 1002;
        font-weight: 600;
        text-align: center;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
    `;
    message.innerHTML = text;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 2000);
}

function hideSplash() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.classList.add('hidden');
        setTimeout(() => {
            splash.style.display = 'none';
        }, 500);
    }
}

// =====================================
// EVENT LISTENERS
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Betania Music cargando...');
    
    // Ocultar splash screen
    setTimeout(() => {
        hideSplash();
    }, 2000);
    
    // Detectar si ya está instalada
    detectIfInstalled();
    
    // Setup song list clicks
    document.querySelectorAll('.song-list li').forEach(li => {
        li.addEventListener('click', () => {
            loadSong(li.dataset.song);
        });
    });
    
    // Setup install button
    const installBtn = document.getElementById('installButton');
    if (installBtn) {
        installBtn.addEventListener('click', installApp);
    }
    
    // Setup banner install button
    const bannerBtn = document.getElementById('install-banner-btn');
    if (bannerBtn) {
        bannerBtn.addEventListener('click', installApp);
    }
    
    // Cargar última canción o la primera
    const lastSong = localStorage.getItem('lastSong') || 'sublime-gracia';
    loadSong(lastSong);
    
    console.log('Betania Music cargada correctamente');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                transpose(1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                transpose(-1);
                break;
            case 'r':
                e.preventDefault();
                resetSong();
                break;
        }
    }
});

// Detectar si está en standalone mode
if (window.matchMedia('(display-mode: standalone)').matches) {
    document.body.classList.add('standalone');
}
