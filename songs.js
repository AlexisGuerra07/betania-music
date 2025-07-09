// 🎵 SISTEMA DE ALABANZA BETANIA V4 - BASE DE DATOS COMPLETA DE CANCIONES Y ACORDES

// Base de datos de acordes con diagramas completa
const chordDatabase = {
    "A": [
        { 
            frets: [0, 0, 2, 2, 2, 0], 
            fingers: [0, 0, 1, 2, 3, 0], 
            position: "Abierto",
            notes: "A-E-A-C#-E",
            startFret: 0
        },
        { 
            frets: [5, 4, 6, 6, 6, 5], 
            fingers: [1, 0, 2, 3, 4, 1], 
            position: "5º Traste",
            notes: "A-E-A-C#-E-A",
            startFret: 5
        }
    ],
    "Am": [
        { 
            frets: [0, 0, 2, 2, 1, 0], 
            fingers: [0, 0, 2, 3, 1, 0], 
            position: "Abierto",
            notes: "A-E-A-C-E",
            startFret: 0
        },
        { 
            frets: [5, 3, 5, 5, 5, 3], 
            fingers: [1, 0, 2, 3, 4, 0], 
            position: "5º Traste",
            notes: "A-E-A-C-E-A",
            startFret: 5
        }
    ],
    "A7": [
        { 
            frets: [0, 0, 2, 0, 2, 0], 
            fingers: [0, 0, 2, 0, 3, 0], 
            position: "Abierto",
            notes: "A-E-A-C#-E-G",
            startFret: 0
        }
    ],
    "Amaj7": [
        { 
            frets: [0, 0, 2, 1, 2, 0], 
            fingers: [0, 0, 2, 1, 3, 0], 
            position: "Abierto",
            notes: "A-E-A-C#-E-G#",
            startFret: 0
        }
    ],
    "Am7": [
        { 
            frets: [0, 0, 2, 0, 1, 0], 
            fingers: [0, 0, 2, 0, 1, 0], 
            position: "Abierto",
            notes: "A-E-A-C-E-G",
            startFret: 0
        }
    ],
    "Asus2": [
        { 
            frets: [0, 0, 2, 2, 0, 0], 
            fingers: [0, 0, 1, 2, 0, 0], 
            position: "Abierto",
            notes: "A-E-A-B-E",
            startFret: 0
        }
    ],
    "Asus4": [
        { 
            frets: [0, 0, 2, 2, 3, 0], 
            fingers: [0, 0, 1, 2, 3, 0], 
            position: "Abierto",
            notes: "A-E-A-D-E",
            startFret: 0
        }
    ],
    "A#": [
        { 
            frets: [1, 1, 3, 3, 3, 1], 
            fingers: [1, 1, 2, 3, 4, 1], 
            position: "1º Traste",
            notes: "A#-F-A#-D-F",
            startFret: 1
        }
    ],
    "A#m": [
        { 
            frets: [1, 1, 3, 3, 2, 1], 
            fingers: [1, 1, 3, 4, 2, 1], 
            position: "1º Traste",
            notes: "A#-F-A#-C#-F",
            startFret: 1
        }
    ],
    "B": [
        { 
            frets: [-1, 2, 4, 4, 4, 2], 
            fingers: [0, 1, 3, 4, 4, 1], 
            position: "2º Traste",
            notes: "B-F#-B-D#-F#",
            startFret: 2
        },
        { 
            frets: [7, 6, 8, 8, 8, 7], 
            fingers: [1, 0, 2, 3, 4, 1], 
            position: "7º Traste",
            notes: "B-F#-B-D#-F#-B",
            startFret: 7
        }
    ],
    "Bm": [
        { 
            frets: [-1, 2, 4, 4, 3, 2], 
            fingers: [0, 1, 3, 4, 2, 1], 
            position: "2º Traste",
            notes: "B-F#-B-D-F#",
            startFret: 2
        },
        { 
            frets: [7, 5, 7, 7, 7, 5], 
            fingers: [1, 0, 2, 3, 4, 0], 
            position: "7º Traste",
            notes: "B-F#-B-D-F#-B",
            startFret: 7
        }
    ],
    "B7": [
        { 
            frets: [-1, 2, 1, 2, 0, 2], 
            fingers: [0, 2, 1, 3, 0, 4], 
            position: "Abierto",
            notes: "B-D#-F#-A-D#",
            startFret: 0
        }
    ],
    "Bmaj7": [
        { 
            frets: [-1, 2, 4, 3, 4, 2], 
            fingers: [0, 1, 3, 2, 4, 1], 
            position: "2º Traste",
            notes: "B-F#-B-D#-A#",
            startFret: 2
        }
    ],
    "Bm7": [
        { 
            frets: [-1, 2, 4, 2, 3, 2], 
            fingers: [0, 1, 3, 1, 2, 1], 
            position: "2º Traste",
            notes: "B-F#-B-D-F#-A",
            startFret: 2
        }
    ],
    "C": [
        { 
            frets: [-1, 3, 2, 0, 1, 0], 
            fingers: [0, 3, 2, 0, 1, 0], 
            position: "Abierto",
            notes: "C-G-C-E-G",
            startFret: 0
        },
        { 
            frets: [8, 7, 9, 9, 9, 8], 
            fingers: [1, 0, 2, 3, 4, 1], 
            position: "8º Traste",
            notes: "C-G-C-E-G-C",
            startFret: 8
        }
    ],
    "Cm": [
        { 
            frets: [-1, 3, 5, 5, 4, 3], 
            fingers: [0, 1, 3, 4, 2, 1], 
            position: "3º Traste",
            notes: "C-G-C-Eb-G",
            startFret: 3
        }
    ],
    "C7": [
        { 
            frets: [-1, 3, 2, 3, 1, 0], 
            fingers: [0, 3, 2, 4, 1, 0], 
            position: "Abierto",
            notes: "C-G-C-E-Bb",
            startFret: 0
        }
    ],
    "Cmaj7": [
        { 
            frets: [-1, 3, 2, 0, 0, 0], 
            fingers: [0, 3, 2, 0, 0, 0], 
            position: "Abierto",
            notes: "C-G-C-E-G-B",
            startFret: 0
        }
    ],
    "Cm7": [
        { 
            frets: [-1, 3, 5, 3, 4, 3], 
            fingers: [0, 1, 3, 1, 2, 1], 
            position: "3º Traste",
            notes: "C-G-C-Eb-G-Bb",
            startFret: 3
        }
    ],
    "Csus2": [
        { 
            frets: [-1, 3, 0, 0, 1, 0], 
            fingers: [0, 2, 0, 0, 1, 0], 
            position: "Abierto",
            notes: "C-G-C-D-G",
            startFret: 0
        }
    ],
    "Csus4": [
        { 
            frets: [-1, 3, 3, 0, 1, 0], 
            fingers: [0, 2, 3, 0, 1, 0], 
            position: "Abierto",
            notes: "C-G-C-F-G",
            startFret: 0
        }
    ],
    "C#": [
        { 
            frets: [-1, 4, 3, 1, 2, 1], 
            fingers: [0, 4, 3, 1, 2, 1], 
            position: "1º Traste",
            notes: "C#-G#-C#-F-G#",
            startFret: 1
        }
    ],
    "C#m": [
        { 
            frets: [-1, 4, 6, 6, 5, 4], 
            fingers: [0, 1, 3, 4, 2, 1], 
            position: "4º Traste",
            notes: "C#-G#-C#-E-G#",
            startFret: 4
        }
    ],
    "C#7": [
        { 
            frets: [-1, 4, 3, 4, 2, 1], 
            fingers: [0, 3, 2, 4, 1, 1], 
            position: "1º Traste",
            notes: "C#-G#-C#-F-B",
            startFret: 1
        }
    ],
    "D": [
        { 
            frets: [-1, -1, 0, 2, 3, 2], 
            fingers: [0, 0, 0, 1, 3, 2], 
            position: "Abierto",
            notes: "D-A-D-F#",
            startFret: 0
        },
        { 
            frets: [10, 9, 11, 11, 11, 10], 
            fingers: [1, 0, 2, 3, 4, 1], 
            position: "10º Traste",
            notes: "D-A-D-F#-A-D",
            startFret: 10
        }
    ],
    "Dm": [
        { 
            frets: [-1, -1, 0, 2, 3, 1], 
            fingers: [0, 0, 0, 2, 3, 1], 
            position: "Abierto",
            notes: "D-A-D-F",
            startFret: 0
        },
        { 
            frets: [10, 8, 10, 10, 10, 8], 
            fingers: [1, 0, 2, 3, 4, 0], 
            position: "10º Traste",
            notes: "D-A-D-F-A-D",
            startFret: 10
        }
    ],
    "D7": [
        { 
            frets: [-1, -1, 0, 2, 1, 2], 
            fingers: [0, 0, 0, 2, 1, 3], 
            position: "Abierto",
            notes: "D-A-D-F#-C",
            startFret: 0
        }
    ],
    "Dmaj7": [
        { 
            frets: [-1, -1, 0, 2, 2, 2], 
            fingers: [0, 0, 0, 1, 1, 1], 
            position: "Abierto",
            notes: "D-A-D-F#-C#",
            startFret: 0
        }
    ],
    "Dm7": [
        { 
            frets: [-1, -1, 0, 2, 1, 1], 
            fingers: [0, 0, 0, 2, 1, 1], 
            position: "Abierto",
            notes: "D-A-D-F-C",
            startFret: 0
        }
    ],
    "Dsus2": [
        { 
            frets: [-1, -1, 0, 2, 3, 0], 
            fingers: [0, 0, 0, 1, 2, 0], 
            position: "Abierto",
            notes: "D-A-D-E-A",
            startFret: 0
        }
    ],
    "Dsus4": [
        { 
            frets: [-1, -1, 0, 2, 3, 3], 
            fingers: [0, 0, 0, 1, 2, 3], 
            position: "Abierto",
            notes: "D-A-D-G-A",
            startFret: 0
        }
    ],
    "D#": [
        { 
            frets: [-1, -1, 1, 3, 4, 3], 
            fingers: [0, 0, 1, 2, 4, 3], 
            position: "1º Traste",
            notes: "D#-A#-D#-G",
            startFret: 1
        }
    ],
    "D#m": [
        { 
            frets: [-1, -1, 1, 3, 4, 2], 
            fingers: [0, 0, 1, 3, 4, 2], 
            position: "1º Traste",
            notes: "D#-A#-D#-F#",
            startFret: 1
        }
    ],
    "E": [
        { 
            frets: [0, 2, 2, 1, 0, 0], 
            fingers: [0, 2, 3, 1, 0, 0], 
            position: "Abierto",
            notes: "E-B-E-G#-B-E",
            startFret: 0
        },
        { 
            frets: [12, 11, 13, 13, 13, 12], 
            fingers: [1, 0, 2, 3, 4, 1], 
            position: "12º Traste",
            notes: "E-B-E-G#-B-E",
            startFret: 12
        }
    ],
    "Em": [
        { 
            frets: [0, 2, 2, 0, 0, 0], 
            fingers: [0, 2, 3, 0, 0, 0], 
            position: "Abierto",
            notes: "E-B-E-G-B-E",
            startFret: 0
        },
        { 
            frets: [12, 10, 12, 12, 12, 10], 
            fingers: [1, 0, 2, 3, 4, 0], 
            position: "12º Traste",
            notes: "E-B-E-G-B-E",
            startFret: 12
        }
    ],
    "E7": [
        { 
            frets: [0, 2, 0, 1, 0, 0], 
            fingers: [0, 2, 0, 1, 0, 0], 
            position: "Abierto",
            notes: "E-B-E-G#-B-D",
            startFret: 0
        }
    ],
    "Emaj7": [
        { 
            frets: [0, 2, 1, 1, 0, 0], 
            fingers: [0, 2, 1, 1, 0, 0], 
            position: "Abierto",
            notes: "E-B-E-G#-B-D#",
            startFret: 0
        }
    ],
    "Em7": [
        { 
            frets: [0, 2, 0, 0, 0, 0], 
            fingers: [0, 2, 0, 0, 0, 0], 
            position: "Abierto",
            notes: "E-B-E-G-B-D",
            startFret: 0
        }
    ],
    "Esus2": [
        { 
            frets: [0, 2, 2, 4, 0, 0], 
            fingers: [0, 1, 2, 4, 0, 0], 
            position: "Abierto",
            notes: "E-B-E-F#-B-E",
            startFret: 0
        }
    ],
    "Esus4": [
        { 
            frets: [0, 2, 2, 2, 0, 0], 
            fingers: [0, 1, 2, 3, 0, 0], 
            position: "Abierto",
            notes: "E-B-E-A-B-E",
            startFret: 0
        }
    ],
    "F": [
        { 
            frets: [1, 3, 3, 2, 1, 1], 
            fingers: [1, 3, 4, 2, 1, 1], 
            position: "1º Traste",
            notes: "F-C-F-A-C-F",
            startFret: 1
        },
        { 
            frets: [13, 12, 14, 14, 14, 13], 
            fingers: [1, 0, 2, 3, 4, 1], 
            position: "13º Traste",
            notes: "F-C-F-A-C-F",
            startFret: 13
        }
    ],
    "Fm": [
        { 
            frets: [1, 3, 3, 1, 1, 1], 
            fingers: [1, 3, 4, 1, 1, 1], 
            position: "1º Traste",
            notes: "F-C-F-Ab-C-F",
            startFret: 1
        }
    ],
    "F7": [
        { 
            frets: [1, 3, 1, 2, 1, 1], 
            fingers: [1, 3, 1, 2, 1, 1], 
            position: "1º Traste",
            notes: "F-C-F-A-C-Eb",
            startFret: 1
        }
    ],
    "Fmaj7": [
        { 
            frets: [1, 3, 2, 2, 1, 1], 
            fingers: [1, 4, 2, 3, 1, 1], 
            position: "1º Traste",
            notes: "F-C-F-A-C-E",
            startFret: 1
        }
    ],
    "Fm7": [
        { 
            frets: [1, 3, 1, 1, 1, 1], 
            fingers: [1, 3, 1, 1, 1, 1], 
            position: "1º Traste",
            notes: "F-C-F-Ab-C-Eb",
            startFret: 1
        }
    ],
    "F#": [
        { 
            frets: [2, 4, 4, 3, 2, 2], 
            fingers: [1, 3, 4, 2, 1, 1], 
            position: "2º Traste",
            notes: "F#-C#-F#-A#-C#-F#",
            startFret: 2
        }
    ],
    "F#m": [
        { 
            frets: [2, 4, 4, 2, 2, 2], 
            fingers: [1, 3, 4, 1, 1, 1], 
            position: "2º Traste",
            notes: "F#-C#-F#-A-C#-F#",
            startFret: 2
        }
    ],
    "F#7": [
        { 
            frets: [2, 4, 2, 3, 2, 2], 
            fingers: [1, 3, 1, 2, 1, 1], 
            position: "2º Traste",
            notes: "F#-C#-F#-A#-C#-E",
            startFret: 2
        }
    ],
    "F#maj7": [
        { 
            frets: [2, 4, 3, 3, 2, 2], 
            fingers: [1, 4, 2, 3, 1, 1], 
            position: "2º Traste",
            notes: "F#-C#-F#-A#-C#-F",
            startFret: 2
        }
    ],
    "F#m7": [
        { 
            frets: [2, 4, 2, 2, 2, 2], 
            fingers: [1, 3, 1, 1, 1, 1], 
            position: "2º Traste",
            notes: "F#-C#-F#-A-C#-E",
            startFret: 2
        }
    ],
    "G": [
        { 
            frets: [3, 2, 0, 0, 3, 3], 
            fingers: [3, 2, 0, 0, 4, 4], 
            position: "Abierto",
            notes: "G-D-G-B-D-G",
            startFret: 0
        },
        { 
            frets: [3, 5, 5, 4, 3, 3], 
            fingers: [1, 3, 4, 2, 1, 1], 
            position: "3º Traste",
            notes: "G-D-G-B-D-G",
            startFret: 3
        }
    ],
    "Gm": [
        { 
            frets: [3, 5, 5, 3, 3, 3], 
            fingers: [1, 3, 4, 1, 1, 1], 
            position: "3º Traste",
            notes: "G-D-G-Bb-D-G",
            startFret: 3
        }
    ],
    "G7": [
        { 
            frets: [3, 2, 0, 0, 0, 1], 
            fingers: [3, 2, 0, 0, 0, 1], 
            position: "Abierto",
            notes: "G-D-G-B-D-F",
            startFret: 0
        }
    ],
    "Gmaj7": [
        { 
            frets: [3, 2, 0, 0, 0, 2], 
            fingers: [3, 2, 0, 0, 0, 1], 
            position: "Abierto",
            notes: "G-D-G-B-D-F#",
            startFret: 0
        }
    ],
    "Gm7": [
        { 
            frets: [3, 5, 3, 3, 3, 3], 
            fingers: [1, 3, 1, 1, 1, 1], 
            position: "3º Traste",
            notes: "G-D-G-Bb-D-F",
            startFret: 3
        }
    ],
    "Gsus2": [
        { 
            frets: [3, 0, 0, 0, 3, 3], 
            fingers: [2, 0, 0, 0, 3, 4], 
            position: "Abierto",
            notes: "G-D-G-A-D-G",
            startFret: 0
        }
    ],
    "Gsus4": [
        { 
            frets: [3, 3, 0, 0, 3, 3], 
            fingers: [2, 3, 0, 0, 4, 4], 
            position: "Abierto",
            notes: "G-D-G-C-D-G",
            startFret: 0
        }
    ],
    "G#": [
        { 
            frets: [4, 6, 6, 5, 4, 4], 
            fingers: [1, 3, 4, 2, 1, 1], 
            position: "4º Traste",
            notes: "G#-D#-G#-C-D#-G#",
            startFret: 4
        }
    ],
    "G#m": [
        { 
            frets: [4, 6, 6, 4, 4, 4], 
            fingers: [1, 3, 4, 1, 1, 1], 
            position: "4º Traste",
            notes: "G#-D#-G#-B-D#-G#",
            startFret: 4
        }
    ],
    "G#7": [
        { 
            frets: [4, 6, 4, 5, 4, 4], 
            fingers: [1, 3, 1, 2, 1, 1], 
            position: "4º Traste",
            notes: "G#-D#-G#-C-D#-F#",
            startFret: 4
        }
    ]
};

