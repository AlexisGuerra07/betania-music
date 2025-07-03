// 🎵 SISTEMA DE ALABANZA BETANIA V4 - JAVASCRIPT COMPLETO
// Sistema completamente funcional con todas las características

// 🎸 RUEDA TONAL COMPLETA - TODAS LAS TONALIDADES
const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_KEYS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// 🎵 BASE DE DATOS COMPLETA DE CANCIONES
const songs = [
    {
        title: "ENTRELAZADOS",
        artist: "Betania Worship",
        key: "A",
        progression: {
            ESTROFA: ["A", "D", "F#m", "E"],
            CORO: ["D", "F#m", "E", "Bm", "A"],
            PUENTE: ["Bm", "F#m", "A", "E"]
        },
        lyrics: {
            ESTROFA: [
                "A              D",
                "Abrazados, por tu gracia y tu amor",
                "F#m             D", 
                "Perdonados, por tu obra en la cruz",
                "A              D",
                "Somos libres, ya no hay condenacion",
                "F#m                     E",
                "Transformados, por tu infinito amor"
            ],
            CORO: [
                "D           F#m         E",
                "Y no podemos escapar de ti",
                "Si mi corazon esta",
                "D        F#m         E",
                "Entrelazado a tu corazon, Senor",
                "TAG:",
                "Uooh ooh ooooh",
                "E  F#m  D   E  F#m  Bm     E  F#m  D     A      E"
            ],
            PUENTE: [
                "Bm          F#m",
                "En ti encuentro amor",
                "A",
                "En ti encuentro paz",
                "E",
                "En ti encuentro todo lo que el mundo no me puede dar"
            ]
        }
    },
    {
        title: "ADIESTRA MIS MANOS",
        artist: "Betania Worship",
        key: "C",
        progression: {
            ESTROFA: ["C", "Am", "F", "G"],
            PRECORO: ["C", "Am", "F", "C", "G"],
            CORO: ["C", "G", "Am", "F", "C", "G", "Am", "F"],
            INSTRUMENTAL: ["C", "Am", "F", "G"]
        },
        lyrics: {
            ESTROFA: [
                "C                              Am",
                "Muéstrame el camino por el cual andar",
                "",
                "Me entrego a ti",
                "F                                      G",
                "Me refugio en tus palabras de direccion",
                "",
                "No tendre temor"
            ],
            PRECORO: [
                "C                                            Am",
                "Que tu espiritu me guie con pasos firmes al andar",
                "",
                "Que tu espiritu me ensene a vivir en tu voluntad"
            ],
            CORO: [
                "C                               G",
                "Adiestras mis manos para la batalla",
                "                                    Am                 F",
                "En Ti estoy confiado, no voy a dudar jamas",
                "",
                "Sobre las alturas conduces mi vida",
                "",
                "No me dejaras tropezar"
            ],
            INSTRUMENTAL: [
                "C      Am    F    G",
                "¡En creciendo!"
            ]
        }
    },
    {
        title: "SUBLIME GRACIA",
        artist: "Tradicional",
        key: "G",
        lyrics: {
            VERSO: [
                "G                    C               G",
                "Sublime gracia del Señor que a un infeliz salvó",
                "D                    C               G", 
                "Perdido me encontró, ciego me hizo ver",
                "Em                C               D",
                "La gracia me enseñó a temer",
                "C         D           G",
                "Mis dudas ahuyentó"
            ],
            CORO: [
                "G              D",
                "Sublime gracia, cuán dulce el son",
                "Em               C",
                "Que salvó a un pecador como yo",
                "G                   D",
                "Perdido fui, mas Él me halló",
                "Em              C            D          G",
                "Era ciego, mas ahora veo"
            ]
        }
    },
    {
        title: "CUÁN GRANDE ES ÉL",
        artist: "Stuart K. Hine",
        key: "D",
        lyrics: {
            VERSO: [
                "D                 G              D",
                "Señor mi Dios, al contemplar los cielos",
                "A       G              D",
                "El firmamento y las estrellas mil",
                "Bm        G      D",
                "Al oír tu voz en los potentes truenos",
                "A  G   D",
                "Y ver brillar el sol en su cenit"
            ],
            CORO: [
                "D",
                "Mi corazón entona la canción",
                "A",
                "Cuán grande es Él, cuán grande es Él",
                "D                G",
                "Mi corazón entona la canción",
                "A               D",
                "Cuán grande es Él, cuán grande es Él"
            ]
        }
    },
    {
        title: "SANTO ESPÍRITU VEN",
        artist: "Marcos Witt",
        key: "E",
        lyrics: {
            VERSO: [
                "E                  A",
                "Santo Espíritu ven, llénanos Señor",
                "B       A              E",
                "De tu presencia y de tu amor",
                "C#m        A      E",
                "Ven y toma control de mi ser",
                "B  A   E",
                "Santo Espíritu ven"
            ],
            CORO: [
                "A            E",
                "Ven, ven, ven Espíritu Santo",
                "B                      C#m",
                "Ven, ven, ven y llénanos",
                "A           E",
                "Con tu fuego santo",
                "B                      E",
                "Ven y renueva nuestro corazón"
            ]
        }
    }
];

