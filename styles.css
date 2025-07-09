/* 🎵 Sistema de Alabanza Betania V4 - Estilos Google Drive + Verde */

:root {
    /* Colores Google Drive (Modo Claro) */
    --drive-white: #ffffff;
    --drive-gray-50: #f8f9fa;
    --drive-gray-100: #f1f3f4;
    --drive-gray-200: #e8eaed;
    --drive-gray-300: #dadce0;
    --drive-gray-400: #bdc1c6;
    --drive-gray-500: #9aa0a6;
    --drive-gray-600: #5f6368;
    --drive-gray-700: #3c4043;
    --drive-gray-800: #202124;
    --drive-blue: #1a73e8;
    --drive-blue-hover: #1557b2;
    --drive-green: #137333;
    --drive-green-hover: #0d652d;
    
    /* Colores Verde Betania (Modo Oscuro) */
    --green-dark: #02312b;
    --green-medium: #025a45;
    --green-light: #02866e;
    --accent-teal: #079b82;
    --text-light: #eee;
    --text-dark: #333;
    --dark-bg: #1a2a2a;
    --dark-card: #2a3a3a;
    
    /* Variables dinámicas que cambian según el modo */
    --bg-primary: var(--drive-white);
    --bg-secondary: var(--drive-gray-50);
    --bg-tertiary: var(--drive-gray-100);
    --text-primary: var(--drive-gray-800);
    --text-secondary: var(--drive-gray-600);
    --border-color: var(--drive-gray-300);
    --shadow-light: 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);
    --shadow-medium: 0 1px 3px 0 rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15);
    --shadow-heavy: 0 2px 6px 2px rgba(60,64,67,.15), 0 8px 24px 4px rgba(60,64,67,.15);
    --accent-primary: var(--drive-blue);
    --accent-hover: var(--drive-blue-hover);
    --success-color: var(--drive-green);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Google Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    transition: all 0.3s ease;
    overflow-x: hidden;
    line-height: 1.5;
}

/* =========================
   MODO CLARO (Google Drive)
   ========================= */
body.light-mode {
    --bg-primary: var(--drive-white);
    --bg-secondary: var(--drive-gray-50);
    --bg-tertiary: var(--drive-gray-100);
    --text-primary: var(--drive-gray-800);
    --text-secondary: var(--drive-gray-600);
    --border-color: var(--drive-gray-300);
    --accent-primary: var(--drive-blue);
    --accent-hover: var(--drive-blue-hover);
    --card-hover: var(--drive-gray-50);
}

/* =========================
   MODO OSCURO (Verde Betania)
   ========================= */
body.dark-mode {
    background: #062e26;
    color: #e0f7ef;
}

body.dark-mode header {
    background: #079b82;
    color: #fff;
}

body.dark-mode .container,
body.dark-mode aside,
body.dark-mode main {
    background: #09483d;
    color: #e0f7ef;
}

body.dark-mode .feature-item {
    background: #0b5e4a;
    color: #b8ffe6;
}

body.dark-mode .save-indicator {
    background: #079b82;
    color: #fff;
}

body.dark-mode input,
body.dark-mode select,
body.dark-mode button {
    background: #0b5e4a;
    color: #e0f7ef;
    border-color: #079b82;
}

body.dark-mode .chord-line-example,
body.dark-mode .lyric-line-example {
    background: transparent;
    color: #b8ffe6;
}

/* =========================
   HEADER STYLES
   ========================= */
header {
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    padding: 12px 24px;
    justify-content: space-between;
    box-shadow: var(--shadow-light);
    position: sticky;
    top: 0;
    z-index: 100;
    min-height: 64px;
}

body.dark-mode header {
    background: #079b82;
    color: #fff;
}

#logo {
    height: 40px;
    cursor: pointer;
    border-radius: 50%;
    transition: transform 0.2s ease;
}

#logo:hover {
    transform: scale(1.05);
}

header .title {
    flex: 1;
    margin-left: 16px;
}

header h1 {
    font-size: 22px;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.3;
}

body.dark-mode header h1 {
    background: linear-gradient(45deg, var(--accent-teal), var(--green-light));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

header p {
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: 2px;
    font-weight: 400;
}

.main-select {
    display: flex;
    align-items: center;
    gap: 16px;
}

.main-select select {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    font-family: inherit;
    min-width: 140px;
}

.main-select select:hover {
    border-color: var(--accent-primary);
    box-shadow: var(--shadow-light);
}

.main-select select:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
}