// Base de datos de canciones - ESTRUCTURA DE EJEMPLO
// ⚠️ IMPORTANTE: Estas son estructuras de ejemplo. Reemplaza con tus propias canciones.
const songsData = [
    {
        title: "Ejemplo de Canción 1",
        artist: "Artista Ejemplo",
        key: "G",
        lyrics: {
            "VERSO 1": [
                "G                    C               G",
                "Esta es una línea de ejemplo",
                "D                    C               G", 
                "Con acordes de muestra",
                "Em                C               D",
                "Puedes editarla fácilmente",
                "C         D           G",
                "En modo edición"
            ],
            "CORO": [
                "G              D",
                "Este es el coro de ejemplo",
                "Em               C",
                "Con más acordes para probar",
                "G                   D",
                "El sistema de transposición",
                "Em              C            D          G",
                "Y todas las funcionalidades"
            ],
            "VERSO 2": [
                "G                    C               G",
                "Segundo verso de muestra",
                "D                    C               G",
                "Para probar el sistema",
                "Em                C               D",
                "Añade tus propias canciones",
                "C         D           G",
                "Siguiendo esta estructura"
            ]
        }
    },
    {
        title: "Ejemplo de Canción 2",
        artist: "Otro Artista",
        key: "D",
        lyrics: {
            "ESTROFA": [
                "D              G              D",
                "Línea de ejemplo en D",
                "A      G              D",
                "Con diferentes acordes",
                "Bm        G      D",
                "Para mostrar el sistema",
                "A  G   D",
                "De edición completo"
            ],
            "CORO": [
                "Bm A G",
                "Coro en tonalidad D",
                "Em D G",
                "Con acordes transpuestos"
            ]
        }
    },
    {
        title: "Ejemplo de Canción 3",
        artist: "Tercer Artista",
        key: "C",
        lyrics: {
            "INTRO": [
                "C F Am G",
                "C F G C"
            ],
            "VERSO": [
                "C                  F",
                "Ejemplo en tonalidad C",
                "Am                G",
                "Con progresión simple",
                "C                  F",
                "Fácil de editar",
                "Am                G",
                "Y transponer"
            ],
            "PUENTE": [
                "F                G",
                "Sección puente",
                "Am              C",
                "Con más acordes",
                "F                G",
                "Para completar",
                "C",
                "La estructura"
            ]
        }
    },
    {
        title: "Ejemplo de Canción 4",
        artist: "Cuarto Artista",
        key: "E",
        lyrics: {
            "ESTROFA": [
                "E     A    B         C#m   E",
                "Ejemplo con acordes complejos",
                "F#m       E            B",
                "Incluyendo séptimas y menores",
                "A       B     C#m        E",
                "Para probar transposición",
                "F#m             E             B",
                "De todos los tipos"
            ],
            "CORO": [
                "A            E",
                "Coro en E mayor",
                "B                      C#m",
                "Con progresión estándar",
                "A           E",
                "Para mostrar capacidades",
                "B                      E",
                "Del sistema completo"
            ]
        }
    },
    {
        title: "Ejemplo de Canción 5",
        artist: "Quinto Artista",
        key: "A",
        lyrics: {
            "INTRO": [
                "A D F#m E",
                "A D E A"
            ],
            "VERSO": [
                "A                 D",
                "Verso en A mayor",
                "F#m              E",
                "Con menores incluidos",
                "A                 D",
                "Para demostrar",
                "F#m              E",
                "Funcionalidad completa"
            ],
            "PRE-CORO": [
                "D      E           A",
                "Pre-coro de ejemplo",
                "F#m      E           A",
                "Con más progresión",
                "D      E           A",
                "Antes del coro",
                "F#m      E           A",
                "Principal"
            ],
            "CORO": [
                "D",
                "Coro principal",
                "E",
                "En A mayor",
                "F#m                A",
                "Con diferentes acordes",
                "D         E    A",
                "Para completar"
            ]
        }
    },
    {
        title: "Ejemplo de Canción 6",
        artist: "Sexto Artista",
        key: "F",
        lyrics: {
            "VERSO": [
                "F",
                "Ejemplo en F",
                "Bb           F",
                "Con acordes de cejilla",
                "Dm              C",
                "Más desafiantes",
                "Bb",
                "Para guitarristas"
            ],
            "CORO": [
                "Bb",
                "Coro en F mayor",
                "C",
                "Con progresión típica",
                "Dm",
                "De esta tonalidad",
                "F",
                "Muy común"
            ]
        }
    },
    {
        title: "Ejemplo de Canción 7",
        artist: "Séptimo Artista",
        key: "Am",
        lyrics: {
            "VERSO": [
                "Am                F",
                "Ejemplo en menor",
                "C                 G",
                "Progresión vi-IV-I-V",
                "Am                F",
                "Muy popular",
                "C           G         Am",
                "En música moderna"
            ],
            "CORO": [
                "F                C",
                "Coro en La menor",
                "G                Am",
                "Con resolución menor",
                "F                C",
                "Sonido melancólico",
                "G                Am",
                "Característico"
            ]
        }
    },
    {
        title: "Ejemplo Acordes con Barras",
        artist: "Artista Avanzado",
        key: "E",
        lyrics: {
            "VERSO": [
                "E/G#              A",
                "Acordes con bajo específico",
                "B/D#              C#m",
                "Para líneas de bajo",
                "A/C#              B/D#",
                "Más sofisticadas",
                "E/G#              A",
                "En progresiones"
            ],
            "CORO": [
                "A/C# B/D# E/G#",
                "Inversiones complejas",
                "A/C# B/D# E",
                "Para músicos avanzados"
            ]
        }
    },
    {
        title: "Ejemplo Acordes Extendidos",
        artist: "Artista Jazz",
        key: "Cmaj7",
        lyrics: {
            "VERSO": [
                "Cmaj7             Dm7",
                "Acordes de séptima",
                "Em7               Am7",
                "Sonido jazzístico",
                "Fmaj7             G7",
                "Progresión extendida",
                "Em7     Am7       Dm7   G7",
                "Con resolución completa"
            ],
            "PUENTE": [
                "Am7               Dm7",
                "Puente con séptimas",
                "G7                Cmaj7",
                "Resolución a mayor séptima",
                "Fmaj7             Em7",
                "Colores armónicos",
                "Dm7               G7",
                "Más ricos"
            ]
        }
    },
    {
        title: "Ejemplo Progresión Compleja",
        artist: "Artista Experimental",
        key: "D",
        lyrics: {
            "INTRO": [
                "Dsus4 D Dsus2 D",
                "Gmaj7 A7sus4 A7"
            ],
            "VERSO": [
                "D                 Gmaj7",
                "Progresión con suspensiones",
                "A7sus4            A7",
                "Y resoluciones interesantes",
                "Bm7               Em7",
                "Acordes de color",
                "A7sus4   A7       D",
                "Para sonido moderno"
            ],
            "CORO": [
                "G             A7sus4  A7",
                "Coro con suspensiones",
                "Bm7           Em7     A7",
                "Y séptimas añadidas",
                "G             A7sus4  A7",
                "Para mayor interés",
                "D        Dsus4  D",
                "Armónico"
            ]
        }
    }
];

