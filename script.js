// Funcionalidad completa de Betania Music
document.addEventListener('DOMContentLoaded', function() {
    
    // Datos de canciones (simulado - en producción vendría de una base de datos)
    const songsData = {
        'Sublime Gracia': {
            key: 'C',
            author: 'Himno tradicional • John Newton',
            verses: [
                {
                    label: 'Verso 1',
                    chords: ['C        Am       F        G', '    Am           F'],
                    lyrics: ['Sublime gracia del Señor que a un infeliz salvó', 'Perdido me encontró, ciego me hizo ver']
                },
                {
                    label: 'Verso 2', 
                    chords: ['C        Am       F        G', '    Am           F'],
                    lyrics: ['Su gracia me enseñó a temer, mis dudas ahuyentó', '¡Oh cuán precioso fue a mi corazón cuando él me habló!']
                },
                {
                    label: 'Coro',
                    chords: ['F        C       G        Am', 'F        C       G        C'],
                    lyrics: ['Gracia admirable es, que salvó a un pecador', 'Perdido me encontró, mas ya no soy quien era yo']
                }
            ]
        },
        'Cuán Grande es Él': {
            key: 'G',
            author: 'Stuart K. Hine',
            verses: [
                {
                    label: 'Verso 1',
                    chords: ['G        C       G        D', '    Em           C'],
                    lyrics: ['Señor mi Dios, al contemplar los cielos', 'El firmamento y las estrellas mil']
                }
            ]
        }
    };

    // Sistema de transposición
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const chordMap = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 
        'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    
    let currentKeyIndex = 0;
    let currentSong = 'Sublime Gracia';

    // Función para transponer acordes
    function transposeChord(chord, semitones) {
        // Extraer modificadores (m, 7, sus, etc.)
        const chordPattern = /^([A-G][#b]?)(.*)$/;
        const match = chord.match(chordPattern);
        
        if (!match) return chord;
        
        const rootNote = match[1];
        const modifier = match[2];
        
        if (chordMap[rootNote] === undefined) return chord;
        
        const originalIndex = chordMap[rootNote];
        const newIndex = (originalIndex + semitones + 12) % 12;
        const newRoot = keys[newIndex];
        
        return newRoot + modifier;
    }

    // Función para transponer una línea de acordes
    function transposeChordLine(chordLine, semitones) {
        return chordLine.replace(/\b[A-G][#b]?(?:m|maj|sus|add|dim|aug|\d)*\b/g, function(chord) {
            return transposeChord(chord.trim(), semitones);
        });
    }

    // Función para renderizar canción
    function renderSong(songName, transposition = 0) {
        const song = songsData[songName];
        if (!song) return;

        const songInfo = document.querySelector('.song-info h1');
        const songMeta = document.querySelector('.song-meta');
        const songContent = document.querySelector('.song-content');
        const currentKey = document.querySelector('.current-key');

        songInfo.textContent = songName;
        songMeta.textContent = song.author;
        
        // Calcular tonalidad actual
        const originalKeyIndex = keys.indexOf(song.key);
        const newKeyIndex = (originalKeyIndex + transposition + 12) % 12;
        currentKey.textContent = keys[newKeyIndex];

        // Renderizar contenido
        songContent.innerHTML = song.verses.map(verse => `
            <div class="verse">
                <div class="verse-label">${verse.label}</div>
                ${verse.chords.map((chordLine, index) => `
                    <div class="chord-line">${transposeChordLine(chordLine, transposition).replace(/\b[A-G][#b]?(?:m|maj|sus|add|dim|aug|\d)*\b/g, '<span class="chord">$&</span>')}</div>
                    ${verse.lyrics[index] ? `<div class="lyric-line">${verse.lyrics[index]}</div>` : ''}
                `).join('')}
            </div>
        `).join('');

        // Reactivar eventos de acordes
        attachChordEvents();
    }

    // Función para eventos de acordes
    function attachChordEvents() {
        document.querySelectorAll('.chord').forEach(chord => {
            chord.addEventListener('click', function() {
                showChordDiagram(this.textContent.trim());
            });
        });
    }

    // Función para mostrar diagrama de acordes
    function showChordDiagram(chord) {
        // Crear modal simple
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            max-width: 300px;
        `;
        
        content.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: #2d3748;">Diagrama: ${chord}</h3>
            <p style="color: #718096; margin-bottom: 1rem;">Diagrama de guitarra para el acorde ${chord}</p>
            <button style="padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Cerrar</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Cerrar modal
        modal.addEventListener('click', function(e) {
            if (e.target === modal || e.target.tagName === 'BUTTON') {
                document.body.removeChild(modal);
            }
        });
    }

    // Cambio de canción al hacer clic en la lista
    document.querySelectorAll('.song-item').forEach(item => {
        item.addEventListener('click', function() {
            // Remover clase active de todos los elementos
            document.querySelectorAll('.song-item').forEach(i => i.classList.remove('active'));
            
            // Agregar clase active al elemento clickeado
            this.classList.add('active');
            
            // Obtener datos de la canción
            const songTitle = this.querySelector('.song-title').textContent;
            const originalKey = this.getAttribute('data-key');
            
            currentSong = songTitle;
            currentKeyIndex = keys.indexOf(originalKey);
            
            // Renderizar canción
            if (songsData[songTitle]) {
                renderSong(songTitle, 0);
            } else {
                // Si no tenemos datos, mostrar título básico
                document.querySelector('.song-info h1').textContent = songTitle;
                document.querySelector('.song-meta').textContent = 'Canción tradicional';
                document.querySelector('.current-key').textContent = originalKey;
                document.querySelector('.song-content').innerHTML = `
                    <div class="verse">
                        <div class="verse-label">Contenido no disponible</div>
                        <div class="lyric-line">Esta canción aún no tiene contenido cargado.</div>
                        <div class="lyric-line">Usa el botón "Editar" para agregar acordes y letras.</div>
                    </div>
                `;
            }
        });
    });

    // Sistema de transposición
    document.getElementById('transpose-down').addEventListener('click', function() {
        currentKeyIndex = (currentKeyIndex - 1 + keys.length) % keys.length;
        const transposition = currentKeyIndex - keys.indexOf(songsData[currentSong]?.key || 'C');
        renderSong(currentSong, transposition);
    });
    
    document.getElementById('transpose-up').addEventListener('click', function() {
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        const transposition = currentKeyIndex - keys.indexOf(songsData[currentSong]?.key || 'C');
        renderSong(currentSong, transposition);
    });

    // Funcionalidad de búsqueda de canciones
    const searchBox = document.querySelector('.search-box');
    const songItems = document.querySelectorAll('.song-item');

    searchBox.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        songItems.forEach(item => {
            const songTitle = item.querySelector('.song-title').textContent.toLowerCase();
            
            if (songTitle.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Funcionalidad de los botones del toolbar
    let editMode = false;
    
    document.getElementById('edit-mode').addEventListener('click', function() {
        editMode = !editMode;
        
        if (editMode) {
            this.textContent = 'Guardar';
            this.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
            enableEditMode();
        } else {
            this.textContent = 'Editar';
            this.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            disableEditMode();
        }
    });

    function enableEditMode() {
        const songContent = document.querySelector('.song-content');
        songContent.style.background = 'rgba(255, 243, 224, 0.5)';
        songContent.style.border = '2px dashed #ed8936';
        
        // Hacer contenido editable
        document.querySelectorAll('.chord-line, .lyric-line').forEach(line => {
            line.contentEditable = true;
            line.style.background = 'rgba(255, 255, 255, 0.8)';
            line.style.padding = '0.25rem';
            line.style.margin = '0.25rem 0';
            line.style.borderRadius = '4px';
        });
        
        console.log('Modo edición activado');
    }

    function disableEditMode() {
        const songContent = document.querySelector('.song-content');
        songContent.style.background = 'rgba(248, 250, 252, 0.5)';
        songContent.style.border = 'none';
        
        // Desactivar edición
        document.querySelectorAll('.chord-line, .lyric-line').forEach(line => {
            line.contentEditable = false;
            line.style.background = 'transparent';
            line.style.padding = '';
            line.style.margin = '';
        });
        
        console.log('Cambios guardados');
    }

    // Mostrar diagramas
    document.getElementById('show-diagrams').addEventListener('click', function() {
        const chords = document.querySelectorAll('.chord');
        if (chords.length > 0) {
            const chordList = Array.from(chords).map(c => c.textContent.trim());
            const uniqueChords = [...new Set(chordList)];
            alert('Acordes en esta canción: ' + uniqueChords.join(', ') + '\n\nHaz clic en cualquier acorde para ver su diagrama.');
        } else {
            alert('No hay acordes disponibles en esta canción');
        }
    });

    // Funcionalidad para agregar al setlist
    document.getElementById('add-to-setlist').addEventListener('click', function() {
        const currentSongTitle = document.querySelector('.song-info h1').textContent;
        const currentKeyText = document.querySelector('.current-key').textContent;
        
        // Simular agregado al setlist (en producción se guardaría en localStorage o base de datos)
        const setlistItem = {
            song: currentSongTitle,
            key: currentKeyText,
            timestamp: new Date().toISOString()
        };
        
        // Obtener setlist del localStorage
        let setlist = JSON.parse(localStorage.getItem('betania-setlist') || '[]');
        
        // Verificar si ya está en el setlist
        const exists = setlist.find(item => item.song === currentSongTitle);
        
        if (exists) {
            alert(`"${currentSongTitle}" ya está en el setlist`);
        } else {
            setlist.push(setlistItem);
            localStorage.setItem('betania-setlist', JSON.stringify(setlist));
            
            // Feedback visual
            this.textContent = '✓ Agregada';
            this.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
            
            setTimeout(() => {
                this.textContent = '+ Setlist';
                this.style.background = '';
            }, 2000);
            
            console.log('Agregado al setlist:', setlistItem);
        }
    });

    // Navegación del menú principal
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los enlaces
            document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al enlace clickeado
            this.classList.add('active');
            
            const section = this.textContent;
            console.log('Navegando a:', section);
            
            // Simular cambio de sección
            if (section === 'Setlist') {
                showSetlist();
            } else if (section !== 'Canciones') {
                alert(`Sección "${section}" en desarrollo`);
            }
        });
    });

    // Función para mostrar setlist
    function showSetlist() {
        const setlist = JSON.parse(localStorage.getItem('betania-setlist') || '[]');
        
        if (setlist.length === 0) {
            alert('El setlist está vacío. Agrega algunas canciones primero.');
            return;
        }
        
        const setlistContent = setlist.map((item, index) => 
            `${index + 1}. ${item.song} (${item.key})`
        ).join('\n');
        
        alert('Setlist actual:\n\n' + setlistContent);
    }

    // Atajos de teclado
    document.addEventListener('keydown', function(e) {
        // Solo si no estamos editando
        if (!editMode && !e.target.matches('input')) {
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    document.getElementById('transpose-up').click();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    document.getElementById('transpose-down').click();
                    break;
                case 'e':
                case 'E':
                    e.preventDefault();
                    document.getElementById('edit-mode').click();
                    break;
                case ' ':
                    e.preventDefault();
                    document.getElementById('add-to-setlist').click();
                    break;
            }
        }
    });

    // Inicializar con primera canción
    renderSong(currentSong, 0);
    attachChordEvents();

    // Mostrar mensaje de bienvenida
    console.log('🎵 Betania Music inicializado correctamente');
    console.log('Atajos: ↑/↓ = Transponer, E = Editar, Espacio = Agregar al setlist');
});
