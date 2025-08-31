// ===== DATOS DE CANCIONES (Ejemplo) =====
const songsData = [
    {
        id: 1,
        title: "Digno es el Cordero",
        artist: "Hillsong",
        key: "G",
        lyrics: `[Verso 1]
[G]Digno es el [C]Cordero que fue in[D]molado
[Em]Santo, santo es [C]Él
[G]Levanten sus [C]voces, toda cre[D]ación
[Em]Adoren al [C]Rey

[Coro]
[G]Cantaremos, [D]aleluya
[Em]El Cordero que fue in[C]molado ha resu[G]citado
[D]Majestuoso en [Em]gloria, poderoso en [C]amor
[G]Nuestro Dios ha triun[D]fado glo[G]riosamente

[Verso 2]
[G]Digno es el [C]Cordero que fue in[D]molado
[Em]Digno es el [C]Rey
[G]Levanten sus [C]voces, toda na[D]ción
[Em]Proclamen Su [C]nombre`
    },
    {
        id: 2,
        title: "Cuán Grande es Él",
        artist: "Tradicional",
        key: "C",
        lyrics: `[Verso 1]
[C]Señor mi Dios, al [F]contemplar los [C]cielos
El firmamento [G]y las estrellas [C]mil
Al oír tu voz en [F]los potentes [C]truenos
Y ver brillar el [G]sol en su ce[C]nit

[Coro]
[C]Mi corazón en[F]tona la can[C]ción
Cuán grande es [G]Él, cuán grande es [C]Él
Mi corazón en[F]tona la can[C]ción
Cuán grande es [G]Él, cuán grande es [C]Él

[Verso 2]
[C]Al recorrer los [F]montes y los [C]valles
Y ver las bellas [G]flores al pas[C]ar
Al escuchar el [F]canto de las [C]aves
Y el murmurar del [G]claro manan[C]tial`
    },
    {
        id: 3,
        title: "Poderoso Dios",
        artist: "Miel San Marcos",
        key: "Am",
        lyrics: `[Verso 1]
[Am]Poderoso [F]Dios, majes[C]tuoso
[G]Rey de reyes [Am]eres Tú
[Am]Admirable [F]Dios, victo[C]rioso
[G]Príncipe de [Am]paz

[Pre-Coro]
[F]No hay nadie [C]como Tú
[G]No hay nadie [Am]como Tú
[F]En toda la [C]tierra
[G]No hay nadie como [Am]Tú

[Coro]
[F]Levanto mis [C]manos
[G]Proclamo Tu [Am]nombre
[F]Eres digno de [C]gloria
[G]Eres digno de [Am]honor
[F]Levanto mis [C]manos
[G]Proclamo Tu [Am]nombre
[F]Por siempre y [C]siempre
[G]Serás mi Se[Am]ñor`
    }
];

// ===== VARIABLES GLOBALES =====
let currentSong = null;
let filteredSongs = [...songsData];

// ===== ELEMENTOS DOM =====
const elements = {
    // Navegación
    navToggle: document.getElementById('navToggle'),
    navList: document.getElementById('navList'),
    navLinks: document.querySelectorAll('.nav-link'),
    
    // Sidebar
    songsSidebar: document.getElementById('songsSidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    
    // Búsqueda y lista
    searchInput: document.getElementById('searchInput'),
    songsList: document.getElementById('songsList'),
    
    // Contenido de canción
    songDisplay: document.getElementById('songDisplay'),
    
    // Botones principales
    viewSongsBtn: document.getElementById('viewSongsBtn')
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

function formatLyrics(lyrics) {
    if (!lyrics) return '';
    
    // Procesar las líneas
    const lines = lyrics.split('\n');
    let formattedHtml = '';
    let currentSection = '';
    
    lines.forEach(line => {
        line = line.trim();
        if (!line) {
            formattedHtml += '<br>';
            return;
        }
        
        // Detectar secciones como [Verso 1], [Coro], etc.
        const sectionMatch = line.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            if (currentSection) {
                formattedHtml += '</div>';
            }
            currentSection = sectionMatch[1].toLowerCase();
            formattedHtml += `<div class="section ${currentSection}">`;
            formattedHtml += `<div class="section-label">${sectionMatch[1]}</div>`;
            return;
        }
        
        // Procesar líneas con acordes
        const chordMatches = line.match(/\[([^\]]+)\]/g);
        if (chordMatches) {
            // Es una línea de acordes
            formattedHtml += '<div class="chord-line">';
            let processedLine = line;
            chordMatches.forEach(match => {
                const chord = match.replace(/[\[\]]/g, '');
                processedLine = processedLine.replace(match, `<span class="chord">${chord}</span>`);
            });
            formattedHtml += processedLine;
            formattedHtml += '</div>';
        } else {
            // Es una línea de letra normal
            formattedHtml += `<div class="lyrics-line">${line}</div>`;
        }
    });
    
    if (currentSection) {
        formattedHtml += '</div>';
    }
    
    return formattedHtml;
}