body.dark-mode .main-select select {
    background: var(--green-medium);
    border-color: rgba(255,255,255,0.2);
}

/* =========================
   🌙 TOGGLE MODO OSCURO CORREGIDO
   ========================= */
.dark-mode-toggle {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: var(--text-secondary);
    user-select: none;
}

/* Etiqueta del toggle */
.toggle-label {
    font-weight: 500;
    transition: color 0.3s ease;
}

/* Contenedor del interruptor personalizado */
.toggle-switch {
    position: relative;
    display: inline-block;
    width: 52px;
    height: 28px;
    cursor: pointer;
}

/* Input checkbox oculto */
.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
}

/* Fondo del toggle (slider) */
.toggle-slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--drive-gray-300);
    border-radius: 28px;
    transition: all 0.3s ease;
    cursor: pointer;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

/* Círculo deslizante */
.toggle-slider:before {
    content: "";
    position: absolute;
    height: 22px;
    width: 22px;
    left: 3px;
    bottom: 3px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Estados del toggle activo */
.toggle-switch input:checked + .toggle-slider {
    background: var(--accent-teal);
    box-shadow: inset 0 2px 4px rgba(7, 155, 130, 0.3);
}

.toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(24px);
    background: #ffffff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}

/* Estados hover */
.toggle-switch:hover .toggle-slider {
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.15), 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.toggle-switch input:checked:hover + .toggle-slider {
    background: #02866e;
    box-shadow: inset 0 2px 4px rgba(7, 155, 130, 0.4), 0 0 0 3px rgba(7, 155, 130, 0.2);
}

/* Estados focus para accesibilidad */
.toggle-switch input:focus + .toggle-slider {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
}

/* Animación de pulso al hacer clic */
.toggle-switch:active .toggle-slider:before {
    width: 26px;
}

/* Estilos para modo oscuro del toggle */
body.dark-mode .toggle-label {
    color: #e0f7ef;
}

body.dark-mode .toggle-slider {
    background: rgba(255,255,255,0.2);
}

body.dark-mode .toggle-switch input:checked + .toggle-slider {
    background: var(--green-light);
}

/* =========================
   LAYOUT STYLES
   ========================= */
.container {
    padding: 24px;
    display: flex;
    flex-grow: 1;
    gap: 24px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
}

aside {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    padding: 16px;
    width: 320px;
    min-width: 320px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    border-radius: 12px;
    box-shadow: var(--shadow-light);
    height: fit-content;
    max-height: calc(100vh - 140px);
    overflow: hidden;
}

body.dark-mode aside {
    background: var(--green-medium);
    border-color: rgba(255,255,255,0.1);
}

aside input,
aside select {
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    font-size: 14px;
    width: 100%;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: all 0.2s ease;
    font-family: inherit;
}

aside input:focus,
aside select:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
}

body.dark-mode aside input,
body.dark-mode aside select {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.2);
}

aside input::placeholder {
    color: var(--text-secondary);
}

aside ul {
    list-style: none;
    flex-grow: 1;
    overflow-y: auto;
    max-height: calc(100vh - 360px);
    margin: -4px; /* Para compensar padding de li */
    padding: 4px;
}

aside ul::-webkit-scrollbar {
    width: 6px;
}

aside ul::-webkit-scrollbar-track {
    background: transparent;
}

aside ul::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
}

aside ul::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
}

aside li {
    margin: 4px 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}

aside li:hover {
    background: var(--card-hover);
    border-color: var(--border-color);
}

body.dark-mode aside li:hover {
    background: rgba(255,255,255,0.1);
}

aside li label {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    font-size: 14px;
    line-height: 1.4;
}

aside li input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--accent-primary);
    cursor: pointer;
}

aside button {
    background: var(--accent-primary);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    font-family: inherit;
    text-transform: none;
    letter-spacing: normal;
}

aside button:hover {
    background: var(--accent-hover);
    box-shadow: var(--shadow-light);
}

aside button:active {
    transform: translateY(1px);
}

/* =========================
   MAIN CONTENT STYLES
   ========================= */
main {
    padding: 24px;
    flex-grow: 1;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow-y: auto;
    box-shadow: var(--shadow-light);
    min-height: calc(100vh - 140px);
}

body.dark-mode main {
    background: var(--dark-card);
    border-color: rgba(255,255,255,0.1);
}