// 🎸 BASE DE DATOS COMPLETA DE ACORDES CON DIAGRAMAS SVG
const chordDatabase = {
    // ===== ACORDES MAYORES =====
    "C": { 
        notes: ['C', 'E', 'G'], 
        type: 'Major', 
        frets: 'x32010', 
        description: 'Do Mayor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: 3, finger: '3', string: 5 },
            { fret: 2, finger: '2', string: 4 },
            { fret: 0, finger: 'o', string: 3 },
            { fret: 1, finger: '1', string: 2 },
            { fret: 0, finger: 'o', string: 1 }
        ]
    },
    "C#": { 
        notes: ['C#', 'F', 'G#'], 
        type: 'Major', 
        frets: 'x43121', 
        description: 'Do# Mayor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: 4, finger: '4', string: 5 },
            { fret: 3, finger: '3', string: 4 },
            { fret: 1, finger: '1', string: 3 },
            { fret: 2, finger: '2', string: 2 },
            { fret: 1, finger: '1', string: 1 }
        ]
    },
    "Db": { 
        notes: ['Db', 'F', 'Ab'], 
        type: 'Major', 
        frets: 'x43121', 
        description: 'Reb Mayor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: 4, finger: '4', string: 5 },
            { fret: 3, finger: '3', string: 4 },
            { fret: 1, finger: '1', string: 3 },
            { fret: 2, finger: '2', string: 2 },
            { fret: 1, finger: '1', string: 1 }
        ]
    },
    "D": { 
        notes: ['D', 'F#', 'A'], 
        type: 'Major', 
        frets: 'xx0232', 
        description: 'Re Mayor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: -1, finger: 'x', string: 5 },
            { fret: 0, finger: 'o', string: 4 },
            { fret: 2, finger: '1', string: 3 },
            { fret: 3, finger: '3', string: 2 },
            { fret: 2, finger: '2', string: 1 }
        ]
    },
    "D#": { 
        notes: ['D#', 'G', 'A#'], 
        type: 'Major', 
        frets: 'xx1343', 
        description: 'Re# Mayor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: -1, finger: 'x', string: 5 },
            { fret: 1, finger: '1', string: 4 },
            { fret: 3, finger: '2', string: 3 },
            { fret: 4, finger: '4', string: 2 },
            { fret: 3, finger: '3', string: 1 }
        ]
    },
    "Eb": { 
        notes: ['Eb', 'G', 'Bb'], 
        type: 'Major', 
        frets: 'xx1343', 
        description: 'Mib Mayor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: -1, finger: 'x', string: 5 },
            { fret: 1, finger: '1', string: 4 },
            { fret: 3, finger: '2', string: 3 },
            { fret: 4, finger: '4', string: 2 },
            { fret: 3, finger: '3', string: 1 }
        ]
    },
    "E": { 
        notes: ['E', 'G#', 'B'], 
        type: 'Major', 
        frets: '022100', 
        description: 'Mi Mayor',
        svgPositions: [
            { fret: 0, finger: 'o', string: 6 },
            { fret: 2, finger: '2', string: 5 },
            { fret: 2, finger: '3', string: 4 },
            { fret: 1, finger: '1', string: 3 },
            { fret: 0, finger: 'o', string: 2 },
            { fret: 0, finger: 'o', string: 1 }
        ]
    },
    "F": { 
        notes: ['F', 'A', 'C'], 
        type: 'Major', 
        frets: '133211', 
        description: 'Fa Mayor',
        svgPositions: [
            { fret: 1, finger: '1', string: 6 },
            { fret: 3, finger: '3', string: 5 },
            { fret: 3, finger: '4', string: 4 },
            { fret: 2, finger: '2', string: 3 },
            { fret: 1, finger: '1', string: 2 },
            { fret: 1, finger: '1', string: 1 }
        ]
    },
    "F#": { 
        notes: ['F#', 'A#', 'C#'], 
        type: 'Major', 
        frets: '244322', 
        description: 'Fa# Mayor',
        svgPositions: [
            { fret: 2, finger: '1', string: 6 },
            { fret: 4, finger: '3', string: 5 },
            { fret: 4, finger: '4', string: 4 },
            { fret: 3, finger: '2', string: 3 },
            { fret: 2, finger: '1', string: 2 },
            { fret: 2, finger: '1', string: 1 }
        ]
    },
    "Gb": { 
        notes: ['Gb', 'Bb', 'Db'], 
        type: 'Major', 
        frets: '244322', 
        description: 'Solb Mayor',
        svgPositions: [
            { fret: 2, finger: '1', string: 6 },
            { fret: 4, finger: '3', string: 5 },
            { fret: 4, finger: '4', string: 4 },
            { fret: 3, finger: '2', string: 3 },
            { fret: 2, finger: '1', string: 2 },
            { fret: 2, finger: '1', string: 1 }
        ]
    },
    "G": { 
        notes: ['G', 'B', 'D'], 
        type: 'Major', 
        frets: '320003', 
        description: 'Sol Mayor',
        svgPositions: [
            { fret: 3, finger: '2', string: 6 },
            { fret: 2, finger: '1', string: 5 },
            { fret: 0, finger: 'o', string: 4 },
            { fret: 0, finger: 'o', string: 3 },
            { fret: 0, finger: 'o', string: 2 },
            { fret: 3, finger: '3', string: 1 }
        ]
    },
    "G#": { 
        notes: ['G#', 'C', 'D#'], 
        type: 'Major', 
        frets: '431114', 
        description: 'Sol# Mayor',
        svgPositions: [
            { fret: 4, finger: '3', string: 6 },
            { fret: 3, finger: '2', string: 5 },
            { fret: 1, finger: '1', string: 4 },
            { fret: 1, finger: '1', string: 3 },
            { fret: 1, finger: '1', string: 2 },
            { fret: 4, finger: '4', string: 1 }
        ]
    },
    "Ab": { 
        notes: ['Ab', 'C', 'Eb'], 
        type: 'Major', 
        frets: '431114', 
        description: 'Lab Mayor',
        svgPositions: [
            { fret: 4, finger: '3', string: 6 },
            { fret: 3, finger: '2', string: 5 },
            { fret: 1, finger: '1', string: 4 },
            { fret: 1, finger: '1', string: 3 },
            { fret: 1, finger: '1', string: 2 },
            { fret: 4, finger: '4', string: 1 }
        ]
    },
    "A": { 
        notes: ['A', 'C#', 'E'], 
        type: 'Major', 
        frets: 'x02220', 
        description: 'La Mayor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: 0, finger: 'o', string: 5 },
            { fret: 2, finger: '1', string: 4 },
            { fret: 2, finger: '2', string: 3 },
            { fret: 2, finger: '3', string: 2 },
            { fret: 0, finger: 'o', string: 1 }
        ]
    },
    "A#": { 
        notes: ['A#', 'D', 'F'], 
        type: 'Major', 
        frets: 'x13331', 
        description: 'La# Mayor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: 1, finger: '1', string: 5 },
            { fret: 3, finger: '2', string: 4 },
            { fret: 3, finger: '3', string: 3 },
            { fret: 3, finger: '4', string: 2 },
            { fret: 1, finger: '1', string: 1 }
        ]
    },
    "Bb": { 
        notes: ['Bb', 'D', 'F'], 
        type: 'Major', 
        frets: 'x13331', 
        description: 'Sib Mayor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: 1, finger: '1', string: 5 },
            { fret: 3, finger: '2', string: 4 },
            { fret: 3, finger: '3', string: 3 },
            { fret: 3, finger: '4', string: 2 },
            { fret: 1, finger: '1', string: 1 }
        ]
    },
    "B": { 
        notes: ['B', 'D#', 'F#'], 
        type: 'Major', 
        frets: 'x24442', 
        description: 'Si Mayor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: 2, finger: '1', string: 5 },
            { fret: 4, finger: '3', string: 4 },
            { fret: 4, finger: '4', string: 3 },
            { fret: 4, finger: '4', string: 2 },
            { fret: 2, finger: '2', string: 1 }
        ]
    },

    // ===== ACORDES MENORES =====
    "Cm": { 
        notes: ['C', 'Eb', 'G'], 
        type: 'Minor', 
        frets: 'x35543', 
        description: 'Do menor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: 3, finger: '1', string: 5 },
            { fret: 5, finger: '3', string: 4 },
            { fret: 5, finger: '4', string: 3 },
            { fret: 4, finger: '2', string: 2 },
            { fret: 3, finger: '1', string: 1 }
        ]
    },
    "C#m": { 
        notes: ['C#', 'E', 'G#'], 
        type: 'Minor', 
        frets: 'x46654', 
        description: 'Do# menor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: 4, finger: '1', string: 5 },
            { fret: 6, finger: '3', string: 4 },
            { fret: 6, finger: '4', string: 3 },
            { fret: 5, finger: '2', string: 2 },
            { fret: 4, finger: '1', string: 1 }
        ]
    },
    "Dm": { 
        notes: ['D', 'F', 'A'], 
        type: 'Minor', 
        frets: 'xx0231', 
        description: 'Re menor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: -1, finger: 'x', string: 5 },
            { fret: 0, finger: 'o', string: 4 },
            { fret: 2, finger: '2', string: 3 },
            { fret: 3, finger: '3', string: 2 },
            { fret: 1, finger: '1', string: 1 }
        ]
    },
    "D#m": { 
        notes: ['D#', 'F#', 'A#'], 
        type: 'Minor', 
        frets: 'xx1342', 
        description: 'Re# menor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: -1, finger: 'x', string: 5 },
            { fret: 1, finger: '1', string: 4 },
            { fret: 3, finger: '3', string: 3 },
            { fret: 4, finger: '4', string: 2 },
            { fret: 2, finger: '2', string: 1 }
        ]
    },
    "Em": { 
        notes: ['E', 'G', 'B'], 
        type: 'Minor', 
        frets: '022000', 
        description: 'Mi menor',
        svgPositions: [
            { fret: 0, finger: 'o', string: 6 },
            { fret: 2, finger: '2', string: 5 },
            { fret: 2, finger: '3', string: 4 },
            { fret: 0, finger: 'o', string: 3 },
            { fret: 0, finger: 'o', string: 2 },
            { fret: 0, finger: 'o', string: 1 }
        ]
    },
    "Fm": { 
        notes: ['F', 'Ab', 'C'], 
        type: 'Minor', 
        frets: '133111', 
        description: 'Fa menor',
        svgPositions: [
            { fret: 1, finger: '1', string: 6 },
            { fret: 3, finger: '3', string: 5 },
            { fret: 3, finger: '4', string: 4 },
            { fret: 1, finger: '1', string: 3 },
            { fret: 1, finger: '1', string: 2 },
            { fret: 1, finger: '1', string: 1 }
        ]
    },
    "F#m": { 
        notes: ['F#', 'A', 'C#'], 
        type: 'Minor', 
        frets: '244222', 
        description: 'Fa# menor',
        svgPositions: [
            { fret: 2, finger: '1', string: 6 },
            { fret: 4, finger: '3', string: 5 },
            { fret: 4, finger: '4', string: 4 },
            { fret: 2, finger: '1', string: 3 },
            { fret: 2, finger: '1', string: 2 },
            { fret: 2, finger: '1', string: 1 }
        ]
    },
    "Gm": { 
        notes: ['G', 'Bb', 'D'], 
        type: 'Minor', 
        frets: '355333', 
        description: 'Sol menor',
        svgPositions: [
            { fret: 3, finger: '1', string: 6 },
            { fret: 5, finger: '3', string: 5 },
            { fret: 5, finger: '4', string: 4 },
            { fret: 3, finger: '1', string: 3 },
            { fret: 3, finger: '1', string: 2 },
            { fret: 3, finger: '1', string: 1 }
        ]
    },
    "G#m": { 
        notes: ['G#', 'B', 'D#'], 
        type: 'Minor', 
        frets: '466444', 
        description: 'Sol# menor',
        svgPositions: [
            { fret: 4, finger: '1', string: 6 },
            { fret: 6, finger: '3', string: 5 },
            { fret: 6, finger: '4', string: 4 },
            { fret: 4, finger: '1', string: 3 },
            { fret: 4, finger: '1', string: 2 },
            { fret: 4, finger: '1', string: 1 }
        ]
    },
    "Am": { 
        notes: ['A', 'C', 'E'], 
        type: 'Minor', 
        frets: 'x02210', 
        description: 'La menor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: 0, finger: 'o', string: 5 },
            { fret: 2, finger: '2', string: 4 },
            { fret: 2, finger: '3', string: 3 },
            { fret: 1, finger: '1', string: 2 },
            { fret: 0, finger: 'o', string: 1 }
        ]
    },
    "A#m": { 
        notes: ['A#', 'C#', 'F'], 
        type: 'Minor', 
        frets: 'x13321', 
        description: 'La# menor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: 1, finger: '1', string: 5 },
            { fret: 3, finger: '3', string: 4 },
            { fret: 3, finger: '4', string: 3 },
            { fret: 2, finger: '2', string: 2 },
            { fret: 1, finger: '1', string: 1 }
        ]
    },
    "Bm": { 
        notes: ['B', 'D', 'F#'], 
        type: 'Minor', 
        frets: 'x24432', 
        description: 'Si menor',
        svgPositions: [
            { fret: -1, finger: 'x', string: 6 },
            { fret: 2, finger: '1', string: 5 },
            { fret: 4, finger: '3', string: 4 },
            { fret: 4, finger: '4', string: 3 },
            { fret: 3, finger: '2', string: 2 },
            { fret: 2, finger: '1', string: 1 }
        ]
    }
};