// ========================================
// INSTRUCCIONES PARA AÑADIR TUS CANCIONES
// ========================================

/*
CÓMO AÑADIR TUS PROPIAS CANCIONES:

1. Copia la estructura de cualquier canción de ejemplo
2. Cambia el título, artista y key
3. Reemplaza las letras con tus propias canciones
4. Asegúrate de seguir el formato de acordes: "C    G    Am   F"

FORMATO DE ACORDES SOPORTADOS:
- Básicos: C, D, E, F, G, A, B
- Menores: Cm, Dm, Em, etc.
- Séptimas: C7, D7, Cmaj7, Dm7, etc.
- Suspensiones: Csus2, Csus4, etc.
- Con sostenidos/bemoles: C#, Bb, F#m, etc.
- Con bajo: C/G, Am/E, etc.

EJEMPLO DE ESTRUCTURA:
{
    title: "Tu Canción",
    artist: "Tu Artista",
    key: "C",
    lyrics: {
        "VERSO": [
            "C                G",
            "Tu letra aquí",
            "Am               F",
            "Con los acordes arriba"
        ],
        "CORO": [
            "F                C",
            "El coro de tu canción",
            "G                Am",
            "Siguiendo el mismo formato"
        ]
    }
}

SECCIONES COMUNES:
- INTRO
- VERSO / ESTROFA
- PRE-CORO
- CORO
- PUENTE / BRIDGE
- FINAL / OUTRO

¡Personaliza tu base de datos musical!
*/

console.log('🎵 Base de datos cargada:', songsData.length, 'canciones de ejemplo');
console.log('🎸 Base de datos de acordes:', Object.keys(chordDatabase).length, 'acordes disponibles');
console.log('💡 Reemplaza las canciones de ejemplo con tus propias canciones siguiendo la estructura mostrada');
