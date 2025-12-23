/* VARIABLES */
:root {
    --primary: #26a69a;
    --primary-dark: #00796b;
    --primary-light: #e0f2f1;
    --text-main: #263238;
    --text-muted: #607d8b;
    --border: #cfd8dc;
    --bg-body: #f5f7fa;
    --bg-card: #ffffff;
    --chord-color: #00897b;

    /* Tipografía */
    --font-ui: 'Inter', system-ui, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --fz-base: clamp(1rem, 2.5vw, 1.125rem);
    
    /* Layout */
    --header-h: 64px;
    --max-w: 1000px;
    --radius: 8px;
    --shadow: 0 2px 8px rgba(0,0,0,0.06);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: var(--font-ui);
    font-size: var(--fz-base);
    color: var(--text-main);
    background: var(--bg-body);
    line-height: 1.6;
    padding-bottom: 4rem;
}

/* HEADER */
.header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--bg-card);
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    height: var(--header-h);
}
.header-inner {
    max-width: var(--max-w);
    margin: 0 auto;
    padding: 0 1rem;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.brand {
    display: flex; align-items: center; gap: 0.75rem;
    cursor: pointer; font-weight: 700; color: var(--primary); font-size: 1.2rem;
}
.brand-logo { width: 36px; height: 36px; object-fit: contain; }

.nav { display: flex; gap: 0.5rem; }
.nav-item {
    background: transparent; border: none; padding: 0.5rem 1rem;
    font-weight: 500; color: var(--text-muted); cursor: pointer;
    border-radius: var(--radius); transition: all 0.2s;
}
.nav-item.active { background: var(--primary-light); color: var(--primary-dark); font-weight: 600; }

/* MAIN */
.main-content { max-width: var(--max-w); margin: 0 auto; padding: 1.5rem 1rem; }
.view { display: none; opacity: 0; animation: fadeIn 0.3s forwards; }
.view.active { display: block; }
@keyframes fadeIn { to { opacity: 1; } }

/* CONTROLS */
.controls-bar {
    display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;
    justify-content: space-between; align-items: center;
}
.search-wrapper { flex: 1; min-width: 250px; }
#search-input {
    width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border);
    border-radius: var(--radius); font-size: 1rem;
}
.action-group { display: flex; gap: 0.5rem; }

/* BUTTONS */
.btn {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0.6rem 1.2rem; border-radius: var(--radius); font-weight: 600;
    cursor: pointer; border: none; font-size: 0.95rem; transition: background 0.2s;
}
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover { background: var(--primary-dark); }
.btn-secondary { background: white; border: 1px solid var(--border); color: var(--text-main); }
.btn-ghost { background: transparent; color: var(--text-muted); }
.btn-small { padding: 0.4rem 0.8rem; font-size: 0.85rem; }
.full-width { width: 100%; }

/* SONG LIST */
.songs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.song-card {
    background: var(--bg-card); padding: 1.25rem; border-radius: var(--radius);
    border: 1px solid var(--border); cursor: pointer; transition: transform 0.2s;
}
.song-card:hover { transform: translateY(-3px); border-color: var(--primary); box-shadow: var(--shadow); }
.card-title { font-weight: 700; margin-bottom: 0.25rem; color: var(--text-main); }
.card-meta { font-size: 0.9rem; color: var(--text-muted); }

/* READER */
.reader-toolbar {
    display: flex; justify-content: space-between; align-items: center;
    background: var(--bg-body); padding: 0.5rem 0; margin-bottom: 1rem;
    position: sticky; top: var(--header-h); z-index: 90; border-bottom: 1px solid var(--border);
}
.transpose-widget {
    display: flex; align-items: center; gap: 0.5rem;
    background: white; padding: 4px 8px; border-radius: var(--radius); border: 1px solid var(--border);
}
.btn-t {
    width: 30px; height: 30px; border: 1px solid var(--border); background: #f8f9fa;
    border-radius: 4px; cursor: pointer; font-weight: bold;
}
.sheet {
    background: var(--bg-card); padding: 2rem; border-radius: var(--radius);
    box-shadow: var(--shadow); min-height: 60vh;
}
.sheet-header { text-align: center; margin-bottom: 2rem; border-bottom: 2px solid var(--primary-light); }
.sheet-header h1 { font-size: 1.8rem; color: var(--primary-dark); }

/* CHORDS & LYRICS */
.section-block { margin-bottom: 2rem; }
.sec-label {
    display: inline-block; background: var(--primary-light); color: var(--primary-dark);
    padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.85rem; font-weight: 700;
    text-transform: uppercase; margin-bottom: 0.5rem;
}
.pair-line { margin-bottom: 1rem; page-break-inside: avoid; }
.chords {
    font-family: var(--font-mono); color: var(--chord-color); font-weight: 700;
    font-size: 1.1em; white-space: pre; display: block; line-height: 1.2;
}
.lyrics { white-space: pre-wrap; display: block; color: var(--text-main); line-height: 1.5; }

/* EDITOR */
.editor-layout { display: grid; grid-template-columns: 240px 1fr; gap: 1.5rem; align-items: start; }
.editor-sidebar, .editor-workspace {
    background: var(--bg-card); padding: 1rem; border-radius: var(--radius); border: 1px solid var(--border);
}
.editor-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
#edit-title {
    font-size: 1.2rem; font-weight: bold; padding: 0.5rem; width: 60%;
    border: none; border-bottom: 2px solid var(--border); outline: none;
}
.edit-pair { background: #fafafa; border: 1px solid var(--border); padding: 0.5rem; border-radius: var(--radius); margin-bottom: 0.5rem; }
.inp-chord, .inp-lyric {
    width: 100%; border: none; background: transparent; resize: none; overflow: hidden; font-size: 1rem;
}
.inp-chord { font-family: var(--font-mono); color: var(--chord-color); font-weight: bold; margin-bottom: 2px; }

/* UTILS */
.empty-msg { text-align: center; padding: 3rem; color: var(--text-muted); }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
.toast {
    position: fixed; bottom: 20px; right: 20px; background: #333; color: white;
    padding: 10px 20px; border-radius: 4px; opacity: 0; transition: opacity 0.3s;
}
.toast.show { opacity: 1; }
.hidden { display: none; }

@media (max-width: 768px) {
    .editor-layout { grid-template-columns: 1fr; }
    .editor-sidebar { display: none; }
    .reader-toolbar { flex-wrap: wrap; gap: 0.5rem; }
    .transpose-widget { order: 3; width: 100%; justify-content: center; margin-top: 5px;}
}
