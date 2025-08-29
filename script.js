// Funcionalidad básica para demostración
document.addEventListener('DOMContentLoaded', function() {
    
    // Cambio de canción al hacer clic en la lista
    document.querySelectorAll('.song-item').forEach(item => {
        item.addEventListener('click', function() {
            // Remover clase active de todos los elementos
            document.querySelectorAll('.song-item').forEach(i => i.classList.remove('active'));
            
            // Agregar clase active al elemento clickeado
            this.classList.add('active');
            
            // Simular cambio de canción
            const title = this.querySelector('.song-title').textContent;
            const key = this.querySelector('.song-key').textContent.replace('Tonalidad: ', '');
            
            // Actualizar información de la canción
            document.querySelector('.song-info h1').textContent = title;
            document.querySelector('.current-key').textContent = key;
        });
    });

    // Sistema de transposición
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    let currentKeyIndex = 0;
    
    // Botón para bajar tonalidad (♭)
    document.querySelector('.transpose-controls .btn:first-child').addEventListener('click', function() {
        currentKeyIndex = (currentKeyIndex - 1 + keys.length) % keys.length;
        document.querySelector('.current-key').textContent = keys[currentKeyIndex];
        console.log('Transposición a:', keys[currentKeyIndex]);
    });
    
    // Botón para subir tonalidad (♯)
    document.querySelector('.transpose-controls .btn:last-child').addEventListener('click', function() {
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        document.querySelector('.current-key').textContent = keys[currentKeyIndex];
        console.log('Transposición a:', keys[currentKeyIndex]);
    });

    // Funcionalidad para acordes clickeables
    document.querySelectorAll('.chord').forEach(chord => {
        chord.addEventListener('click', function() {
            alert('Mostrando diagrama para acorde: ' + this.textContent);
            // Aquí se implementaría la lógica para mostrar el diagrama del acorde
        });
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
    document.querySelector('.btn-primary').addEventListener('click', function() {
        if (this.textContent === 'Editar') {
            this.textContent = 'Guardar';
            this.style.background = '#059669';
            console.log('Modo edición activado');
        } else {
            this.textContent = 'Editar';
            this.style.background = '#3b82f6';
            console.log('Cambios guardados');
        }
    });

    // Funcionalidad para agregar al setlist
    document.querySelector('.btn:last-child').addEventListener('click', function() {
        const currentSong = document.querySelector('.song-info h1').textContent;
        alert('Canción "' + currentSong + '" agregada al setlist');
        console.log('Agregado al setlist:', currentSong);
    });

    // Navegación del menú principal
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los enlaces
            document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al enlace clickeado
            this.classList.add('active');
            
            console.log('Navegando a:', this.textContent);
            
            // Aquí se implementaría la lógica para cambiar de sección
            // Por ahora solo mostramos un mensaje
            if (this.textContent !== 'Canciones') {
                alert('Sección "' + this.textContent + '" en desarrollo');
            }
        });
    });

    console.log('Betania Music inicializado correctamente');
});
