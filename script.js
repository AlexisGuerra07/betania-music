// 🎵 SISTEMA DE ALABANZA BETANIA V4 - JAVASCRIPT COMPLETO ACTUALIZADO
// Sistema completamente funcional con transposición y modo oscuro corregidos

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
    }, // <--- CIERRA CORRECTAMENTE EL OBJETO DE ENTRELAZADOS Y SEPARA LOS OBJETOS
    {
        title: "SEA LA LUZ",
        artist: "Artista", // Cambia por el nombre del artista
        key: "A",
        lyrics: {
            "INTRO": [
                "D-F#m - A-C#m",
                "D-F#m - A - B"
            ],
            "ESTROFA": [
                "   A                              Em",
                "Cristo, eres la luz de mundo",
                "                             D                                    D",
                "Eres el sol de justicia, Que nunca deja de brillar",
                "   A                               Em",
                "Cristo, tu luz no avergüenza",
                "                            D                                       A",
                "Tu luz nunca condena, solo muestra tu gloria"
            ],
            "PRE CORO": [
                "            F#m                   A            D",
                "Esta generación se expone a tu luz",
                "         F#m               A               D.          E",
                "Y cada nación responde a tu voz"
            ],
            "CORO": [
                "          D",
                "//Sea la luz, en este lugar",
                "A/C#    D",
                "Sea la luz y todo se ordena",
                "E     F#m              A       C#m",
                "Sea la luz y hágase tu voluntad//"
            ],
            "PUENTE": [
                "Bm -A/C# - D",
                "",
                "    Bm          A/C#.             D",
                "//Todo se ilumina cuando tú estas",
                "Bm          A/C#.    D",
                "Todo se ordena, todo se transforma//",
                "",
                "                           D",
                "////Tu eres la luz que alumbra mi vida",
                "A/C#     D",
                "Eres la luz que el mundo ilumina",
                "E     F#m                    A       C#m",
                "Eres la luz, yo amo hacer tu voluntad ////"
            ],
            "FINAL": [
                "D  F#m    A C#m",
                "D. F#m.   A B7",
                "D"
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
        title: "SANTO ESPÍRITUD VEN",
        artist: "Marcos Witt",
        key: "E",
        lyrics: {
            VERSO: [
                "E                  A",
                "Santo Espíritu ven, llénanos Señor",
                "B       A              E",
                "De tu presencia y de tu amor",
                "E",
                "Ven y toma control de mi ser",
                "B  A   E",
                "Santo Espíritu ven"
            ],
            CORO: [
                "A            E",
                "Ven, ven, ven Espíritu Santo",
                "B",
                "Ven, ven, ven y llénanos",
                "A           E",
                "Con tu fuego santo",
                "B                      E",
                "Ven y renueva nuestro corazón"
            ]
        }
    },
    {
        title: "ABBA (Nunca falla TTL)",
        artist: "Tu Artista", // Cambia por el nombre del artista
        key: "D",
        lyrics: {
            "ESTROFA": [
                "D G",
                "Escucho tu corazón",
                "A D",
                "Cada latido está llamando mi nombre",
                "       G",
                "Soy atraído otra vez por tu sangre",
                "      D",
                "Me siento tan mimado por ti",
                "G",
                "Me encuentro en tu corazón",
                "      A      D",
                "Decidiste aceptarme por siempre",
                "G",
                "Tu amor por mí es tan sorprendente",
                "    D",
                "Me siento tan amado por ti, mi papá"
            ],
            "PRECORO": [
                "   A D",
                "Y es tan bello saber que soy hijo",
                "A D",
                "Y que tengo un lugar en tu mesa",
                "A D",
                "No hay nada mejor que escuchar tu voz",
                "       A       D",
                "Diciendo \"nuestra comunión es eterna\"",
                "              Em  A",
                "Oh oh oh oh, oh oh oh oh",
                "  D",
                "Me amaste primero, con amor verdadero",
                "   Em  A",
                "Oh oh oh oh, oh oh oh oh",
                "D",
                "Y mi respuesta es adorar, mi respuesta es adorar"
            ],
            CORO: [
                "Em  A9        D",
                "ABBA, tu amor nunca falla, siempre me abraza"
            ],
            INSTRUMENTAL: [
                "Em A9         D"
            ],
            PUENTE: [
                "           Em.                                    A9",
                "Abba Padre, enséñanos a ser familia",
                "             D",
                "Abba Padre, enséñanos a ser familia"
            ]
        }
    },
    {
        title: "ADMIRABLE (TTL)",
        artist: "TTL",
        key: "Am7",
        lyrics: {
            "INTRO": [
                "Am7 G  C7aug  F"
            ],
            "ESTROFA": [
                "    Am7",
                "Pagaste un alto precio",
                "       G.                          C7aug",
                "Y abriste el camino y  hoy",
                "                                F",
                "Puedo acercarme a ti",
                "      Am7",
                "Me diste libre acceso",
                "    G.                             C7aug",
                "A tu lugar secreto y tu amor",
                "                              F",
                "Consume todo en mí"
            ],
            "PRE-CORO": [
                "                  Dm7      G",
                "Nadie me abraza como tú",
                "                    Em7              F",
                "Nadie me perdona como tú",
                "                       Dm7.                     G",
                "Y te responderé con mi mejor perfume",
                "                 Em7                 F",
                "Solo tú mereces mi devoción",
                "                      Dm7                        G",
                "Y te responderé con toda mi obediencia",
                "               Em7                 F",
                "Solo tú mereces mi corazón"
            ],
            "CORO": [
                "         F.                      G",
                "Jesucristo, eres el centro",
                "                                      Am7",
                "No puedo dejar de mirarte",
                "                                    Em",
                "No puedo dejar de mirarte",
                "         F.                         G",
                "Jesucristo adoro tu nombre",
                "                         Am7",
                "Eres tan admirable, ",
                "               Em",
                "tan admirable",
                "(Am7 G  C7aug  F)",
                "OOOOH OOOH OOOHH x3"
            ],
            "PUENTE": [
                "          Am7.                                  G",
                "Y sobre toda circunstancia tú estás",
                "         C.                         F",
                "Eres Rey, por siempre Rey",
                "         Am7.                             G",
                "Sobre todo principado y potestad",
                "        C.                         F",
                "Eres Rey, por siempre Rey",
                "            Am7.                                   G",
                "//Quien fue, quien es y pronto vendrá",
                "        C.                          F",
                "Eres Rey, por siempre Rey//",
                "(Am7 G  C7aug  F)",
                "OOOHH OOOOH OOOOH x3"
            ],
            "CORO x2": [
                "(Repetir CORO dos veces)"
            ],
            "CANTO ESPONTÁNEO": [
                "(con acordes de OOOHH)",
                "                               Am7.                              G",
                "Todos los que te miraron no fueron avergonzados",
                "                               C.                            F",
                "Todos los que te miraron fueron alumbrados",
                "                               Am7.                               G",
                "Todos los que te miraron no fueron avergonzados",
                "                   C.                         F",
                "Todos te miramos, todos te miramos",
                "",
                "Misma rueda siempre: Am7 G  C7aug  F",
                "",
                "//Puestos los ojos en Cristo//                              ",
                "//Corremos con paciencia //",
                "No puedo dejar de mirarte x8"
            ]
        }
    },
    {
        title: "AL QUE ESTÁ SENTADO",
        artist: "",
        key: "E",
        lyrics: {
            "ESTROFA": [
                "E           C#m",
                "Quiero conocerte, cada día mas a ti",
                "Bsus B A",
                "Y estar en tu presencia y adorar",
                "C#m        Bsus",
                "Revélanos tu gloria deseamos ir",
                "B         A",
                "Mucho más en ti, queremos tu presencia",
                "B   Bsus  B",
                "Jesús."
            ],
            "CORO": [
                "E",
                "Al que está sentado en el trono",
                "C#m",
                "Al que vive para siempre y siempre",
                "F#m",
                "//Sea la Gloria",
                "E/G#",
                "Sea la Honra y el Poder",
                "A",
                "Sea la Gloria",
                "B   Bsus  B",
                "Sea la Honra y el Poder//"
            ]
        }
    },
    {
        title: "REY JUSTO (TTL)",
        artist: "TTL",
        key: "Am",
        lyrics: {
            "CORO": [
                "Am.                          C.             F",
                "/Toda gloria al Dios poderoso",
                "      Dm",
                "¿Quién no te temerá?",
                "Am.                         C.            F",
                "Toda gloria al Dios poderoso",
                "        Dm",
                "El incienso subirá/X3"
            ],
            "INSTRUMENTAL CORO": [
                "(Instrumental de coro x2)"
            ],
            "ESTROFA": [
                "F.       Am. Dm",
                "Altísimo creador dueño de todo",
                "F.               Am.  Dm",
                "Tus juicios son fieles y justos",
                "F.                   Am.     Dm",
                "El que nos amó primero y último de todos",
                "F.            Am.       Dm",
                "Inmensurable, su reino no tendrá fin"
            ],
            "INSTRUMENTAL CORO 2": [
                "(Instrumental de coro)"
            ],
            "ESTROFA 2": [
                "(Repetir ESTROFA)"
            ],
            "INSTRUMENTAL CORO 3": [
                "(Instrumental de coro)"
            ],
            "PUENTE": [
                "     Dm.                  C.                                       F",
                "/Y aquí permaneceremos alrededor de tu presencia",
                "              Dm.                  C.                                               F",
                "Sé entronado en las alabanzas de tu pueblo en toda la tierra/ X2"
            ],
            "CORO FINAL": [
                "CORO x4 F G Am G F Dm"
            ]
        }
    },
    {
        title: "AQUÍ ESTOY",
        artist: "",
        key: "G",
        lyrics: {
            "ESTROFA 1": [
                "G        C",
                "Tú eres el principio,",
                "G        C",
                "tuya es la eternidad,",
                "Em       D",
                "Llamaste el mundo a existencia,",
                "C        D",
                "me acerco a ti."
            ],
            "ESTROFA 2": [
                "G        C",
                "Moriste por mis fracasos,",
                "G        C",
                "llevaste mi culpa en la cruz,",
                "Em       D",
                "cargaste en tus hombros mi carga,",
                "C        D",
                "me acerco a ti."
            ],
            "PRECORO": [
                "C-D-Em   C-D-Em",
                "¿Qué puedo hacer? ¿qué puedo decir?",
                "C   D   Em   D",
                "Te ofrezco mi corazón completamente a ti."
            ],
            "ESTROFA 3": [
                "En Tu salvación camino, tu espíritu vive en mí,",
                "declaras en tus promesas, me acerco a ti."
            ],
            "PRECORO 2": [
                "//¿Qué puedo hacer? ¿qué puedo decir?",
                "Te ofrezco mi corazón completamente a ti.//"
            ],
            "CORO": [
                "C   G   D   Em",
                "Aquí estoy, con manos alzadas vengo,",
                "C   G   D   Em   C",
                "Pues tú todo lo diste por mí.",
                "G   D   Em",
                "Aquí estoy, mi alma a ti entrego,",
                "C   G   D",
                "Tuyo soy, Señor.",
                "(x5)"
            ]
        }
    },
    {
        title: "ÁRBOL",
        artist: "",
        key: "Em",
        lyrics: {
            "ESTROFA": [
                "Em",
                "Yo quiero ser firme, inamovible",
                "C",
                "profundizarme de raíz",
                "G D",
                "firme, inamovible en ti",
                "Y yo como un árbol quiero ser",
                "y arraigado quiero estar",
                "junto aguas vivas",
                "Haz llover, haz llover",
                "abre las puertas del cielo"
            ]
        }
    },
    {
        title: "AL QUE CABALGA",
        artist: "Tu Artista", // Cambia por el nombre del artista
        key: "Bm",
        lyrics: {
            "INTRO": [
                "Bmx4",
                "G      A.   Bm.    F#maj7/A"
            ],
            "VERSO": [
                "G.",
                "Con voz de mando",
                "          A",
                "y con trompeta desde el cielo",
                "Bm.                               A",
                "Los Santos se levantarán",
                "G.                                  A",
                "Un gran anuncio se escucha en la tierra",
                "Bm.                                 A",
                "El Rey ya viene a gobernar"
            ],
            "CORO": [
                "Bm",
                "Al que cabalga sobre los cielos",
                "F#maj7/A",
                "Le preparamos el camino en la tierra"
            ],
            "PUENTE 1": [
                "Gmaj7",
                "Sus ojos son como llamas de fuego",
                "A",
                "Cabellos como blanca lana",
                " Bm                                      F#maj7/A",
                "Y su rostro resplandece como el sol"
            ],
            "PUENTE 2": [
                "Gmaj7. A. Bm. F#maj7/A",
                "Levántate fuerte y valiente",
                "Levántate esposo, rey y juez"
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
    autoSave: true,
    originalSong: null // 🔧 NUEVO: Para almacenar la canción original sin modificar
};

// 🎯 ELEMENTOS DOM
let sectionSelect, searchInput, orderSelect, songListUL, addToSetBtn, logoImg, mainContent, darkModeToggle;

// 🚀 INICIALIZAR APLICACIÓN - VERSIÓN CORREGIDA
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

    // Verificar que el elemento existe
    if (!darkModeToggle) {
        console.error('❌ Error: No se encontró el elemento dark-mode toggle');
        return;
    }

    // Agregar event listeners
    sectionSelect.addEventListener("change", onSectionChange);
    searchInput.addEventListener("input", refreshList);
    orderSelect.addEventListener("change", refreshList);
    addToSetBtn.addEventListener("click", addCheckedToSetlist);
    logoImg.addEventListener("click", () => location.reload());
    
    // ⭐ IMPORTANTE: Usar 'change' en lugar de 'click' para checkboxes
    darkModeToggle.addEventListener("change", toggleDarkMode);

    // Inicializar estado
    state.filtered = [...state.songs];
    renderList();
    loadSettings(); // Cargar configuraciones después de obtener elementos DOM
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
                state.originalSong = JSON.parse(JSON.stringify(song)); // 🔧 GUARDAR ORIGINAL
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
            <button onclick="transposeKey(-1)" title="Bajar medio tono">♭ BAJAR TONO</button>
            <button onclick="transposeKey(1)" title="Subir medio tono">♯ SUBIR TONO</button>
            <button onclick="resetTransposition()" title="Volver a tonalidad original">🔄 RESET</button>
            <button onclick="toggleEditMode()" title="Activar/desactivar modo edición">
                ${state.editMode ? '💾 GUARDAR' : '✏️ EDITAR'}
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

// 🎼 TRANSPOSICIÓN DE ACORDES - FUNCIONES CORREGIDAS

// ♭ ♯ TRANSPONER TONALIDAD (🔧 CORREGIDO)
function transposeKey(steps) {
    state.currentSteps += steps;
    const newKey = transpose(state.baseKey, state.currentSteps);
    
    // 🔧 IMPORTANTE: Transponer siempre desde la canción ORIGINAL
    const songToTranspose = state.originalSong || state.selectedSong;
    const transposedSong = transposeSong(songToTranspose, state.currentSteps);
    
    // Actualizar display
    document.getElementById('current-key').textContent = newKey;
    document.getElementById('song-display').innerHTML = renderSongSections(transposedSong);
    
    // Re-añadir listeners para acordes
    document.querySelectorAll('.chord').forEach(chord => {
        chord.addEventListener('click', () => showChordDiagram(chord.textContent));
    });
    
    // Si estamos en modo edición, actualizar también la canción editada
    if (state.editMode && state.editedSong) {
        state.editedSong = transposedSong;
    }
    
    // Actualizar indicador de tonalidad
    const stepsText = state.currentSteps !== 0 ? ` (${state.currentSteps > 0 ? '+' : ''}${state.currentSteps} semitonos)` : '';
    const keyDisplay = document.querySelector('.current-key-display strong');
    if (keyDisplay) {
        keyDisplay.innerHTML = `Tonalidad actual: <span id="current-key" style="color: var(--accent-teal); font-size: 1.2rem;">${newKey}</span>${stepsText}`;
    }
    
    showSaveIndicator(`🎼 Transpuesto a ${newKey} ${steps > 0 ? '♯' : '♭'}`);
}

// 🔄 RESETEAR TRANSPOSICIÓN (🔧 CORREGIDO)
function resetTransposition() {
    if (state.currentSteps !== 0) {
        state.currentSteps = 0;
        
        // Volver a la canción original sin transposición
        const originalSong = state.originalSong || state.selectedSong;
        
        document.getElementById('current-key').textContent = state.baseKey;
        document.getElementById('song-display').innerHTML = renderSongSections(originalSong);
        
        // Re-añadir listeners
        document.querySelectorAll('.chord').forEach(chord => {
            chord.addEventListener('click', () => showChordDiagram(chord.textContent));
        });
        
        // Si estamos en modo edición, resetear a la versión original
        if (state.editMode) {
            state.editedSong = JSON.parse(JSON.stringify(originalSong));
        }
        
        // Actualizar indicador
        const keyDisplay = document.querySelector('.current-key-display strong');
        if (keyDisplay) {
            keyDisplay.innerHTML = `Tonalidad actual: <span id="current-key" style="color: var(--accent-teal); font-size: 1.2rem;">${state.baseKey}</span>`;
        }
        
        showSaveIndicator('🔄 Tonalidad original restaurada');
    }
}

// 🎵 TRANSPONER UN SOLO ACORDE (🔧 CORREGIDO)
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

// 🎼 TRANSPONER CANCIÓN COMPLETA (🔧 CORREGIDO)
function transposeSong(song, totalSteps) {
    if (totalSteps === 0) return song;
    
    const transposed = JSON.parse(JSON.stringify(song));
    
    // Transponer letras usando pasos totales desde la original
    Object.keys(transposed.lyrics).forEach(section => {
        transposed.lyrics[section] = transposed.lyrics[section].map(line => 
            transposeChords(line, totalSteps)
        );
    });
    
    // Transponer progresiones si existen
    if (transposed.progression) {
        Object.keys(transposed.progression).forEach(section => {
            transposed.progression[section] = transposed.progression[section].map(chord => 
                transpose(chord, totalSteps)
            );
        });
    }
    
    return transposed;
}

// 🎸 TRANSPONER ACORDES EN LÍNEA DE TEXTO (🔧 CORREGIDO)
function transposeChords(line, totalSteps) {
    if (!line || totalSteps === 0) return line;
    
    // Patrón más completo para acordes
    const chordPattern = /\b([A-G][#b]?(?:m|maj|min|sus|add|dim|aug|M)?[0-9]*(?:\/[A-G][#b]?)?)\b/g;
    
    return line.replace(chordPattern, (match) => {
        // Si contiene bajo (acorde/bajo), transponer ambos
        if (match.includes('/')) {
            const [chord, bass] = match.split('/');
            const transposedChord = transpose(chord, totalSteps);
            const transposedBass = transpose(bass, totalSteps);
            return `${transposedChord}/${transposedBass}`;
        } else {
            return transpose(match, totalSteps);
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
    const fretWidth = 20;
    const startX = 40;
    const startY = 30;
    const stringSpacing = 30;
    
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Dibujar trastes
    for (let i = 1; i <= 4; i++) {
        const y = startY + i * fretWidth;
        svg += `<line x1="${startX}" y1="${y}" x2="${width - 10}" y2="${y}" 
                stroke="#ccc" stroke-width="2" stroke-linecap="round"/>`;
    }
    
    // Dibujar cuerdas
    for (let i = 0; i < 6; i++) {
        const x = startX + (i * stringSpacing);
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

// 🌙 ALTERNAR MODO OSCURO - FUNCIÓN COMPLETAMENTE CORREGIDA
function toggleDarkMode() {
    const body = document.body;
    const checkbox = document.getElementById('dark-mode');
    
    // Verificar el estado del checkbox
    if (checkbox.checked) {
        // Activar modo oscuro
        body.className = 'dark-mode'; // Limpiar todas las clases y aplicar solo dark-mode
        localStorage.setItem('darkMode', 'true');
        showSaveIndicator('🌙 Modo oscuro activado');
        console.log('🌙 Modo oscuro ON');
    } else {
        // Activar modo claro
        body.className = 'light-mode'; // Limpiar todas las clases y aplicar solo light-mode
        localStorage.setItem('darkMode', 'false');
        showSaveIndicator('☀️ Modo claro activado');
        console.log('☀️ Modo claro ON');
    }
}

// ⚙️ CARGAR CONFIGURACIONES - FUNCIÓN COMPLETAMENTE CORREGIDA
function loadSettings() {
    const savedDarkMode = localStorage.getItem('darkMode');
    const checkbox = document.getElementById('dark-mode');

    console.log('🔧 Cargando configuraciones. Modo oscuro guardado:', savedDarkMode);

    if (savedDarkMode === 'true') {
        checkbox.checked = true;
        document.body.className = 'dark-mode';
        console.log('✅ Modo oscuro cargado desde localStorage');
    } else {
        checkbox.checked = false;
        document.body.className = 'light-mode';
        console.log('✅ Modo claro cargado (default o desde localStorage)');
    }

    // Cargar canciones guardadas si existen y son válidas
    const savedSongs = localStorage.getItem('betania_songs');
    if (savedSongs) {
        try {
            const parsedSongs = JSON.parse(savedSongs);
            if (Array.isArray(parsedSongs) && parsedSongs.length > 0) {
                state.songs = parsedSongs;
                state.filtered = [...state.songs];
                console.log('🎵 Canciones cargadas desde localStorage');
            } else {
                // Si el array está vacío, usar las canciones por defecto
                state.songs = songs;
                state.filtered = [...state.songs];
                localStorage.removeItem('betania_songs');
                console.log('⚠️ Canciones en localStorage vacías, usando canciones por defecto');
            }
        } catch (e) {
            // Si hay error, usar las canciones por defecto
            state.songs = songs;
            state.filtered = [...state.songs];
            localStorage.removeItem('betania_songs');
            console.log('⚠️ Error cargando canciones guardadas, usando canciones por defecto');
        }
    } else {
        // Si no hay nada en localStorage, usar las canciones por defecto
        state.songs = songs;
        state.filtered = [...state.songs];
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
document.addEventListener('DOMContentLoaded', () => {
    init();
});

// 📱 DETECTAR INSTALACIÓN PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    console.log('💾 PWA puede ser instalada');
    showSaveIndicator('📱 Disponible para instalar como app');
});

console.log('🎵 Sistema Betania V4 cargado y corregido - ¡Transposición y modo oscuro arreglados!');
