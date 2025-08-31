// ===== PLANTILLAS PARA NUEVAS CANCIONES =====
// Usar como referencia para crear canciones con la estructura correcta

// ===== PLANTILLA BÁSICA =====
const templateBasica = {
    id: 'generar-id-unico',
    title: 'Título de la Canción',
    author: 'Nombre del Artista',
    originalKey: 'C',
    sections: [
        {
            id: 's1',
            label: 'Verso 1',
            pairs: [
                { 
                    id: 'p1', 
                    chords: 'C Am F G', 
                    lyrics: 'Primera línea de la letra' 
                },
                { 
                    id: 'p2', 
                    chords: 'C Am F G', 
                    lyrics: 'Segunda línea de la letra' 
                }
            ]
        },
        {
            id: 's2',
            label: 'Coro',
            pairs: [
                { 
                    id: 'p3', 
                    chords: 'F C G Am', 
                    lyrics: 'Línea del coro' 
                },
                { 
                    id: 'p4', 
                    chords: 'F C G C', 
                    lyrics: 'Segunda línea del coro' 
                }
            ]
        }
    ]
};

// ===== PLANTILLA PARA HIMNO TRADICIONAL =====
const templateHimno = {
    id: 'generar-id-unico',
    title: 'Nombre del Himno',
    author: 'Compositor Tradicional',
    originalKey: 'G',
    sections: [
        {
            id: 's1',
            label: 'Verso 1', 
            pairs: [
                { id: 'p1', chords: 'G        D       G', lyrics: 'Primera línea del himno' },
                { id: 'p2', chords: '        C       D', lyrics: 'Segunda línea del himno' },
                { id: 'p3', chords: 'G        D       Em', lyrics: 'Tercera línea del himno' },
                { id: 'p4', chords: 'C        D       G', lyrics: 'Cuarta línea del himno' }
            ]
        },
        {
            id: 's2',
            label: 'Verso 2',
            pairs: [
                { id: 'p5', chords: 'G        D       G', lyrics: 'Primera línea segundo verso' },
                { id: 'p6', chords: '        C       D', lyrics: 'Segunda línea segundo verso' },
                { id: 'p7', chords: 'G        D       Em', lyrics: 'Tercera línea segundo verso' },
                { id: 'p8', chords: 'C        D       G', lyrics: 'Cuarta línea segundo verso' }
            ]
        },
        {
            id: 's3',
            label: 'Verso 3',
            pairs: [
                { id: 'p9', chords: 'G        D       G', lyrics: 'Primera línea tercer verso' },
                { id: 'p10', chords: '        C       D', lyrics: 'Segunda línea tercer verso' },
                { id: 'p11', chords: 'G        D       Em', lyrics: 'Tercera línea tercer verso' },
                { id: 'p12', chords: 'C        D       G', lyrics: 'Cuarta línea tercer verso' }
            ]
        }
    ]
};

// ===== PLANTILLA PARA CANCIÓN MODERNA =====
const templateModerna = {
    id: 'generar-id-unico',
    title: 'Canción Moderna',
    author: 'Artista Contemporáneo',
    originalKey: 'Em',
    sections: [
        {
            id: 's1',
            label: 'Intro',
            pairs: [
                { id: 'p1', chords: 'Em C G D', lyrics: '' },
                { id: 'p2', chords: 'Em C G D', lyrics: '' }
            ]
        },
        {
            id: 's2',
            label: 'Verso 1',
            pairs: [
                { id: 'p3', chords: 'Em              C', lyrics: 'Línea del verso moderno' },
                { id: 'p4', chords: 'G               D', lyrics: 'Segunda línea del verso' },
                { id: 'p5', chords: 'Em              C', lyrics: 'Tercera línea del verso' },
                { id: 'p6', chords: 'G       D       Em', lyrics: 'Cuarta línea del verso' }
            ]
        },
        {
            id: 's3',
            label: 'Pre-Coro',
            pairs: [
                { id: 'p7', chords: 'C               G', lyrics: 'Línea de pre-coro' },
                { id: 'p8', chords: 'D               Em', lyrics: 'Segunda línea pre-coro' }
            ]
        },
        {
            id: 's4',
            label: 'Coro',
            pairs: [
                { id: 'p9', chords: 'C       G       D       Em', lyrics: 'Coro poderoso y memorable' },
                { id: 'p10', chords: 'C       G       D       Em', lyrics: 'Segunda línea del coro' },
                { id: 'p11', chords: 'C       G       D', lyrics: 'Línea final del coro' },
                { id: 'p12', chords: '        Em', lyrics: 'Resolución' }
            ]
        },
        {
            id: 's5',
            label: 'Puente',
            pairs: [
                { id: 'p13', chords: 'Am              F', lyrics: 'Puente con cambio emocional' },
                { id: 'p14', chords: 'C               G', lyrics: 'Segunda línea del puente' },
                { id: 'p15', chords: 'Am              F', lyrics: 'Repetición del puente' },
                { id: 'p16', chords: 'G', lyrics: 'Transición de vuelta' }
            ]
        },
        {
            id: 's6',
            label: 'Outro',
            pairs: [
                { id: 'p17', chords: 'Em C G D', lyrics: '' },
                { id: 'p18', chords: 'Em', lyrics: '' }
            ]
        }
    ]
};