// ===== FUNCIONES DE NAVEGACIÓN =====
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('fade-in');
    }
    
    // Actualizar navegación activa
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    // Cerrar menú móvil si está abierto
    if (elements.navList) {
        elements.navList.classList.remove('active');
    }
}

// ===== FUNCIONES DE CANCIONES =====
function renderSongsList() {
    if (!elements.songsList) return;
    
    elements.songsList.innerHTML = '';
    
    filteredSongs.forEach(song => {
        const li = document.createElement('li');
        li.className = 'song-item';
        
        li.innerHTML = `
            <div class="song-link" data-song-id="${song.id}">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist} • Clave: ${song.key}</div>
            </div>
        `;
        
        const songLink = li.querySelector('.song-link');
        songLink.addEventListener('click', () => selectSong(song.id));
        
        elements.songsList.appendChild(li);
    });
}

function selectSong(songId) {
    const song = songsData.find(s => s.id === songId);
    if (!song) return;
    
    currentSong = song;
    displaySong(song);
    
    // Actualizar estado activo en la lista
    document.querySelectorAll('.song-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-song-id="${songId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // En móvil, cerrar el sidebar después de seleccionar
    if (isMobile() && elements.songsSidebar) {
        elements.songsSidebar.classList.remove('active');
    }
}

function displaySong(song) {
    if (!elements.songDisplay || !song) return;
    
    const formattedLyrics = formatLyrics(song.lyrics);
    
    elements.songDisplay.innerHTML = `
        <div class="song-info">
            <h2>${song.title}</h2>
            <div class="artist">${song.artist}</div>
            <div class="key">Clave: ${song.key}</div>
        </div>
        <div class="lyrics-container">
            ${formattedLyrics}
        </div>
    `;
    
    elements.songDisplay.classList.add('fade-in');
    
    // Scroll al inicio del contenido de la canción
    elements.songDisplay.scrollTop = 0;
}

function filterSongs(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        filteredSongs = [...songsData];
    } else {
        filteredSongs = songsData.filter(song => 
            song.title.toLowerCase().includes(term) ||
            song.artist.toLowerCase().includes(term)
        );
    }
    
    renderSongsList();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Navegación principal
    if (elements.navToggle && elements.navList) {
        elements.navToggle.addEventListener('click', () => {
            elements.navList.classList.toggle('active');
        });
    }
    
    // Links de navegación
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sectionId = href.substring(1);
                showSection(sectionId);
                
                // Scroll suave al inicio
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
    
    // Botón "Ver Canciones"
    if (elements.viewSongsBtn) {
        elements.viewSongsBtn.addEventListener('click', () => {
            showSection('songs');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Sidebar toggle (móvil)
    if (elements.sidebarToggle) {
        elements.sidebarToggle.addEventListener('click', () => {
            if (elements.songsSidebar) {
                elements.songsSidebar.classList.remove('active');
            }
        });
    }
    
    // Mobile menu button
    if (elements.mobileMenuBtn) {
        elements.mobileMenuBtn.addEventListener('click', () => {
            if (elements.songsSidebar) {
                elements.songsSidebar.classList.toggle('active');
            }
        });
    }
    
    // Búsqueda de canciones
    if (elements.searchInput) {
        const debouncedFilter = debounce((searchTerm) => {
            filterSongs(searchTerm);
        }, 300);
        
        elements.searchInput.addEventListener('input', (e) => {
            debouncedFilter(e.target.value);
        });
    }
    
    // Cerrar sidebar al hacer click fuera (móvil)
    document.addEventListener('click', (e) => {
        if (isMobile() && 
            elements.songsSidebar && 
            elements.songsSidebar.classList.contains('active')) {
            
            if (!elements.songsSidebar.contains(e.target) && 
                !elements.mobileMenuBtn.contains(e.target)) {
                elements.songsSidebar.classList.remove('active');
            }
        }
    });
    
    // Manejar resize de ventana
    window.addEventListener('resize', handleWindowResize);
    
    // Manejar navegación con teclado
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// ===== FUNCIONES DE EVENTOS =====
function handleWindowResize() {
    // Cerrar sidebar en móvil al cambiar a desktop
    if (!isMobile() && elements.songsSidebar) {
        elements.songsSidebar.classList.remove('active');
    }
    
    // Cerrar menú de navegación al cambiar tamaño
    if (elements.navList && !isMobile()) {
        elements.navList.classList.remove('active');
    }
}

function handleKeyboardNavigation(e) {
    // ESC para cerrar sidebar y menús
    if (e.key === 'Escape') {
        if (elements.songsSidebar) {
            elements.songsSidebar.classList.remove('active');
        }
        if (elements.navList) {
            elements.navList.classList.remove('active');
        }
    }
    
    // Enter en search input
    if (e.key === 'Enter' && e.target === elements.searchInput) {
        e.preventDefault();
        // Seleccionar primera canción filtrada si existe
        if (filteredSongs.length > 0) {
            selectSong(filteredSongs[0].id);
        }
    }
}

// ===== FUNCIONES DE INICIALIZACIÓN =====
function initializeApp() {
    console.log('Inicializando Betania Music...');
    
    // Renderizar lista inicial de canciones
    renderSongsList();
    
    // Mostrar sección de inicio por defecto
    showSection('home');
    
    // Setup event listeners
    setupEventListeners();
    
    // Cargar logo si existe
    loadLogo();
    
    console.log('Aplicación inicializada correctamente');
}

function loadLogo() {
    const logo = document.getElementById('logo');
    if (!logo) return;
    
    // Manejar error de carga del logo
    logo.addEventListener('error', () => {
        console.log('Logo no encontrado, usando texto como fallback');
        logo.style.display = 'none';
        
        // Crear un logo de texto como fallback
        const textLogo = document.createElement('div');
        textLogo.className = 'text-logo';
        textLogo.textContent = 'BM';
        textLogo.style.cssText = `
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, var(--primary-blue), var(--teal-accent));
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.875rem;
        `;
        
        logo.parentNode.insertBefore(textLogo, logo);
    });
}

// ===== FUNCIONES DE UTILIDAD ADICIONALES =====
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function addToFavorites(songId) {
    // Funcionalidad futura para favoritos
    console.log(`Canción ${songId} agregada a favoritos`);
}

function shareSong(songId) {
    // Funcionalidad futura para compartir
    const song = songsData.find(s => s.id === songId);
    if (song && navigator.share) {
        navigator.share({
            title: song.title,
            text: `${song.title} - ${song.artist}`,
            url: window.location.href
        });
    }
}

// ===== FUNCIONES DE DATOS =====
function addSong(songData) {
    const newId = Math.max(...songsData.map(s => s.id)) + 1;
    const newSong = { ...songData, id: newId };
    songsData.push(newSong);
    filteredSongs = [...songsData];
    renderSongsList();
    return newSong;
}

function getSongById(id) {
    return songsData.find(song => song.id === id);
}

function getSongsByArtist(artist) {
    return songsData.filter(song => 
        song.artist.toLowerCase().includes(artist.toLowerCase())
    );
}

// ===== MANEJO DE ESTADOS =====
function updateActiveStates() {
    // Actualizar enlaces de navegación
    const currentHash = window.location.hash || '#home';
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentHash) {
            link.classList.add('active');
        }
    });
}

// ===== OPTIMIZACIONES DE RENDIMIENTO =====
function lazyLoadContent() {
    // Implementar lazy loading para imágenes futuras si es necesario
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// ===== FUNCIONES DE RESPONSIVE =====
function handleResponsiveChanges() {
    const mobile = isMobile();
    
    // Ajustar comportamiento del sidebar
    if (elements.songsSidebar) {
        if (!mobile) {
            elements.songsSidebar.classList.remove('active');
        }
    }
    
    // Ajustar navegación
    if (elements.navList && !mobile) {
        elements.navList.classList.remove('active');
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Pequeño delay para asegurar que todos los elementos estén cargados
    setTimeout(() => {
        initializeApp();
        lazyLoadContent();
        handleResponsiveChanges();
    }, 100);
});

// ===== EVENT LISTENERS GLOBALES =====
window.addEventListener('load', () => {
    // Manejar cambios de hash en la URL
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash || '#home';
        const sectionId = hash.substring(1);
        showSection(sectionId);
        updateActiveStates();
    });
    
    // Inicializar basado en hash actual
    const currentHash = window.location.hash || '#home';
    const currentSection = currentHash.substring(1);
    showSection(currentSection);
    updateActiveStates();
});

// ===== MANEJO DE ERRORES =====
window.addEventListener('error', (e) => {
    console.error('Error en la aplicación:', e.error);
});

// ===== EXPORTAR FUNCIONES PARA USO EXTERNO =====
window.BetaniaMusic = {
    selectSong,
    filterSongs,
    addSong,
    getSongById,
    getSongsByArtist,
    showSection,
    scrollToTop
};
