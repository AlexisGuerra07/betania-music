// ===== CANCIONES DE EJEMPLO AMPLIADAS =====
// Reemplaza la función loadDefaultSongs() en script.js con estas canciones
// O úsalas como referencia para el formato correcto

function loadExtendedSongs() {
    state.songs = [
        // Canción original de tu sitio
        {
            id: '1',
            title: 'Es Él',
            author: 'TTL',
            originalKey: 'C',
            sections: [
                {
                    id: 's1',
                    label: 'Intro',
                    pairs: [
                        { id: 'p1', chords: '', lyrics: 'ES ÉL' },
                        { id: 'p2', chords: '', lyrics: '' },
                        { id: 'p3', chords: 'F G    F G    Am G.  C', lyrics: '' },
                        { id: 'p4', chords: '', lyrics: 'ESTROFA (segunda vuelta)' },
                        { id: 'p5', chords: '', lyrics: '' },
                        { id: 'p6', chords: 'C', lyrics: 'Estoy preparando el camino' },
                        { id: 'p7', chords: '', lyrics: '' },
                        { id: 'p8', chords: 'Am       F(Bb)         C(Am)', lyrics: '' }
                    ]
                }
            ]
        },
        
        // Más canciones de ejemplo en el formato correcto
        {
            id: '2',
            title: 'Cuán Grande es Él',
            author: 'Tradicional',
            originalKey: 'G',
            sections: [
                {
                    id: 's1',
                    label: 'Verso 1',
                    pairs: [
                        { id: 'p1', chords: 'G                C           G', lyrics: 'Señor mi Dios, al contemplar los cielos' },
                        { id: 'p2', chords: '                D           G', lyrics: 'El firmamento y las estrellas mil' },
                        { id: 'p3', chords: '                C           G', lyrics: 'Al oír tu voz en los potentes truenos' },
                        { id: 'p4', chords: '                D         G', lyrics: 'Y ver brillar el sol en su cenit' }
                    ]
                },
                {
                    id: 's2',
                    label: 'Coro',
                    pairs: [
                        { id: 'p5', chords: 'G              C          G', lyrics: 'Mi corazón entona la canción' },
                        { id: 'p6', chords: '             D           G', lyrics: 'Cuán grande es Él, cuán grande es Él' },
                        { id: 'p7', chords: '              C          G', lyrics: 'Mi corazón entona la canción' },
                        { id: 'p8', chords: '             D           G', lyrics: 'Cuán grande es Él, cuán grande es Él' }
                    ]
                },
                {
                    id: 's3',
                    label: 'Verso 2',
                    pairs: [
                        { id: 'p9', chords: 'G               C          G', lyrics: 'Al recorrer los montes y los valles' },
                        { id: 'p10', chords: '               D         G', lyrics: 'Y ver las bellas flores al pasar' },
                        { id: 'p11', chords: '               C          G', lyrics: 'Al escuchar el canto de las aves' },
                        { id: 'p12', chords: '               D         G', lyrics: 'Y el murmurar del claro manantial' }
                    ]
                }
            ]
        },
        
        {
            id: '3',
            title: 'Renuévame',
            author: 'Marcela Gándara',
            originalKey: 'D',
            sections: [
                {
                    id: 's1',
                    label: 'Verso 1',
                    pairs: [
                        { id: 'p1', chords: 'D         A      Bm', lyrics: 'Renuévame Señor Jesús' },
                        { id: 'p2', chords: '        G', lyrics: 'Ya no quiero ser igual' },
                        { id: 'p3', chords: 'D         A      Bm', lyrics: 'Renuévame Señor Jesús' },
                        { id: 'p4', chords: '      G', lyrics: 'Pon en mí Tu corazón' }
                    ]
                },
                {
                    id: 's2',
                    label: 'Coro',
                    pairs: [
                        { id: 'p5', chords: 'G                D/F#   Em', lyrics: 'Porque todo lo que hay en mí' },
                        { id: 'p6', chords: 'A              D', lyrics: 'Necesita ser cambiado Señor' },
                        { id: 'p7', chords: 'G                D/F#   Em', lyrics: 'Porque todo lo que hay en mí' },
                        { id: 'p8', chords: 'A            D', lyrics: 'No te agrada como soy' }
                    ]
                },
                {
                    id: 's3',
                    label: 'Verso 2',
                    pairs: [
                        { id: 'p9', chords: 'D          A      Bm', lyrics: 'Transfórmame Señor Jesús' },
                        { id: 'p10', chords: '        G', lyrics: 'Hazme más como Tú' },
                        { id: 'p11', chords: 'D          A      Bm', lyrics: 'Transfórmame Señor Jesús' },
                        { id: 'p12', chords: '      G', lyrics: 'Dame un nuevo corazón' }
                    ]
                }
            ]
        },
        
        {
            id: '4',
            title: 'Poderoso Dios',
            author: 'Miel San Marcos',
            originalKey: 'Am',
            sections: [
                {
                    id: 's1',
                    label: 'Verso 1',
                    pairs: [
                        { id: 'p1', chords: 'Am       F     C', lyrics: 'Poderoso Dios, majestuoso' },
                        { id: 'p2', chords: 'G           Am', lyrics: 'Rey de reyes eres Tú' },
                        { id: 'p3', chords: 'Am       F     C', lyrics: 'Admirable Dios, victorioso' },
                        { id: 'p4', chords: 'G         Am', lyrics: 'Príncipe de paz' }
                    ]
                },
                {
                    id: 's2',
                    label: 'Pre-Coro',
                    pairs: [
                        { id: 'p5', chords: 'F        C', lyrics: 'No hay nadie como Tú' },
                        { id: 'p6', chords: 'G        Am', lyrics: 'No hay nadie como Tú' },
                        { id: 'p7', chords: 'F         C', lyrics: 'En toda la tierra' },
                        { id: 'p8', chords: 'G               Am', lyrics: 'No hay nadie como Tú' }
                    ]
                },
                {
                    id: 's3',
                    label: 'Coro',
                    pairs: [
                        { id: 'p9', chords: 'F        C', lyrics: 'Levanto mis manos' },
                        { id: 'p10', chords: 'G        Am', lyrics: 'Proclamo Tu nombre' },
                        { id: 'p11', chords: 'F          C', lyrics: 'Eres digno de gloria' },
                        { id: 'p12', chords: 'G          Am', lyrics: 'Eres digno de honor' }
                    ]
                }
            ]
        },
        
        {
            id: '5',
            title: 'Oceanos',
            author: 'Hillsong United',
            originalKey: 'Bm',
            sections: [
                {
                    id: 's1',
                    label: 'Verso 1',
                    pairs: [
                        { id: 'p1', chords: 'Bm              G', lyrics: 'Tú me llamas sobre las aguas' },
                        { id: 'p2', chords: 'D        A        Bm', lyrics: 'Donde mis pies pueden fallar' },
                        { id: 'p3', chords: '           G       D', lyrics: 'Y allí te encuentro en lo incierto' },
                        { id: 'p4', chords: '        A', lyrics: 'Caminaré sobre el mar' }
                    ]
                },
                {
                    id: 's2',
                    label: 'Coro',
                    pairs: [
                        { id: 'p5', chords: 'G          D', lyrics: 'Y Tu nombre clamaré' },
                        { id: 'p6', chords: 'A    Bm', lyrics: 'En Ti mis ojos fijaré' },
                        { id: 'p7', chords: 'G           D', lyrics: 'En tempestad descansaré' },
                        { id: 'p8', chords: 'A', lyrics: 'En Tu poder' },
                        { id: 'p9', chords: '', lyrics: '' },
                        { id: 'p10', chords: 'G     D  A      Bm', lyrics: 'Pues Tuyo soy, hasta el final' },
                        { id: 'p11', chords: 'G      D      A', lyrics: 'Y si naufrago en el mar' },
                        { id: 'p12', chords: 'Bm         G', lyrics: 'Nunca fallarás' }
                    ]
                }
            ]
        },
        
        {
            id: '6',
            title: 'En Ti Confiaré',
            author: 'Kike Pavón',
            originalKey: 'G',
            sections: [
                {
                    id: 's1',
                    label: 'Verso 1',
                    pairs: [
                        { id: 'p1', chords: 'G             Em        C', lyrics: 'Aun si ando en valle de sombra' },
                        { id: 'p2', chords: 'G       D', lyrics: 'No temeré mal alguno' },
                        { id: 'p3', chords: 'G        Em    C', lyrics: 'Porque Tú estás conmigo' },
                        { id: 'p4', chords: 'G       D        G', lyrics: 'Tu vara y Tu cayado me infundan' }
                    ]
                },
                {
                    id: 's2',
                    label: 'Coro',
                    pairs: [
                        { id: 'p5', chords: 'C      G', lyrics: 'En Ti confiaré' },
                        { id: 'p6', chords: 'D      Em', lyrics: 'En Ti confiaré' },
                        { id: 'p7', chords: 'C           G', lyrics: 'Cuando no pueda ver' },
                        { id: 'p8', chords: 'D      G', lyrics: 'En Ti confiaré' }
                    ]
                }
            ]
        },
        
        {
            id: '7',
            title: 'Way Maker',
            author: 'Sinach',
            originalKey: 'C',
            sections: [
                {
                    id: 's1',
                    label: 'Verso 1',
                    pairs: [
                        { id: 'p1', chords: 'C', lyrics: 'You are here, moving in our midst' },
                        { id: 'p2', chords: 'F           Am       G', lyrics: 'I worship You, I worship You' },
                        { id: 'p3', chords: 'C', lyrics: 'You are here, working in this place' },
                        { id: 'p4', chords: 'F           Am       G', lyrics: 'I worship You, I worship You' }
                    ]
                },
                {
                    id: 's2',
                    label: 'Coro',
                    pairs: [
                        { id: 'p5', chords: 'C', lyrics: 'Way maker, miracle worker' },
                        { id: 'p6', chords: '                    F', lyrics: 'Promise keeper, light in the darkness' },
                        { id: 'p7', chords: 'Am    G                C', lyrics: 'My God, that is who You are' },
                        { id: 'p8', chords: '', lyrics: 'Way maker, miracle worker' },
                        { id: 'p9', chords: '                    F', lyrics: 'Promise keeper, light in the darkness' },
                        { id: 'p10', chords: 'Am    G                C', lyrics: 'My God, that is who You are' }
                    ]
                },
                {
                    id: 's3',
                    label: 'Puente',
                    pairs: [
                        { id: 'p11', chords: 'Am                    F', lyrics: 'Even when I don\'t see it, You\'re working' },
                        { id: 'p12', chords: 'C                     G', lyrics: 'Even when I don\'t feel it, You\'re working' },
                        { id: 'p13', chords: 'Am          F', lyrics: 'You never stop, You never stop working' },
                        { id: 'p14', chords: 'C           G', lyrics: 'You never stop, You never stop working' }
                    ]
                }
            ]
        },
        
        {
            id: '8',
            title: 'Alma Mía',
            author: 'Marco Barrientos',
            originalKey: 'Em',
            sections: [
                {
                    id: 's1',
                    label: 'Verso 1',
                    pairs: [
                        { id: 'p1', chords: 'Em      C      G    D', lyrics: 'Alma mía, bendice a Jehová' },
                        { id: 'p2', chords: 'Em     C   G      D', lyrics: 'Todo mi ser, Su santo nombre' },
                        { id: 'p3', chords: 'Em      C      G    D', lyrics: 'Alma mía, bendice a Jehová' },
                        { id: 'p4', chords: 'C       D       Em', lyrics: 'No olvides Sus beneficios' }
                    ]
                },
                {
                    id: 's2',
                    label: 'Coro',
                    pairs: [
                        { id: 'p5', chords: 'G        D      Em', lyrics: 'Él perdona todas tus maldades' },
                        { id: 'p6', chords: 'C     G       D', lyrics: 'Él sana toda enfermedad' },
                        { id: 'p7', chords: 'G         D       Em', lyrics: 'Él rescata del hoyo tu vida' },
                        { id: 'p8', chords: 'C          D         Em', lyrics: 'Te corona de amor y compasión' }
                    ]
                }
            ]
        },
        
        {
            id: '9',
            title: 'Digno es el Cordero',
            author: 'Hillsong',
            originalKey: 'G',
            sections: [
                {
                    id: 's1',
                    label: 'Verso 1',
                    pairs: [
                        { id: 'p1', chords: 'G         C        D', lyrics: 'Digno es el Cordero que fue inmolado' },
                        { id: 'p2', chords: 'Em           C', lyrics: 'Santo, santo es Él' },
                        { id: 'p3', chords: 'G          C         D', lyrics: 'Levanten sus voces, toda creación' },
                        { id: 'p4', chords: 'Em       C', lyrics: 'Adoren al Rey' }
                    ]
                },
                {
                    id: 's2',
                    label: 'Coro',
                    pairs: [
                        { id: 'p5', chords: 'G          D', lyrics: 'Cantaremos, aleluya' },
                        { id: 'p6', chords: 'Em                C         G', lyrics: 'El Cordero que fue inmolado ha resucitado' },
                        { id: 'p7', chords: 'D        Em            C', lyrics: 'Majestuoso en gloria, poderoso en amor' },
                        { id: 'p8', chords: 'G               D    G', lyrics: 'Nuestro Dios ha triunfado gloriosamente' }
                    ]
                }
            ]
        },
        
        {
            id: '10',
            title: 'Adoraré',
            author: 'Christine D\'Clario',
            originalKey: 'F',
            sections: [
                {
                    id: 's1',
                    label: 'Verso 1',
                    pairs: [
                        { id: 'p1', chords: 'F               Bb', lyrics: 'Cuando tú estás aquí' },
                        { id: 'p2', chords: 'F               Bb', lyrics: 'El cielo toca la tierra' },
                        { id: 'p3', chords: 'F               Bb', lyrics: 'Vengo ante ti' },
                        { id: 'p4', chords: 'F               Bb', lyrics: 'Como un niño pequeño' }
                    ]
                },
                {
                    id: 's2',
                    label: 'Coro',
                    pairs: [
                        { id: 'p5', chords: 'Bb      F', lyrics: 'Adoraré' },
                        { id: 'p6', chords: '        C', lyrics: 'Solo a ti' },
                        { id: 'p7', chords: 'Bb      F', lyrics: 'Adoraré' },
                        { id: 'p8', chords: '      C', lyrics: 'Solo a ti' },
                        { id: 'p9', chords: 'Dm            Bb', lyrics: 'Con todo lo que soy' },
                        { id: 'p10', chords: 'F       C', lyrics: 'Adoraré' }
                    ]
                }
            ]
        },
        
        {
            id: '11',
            title: 'Grande y Fuerte',
            author: 'Miel San Marcos',
            originalKey: 'D',
            sections: [
                {
                    id: 's1',
                    label: 'Verso 1',
                    pairs: [
                        { id: 'p1', chords: 'D', lyrics: 'Grande y fuerte' },
                        { id: 'p2', chords: 'A', lyrics: 'Torre fuerte es nuestro Dios' },
                        { id: 'p3', chords: 'Bm', lyrics: 'Santo y digno' },
                        { id: 'p4', chords: 'G', lyrics: 'De adoración' }
                    ]
                },
                {
                    id: 's2',
                    label: 'Coro',
                    pairs: [
                        { id: 'p5', chords: 'D              A', lyrics: 'Que se levante un canto' },
                        { id: 'p6', chords: 'Bm          G', lyrics: 'De adoración' },
                        { id: 'p7', chords: 'D              A', lyrics: 'Que se levante un canto' },
                        { id: 'p8', chords: 'Bm          G    D', lyrics: 'De adoración a Ti' }
                    ]
                }
            ]
        },
        
        {
            id: '12',
            title: 'Tu Amor No Tiene Fin',
            author: 'Bethel Music',
            originalKey: 'A',
            sections: [
                {
                    id: 's1',
                    label: 'Verso 1',
                    pairs: [
                        { id: 'p1', chords: 'A             D', lyrics: 'Tu amor no tiene fin' },
                        { id: 'p2', chords: 'F#m         E', lyrics: 'Es nuevo cada día' },
                        { id: 'p3', chords: 'A             D', lyrics: 'Tu amor no tiene fin' },
                        { id: 'p4', chords: 'F#m      E      A', lyrics: 'Mi alma en ti confía' }
                    ]
                },
                {
                    id: 's2',
                    label: 'Coro',
                    pairs: [
                        { id: 'p5', chords: 'D                A', lyrics: 'Cada mañana veo tu fidelidad' },
                        { id: 'p6', chords: 'E                F#m', lyrics: 'Todas tus promesas sigues cumpliendo' },
                        { id: 'p7', chords: 'D               A', lyrics: 'Todo lo que necesito está en ti' },
                        { id: 'p8', chords: 'E               A', lyrics: 'Todo lo que necesito' }
                    ]
                }
            ]
        },
        
        {
            id: '13',
            title: 'Santo Santo Santo',
            author: 'Tradicional',
            originalKey: 'F',
            sections: [
                {
                    id: 's1',
                    label: 'Verso 1',
                    pairs: [
                        { id: 'p1', chords: 'F       Bb     F', lyrics: 'Santo, Santo, Santo' },
                        { id: 'p2', chords: 'C       F', lyrics: 'Señor omnipotente' },
                        { id: 'p3', chords: 'Dm      Bb     F', lyrics: 'Siempre el labio mío' },
                        { id: 'p4', chords: 'C       F', lyrics: 'Loores te dará' }
                    ]
                },
                {
                    id: 's2',
                    label: 'Verso 2',
                    pairs: [
                        { id: 'p5', chords: 'F       Bb     F', lyrics: 'Santo, Santo, Santo' },
                        { id: 'p6', chords: 'C       F', lyrics: 'Te adoran los santos' },
                        { id: 'p7', chords: 'Dm      Bb     F', lyrics: 'Postrados delante' },
                        { id: 'p8', chords: 'C       F', lyrics: 'Rinden su honor' }
                    ]
                }
            ]
        },
        
        {
            id: '14',
            title: 'Sublime Gracia',
            author: 'John Newton',
            originalKey: 'G',
            sections: [
                {
                    id: 's1',
                    label: 'Verso 1',
                    pairs: [
                        { id: 'p1', chords: 'G        G7       C       G', lyrics: 'Sublime gracia del Señor' },
                        { id: 'p2', chords: '                    D', lyrics: 'Que a un infeliz salvó' },
                        { id: 'p3', chords: 'G        G7       C       G', lyrics: 'Perdido anduve y me halló' },
                        { id: 'p4', chords: 'Em       D        G', lyrics: 'Ciego fui, mas hoy veo yo' }
                    ]
                },
                {
                    id: 's2',
                    label: 'Verso 2',
                    pairs: [
                        { id: 'p5', chords: 'G        G7       C       G', lyrics: 'Su gracia me enseñó a temer' },
                        { id: 'p6', chords: '                    D', lyrics: 'Mis dudas ahuyentó' },
                        { id: 'p7', chords: 'G        G7       C       G', lyrics: 'Cuán precioso fue a mi ser' },
                        { id: 'p8', chords: 'Em       D        G', lyrics: 'Cuando en Él yo creí' }
                    ]
                }
            ]
        },
        
        {
            id: '15',
            title: 'Jesús Te Entronizo',
            author: 'Marco Barrientos',
            originalKey: 'E',
            sections: [
                {
                    id: 's1',
                    label: 'Coro',
                    pairs: [
                        { id: 'p1', chords: 'E              A      E', lyrics: 'Jesús te entronizo' },
                        { id: 'p2', chords: 'B              E', lyrics: 'En mi corazón' },
                        { id: 'p3', chords: 'E              A      E', lyrics: 'Jesús te entronizo' },
                        { id: 'p4', chords: 'B              E', lyrics: 'En mi corazón' },
                        { id: 'p5', chords: 'A              E', lyrics: 'Tuyo es el reino' },
                        { id: 'p6', chords: 'B              C#m', lyrics: 'Tuya es la gloria' },
                        { id: 'p7', chords: 'A              E', lyrics: 'Tuyo es el poder' },
                        { id: 'p8', chords: 'B              E', lyrics: 'Y el honor' }
                    ]
                }
            ]
        }
    ];
    
    state.filteredSongs = [...state.songs];
}