// ===== PLANTILLA PARA CANCIÓN DE ADORACIÓN ÍNTIMA =====
const templateAdoracion = {
    id: 'generar-id-unico',
    title: 'Canción de Adoración',
    author: 'Artista de Adoración',
    originalKey: 'D',
    sections: [
        {
            id: 's1',
            label: 'Verso 1',
            pairs: [
                { id: 'p1', chords: 'D                A', lyrics: 'En tu presencia quiero estar' },
                { id: 'p2', chords: 'Bm               G', lyrics: 'Solo adorarte y contemplar' },
                { id: 'p3', chords: 'D                A', lyrics: 'Tu hermosura sin igual' },
                { id: 'p4', chords: 'Bm       G       D', lyrics: 'Eres digno de adorar' }
            ]
        },
        {
            id: 's2',
            label: 'Coro',
            pairs: [
                { id: 'p5', chords: 'G                D', lyrics: 'Te adoro con todo mi ser' },
                { id: 'p6', chords: 'A                Bm', lyrics: 'Te entrego mi corazón' },
                { id: 'p7', chords: 'G                D', lyrics: 'No hay nadie como Tú' },
                { id: 'p8', chords: 'A                D', lyrics: 'Eres mi adoración' }
            ]
        },
        {
            id: 's3',
            label: 'Verso 2',
            pairs: [
                { id: 'p9', chords: 'D                A', lyrics: 'En silencio vengo a ti' },
                { id: 'p10', chords: 'Bm               G', lyrics: 'Mi alma clama por ti' },
                { id: 'p11', chords: 'D                A', lyrics: 'Solo tú puedes llenar' },
                { id: 'p12', chords: 'Bm       G       D', lyrics: 'Este vacío en mi ser' }
            ]
        }
    ]
};

// ===== EJEMPLOS DE FORMATO PARA DIFERENTES ESTILOS =====

// Ejemplo: Canción con acordes muy espaciados (como "Es Él")
const ejemploEspaciado = {
    id: 'ejemplo-1',
    title: 'Canción con Espaciado',
    author: 'Ejemplo',
    originalKey: 'C',
    sections: [
        {
            id: 's1',
            label: 'Intro',
            pairs: [
                { id: 'p1', chords: '', lyrics: 'TÍTULO DE LA CANCIÓN' },
                { id: 'p2', chords: '', lyrics: '' },
                { id: 'p3', chords: 'F G    F G    Am G.  C', lyrics: '' },
                { id: 'p4', chords: '', lyrics: 'Sección siguiente:' },
                { id: 'p5', chords: '', lyrics: '' },
                { id: 'p6', chords: 'C                    Am', lyrics: 'Línea con espaciado específico' }
            ]
        }
    ]
};

// Ejemplo: Canción con acordes sobre la letra
const ejemploSobreLetter = {
    id: 'ejemplo-2', 
    title: 'Acordes Sobre Letra',
    author: 'Ejemplo',
    originalKey: 'G',
    sections: [
        {
            id: 's1',
            label: 'Verso 1',
            pairs: [
                { 
                    id: 'p1', 
                    chords: 'G        D       Em      C', 
                    lyrics: 'Señor mi Dios al contemplar los cielos' 
                },
                { 
                    id: 'p2', 
                    chords: 'G        D       G', 
                    lyrics: 'El firmamento y estrellas mil' 
                }
            ]
        }
    ]
};

