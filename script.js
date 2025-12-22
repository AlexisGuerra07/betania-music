/* ESTADO GLOBAL */
const App = {
    songs: [],
    currentSong: null,
    transpose: 0,
    
    // Configuración Inicial
    init() {
        this.loadData();
        Router.init();
        UI.init();
    },

    loadData() {
        const stored = localStorage.getItem('betania_songs_v1');
        if (stored) {
            this.songs = JSON.parse(stored);
        } else {
            // DATOS DE EJEMPLO SEGÚN TU ESTRUCTURA
            this.songs = [{
                id: '1',
                title: 'Es Él',
                author: 'TTL', 
                key: 'C',
                sections: [
                    {
                        label: 'Intro',
                        pairs: [
                            { chords: 'F G    F G', lyrics: '' },
                            { chords: 'Am G.  C', lyrics: '' }
                        ]
                    },
                    {
                        label: 'Estrofa',
                        pairs: [
                            { chords: 'C          G', lyrics: 'Es Él por el que estoy gastando mi vida' },
                            { chords: 'Am         F', lyrics: 'Perdiendo todo por amor' }
                        ]
                    }
                ]
            }];
            this.saveData();
        }
        UI.renderList();
    },

    saveData() {
        localStorage.setItem('betania_songs_v1', JSON.stringify(this.songs));
        UI.showToast('Guardado');
    },

    getSong(id) { return this.songs.find(s => s.id === id); },
    
    updateSong(updatedSong) {
        const idx = this.songs.findIndex(s => s.id === updatedSong.id);
        if (idx >= 0) this.songs[idx] = updatedSong;
        else this.songs.push(updatedSong);
        this.saveData();
        UI.renderList();
    }
};