// ===== PLANTILLAS DE CANCIONES COMUNES =====

/**
 * Plantilla para canción de adoración estándar
 */
function createWorshipSongTemplate() {
    return {
        id: generateId(),
        title: '',
        author: '',
        originalKey: 'C',
        sections: [
            {
                id: generateId(),
                label: 'Verso 1',
                pairs: [
                    { id: generateId(), chords: '', lyrics: '' }
                ]
            },
            {
                id: generateId(),
                label: 'Coro',
                pairs: [
                    { id: generateId(), chords: '', lyrics: '' }
                ]
            },
            {
                id: generateId(),
                label: 'Verso 2',
                pairs: [
                    { id: generateId(), chords: '', lyrics: '' }
                ]
            },
            {
                id: generateId(),
                label: 'Puente',
                pairs: [
                    { id: generateId(), chords: '', lyrics: '' }
                ]
            }
        ]
    };
}

/**
 * Plantilla para himno tradicional
 */
function createHymnTemplate() {
    return {
        id: generateId(),
        title: '',
        author: '',
        originalKey: 'G',
        sections: [
            {
                id: generateId(),
                label: 'Verso 1',
                pairs: [
                    { id: generateId(), chords: '', lyrics: '' }
                ]
            },
            {
                id: generateId(),
                label: 'Verso 2',
                pairs: [
                    { id: generateId(), chords: '', lyrics: '' }
                ]
            },
            {
                id: generateId(),
                label: 'Verso 3',
                pairs: [
                    { id: generateId(), chords: '', lyrics: '' }
                ]
            },
            {
                id: generateId(),
                label: 'Verso 4',
                pairs: [
                    { id: generateId(), chords: '', lyrics: '' }
                ]
            }
        ]
    };
}