// Ejemplo: Canción solo con letras (sin acordes)
const ejemploSoloLetras = {
    id: 'ejemplo-3',
    title: 'Solo Letras',
    author: 'Ejemplo',
    originalKey: 'C',
    sections: [
        {
            id: 's1',
            label: 'Verso 1',
            pairs: [
                { id: 'p1', chords: '', lyrics: 'Esta es una canción' },
                { id: 'p2', chords: '', lyrics: 'Solo con letras' },
                { id: 'p3', chords: '', lyrics: 'Sin acordes específicos' }
            ]
        }
    ]
};

// Ejemplo: Canción solo con acordes (instrumental)
const ejemploInstrumental = {
    id: 'ejemplo-4',
    title: 'Instrumental',
    author: 'Ejemplo',
    originalKey: 'Am',
    sections: [
        {
            id: 's1',
            label: 'Intro',
            pairs: [
                { id: 'p1', chords: 'Am F C G', lyrics: '' },
                { id: 'p2', chords: 'Am F C G', lyrics: '' }
            ]
        },
        {
            id: 's2', 
            label: 'Verso',
            pairs: [
                { id: 'p3', chords: 'Am      F       C       G', lyrics: '' },
                { id: 'p4', chords: 'Am      F       G       Am', lyrics: '' }
            ]
        }
    ]
};

// ===== GUÍA DE USO DE PLANTILLAS =====

/**
 * Cómo usar estas plantillas:
 * 
 * 1. Copia la plantilla que más se parezca a tu canción
 * 2. Modifica los campos: title, author, originalKey
 * 3. Actualiza las secciones según tu canción
 * 4. Agrega los acordes y letras específicos
 * 5. Asegúrate de que cada elemento tenga un ID único
 */

// ===== FUNCIÓN PARA GENERAR IDS ÚNICOS =====
function generarIdUnico() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===== FUNCIÓN PARA CREAR CANCIÓN DESDE PLANTILLA =====
function crearDesdeTemplate(template, datos = {}) {
    const nuevaCancion = JSON.parse(JSON.stringify(template));
    
    // Generar nuevos IDs únicos
    nuevaCancion.id = generarIdUnico();
    
    nuevaCancion.sections.forEach(section => {
        section.id = generarIdUnico();
        section.pairs.forEach(pair => {
            pair.id = generarIdUnico();
        });
    });
    
    // Aplicar datos personalizados
    if (datos.title) nuevaCancion.title = datos.title;
    if (datos.author) nuevaCancion.author = datos.author;
    if (datos.originalKey) nuevaCancion.originalKey = datos.originalKey;
    
    return nuevaCancion;
}

// ===== EJEMPLOS DE USO =====

// Crear nueva canción de adoración
const nuevaAdoracion = crearDesdeTemplate(templateAdoracion, {
    title: 'Mi Nueva Canción',
    author: 'Mi Iglesia',
    originalKey: 'E'
});

// Crear nuevo himno
const nuevoHimno = crearDesdeTemplate(templateHimno, {
    title: 'Himno Tradicional',
    author: 'Compositor Clásico',
    originalKey: 'F'
});

// ===== FORMATO PARA ACORDES COMPLICADOS =====

// Ejemplo: Acordes con modificadores avanzados
const ejemploAcordesAvanzados = {
    id: 'avanzado-1',
    title: 'Acordes Avanzados',
    author: 'Ejemplo Avanzado',
    originalKey: 'Cmaj7',
    sections: [
        {
            id: 's1',
            label: 'Verso Jazzístico',
            pairs: [
                { 
                    id: 'p1', 
                    chords: 'Cmaj7    Am7     Dm7     G7', 
                    lyrics: 'Acordes con séptimas y extensiones' 
                },
                { 
                    id: 'p2', 
                    chords: 'Em7      A7      Dm7     G7sus4 G7', 
                    lyrics: 'Más acordes complejos pero funcionales' 
                }
            ]
        }
    ]
};

// Ejemplo: Canción con cambios de tiempo/compás
const ejemploCambiosTiempo = {
    id: 'tiempo-1',
    title: 'Con Cambios de Ritmo',
    author: 'Ejemplo Rítmico',
    originalKey: 'D',
    sections: [
        {
            id: 's1',
            label: 'Intro (Lento)',
            pairs: [
                { id: 'p1', chords: 'D        A       Bm      G', lyrics: '' },
                { id: 'p2', chords: '', lyrics: '(cambio a ritmo moderado)' }
            ]
        },
        {
            id: 's2',
            label: 'Verso (Moderado)',
            pairs: [
                { id: 'p3', chords: 'D    A    Bm   G', lyrics: 'Ritmo más rápido ahora' },
                { id: 'p4', chords: 'D    A    G    D', lyrics: 'Mantiene la energía' }
            ]
        }
    ]
};