// 🎼 ESTADO DE LA APLICACIÓN
const state = {
    section: "canciones",
    songs: songs,
    filtered: [],
    selectedSong: null,
    baseKey: null,
    setlist: JSON.parse(localStorage.getItem("setlist") || "[]"),
    editMode: false,
    currentSteps: 0,
    editedSong: null,
    history: [],
    historyIndex: -1,
    autoSave: true
};

// 🎯 ELEMENTOS DOM
let sectionSelect, searchInput, orderSelect, songListUL, addToSetBtn, logoImg, mainContent, darkModeToggle;

// 🚀 INICIALIZAR APLICACIÓN
function init() {
    // Obtener elementos DOM
    sectionSelect = document.getElementById("section-select");
    searchInput = document.getElementById("search");
    orderSelect = document.getElementById("order-select");
    songListUL = document.getElementById("song-list");
    addToSetBtn = document.getElementById("add-to-setlist");
    logoImg = document.getElementById("logo");
    mainContent = document.getElementById("main-content");
    darkModeToggle = document.getElementById("dark-mode");

    // Agregar event listeners
    sectionSelect.addEventListener("change", onSectionChange);
    searchInput.addEventListener("input", refreshList);
    orderSelect.addEventListener("change", refreshList);
    addToSetBtn.addEventListener("click", addCheckedToSetlist);
    logoImg.addEventListener("click", () => location.reload());
    darkModeToggle.addEventListener("change", toggleDarkMode);

    // Inicializar estado
    state.filtered = [...state.songs];
    renderList();
    loadSettings();
    setupGlobalKeyboardShortcuts();
    
    console.log('🎵 Sistema Betania V4 inicializado correctamente');
    console.log('🎸 Acordes disponibles:', Object.keys(chordDatabase).length);
    console.log('🎼 Canciones cargadas:', state.songs.length);
}