main h2 {
    margin-bottom: 24px;
    font-size: 24px;
    font-weight: 500;
    color: var(--text-primary);
    text-align: center;
}

body.dark-mode main h2 {
    color: var(--accent-teal);
}

main button {
    background: var(--accent-primary);
    border: none;
    padding: 10px 20px;
    margin-right: 8px;
    margin-bottom: 8px;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    font-size: 14px;
    font-family: inherit;
}

main button:hover {
    background: var(--accent-hover);
    box-shadow: var(--shadow-light);
}

main button:active {
    transform: translateY(1px);
}

/* =========================
   WELCOME CONTENT STYLES
   ========================= */
.welcome-content {
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
}

.welcome-content p {
    font-size: 18px;
    margin-bottom: 32px;
    color: var(--success-color);
    font-weight: 500;
}

.feature-showcase {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    padding: 32px;
    border-radius: 12px;
    margin: 32px 0;
    box-shadow: var(--shadow-light);
}

body.dark-mode .feature-showcase {
    background: rgba(40, 167, 69, 0.1);
    border-color: var(--success-color);
}

.feature-showcase h3 {
    color: var(--success-color);
    margin-bottom: 24px;
    font-size: 20px;
    font-weight: 500;
}

.chord-example {
    background: var(--bg-tertiary);
    padding: 24px;
    border-radius: 8px;
    margin: 24px 0;
    text-align: left;
    border: 1px solid var(--border-color);
}

body.dark-mode .chord-example {
    background: rgba(0,0,0,0.3);
}

.chord-line-example {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    color: var(--accent-primary);
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
}

body.dark-mode .chord-line-example {
    color: #b8ffe6;
}

.lyric-line-example {
    font-size: 16px;
    color: var(--text-primary);
    margin-bottom: 16px;
    line-height: 1.5;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin-top: 24px;
    text-align: left;
}

.feature-item {
    background: var(--bg-primary);
    padding: 16px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    font-size: 14px;
    transition: all 0.2s ease;
}

.feature-item:hover {
    box-shadow: var(--shadow-light);
    transform: translateY(-1px);
}

body.dark-mode .feature-item {
    background: #0b5e4a;
    color: #b8ffe6;
    border-left: 4px solid var(--accent-teal);
}

.instructions {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    padding: 24px;
    border-radius: 12px;
    margin-top: 32px;
    text-align: left;
    box-shadow: var(--shadow-light);
}

body.dark-mode .instructions {
    background: rgba(23, 162, 184, 0.1);
    border-color: #17a2b8;
}

.instructions h4 {
    color: var(--accent-primary);
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 500;
}

body.dark-mode .instructions h4 {
    color: #17a2b8;
}

.instructions ol {
    padding-left: 24px;
}

.instructions li {
    margin-bottom: 12px;
    line-height: 1.6;
}

/* =========================
   SONG DISPLAY STYLES
   ========================= */
.song-section {
    margin-bottom: 32px;
    padding: 24px;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-light);
    transition: all 0.2s ease;
}

body.dark-mode .song-section {
    background: rgba(255,255,255,0.03);
    border-left: 4px solid var(--accent-teal);
}

.section-title {
    color: var(--accent-primary);
    font-weight: 600;
    margin-bottom: 16px;
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--border-color);
}

body.dark-mode .section-title {
    color: var(--green-light);
    border-bottom-color: rgba(7, 155, 130, 0.3);
}

.chord-line {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    color: var(--accent-primary);
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 8px;
    min-height: 24px;
    letter-spacing: 0.8px;
    line-height: 1.5;
    white-space: pre;
    background: var(--bg-tertiary);
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
}

body.dark-mode .chord-line {
    color: var(--accent-teal);
    background: rgba(7, 155, 130, 0.05);
    border-color: rgba(7, 155, 130, 0.2);
}

.lyric-line {
    font-size: 16px;
    line-height: 1.6;
    color: var(--text-primary);
    white-space: pre;
    font-family: inherit;
    margin-bottom: 12px;
    padding: 4px 12px;
}

.chord {
    display: inline-block;
    background: var(--accent-primary);
    color: white;
    padding: 2px 8px;
    border-radius: 6px;
    transition: all 0.2s ease;
    cursor: pointer;
    font-weight: 600;
    margin: 0 2px;
    font-size: 14px;
}

.chord:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-light);
}

