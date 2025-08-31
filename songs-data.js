// ===== DATOS DE CANCIONES AMPLIADOS =====
const extendedSongsData = [
    {
        id: 1,
        title: "Digno es el Cordero",
        artist: "Hillsong",
        key: "G",
        tempo: "Moderado",
        category: "Adoración",
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
[Em]Proclamen Su [C]nombre

[Puente]
[Am]Bendición y [F]honor
[C]Gloria y [G]poder
[Am]Sean al [F]Cordero
[C]Por siempre [G]amén`
    },
    {
        id: 2,
        title: "Cuán Grande es Él",
        artist: "Tradicional",
        key: "C",
        tempo: "Lento",
        category: "Himno",
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
Y el murmurar del [G]claro manan[C]tial

[Verso 3]
[C]Cuando recuerdo del [F]amor di[C]vino
Que desde el cielo [G]al Salvador en[C]vió
Aquel Jesús que [F]por salvarme [C]vino
Y en una cruz [G]mi culpa can[C]celó`
    },
    {
        id: 3,
        title: "Poderoso Dios",
        artist: "Miel San Marcos",
        key: "Am",
        tempo: "Moderado",
        category: "Alabanza",
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
[G]Serás mi Se[Am]ñor

[Puente]
[F]Aleluya, ale[C]luya
[G]Tú reinas por [Am]siempre
[F]Aleluya, ale[C]luya
[G]Tú reinas por [Am]siempre`
    },
    {
        id: 4,
        title: "Renuévame",
        artist: "Marcela Gándara",
        key: "D",
        tempo: "Lento",
        category: "Adoración",
        lyrics: `[Verso 1]
[D]Renuévame [A]Señor Jesús
[Bm]Ya no quiero [G]ser igual
[D]Renuévame [A]Señor Jesús
[Bm]Pon en mí Tu [G]corazón

[Coro]
[G]Porque todo lo que [D/F#]hay en [Em]mí
[A]Necesita ser cam[D]biado Señor
[G]Porque todo lo que [D/F#]hay en [Em]mí
[A]No te agrada como [D]soy

[Verso 2]
[D]Transfórmame [A]Señor Jesús
[Bm]Hazme más como [G]Tú
[D]Transfórmame [A]Señor Jesús
[Bm]Dame un nuevo [G]corazón`
    },
    {
        id: 5,
        title: "Alma Mía",
        artist: "Marco Barrientos",
        key: "Em",
        tempo: "Moderado",
        category: "Adoración",
        lyrics: `[Verso 1]
[Em]Alma mía, [C]bendice a [G]Jeho[D]vá
[Em]Todo mi [C]ser, Su [G]santo [D]nombre
[Em]Alma mía, [C]bendice a [G]Jeho[D]vá
[C]No olvides Sus [D]benefi[Em]cios

[Coro]
[G]Él perdona [D]todas tus [Em]maldades
[C]Él sana [G]toda enfer[D]medad
[G]Él rescata [D]del hoyo tu [Em]vida
[C]Te corona de [D]amor y compa[Em]sión

[Verso 2]
[Em]Alma mía, [C]bendice a [G]Jeho[D]vá
[Em]Como el [C]padre se com[G]pade[D]ce
[Em]Alma mía, [C]bendice a [G]Jeho[D]vá
[C]De los hijos [D]que le te[Em]men`
    },
    {
        id: 6,
        title: "Way Maker",
        artist: "Sinach",
        key: "C",
        tempo: "Moderado",
        category: "Alabanza",
        lyrics: `[Verso 1]
[C]You are here, moving in our midst
[F]I worship You, [Am]I worship You [G]
[C]You are here, working in this place
[F]I worship You, [Am]I worship You [G]

[Coro]
[C]Way maker, miracle worker
Promise keeper, [F]light in the darkness
[Am]My God, [G]that is who You are [C]
Way maker, miracle worker
Promise keeper, [F]light in the darkness
[Am]My God, [G]that is who You are [C]

[Verso 2]
[C]You are here, touching every heart
[F]I worship You, [Am]I worship You [G]
[C]You are here, healing every heart
[F]I worship You, [Am]I worship You [G]

[Puente]
[Am]Even when I don't see it, [F]You're working
[C]Even when I don't feel it, [G]You're working
[Am]You never stop, [F]You never stop working
[C]You never stop, [G]You never stop working`
    },
    {
        id: 7,
        title: "Oceanos",
        artist: "Hillsong United",
        key: "Bm",
        tempo: "Lento",
        category: "Adoración",
        lyrics: `[Verso 1]
[Bm]Tú me llamas [G]sobre las aguas
[D]Donde mis [A]pies pueden fa[Bm]llar
Y allí te en[G]cuentro en lo in[D]cierto
Caminaré [A]sobre el mar

[Coro]
[G]Y Tu nombre cla[D]maré
[A]En Ti mis [Bm]ojos fijaré
[G]En tempestad [D]descansaré
[A]En Tu poder

[G]Pues Tuyo [D]soy, [A]hasta el fi[Bm]nal
[G]Y si nau[D]frago en el [A]mar
[Bm]Nunca falla[G]rás

[Verso 2]
[Bm]Tu gracia a[G]bunda en la tor[D]menta
Tu mano [A]guía mi cami[Bm]nar
Cuando hay [G]miedo en mi si[D]lencio
Tú estás a[A]hí`
    },
    {
        id: 8,
        title: "En Ti Confiaré",
        artist: "Kike Pavón",
        key: "G",
        tempo: "Moderado",
        category: "Adoración",
        lyrics: `[Verso 1]
[G]Aun si ando en [Em]valle de som[C]bra
[G]No temeré [D]mal alguno
[G]Porque Tú e[Em]stás con[C]migo
[G]Tu vara y [D]Tu cayado me in[G]fundan

[Coro]
[C]En Ti con[G]fiaré
[D]En Ti con[Em]fiaré
[C]Cuando no pueda [G]ver
[D]En Ti con[G]fiaré

[Verso 2]
[G]Adereza[Em]rás mesa de[C]lante
[G]De mis an[D]gustias
[G]Unges mi ca[Em]beza con a[C]ceite
[G]Mi copa [D]está rebo[G]sando`
    }
];

// ===== FUNCIONES DE GESTIÓN DE DATOS =====
function getSongsData() {
    return extendedSongsData;
}

function getSongsByCategory(category) {
    return extendedSongsData.filter(song => 
        song.category.toLowerCase() === category.toLowerCase()
    );
}

function getSongsByKey(key) {
    return extendedSongsData.filter(song => 
        song.key.toLowerCase() === key.toLowerCase()
    );
}

function searchSongs(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
        return extendedSongsData;
    }
    
    return extendedSongsData.filter(song => 
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist.toLowerCase().includes(searchTerm) ||
        song.category.toLowerCase().includes(searchTerm) ||
        song.key.toLowerCase().includes(searchTerm) ||
        song.lyrics.toLowerCase().includes(searchTerm)
    );
}

function getRandomSong() {
    const randomIndex = Math.floor(Math.random() * extendedSongsData.length);
    return extendedSongsData[randomIndex];
}

// ===== FUNCIONES DE CONFIGURACIÓN =====
function initializeSongsData() {
    // Si existe songsData en el scope global, reemplazarlo
    if (typeof window !== 'undefined') {
        window.songsData = extendedSongsData;
        window.filteredSongs = [...extendedSongsData];
    }
}

// ===== EXPORTAR PARA USO GLOBAL =====
if (typeof window !== 'undefined') {
    window.SongsDataManager = {
        getSongsData,
        getSongsByCategory,
        getSongsByKey,
        searchSongs,
        getRandomSong,
        initializeSongsData
    };
    
    // Inicializar automáticamente
    initializeSongsData();
}

// ===== DATOS ADICIONALES DE CONFIGURACIÓN =====
const appConfig = {
    version: '2.0.0',
    lastUpdated: '2024-12-08',
    defaultKey: 'C',
    supportedKeys: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm'],
    categories: ['Alabanza', 'Adoración', 'Himno', 'Contemporáneo'],
    tempos: ['Lento', 'Moderado', 'Rápido']
};

if (typeof window !== 'undefined') {
    window.BetaniaMusicConfig = appConfig;
}