// 📱 NAVEGACIÓN ENTRE SECCIONES
function onSectionChange() {
    state.section = sectionSelect.value;
    switch(state.section) {
        case "herramientas":
            renderTools();
            break;
        case "grabaciones":
            renderRecordings();
            break;
        case "add-song":
            renderAddSongForm();
            break;
        default:
            renderList();
    }
}

// 🔍 ACTUALIZAR LISTA DE CANCIONES
function refreshList() {
    const q = searchInput.value.toLowerCase();
    state.filtered = state.songs.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.key.toLowerCase().includes(q) ||
        (s.artist && s.artist.toLowerCase().includes(q))
    );
    
    // Ordenar según selección
    const orderBy = orderSelect.value;
    state.filtered.sort((a, b) => {
        const aVal = a[orderBy] || '';
        const bVal = b[orderBy] || '';
        return aVal.localeCompare(bVal);
    });
    
    renderList();
}

// 📋 RENDERIZAR LISTA DE CANCIONES
function renderList() {
    songListUL.innerHTML = "";
    const isSetlistView = state.section === "setlist";
    const items = isSetlistView ? 
        state.songs.filter(s => state.setlist.includes(s.title)) : 
        state.filtered;

    items.forEach(song => {
        const li = document.createElement("li");
        const id = "chk_" + song.title.replace(/\s+/g, "_");
        const label = document.createElement("label");
        label.htmlFor = id;
        
        const chk = document.createElement("input");
        chk.type = "checkbox";
        chk.id = id;
        chk.checked = state.setlist.includes(song.title);
        chk.addEventListener("change", () => {
            if (chk.checked) {
                state.setlist.push(song.title);
            } else {
                state.setlist = state.setlist.filter(t => t !== song.title);
            }
            persistSetlist();
            if (state.section === "setlist") renderList();
        });

        const span = document.createElement("span");
        const artistText = song.artist ? ` - ${song.artist}` : '';
        span.textContent = `${song.title} (${song.key})${artistText}`;
        span.addEventListener("click", () => {
            if (state.section === "canciones" || state.section === "setlist") {
                renderSongDetail(song);
                state.selectedSong = song;
                state.baseKey = song.key;
                state.currentSteps = 0;
            }
        });

        label.append(chk, span);
        li.append(label);
        songListUL.append(li);
    });

    // Mensaje si no hay canciones
    if (items.length === 0) {
        const li = document.createElement("li");
        li.innerHTML = '<span style="opacity: 0.6; font-style: italic;">No se encontraron canciones</span>';
        songListUL.append(li);
    }
}

// 💾 PERSISTIR SETLIST
function persistSetlist() {
    localStorage.setItem("setlist", JSON.stringify(state.setlist));
    showSaveIndicator('📋 Setlist actualizado');
}

// ➕ AÑADIR CANCIONES AL SETLIST
function addCheckedToSetlist() {
    const checkedSongs = Array.from(document.querySelectorAll('#song-list input[type="checkbox"]:checked'))
        .map(chk => chk.id.replace("chk_", "").replace(/_/g, " "));
    
    let addedCount = 0;
    checkedSongs.forEach(title => {
        if (!state.setlist.includes(title)) {
            state.setlist.push(title);
            addedCount++;
        }
    });
    
    if (addedCount > 0) {
        persistSetlist();
        renderList();
        showSaveIndicator(`➕ ${addedCount} canción(es) añadidas al setlist`);
    }
    
    // Desmarcar todas las canciones
    document.querySelectorAll('#song-list input[type="checkbox"]').forEach(chk => chk.checked = false);
}

// 🎵 RENDERIZAR DETALLE DE CANCIÓN
function renderSongDetail(song) {
    state.currentSteps = 0;
    state.editedSong = JSON.parse(JSON.stringify(song));
    
    // Crear historial para deshacer/rehacer
    if (state.editMode) {
        state.history = [JSON.parse(JSON.stringify(song))];
        state.historyIndex = 0;
    }
    
    const artistInfo = song.artist ? ` - ${song.artist}` : '';
    const controlsHTML = `
        <div class="song-controls" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; justify-content: center;">
            <button onclick="transposeKey(-1)" title="Bajar medio tono">♭ Bajar tono</button>
            <button onclick="transposeKey(1)" title="Subir medio tono">♯ Subir tono</button>
            <button onclick="resetTransposition()" title="Volver a tonalidad original">🔄 Reset</button>
            <button onclick="toggleEditMode()" title="Activar/desactivar modo edición">
                ${state.editMode ? '💾 Guardar' : '✏️ Editar'}
            </button>
        </div>
        <div class="current-key-display" style="text-align: center; margin-bottom: 1rem; padding: 0.5rem; background: rgba(7, 155, 130, 0.1); border-radius: 8px;">
            <strong>Tonalidad actual: <span id="current-key" style="color: var(--accent-teal); font-size: 1.2rem;">${song.key}</span></strong>
            ${state.currentSteps !== 0 ? ` (${state.currentSteps > 0 ? '+' : ''}${state.currentSteps} semitonos)` : ''}
        </div>
    `;
    
    const songDisplayHTML = `<div id="song-display">${renderSongSections(song)}</div>`;
    const editorHTML = state.editMode ? renderSongEditor(song) : '';
    
    mainContent.innerHTML = `
        <h2>${song.title}${artistInfo}</h2>
        ${controlsHTML}
        ${songDisplayHTML}
        ${editorHTML}
    `;

    // Agregar listeners para acordes
    document.querySelectorAll('.chord').forEach(chord => {
        chord.addEventListener('click', () => showChordDiagram(chord.textContent));
    });
}