// ===== CONSEJOS PARA FORMATEAR ACORDES =====

/*
CONSEJOS DE FORMATO:

1. ESPACIADO DE ACORDES:
   ✅ Correcto: 'C    Am   F    G'
   ❌ Evitar: 'C Am F G' (sin espacios para alineación)

2. ACORDES LARGOS:
   ✅ Correcto: 'Cmaj7    Am7     Dm7     G7'
   ❌ Evitar: 'Cmaj7 Am7 Dm7 G7' (diferentes longitudes)

3. LETRAS VACÍAS:
   ✅ Usar: { chords: 'C Am F G', lyrics: '' }
   ❌ Evitar: No incluir el par

4. ESPACIOS EN BLANCO:
   ✅ Usar: { chords: '', lyrics: '' } para líneas vacías
   ✅ Usar: { chords: '', lyrics: 'ESTROFA (segunda vuelta)' } para indicaciones

5. SECCIONES COMUNES:
   - 'Intro' - Introducción instrumental
   - 'Verso 1', 'Verso 2' - Estrofas
   - 'Pre-Coro' - Antes del coro
   - 'Coro' - Estribillo principal
   - 'Puente' - Sección contrastante
   - 'Interludio' - Sección instrumental intermedia
   - 'Outro' - Final de la canción

6. ACORDES CON BAJO:
   ✅ Formato: 'C/E' o 'F(Bb)' según tu preferencia
   
7. INDICACIONES ESPECIALES:
   ✅ Usar letras: '(repetir 2x)', '(solo piano)', '(tutti)'
*/

// ===== FUNCIÓN PARA VALIDAR FORMATO =====
function validarFormatoCancion(cancion) {
    const errores = [];
    
    // Validar campos obligatorios
    if (!cancion.title || cancion.title.trim() === '') {
        errores.push('Título requerido');
    }
    
    if (!cancion.author || cancion.author.trim() === '') {
        errores.push('Autor requerido');
    }
    
    if (!cancion.originalKey) {
        errores.push('Tonalidad original requerida');
    }
    
    // Validar secciones
    if (!cancion.sections || cancion.sections.length === 0) {
        errores.push('Al menos una sección requerida');
    } else {
        cancion.sections.forEach((section, sIndex) => {
            if (!section.label || section.label.trim() === '') {
                errores.push(`Sección ${sIndex + 1} necesita nombre`);
            }
            
            if (!section.pairs || section.pairs.length === 0) {
                errores.push(`Sección "${section.label}" necesita pares`);
            }
        });
    }
    
    return {
        esValida: errores.length === 0,
        errores: errores
    };
}

// ===== EXPORTAR PLANTILLAS =====
if (typeof window !== 'undefined') {
    window.PlantillasCancion = {
        basica: templateBasica,
        himno: templateHimno,
        moderna: templateModerna,
        adoracion: templateAdoracion,
        ejemplos: {
            espaciado: ejemploEspaciado,
            sobreLetra: ejemploSobreLetter,
            soloLetras: ejemploSoloLetras,
            instrumental: ejemploInstrumental,
            acordesAvanzados: ejemploAcordesAvanzados,
            cambiosTiempo: ejemploCambiosTiempo
        },
        utilidades: {
            crearDesdeTemplate,
            validarFormatoCancion,
            generarIdUnico
        }
    };
}

// ===== INSTRUCCIONES DE USO =====
/*
CÓMO USAR ESTAS PLANTILLAS:

1. EN LA CONSOLA DEL NAVEGADOR:
   const nuevaCancion = PlantillasCancion.utilidades.crearDesdeTemplate(
       PlantillasCancion.adoracion, 
       { title: 'Mi Canción', author: 'Mi Iglesia' }
   );

2. PARA AGREGAR AL SITIO:
   window.BetaniaMusic.addSong(nuevaCancion);

3. PARA VALIDAR ANTES DE AGREGAR:
   const validacion = PlantillasCancion.utilidades.validarFormatoCancion(miCancion);
   if (validacion.esValida) {
       // Agregar canción
   } else {
       console.log('Errores:', validacion.errores);
   }

4. VER TODAS LAS PLANTILLAS:
   console.log(Object.keys(PlantillasCancion));

5. COPIAR PLANTILLA PARA MODIFICAR:
   const miPlantilla = JSON.parse(JSON.stringify(PlantillasCancion.basica));
   // Modificar miPlantilla según necesites
*/