// ===== CONVERSIÓN DE FORMATOS =====

/**
 * Convertir desde formato ChordPro
 */
function convertFromChordPro(chordProText) {
    const lines = chordProText.split('\n');
    const song = createEmptySong();
    let currentSection = null;
    
    lines.forEach(line => {
        line = line.trim();
        
        // Detectar directivas de ChordPro
        if (line.startsWith('{title:') || line.startsWith('{t:')) {
            song.title = line.match(/\{[^:]+:\s*([^}]+)\}/)[1];
        } else if (line.startsWith('{artist:') || line.startsWith('{st:')) {
            song.author = line.match(/\{[^:]+:\s*([^}]+)\}/)[1];
        } else if (line.startsWith('{key:')) {
            song.originalKey = line.match(/\{[^:]+:\s*([^}]+)\}/)[1];
        } else if (line.startsWith('{start_of_') || line.startsWith('{soc}')) {
            // Iniciar nueva sección
            const sectionName = line.includes('verse') ? 'Verso' : 
                              line.includes('chorus') ? 'Coro' : 'Sección';
            currentSection = {
                id: generateId(),
                label: sectionName,
                pairs: []
            };
            song.sections.push(currentSection);
        } else if (line.includes('[') && line.includes(']') && currentSection) {
            // Línea con acordes
            const chords = line.replace(/\[([^\]]+)\]/g, '$1 ').trim();
            const lyrics = line.replace(/\[[^\]]+\]/g, '').trim();
            
            currentSection.pairs.push({
                id: generateId(),
                chords: chords,
                lyrics: lyrics
            });
        } else if (line && currentSection) {
            // Línea de letra simple
            currentSection.pairs.push({
                id: generateId(),
                chords: '',
                lyrics: line
            });
        }
    });
    
    return song;
}