// 🎼 RENDERIZAR SECCIONES DE CANCIÓN
function renderSongSections(song) {
    let html = '';
    
    Object.entries(song.lyrics).forEach(([sectionName, lines]) => {
        html += `
            <div class="song-section">
                <div class="section-title">${sectionName}</div>
                ${renderLyricsWithChords(lines)}
            </div>
        `;
    });
    
    return html;
}

// 🎸 RENDERIZAR LETRAS CON ACORDES
function renderLyricsWithChords(lines) {
    let html = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.trim() === '') {
            html += '<div style="margin-bottom: 0.8rem;"></div>';
            continue;
        }
        
        // Detectar si es línea de acordes
        if (isChordLine(line)) {
            html += `<div class="chord-line">${highlightChords(line)}</div>`;
        } else {
            html += `<div class="lyric-line">${line}</div>`;
        }
    }
    
    return html;
}

// 🎯 DETECTAR LÍNEA DE ACORDES
function isChordLine(line) {
    if (!line || line.trim() === '') return false;
    
    // Patrones de acordes más completos
    const chordPattern = /\b[A-G][#b]?[m|maj|min|sus|add|dim|aug|M]?[0-9]*[/#]?[A-G]?\b/g;
    const words = line.trim().split(/\s+/);
    const totalWords = words.length;
    
    if (totalWords === 0) return false;
    
    // Contar cuántas palabras parecen ser acordes
    const chordMatches = line.match(chordPattern) || [];
    const chordWords = words.filter(word => {
        return chordPattern.test(word) && word.length >= 1 && word.length <= 6;
    });
    
    // Si más del 50% de las palabras son acordes, o si hay pocos elementos y la mayoría son acordes
    return (chordWords.length >= totalWords * 0.5) || 
           (totalWords <= 6 && chordWords.length >= 2) ||
           (line.includes('TAG:') || line.includes('INSTRUMENTAL:'));
}

// 🎨 RESALTAR ACORDES EN LÍNEA
function highlightChords(line) {
    // Patrón más preciso para acordes
    const chordPattern = /\b([A-G][#b]?(?:m|maj|min|sus|add|dim|aug|M)?[0-9]*(?:\/[A-G][#b]?)?)\b/g;
    
    return line.replace(chordPattern, (match) => {
        // Verificar que el acorde existe en nuestra base de datos o es válido
        const baseChord = match.split('/')[0]; // Quitar el bajo si existe
        return `<span class="chord" title="Haz clic para ver diagrama">${match}</span>`;
    });
}

// ✏️ RENDERIZAR EDITOR DE CANCIÓN
function renderSongEditor(song) {
    let html = `
        <div class="song-editor">
            <div class="edit-controls">
                <div class="edit-toolbar">
                    <button onclick="addNewLine()" title="Añadir nueva línea">➕ Añadir línea</button>
                    <button onclick="addNewSection()" title="Añadir nueva sección">📄 Nueva sección</button>
                    <button onclick="undoEdit()" ${state.historyIndex <= 0 ? 'disabled' : ''} title="Deshacer cambio">↶ Deshacer</button>
                    <button onclick="redoEdit()" ${state.historyIndex >= state.history.length - 1 ? 'disabled' : ''} title="Rehacer cambio">↷ Rehacer</button>
                    <button onclick="previewChanges()" title="Vista previa de cambios">👁️ Vista previa</button>
                </div>
                <div class="edit-instructions">
                    <strong>📝 Instrucciones del Editor:</strong><br>
                    • Haz clic en cualquier línea para editarla<br>
                    • Los acordes se detectan automáticamente (ej: C, Am, F#m, Gmaj7)<br>
                    • Usa espacios para alinear acordes con letras<br>
                    • Los acordes editados también se transponen con ♭/♯
                </div>
            </div>
    `;

    Object.entries(song.lyrics).forEach(([sectionName, lines]) => {
        html += `
            <div class="editor-section" data-section="${sectionName}">
                <div class="editor-section-title">
                    ${sectionName}
                    <button onclick="deleteSection('${sectionName}')" style="float: right; background: var(--danger-color); padding: 0.2rem 0.5rem; margin-left: 1rem;">🗑️</button>
                </div>
        `;
        
        lines.forEach((line, index) => {
            const lineId = `${sectionName}_${index}`;
            const isChord = isChordLine(line);
            const inputClass = isChord ? 'line-input chord-line' : 'line-input';
            const placeholder = isChord ? 'C    G    Am   F (espacios para alinear)' : 'Letra de la canción';
            
            html += `
                <div class="editable-line" data-section="${sectionName}" data-index="${index}">
                    <textarea 
                        id="${lineId}" 
                        class="${inputClass}" 
                        data-section="${sectionName}" 
                        data-index="${index}"
                        oninput="onLineEdit(this)"
                        onblur="saveLineEdit(this)"
                        placeholder="${placeholder}"
                        rows="1"
                    >${line}</textarea>
                    <button onclick="deleteLine('${sectionName}', ${index})" class="delete-line-btn" style="position: absolute; right: 5px; top: 5px; background: var(--danger-color); color: white; border: none; padding: 2px 6px; border-radius: 3px; font-size: 12px;">✕</button>
                </div>
            `;
        });
        
        html += `
                <button onclick="addLineToSection('${sectionName}')" style="margin-top: 0.5rem; background: var(--success-color);">➕ Añadir línea a ${sectionName}</button>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// ✏️ EVENTO DE EDICIÓN DE LÍNEA
function onLineEdit(textarea) {
    const line = textarea.value;
    const isChord = isChordLine(line);
    
    // Cambiar estilo según el contenido
    textarea.className = isChord ? 'line-input chord-line' : 'line-input';
    
    // Auto-resize del textarea
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(40, textarea.scrollHeight) + 'px';
    
    // Actualizar en tiempo real
    const section = textarea.dataset.section;
    const index = parseInt(textarea.dataset.index);
    
    if (state.editedSong.lyrics[section] && state.editedSong.lyrics[section][index] !== undefined) {
        state.editedSong.lyrics[section][index] = line;
    }
}

// 💾 GUARDAR EDICIÓN DE LÍNEA
function saveLineEdit(textarea) {
    onLineEdit(textarea);
    addToHistory();
    showSaveIndicator('✏️ Línea editada');
}

// 📚 GESTIÓN DE HISTORIAL
function addToHistory() {
    if (state.editedSong) {
        // Remover elementos futuros si estamos en medio del historial
        state.history = state.history.slice(0, state.historyIndex + 1);
        
        // Añadir nuevo estado
        state.history.push(JSON.parse(JSON.stringify(state.editedSong)));
        state.historyIndex = state.history.length - 1;
        
        // Limitar historial a 50 pasos
        if (state.history.length > 50) {
            state.history.shift();
            state.historyIndex--;
        }
    }
}

// ↶ DESHACER EDICIÓN
function undoEdit() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        state.editedSong = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        renderSongDetail(state.editedSong);
        showSaveIndicator('↶ Cambio deshecho');
    }
}

// ↷ REHACER EDICIÓN
function redoEdit() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.editedSong = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        renderSongDetail(state.editedSong);
        showSaveIndicator('↷ Cambio rehecho');
    }
}

// ➕ AÑADIR NUEVA LÍNEA
function addLineToSection(sectionName) {
    if (state.editedSong.lyrics[sectionName]) {
        state.editedSong.lyrics[sectionName].push('');
        addToHistory();
        renderSongDetail(state.editedSong);
        showSaveIndicator(`➕ Línea añadida a ${sectionName}`);
    }
}

// 🗑️ ELIMINAR LÍNEA
function deleteLine(sectionName, index) {
    if (state.editedSong.lyrics[sectionName] && 
        state.editedSong.lyrics[sectionName].length > 1 &&
        confirm('¿Eliminar esta línea?')) {
        state.editedSong.lyrics[sectionName].splice(index, 1);
        addToHistory();
        renderSongDetail(state.editedSong);
        showSaveIndicator('🗑️ Línea eliminada');
    }
}

// 📄 AÑADIR NUEVA SECCIÓN
function addNewSection() {
    const sectionName = prompt('Nombre de la nueva sección:');
    if (sectionName && !state.editedSong.lyrics[sectionName]) {
        state.editedSong.lyrics[sectionName] = [''];
        addToHistory();
        renderSongDetail(state.editedSong);
        showSaveIndicator(`📄 Sección "${sectionName}" añadida`);
    }
}

// 🗑️ ELIMINAR SECCIÓN
function deleteSection(sectionName) {
    if (Object.keys(state.editedSong.lyrics).length > 1 &&
        confirm(`¿Eliminar la sección "${sectionName}"?`)) {
        delete state.editedSong.lyrics[sectionName];
        addToHistory();
        renderSongDetail(state.editedSong);
        showSaveIndicator(`🗑️ Sección "${sectionName}" eliminada`);
    }
}

// 👁️ VISTA PREVIA DE CAMBIOS
function previewChanges() {
    const tempEditMode = state.editMode;
    state.editMode = false;
    const previewContent = renderSongSections(state.editedSong);
    state.editMode = tempEditMode;
    
    const preview = document.getElementById('song-display');
    if (preview) {
        preview.innerHTML = previewContent;
        document.querySelectorAll('.chord').forEach(chord => {
            chord.addEventListener('click', () => showChordDiagram(chord.textContent));
        });
        showSaveIndicator('👁️ Vista previa actualizada');
    }
}

// 🎼 TRANSPOSICIÓN DE ACORDES - FUNCIONES PRINCIPALES

// ♭ ♯ TRANSPONER TONALIDAD
function transposeKey(steps) {
    state.currentSteps += steps;
    const currentSong = state.editMode ? state.editedSong : state.selectedSong;
    const newKey = transpose(state.baseKey, state.currentSteps);
    const transposedSong = transposeSong(currentSong, steps);
    
    // Actualizar display
    document.getElementById('current-key').textContent = newKey;
    document.getElementById('song-display').innerHTML = renderSongSections(transposedSong);
    
    // Re-añadir listeners para acordes
    document.querySelectorAll('.chord').forEach(chord => {
        chord.addEventListener('click', () => showChordDiagram(chord.textContent));
    });
    
    // Si estamos en modo edición, actualizar también la canción editada
    if (state.editMode) {
        state.editedSong = transposedSong;
        // No necesitamos re-renderizar el editor, solo el display
    }
    
    // Actualizar indicador de tonalidad
    const stepsText = state.currentSteps !== 0 ? ` (${state.currentSteps > 0 ? '+' : ''}${state.currentSteps} semitonos)` : '';
    const keyDisplay = document.querySelector('.current-key-display strong');
    if (keyDisplay) {
        keyDisplay.innerHTML = `Tonalidad actual: <span id="current-key" style="color: var(--accent-teal); font-size: 1.2rem;">${newKey}</span>${stepsText}`;
    }
    
    showSaveIndicator(`🎼 Transpuesto a ${newKey} ${steps > 0 ? '♯' : '♭'}`);
}

// 🔄 RESETEAR TRANSPOSICIÓN
function resetTransposition() {
    if (state.currentSteps !== 0) {
        state.currentSteps = 0;
        const currentSong = state.editMode ? state.editedSong : state.selectedSong;
        
        // Volver a la canción original
        const originalSong = state.editMode ? 
            JSON.parse(JSON.stringify(state.selectedSong)) : 
            state.selectedSong;
        
        document.getElementById('current-key').textContent = state.baseKey;
        document.getElementById('song-display').innerHTML = renderSongSections(originalSong);
        
        // Re-añadir listeners
        document.querySelectorAll('.chord').forEach(chord => {
            chord.addEventListener('click', () => showChordDiagram(chord.textContent));
        });
        
        // Si estamos en modo edición, resetear a la versión original editada
        if (state.editMode) {
            state.editedSong = JSON.parse(JSON.stringify(state.selectedSong));
        }
        
        // Actualizar indicador
        const keyDisplay = document.querySelector('.current-key-display strong');
        if (keyDisplay) {
            keyDisplay.innerHTML = `Tonalidad actual: <span id="current-key" style="color: var(--accent-teal); font-size: 1.2rem;">${state.baseKey}</span>`;
        }
        
        showSaveIndicator('🔄 Tonalidad original restaurada');
    }
}

// 🎵 TRANSPONER UN SOLO ACORDE
function transpose(chord, steps) {
    if (!chord || steps === 0) return chord;
    
    // Extraer acorde base y modificadores
    const match = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord;
    
    const [, baseNote, suffix] = match;
    let keyIndex = KEYS.indexOf(baseNote);
    
    // Si no se encuentra, intentar con equivalentes enarmónicos
    if (keyIndex === -1) {
        // Convertir bemoles a sostenidos para búsqueda
        const sharpEquivalent = convertFlatToSharp(baseNote);
        keyIndex = KEYS.indexOf(sharpEquivalent);
    }
    
    if (keyIndex === -1) return chord; // Si aún no se encuentra, devolver original
    
    // Calcular nuevo índice
    let newIndex = (keyIndex + steps) % 12;
    if (newIndex < 0) newIndex += 12;
    
    const newBaseNote = KEYS[newIndex];
    return newBaseNote + suffix;
}

// 🎼 TRANSPONER CANCIÓN COMPLETA
function transposeSong(song, steps) {
    if (steps === 0) return song;
    
    const transposed = JSON.parse(JSON.stringify(song));
    
    // Transponer letras
    Object.keys(transposed.lyrics).forEach(section => {
        transposed.lyrics[section] = transposed.lyrics[section].map(line => 
            transposeChords(line, steps)
        );
    });
    
    // Transponer progresiones si existen
    if (transposed.progression) {
        Object.keys(transposed.progression).forEach(section => {
            transposed.progression[section] = transposed.progression[section].map(chord => 
                transpose(chord, steps)
            );
        });
    }
    
    return transposed;
}

// 🎸 TRANSPONER ACORDES EN LÍNEA DE TEXTO
function transposeChords(line, steps) {
    if (!line || steps === 0) return line;
    
    // Patrón más completo para acordes
    const chordPattern = /\b([A-G][#b]?(?:m|maj|min|sus|add|dim|aug|M)?[0-9]*(?:\/[A-G][#b]?)?)\b/g;
    
    return line.replace(chordPattern, (match) => {
        // Si contiene bajo (acorde/bajo), transponer ambos
        if (match.includes('/')) {
            const [chord, bass] = match.split('/');
            const transposedChord = transpose(chord, steps);
            const transposedBass = transpose(bass, steps);
            return `${transposedChord}/${transposedBass}`;
        } else {
            return transpose(match, steps);
        }
    });
}

// 🎵 CONVERTIR BEMOLES A SOSTENIDOS
function convertFlatToSharp(note) {
    const flatToSharp = {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    };
    return flatToSharp[note] || note;
}

// 🎸 MOSTRAR DIAGRAMA DE ACORDE
function showChordDiagram(chordName) {
    // Limpiar nombre del acorde (quitar espacios extra)
    const cleanChordName = chordName.trim();
    
    // Buscar acorde en base de datos
    let chord = chordDatabase[cleanChordName];
    
    // Si no se encuentra, intentar con equivalentes enarmónicos
    if (!chord) {
        const equivalent = convertFlatToSharp(cleanChordName);
        chord = chordDatabase[equivalent];
    }
    
    // Si aún no se encuentra, intentar separar acorde con bajo
    if (!chord && cleanChordName.includes('/')) {
        const baseChord = cleanChordName.split('/')[0];
        chord = chordDatabase[baseChord];
    }
    
    if (!chord) {
        showSaveIndicator(`❌ Diagrama no disponible para ${cleanChordName}`);
        return;
    }
    
    const diagramHTML = `
        <div class="chord-diagram" id="chord-diagram">
            <h3>${cleanChordName}</h3>
            <div class="chord-info">
                <p><strong>Tipo:</strong> ${chord.type}</p>
                <p><strong>Notas:</strong> ${chord.notes.join(' - ')}</p>
                <p><strong>Posición:</strong> ${chord.description}</p>
                <p><strong>Trastes:</strong> ${chord.frets}</p>
            </div>
            <div class="guitar-chord-svg">
                ${generateChordSVG(chord)}
            </div>
            <button class="close-btn" onclick="closeChordDiagram()">✕ Cerrar</button>
        </div>
    `;
    
    // Remover diagrama anterior si existe
    const existingDiagram = document.getElementById('chord-diagram');
    if (existingDiagram) {
        existingDiagram.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', diagramHTML);
}

// 🎨 GENERAR SVG DEL DIAGRAMA DE ACORDE
function generateChordSVG(chord) {
    const width = 200;
    const height = 250;
    const fretWidth = 30;
    const stringSpacing = 25;
    const startX = 20;
    const startY = 60;
    
    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background: white; border-radius: 8px;">`;
    
    // Dibujar trastes (líneas horizontales)
    for (let fret = 0; fret <= 4; fret++) {
        const y = startY + (fret * fretWidth);
        const strokeWidth = fret === 0 ? 4 : 2;
        const strokeColor = fret === 0 ? '#000' : '#666';
        svg += `<line x1="${startX}" y1="${y}" x2="${startX + 5 * stringSpacing}" y2="${y}" 
                stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
    }
    
    // Dibujar cuerdas (líneas verticales)
    for (let string = 0; string < 6; string++) {
        const x = startX + (string * stringSpacing);
        svg += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY + 4 * fretWidth}" 
                stroke="#444" stroke-width="2"/>`;
    }
    
    // Etiquetas de cuerdas
    const stringNames = ['E', 'A', 'D', 'G', 'B', 'e'];
    for (let string = 0; string < 6; string++) {
        const x = startX + (string * stringSpacing);
        svg += `<text x="${x}" y="${startY + 4 * fretWidth + 20}" text-anchor="middle" 
                font-size="12" fill="#666" font-family="Arial">${stringNames[string]}</text>`;
    }
    
    // Dibujar posiciones de dedos
    chord.svgPositions.forEach((pos, index) => {
        const stringNum = pos.string - 1; // Convertir a índice base 0
        const x = startX + (stringNum * stringSpacing);
        
        if (pos.fret === -1) {
            // X para cuerda silenciada
            svg += `<text x="${x}" y="${startY - 15}" text-anchor="middle" font-size="18" 
                    fill="#dc3545" font-weight="bold">✕</text>`;
        } else if (pos.fret === 0) {
            // O para cuerda al aire
            svg += `<circle cx="${x}" cy="${startY - 15}" r="8" fill="none" 
                    stroke="#28a745" stroke-width="3"/>`;
        } else {
            // Posición del dedo
            const y = startY + (pos.fret - 0.5) * fretWidth;
            svg += `<circle cx="${x}" cy="${y}" r="12" fill="#079b82"/>`;
            svg += `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="12" 
                    fill="white" font-weight="bold">${pos.finger}</text>`;
        }
    });
    
    // Números de traste
    for (let fret = 1; fret <= 4; fret++) {
        const y = startY + (fret - 0.5) * fretWidth;
        svg += `<text x="${startX - 15}" y="${y + 5}" text-anchor="middle" 
                font-size="14" fill="#666">${fret}</text>`;
    }
    
    // Título del diagrama
    svg += `<text x="${width/2}" y="20" text-anchor="middle" font-size="16" 
            fill="#333" font-weight="bold">Diagrama de ${chord.description}</text>`;
    
    svg += '</svg>';
    return svg;
}

// ✕ CERRAR DIAGRAMA DE ACORDE
function closeChordDiagram() {
    const diagram = document.getElementById('chord-diagram');
    if (diagram) {
        diagram.remove();
    }
}

// ✏️ ALTERNAR MODO EDICIÓN
function toggleEditMode() {
    state.editMode = !state.editMode;
    
    if (state.editMode && state.selectedSong) {
        // Entrar en modo edición
        state.editedSong = JSON.parse(JSON.stringify(state.selectedSong));
        state.history = [JSON.parse(JSON.stringify(state.editedSong))];
        state.historyIndex = 0;
        showSaveIndicator('✏️ Modo edición activado');
    } else if (!state.editMode && state.editedSong) {
        // Salir de modo edición y guardar
        const index = state.songs.findIndex(s => s.title === state.selectedSong.title);
        if (index !== -1) {
            state.songs[index] = JSON.parse(JSON.stringify(state.editedSong));
            state.selectedSong = state.songs[index];
            state.baseKey = state.selectedSong.key;
            
            // Persistir cambios
            localStorage.setItem('betania_songs', JSON.stringify(state.songs));
        }
        showSaveIndicator('💾 Canción guardada exitosamente');
    }
    
    if (state.selectedSong) {
        renderSongDetail(state.editMode ? state.editedSong : state.selectedSong);
    }
}

// 💾 INDICADOR DE GUARDADO
function showSaveIndicator(message = '✅ Cambios guardados') {
    const indicator = document.getElementById('save-indicator');
    indicator.textContent = message;
    indicator.classList.add('show');
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 3000);
}

// 🌙 ALTERNAR MODO OSCURO
function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode', !isDark);
    localStorage.setItem('darkMode', isDark);
    showSaveIndicator(isDark ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado');
}

// ⚙️ CARGAR CONFIGURACIONES
function loadSettings() {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        darkModeToggle.checked = true;
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    }
    
    // Cargar canciones guardadas si existen
    const savedSongs = localStorage.getItem('betania_songs');
    if (savedSongs) {
        try {
            const parsedSongs = JSON.parse(savedSongs);
            if (Array.isArray(parsedSongs) && parsedSongs.length > 0) {
                state.songs = parsedSongs;
                state.filtered = [...state.songs];
                console.log('🎵 Canciones cargadas desde localStorage');
            }
        } catch (e) {
            console.log('⚠️ Error cargando canciones guardadas');
        }
    }
}

// ⌨️ ATAJOS DE TECLADO
function setupGlobalKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Solo manejar atajos cuando no se está escribiendo en inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'z':
                    e.preventDefault();
                    if (state.editMode) undoEdit();
                    break;
                case 'y':
                    e.preventDefault();
                    if (state.editMode) redoEdit();
                    break;
                case 'e':
                    e.preventDefault();
                    if (state.selectedSong) toggleEditMode();
                    break;
                case 's':
                    e.preventDefault();
                    if (state.editMode) toggleEditMode();
                    break;
            }
        }
        
        // Atajos sin modificadores
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            switch(e.key) {
                case 'ArrowLeft':
                    if (state.selectedSong) {
                        e.preventDefault();
                        transposeKey(-1);
                    }
                    break;
                case 'ArrowRight':
                    if (state.selectedSong) {
                        e.preventDefault();
                        transposeKey(1);
                    }
                    break;
                case 'r':
                    if (state.selectedSong) {
                        e.preventDefault();
                        resetTransposition();
                    }
                    break;
                case 'Escape':
                    closeChordDiagram();
                    break;
            }
        }
    });
}