body.dark-mode .chord {
    background: rgba(7, 155, 130, 0.8);
    border: 1px solid var(--accent-teal);
}

body.dark-mode .chord:hover {
    background: var(--accent-teal);
    box-shadow: 0 2px 8px rgba(7, 155, 130, 0.3);
}

/* =========================
   CURRENT KEY DISPLAY
   ========================= */
.current-key-display {
    text-align: center;
    margin-bottom: 24px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-light);
}

body.dark-mode .current-key-display {
    background: rgba(7, 155, 130, 0.1);
    border-color: rgba(7, 155, 130, 0.3);
}

.song-controls {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    justify-content: center;
}

.song-controls button {
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.2s ease;
    min-width: 140px;
}

/* =========================
   EDITOR STYLES
   ========================= */
.song-editor {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 24px;
    margin-top: 32px;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-light);
}

body.dark-mode .song-editor {
    background: rgba(0,0,0,0.3);
    border-color: rgba(255,255,255,0.1);
}

.edit-controls {
    background: var(--bg-primary);
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 24px;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-light);
}

body.dark-mode .edit-controls {
    background: rgba(255,255,255,0.1);
    border-color: rgba(7, 155, 130, 0.2);
}

.edit-toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
}

.edit-toolbar button {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
    color: var(--text-primary);
}

.edit-toolbar button:hover {
    background: var(--card-hover);
    border-color: var(--accent-primary);
    box-shadow: var(--shadow-light);
}

.edit-toolbar button:disabled {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    cursor: not-allowed;
    opacity: 0.6;
}

body.dark-mode .edit-toolbar button {
    background: var(--green-medium);
    color: var(--text-light);
    border-color: rgba(255,255,255,0.1);
}

.edit-instructions {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    padding: 16px;
    border-radius: 8px;
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.5;
}

body.dark-mode .edit-instructions {
    background: rgba(23, 162, 184, 0.1);
    border-color: #17a2b8;
    color: #17a2b8;
}

.editor-section {
    margin-bottom: 24px;
    padding: 16px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background: var(--bg-primary);
}

body.dark-mode .editor-section {
    background: rgba(255,255,255,0.02);
    border-color: rgba(255,255,255,0.1);
}

.editor-section-title {
    background: var(--accent-primary);
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    margin-bottom: 16px;
    display: inline-block;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

body.dark-mode .editor-section-title {
    background: var(--green-medium);
}

.editable-line {
    margin-bottom: 12px;
    position: relative;
    display: flex;
    flex-direction: column;
}

.line-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 8px;
    resize: vertical;
    min-height: 48px;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    white-space: pre;
    transition: all 0.2s ease;
}

.line-input.chord-line {
    color: var(--accent-primary);
    font-weight: 600;
    background: var(--bg-secondary);
    border-color: var(--accent-primary);
}

body.dark-mode .line-input.chord-line {
    color: var(--accent-teal);
    background: rgba(7, 155, 130, 0.1);
    border-color: var(--accent-teal);
}

.line-input:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
    background: var(--bg-primary);
}

body.dark-mode .line-input:focus {
    box-shadow: 0 0 0 2px rgba(7, 155, 130, 0.3);
    background: rgba(255,255,255,0.1);
}

.line-input::placeholder {
    color: var(--text-secondary);
    font-style: italic;
}

/* =========================
   CHORD DIAGRAM STYLES
   ========================= */
.chord-diagram {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 32px;
    box-shadow: var(--shadow-heavy);
    z-index: 1000;
    max-width: 450px;
    min-width: 380px;
}

body.dark-mode .chord-diagram {
    background: var(--dark-card);
    border-color: var(--accent-teal);
    box-shadow: 0 10px 30px rgba(0,0,0,0.7);
}

.chord-diagram h3 {
    color: var(--accent-primary);
    margin-bottom: 24px;
    text-align: center;
    font-size: 28px;
    font-weight: 600;
}

body.dark-mode .chord-diagram h3 {
    color: var(--accent-teal);
}