/**
 * Convertir a formato ChordPro
 */
function convertToChordPro(song) {
    let chordPro = '';
    
    chordPro += `{title: ${song.title}}\n`;
    chordPro += `{artist: ${song.author}}\n`;
    chordPro += `{key: ${song.originalKey}}\n\n`;
    
    song.sections.forEach(section => {
        chordPro += `{start_of_${section.label.toLowerCase().replace(/\s+/g, '_')}}\n`;
        
        section.pairs.forEach(pair => {
            if (pair.chords && pair.lyrics) {
                // Combinar acordes y letras en formato ChordPro
                const chords = pair.chords.split(/\s+/).filter(Boolean);
                const words = pair.lyrics.split(' ');
                
                let line = '';
                chords.forEach((chord, index) => {
                    if (index < words.length) {
                        line += `[${chord}]${words[index]} `;
                    } else {
                        line += `[${chord}] `;
                    }
                });
                
                // Agregar palabras restantes
                for (let i = chords.length; i < words.length; i++) {
                    line += words[i] + ' ';
                }
                
                chordPro += line.trim() + '\n';
            } else if (pair.lyrics) {
                chordPro += pair.lyrics + '\n';
            } else if (pair.chords) {
                chordPro += pair.chords + '\n';
            }
        });
        
        chordPro += `{end_of_${section.label.toLowerCase().replace(/\s+/g, '_')}}\n\n`;
    });
    
    return chordPro;
}