// 🛠️ RENDERIZAR HERRAMIENTAS
function renderTools() {
    mainContent.innerHTML = `
        <h2>🛠️ Herramientas Musicales</h2>
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="background: rgba(23, 162, 184, 0.1); border: 1px solid var(--info-color); padding: 1.5rem; border-radius: 12px; margin: 2rem 0;">
                <h3 style="color: var(--info-color); margin-bottom: 1rem;">🚀 Próximamente:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin: 0.5rem 0;">🎼 Generador de progresiones de acordes</li>
                    <li style="margin: 0.5rem 0;">🎵 Metrónomo integrado</li>
                    <li style="margin: 0.5rem 0;">🎸 Afinador de guitarra</li>
                    <li style="margin: 0.5rem 0;">📊 Analizador de tonalidades</li>
                    <li style="margin: 0.5rem 0;">🎙️ Grabador de audio</li>
                </ul>
            </div>
        </div>
    `;
}

// 🎙️ RENDERIZAR GRABACIONES
function renderRecordings() {
    mainContent.innerHTML = `
        <h2>🎙️ Sistema de Grabaciones</h2>
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="background: rgba(23, 162, 184, 0.1); border: 1px solid var(--info-color); padding: 1.5rem; border-radius: 12px; margin: 2rem 0;">
                <h3 style="color: var(--info-color); margin-bottom: 1rem;">🎤 Funcionalidades Planeadas:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin: 0.5rem 0;">📹 Grabación de audio/video</li>
                    <li style="margin: 0.5rem 0;">☁️ Sincronización con cloud</li>
                    <li style="margin: 0.5rem 0;">🎵 Grabaciones vinculadas a canciones</li>
                    <li style="margin: 0.5rem 0;">📱 Grabación desde móvil</li>
                    <li style="margin: 0.5rem 0;">🔄 Playback sincronizado</li>
                </ul>
            </div>
        </div>
    `;
}