.chord-diagram .chord-info {
    margin-bottom: 24px;
    text-align: center;
    background: var(--bg-secondary);
    padding: 16px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

body.dark-mode .chord-diagram .chord-info {
    background: rgba(255,255,255,0.05);
}

.chord-info p {
    margin-bottom: 8px;
    font-size: 14px;
    color: var(--text-secondary);
}

.guitar-chord-svg {
    display: flex;
    justify-content: center;
    margin: 24px 0;
    background: var(--bg-primary);
    padding: 16px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.chord-diagram .close-btn {
    background: #ea4335;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    float: right;
    margin-top: 16px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
}

.chord-diagram .close-btn:hover {
    background: #d93025;
}

/* =========================
   UTILITY STYLES
   ========================= */
.save-indicator {
    position: fixed;
    top: 24px;
    right: 24px;
    background: var(--success-color);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1001;
    box-shadow: var(--shadow-medium);
    font-weight: 500;
    font-size: 14px;
}

.save-indicator.show {
    opacity: 1;
    transform: translateY(0);
}

.hidden {
    display: none !important;
}

/* =========================
   ANIMATIONS
   ========================= */
@keyframes chordHighlight {
    0% { background: var(--accent-primary); }
    50% { background: var(--accent-hover); transform: scale(1.05); }
    100% { background: var(--accent-primary); }
}

.chord.highlight {
    animation: chordHighlight 0.6s ease-in-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.song-section {
    animation: fadeInUp 0.5s ease-out;
}

/* =========================
   RESPONSIVE DESIGN
   ========================= */
@media (max-width: 1200px) {
    .container {
        max-width: 100%;
    }
    
    aside {
        width: 280px;
        min-width: 280px;
    }
}

@media (max-width: 900px) {
    header {
        flex-direction: column;
        text-align: center;
        padding: 16px;
        min-height: auto;
    }
    
    header .title {
        margin: 16px 0;
    }
    
    header h1 {
        font-size: 20px;
    }
    
    .main-select {
        flex-direction: column;
        align-items: center;
        gap: 12px;
        width: 100%;
    }
    
    .container {
        flex-direction: column;
        padding: 16px;
        gap: 16px;
    }
    
    aside {
        width: 100%;
        min-width: 0;
        max-height: 400px;
    }
    
    main {
        margin-top: 0;
        min-height: auto;
        padding: 20px;
    }

    .edit-toolbar {
        justify-content: center;
        gap: 8px;
    }

    .chord-diagram {
        max-width: 90vw;
        min-width: 300px;
        padding: 20px;
    }
    
    .features-grid {
        grid-template-columns: 1fr;
    }
    
    .chord-line {
        font-size: 14px;
    }
    
    .lyric-line {
        font-size: 15px;
    }
    
    .song-controls {
        gap: 8px;
    }
    
    .song-controls button {
        min-width: 120px;
        padding: 10px 16px;
    }

    /* 📱 Toggle responsive para móvil */
    .toggle-switch {
        width: 46px;
        height: 24px;
    }
    
    .toggle-slider:before {
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
    }
    
    .toggle-switch input:checked + .toggle-slider:before {
        transform: translateX(22px);
    }
}

@media (max-width: 600px) {
    header h1 {
        font-size: 18px;
    }
    
    header p {
        font-size: 13px;
    }
    
    main {
        padding: 16px;
    }
    
    .song-section {
        padding: 16px;
    }
    
    .chord-line {
        font-size: 13px;
        padding: 6px 10px;
    }
    
    .lyric-line {
        font-size: 14px;
    }
    
    .line-input {
        font-size: 13px;
        padding: 10px 12px;
    }

    /* 📱 Toggle más pequeño para móviles pequeños */
    .dark-mode-toggle {
        flex-direction: column;
        gap: 8px;
        text-align: center;
    }
    
    .toggle-switch {
        width: 42px;
        height: 22px;
    }
    
    .toggle-slider:before {
        height: 16px;
        width: 16px;
    }
    
    .toggle-switch input:checked + .toggle-slider:before {
        transform: translateX(20px);
    }
}

/* =========================
   PRINT STYLES
   ========================= */
@media print {
    body {
        background: white !important;
        color: black !important;
    }
    
    header,
    aside,
    .edit-controls,
    .edit-toolbar,
    button {
        display: none !important;
    }
    
    main {
        box-shadow: none !important;
        padding: 0 !important;
        background: white !important;
        border: none !important;
    }
    
    .chord-line {
        color: #1a73e8 !important;
        background: #f8f9fa !important;
        border: 1px solid #dadce0 !important;
    }
    
    .lyric-line {
        color: black !important;
    }
    
    .song-section {
        background: white !important;
        border: 1px solid #dadce0 !important;
        break-inside: avoid;
        box-shadow: none !important;
    }
}