// ===== UTILIDADES DE BACKUP AUTOMÁTICO =====

/**
 * Configurar backup automático
 */
function setupAutoBackup() {
    // Backup cada 5 minutos si hay cambios
    setInterval(() => {
        if (state.songs.length > 0) {
            try {
                const currentData = JSON.stringify(state.songs);
                const lastBackup = localStorage.getItem('betania-last-backup');
                
                if (currentData !== lastBackup) {
                    localStorage.setItem('betania-last-backup', currentData);
                    localStorage.setItem('betania-backup-timestamp', Date.now().toString());
                    console.log('Backup automático realizado');
                }
            } catch (e) {
                console.warn('Error en backup automático:', e);
            }
        }
    }, 5 * 60 * 1000); // 5 minutos
}

/**
 * Restaurar desde backup
 */
function restoreFromBackup() {
    try {
        const backup = localStorage.getItem('betania-last-backup');
        const timestamp = localStorage.getItem('betania-backup-timestamp');
        
        if (backup && timestamp) {
            const backupDate = new Date(parseInt(timestamp));
            if (confirm(`¿Restaurar backup del ${backupDate.toLocaleString()}?`)) {
                state.songs = JSON.parse(backup);
                state.filteredSongs = [...state.songs];
                renderSongsList();
                alert('Backup restaurado exitosamente');
            }
        } else {
            alert('No hay backup disponible');
        }
    } catch (e) {
        alert('Error al restaurar backup: ' + e.message);
    }
}