/* ENRUTADOR SIMPLE */
const Router = {
    init() {
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', () => this.go(btn.dataset.view));
        });
        
        document.getElementById('logo-home').addEventListener('click', () => this.go('canciones'));
    },

    go(viewName) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${viewName}`).classList.add('active');
        
        document.querySelectorAll('.nav-item').forEach(n => {
            n.classList.toggle('active', n.dataset.view === viewName);
        });
    }
};

/* LÓGICA DE INTERFAZ */
const UI = {
    init() {
        // Eventos Globales
        document.getElementById('btn-new').addEventListener('click', () => Editor.new());
        document.getElementById('search-input').addEventListener('input', (e) => this.filterList(e.target.value));
        
        // Transposición
        document.querySelectorAll('.btn-t').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.id === 'btn-reset-key') Reader.resetKey();
                else Reader.transpose(parseInt(btn.dataset.semitone));
            });
        });

        // Editor
        document.getElementById('btn-save').addEventListener('click', () => Editor.save());
        document.getElementById('btn-add-section').addEventListener('click', () => Editor.addSectionUI());
        document.getElementById('btn-back').addEventListener('click', () => Router.go('canciones'));
        document.getElementById('btn-edit-current').addEventListener('click', () => Editor.load(App.currentSong));
    },

    renderList() {
        const list = document.getElementById('songs-list');
        list.innerHTML = '';
        
        if (App.songs.length === 0) {
            document.getElementById('empty-state').style.display = 'block';
            return;
        }
        
        document.getElementById('empty-state').style.display = 'none';
        App.songs.forEach(song => {
            const card = document.createElement('div');
            card.className = 'song-card';
            card.innerHTML = `
                <div class="card-title">${song.title}</div>
                <div class="card-meta">${song.author} • ${song.key}</div>
            `;
            card.addEventListener('click', () => Reader.load(song));
            list.appendChild(card);
        });
    },

    filterList(query) {
        const term = query.toLowerCase();
        document.querySelectorAll('.song-card').forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(term) ? 'block' : 'none';
        });
    },

    showToast(msg) {
        const status = document.getElementById('save-status');
        status.innerText = msg;
        status.style.color = 'var(--primary)';
        setTimeout(() => { status.style.color = '#ccc'; }, 2000);
    }
};

/* LECTOR Y TRANSPOSITOR */
const Reader = {
    currentKeyIdx: 0,
    
    load(song) {
        App.currentSong = song;
        App.transpose = 0;
        
        // Render Header
        const sheet = document.getElementById('song-sheet');
        sheet.innerHTML = `
            <div class="sheet-header">
                <h1 class="song-h1">${song.title}</h1>
                <p>${song.author}</p>
            </div>
            <div id="sheet-content"></div>
        `;

        this.renderBody();
        Router.go('reader');
        this.updateKeyDisplay();
    },

    renderBody() {
        const container = document.getElementById('sheet-content');
        container.innerHTML = App.currentSong.sections.map(sec => `
            <div class="section-block">
                <span class="sec-label">${sec.label}</span>
                ${sec.pairs.map(p => `
                    <div class="pair-line">
                        ${p.chords ? `<span class="chords">${Music.transposeStr(p.chords, App.transpose)}</span>` : ''}
                        <span class="lyrics">${p.lyrics}</span>
                    </div>
                `).join('')}
            </div>
        `).join('');
    },

    transpose(semitones) {
        App.transpose += semitones;
        this.renderBody();
        this.updateKeyDisplay();
    },

    resetKey() {
        App.transpose = 0;
        this.renderBody();
        this.updateKeyDisplay();
    },

    updateKeyDisplay() {
        const newKey = Music.transposeNote(App.currentSong.key, App.transpose);
        document.getElementById('display-key').innerText = newKey;
    }
};

/* EDITOR */
const Editor = {
    currentData: null,

    new() {
        this.load({ id: Date.now().toString(), title: '', author: '', key: 'C', sections: [] });
    },

    load(song) {
        this.currentData = JSON.parse(JSON.stringify(song)); // Copia profunda
        document.getElementById('edit-title').value = song.title;
        this.renderCanvas();
        Router.go('edicion');
    },

    renderCanvas() {
        const canvas = document.getElementById('editor-canvas');
        canvas.innerHTML = '';
        
        this.currentData.sections.forEach((sec, sIdx) => {
            const secDiv = document.createElement('div');
            secDiv.className = 'section-block';
            secDiv.innerHTML = `
                <input value="${sec.label}" class="sec-label" style="border:none; border-bottom:1px dashed #ccc" onchange="Editor.updateSection(${sIdx}, 'label', this.value)">
                <button class="btn-ghost" style="color:red; float:right" onclick="Editor.deleteSection(${sIdx})">🗑</button>
            `;
            
            sec.pairs.forEach((pair, pIdx) => {
                const row = document.createElement('div');
                row.className = 'edit-pair';
                row.innerHTML = `
                    <textarea class="inp-chord" placeholder="Acordes" oninput="autoResize(this)" onchange="Editor.updatePair(${sIdx}, ${pIdx}, 'chords', this.value)">${pair.chords}</textarea>
                    <textarea class="inp-lyric" placeholder="Letra" oninput="autoResize(this)" onchange="Editor.updatePair(${sIdx}, ${pIdx}, 'lyrics', this.value)">${pair.lyrics}</textarea>
                `;
                secDiv.appendChild(row);
            });
            
            // Botón añadir par
            const addBtn = document.createElement('button');
            addBtn.className = 'btn btn-small btn-secondary';
            addBtn.innerText = '+ Línea';
            addBtn.onclick = () => this.addPair(sIdx);
            secDiv.appendChild(addBtn);
            
            canvas.appendChild(secDiv);
        });
        
        // Auto-resize inicial
        document.querySelectorAll('textarea').forEach(tx => autoResize(tx));
    },

    updatePair(sIdx, pIdx, field, val) { this.currentData.sections[sIdx].pairs[pIdx][field] = val; },
    updateSection(sIdx, field, val) { this.currentData.sections[sIdx][field] = val; },
    addPair(sIdx) { this.currentData.sections[sIdx].pairs.push({chords:'', lyrics:''}); this.renderCanvas(); },
    addSectionUI() { this.currentData.sections.push({label: 'Nueva Sección', pairs: [{chords:'', lyrics:''}]}); this.renderCanvas(); },
    deleteSection(sIdx) { if(confirm('¿Borrar sección?')) { this.currentData.sections.splice(sIdx, 1); this.renderCanvas(); } },

    save() {
        this.currentData.title = document.getElementById('edit-title').value || 'Sin Título';
        App.updateSong(this.currentData);
        App.currentSong = this.currentData; // Actualizar ref
    }
};

/* UTILIDADES MUSICALES (Transposición Robusta) */
const Music = {
    notes: ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],
    
    transposeNote(note, semitones) {
        if(!note) return '';
        // Normalizar bemoles a sostenidos para simplificar
        const map = {'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#'};
        let root = map[note] || note;
        
        let idx = this.notes.indexOf(root);
        if (idx === -1) return note; // No es nota musical
        
        let newIdx = (idx + semitones) % 12;
        if (newIdx < 0) newIdx += 12;
        
        return this.notes[newIdx];
    },

    transposeStr(str, semitones) {
        if (!semitones) return str;
        // Regex que busca Acordes (Ej: Am7, C/G, F#dim)
        return str.replace(/([A-G][b#]?)(maj|min|m|sus|dim|aug|7|9)?(\/[A-G][b#]?)?/g, (match, root, quality, bass) => {
            const newRoot = this.transposeNote(root, semitones);
            let newBass = '';
            if (bass) {
                newBass = '/' + this.transposeNote(bass.substring(1), semitones);
            }
            return newRoot + (quality || '') + newBass;
        });
    }
};

// Helper global para textareas
window.autoResize = (el) => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
};

// Start
document.addEventListener('DOMContentLoaded', () => App.init());
