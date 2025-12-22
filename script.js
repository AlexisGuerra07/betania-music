/* === LOGICA PRINCIPAL === */
const App = {
    songs: [],
    currentSong: null,
    transpose: 0,

    init() {
        this.loadData();
        Router.init();
        UI.init();
        // Registrar Service Worker para PWA (Opcional, pero recomendado)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(() => {});
        }
    },

    loadData() {
        const stored = localStorage.getItem('betania_songs_v2');
        if (stored) {
            this.songs = JSON.parse(stored);
        }
        UI.renderList();
    },

    saveData() {
        localStorage.setItem('betania_songs_v2', JSON.stringify(this.songs));
        UI.showToast('Guardado localmente');
    },

    updateSong(updatedSong) {
        const idx = this.songs.findIndex(s => s.id === updatedSong.id);
        if (idx >= 0) this.songs[idx] = updatedSong;
        else this.songs.push(updatedSong);
        this.saveData();
        UI.renderList();
    }
};

/* === ENRUTADOR === */
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
        window.scrollTo(0,0);
    }
};

/* === UI Y EVENTOS === */
const UI = {
    init() {
        // Buscador
        document.getElementById('search-input').addEventListener('input', (e) => this.filterList(e.target.value));
        
        // Botones Globales
        document.getElementById('btn-new').addEventListener('click', () => Editor.new());
        document.getElementById('btn-save').addEventListener('click', () => Editor.save());
        document.getElementById('btn-back').addEventListener('click', () => Router.go('canciones'));
        document.getElementById('btn-edit-current').addEventListener('click', () => Editor.load(App.currentSong));
        
        // Importador
        document.getElementById('btn-import-folder').addEventListener('click', () => document.getElementById('folder-input').click());
        document.getElementById('folder-input').addEventListener('change', (e) => Importer.handleFiles(e.target.files));

        // Transposición
        document.querySelectorAll('.btn-t').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.id === 'btn-reset-key') Reader.resetKey();
                else Reader.transpose(parseInt(btn.dataset.semitone));
            });
        });
        
        // Editor
        document.getElementById('btn-add-section').addEventListener('click', () => Editor.addSectionUI());
    },

    renderList() {
        const list = document.getElementById('songs-list');
        const empty = document.getElementById('empty-state');
        list.innerHTML = '';
        
        if (App.songs.length === 0) {
            empty.style.display = 'block';
            return;
        }
        empty.style.display = 'none';

        App.songs.sort((a,b) => a.title.localeCompare(b.title)).forEach(song => {
            const card = document.createElement('div');
            card.className = 'song-card';
            card.innerHTML = `
                <div class="card-title">${song.title}</div>
                <div class="card-meta">${song.key || '?'} • ${song.sections.length} secciones</div>
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
        const t = document.getElementById('toast');
        t.innerText = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    }
};

/* === IMPORTADOR DE CARPETAS === */
const Importer = {
    handleFiles(files) {
        if (files.length === 0) return;
        let count = 0;
        UI.showToast(`Procesando ${files.length} archivos...`);
        
        Array.from(files).forEach(file => {
            if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.processText(file.name, e.target.result);
                    count++;
                    if (count === files.length || count % 10 === 0) {
                        App.saveData();
                        UI.renderList();
                    }
                };
                reader.readAsText(file);
            }
        });
    },

    processText(filename, text) {
        const title = filename.replace(/\.(txt|md)$/i, '').replace(/_/g, ' ');
        const sections = Parser.parse(text);
        
        const newSong = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            title: title,
            key: 'C', // Por defecto, luego se puede editar
            sections: sections
        };
        App.songs.push(newSong);
    }
};

/* === PARSER INTELIGENTE === */
const Parser = {
    // Regex para detectar líneas que parecen acordes (Ej: C G Am7 F/A)
    chordLineRegex: /^[\s]*(?:[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|7|9|11|13)*(\/[A-G][#b]?)?(\s+|$))+$/gm,
    
    parse(text) {
        const lines = text.split('\n');
        const sections = [];
        let currentSection = { label: 'General', pairs: [] };
        let bufferChord = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            // Detectar Cabecera de Sección (Ej: [CORO], CORO:, Verso 1)
            if (/^\[?((?:intro|verso|coro|puente|estribillo|final)[\s\d]*)[\]\:]?$/i.test(trimmed)) {
                if (currentSection.pairs.length > 0) sections.push(currentSection);
                currentSection = { label: trimmed.replace(/[\[\]\:]/g, ''), pairs: [] };
                return;
            }

            // Detectar si es línea de Acordes
            const isChords = this.isChordLine(trimmed);

            if (isChords) {
                if (bufferChord) {
                    // Si ya había acordes esperando letra, guardar par sin letra
                    currentSection.pairs.push({ chords: bufferChord, lyrics: '' });
                }
                bufferChord = line; // Guardar línea original con espacios para alineación
            } else {
                // Es letra
                currentSection.pairs.push({ chords: bufferChord || '', lyrics: line });
                bufferChord = null;
            }
        });

        // Limpiar último buffer
        if (bufferChord) currentSection.pairs.push({ chords: bufferChord, lyrics: '' });
        if (currentSection.pairs.length > 0) sections.push(currentSection);

        return sections.length > 0 ? sections : [{ label: 'Canción', pairs: [{ chords: '', lyrics: text }] }];
    },

    isChordLine(line) {
        // Estrategia: Si más del 50% de las "palabras" parecen acordes
        const tokens = line.split(/\s+/).filter(t => t);
        if (tokens.length === 0) return false;
        const chordTokens = tokens.filter(t => /^[A-G][#b]?(m|maj|dim|aug|sus|add|7|9)*(\/[A-G][#b]?)?$/.test(t));
        return chordTokens.length > (tokens.length * 0.6);
    }
};

/* === LECTOR === */
const Reader = {
    load(song) {
        App.currentSong = song;
        App.transpose = 0;
        
        document.getElementById('sheet-header').innerHTML = `<h1>${song.title}</h1>`;
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
    resetKey() { App.transpose = 0; this.renderBody(); this.updateKeyDisplay(); },
    updateKeyDisplay() {
        const k = App.currentSong.key || 'C';
        document.getElementById('display-key').innerText = Music.transposeNote(k, App.transpose);
    }
};

/* === EDITOR === */
const Editor = {
    data: null,
    new() { this.load({ id: Date.now().toString(), title: '', key: 'C', sections: [] }); },
    load(song) {
        this.data = JSON.parse(JSON.stringify(song)); // Clone
        document.getElementById('edit-title').value = song.title;
        this.renderCanvas();
        Router.go('edicion');
    },
    renderCanvas() {
        const canvas = document.getElementById('editor-canvas');
        const outline = document.getElementById('outline-list');
        canvas.innerHTML = '';
        outline.innerHTML = '';

        this.data.sections.forEach((sec, sIdx) => {
            // Outline item
            outline.innerHTML += `<div style="padding:5px; cursor:pointer" onclick="document.getElementById('sec-${sIdx}').scrollIntoView()">${sec.label}</div>`;

            // Section Editor
            const secDiv = document.createElement('div');
            secDiv.id = `sec-${sIdx}`;
            secDiv.style.marginBottom = '2rem';
            secDiv.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:10px">
                    <input value="${sec.label}" style="font-weight:bold; padding:5px" onchange="Editor.update(${sIdx}, null, 'label', this.value)">
                    <button class="btn-ghost" style="color:red" onclick="Editor.delSec(${sIdx})">Eliminar Sección</button>
                </div>
            `;
            
            sec.pairs.forEach((p, pIdx) => {
                const row = document.createElement('div');
                row.className = 'edit-pair';
                row.innerHTML = `
                    <textarea class="inp-chord" placeholder="Acordes" oninput="autoResize(this)" onchange="Editor.update(${sIdx}, ${pIdx}, 'chords', this.value)">${p.chords}</textarea>
                    <textarea class="inp-lyric" placeholder="Letra" oninput="autoResize(this)" onchange="Editor.update(${sIdx}, ${pIdx}, 'lyrics', this.value)">${p.lyrics}</textarea>
                `;
                secDiv.appendChild(row);
            });
            
            // Add Line Btn
            const addBtn = document.createElement('button');
            addBtn.className = 'btn btn-small btn-secondary';
            addBtn.innerText = '+ Línea';
            addBtn.onclick = () => { this.data.sections[sIdx].pairs.push({chords:'',lyrics:''}); this.renderCanvas(); };
            secDiv.appendChild(addBtn);
            canvas.appendChild(secDiv);
        });
        
        setTimeout(() => document.querySelectorAll('textarea').forEach(autoResize), 100);
    },
    update(s, p, k, v) { 
        if(p===null) this.data.sections[s][k] = v;
        else this.data.sections[s].pairs[p][k] = v;
    },
    addSectionUI() { this.data.sections.push({label:'Nueva', pairs:[{chords:'',lyrics:''}]}); this.renderCanvas(); },
    delSec(s) { if(confirm('¿Borrar?')) { this.data.sections.splice(s,1); this.renderCanvas(); } },
    save() {
        this.data.title = document.getElementById('edit-title').value || 'Sin Título';
        App.updateSong(this.data);
        App.currentSong = this.data;
        UI.showToast('Canción guardada');
    }
};

/* === UTILIDADES === */
const Music = {
    notes: ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],
    transposeNote(n, s) {
        if(!n) return '';
        let idx = this.notes.indexOf(n.replace('b','#')); // Simplificación básica
        if(idx === -1) return n;
        let newIdx = (idx + s) % 12;
        if (newIdx < 0) newIdx += 12;
        return this.notes[newIdx];
    },
    transposeStr(str, s) {
        if(!s) return str;
        return str.replace(/([A-G][#b]?)(m|maj|dim|7)*/g, (m, root, q) => {
            return this.transposeNote(root, s) + (q||'');
        });
    }
};
window.autoResize = el => { el.style.height='auto'; el.style.height=el.scrollHeight+'px'; };

// Iniciar
document.addEventListener('DOMContentLoaded', () => App.init());