// ===== INTEGRACIÓN Y EXTENSIÓN =====

/**
 * Crear interfaz de importación
 */
function createImportInterface() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt';
    input.style.display = 'none';
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.name.endsWith('.json')) {
                importSongsFromJSON(file);
            } else {
                // Importar como texto plano
                const reader = new FileReader();
                reader.onload = (e) => {
                    const text = e.target.result;
                    // Aquí podrías implementar parseo de otros formatos
                    console.log('Archivo de texto:', text);
                };
                reader.readAsText(file);
            }
        }
    });
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

// ===== COMANDOS EXTENDIDOS PARA CONSOLA =====

/**
 * Agregar comandos adicionales al objeto de utilidades
 */
function extendUtilsCommands() {
    Object.assign(window.BetaniaUtils, {
        // Análisis
        analyze: {
            songs: () => console.table(getSongsStatistics()),
            chords: (songId) => {
                const song = state.songs.find(s => s.id === songId);
                if (song) {
                    console.log('Tonalidad detectada:', detectSongKey(song));
                    console.log('Acordes sugeridos:', getSuggestedChords(song.originalKey));
                }
            },
            report: () => {
                const report = generateSongsReport();
                console.log(report);
                
                // También crear un archivo
                const blob = new Blob([report], { type: 'text/markdown' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'betania-music-report.md';
                link.click();
                URL.revokeObjectURL(link.href);
            }
        },
        
        // Herramientas
        tools: {
            import: () => createImportInterface(),
            backup: () => exportSongsToJSON(),
            restore: () => restoreFromBackup(),
            validate: () => {
                state.songs.forEach(song => {
                    const validation = validateSong(song);
                    if (!validation.isValid) {
                        console.warn(`Canción "${song.title}":`, validation.errors);
                    }
                });
                console.log('Validación completada');
            },
            clean: () => {
                state.songs = state.songs.map(cleanSong);
                saveToStorage();
                renderSongsList();
                console.log('Canciones limpiadas');
            }
        },
        
        // Desarrollo
        dev: {
            state: () => console.log(state),
            config: () => console.log(CONFIG),
            elements: () => console.log(elements),
            performance: () => {
                console.log('Canciones cargadas:', state.songs.length);
                console.log('Memoria aprox:', JSON.stringify(state.songs).length + ' chars');
                console.log('Última búsqueda:', state.searchTerm);
            }
        }
    });
}

// ===== INICIALIZACIÓN EXTENDIDA =====
function initializeExtendedUtils() {
    // Configurar backup automático
    setupAutoBackup();
    
    // Extender comandos de utilidades
    extendUtilsCommands();
    
    console.log('Utilidades extendidas inicializadas');
    console.log('Comandos disponibles:');
    console.log('- BetaniaUtils.analyze.songs()');
    console.log('- BetaniaUtils.tools.import()');
    console.log('- BetaniaUtils.tools.backup()');
    console.log('- BetaniaUtils.dev.performance()');
}

// Auto-inicialización extendida
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeExtendedUtils, 200);
    });
} else {
    setTimeout(initializeExtendedUtils, 200);
}
