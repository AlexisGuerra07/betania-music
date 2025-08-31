// ===== CANCIONES DE EJEMPLO EXPANDIDAS =====
// Reemplaza la función loadDefaultSongs() en script.js con estas canciones

function loadDefaultSongs() {
    state.songs = [
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
        }
    ];
    
    state.filteredSongs = [...state.songs];
}
