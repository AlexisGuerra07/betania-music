// ===== UTILIDADES ADICIONALES PARA BETANIA MUSIC =====
// Archivo opcional: utils.js
// Incluir después de script.js: <script src="utils.js"></script>

// ===== IMPORTACIÓN Y EXPORTACIÓN DE DATOS =====

/**
 * Exportar todas las canciones a un archivo JSON
 */
function exportSongsToJSON() {
    const dataStr = JSON.stringify(state.songs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `betania-music-canciones-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(link.href);
}

/**
 * Importar canciones desde un archivo JSON
 */
function importSongsFromJSON(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importedSongs = JSON.parse(e.target.result);
            
            if (Array.isArray(importedSongs)) {
                // Confirmar importación
                if (confirm(`¿Importar ${importedSongs.length} canciones? Esto agregará a las existentes.`)) {
                    importedSongs.forEach(song => {
                        // Asegurar ID único
                        song.id = generateId();
                        state.songs.push(song);
                    });
                    
                    state.filteredSongs = [...state.songs];
                    saveToStorage();
                    renderSongsList();
                    
                    alert(`${importedSongs.length} canciones importadas exitosamente.`);
                }
            } else {
                alert('Formato de archivo inválido');
            }
        } catch (error) {
            alert('Error al leer el archivo: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

/**
 * Exportar canción específica a texto plano
 */
function exportSongToText(songId) {
    const song = state.songs.find(s => s.id === songId);
    if (!song) return;
    
    let textContent = `${song.title}\n`;
    textContent += `Autor: ${song.author}\n`;
    textContent += `Tonalidad: ${song.originalKey}\n`;
    textContent += `\n${'='.repeat(50)}\n\n`;
    
    song.sections.forEach(section => {
        textContent += `[${section.label}]\n`;
        
        section.pairs.forEach(pair => {
            if (pair.chords.trim()) {
                textContent += `${pair.chords}\n`;
            }
            if (pair.lyrics.trim()) {
                textContent += `${pair.lyrics}\n`;
            }
            textContent += '\n';
        });
        
        textContent += '\n';
    });
    
    const dataBlob = new Blob([textContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${song.title.replace(/[^a-zA-Z0-9]/g, '-')}.txt`;
    link.click();
    
    URL.revokeObjectURL(link.href);
}

// ===== FUNCIONES DE BÚSQUEDA AVANZADA =====

/**
 * Búsqueda por acordes específicos
 */
function searchByChords(chordQuery) {
    const searchChords = chordQuery.toLowerCase().split(/[\s,]+/).filter(Boolean);
    
    return state.songs.filter(song => {
        const songChords = [];
        
        song.sections.forEach(section => {
            section.pairs.forEach(pair => {
                if (pair.chords) {
                    const chords = pair.chords.match(/[A-G][#b]?[^\s]*/g) || [];
                    songChords.push(...chords.map(c => c.toLowerCase()));
                }
            });
        });
        
        return searchChords.every(chord => 
            songChords.some(songChord => songChord.includes(chord))
        );
    });
}

/**
 * Búsqueda por tonalidad
 */
function searchByKey(key) {
    return state.songs.filter(song => song.originalKey === key);
}

/**
 * Búsqueda avanzada combinada
 */
function advancedSearch(query) {
    const results = {
        byTitle: [],
        byAuthor: [],
        byChords: [],
        byLyrics: []
    };
    
    const searchTerm = query.toLowerCase().trim();
    
    state.songs.forEach(song => {
        // Por título
        if (song.title.toLowerCase().includes(searchTerm)) {
            results.byTitle.push(song);
        }
        
        // Por autor
        if (song.author.toLowerCase().includes(searchTerm)) {
            results.byAuthor.push(song);
        }
        
        // Por letra
        const hasLyricMatch = song.sections.some(section =>
            section.pairs.some(pair =>
                pair.lyrics && pair.lyrics.toLowerCase().includes(searchTerm)
            )
        );
        if (hasLyricMatch) {
            results.byLyrics.push(song);
        }
        
        // Por acordes
        const hasChordMatch = song.sections.some(section =>
            section.pairs.some(pair =>
                pair.chords && pair.chords.toLowerCase().includes(searchTerm)
            )
        );
        if (hasChordMatch) {
            results.byChords.push(song);
        }
    });
    
    return results;
}

// ===== UTILIDADES DE ACORDES ===== 

/**
 * Detectar tonalidad automáticamente basada en acordes
 */
function detectSongKey(song) {
    const allChords = [];
    
    song.sections.forEach(section => {
        section.pairs.forEach(pair => {
            if (pair.chords) {
                const chords = pair.chords.match(/[A-G][#b]?[^\s]*/g) || [];
                allChords.push(...chords);
            }
        });
    });
    
    // Contar frecuencia de acordes
    const chordFreq = {};
    allChords.forEach(chord => {
        const baseChord = chord.replace(/[^A-G#b]/g, '');
        chordFreq[baseChord] = (chordFreq[baseChord] || 0) + 1;
    });
    
    // El acorde más frecuente probablemente es la tonalidad
    let mostFrequent = '';
    let maxCount = 0;
    
    Object.entries(chordFreq).forEach(([chord, count]) => {
        if (count > maxCount) {
            maxCount = count;
            mostFrequent = chord;
        }
    });
    
    return mostFrequent || 'C';
}

/**
 * Sugerir acordes comunes para una tonalidad
 */
function getSuggestedChords(key) {
    const keyIndex = CONFIG.keys.indexOf(key);
    if (keyIndex === -1) return [];
    
    // Acordes diatónicos básicos
    const intervals = [0, 2, 4, 5, 7, 9, 11]; // I, ii, iii, IV, V, vi, vii
    const chordTypes = ['', 'm', 'm', '', '', 'm', 'dim'];
    
    return intervals.map((interval, index) => {
        const chordIndex = (keyIndex + interval) % 12;
        return CONFIG.keys[chordIndex] + chordTypes[index];
    }).filter(chord => chord !== 'dim'); // Quitar el diminuido por simplicidad
}

/**
 * Validar si un acorde es válido
 */
function isValidChord(chord) {
    const chordPattern = /^[A-G][#b]?(m|maj|min|dim|aug|sus2|sus4|add9|7|maj7|m7|dim7|aug7|sus7)?$/;
    return chordPattern.test(chord.trim());
}

// ===== UTILIDADES DE FORMATO =====

/**
 * Limpiar formato de acordes (espaciado consistente)
 */
function cleanChordFormatting(chordLine) {
    return chordLine
        .replace(/\s+/g, ' ')  // Múltiples espacios a uno
        .replace(/\s*\|\s*/g, ' | ')  // Espaciado consistente en barras
        .replace(/\s*\(\s*/g, '(')    // Limpiar paréntesis
        .replace(/\s*\)\s*/g, ') ')
        .trim();
}

/**
 * Convertir acordes de formato simple a formato alineado
 */
function convertToAlignedFormat(chordLine, lyricLine) {
    if (!chordLine || !lyricLine) return { chords: chordLine, lyrics: lyricLine };
    
    const chords = chordLine.split(/\s+/).filter(Boolean);
    const words = lyricLine.split(' ');
    
    let aligned = '';
    let wordIndex = 0;
    
    chords.forEach((chord, index) => {
        if (wordIndex < words.length) {
            const word = words[wordIndex];
            const padding = Math.max(0, word.length - chord.length);
            aligned += chord + ' '.repeat(padding + 1);
            wordIndex++;
        }
    });
    
    return {
        chords: aligned.trim(),
        lyrics: lyricLine
    };
}

// ===== UTILIDADES DE ANÁLISIS =====

/**
 * Obtener estadísticas de la colección de canciones
 */
function getSongsStatistics() {
    const stats = {
        totalSongs: state.songs.length,
        keyDistribution: {},
        authorDistribution: {},
        averageSections: 0,
        totalSections: 0,
        mostUsedChords: {}
    };
    
    state.songs.forEach(song => {
        // Distribución de tonalidades
        const key = song.originalKey;
        stats.keyDistribution[key] = (stats.keyDistribution[key] || 0) + 1;
        
        // Distribución de autores
        const author = song.author;
        stats.authorDistribution[author] = (stats.authorDistribution[author] || 0) + 1;
        
        // Secciones
        stats.totalSections += song.sections.length;
        
        // Acordes más usados
        song.sections.forEach(section => {
            section.pairs.forEach(pair => {
                if (pair.chords) {
                    const chords = pair.chords.match(/[A-G][#b]?[^\s]*/g) || [];
                    chords.forEach(chord => {
                        const baseChord = chord.replace(/[^A-G#b]/g, '');
                        stats.mostUsedChords[baseChord] = (stats.mostUsedChords[baseChord] || 0) + 1;
                    });
                }
            });
        });
    });
    
    stats.averageSections = stats.totalSections / stats.totalSongs || 0;
    
    return stats;
}

/**
 * Generar reporte de canciones
 */
function generateSongsReport() {
    const stats = getSongsStatistics();
    
    let report = '# Reporte de Canciones Betania Music\n\n';
    report += `**Total de canciones:** ${stats.totalSongs}\n`;
    report += `**Promedio de secciones por canción:** ${stats.averageSections.toFixed(1)}\n\n`;
    
    report += '## Distribución por Tonalidad\n';
    Object.entries(stats.keyDistribution)
        .sort(([,a], [,b]) => b - a)
        .forEach(([key, count]) => {
            report += `- ${key}: ${count} canciones\n`;
        });
    
    report += '\n## Distribución por Autor\n';
    Object.entries(stats.authorDistribution)
        .sort(([,a], [,b]) => b - a)
        .forEach(([author, count]) => {
            report += `- ${author}: ${count} canciones\n`;
        });
    
    report += '\n## Acordes Más Utilizados\n';
    Object.entries(stats.mostUsedChords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([chord, count]) => {
            report += `- ${chord}: ${count} veces\n`;
        });
    
    return report;
}

// ===== UTILIDADES DE CONFIGURACIÓN =====

/**
 * Aplicar tema visual
 */
function applyTheme(themeName) {
    const validThemes = ['blue', 'green', 'purple', 'dark'];
    
    // Remover temas existentes
    validThemes.forEach(theme => {
        document.body.classList.remove(`theme-${theme}`);
    });
    
    // Aplicar nuevo tema
    if (validThemes.includes(themeName)) {
        document.body.classList.add(`theme-${themeName}`);
        
        // Guardar preferencia
        try {
            localStorage.setItem('betania-theme', themeName);
        } catch (e) {
            console.log('No se pudo guardar la preferencia de tema');
        }
    }
}

/**
 * Aplicar tamaño de tipografía
 */
function applyTypographySize(size) {
    const validSizes = ['compact', 'normal', 'large'];
    
    // Remover tamaños existentes
    document.body.classList.remove('typography-compact', 'typography-large');
    
    // Aplicar nuevo tamaño
    if (size === 'compact') {
        document.body.classList.add('typography-compact');
    } else if (size === 'large') {
        document.body.classList.add('typography-large');
    }
    
    // Guardar preferencia
    try {
        localStorage.setItem('betania-typography', size);
    } catch (e) {
        console.log('No se pudo guardar la preferencia de tipografía');
    }
}

/**
 * Cargar preferencias guardadas
 */
function loadUserPreferences() {
    try {
        const savedTheme = localStorage.getItem('betania-theme');
        if (savedTheme) {
            applyTheme(savedTheme);
        }
        
        const savedTypography = localStorage.getItem('betania-typography');
        if (savedTypography) {
            applyTypographySize(savedTypography);
        }
    } catch (e) {
        console.log('No se pudieron cargar las preferencias');
    }
}

// ===== UTILIDADES DE NAVEGACIÓN MEJORADA =====

/**
 * Navegación con teclado mejorada
 */
function setupAdvancedKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Solo aplicar si no estamos en un input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (state.currentRoute === 'song-reader') {
                    transposeUp();
                }
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                if (state.currentRoute === 'song-reader') {
                    transposeDown();
                }
                break;
                
            case 'r':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    resetTransposition();
                }
                break;
                
            case 'e':
                if (state.currentRoute === 'song-reader' && state.currentSong) {
                    navigateToEditor(state.currentSong.id);
                }
                break;
                
            case 'Escape':
                if (state.currentRoute !== 'canciones') {
                    navigateToRoute('canciones');
                }
                break;
        }
    });
}

// ===== UTILIDADES DE IMPRESIÓN =====

/**
 * Configurar impresión optimizada
 */
function setupPrintOptimization() {
    window.addEventListener('beforeprint', () => {
        // Agregar clase de impresión
        document.body.classList.add('printing');
        
        // Expandir todo el contenido
        document.querySelectorAll('.section').forEach(section => {
            section.style.pageBreakInside = 'avoid';
        });
    });
    
    window.addEventListener('afterprint', () => {
        // Remover clase de impresión
        document.body.classList.remove('printing');
    });
}

/**
 * Imprimir canción específica
 */
function printSong(songId) {
    const song = state.songs.find(s => s.id === songId);
    if (!song) return;
    
    // Crear ventana de impresión
    const printWindow = window.open('', '_blank');
    
    let printContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${song.title} - ${song.author}</title>
        <style>
            body { 
                font-family: 'Source Code Pro', monospace; 
                line-height: 1.8; 
                margin: 20px; 
                color: #000;
            }
            .song-title { 
                font-size: 24px; 
                font-weight: bold; 
                margin-bottom: 10px;
                font-family: 'Inter', sans-serif;
            }
            .song-meta { 
                font-size: 14px; 
                margin-bottom: 30px; 
                color: #666;
            }
            .section { 
                margin-bottom: 30px; 
                page-break-inside: avoid;
            }
            .section-label { 
                background: #000; 
                color: white; 
                padding: 5px 10px; 
                border-radius: 3px; 
                font-size: 12px; 
                margin-bottom: 15px;
                display: inline-block;
            }
            .pair { 
                margin-bottom: 15px; 
            }
            .chord-line { 
                color: #000; 
                font-weight: bold; 
                margin-bottom: 3px;
                font-size: 14px;
            }
            .lyric-line { 
                color: #000;
                font-size: 16px;
            }
        </style>
    </head>
    <body>
        <div class="song-title">${song.title}</div>
        <div class="song-meta">${song.author} • Tonalidad: ${song.originalKey}</div>
    `;
    
    song.sections.forEach(section => {
        printContent += `<div class="section">`;
        printContent += `<div class="section-label">${section.label}</div>`;
        
        section.pairs.forEach(pair => {
            if (pair.chords.trim() || pair.lyrics.trim()) {
                printContent += `<div class="pair">`;
                if (pair.chords.trim()) {
                    printContent += `<div class="chord-line">${pair.chords}</div>`;
                }
                if (pair.lyrics.trim()) {
                    printContent += `<div class="lyric-line">${pair.lyrics}</div>`;
                }
                printContent += `</div>`;
            }
        });
        
        printContent += `</div>`;
    });
    
    printContent += `
    </body>
    </html>`;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// ===== UTILIDADES DE VALIDACIÓN =====

/**
 * Validar estructura de canción
 */
function validateSong(song) {
    const errors = [];
    
    if (!song.title || song.title.trim() === '') {
        errors.push('El título es requerido');
    }
    
    if (!song.author || song.author.trim() === '') {
        errors.push('El autor es requerido');
    }
    
    if (!song.originalKey || !CONFIG.keys.includes(song.originalKey)) {
        errors.push('Tonalidad inválida');
    }
    
    if (!song.sections || song.sections.length === 0) {
        errors.push('La canción debe tener al menos una sección');
    }
    
    song.sections?.forEach((section, sIndex) => {
        if (!section.label || section.label.trim() === '') {
            errors.push(`Sección ${sIndex + 1} necesita un nombre`);
        }
        
        if (!section.pairs || section.pairs.length === 0) {
            errors.push(`Sección "${section.label}" necesita al menos un par`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Limpiar canción (remover pares vacíos, etc.)
 */
function cleanSong(song) {
    const cleaned = JSON.parse(JSON.stringify(song));
    
    cleaned.sections = cleaned.sections.filter(section => {
        // Mantener secciones con al menos un par no vacío
        section.pairs = section.pairs.filter(pair => 
            (pair.chords && pair.chords.trim()) || 
            (pair.lyrics && pair.lyrics.trim())
        );
        
        return section.pairs.length > 0;
    });
    
    return cleaned;
}

// ===== UTILIDADES DE RENDIMIENTO =====

/**
 * Lazy loading para listas grandes de canciones
 */
function setupLazyLoading() {
    if ('IntersectionObserver' in window && state.songs.length > 50) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Cargar más canciones si es necesario
                    console.log('Elemento visible:', entry.target);
                }
            });
        });
        
        // Observar elementos de canción
        document.querySelectorAll('.song-item').forEach(item => {
            observer.observe(item);
        });
    }
}

/**
 * Debounce mejorado para búsquedas
 */
function createAdvancedDebounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// ===== UTILIDADES DE URL =====

/**
 * Compartir canción por URL
 */
function shareSongByURL(songId) {
    const song = state.songs.find(s => s.id === songId);
    if (!song) return;
    
    const url = `${window.location.origin}${window.location.pathname}?song=${songId}`;
    
    if (navigator.share) {
        navigator.share({
            title: song.title,
            text: `${song.title} - ${song.author}`,
            url: url
        });
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            alert('URL copiada al portapapeles');
        });
    } else {
        prompt('Copia esta URL para compartir:', url);
    }
}

/**
 * Cargar canción desde URL
 */
function loadSongFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const songId = urlParams.get('song');
    
    if (songId) {
        const song = state.songs.find(s => s.id === songId);
        if (song) {
            navigateToSongReader(songId);
            return true;
        }
    }
    
    return false;
}

// ===== FUNCIONES DE TRANSPOSICIÓN AVANZADA =====

function transposeUp() {
    if (state.currentRoute === 'song-reader') {
        const currentIndex = CONFIG.keys.indexOf(state.currentKey);
        state.currentKey = CONFIG.keys[(currentIndex + 1) % 12];
        renderSongReader();
    }
}

function transposeDown() {
    if (state.currentRoute === 'song-reader') {
        const currentIndex = CONFIG.keys.indexOf(state.currentKey);
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = 11;
        state.currentKey = CONFIG.keys[newIndex];
        renderSongReader();
    }
}

function resetTransposition() {
    if (state.currentRoute === 'song-reader') {
        state.currentKey = state.originalKey;
        renderSongReader();
    }
}

// ===== INTEGRACIÓN CON FUNCIONES PRINCIPALES =====

/**
 * Extender el objeto global BetaniaMusic con utilidades
 */
function extendBetaniaMusicAPI() {
    if (window.BetaniaMusic) {
        Object.assign(window.BetaniaMusic, {
            // Exportación/Importación
            exportSongsToJSON,
            importSongsFromJSON,
            exportSongToText,
            
            // Búsqueda avanzada
            searchByChords,
            searchByKey,
            advancedSearch,
            
            // Acordes
            detectSongKey,
            getSuggestedChords,
            isValidChord,
            cleanChordFormatting,
            convertToAlignedFormat,
            
            // Análisis
            getSongsStatistics,
            generateSongsReport,
            
            // Configuración
            applyTheme,
            applyTypographySize,
            
            // Utilidades
            validateSong,
            cleanSong,
            shareSongByURL,
            printSong,
            
            // Transposición
            transposeUp,
            transposeDown,
            resetTransposition
        });
    }
}

// ===== INICIALIZACIÓN DE UTILIDADES =====
function initializeUtils() {
    // Cargar preferencias del usuario
    loadUserPreferences();
    
    // Configurar navegación avanzada por teclado
    setupAdvancedKeyboardNavigation();
    
    // Configurar optimización de impresión
    setupPrintOptimization();
    
    // Verificar si hay una canción en la URL
    if (!loadSongFromURL()) {
        // Si no hay canción en URL, ir a vista de canciones
        navigateToRoute('canciones');
    }
    
    // Extender API global
    extendBetaniaMusicAPI();
    
    // Configurar lazy loading si hay muchas canciones
    setTimeout(setupLazyLoading, 1000);
    
    console.log('Utilidades adicionales inicializadas');
}

// ===== COMANDOS DE CONSOLA PARA DEBUGGING =====
window.BetaniaUtils = {
    // Comandos rápidos para la consola
    stats: () => console.table(getSongsStatistics()),
    export: () => exportSongsToJSON(),
    report: () => console.log(generateSongsReport()),
    themes: {
        blue: () => applyTheme('blue'),
        green: () => applyTheme('green'),
        purple: () => applyTheme('purple'),
        dark: () => applyTheme('dark'),
        normal: () => applyTheme('')
    },
    typography: {
        large: () => applyTypographySize('large'),
        compact: () => applyTypographySize('compact'),
        normal: () => applyTypographySize('normal')
    },
    
    // Helpers de desarrollo
    addTestSongs: () => {
        // Agregar canciones de prueba
        for (let i = 1; i <= 5; i++) {
            addSong({
                title: `Canción de Prueba ${i}`,
                author: 'Autor de Prueba',
                originalKey: CONFIG.keys[i % CONFIG.keys.length],
                sections: [
                    {
                        id: generateId(),
                        label: 'Verso 1',
                        pairs: [
                            { 
                                id: generateId(), 
                                chords: 'C Am F G', 
                                lyrics: `Esta es la línea ${i} de prueba` 
                            }
                        ]
                    }
                ]
            });
        }
        console.log('5 canciones de prueba agregadas');
    },
    
    clearAllSongs: () => {
        if (confirm('¿Eliminar TODAS las canciones?')) {
            state.songs = [];
            state.filteredSongs = [];
            saveToStorage();
            renderSongsList();
            console.log('Todas las canciones eliminadas');
        }
    }
};

// ===== AUTO-INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que el script principal se cargue
    setTimeout(() => {
        if (window.BetaniaMusic) {
            initializeUtils();
        } else {
            console.warn('Script principal no cargado, reintentando...');
            setTimeout(initializeUtils, 500);
        }
    }, 100);
});

// ===== AYUDA Y DOCUMENTACIÓN =====
function showHelp() {
    const helpContent = `
    <h3>Atajos de Teclado</h3>
    <ul style="text-align: left; margin: 1rem 0;">
        <li><strong>↑/↓</strong> - Transponer en vista de canción</li>
        <li><strong>Ctrl+R</strong> - Resetear transposición</li>
        <li><strong>E</strong> - Editar canción actual</li>
        <li><strong>Esc</strong> - Volver a lista de canciones</li>
    </ul>
    
    <h3>Comandos de Consola</h3>
    <ul style="text-align: left; margin: 1rem 0;">
        <li><code>BetaniaUtils.stats()</code> - Ver estadísticas</li>
        <li><code>BetaniaUtils.export()</code> - Exportar canciones</li>
        <li><code>BetaniaUtils.themes.blue()</code> - Cambiar tema</li>
        <li><code>BetaniaUtils.typography.large()</code> - Tipografía grande</li>
    </ul>
    `;
    
    showModal('Ayuda', helpContent, [
        { text: 'Cerrar', onclick: 'hideModal()' }
    ]);
}

// Agregar botón de ayuda al objeto global
if (window.BetaniaMusic) {
    window.BetaniaMusic.showHelp = showHelp;
}

/* 
===== INSTRUCCIONES DE USO =====

1. Incluir después del script principal:
   <script src="script.js"></script>
   <script src="utils.js"></script>

2. Comandos útiles en la consola del navegador:
   - BetaniaUtils.stats() - Ver estadísticas de canciones
   - BetaniaUtils.export() - Exportar todas las canciones
   - BetaniaUtils.themes.dark() - Cambiar a tema oscuro
   - BetaniaUtils.typography.large() - Tipografía más grande
   - BetaniaUtils.addTestSongs() - Agregar canciones de prueba

3. Atajos de teclado automáticos:
   - Flechas arriba/abajo para transponer
   - Escape para volver a la lista
   - E para editar canción actual
   - Ctrl+R para resetear transposición

4. Funciones disponibles:
   - Exportar/importar canciones en JSON
   - Imprimir canciones individuales
   - Búsqueda avanzada por acordes
   - Detección automática de tonalidad
   - Validación de estructuras
   - Estadísticas y reportes
*/