// ➕ RENDERIZAR FORMULARIO DE AÑADIR CANCIÓN
function renderAddSongForm() {
    mainContent.innerHTML = `
        <h2>➕ Añadir Nueva Canción</h2>
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="background: rgba(40, 167, 69, 0.1); border: 1px solid var(--success-color); padding: 1.5rem; border-radius: 12px; margin: 2rem 0;">
                <h3 style="color: var(--success-color); margin-bottom: 1rem;">📝 Formulario Avanzado:</h3>
                <p style="margin-bottom: 1rem;">Próximamente podrás añadir canciones con:</p>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin: 0.5rem 0;">✏️ Editor visual de acordes y letras</li>
                    <li style="margin: 0.5rem 0;">🎼 Detector automático de tonalidad</li>
                    <li style="margin: 0.5rem 0;">📋 Importación desde texto/archivo</li>
                    <li style="margin: 0.5rem 0;">🎸 Validación de acordes</li>
                    <li style="margin: 0.5rem 0;">📷 Importación desde imagen</li>
                </ul>
            </div>
        </div>
    `;
}

// 🚀 INICIALIZAR CUANDO EL DOM ESTÉ LISTO
document.addEventListener('DOMContentLoaded', init);

// 📱 DETECTAR INSTALACIÓN PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    console.log('💾 PWA puede ser instalada');
    showSaveIndicator('📱 Disponible para instalar como app');
});

console.log('🎵 Sistema Betania V4 cargado - ¡Listo para alabar!');