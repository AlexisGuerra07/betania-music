// ============ FIREBASE ============
const firebaseConfig = {
  apiKey: "AIzaSyAq6nR416IldHvVbt0E5ECl-8Rb9PCM0S4",
  authDomain: "betania-music.firebaseapp.com",
  projectId: "betania-music",
  storageBucket: "betania-music.firebasestorage.app",
  messagingSenderId: "651916728496",
  appId: "1:651916728496:web:1848e1c6579941c7660375"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const ADMIN_EMAIL = 'alexisg898@gmail.com';

// ============ WAKE LOCK ============
// ============ METRÓNOMO (ventanita al tocar el BPM de una canción) ============
// Genera el clic con Web Audio (sin archivos de sonido externos), respetando el BPM
// y el compás de la canción — el primer tiempo de cada compás suena distinto (acento).
//
// Cómo lleva el tiempo: NO usa un temporizador normal para cada clic (esos se
// retrasan en cuanto el móvil está ocupado, y el pulso "cojea"). En su lugar,
// cada 25 ms mira qué clics tocan en la próxima décima de segundo y se los deja
// programados al reloj interno de audio, que es exacto. Los puntitos de la
// pantalla sí van con temporizador normal: si se retrasan un poco no se oye.
const Metronome = {
    audioCtx: null,
    running: false,
    timerId: null,
    beatIndex: 0,
    bpm: 120,
    beatsPerMeasure: 4,
    songId: null,   // de qué canción es lo que está sonando ahora mismo
    LOOKAHEAD_MS: 25,        // cada cuánto se revisa si hay que programar clics
    SCHEDULE_AHEAD_S: 0.12,  // cuánto por delante se dejan programados
    nextNoteTime: 0,         // momento exacto (reloj de audio) del próximo clic
    dotTimers: new Set(),    // temporizadores de los puntitos pendientes
    pendingOscs: new Set(),  // clics ya programados que todavía no han sonado

    ensureContext() {
        if (!this.audioCtx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (Ctx) this.audioCtx = new Ctx();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume();
    },

    // Programa un clic para que suene exactamente en "time" (reloj de audio).
    playClick(accent, time) {
        if (!this.audioCtx) return;
        const ctx = this.audioCtx;
        const t = Math.max(time, ctx.currentTime);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = accent ? 1050 : 750;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.exponentialRampToValueAtTime(0.5, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.07);
        // Se guarda para poder cortarlo si pulsas stop antes de que suene.
        this.pendingOscs.add(osc);
        osc.onended = () => this.pendingOscs.delete(osc);
    },

    open(song) {
        this.songId = song ? song.id : null;
        this.bpm = (song && song.bpm) || 120;
        this.beatsPerMeasure = Teleprompter.getBeatsPerMeasure(song);
        this.beatIndex = 0;
        const popup = document.getElementById('metronome-popup');
        const bpmLabel = document.getElementById('metronome-bpm');
        if (bpmLabel) bpmLabel.textContent = `${this.bpm} BPM`;
        this.renderDots();
        if (popup) popup.style.display = 'flex';
    },

    close() {
        this.songId = null;
        this.stop();
        const popup = document.getElementById('metronome-popup');
        if (popup) popup.style.display = 'none';
    },

    renderDots() {
        const wrap = document.getElementById('metronome-dots');
        if (!wrap) return;
        wrap.innerHTML = Array.from({ length: this.beatsPerMeasure }).map(() => '<span class="metronome-dot"></span>').join('');
    },

    updateDots(beat) {
        const dots = document.querySelectorAll('#metronome-dots .metronome-dot');
        dots.forEach((dot, i) => dot.classList.toggle('active', i === beat));
    },

    // Deja programados todos los clics que caen dentro de la ventana próxima.
    scheduler() {
        if (!this.running || !this.audioCtx) return;
        const ctx = this.audioCtx;
        // Si el móvil se quedó colgado un rato, no disparamos de golpe todos los
        // clics atrasados: retomamos el pulso desde ahora.
        if (this.nextNoteTime < ctx.currentTime - 0.2) this.nextNoteTime = ctx.currentTime + 0.05;
        while (this.nextNoteTime < ctx.currentTime + this.SCHEDULE_AHEAD_S) {
            const beat = this.beatIndex % this.beatsPerMeasure;
            this.playClick(beat === 0, this.nextNoteTime);
            const delayMs = Math.max(0, (this.nextNoteTime - ctx.currentTime) * 1000);
            const timer = setTimeout(() => {
                this.dotTimers.delete(timer);
                if (this.running) this.updateDots(beat);
            }, delayMs);
            this.dotTimers.add(timer);
            this.beatIndex++;
            this.nextNoteTime += 60 / this.bpm;
        }
    },

    start() {
        if (this.running || !this.bpm) return;
        this.ensureContext();
        if (!this.audioCtx) return; // el navegador no soporta Web Audio
        this.running = true;
        this.beatIndex = 0;
        // Un pelín de margen para que el primer clic no salga cortado.
        this.nextNoteTime = this.audioCtx.currentTime + 0.05;
        this.scheduler();
        this.timerId = setInterval(() => this.scheduler(), this.LOOKAHEAD_MS);
        this.updateToggleIcon();
    },

    stop() {
        this.running = false;
        if (this.timerId) { clearInterval(this.timerId); this.timerId = null; }
        this.dotTimers.forEach(t => clearTimeout(t));
        this.dotTimers.clear();
        // Los clics que estaban programados para dentro de unos milisegundos se
        // cortan también, para que no suene "uno más" después de pulsar stop.
        this.pendingOscs.forEach(osc => { try { osc.stop(); } catch (e) { } });
        this.pendingOscs.clear();
        document.querySelectorAll('#metronome-dots .metronome-dot').forEach(dot => dot.classList.remove('active'));
        this.updateToggleIcon();
    },

    toggle() { this.running ? this.stop() : this.start(); },

    updateToggleIcon() {
        const play = document.getElementById('metronome-icon-play');
        const stop = document.getElementById('metronome-icon-stop');
        if (play) play.style.display = this.running ? 'none' : 'block';
        if (stop) stop.style.display = this.running ? 'block' : 'none';
    }
};

const WakeLockManager = {
    sentinel: null,
    async request() {
        try {
            if ('wakeLock' in navigator) {
                this.sentinel = await navigator.wakeLock.request('screen');
                this.sentinel.addEventListener('release', () => { this.sentinel = null; });
            }
        } catch (err) { console.log('No se pudo activar Wake Lock:', err); }
    },
    release() { if (this.sentinel) { this.sentinel.release(); this.sentinel = null; } }
};

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && AppState.currentView === 'song-reader') {
        WakeLockManager.request();
    }
});

// ============ AVISO DE "SIN CONEXIÓN" ============
// Sin red la app sigue abriendo con la última copia guardada en el móvil, pero
// hay que decirlo: si alguien cambia el repertorio mientras tanto, lo que se ve
// no es lo último. El aviso evita que nadie toque una lista equivocada creyendo
// que está al día.
const ConnectionBanner = {
    init() {
        window.addEventListener('online', () => this.update());
        window.addEventListener('offline', () => this.update());
        this.update();
    },
    update() {
        const el = document.getElementById('offline-banner');
        if (!el) return;
        el.hidden = navigator.onLine;
    }
};

// ============ PANTALLA DE CARGA (SPLASH) ============
const SplashManager = {
    hidden: false,
    hide() {
        if (this.hidden) return;
        this.hidden = true;
        const el = document.getElementById('app-splash');
        if (el) {
            el.classList.add('hidden');
            setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 450);
        }
    },
    checkReady() {
        if (AppState.songsLoaded && AppState.setlistsLoaded && AppState.vocalProfilesLoaded) this.hide();
    },
    startSafetyTimeout() {
        setTimeout(() => this.hide(), 4000);
    }
};

// ============ CONTROL DEL BOTÓN DE SALIR EN PANTALLA COMPLETA ============
const FullscreenUI = {
    hideTimer: null,
    activityBound: false,
    show() {
        const btn = document.getElementById('btn-fullscreen-exit');
        if (btn) btn.style.display = 'inline-flex';
        const tpControls = document.getElementById('teleprompter-controls');
        if (tpControls) tpControls.style.display = 'flex';
        this.scheduleHide();
    },
    hide() {
        const btn = document.getElementById('btn-fullscreen-exit');
        if (btn) btn.style.display = 'none';
        const tpControls = document.getElementById('teleprompter-controls');
        if (tpControls) tpControls.style.display = 'none';
        if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = null; }
    },
    scheduleHide() {
        if (this.hideTimer) clearTimeout(this.hideTimer);
        this.hideTimer = setTimeout(() => {
            const btn = document.getElementById('btn-fullscreen-exit');
            if (btn) btn.style.display = 'none';
            const tpControls = document.getElementById('teleprompter-controls');
            if (tpControls) tpControls.style.display = 'none';
        }, 3000);
    },
    bindActivityListeners() {
        if (this.activityBound) return;
        this.activityBound = true;
        const reveal = () => { if (AppState.fullscreenMode) this.show(); };
        document.addEventListener('touchstart', reveal, { passive: true });
        document.addEventListener('mousemove', reveal, { passive: true });
        document.addEventListener('click', reveal, { passive: true });
    }
};

// ============ TELEPROMPTER (auto-scroll en pantalla completa) ============
// Desliza la letra sola calculando cuánto debería durar cada bloque a partir de:
// BPM + compás (segundos por compás) + cantidad de acordes reales en esa sección
// (cada acorde ≈ 2 a 4 compases, usamos 3 como punto medio).
// Si la canción tiene "orden" cargado (las burbujas de arriba), sigue ESE orden
// real: salta de sección en sección y repite cuando corresponde (ej. "Coro x2").
// Si no hay orden cargado, cae en un scroll lineal de toda la letra, estimando
// la duración total de la misma forma (con todos los acordes de la canción).
// Si el usuario desliza manualmente mientras está en marcha, el avance automático
// se resincroniza desde la nueva posición (no pelea ni retrocede solo).
const Teleprompter = {
    running: false,
    speedFactor: 1,
    rafId: null,
    lastTimestamp: null,
    autoStartTimer: null,
    plan: null,             // array de segmentos {startY, endY, durationSec}, o null si no hay orden cargado
    elapsedSec: 0,          // segundos transcurridos a lo largo del plan (o del scroll lineal)
    fallbackPxPerSec: 24,   // usado solo cuando no hay plan (sin orden cargado)
    MEASURES_PER_CHORD: 3,  // punto medio de "2 a 4 compases por acorde"
    userInteracting: false, // true mientras el usuario toca/desliza/usa la rueda — no tocamos el scroll
    interactionTimer: null,
    interactionBound: false,
    hasPlayedOnce: false, // true tras la primera vez que se le da play en la canción actual

    // Mientras el usuario esté tocando o usando la rueda, el auto-scroll se aparta por
    // completo (no llama a scrollTo ni scrollBy). Al soltar, retoma desde donde quedó.
    bindInteractionListeners() {
        if (this.interactionBound) return;
        this.interactionBound = true;
        const handler = () => this.markUserInteraction();
        window.addEventListener('touchstart', handler, { passive: true });
        window.addEventListener('touchmove', handler, { passive: true });
        window.addEventListener('wheel', handler, { passive: true });
    },
    markUserInteraction() {
        if (!this.running) return;
        this.userInteracting = true;
        if (this.interactionTimer) clearTimeout(this.interactionTimer);
        this.interactionTimer = setTimeout(() => {
            this.userInteracting = false;
            this.interactionTimer = null;
            // Al soltar, retomamos el avance automático desde donde haya quedado la página.
            if (this.plan && this.plan.length) {
                this.elapsedSec = this.yToElapsed(window.scrollY);
            }
            this.lastTimestamp = null;
        }, 1200);
    },

    scheduleAutoStart(delayMs) {
        this.cancelAutoStart();
        this.autoStartTimer = setTimeout(() => {
            this.autoStartTimer = null;
            // Arranque en frío: siempre desde arriba del todo, sin depender de ningún cálculo previo.
            window.scrollTo(0, 0);
            this.start({ fromStart: true });
        }, delayMs);
    },
    cancelAutoStart() {
        if (this.autoStartTimer) { clearTimeout(this.autoStartTimer); this.autoStartTimer = null; }
    },

    start(options = {}) {
        this.cancelAutoStart();
        if (this.running) return;
        const song = AppState.currentSong;
        this.plan = this.buildPlan(song);
        this.running = true;
        this.lastTimestamp = null;
        this.userInteracting = false;
        if (this.interactionTimer) { clearTimeout(this.interactionTimer); this.interactionTimer = null; }
        if (this.plan) {
            const forceFromStart = options.fromStart || window.scrollY < 50;
            if (forceFromStart && this.plan.length) {
                // Que el primer tramo arranque desde donde ya estamos (arriba del todo),
                // no desde la posición exacta del Intro — si el Intro mide poco (ej. un
                // solo acorde suelto), saltar directo a su posición lo empuja al borde
                // superior de golpe, dando la sensación de que "se lo comió".
                this.plan[0] = { ...this.plan[0], startY: Math.min(this.plan[0].startY, window.scrollY) };
            }
            this.elapsedSec = forceFromStart ? 0 : this.yToElapsed(window.scrollY);
        } else {
            this.elapsedSec = 0;
            const estDuration = this.estimateWholeSongDurationSec(song);
            const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            const bpm = (song && song.bpm) || 80;
            this.fallbackPxPerSec = estDuration ? (maxScroll / estDuration) : ((bpm / 60) * 24);
        }
        this.updateToggleIcon();
        this.rafId = requestAnimationFrame((t) => this.tick(t));
    },
    stop() {
        this.cancelAutoStart();
        this.running = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = null;
        this.lastTimestamp = null;
        this.userInteracting = false;
        if (this.interactionTimer) { clearTimeout(this.interactionTimer); this.interactionTimer = null; }
        this.updateToggleIcon();
    },
    toggle() {
        this.cancelAutoStart();
        if (this.running) {
            this.stop();
        } else if (!this.hasPlayedOnce) {
            // Primera vez que se le da play en esta canción: siempre desde el principio,
            // sin importar hasta dónde hayas bajado leyendo antes de tocar play.
            this.hasPlayedOnce = true;
            window.scrollTo(0, 0);
            this.start({ fromStart: true });
        } else {
            this.start();
        }
    },
    reset() {
        this.stop();
        this.speedFactor = 1;
        this.plan = null;
        this.elapsedSec = 0;
        this.hasPlayedOnce = false;
    },

    tick(timestamp) {
        if (!this.running) return;
        if (this.lastTimestamp == null) this.lastTimestamp = timestamp;
        const deltaSec = Math.min(0.1, (timestamp - this.lastTimestamp) / 1000);
        this.lastTimestamp = timestamp;

        if (this.userInteracting) {
            // El usuario tiene el control (dedo o rueda activos): no tocamos el scroll para nada.
            this.rafId = requestAnimationFrame((t) => this.tick(t));
            return;
        }

        if (this.plan && this.plan.length) {
            this.elapsedSec += deltaSec * this.speedFactor;
            const total = this.planTotalDuration();
            if (this.elapsedSec >= total) { this.stop(); return; }
            const targetY = this.elapsedToY(this.elapsedSec);
            window.scrollTo(0, targetY);
        } else {
            window.scrollBy(0, this.fallbackPxPerSec * this.speedFactor * deltaSec);
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (window.scrollY >= maxScroll - 2) { this.stop(); return; }
        }
        this.rafId = requestAnimationFrame((t) => this.tick(t));
    },

    faster() { this.speedFactor = Math.min(3, Math.round(this.speedFactor * 1.15 * 100) / 100); },
    slower() { this.speedFactor = Math.max(0.2, Math.round(this.speedFactor * 0.87 * 100) / 100); },

    // ---- Estimación de duración a partir de BPM + compás + cantidad de acordes ----
    getBeatsPerMeasure(song) {
        const compas = (song && song.compas) || '4/4';
        const m = String(compas).match(/^(\d+)\s*\/\s*(\d+)/);
        return m ? Math.max(1, parseInt(m[1], 10)) : 4;
    },
    // Detecta repeticiones escritas dentro de la propia letra, ej. "Oh oh oh oh x3" -> 3.
    // Muy común en intros/vamps ("la la la x2", "oh oh x4"...). Sin esto, esas frases
    // solo se contaban una vez y la duración estimada salía muy corta.
    detectPairRepeats(pair) {
        const text = `${pair.letra || ''} ${pair.acordes || ''}`;
        const m = text.match(/\b[xX]\s?(\d+)\b/);
        return m ? Math.max(1, parseInt(m[1], 10)) : 1;
    },
    countChordsInSection(sectionData) {
        if (!sectionData || !sectionData.pairs) return 0;
        let count = 0;
        sectionData.pairs.forEach(pair => {
            if (!pair.acordes) return;
            const chordsInPair = [...pair.acordes.matchAll(ChordParser.chordRegex)].length;
            count += chordsInPair * this.detectPairRepeats(pair);
        });
        return count;
    },
    estimateSectionDurationSec(sectionData, song, label) {
        const bpm = (song && song.bpm) || 80;
        const secPerMeasure = (this.getBeatsPerMeasure(song) / bpm) * 60;
        const numChords = this.countChordsInSection(sectionData);
        const isIntro = label ? Router.getStructureCategoryKey(label) === 'I' : false;
        const measuresPerChord = isIntro ? 4 : this.MEASURES_PER_CHORD;
        const estimatedMeasures = numChords > 0 ? numChords * measuresPerChord : (isIntro ? 8 : 4);
        return Math.max(1, estimatedMeasures * secPerMeasure);
    },
    estimateWholeSongDurationSec(song) {
        if (!song || !song.sections || !song.sections.length) return null;
        const bpm = (song && song.bpm) || 80;
        const secPerMeasure = (this.getBeatsPerMeasure(song) / bpm) * 60;
        let totalMeasures = 0;
        song.sections.forEach(s => {
            const numChords = this.countChordsInSection(s);
            const isIntro = s.label ? Router.getStructureCategoryKey(s.label) === 'I' : false;
            const measuresPerChord = isIntro ? 4 : this.MEASURES_PER_CHORD;
            totalMeasures += numChords > 0 ? numChords * measuresPerChord : (isIntro ? 8 : 4);
        });
        if (!totalMeasures) return null;
        return totalMeasures * secPerMeasure;
    },

    // ---- Construcción del plan a partir del "orden de la canción" ----
    parseStructureEntry(rawEntry) {
        const text = (rawEntry || '').trim();
        const repeatMatch = text.match(/x\s*(\d+)\s*$/i);
        const repeats = repeatMatch ? Math.max(1, parseInt(repeatMatch[1], 10)) : 1;
        const baseText = repeatMatch ? text.slice(0, repeatMatch.index).trim() : text;
        return { baseText, repeats };
    },
    matchSection(baseText, sectionsInfo) {
        const normalized = baseText.toLowerCase();
        let match = sectionsInfo.find(s => s.label.toLowerCase() === normalized);
        if (match) return match;
        const category = Router.getStructureCategoryKey(baseText);
        if (!category) return null;
        const sameCategory = sectionsInfo.filter(s => Router.getStructureCategoryKey(s.label) === category);
        if (!sameCategory.length) return null;
        const numMatch = normalized.match(/(\d+)\s*$/);
        const instanceNum = numMatch ? parseInt(numMatch[1], 10) : null;
        // Si el orden pide "Estrofa 2" pero solo existe una Estrofa real, usamos esa
        // (la última disponible), en vez de resetear siempre al índice 0.
        if (instanceNum) return sameCategory[Math.min(instanceNum - 1, sameCategory.length - 1)];
        return sameCategory[0];
    },
    // Arma el plan directo a partir de los bloques ya expandidos según el orden — cada
    // bloque en pantalla dura lo que le corresponde (su propia cantidad de acordes,
    // multiplicada por las repeticiones de su línea, ej. "Coro x8" tarda 8 veces lo
    // normal en ESE bloque, en vez de recorrerlo 8 veces con saltos hacia atrás).
    buildPlanFromOrderedBlocks(song, ordered, sectionEls) {
        const segments = [];
        ordered.forEach((block, i) => {
            const el = sectionEls[i];
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const topY = rect.top + window.scrollY;
            const height = Math.max(20, rect.height);
            const { baseText, repeats } = this.parseStructureEntry(block.label);
            const durationSec = this.estimateSectionDurationSec({ pairs: block.pairs }, song, baseText) * repeats;
            segments.push({ startY: topY, endY: topY + height, durationSec });
        });
        console.log('[Teleprompter] Plan (modo "según el orden"):', segments.map(s => ({ y: Math.round(s.startY), altura: Math.round(s.endY - s.startY), durationSec: Math.round(s.durationSec) })));
        console.log('[Teleprompter] Duración total estimada (seg):', Math.round(segments.reduce((sum, s) => sum + s.durationSec, 0)));
        return segments.length ? segments : null;
    },

    buildPlan(song) {
        if (!song || !song.sections || !song.sections.length) return null;

        // Si la letra está armada "según el orden" (cada bloque
        // en pantalla ya es una línea real del orden, repetida físicamente si hace falta),
        // cada bloque corresponde 1 a 1 con lo que se ve — no hay que emparejar nada,
        // se arma el plan directo a partir de lo que ya está en pantalla.
        const ordered = Router.getOrderedRenderSections(song);
        if (ordered) {
            const orderedEls = Array.from(document.querySelectorAll('#song-content .section'));
            if (orderedEls.length === ordered.length) {
                return this.buildPlanFromOrderedBlocks(song, ordered, orderedEls);
            }
        }

        const structureRaw = Router.getEffectiveStructure(song);
        const sectionEls = Array.from(document.querySelectorAll('#song-content .section'));
        if (!structureRaw.length || sectionEls.length !== song.sections.length) return null;

        // "Anclas": un punto de referencia por cada etiqueta visible, ya sea el título
        // principal de una sección o una etiqueta interna (cuando varias partes quedaron
        // fusionadas dentro de un mismo bloque al crear la canción).
        const anchors = [];
        sectionEls.forEach((sectionEl, sIdx) => {
            const sectionData = song.sections[sIdx] || { pairs: [] };
            const children = Array.from(sectionEl.children); // [0] = etiqueta principal, resto = pares en orden
            const topRect = sectionEl.getBoundingClientRect();
            let current = { label: sectionData.label || '', topY: topRect.top + window.scrollY, pairs: [] };
            anchors.push(current);

            (sectionData.pairs || []).forEach((pair, pIdx) => {
                const childEl = children[pIdx + 1];
                const letraTrim = (pair.letra || '').trim();
                const acordesEmpty = !pair.acordes || !pair.acordes.trim();
                const isInline = letraTrim && acordesEmpty && ChordParser.isSectionHeader(letraTrim);
                if (isInline && childEl) {
                    const inlineName = ChordParser.normalizeSectionName(letraTrim);
                    const rect = childEl.getBoundingClientRect();
                    current = { label: inlineName, topY: rect.top + window.scrollY, pairs: [] };
                    anchors.push(current);
                } else {
                    current.pairs.push(pair);
                }
            });
        });

        // A cada ancla le calculamos su alto real (hasta la siguiente ancla) y su duración
        // estimada (solo con los acordes que quedan DENTRO de ese tramo, no de todo el bloque grande).
        const contentEl = document.getElementById('song-content');
        const contentBottom = contentEl ? (contentEl.getBoundingClientRect().bottom + window.scrollY) : null;
        anchors.forEach((a, i) => {
            const nextTopY = (i + 1 < anchors.length) ? anchors[i + 1].topY : (contentBottom !== null ? contentBottom : a.topY + 100);
            a.height = Math.max(20, nextTopY - a.topY);
            a.durationSec = this.estimateSectionDurationSec({ pairs: a.pairs }, song, a.label);
        });

        // Qué anclas se usan en algún momento del orden (sea cual sea su posición en la lista).
        const usedAnchors = new Set();
        structureRaw.forEach(rawEntry => {
            const { baseText } = this.parseStructureEntry(rawEntry);
            const match = this.matchSection(baseText, anchors);
            if (match) usedAnchors.add(match);
        });

        // Si al principio del documento hay anclas (típicamente el Intro) que el orden
        // nunca menciona, las anteponemos igual — así el recorrido siempre arranca desde
        // arriba del todo en vez de saltar directo a la primera parte que sí está listada.
        const leadingUnused = [];
        for (const a of anchors) {
            if (usedAnchors.has(a)) break;
            leadingUnused.push(a);
        }

        const segments = [];
        leadingUnused.forEach(a => {
            segments.push({ startY: a.topY, endY: a.topY + a.height, durationSec: a.durationSec });
        });
        structureRaw.forEach(rawEntry => {
            const { baseText, repeats } = this.parseStructureEntry(rawEntry);
            const match = this.matchSection(baseText, anchors);
            if (!match) return;
            // Un "x2"/"x4" se canta esa cantidad de veces seguidas a ritmo normal —
            // se recorre el bloque, se vuelve arriba, y se recorre de nuevo (no en cámara lenta).
            for (let i = 0; i < repeats; i++) {
                segments.push({ startY: match.topY, endY: match.topY + match.height, durationSec: match.durationSec });
            }
        });

        // Diagnóstico: abre la consola del navegador (F12) para ver exactamente qué calculó.
        console.log('[Teleprompter] Orden de la canción:', structureRaw);
        console.log('[Teleprompter] Anclas iniciales no mencionadas en el orden (se anteponen igual):', leadingUnused.map(a => a.label));
        console.log('[Teleprompter] Anclas detectadas (secciones + etiquetas internas):', anchors.map(a => ({ label: a.label, top: Math.round(a.topY), height: Math.round(a.height), durationSec: Math.round(a.durationSec) })));
        console.log('[Teleprompter] Plan final (segmentos a recorrer):', segments.map(s => ({ startY: Math.round(s.startY), endY: Math.round(s.endY), durationSec: Math.round(s.durationSec) })));
        console.log('[Teleprompter] Duración total estimada (seg):', Math.round(segments.reduce((sum, s) => sum + s.durationSec, 0)));

        return segments.length ? segments : null;
    },
    planTotalDuration() {
        if (!this.plan) return 0;
        return this.plan.reduce((sum, seg) => sum + (seg.durationSec || 0), 0);
    },
    elapsedToY(elapsedSec) {
        let remaining = elapsedSec;
        for (let i = 0; i < this.plan.length; i++) {
            const seg = this.plan[i];
            const dur = Math.max(0.01, seg.durationSec || 0.01);
            if (remaining <= dur || i === this.plan.length - 1) {
                const t = Math.min(Math.max(remaining / dur, 0), 1);
                return seg.startY + t * (seg.endY - seg.startY);
            }
            remaining -= dur;
        }
        return this.plan[this.plan.length - 1].endY;
    },
    yToElapsed(y) {
        let cumulative = 0;
        let best = { elapsed: 0, dist: Infinity };
        for (const seg of this.plan) {
            const dur = Math.max(0.01, seg.durationSec || 0.01);
            const lo = Math.min(seg.startY, seg.endY), hi = Math.max(seg.startY, seg.endY);
            if (y >= lo && y <= hi) {
                const t = (seg.endY === seg.startY) ? 0 : (y - seg.startY) / (seg.endY - seg.startY);
                return cumulative + Math.min(Math.max(t, 0), 1) * dur;
            }
            const dist = Math.min(Math.abs(y - seg.startY), Math.abs(y - seg.endY));
            if (dist < best.dist) best = { elapsed: cumulative + (y < lo ? 0 : dur), dist };
            cumulative += dur;
        }
        return best.elapsed;
    },

    updateToggleIcon() {
        const playIcon = document.getElementById('tp-icon-play');
        const pauseIcon = document.getElementById('tp-icon-pause');
        if (playIcon) playIcon.style.display = this.running ? 'none' : 'block';
        if (pauseIcon) pauseIcon.style.display = this.running ? 'block' : 'none';
    }
};

// ============ FRANJA DE ESTRUCTURA FLOTANTE (solo en pantalla completa) ============
// No usamos CSS "position: sticky" porque falla de forma silenciosa en algunos
// navegadores/webviews según el contexto de overflow de los contenedores padre.
// En su lugar, detectamos con un sensor invisible (IntersectionObserver) cuándo
// el scroll pasa el punto donde estaba la franja, y ahí la volvemos "position: fixed".
const StickyStructureBar = {
    observer: null,
    init() {
        const sentinel = document.getElementById('structure-bar-sentinel');
        const bar = document.getElementById('song-structure-bar');
        const spacer = document.getElementById('structure-bar-spacer');
        if (!sentinel || !bar || !spacer) return;
        if (this.observer) this.observer.disconnect();
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const shouldPin = AppState.fullscreenMode && bar.style.display !== 'none' && !entry.isIntersecting && entry.boundingClientRect.top < 0;
                if (shouldPin) {
                    if (!bar.classList.contains('pinned')) {
                        spacer.style.height = bar.offsetHeight + 'px';
                        bar.classList.add('pinned');
                    }
                    this.updateTopOffset();
                } else {
                    if (bar.classList.contains('pinned')) {
                        bar.classList.remove('pinned');
                        spacer.style.height = '0px';
                    }
                }
            });
        }, { threshold: 0 });
        this.observer.observe(sentinel);
    },
    // Calcula cuánto espacio libre debe dejar arriba: si hay cabecera visible (vista normal),
    // se coloca justo debajo de ella; en pantalla completa (sin cabecera), pegada arriba del todo.
    updateTopOffset() {
        const bar = document.getElementById('song-structure-bar');
        if (!bar) return;
        let topPx;
        if (AppState.fullscreenMode) {
            topPx = 8;
        } else {
            const header = document.querySelector('.header');
            topPx = (header ? header.getBoundingClientRect().height : 0) + 8;
        }
        document.documentElement.style.setProperty('--structure-bar-top', topPx + 'px');
    },
    reset() {
        const bar = document.getElementById('song-structure-bar');
        const spacer = document.getElementById('structure-bar-spacer');
        if (bar) bar.classList.remove('pinned');
        if (spacer) spacer.style.height = '0px';
    }
};

// ============ DESLIZAMIENTO HORIZONTAL DE LA FRANJA DE ESTRUCTURA ============
// A medida que el usuario baja por la letra, la franja de burbujas se desplaza
// de izquierda a derecha en proporción, para que las partes ya pasadas queden
// fuera de vista y se vea la parte actual y las siguientes como referencia.
const HorizontalStructureSync = {
    ticking: false,
    bound: false,
    bindOnce() {
        if (this.bound) return;
        this.bound = true;
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    },
    onScroll() {
        if (this.ticking) return;
        this.ticking = true;
        requestAnimationFrame(() => {
            this.update();
            this.ticking = false;
        });
    },
    update() {
        if (AppState.currentView !== 'song-reader') return;
        if (!AppState.fullscreenMode) return; // fuera de pantalla completa no se desliza sola
        const bar = document.getElementById('song-structure-bar');
        const inner = document.getElementById('structure-bar-inner');
        if (!bar || !inner || bar.style.display === 'none') return;
        const scrollableWidth = inner.scrollWidth - inner.clientWidth;
        if (scrollableWidth <= 0) return;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) { inner.scrollLeft = 0; return; }
        const progress = Math.min(1, Math.max(0, window.scrollY / docHeight));
        inner.scrollLeft = progress * scrollableWidth;
    }
};

// ============ HISTORIAL DE NAVEGACIÓN ============
const HistoryManager = {
    init() {
        // Solo se pone "repertorio" si de verdad no había nada antes (primera vez que
        // se abre la app). Si ya había un estado (ej. veníamos leyendo una canción antes
        // de recargar/deslizar para actualizar), se conserva tal cual — el navegador ya
        // lo guarda solo across reloads, el problema era que antes lo pisábamos siempre.
        if (!history.state) {
            history.replaceState({ view: 'repertorio' }, '', location.href);
        }
        window.addEventListener('popstate', (e) => this.handlePopState(e));
    },
    push(state) { history.pushState(state, '', location.href); },
    // Una vez que canciones y repertorios ya cargaron desde la nube, intenta reabrir
    // la vista que había antes de recargar la página (ej. al deslizar para actualizar).
    // Antes de eso no sirve de nada: la canción/repertorio referenciados todavía no
    // existen en AppState, así que no se podría encontrar.
    tryRestoreOnLoad() {
        if (this._restored) return;
        if (document.body.classList.contains('gated')) return; // aún en la pantalla de entrada
        if (!AppState.songsLoaded || !AppState.setlistsLoaded) return;
        this._restored = true;
        this.restoreFromState(history.state);
    },
    // Reconstruye la app a partir de un estado guardado (ya sea por "atrás/adelante"
    // del navegador, o al recargar la página con un estado previo).
    restoreFromState(state) {
        state = state || { view: 'repertorio' };
        if (AppState.fullscreenMode && !state.fullscreen) { Router.exitFullscreenMode(); return; }
        if (AppState.currentView === 'edicion' && AppState.currentSong) { Router.saveCurrentSong(); }

        if (state.view === 'song-reader' && state.songId) {
            if (state.setlistId) {
                const sl = AppState.setlists.find(s => s.id === state.setlistId);
                if (sl) AppState.currentSetlist = sl;
                Router.viewSetlistSong(state.songId, false);
            } else {
                Router.viewSong(state.songId, false);
            }
            if (state.fullscreen) {
                AppState.fullscreenMode = true;
                document.body.classList.add('fullscreen-active');
                FullscreenUI.show();
            }
        } else if (state.view === 'repertorio-detail' && state.setlistId) {
            const sl = AppState.setlists.find(s => s.id === state.setlistId);
            if (sl) { AppState.currentSetlist = sl; Router.navigate('repertorio-detail', false); }
            else { Router.navigate('repertorio', false); }
        } else {
            Router.navigate(state.view || 'repertorio', false);
        }
    },
    handlePopState(e) {
        // Si el editor a pantalla completa está abierto, "atrás" solo lo cierra.
        if (VersionEditor.handleBack()) return;
        this.restoreFromState(e.state);
    }
};


// ============ EDITOR A PANTALLA COMPLETA (versión propia en un repertorio) ============
const VersionEditor = {
    el: null,
    state: null,
    skipNextPop: false,
    FONT_KEY: 'repertia_version_editor_font',
    SNIPPETS: ['#', 'b', 'm', '7', 'sus4', 'sus2', 'add9', '/', 'maj7', 'dim'],
    SECTIONS: ['Intro', 'Estrofa', 'Pre-Coro', 'Coro', 'Puente', 'Instrumental', 'Final'],

    isOpen() { return !!this.el; },

    open({ song, setlist, transpose, hasVersion }) {
        if (this.el) this.close(true);
        const esc = (t) => Router.escapeHtml(t);
        const text = Router.sectionsToTextInKey(song.sections, transpose);
        const key = Transposer.cleanChord(Transposer.transpose(song.keyBase, transpose || 0));
        this.state = { initialText: text, transpose: transpose || 0 };

        const el = document.createElement('div');
        el.className = 'version-editor';
        el.innerHTML = `
            <div class="ve-bar">
                <button type="button" class="btn btn-sm" data-ve="cancel">Cancelar</button>
                <div class="ve-title">
                    <div class="ve-title-main">${esc(song.title)}</div>
                    <div class="ve-title-sub">Solo en «${esc(setlist.name)}» · tono ${esc(key)}</div>
                </div>
                <button type="button" class="btn btn-sm btn-primary" data-ve="save">Guardar</button>
            </div>
            <div class="ve-tools" aria-label="Atajos">
                ${this.SNIPPETS.map(t => `<button type="button" class="ve-chip" data-insert="${esc(t)}">${esc(t)}</button>`).join('')}
                <span class="ve-sep"></span>
                ${this.SECTIONS.map(t => `<button type="button" class="ve-chip ve-chip-section" data-section="${esc(t)}">${esc(t)}</button>`).join('')}
                <span class="ve-sep"></span>
                <button type="button" class="ve-chip" data-ve="smaller" aria-label="Letra más pequeña">A−</button>
                <button type="button" class="ve-chip" data-ve="bigger" aria-label="Letra más grande">A+</button>
            </div>
            <textarea class="ve-text" id="setlist-version-textarea" wrap="off" spellcheck="false"
                autocapitalize="off" autocorrect="off" autocomplete="off"></textarea>
            <div class="ve-foot">
                <span>Acordes en la línea de encima de la letra. Cada parte en su propia línea.</span>
                ${hasVersion ? `<button type="button" class="ve-link" data-ve="revert">Volver a la original</button>` : ''}
            </div>`;
        document.body.appendChild(el);
        document.body.classList.add('ve-open');
        this.el = el;
        const ta = el.querySelector('.ve-text');
        ta.value = text;
        this.applyFont();

        // Los atajos no deben quitar el foco del texto (si no, se cierra el teclado).
        el.querySelectorAll('.ve-chip').forEach(b => {
            b.addEventListener('pointerdown', (e) => e.preventDefault());
            b.addEventListener('mousedown', (e) => e.preventDefault());
        });
        el.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            if (btn.dataset.insert) return this.insert(btn.dataset.insert);
            if (btn.dataset.section) return this.insertSection(btn.dataset.section);
            const a = btn.dataset.ve;
            if (a === 'cancel') this.requestClose();
            else if (a === 'save') this.save();
            else if (a === 'revert') { this.close(); Router.revertSetlistVersion(); }
            else if (a === 'smaller') this.changeFont(-1);
            else if (a === 'bigger') this.changeFont(1);
        });

        // El teclado del móvil no debe tapar el texto: el editor se ajusta al
        // espacio que queda visible.
        this.onViewport = () => {
            if (!this.el || !window.visualViewport) return;
            this.el.style.height = window.visualViewport.height + 'px';
            this.el.style.top = window.visualViewport.offsetTop + 'px';
        };
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', this.onViewport);
            window.visualViewport.addEventListener('scroll', this.onViewport);
            this.onViewport();
        }

        // El botón "atrás" del móvil cierra el editor en vez de salir de la canción.
        HistoryManager.push({ ...(history.state || {}), versionEditor: true });
    },

    // Escribe el texto donde está el cursor.
    insert(snippet) {
        const ta = this.el && this.el.querySelector('.ve-text');
        if (!ta) return;
        const start = ta.selectionStart, end = ta.selectionEnd;
        ta.setRangeText(snippet, start, end, 'end');
        ta.focus();
    },

    // Añade el nombre de una parte en una línea propia.
    insertSection(name) {
        const ta = this.el && this.el.querySelector('.ve-text');
        if (!ta) return;
        const pos = ta.selectionStart;
        const before = ta.value.slice(0, pos);
        const lineStart = before.lastIndexOf('\n') + 1;
        const atLineStart = pos === lineStart;
        const prefix = atLineStart ? '' : '\n';
        ta.setRangeText(`${prefix}${name}\n`, pos, ta.selectionEnd, 'end');
        ta.focus();
    },

    fontSize() {
        let v = 16;
        try { v = parseInt(localStorage.getItem(this.FONT_KEY), 10) || 16; } catch (e) { }
        return Math.max(12, Math.min(24, v));
    },
    applyFont() {
        const ta = this.el && this.el.querySelector('.ve-text');
        // 16 px por defecto. Si se elige menos, en iPhone la pantalla puede
        // acercarse sola al tocar el texto (se aleja pellizcando).
        if (ta) ta.style.fontSize = this.fontSize() + 'px';
    },
    changeFont(delta) {
        const v = Math.max(12, Math.min(24, this.fontSize() + delta));
        try { localStorage.setItem(this.FONT_KEY, String(v)); } catch (e) { }
        this.applyFont();
    },

    hasChanges() {
        const ta = this.el && this.el.querySelector('.ve-text');
        return !!(ta && this.state && ta.value !== this.state.initialText);
    },

    requestClose() {
        if (this.hasChanges() && !confirm('¿Salir sin guardar? Se perderán los cambios.')) return false;
        this.close();
        return true;
    },

    save() {
        const ta = this.el && this.el.querySelector('.ve-text');
        if (!ta || !this.state) return;
        const ok = Router.saveSetlistVersion(ta.value, this.state.transpose, this.state.initialText);
        if (ok) this.close();
    },

    // fromPop: se cierra porque el usuario pulsó "atrás" (el historial ya retrocedió).
    close(fromPop) {
        if (!this.el) return;
        if (window.visualViewport && this.onViewport) {
            window.visualViewport.removeEventListener('resize', this.onViewport);
            window.visualViewport.removeEventListener('scroll', this.onViewport);
        }
        this.el.remove();
        this.el = null;
        this.state = null;
        document.body.classList.remove('ve-open');
        if (!fromPop && history.state && history.state.versionEditor) {
            this.skipNextPop = true;
            history.back();
        }
    },

    // Llamado desde el historial al pulsar "atrás". Devuelve true si lo gestionó.
    handleBack() {
        if (this.skipNextPop) { this.skipNextPop = false; return true; }
        if (!this.el) return false;
        if (this.hasChanges() && !confirm('¿Salir sin guardar? Se perderán los cambios.')) {
            HistoryManager.push({ ...(history.state || {}), versionEditor: true });
            return true;
        }
        this.close(true);
        return true;
    }
};

// Estado global
const AppState = {
    currentView: 'canciones',
    currentSong: null,
    editingSongId: null,
    songs: [],
    setlists: [],
    currentSetlist: null,
    cameFromSetlistId: null,
    currentTranspose: 0,
    baseTransposeOffset: 0,
    notationMode: 'chords',
    voiceMode: false,
    fullscreenMode: false,
    isSaving: false,
    lastSaveTime: 0,
    settings: { fontSize: 14, autoSections: true, sortBy: 'alpha', readerFontScale: 1 },
    isCreatingNew: false,
    setlistEditMode: false,
    searchQuery: '',
    pendingImports: [],
    isAdmin: false,
    currentUser: null,
    songsLoaded: false,
    songsFromCloud: false,
    setlistsLoaded: false,
    vocalProfiles: {},
    vocalProfilesLoaded: false,
    teamId: null,       // equipo al que pertenece quien usa la app
    team: null,         // { name, inviteCode, leaderUid }
    member: null,       // su propia ficha dentro del equipo (nombre, rol)
    members: []         // todas las personas del equipo
};

// ============ PERMISOS ============
// Quién puede hacer qué dentro del equipo. Todo pasa por aquí para que la
// pantalla y el guardado usen siempre la misma regla (y coinciden con las
// reglas de Firestore, que son las que de verdad lo impiden en la nube).
//   - Líder: quien creó el equipo. Gestiona todos los repertorios y el equipo.
//   - Director técnico: lo nombra el líder. Crea repertorios y gestiona los suyos.
//   - Miembro: usa todas las funciones; lo que cambie se queda en su pantalla.
const Perm = {
    uid() { return AppState.currentUser ? AppState.currentUser.uid : null; },
    role() { return AppState.member ? AppState.member.role : null; },
    isLeader() { return this.role() === 'lider'; },
    isDirector() { return this.role() === 'director'; },
    canCreateSetlist() { return this.isLeader() || this.isDirector(); },
    canEditSetlist(sl) {
        if (!sl) return false;
        return this.isLeader() || (!!sl.createdBy && sl.createdBy === this.uid());
    },
    roleLabel(role) {
        return role === 'lider' ? 'Coordinador' : role === 'director' ? 'Director técnico' : 'Integrante';
    }
};

// Storage
const Storage = {
    SETTINGS_KEY: 'betania_settings_v4',
    // Copia en el propio móvil de lo último que llegó de la nube. Sirve para dos
    // cosas: que la app abra con contenido al instante, y que siga siendo útil
    // sin conexión (el escenario donde falla el wifi de la iglesia).
    CACHE_SONGS: 'repertia_cache_songs_v2',
    CACHE_SETLISTS_PREFIX: 'repertia_cache_setlists_',
    CACHE_VOCALS: 'repertia_cache_vocalprofiles',
    CACHE_SESSION: 'repertia_session',
    songsUnsub: null,
    setlistsUnsub: null,
    vocalProfilesUnsub: null,

    // Guardado "con espera" de los repertorios: la pantalla cambia al instante,
    // la subida a la nube espera a que pase un segundo sin tocar nada.
    // Hay un reloj por repertorio (cada uno es su propio documento).
    SETLISTS_SAVE_DELAY_MS: 1000,
    saveTimers: {},

    songsRef() { return db.collection('songs'); },
    setlistsRef() { return db.collection('teams').doc(AppState.teamId).collection('setlists'); },

    // Firestore no acepta valores "undefined": se limpian antes de guardar.
    clean(obj) { return JSON.parse(JSON.stringify(obj)); },

    // ---- Canciones (catálogo común, solo el administrador escribe) ----
    // Cada canción es su propio documento. Se suben por lotes para ir rápido.
    async saveSongs(list) {
        if (!AppState.isAdmin) return false;
        const songs = this.deduplicateSongs(list || []);
        if (!songs.length) return true;
        try {
            for (let i = 0; i < songs.length; i += 400) {
                const batch = db.batch();
                songs.slice(i, i + 400).forEach(s => batch.set(this.songsRef().doc(s.id), this.clean(s)));
                await batch.commit();
            }
            this.updateSaveStatus('saved');
            return true;
        } catch (err) {
            console.error(err);
            alert('Error al guardar: ' + err.message);
            return false;
        }
    },
    saveSong(song) { return this.saveSongs([song]); },
    deleteSong(songId) {
        if (!AppState.isAdmin) return Promise.resolve();
        return this.songsRef().doc(songId).delete()
            .catch(err => { console.error(err); alert('No se pudo borrar la canción: ' + err.message); });
    },

    listenSongs(callback) {
        if (this.songsUnsub) this.songsUnsub();
        this.songsUnsub = this.songsRef().onSnapshot(snap => {
            AppState.songs = snap.docs.map(d => d.data());
            // Solo cuenta como "de la nube" si viene del servidor, no de la copia
            // local de Firestore (sin conexión podría estar incompleta).
            AppState.songsFromCloud = !snap.metadata.fromCache;
            this.guardarCache(this.CACHE_SONGS, AppState.songs);
            if (callback) callback();
        }, err => {
            console.error('Canciones:', err);
            // Equipo todavía sin aprobar: la nube no deja leer el catálogo.
            if (err.code === 'permission-denied') {
                AppState.songs = [];
                AppState.songsFromCloud = false;
                if (callback) callback();
            }
        });
    },

    // ---- Repertorios (privados de cada equipo, uno por documento) ----
    // Solo se sube si quien lo cambia tiene permiso (creador o líder). Para el
    // resto, lo que toquen se queda solo en su pantalla.
    saveSetlist(sl) {
        if (!sl || !AppState.teamId || !Perm.canEditSetlist(sl)) return false;
        this.cancelSetlistTimer(sl.id);
        this.cleanOrphans(sl);
        this.setlistsRef().doc(sl.id).set(this.clean(sl))
            .catch(err => { console.error(err); alert('No se pudo guardar el repertorio: ' + err.message); });
        return true;
    },
    // Guarda el repertorio que está abierto (casi todos los cambios son sobre ese).
    saveSetlists() { return this.saveSetlist(AppState.currentSetlist); },

    scheduleSetlistsSave() {
        const sl = AppState.currentSetlist;
        if (!sl || !Perm.canEditSetlist(sl)) return;
        const id = sl.id;
        this.cancelSetlistTimer(id);
        this.saveTimers[id] = setTimeout(() => {
            delete this.saveTimers[id];
            this.saveSetlist(AppState.setlists.find(s => s.id === id) || sl);
        }, this.SETLISTS_SAVE_DELAY_MS);
    },
    cancelSetlistTimer(id) {
        if (this.saveTimers[id]) { clearTimeout(this.saveTimers[id]); delete this.saveTimers[id]; }
    },
    // Si hay guardados esperando, los hace ya (al esconder o cerrar la app).
    flushSetlistsSave() {
        Object.keys(this.saveTimers).forEach(id => {
            const sl = AppState.setlists.find(s => s.id === id);
            if (sl) this.saveSetlist(sl); else this.cancelSetlistTimer(id);
        });
    },
    deleteSetlist(setlistId) {
        this.cancelSetlistTimer(setlistId);
        return this.setlistsRef().doc(setlistId).delete()
            .catch(err => { console.error(err); alert('No se pudo borrar el repertorio: ' + err.message); });
    },

    // Quita del repertorio lo que apunte a canciones que ya no existen (notas,
    // voz, tono, orden). Seguridad: si las canciones no han llegado bien de la
    // nube, no toca nada — un fallo de carga no puede borrar datos.
    cleanOrphans(sl) {
        if (!sl || !AppState.songsFromCloud || !AppState.songs.length) return;
        const existing = new Set(AppState.songs.map(s => s.id));
        sl.songIds = (sl.songIds || []).filter(id => existing.has(id));
        ['songNotes', 'songLeadVocals', 'songTransposeOverrides', 'songStructures', 'songVersions'].forEach(field => {
            const map = sl[field];
            if (!map) return;
            Object.keys(map).forEach(id => { if (!existing.has(id)) delete map[id]; });
        });
    },

    listenSetlists(callback) {
        if (this.setlistsUnsub) this.setlistsUnsub();
        this.setlistsUnsub = this.setlistsRef().onSnapshot(snap => {
            // Si tenemos un cambio propio esperando a subirse en algún repertorio,
            // conservamos NUESTRA versión de ese hasta que se suba (si no, la de la
            // nube lo borraría de la memoria antes de guardarse).
            const pending = new Set(Object.keys(this.saveTimers));
            AppState.setlists = snap.docs.map(d => {
                const data = d.data();
                if (pending.has(data.id)) return AppState.setlists.find(s => s.id === data.id) || data;
                return data;
            });
            this.guardarCache(this.CACHE_SETLISTS_PREFIX + AppState.teamId, AppState.setlists);
            // Si había un repertorio abierto, lo reapuntamos al objeto nuevo.
            if (AppState.currentSetlist) {
                const fresh = AppState.setlists.find(s => s.id === AppState.currentSetlist.id);
                if (fresh) AppState.currentSetlist = fresh;
            }
            if (callback) callback();
        }, err => console.error('Repertorios:', err));
    },

    // ---- Perfiles de voz (en pausa; se mantienen como estaban) ----
    saveVocalProfiles() {
        try {
            db.collection('appdata').doc('vocalProfiles').set({ profiles: AppState.vocalProfiles })
                .catch(err => { console.error(err); alert('Error al guardar: ' + err.message); });
            return true;
        } catch (error) { console.error(error); return false; }
    },

    listenVocalProfiles(callback) {
        if (this.vocalProfilesUnsub) this.vocalProfilesUnsub();
        this.vocalProfilesUnsub = db.collection('appdata').doc('vocalProfiles').onSnapshot(doc => {
            AppState.vocalProfiles = doc.exists ? (doc.data().profiles || {}) : {};
            this.guardarCache(this.CACHE_VOCALS, AppState.vocalProfiles);
            if (callback) callback();
        }, err => { console.error('Perfiles de voz:', err); if (callback) callback(); });
    },

    stopListening() {
        [this.songsUnsub, this.setlistsUnsub, this.vocalProfilesUnsub].forEach(u => { if (u) u(); });
        this.songsUnsub = this.setlistsUnsub = this.vocalProfilesUnsub = null;
        Object.keys(this.saveTimers).forEach(id => this.cancelSetlistTimer(id));
    },

    leerCache(clave) {
        try { const raw = localStorage.getItem(clave); return raw ? JSON.parse(raw) : null; }
        catch (e) { return null; }
    },
    guardarCache(clave, valor) {
        try { localStorage.setItem(clave, JSON.stringify(valor)); }
        catch (e) { /* almacenamiento lleno o bloqueado: seguimos sin copia */ }
    },
    borrarCache(clave) {
        try { localStorage.removeItem(clave); } catch (e) { }
    },

    // Pinta lo último conocido enseguida (antes de que responda la nube).
    cargarDesdeCache(teamId) {
        const songs = this.leerCache(this.CACHE_SONGS);
        if (Array.isArray(songs) && songs.length) { AppState.songs = songs; AppState.songsLoaded = true; }
        const setlists = teamId ? this.leerCache(this.CACHE_SETLISTS_PREFIX + teamId) : null;
        if (Array.isArray(setlists)) { AppState.setlists = setlists; AppState.setlistsLoaded = true; }
        const vocals = this.leerCache(this.CACHE_VOCALS);
        if (vocals && typeof vocals === 'object') { AppState.vocalProfiles = vocals; AppState.vocalProfilesLoaded = true; }
    },

    saveSettings() {
        try { localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(AppState.settings)); }
        catch (error) { console.error(error); }
    },

    loadSettings() {
        try {
            const data = localStorage.getItem(this.SETTINGS_KEY);
            if (data) AppState.settings = { ...AppState.settings, ...JSON.parse(data) };
        } catch (error) { console.error(error); }
    },

    updateSaveStatus(status) {
        const indicator = document.getElementById('save-indicator');
        if (indicator) {
            indicator.textContent = status === 'saved' ? 'Guardado' : 'Sin guardar';
            indicator.className = `save-indicator ${status === 'saved' ? '' : 'unsaved'}`;
        }
    },

    deduplicateSongs(songs) {
        const map = new Map();
        songs.forEach(song => { if (song && song.id) map.set(song.id, song); });
        return Array.from(map.values());
    }
};

// ============ EQUIPO ============
// Cada persona pertenece a un solo equipo. El líder lo crea y la app le da un
// código (ej. BETA-4821) que los demás escriben una vez para entrar.
//
// En Firestore:
//   teams/{id}                  nombre, código de invitación, líder
//   teams/{id}/members/{uid}    nombre, email, rol (lider / director / miembro)
//   teams/{id}/setlists/{id}    los repertorios del equipo
//   inviteCodes/{código}        para encontrar el equipo a partir del código
//   users/{uid}                 en qué equipo está cada persona
const Team = {
    teamUnsub: null,
    membersUnsub: null,

    teamRef(teamId) { return db.collection('teams').doc(teamId || AppState.teamId); },
    membersRef(teamId) { return this.teamRef(teamId).collection('members'); },

    // Busca en qué equipo está la persona que acaba de entrar.
    // Devuelve { teamId, removedFrom } — removedFrom si la sacaron de su equipo.
    async resolve(user) {
        try {
            const u = await db.collection('users').doc(user.uid).get();
            const teamId = u.exists ? (u.data().teamId || null) : null;
            if (!teamId) return { teamId: null };
            const m = await this.membersRef(teamId).doc(user.uid).get();
            if (!m.exists) {
                // El líder la sacó del equipo: se libera para poder unirse a otro.
                await db.collection('users').doc(user.uid).set({ teamId: null }, { merge: true }).catch(() => { });
                Storage.borrarCache(Storage.CACHE_SESSION);
                return { teamId: null, removedFrom: teamId };
            }
            return { teamId };
        } catch (err) {
            // Sin conexión: usamos lo último conocido en este móvil.
            const s = Storage.leerCache(Storage.CACHE_SESSION);
            if (s && s.uid === user.uid && s.teamId) return { teamId: s.teamId, offline: true };
            throw err;
        }
    },

    // Empieza a escuchar el equipo, sus miembros y todos los datos.
    start(teamId) {
        this.stop();
        AppState.teamId = teamId;
        const s = Storage.leerCache(Storage.CACHE_SESSION);
        if (s && s.teamId === teamId) {
            AppState.team = s.team || null;
            AppState.member = s.member || null;
            AppState.members = s.members || [];
        }
        Storage.cargarDesdeCache(teamId);

        this.teamUnsub = this.teamRef(teamId).onSnapshot(doc => {
            const wasApproved = AppState.team ? AppState.team.approved === true : undefined;
            AppState.team = doc.exists ? { id: doc.id, ...doc.data() } : null;
            // Si el administrador acaba de aprobar el equipo, se vuelve a pedir
            // el catálogo (antes la nube lo negaba) para que aparezca sin recargar.
            if (wasApproved === false && AppState.team && AppState.team.approved === true) this.listenCatalog();
            this.saveSession();
            Auth.updateUI();
            if (AppState.currentView === 'equipo') Router.renderTeamView();
        }, err => { console.error('Equipo:', err); this.checkStillMember(err); });

        this.membersUnsub = this.membersRef(teamId).onSnapshot(snap => {
            AppState.members = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
            const me = AppState.members.find(m => m.uid === Perm.uid());
            if (!me && !snap.metadata.fromCache) { this.onRemoved(); return; }
            AppState.member = me || AppState.member;
            this.saveSession();
            Auth.updateUI();
            if (AppState.currentView === 'equipo') Router.renderTeamView();
        }, err => { console.error('Miembros:', err); this.checkStillMember(err); });

        this.listenCatalog();
        Storage.listenSetlists(() => {
            AppState.setlistsLoaded = true;
            SplashManager.checkReady();
            if (AppState.currentView === 'repertorio') Router.renderSetlistsList();
            if (AppState.currentView === 'repertorio-detail') Router.renderSetlistDetail();
            HistoryManager.tryRestoreOnLoad();
        });
    },

    // Catálogo de canciones y perfiles de voz (no dependen del equipo).
    listenCatalog() {
        Storage.listenSongs(() => {
            AppState.songsLoaded = true;
            SplashManager.checkReady();
            if (AppState.currentView === 'canciones') Router.renderSongsList();
            if (AppState.currentView === 'repertorio') Router.renderSetlistsList();
            if (AppState.currentView === 'repertorio-detail') Router.renderSetlistDetail();
            HistoryManager.tryRestoreOnLoad();
        });
        Storage.listenVocalProfiles(() => {
            AppState.vocalProfilesLoaded = true;
            SplashManager.checkReady();
        });
    },

    // Solo para el administrador: entra a la app aunque no esté en ningún
    // equipo, porque el catálogo de canciones es suyo. Sin equipo no hay
    // repertorios; Repertorio y Equipo le muestran un aviso para unirse.
    startNoTeam() {
        this.stop();
        // Sin equipo no hay repertorios: si al recargar tocaba volver a uno, se
        // abre Canciones en su lugar.
        const st = history.state;
        if (!st || ['repertorio', 'repertorio-detail', 'equipo'].includes(st.view) || st.setlistId) {
            history.replaceState({ view: 'canciones' }, '', location.href);
        }
        Storage.cargarDesdeCache(null);
        AppState.setlists = [];
        AppState.setlistsLoaded = true;
        this.listenCatalog();
    },

    stop() {
        if (this.teamUnsub) this.teamUnsub();
        if (this.membersUnsub) this.membersUnsub();
        this.teamUnsub = this.membersUnsub = null;
        Storage.stopListening();
        AppState.teamId = null;
        AppState.team = null;
        AppState.member = null;
        AppState.members = [];
        AppState.setlists = [];
        AppState.currentSetlist = null;
    },

    saveSession() {
        if (!AppState.currentUser || !AppState.teamId) return;
        Storage.guardarCache(Storage.CACHE_SESSION, {
            uid: AppState.currentUser.uid,
            teamId: AppState.teamId,
            team: AppState.team,
            member: AppState.member,
            members: AppState.members
        });
    },

    // Cuando a alguien lo sacan del equipo, Firestore deja de darle permiso y
    // la escucha falla con un error (en vez de avisar de que ya no está).
    // Ante ese error comprobamos su propia ficha: si ya no existe, lo sacamos.
    async checkStillMember(err) {
        if (!err || err.code !== 'permission-denied' || !AppState.teamId || !AppState.currentUser) return;
        try {
            const m = await this.membersRef().doc(AppState.currentUser.uid).get();
            if (!m.exists) this.onRemoved();
        } catch (e) { console.error(e); }
    },

    // Antes de crear o unirse a un equipo: si la ficha dice que está en uno pero
    // ya no figura en él (lo sacaron), la deja libre. Si sigue dentro, avisa.
    async ensureFree() {
        const uid = AppState.currentUser.uid;
        const u = await db.collection('users').doc(uid).get();
        const teamId = u.exists ? u.data().teamId : null;
        if (!teamId) return;
        const m = await this.membersRef(teamId).doc(uid).get();
        if (m.exists) throw new Error('Ya perteneces a un equipo. Sal de él antes de unirte a otro.');
        await db.collection('users').doc(uid).set({ teamId: null }, { merge: true });
    },

    // Nos sacaron del equipo mientras teníamos la app abierta.
    onRemovedRunning: false,
    async onRemoved() {
        if (this.onRemovedRunning) return;
        this.onRemovedRunning = true;
        setTimeout(() => { this.onRemovedRunning = false; }, 2000);
        const teamName = AppState.team ? AppState.team.name : 'el equipo';
        this.stop();
        Storage.borrarCache(Storage.CACHE_SESSION);
        if (AppState.currentUser) {
            await db.collection('users').doc(AppState.currentUser.uid).set({ teamId: null }, { merge: true }).catch(() => { });
        }
        Gate.show('onboarding', `Ya no formas parte de "${teamName}". Puedes unirte a otro equipo con su código.`);
    },

    // Código a partir del nombre: 4 letras + 4 números (ej. "Betania Manresa" -> BETA-4821).
    makeCode(teamName) {
        const letters = ChordParser.normalizeTildes(teamName || '')
            .toUpperCase()
            .replace(/Ñ/g, 'N')
            .replace(/[^A-Z]/g, '');
        const base = (letters + 'XXXX').slice(0, 4);
        const num = String(Math.floor(1000 + Math.random() * 9000));
        return `${base}-${num}`;
    },

    // Acepta el código escrito de cualquier manera: "beta 4821", "BETA4821"...
    normalizeCode(raw) {
        const clean = (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (clean.length !== 8) return null;
        return `${clean.slice(0, 4)}-${clean.slice(4)}`;
    },

    async create(teamName, displayName) {
        const user = AppState.currentUser;
        await this.ensureFree();
        const teamId = db.collection('teams').doc().id;
        // Si por casualidad el código ya existe, Firestore rechaza la escritura
        // y probamos con otros números.
        let lastErr = null;
        for (let attempt = 0; attempt < 5; attempt++) {
            const code = this.makeCode(teamName);
            const batch = db.batch();
            batch.set(this.teamRef(teamId), {
                name: teamName,
                inviteCode: code,
                leaderUid: user.uid,
                leaderName: displayName,
                approved: false,   // lo aprueba el administrador
                createdAt: new Date().toISOString()
            });
            batch.set(db.collection('inviteCodes').doc(code), { teamId, teamName });
            batch.set(this.membersRef(teamId).doc(user.uid), {
                name: displayName,
                email: user.email || '',
                role: 'lider',
                joinedAt: new Date().toISOString()
            });
            batch.set(db.collection('users').doc(user.uid), { teamId, name: displayName });
            try {
                await batch.commit();
                return teamId;
            } catch (err) {
                lastErr = err;
                if (err.code !== 'permission-denied') break;
            }
        }
        throw lastErr;
    },

    async join(rawCode, displayName) {
        const user = AppState.currentUser;
        const code = this.normalizeCode(rawCode);
        if (!code) throw new Error('El código tiene 4 letras y 4 números, por ejemplo ABCD-1234.');
        const c = await db.collection('inviteCodes').doc(code).get();
        if (!c.exists) throw new Error('Ese código no existe o ya no es válido. Pídele al coordinador de tu equipo el código actual.');
        const { teamId } = c.data();
        await this.ensureFree();
        const batch = db.batch();
        batch.set(this.membersRef(teamId).doc(user.uid), {
            name: displayName,
            email: user.email || '',
            role: 'miembro',
            joinCode: code,
            joinedAt: new Date().toISOString()
        });
        batch.set(db.collection('users').doc(user.uid), { teamId, name: displayName });
        await batch.commit();
        return teamId;
    },

    // El líder genera un código nuevo: el anterior deja de servir para entrar,
    // pero quien ya está dentro sigue dentro.
    async regenerateCode() {
        if (!Perm.isLeader() || !AppState.team) return;
        const old = AppState.team.inviteCode;
        let lastErr = null;
        for (let attempt = 0; attempt < 5; attempt++) {
            const code = this.makeCode(AppState.team.name);
            const batch = db.batch();
            if (old) batch.delete(db.collection('inviteCodes').doc(old));
            batch.set(db.collection('inviteCodes').doc(code), { teamId: AppState.teamId, teamName: AppState.team.name });
            batch.update(this.teamRef(), { inviteCode: code });
            try { await batch.commit(); return code; }
            catch (err) { lastErr = err; if (err.code !== 'permission-denied') break; }
        }
        throw lastErr;
    },

    // El líder cede el puesto a otro integrante. Todo en un solo paso: el
    // equipo apunta al nuevo líder, este pasa a "lider" y el anterior queda
    // como director técnico (y ya podría salir del equipo si quiere).
    async transferLeadership(newUid) {
        const me = Perm.uid();
        if (!Perm.isLeader() || !newUid || newUid === me) return;
        const batch = db.batch();
        const newLeader = AppState.members.find(m => m.uid === newUid);
        batch.update(this.teamRef(), { leaderUid: newUid, leaderName: newLeader ? (newLeader.name || '') : '' });
        batch.update(this.membersRef().doc(newUid), { role: 'lider' });
        batch.update(this.membersRef().doc(me), { role: 'director' });
        await batch.commit();
    },

    setRole(uid, role) {
        if (!Perm.isLeader() || uid === Perm.uid()) return Promise.resolve();
        return this.membersRef().doc(uid).update({ role });
    },

    removeMember(uid) {
        if (!Perm.isLeader() || uid === Perm.uid()) return Promise.resolve();
        return this.membersRef().doc(uid).delete();
    },

    renameSelf(name) {
        return this.membersRef().doc(Perm.uid()).update({ name });
    },

    async leave() {
        if (Perm.isLeader()) return;
        const uid = Perm.uid();
        const batch = db.batch();
        batch.delete(this.membersRef().doc(uid));
        batch.set(db.collection('users').doc(uid), { teamId: null }, { merge: true });
        await batch.commit();
    },

    // Equipo creado pero todavía sin aprobar por el administrador.
    isPending() {
        return !!(AppState.teamId && AppState.team && AppState.team.approved !== true);
    },

    // Nombres de las personas del equipo (para voz líder y convocatoria).
    memberNames() {
        return (AppState.members || [])
            .map(m => (m.name || '').trim())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    }
};

// ============ PANTALLAS DE ENTRADA ============
// Antes de ver la app hay que entrar con Google ("login") y pertenecer a un
// equipo ("onboarding"). Mientras tanto la app queda bloqueada ("gated").
const Gate = {
    current: 'loading',
    show(name, message) {
        this.current = name;
        const gated = name !== 'app';
        document.body.classList.toggle('gated', gated);
        if (gated) {
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            const target = document.getElementById(`view-${name}`);
            if (target) target.classList.add('active');
            if (name === 'onboarding') this.prepareOnboarding(message);
            if (name === 'login') this.setMessage('login-message', message || '');
            SplashManager.hide();
            return;
        }
        Auth.updateUI();
        Router.navigate('repertorio', false);
        HistoryManager.tryRestoreOnLoad();
    },
    setMessage(id, text, isError) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = text || '';
        el.classList.toggle('error', !!isError);
    },
    // El título es neutro (sin saludar por el nombre). El campo del nombre se
    // rellena con el nombre de pila de la cuenta de Google de cada persona, pero
    // se puede cambiar: es como le verá el resto del equipo.
    prepareOnboarding(message) {
        const user = AppState.currentUser;
        const first = user && user.displayName ? user.displayName.trim().split(/\s+/)[0] : '';
        const nameInput = document.getElementById('onb-name');
        if (nameInput && !nameInput.value) nameInput.value = first;
        const back = document.getElementById('btn-onb-back');
        if (back) back.style.display = AppState.isAdmin ? 'inline-flex' : 'none';
        const email = document.getElementById('onb-email');
        if (email) email.textContent = user ? (user.email || '') : '';
        this.setMessage('onb-message', message || '', false);
    },
    bindButtons() {
        Router.bindButton('btn-google-login', () => Auth.signIn());
        Router.bindButton('btn-onb-logout', () => Auth.signOut());
        Router.bindButton('btn-onb-back', () => this.backToAppAsAdmin());
        Router.bindButton('btn-join-team', () => this.handleJoin());
        Router.bindButton('btn-create-team', () => this.handleCreate());
    },
    // El administrador puede volver a la app sin unirse a ningún equipo.
    backToAppAsAdmin() {
        if (!AppState.isAdmin) return;
        Team.startNoTeam();
        this.show('app');
        Router.navigate('canciones', false);
    },
    goToOnboarding() {
        this.show('onboarding');
    },
    readName() {
        const name = (document.getElementById('onb-name').value || '').trim();
        if (!name) { this.setMessage('onb-message', 'Escribe tu nombre (así te verá el resto del equipo).', true); return null; }
        return name;
    },
    setBusy(busy) {
        ['btn-join-team', 'btn-create-team'].forEach(id => {
            const b = document.getElementById(id);
            if (b) b.disabled = busy;
        });
    },
    async handleJoin() {
        const name = this.readName();
        if (!name) return;
        const code = document.getElementById('onb-code').value;
        this.setBusy(true);
        this.setMessage('onb-message', 'Entrando en el equipo...');
        try {
            const teamId = await Team.join(code, name);
            Team.start(teamId);
            this.show('app');
        } catch (err) {
            console.error(err);
            const msg = err.code === 'permission-denied'
                ? 'No se pudo entrar: el código no es válido o ya perteneces a otro equipo.'
                : err.message;
            this.setMessage('onb-message', msg, true);
        } finally { this.setBusy(false); }
    },
    async handleCreate() {
        const name = this.readName();
        if (!name) return;
        const teamName = (document.getElementById('onb-team-name').value || '').trim();
        if (!teamName) { this.setMessage('onb-message', 'Escribe el nombre del equipo (el que verán todos sus integrantes).', true); return; }
        this.setBusy(true);
        this.setMessage('onb-message', 'Creando el equipo...');
        try {
            const teamId = await Team.create(teamName, name);
            Team.start(teamId);
            this.show('app');
            Router.navigate('equipo');
        } catch (err) {
            console.error(err);
            this.setMessage('onb-message', 'No se pudo crear el equipo: ' + err.message, true);
        } finally { this.setBusy(false); }
    }
};

// ============ APROBACIÓN DE EQUIPOS (solo administrador) ============
// Los equipos nuevos nacen pendientes y no ven el catálogo hasta que el
// administrador los aprueba. El botón "🛡️ Equipos" muestra cuántos esperan.
const AdminTeams = {
    unsub: null,
    teams: [],
    watch() {
        if (this.unsub) return;
        this.unsub = db.collection('teams').onSnapshot(snap => {
            this.teams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            this.updateButton();
            if (document.getElementById('admin-teams-list')) this.renderList();
        }, err => console.error('Equipos (admin):', err));
    },
    unwatch() {
        if (this.unsub) this.unsub();
        this.unsub = null;
        this.teams = [];
    },
    pendingCount() { return this.teams.filter(t => t.approved !== true).length; },
    updateButton() {
        const btn = document.getElementById('btn-admin-teams');
        if (!btn) return;
        const n = this.pendingCount();
        btn.textContent = n ? `🛡️ Equipos (${n} pendiente${n === 1 ? '' : 's'})` : '🛡️ Equipos';
        btn.classList.toggle('btn-attention', n > 0);
    },
    open() {
        if (!AppState.isAdmin) return;
        Router.createModal({
            title: 'Equipos',
            content: `<p class="team-hint" style="margin-top:0;">Un equipo pendiente no ve ninguna canción hasta que lo apruebes. Puedes retirar la aprobación en cualquier momento.</p>
                <div id="admin-teams-list"></div>`,
            actions: [{ text: 'Cerrar', primary: true, action: () => Router.closeModal() }]
        });
        this.renderList();
    },
    renderList() {
        const el = document.getElementById('admin-teams-list');
        if (!el) return;
        const esc = (t) => Router.escapeHtml(t);
        const teams = [...this.teams].sort((a, b) =>
            ((a.approved === true) - (b.approved === true)) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
        if (!teams.length) { el.innerHTML = '<p class="team-hint">Todavía no hay ningún equipo.</p>'; return; }
        el.innerHTML = teams.map(t => {
            const ok = t.approved === true;
            const date = Router.formatShortDate(t.createdAt);
            return `
                <div class="team-member">
                    <div class="team-member-info">
                        <div class="team-member-name">${esc(t.name || '(sin nombre)')}</div>
                        <div class="team-member-meta">
                            <span class="role-badge ${ok ? 'role-approved' : 'role-pending'}">${ok ? 'Aprobado' : 'Pendiente'}</span>
                            <span class="team-member-email">${t.leaderName ? 'Coordinador: ' + esc(t.leaderName) : ''}${date ? ' · ' + esc(date) : ''}</span>
                        </div>
                    </div>
                    <div class="team-member-actions">
                        ${ok
                            ? `<button class="btn btn-sm btn-danger-outline" onclick="AdminTeams.setApproved('${t.id}', false)">Retirar aprobación</button>`
                            : `<button class="btn btn-sm btn-primary" onclick="AdminTeams.setApproved('${t.id}', true)">Aprobar</button>`}
                    </div>
                </div>`;
        }).join('');
    },
    async setApproved(teamId, value) {
        if (!AppState.isAdmin) return;
        const t = this.teams.find(x => x.id === teamId);
        if (!value && !confirm(`¿Retirar la aprobación a "${t ? t.name : 'este equipo'}"? Dejarán de ver las canciones hasta que lo vuelvas a aprobar.`)) return;
        try { await db.collection('teams').doc(teamId).update({ approved: value }); }
        catch (err) { console.error(err); alert('No se pudo cambiar: ' + err.message); }
    }
};

// Autenticación
const Auth = {
    init() {
        // Vuelta del inicio de sesión por redirección (iPhone con la app instalada).
        firebase.auth().getRedirectResult().catch(err => {
            console.error(err);
            Gate.setMessage('login-message', 'No se pudo iniciar sesión: ' + err.message, true);
        });

        firebase.auth().onAuthStateChanged(async user => {
            // Las sesiones anónimas de la versión anterior ya no sirven.
            if (user && user.isAnonymous) { firebase.auth().signOut(); return; }
            Team.stop();
            if (!user) {
                AdminTeams.unwatch();
                AppState.currentUser = null;
                AppState.isAdmin = false;
                Gate.show('login');
                return;
            }
            AppState.currentUser = user;
            AppState.isAdmin = !!(user.email && user.email === ADMIN_EMAIL);
            if (AppState.isAdmin) AdminTeams.watch(); else AdminTeams.unwatch();
            let result;
            try {
                result = await Team.resolve(user);
            } catch (err) {
                console.error(err);
                Gate.show('login', 'No hay conexión y este móvil todavía no tiene los datos guardados. Conéctate a internet e inténtalo de nuevo.');
                return;
            }
            if (!result.teamId) {
                if (AppState.isAdmin) {
                    Team.startNoTeam();
                    Gate.show('app');
                    Router.navigate('canciones', false);
                    return;
                }
                const msg = result.removedFrom ? 'Ya no formas parte de tu equipo anterior. Puedes unirte a otro con su código.' : '';
                Gate.show('onboarding', msg);
                return;
            }
            Team.start(result.teamId);
            Gate.show('app');
        });
        this.bindButtons();
    },
    bindButtons() {
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn && !logoutBtn.hasAttribute('data-bound')) {
            logoutBtn.addEventListener('click', () => this.signOut());
            logoutBtn.setAttribute('data-bound', 'true');
        }
        Gate.bindButtons();
    },
    signIn() {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        // Siempre con ventana emergente, también en iPhone. La "redirección"
        // (salir a Google y volver) ya no sirve en Safari: bloquea que la app
        // recupere la sesión a la vuelta y se queda en esta pantalla una y otra
        // vez. La redirección solo se usa si el navegador bloquea la ventana.
        firebase.auth().signInWithPopup(provider).catch(err => {
            console.error(err);
            const needsRedirect = ['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/web-storage-unsupported'];
            if (needsRedirect.includes(err.code)) { firebase.auth().signInWithRedirect(provider); return; }
            if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return;
            Gate.setMessage('login-message', 'No se pudo iniciar sesión: ' + err.message, true);
        });
    },
    signOut() {
        Storage.flushSetlistsSave();
        Storage.borrarCache(Storage.CACHE_SESSION);
        firebase.auth().signOut();
    },
    updateUI() {
        const loginBtn = document.getElementById('btn-login');
        const logoutBtn = document.getElementById('btn-logout');
        const userLabel = document.getElementById('user-email-label');
        const loggedIn = !!AppState.currentUser;

        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = loggedIn ? 'inline-flex' : 'none';
        if (userLabel) {
            const name = AppState.member ? AppState.member.name : (AppState.currentUser ? AppState.currentUser.email : '');
            const teamName = AppState.team ? ` · ${AppState.team.name}` : '';
            userLabel.style.display = loggedIn ? 'inline' : 'none';
            userLabel.textContent = loggedIn ? `${name}${teamName}` : '';
        }

        const showIf = (id, condition, displayValue) => {
            const el = document.getElementById(id);
            if (el) el.style.display = condition ? displayValue : 'none';
        };
        showIf('nav-tab-edicion', AppState.isAdmin, 'inline-block');
        showIf('btn-add-song', AppState.isAdmin, 'inline-flex');
        showIf('btn-import-pdfs', AppState.isAdmin, 'inline-flex');
        showIf('btn-bulk-detect-keys', AppState.isAdmin, 'inline-flex');
        showIf('btn-migrate-local', AppState.isAdmin, 'inline-flex');
        showIf('btn-edit-song', AppState.isAdmin, 'inline-flex');
        showIf('btn-vocal-profiles', AppState.isAdmin, 'inline-flex');
        showIf('btn-backup', AppState.isAdmin, 'inline-flex');
        showIf('btn-admin-teams', AppState.isAdmin, 'inline-flex');
        const pending = document.getElementById('pending-banner');
        if (pending) pending.hidden = !(loggedIn && Gate.current === 'app' && Team.isPending() && !AppState.isAdmin);
        showIf('btn-new-setlist', Perm.canCreateSetlist(), 'inline-flex');

        if (Gate.current !== 'app') return;
        if (AppState.currentView === 'canciones') Router.renderSongsList();
        if (AppState.currentView === 'repertorio') Router.renderSetlistsList();
        if (AppState.currentView === 'repertorio-detail') Router.renderSetlistDetail();
        if (!AppState.isAdmin && AppState.currentView === 'edicion') Router.navigate('canciones');
    }
};

// Parser de acordes
const ChordParser = {
    chordRegex: /\b([A-G])([#b]*)(maj7|maj9|m7|m9|m|dim|aug|add\d+|sus4|sus2|sus|7|9|11|13|°|ø)?(?:\/([A-G])([#b]*))?(?![a-zA-Z])/g,
    sectionHeaderRegex: /^\s*(?:(?:PC|Rf|In|Pr|I|V|C|P|R|F|O)\s+)?(intro|estrofa|verso|pre[\s\-]?coro|coro|refrain|puente|bridge|interludio|solo|instrumental|outro|final|tag|estribillo|modulaci[oó]n|leyenda|espontaneo|espontáneo)\s*(?:[:\-]|\b)?\s*(\d+|i{1,3}|[ivx]{1,4}|[1-9]ª|x\d+|\(.*?\)|-\s*[A-Z]\d?)?\s*$/i,

    normalizeTildes(text) {
        const map = { 'á':'a','é':'e','í':'i','ó':'o','ú':'u','Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U' };
        return text.replace(/[áéíóúÁÉÍÓÚ]/g, c => map[c] || c);
    },
    isChordLine(line) {
        if (!line.trim()) return false;
        const matches = [...line.matchAll(this.chordRegex)];
        if (matches.length === 0) return false;
        const chordChars = matches.reduce((acc, m) => acc + m[0].length, 0);
        const totalChars = line.replace(/\s/g, '').length;
        return totalChars > 0 && (chordChars / totalChars) >= 0.30;
    },
    isSectionHeader(line) { return this.sectionHeaderRegex.test(this.normalizeTildes((line || '').trim())); },
    normalizeSectionName(line) {
        const normalized = this.normalizeTildes(line.replace(/[\[\]:]/g, '').trim());
        const match = normalized.match(this.sectionHeaderRegex);
        if (!match) return line;
        const [, sectionType, number] = match;
        const translations = {
            'intro':'Intro','estrofa':'Estrofa','verso':'Estrofa','verse':'Estrofa',
            'pre coro':'Pre-Coro','precoro':'Pre-Coro','pre-coro':'Pre-Coro',
            'coro':'Coro','chorus':'Coro','estribillo':'Estribillo','refrain':'Refrán','puente':'Puente','bridge':'Puente',
            'interludio':'Interludio','solo':'Solo','instrumental':'Instrumental','outro':'Outro','final':'Final','tag':'Tag',
            'modulacion':'Modulación','leyenda':'Leyenda','espontaneo':'Espontáneo'
        };
        const normalizedType = sectionType.toLowerCase().replace(/[\s\-]/g, ' ');
        let baseName = translations[normalizedType] || sectionType;
        if (number) {
            let suffix = '';
            if (/^\d+$/.test(number)) suffix = ` ${number}`;
            else if (/^i{1,3}$/i.test(number)) { const r = { 'i':'1','ii':'2','iii':'3' }; suffix = ` ${r[number.toLowerCase()] || number}`; }
            else if (/^\d+ª$/.test(number)) suffix = ` ${number.charAt(0)}`;
            else if (/^x\d+$/.test(number)) suffix = ` ${number.substring(1)}`;
            else if (/^-\s*[A-Z]\d?$/i.test(number)) suffix = '';
            else suffix = ` ${number.replace(/[()]/g, '')}`;
            baseName += suffix;
        }
        return baseName;
    },
    detectAndParse(text, useAutoSections = true) {
        const lines = text.split('\n');
        const sections = [];
        let currentSection = { label: useAutoSections ? 'Intro' : 'Sin sección', pairs: [] };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            if (useAutoSections && this.isSectionHeader(trimmed)) {
                if (currentSection.pairs.length > 0) sections.push(currentSection);
                currentSection = { label: this.normalizeSectionName(trimmed), pairs: [] };
                continue;
            }
            if (!trimmed) continue;

            if (this.isChordLine(line)) {
                const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
                const nextTrimmed = nextLine.trim();
                if (!nextTrimmed || this.isChordLine(nextLine) || (useAutoSections && this.isSectionHeader(nextTrimmed))) {
                    currentSection.pairs.push({ acordes: line, letra: '' });
                } else {
                    currentSection.pairs.push({ acordes: line, letra: nextLine });
                    i++;
                }
            } else {
                if (currentSection.pairs.length > 0 && !currentSection.pairs[currentSection.pairs.length - 1].letra.trim()) {
                    currentSection.pairs[currentSection.pairs.length - 1].letra = line;
                } else {
                    currentSection.pairs.push({ acordes: '', letra: line });
                }
            }
        }
        if (currentSection.pairs.length > 0) sections.push(currentSection);
        return sections;
    }
};

// Transpositor
const Transposer = {
    notes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    notesFlat: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],

    // Suma el efecto de una cadena de alteraciones (ej: "b#" se cancelan y dan 0)
    accidentalShift(accStr) {
        if (!accStr) return 0;
        let shift = 0;
        for (const ch of accStr) shift += (ch === '#' ? 1 : -1);
        return shift;
    },

    transpose(chord, semitones) {
        if (!chord || semitones === 0) return chord;
        return chord.replace(ChordParser.chordRegex, (match, root, accidental, suffix, bassRoot, bassAccidental) => {
            const newRoot = this.transposeNote(root, accidental, semitones);
            let newBass = '';
            if (bassRoot) newBass = '/' + this.transposeNote(bassRoot, bassAccidental, semitones);
            return newRoot + (suffix || '') + newBass;
        });
    },

    // Ahora acepta cualquier combinación de alteraciones (b, #, bb, b#, etc.) y las combina correctamente
    transposeNote(root, accidental, semitones) {
        const baseIdx = this.notes.indexOf(root);
        if (baseIdx === -1) return root + (accidental || '');
        const shift = this.accidentalShift(accidental);
        let newIdx = (baseIdx + shift + semitones) % 12;
        if (newIdx < 0) newIdx += 12;
        return this.chooseBestEnharmonic(newIdx, semitones);
    },

    chooseBestEnharmonic(idx, semitones) {
        const sharp = this.notes[idx];
        const flat = this.notesFlat[idx];
        if (!sharp.includes('#') && !sharp.includes('b')) return sharp;
        if (semitones < 0) {
            if (sharp === 'F#' || sharp === 'C#') return sharp;
            return flat;
        }
        return sharp;
    },

    cleanChord(chord) {
        const map = {
            'C##':'D','D##':'E','E##':'F#','F##':'G','G##':'A','A##':'B','B##':'C#',
            'Cbb':'Bb','Dbb':'C','Ebb':'D','Fbb':'Eb','Gbb':'F','Abb':'G','Bbb':'A'
        };
        let result = chord;
        for (const [d, s] of Object.entries(map)) result = result.replace(new RegExp(d, 'g'), s);
        return result;
    }
};

// Detector de tonalidad — siempre mayor
const KeyDetector = {
    majorQualities: ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'],
    majorOffsets: [0, 2, 4, 5, 7, 9, 11],
    simplifyQuality(suffix) {
        if (!suffix) return 'maj';
        if (/^(dim|°|ø)/.test(suffix)) return 'dim';
        if (/^m(?!aj)/.test(suffix)) return 'min';
        return 'maj';
    },
    extractChords(sections) {
        const freq = {};
        let firstChord = null, lastChord = null;
        (sections || []).forEach(section => {
            (section.pairs || []).forEach(pair => {
                if (!pair.acordes) return;
                const matches = [...pair.acordes.matchAll(ChordParser.chordRegex)];
                matches.forEach(m => {
                    const root = m[1], accidental = m[2] || '', suffix = m[3] || '';
                    const baseIdx = Transposer.notes.indexOf(root);
                    if (baseIdx === -1) return;
                    let idx = (baseIdx + Transposer.accidentalShift(accidental)) % 12;
                    if (idx < 0) idx += 12;
                    const quality = this.simplifyQuality(suffix);
                    const key = idx + '-' + quality;
                    freq[key] = (freq[key] || 0) + 1;
                    if (!firstChord) firstChord = { idx, quality };
                    lastChord = { idx, quality };
                });
            });
        });
        return { freq, firstChord, lastChord };
    },
    detectKey(sections) {
        const { freq, firstChord, lastChord } = this.extractChords(sections);
        const chordEntries = Object.entries(freq).map(([k, count]) => {
            const [idx, quality] = k.split('-');
            return { idx: parseInt(idx), quality, count };
        });
        if (chordEntries.length === 0) return null;
        const totalDistinct = chordEntries.length;
        let best = null;

        for (let root = 0; root < 12; root++) {
            let matchedDistinct = 0, matchedWeight = 0, rootChordCount = 0;
            chordEntries.forEach(c => {
                const offset = (c.idx - root + 12) % 12;
                const pos = this.majorOffsets.indexOf(offset);
                const isMatch = pos !== -1 && this.majorQualities[pos] === c.quality;
                if (isMatch) { matchedDistinct++; matchedWeight += c.count; }
                if (c.idx === root && c.quality === 'maj') rootChordCount += c.count;
            });
            const coverage = matchedDistinct / totalDistinct;
            let bonus = 0;
            if (firstChord && firstChord.idx === root && firstChord.quality === 'maj') bonus += 15;
            if (lastChord && lastChord.idx === root && lastChord.quality === 'maj') bonus += 30;
            const score = coverage * 10000 + rootChordCount * 20 + bonus + matchedWeight;
            if (!best || score > best.score) best = { score, root };
        }
        if (!best) return null;
        return Transposer.notes[best.root];
    }
};

// Grados
const KeyDegrees = {
    romanByOffset: ['I', 'bII', 'II', 'bIII', 'III', 'IV', '#IV', 'V', 'bVI', 'VI', 'bVII', 'VII'],
    getKeyRootIndex(keyBase) {
        if (!keyBase) return 0;
        const root = keyBase.replace('m', '');
        let idx = Transposer.notes.indexOf(root);
        if (idx === -1) idx = Transposer.notesFlat.indexOf(root);
        return idx === -1 ? 0 : idx;
    },
    noteToDegree(root, accidental, keyRootIdx) {
        const baseIdx = Transposer.notes.indexOf(root);
        if (baseIdx === -1) return '?';
        let idx = (baseIdx + Transposer.accidentalShift(accidental)) % 12;
        if (idx < 0) idx += 12;
        const offset = (idx - keyRootIdx + 12) % 12;
        return this.romanByOffset[offset];
    },
    toDegrees(chordLine, keyBase) {
        if (!chordLine || !chordLine.trim()) return chordLine;
        const keyRootIdx = this.getKeyRootIndex(keyBase);
        return chordLine.replace(ChordParser.chordRegex, (match, root, accidental, suffix, bassRoot, bassAccidental) => {
            let numeral = this.noteToDegree(root, accidental, keyRootIdx);
            const quality = KeyDetector.simplifyQuality(suffix);
            let suffixDisplay = suffix || '';
            if (quality === 'min') { numeral = numeral.toLowerCase(); suffixDisplay = suffixDisplay.replace(/^m(?!aj)/, ''); }
            else if (quality === 'dim') { numeral = numeral.toLowerCase() + '°'; suffixDisplay = suffixDisplay.replace(/^(dim|°|ø)/, ''); }
            let bassPart = '';
            if (bassRoot) { const bassNumeral = this.noteToDegree(bassRoot, bassAccidental, keyRootIdx); bassPart = '/' + bassNumeral; }
            return numeral + suffixDisplay + bassPart;
        });
    }
};

// Router
const Router = {
    init() {
        document.querySelectorAll('.nav-tab').forEach(tab => tab.addEventListener('click', () => this.navigate(tab.dataset.route)));
        this.setupMainButtons();
        this.populateLeadVocalReaderSelect();
        this.setupSwipeNavigation();
        FullscreenUI.bindActivityListeners();
        window.addEventListener('resize', () => {
            if (AppState.currentView === 'song-reader') {
                HorizontalStructureSync.update();
                StickyStructureBar.updateTopOffset();
            }
        });
        this.navigate('repertorio', false);
    },

    setupSwipeNavigation() {
        let touchStartX = null, touchStartY = null;
        const edgeMargin = 30;
        document.addEventListener('touchstart', (e) => {
            if (AppState.currentView !== 'song-reader' || !AppState.currentSetlist) return;
            const x = e.touches[0].clientX;
            if (x < edgeMargin || x > window.innerWidth - edgeMargin) { touchStartX = null; return; }
            touchStartX = x; touchStartY = e.touches[0].clientY;
        }, { passive: true });
        document.addEventListener('touchend', (e) => {
            if (touchStartX === null || AppState.currentView !== 'song-reader' || !AppState.currentSetlist) return;
            const diffX = e.changedTouches[0].clientX - touchStartX;
            const diffY = e.changedTouches[0].clientY - touchStartY;
            touchStartX = null; touchStartY = null;
            if (Math.abs(diffX) < 70 || Math.abs(diffX) < Math.abs(diffY) * 1.5) return;
            if (diffX < 0) Router.gotoSetlistSong(1); else Router.gotoSetlistSong(-1);
        }, { passive: true });
    },

    navigate(view, push = true) {
        // Mientras no se haya entrado con Google y en un equipo, no se navega.
        if (document.body.classList.contains('gated')) return;
        if (view === 'edicion' && !AppState.isAdmin) view = 'canciones';
        // Salir del editor por las pestañas guardaba solo al usar "Volver".
        // Ahora guarda siempre, para no perder cambios sin darse cuenta.
        if (AppState.currentView === 'edicion' && view !== 'edicion' && AppState.currentSong) {
            this.saveCurrentSong();
        }
        if (AppState.currentView === 'song-reader' && view !== 'song-reader') {
            WakeLockManager.release();
            this.exitFullscreenMode();
        }
        AppState.currentView = view;
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.route === view));
        if (view === 'repertorio-detail') {
            const repTab = document.querySelector('.nav-tab[data-route="repertorio"]');
            if (repTab) repTab.classList.add('active');
        }
        if (view === 'song-reader') {
            const route = AppState.cameFromSetlistId ? 'repertorio' : 'canciones';
            const tab = document.querySelector(`.nav-tab[data-route="${route}"]`);
            if (tab) tab.classList.add('active');
        }
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const target = document.getElementById(`view-${view}`);
        if (target) target.classList.add('active');

        if (view === 'canciones') {
            const sortSelect = document.getElementById('sort-select');
            if (sortSelect) sortSelect.value = AppState.settings.sortBy || 'alpha';
            this.updateSearchClear();
            this.renderSongsList();
        }
        if (view === 'repertorio') this.renderSetlistsList();
        if (view === 'repertorio-detail') this.renderSetlistDetail();
        if (view === 'equipo') this.renderTeamView();
        if (view === 'edicion' && AppState.isCreatingNew) this.showInitialDialog();

        if (push) HistoryManager.push({ view });
    },

    setupMainButtons() {
        this.bindButton('logo-home', () => {
            if (AppState.currentView === 'edicion' && AppState.currentSong) this.saveCurrentSong();
            this.navigate('repertorio');
        });
        this.bindButton('btn-add-song', () => { if (!AppState.isAdmin) return; AppState.isCreatingNew = true; this.navigate('edicion'); });
        this.bindButton('btn-import-pdfs', () => { if (AppState.isAdmin) this.showBulkPDFImport(); });
        this.bindButton('btn-bulk-detect-keys', () => { if (AppState.isAdmin) this.bulkDetectKeys(); });
        this.bindButton('btn-backup', () => { if (AppState.isAdmin) this.downloadBackup(); });
        this.bindButton('btn-admin-teams', () => AdminTeams.open());
        this.bindButton('btn-migrate-local', () => { if (AppState.isAdmin) this.migrateOldData(); });
        this.bindButton('btn-vocal-profiles', () => { if (AppState.isAdmin) this.showVocalProfilesModal(); });
        this.bindButton('btn-back-to-list', () => { history.back(); });
        this.bindButton('btn-back-from-editor', () => { this.saveCurrentSong(); history.back(); });
        this.bindButton('btn-edit-song', () => { if (AppState.currentSong && AppState.isAdmin) this.editSong(AppState.currentSong.id); });
        this.bindButton('btn-transpose-up-reader', () => this.transposeSong(1));
        this.bindButton('btn-transpose-down-reader', () => this.transposeSong(-1));
        this.bindButton('btn-reset-key-reader', () => this.resetTransposition());
        this.bindButton('btn-toggle-notation', () => this.toggleNotation());
        this.bindButton('btn-voice-mode', () => this.toggleVoiceMode());
        this.bindButton('btn-font-increase', () => this.adjustReaderFontSize(0.1));
        this.bindButton('btn-font-decrease', () => this.adjustReaderFontSize(-0.1));
        this.bindButton('btn-fullscreen-toggle', () => this.enterFullscreenMode());
        this.bindButton('btn-fullscreen-exit', () => this.requestExitFullscreen());
        this.bindButton('btn-tp-toggle', () => Teleprompter.toggle());
        this.bindButton('btn-tp-slower', () => Teleprompter.slower());
        this.bindButton('btn-tp-faster', () => Teleprompter.faster());
        this.bindButton('btn-close-youtube-mini', () => this.closeYoutubeMiniPlayer());
        const readerMeta = document.getElementById('reader-meta');
        if (readerMeta && !readerMeta.hasAttribute('data-bound')) {
            readerMeta.addEventListener('click', (e) => {
                if (e.target.closest('.reader-bpm-clickable') && AppState.currentSong) Metronome.open(AppState.currentSong);
            });
            readerMeta.setAttribute('data-bound', 'true');
        }
        this.bindButton('btn-close-metronome', () => Metronome.close());
        this.bindButton('btn-metronome-toggle', () => Metronome.toggle());
        this.bindButton('btn-save-song', () => this.saveCurrentSong());
        this.bindButton('btn-add-section', () => Editor.addSection());
        this.bindButton('btn-add-pair-editor', () => Editor.addPair());
        this.bindButton('btn-transpose-up', () => Editor.transpose(1));
        this.bindButton('btn-transpose-down', () => Editor.transpose(-1));
        this.bindButton('btn-reset-transpose', () => Editor.resetTranspose());
        this.bindButton('btn-detect-key', () => Editor.detectKey());
        this.bindButton('btn-edit-song-structure', () => Editor.showStructureModal());
        this.bindButton('btn-song-structure-setlist', () => this.showSetlistStructureModal());
        this.bindButton('btn-setlist-version', () => this.showSetlistVersionEditor());
        const structureBarInner = document.getElementById('structure-bar-inner');
        if (structureBarInner && !structureBarInner.hasAttribute('data-bound')) {
            structureBarInner.addEventListener('click', (e) => {
                const chip = e.target.closest('.structure-chip');
                if (!chip) return;
                this.scrollToStructureIndex(parseInt(chip.dataset.index, 10), chip.dataset.label);
            });
            structureBarInner.setAttribute('data-bound', 'true');
        }
        this.bindInput('search-box', (e) => { this.filterSongs(e.target.value); this.updateSearchClear(); });
        this.bindButton('btn-clear-search', () => this.clearSearch());
        this.bindInput('bpm-editor-input', (e) => {
            if (!AppState.currentSong) return;
            const val = parseInt(e.target.value);
            AppState.currentSong.bpm = isNaN(val) ? null : val;
            Storage.updateSaveStatus('unsaved');
        });
        this.bindInput('compas-editor-input', (e) => {
            if (!AppState.currentSong) return;
            AppState.currentSong.compas = e.target.value.trim();
            Storage.updateSaveStatus('unsaved');
        });
        this.bindSelect('original-key-editor-select', (e) => {
            if (!AppState.currentSong) return;
            AppState.currentSong.originalKey = e.target.value;
            Storage.updateSaveStatus('unsaved');
        });
        // Créditos de la canción (opcionales). Se muestran al final de la letra.
        [['credits-authors-input', 'authors'], ['credits-copyright-input', 'copyright'], ['credits-ccli-input', 'ccliNumber']]
            .forEach(([id, field]) => this.bindInput(id, (e) => {
                if (!AppState.currentSong) return;
                const value = e.target.value.trim();
                // En el número CCLI solo cuentan las cifras ("CCLI 7065049" -> 7065049).
                AppState.currentSong[field] = field === 'ccliNumber' ? value.replace(/[^\d]/g, '') : value;
                Storage.updateSaveStatus('unsaved');
            }));
        // Abre la búsqueda gratuita de SongSelect con el título de la canción,
        // para copiar de ahí el número CCLI, los autores y el copyright.
        this.bindButton('btn-search-songselect', () => {
            const titleInput = document.getElementById('song-title-editor');
            const title = (titleInput && titleInput.value.trim()) || (AppState.currentSong ? AppState.currentSong.title : '');
            window.open('https://songselect.ccli.com/search/results?search=' + encodeURIComponent(title || ''), '_blank', 'noopener');
        });
        this.bindInput('youtube-link-editor-input', (e) => {
            if (!AppState.currentSong) return;
            AppState.currentSong.youtubeLink = e.target.value.trim();
            Storage.updateSaveStatus('unsaved');
        });
        this.bindInput('song-artist-editor', (e) => {
            if (!AppState.currentSong) return;
            AppState.currentSong.artist = e.target.value;
            Storage.updateSaveStatus('unsaved');
        });
        this.bindSelect('key-editor-select', (e) => {
            if (!AppState.currentSong) return;
            AppState.currentSong.keyBase = e.target.value;
            Storage.updateSaveStatus('unsaved');
        });
        this.bindSelect('sort-select', (e) => {
            AppState.settings.sortBy = e.target.value;
            Storage.saveSettings();
            this.renderSongsList();
        });
        this.bindSelect('lead-vocal-reader-select', (e) => this.handleLeadVocalReaderChange(e.target.value));

        this.bindButton('btn-new-setlist', () => this.showNewSetlistModal());
        this.bindButton('btn-back-to-repertorios', () => { history.back(); });
        this.bindButton('btn-add-songs-to-setlist', () => this.showAddSongsToSetlistModal());
        this.bindButton('btn-uniform-key', () => this.showUniformKeyModal());
        this.bindButton('btn-clear-uniform-key', () => this.clearUniformKey());
        this.bindButton('btn-toggle-equipo', () => this.showEquipoModal());
        this.bindButton('btn-toggle-setlist-edit', () => { this.closeSetlistMenu(); this.toggleSetlistEditMode(); });
        this.bindButton('btn-setlist-edit-done', () => this.toggleSetlistEditMode());
        this.bindButton('btn-setlist-menu', () => this.toggleSetlistMenu());
        // Al elegir cualquier opción, o al tocar fuera, el menú se cierra solo.
        if (!document.body.hasAttribute('data-setlist-menu-bound')) {
            document.addEventListener('click', (e) => {
                const menu = document.getElementById('setlist-menu');
                if (!menu || menu.hidden) return;
                if (e.target.closest('#btn-setlist-menu')) return;
                if (e.target.closest('#setlist-menu') && !e.target.closest('button')) return;
                this.closeSetlistMenu();
            });
            document.body.setAttribute('data-setlist-menu-bound', 'true');
        }
        // El nombre se sube cuando dejas de escribir, no con cada letra.
        this.bindInput('setlist-name-input', (e) => {
            if (!AppState.currentSetlist || !Perm.canEditSetlist(AppState.currentSetlist)) return;
            AppState.currentSetlist.name = e.target.value;
            Storage.scheduleSetlistsSave();
        });
        this.bindButton('btn-prev-setlist-song', () => this.gotoSetlistSong(-1));
        this.bindButton('btn-next-setlist-song', () => this.gotoSetlistSong(1));
    },

    // Rellena el desplegable de voz del lector con las personas del equipo.
    // Se vuelve a llamar cada vez que se abre una canción, porque el equipo
    // puede haber cambiado. Si la voz guardada es de alguien que ya no está,
    // se añade igual para no perderla de vista.
    populateLeadVocalReaderSelect(selected) {
        const select = document.getElementById('lead-vocal-reader-select');
        if (!select) return;
        const names = this.leadVocalOptions(selected);
        select.innerHTML = '<option value="">Sin asignar</option>' +
            names.map(n => `<option value="${this.escapeAttr(n)}">${this.escapeHtml(n)}</option>`).join('');
        select.value = selected || '';
    },

    // Personas que pueden dirigir una canción: todo el equipo (más la ya elegida).
    leadVocalOptions(selected) {
        const names = Team.memberNames();
        if (selected && !names.includes(selected)) names.push(selected);
        return names;
    },

    escapeHtml(text) {
        return String(text == null ? '' : text)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    escapeAttr(text) {
        return this.escapeHtml(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },

    bindButton(id, handler) {
        const el = document.getElementById(id);
        if (el && !el.hasAttribute('data-bound')) { el.addEventListener('click', handler); el.setAttribute('data-bound', 'true'); }
    },
    bindInput(id, handler) {
        const el = document.getElementById(id);
        if (el && !el.hasAttribute('data-bound')) { el.addEventListener('input', handler); el.setAttribute('data-bound', 'true'); }
    },
    bindSelect(id, handler) {
        const el = document.getElementById(id);
        if (el && !el.hasAttribute('data-bound')) { el.addEventListener('change', handler); el.setAttribute('data-bound', 'true'); }
    },

    enterFullscreenMode() {
        if (!AppState.currentSong || AppState.fullscreenMode) return;
        AppState.fullscreenMode = true;
        document.body.classList.add('fullscreen-active');
        FullscreenUI.show();
        HistoryManager.push({
            view: 'song-reader',
            songId: AppState.currentSong.id,
            setlistId: AppState.currentSetlist ? AppState.currentSetlist.id : null,
            fullscreen: true
        });
        StickyStructureBar.updateTopOffset();
        setTimeout(() => HorizontalStructureSync.update(), 50);
    },
    requestExitFullscreen() { if (AppState.fullscreenMode) history.back(); },
    exitFullscreenMode() {
        AppState.fullscreenMode = false;
        document.body.classList.remove('fullscreen-active');
        FullscreenUI.hide();
        Teleprompter.stop();
        StickyStructureBar.reset();
        setTimeout(() => HorizontalStructureSync.update(), 50);
    },

    // ============ COPIA DE SEGURIDAD ============
    // Descarga un archivo .json con todo lo que hay en la nube: el catálogo de
    // canciones y, del propio equipo, sus datos, integrantes y repertorios. Se lee
    // directamente del servidor, para que el archivo sea exactamente lo guardado.
    async downloadBackup() {
        const btn = document.getElementById('btn-backup');
        const originalText = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Preparando copia...'; }
        try {
            const server = { source: 'server' };
            const hasTeam = !!AppState.teamId;
            const [songsSnap, setlistsSnap, membersSnap, teamDoc, vocalDoc] = await Promise.all([
                Storage.songsRef().get(server),
                hasTeam ? Storage.setlistsRef().get(server) : Promise.resolve(null),
                hasTeam ? Team.membersRef().get(server) : Promise.resolve(null),
                hasTeam ? Team.teamRef().get(server) : Promise.resolve(null),
                db.collection('appdata').doc('vocalProfiles').get(server).catch(() => null)
            ]);
            const songs = songsSnap.docs.map(d => d.data());
            const setlists = setlistsSnap ? setlistsSnap.docs.map(d => d.data()) : [];
            const members = membersSnap ? membersSnap.docs.map(d => ({ uid: d.id, ...d.data() })) : [];
            const backup = {
                app: 'Repertia',
                formatVersion: 2,
                createdAt: new Date().toISOString(),
                songs,
                team: teamDoc && teamDoc.exists ? { id: teamDoc.id, ...teamDoc.data() } : null,
                members,
                setlists,
                vocalProfiles: vocalDoc && vocalDoc.exists ? vocalDoc.data() : null
            };

            const d = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const fileName = `repertia-copia-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.json`;
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 5000);

            alert(
                `✅ Copia descargada: ${fileName}\n\n` +
                `Canciones: ${songs.length}\n` +
                `Repertorios del equipo: ${setlists.length}\n` +
                `Integrantes: ${members.length}`
            );
        } catch (err) {
            console.error(err);
            alert('No se pudo hacer la copia (¿hay conexión?): ' + err.message);
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = originalText; }
        }
    },
    // ============ FIN COPIA DE SEGURIDAD ============

    // ============ PASAR LOS DATOS ANTIGUOS AL FORMATO NUEVO ============
    // Solo el administrador. Copia las canciones del formato antiguo
    // (appdata/songs) al catálogo común y los repertorios antiguos
    // (appdata/setlists) al equipo en el que está, aunque en él sea un miembro
    // normal. Pregunta a nombre de qué integrante quedan los repertorios (esa
    // persona será su "creador" y podrá gestionarlos, además del líder).
    // No sobrescribe nada: solo añade lo que todavía no esté en el formato nuevo.
    // Los datos antiguos no se borran.
    async migrateOldData() {
        if (!AppState.isAdmin) return;
        // Sin equipo se pueden pasar las canciones al catálogo; los repertorios
        // se pasarán después, ya dentro del equipo.
        const inTeam = !!(AppState.teamId && AppState.team && AppState.member);
        let oldSongs = [], oldSetlists = [];
        try {
            const server = { source: 'server' };
            const ref = db.collection('appdata');
            const [songsDoc, setlistsDoc] = await Promise.all([ref.doc('songs').get(server), ref.doc('setlists').get(server)]);
            oldSongs = songsDoc.exists ? (songsDoc.data().songs || []) : [];
            oldSetlists = setlistsDoc.exists ? (setlistsDoc.data().setlists || []) : [];
        } catch (err) {
            console.error(err);
            alert('No se pudieron leer los datos antiguos (¿hay conexión?): ' + err.message);
            return;
        }
        const existingSongs = new Set(AppState.songs.map(s => s.id));
        const existingSetlists = new Set(AppState.setlists.map(s => s.id));
        const newSongs = oldSongs.filter(s => s && s.id && !existingSongs.has(s.id));
        const newSetlists = inTeam ? oldSetlists.filter(s => s && s.id && !existingSetlists.has(s.id)) : [];
        if (!newSongs.length && !newSetlists.length) {
            alert(inTeam
                ? 'Ya está todo pasado: no queda ninguna canción ni repertorio antiguo por copiar.'
                : `Las canciones ya están todas en el catálogo.${oldSetlists.length ? ` Los ${oldSetlists.length} repertorios antiguos se pasan desde dentro de un equipo: únete al equipo y vuelve a pulsar este botón.` : ''}`);
            return;
        }

        // Por defecto se propone al primer director técnico; si no hay, al líder.
        const order = { lider: 1, director: 0, miembro: 2 };
        const members = [...AppState.members].sort((a, b) =>
            ((order[a.role] ?? 3) - (order[b.role] ?? 3)) || (a.name || '').localeCompare(b.name || '', 'es'));
        const esc = (t) => this.escapeHtml(t);
        this.createModal({
            title: 'Pasar datos antiguos',
            content: `
                <p style="margin-bottom:1rem; color:var(--text-secondary); font-size:0.9rem; line-height:1.5;">
                    Se añadirán <strong>${newSongs.length}</strong> canciones al catálogo${inTeam
                        ? ` y <strong>${newSetlists.length}</strong> repertorios al equipo <strong>${esc(AppState.team.name)}</strong>`
                        : ''}.
                    Lo que ya estaba en el formato nuevo no se toca, y los datos antiguos no se borran.
                </p>
                ${!inTeam && oldSetlists.length ? `<p class="team-hint">Los ${oldSetlists.length} repertorios antiguos se pasarán cuando estés dentro de un equipo.</p>` : ''}
                ${newSetlists.length ? `
                <div class="form-group">
                    <label class="form-label" for="migrate-owner">¿A nombre de quién quedan los repertorios?</label>
                    <select class="form-select" id="migrate-owner">
                        ${members.map(m => `<option value="${m.uid}">${esc(m.name)} — ${Perm.roleLabel(m.role)}</option>`).join('')}
                    </select>
                    <p class="team-hint">Esa persona podrá gestionarlos, igual que el coordinador.</p>
                </div>` : ''}
            `,
            actions: [
                { text: 'Cancelar', action: () => this.closeModal() },
                { text: 'Pasar datos', primary: true, action: () => {
                    const sel = document.getElementById('migrate-owner');
                    const ownerUid = sel ? sel.value : null;
                    this.closeModal();
                    this.runMigration(newSongs, newSetlists, ownerUid);
                } }
            ]
        });
    },

    async runMigration(newSongs, newSetlists, ownerUid) {
        const btn = document.getElementById('btn-migrate-local');
        const originalText = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Copiando...'; }
        try {
            if (newSongs.length) {
                const okSongs = await Storage.saveSongs(newSongs);
                if (!okSongs) return;
            }
            if (newSetlists.length) {
                const owner = AppState.members.find(m => m.uid === ownerUid);
                if (!owner) { alert('Esa persona ya no está en el equipo.'); return; }
                for (let i = 0; i < newSetlists.length; i += 400) {
                    const batch = db.batch();
                    newSetlists.slice(i, i + 400).forEach(sl => {
                        const data = Storage.clean({ ...sl, createdBy: owner.uid, createdByName: owner.name || '' });
                        delete data.creatorName;
                        batch.set(Storage.setlistsRef().doc(sl.id), data);
                    });
                    await batch.commit();
                }
            }
            const owner = AppState.members.find(m => m.uid === ownerUid);
            alert(`✅ Listo: ${newSongs.length} canciones y ${newSetlists.length} repertorios añadidos` +
                (newSetlists.length && owner ? ` (a nombre de ${owner.name}).` : '.'));
        } catch (err) {
            console.error(err);
            alert('No se pudo completar: ' + err.message);
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = originalText; }
        }
    },
    // ============ FIN PASAR DATOS ============

    // ============ PANTALLA DE EQUIPO ============
    renderTeamView() {
        const panel = document.getElementById('team-panel');
        if (!panel) return;
        const team = AppState.team;
        const me = AppState.member;
        const title = document.getElementById('team-title');
        if (!AppState.teamId) {
            if (title) title.textContent = 'Equipo';
            panel.innerHTML = `<div class="empty-state"><h3>Todavía no estás en ningún equipo</h3>
                <p>Como administrador puedes gestionar el catálogo sin equipo. Para ver y usar repertorios, únete al equipo con su código.</p>
                <button class="btn btn-primary" style="margin-top:1rem;" onclick="Gate.goToOnboarding()">Unirme o crear un equipo</button></div>`;
            return;
        }
        if (!team || !me) {
            if (title) title.textContent = 'Equipo';
            panel.innerHTML = '<div class="empty-state"><h3>Cargando el equipo…</h3></div>';
            return;
        }
        if (title) title.textContent = team.name;
        const esc = (t) => this.escapeHtml(t);
        const coordinator = Perm.isLeader();
        const canInvite = Perm.canCreateSetlist(); // coordinador y directores ven el código
        const order = { lider: 0, director: 1, miembro: 2 };
        const members = [...AppState.members].sort((a, b) =>
            ((order[a.role] ?? 3) - (order[b.role] ?? 3)) || (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' }));
        const count = members.length;

        panel.innerHTML = `
            <p class="team-count">${count === 1 ? '1 integrante' : `${count} integrantes`}</p>

            ${Team.isPending() ? `
            <div class="team-notice">
                <strong>Pendiente de aprobación.</strong> El administrador de Repertia tiene que aprobar este equipo antes de que podáis ver las canciones. Ya podéis ir uniéndoos con el código.
            </div>` : ''}

            ${canInvite ? `
            <div class="team-invite">
                <div class="team-invite-main">
                    <div class="team-invite-label">Código para invitar</div>
                    <div class="team-code">${esc(team.inviteCode || '—')}</div>
                </div>
                <button class="btn btn-sm btn-primary" onclick="Router.copyTeamCode()">📋 Copiar invitación</button>
            </div>
            <p class="team-hint team-invite-hint">Se copia un mensaje con el enlace de la app y el código, listo para pegar en el chat del equipo.${coordinator ? ' Si hace falta, puedes <button type="button" class="link-btn" onclick="Router.regenerateTeamCode()">generar un código nuevo</button>.' : ''}</p>` : ''}

            <div class="member-list">
                ${members.map(m => {
                    const isMe = m.uid === Perm.uid();
                    const hasMenu = isMe || coordinator;
                    return `
                    <div class="member-row">
                        <span class="member-avatar" style="background:${this.avatarColor(m.name || m.uid)}">${esc(this.initialOf(m.name))}</span>
                        <div class="member-main">
                            <div class="member-name">${esc(m.name)}${isMe ? ' <span class="member-you">(tú)</span>' : ''}</div>
                            ${coordinator && m.email && !isMe ? `<div class="member-email">${esc(m.email)}</div>` : ''}
                        </div>
                        <span class="role-badge role-${esc(m.role)}">${Perm.roleLabel(m.role)}</span>
                        ${hasMenu ? `<button type="button" class="member-menu-btn" aria-label="Opciones de ${esc(m.name)}" onclick="Router.showMemberMenu('${m.uid}')">⋯</button>` : '<span class="member-menu-spacer"></span>'}
                    </div>`;
                }).join('')}
            </div>
            ${coordinator && count <= 1 ? `<p class="team-hint">Todavía no se ha unido nadie. Comparte la invitación de arriba.</p>` : ''}
            ${coordinator && count > 1 && !members.some(m => m.role === 'director') ? `<p class="team-hint">Si alguien va a preparar repertorios contigo, pulsa ⋯ junto a su nombre y asígnale como director técnico.</p>` : ''}
        `;
    },

    initialOf(name) {
        const t = (name || '').trim();
        return t ? t.charAt(0).toUpperCase() : '?';
    },

    // Un color estable para cada persona (sale siempre el mismo para el mismo nombre).
    avatarColor(seed) {
        const colors = ['#0d9488', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2', '#b45309', '#4f46e5', '#be123c'];
        let h = 0;
        for (const ch of String(seed || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
        return colors[h % colors.length];
    },

    // Menú ⋯ de cada persona: tus propias opciones, o las del coordinador sobre los demás.
    showMemberMenu(uid) {
        const m = AppState.members.find(x => x.uid === uid);
        if (!m) return;
        const isMe = uid === Perm.uid();
        const coordinator = Perm.isLeader();
        const items = [];
        if (isMe) {
            items.push({ text: '✏️ Cambiar mi nombre', action: 'Router.renameMe()' });
            if (!coordinator) items.push({ text: 'Salir del equipo', action: 'Router.leaveTeam()', danger: true });
        } else if (coordinator) {
            items.push({ text: m.role === 'director' ? 'Volver a integrante' : 'Asignar como director técnico', action: `Router.toggleDirector('${uid}')` });
            items.push({ text: 'Asignar como coordinador', action: `Router.makeLeader('${uid}')` });
            items.push({ text: 'Quitar del equipo', action: `Router.removeTeamMember('${uid}')`, danger: true });
        }
        if (!items.length) return;
        const esc = (t) => this.escapeHtml(t);
        this.createModal({
            title: `${esc(m.name)}${isMe ? ' (tú)' : ''}`,
            content: `
                <div class="member-menu-role"><span class="role-badge role-${esc(m.role)}">${Perm.roleLabel(m.role)}</span></div>
                <div class="menu-list">
                    ${items.map(it => `<button type="button" class="menu-item${it.danger ? ' menu-item-danger' : ''}" onclick="Router.closeModal(); ${it.action}">${it.text}</button>`).join('')}
                </div>
                ${isMe && coordinator ? '<p class="team-hint" style="margin-top:0.75rem;">Como coordinador no puedes salir del equipo. Si quieres dejarlo, primero asigna como coordinador a otra persona.</p>' : ''}
            `,
            actions: [{ text: 'Cerrar', action: () => this.closeModal() }]
        });
    },

    copyTeamCode() {
        const code = AppState.team && AppState.team.inviteCode;
        if (!code) return;
        const text = `Únete a "${AppState.team.name}" en Repertia: entra en ${location.origin}${location.pathname} con tu cuenta de Google y escribe el código ${code}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => alert('✅ Invitación copiada (enlace + código). Pégala en el chat del equipo.'))
                .catch(() => prompt('Copia este texto:', text));
        } else {
            prompt('Copia este texto:', text);
        }
    },

    async regenerateTeamCode() {
        if (!Perm.isLeader()) return;
        if (!confirm('Se creará un código nuevo y el actual dejará de servir para entrar. Quien ya está en el equipo sigue dentro. ¿Continuar?')) return;
        try {
            const code = await Team.regenerateCode();
            alert(`✅ Código nuevo: ${code}`);
        } catch (err) { console.error(err); alert('No se pudo cambiar el código: ' + err.message); }
    },

    async renameMe() {
        const current = AppState.member ? AppState.member.name : '';
        const name = (prompt('¿Cómo quieres que te vea el resto del equipo?', current) || '').trim();
        if (!name || name === current) return;
        try { await Team.renameSelf(name); }
        catch (err) { console.error(err); alert('No se pudo cambiar el nombre: ' + err.message); }
    },

    async leaveTeam() {
        const teamName = AppState.team ? AppState.team.name : 'el equipo';
        if (!confirm(`¿Seguro que quieres salir de "${teamName}"? Para volver necesitarás el código del equipo.`)) return;
        try {
            await Team.leave();
            Team.stop();
            Storage.borrarCache(Storage.CACHE_SESSION);
            Gate.show('onboarding', `Has salido de "${teamName}".`);
        } catch (err) { console.error(err); alert('No se pudo salir del equipo: ' + err.message); }
    },

    async toggleDirector(uid) {
        const m = AppState.members.find(x => x.uid === uid);
        if (!m) return;
        const newRole = m.role === 'director' ? 'miembro' : 'director';
        try { await Team.setRole(uid, newRole); }
        catch (err) { console.error(err); alert('No se pudo cambiar el rol: ' + err.message); }
    },

    async makeLeader(uid) {
        const m = AppState.members.find(x => x.uid === uid);
        if (!m || !Perm.isLeader()) return;
        if (!confirm(`¿Asignar a ${m.name} como coordinador del equipo?\n\n` +
            `• ${m.name} podrá gestionar el equipo y todos los repertorios.\n` +
            `• Tú pasarás a ser director técnico.\n` +
            `• Solo el nuevo coordinador podrá devolverte el puesto.`)) return;
        try {
            await Team.transferLeadership(uid);
            alert(`✅ ${m.name} coordina ahora el equipo. Tú quedas como director técnico.`);
        } catch (err) { console.error(err); alert('No se pudo cambiar el coordinador: ' + err.message); }
    },

    async removeTeamMember(uid) {
        const m = AppState.members.find(x => x.uid === uid);
        if (!m) return;
        if (!confirm(`¿Quitar a ${m.name} del equipo?\n\nDejará de ver los repertorios. Si no quieres que pueda volver a entrar con el mismo código, genera después un código nuevo.`)) return;
        try { await Team.removeMember(uid); }
        catch (err) { console.error(err); alert('No se pudo quitar del equipo: ' + err.message); }
    },
    // ============ FIN PANTALLA DE EQUIPO ============

    bulkDetectKeys() {
        if (AppState.songs.length === 0) { alert('No hay canciones cargadas todavía.'); return; }
        if (!confirm(`Se recalculará la tonalidad de las ${AppState.songs.length} canciones cargadas según sus acordes. ¿Continuar?`)) return;
        let updatedCount = 0;
        const changed = [];
        AppState.songs.forEach(song => {
            const detected = KeyDetector.detectKey(song.sections);
            if (detected && detected !== song.keyBase) { song.keyBase = detected; updatedCount++; changed.push(song); }
        });
        Storage.saveSongs(changed);
        this.renderSongsList();
        alert(`✅ Listo. Se actualizó la tonalidad de ${updatedCount} de ${AppState.songs.length} canción(es).`);
    },

    keyIndex(keyBase) {
        if (!keyBase) return 99;
        const root = keyBase.replace('m', '');
        let idx = Transposer.notes.indexOf(root);
        if (idx === -1) idx = Transposer.notesFlat.indexOf(root);
        return idx === -1 ? 99 : idx;
    },

    sortSongs(songs) {
        const sortBy = AppState.settings.sortBy || 'alpha';
        const arr = [...songs];
        switch (sortBy) {
            case 'alpha': arr.sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' })); break;
            case 'recent': arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
            case 'key': arr.sort((a, b) => this.keyIndex(a.keyBase) - this.keyIndex(b.keyBase)); break;
            case 'bpm': arr.sort((a, b) => (b.bpm || 0) - (a.bpm || 0)); break;
        }
        return arr;
    },

    // Compara ignorando mayúsculas y tildes: "esta" encuentra "ESTÁ".
    searchNormalize(text) {
        return ChordParser.normalizeTildes((text || '').toLowerCase()).trim();
    },

    renderSongsList() {
        const grid = document.getElementById('songs-grid');
        const emptyState = document.getElementById('empty-state');
        if (!grid || !emptyState) return;
        if (AppState.songs.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            emptyState.innerHTML = Team.isPending() && !AppState.isAdmin
                ? '<h3>Equipo pendiente de aprobación</h3><p>Cuando el administrador apruebe tu equipo, aparecerán aquí las canciones. Mientras tanto puedes invitar al resto del equipo desde la pestaña Equipo.</p>'
                : AppState.isAdmin
                ? '<h3>El catálogo está vacío</h3><p>Pulsa "📦 Pasar datos antiguos" para traer tus canciones, o añade una nueva.</p>'
                : '<h3>Aún no hay canciones</h3><p>El catálogo todavía está vacío o se está cargando.</p>';
            return;
        }

        const query = this.searchNormalize(AppState.searchQuery);
        let matches = AppState.songs;
        if (query) {
            matches = AppState.songs.filter(song =>
                this.searchNormalize(song.title).includes(query) ||
                this.searchNormalize(song.artist).includes(query)
            );
        }

        if (matches.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            emptyState.innerHTML = '<h3>Sin resultados</h3><p>No hay ninguna canción que coincida con lo que buscas.</p>';
            return;
        }
        emptyState.style.display = 'none';
        grid.style.display = 'block';

        const sorted = this.sortSongs(matches);
        // Si buscas "toma tu", primero la canción que SE LLAMA así y después las
        // que solo coinciden por el autor: si no, las de un autor con muchas
        // canciones entierran la que estabas buscando.
        if (query) {
            sorted.sort((a, b) =>
                (this.searchNormalize(b.title).includes(query) ? 1 : 0) -
                (this.searchNormalize(a.title).includes(query) ? 1 : 0)
            );
        }
        grid.innerHTML = sorted.map(song => `
            <div class="song-item" onclick="Router.viewSong('${song.id}')">
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-meta">${song.artist ? `${song.artist} • ` : ''}${song.keyBase}${song.bpm ? ` • ${song.bpm} BPM` : ''}</div>
                </div>
                ${AppState.isAdmin ? `
                <div class="song-actions" onclick="event.stopPropagation()">
                    <button class="action-btn edit-btn" onclick="Router.editSong('${song.id}')" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="action-btn delete-btn" onclick="Router.deleteSong('${song.id}')" title="Eliminar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        </svg>
                    </button>
                </div>` : ''}
            </div>
        `).join('');
    },

    // force: para guardados que vienen de una acción concreta (ej. el orden de la
    // canción), que no deben descartarse por la espera que evita el doble clic.
    saveCurrentSong(force = false) {
        if (!AppState.isAdmin) return;
        if (AppState.isSaving) return;
        const now = Date.now();
        if (!force && now - AppState.lastSaveTime < 800) return;
        if (!AppState.currentSong) return;
        AppState.isSaving = true;
        AppState.lastSaveTime = now;
        const saveBtn = document.getElementById('btn-save-song');
        if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Guardando...'; }
        try {
            const titleInput = document.getElementById('song-title-editor');
            if (titleInput && titleInput.value.trim()) AppState.currentSong.title = titleInput.value.trim();
            const artistInput = document.getElementById('song-artist-editor');
            if (artistInput) AppState.currentSong.artist = artistInput.value.trim();

            AppState.currentSong.updatedAt = new Date().toISOString();
            const index = AppState.songs.findIndex(s => s.id === AppState.currentSong.id);
            if (index !== -1) AppState.songs[index] = AppState.currentSong;
            else AppState.songs.push(AppState.currentSong);
            // Una canción nueva, una vez guardada, pasa a editarse como existente.
            AppState.editingSongId = AppState.currentSong.id;
            // Cada canción es su propio documento: solo se sube la que se editó.
            Storage.saveSong(AppState.currentSong);
        } finally {
            setTimeout(() => {
                AppState.isSaving = false;
                if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Guardar'; }
            }, 800);
        }
    },

    filterSongs(query) {
        AppState.searchQuery = query || '';
        this.renderSongsList();
    },

    // La cruz dentro del buscador: solo aparece cuando hay algo escrito.
    updateSearchClear() {
        const box = document.getElementById('search-box');
        const btn = document.getElementById('btn-clear-search');
        if (btn) btn.hidden = !(box && box.value.length > 0);
    },

    clearSearch() {
        const box = document.getElementById('search-box');
        if (box) { box.value = ''; box.focus(); }
        this.filterSongs('');
        this.updateSearchClear();
    },

    formatReaderMeta(song) {
        const parts = [];
        if (song.artist) parts.push(song.artist);
        if (song.bpm) parts.push(`<span class="reader-bpm-clickable" title="Abrir metrónomo">${song.bpm} BPM</span>`);
        if (song.compas) parts.push(`Compás ${song.compas}`);
        if (song.keyBase) parts.push(`Tono: ${song.keyBase}`);
        return parts.length > 0 ? parts.join(' • ') : '';
    },

    formatReaderExtra(song) {
        let html = '';
        if (song.originalKey) html += `<span>Tonalidad original: <strong>${song.originalKey}</strong></span>`;
        if (song.youtubeLink) {
            if (html) html += ' &nbsp;•&nbsp; ';
            const safeUrl = song.youtubeLink.replace(/'/g, '&#39;');
            html += `<button type="button" class="youtube-inline-btn" onclick="Router.showYoutubeModal('${safeUrl}', '${song.id}')">▶ Ver vídeo</button>`;
        }
        return html;
    },

    // Extrae el ID del video de distintos formatos de URL de YouTube (watch, youtu.be, embed, shorts).
    extractYoutubeId(url) {
        if (!url) return null;
        try {
            const u = new URL(url);
            if (u.hostname.includes('youtu.be')) {
                return u.pathname.slice(1).split('/')[0] || null;
            }
            if (u.hostname.includes('youtube.com')) {
                if (u.pathname === '/watch') return u.searchParams.get('v');
                const embedMatch = u.pathname.match(/^\/embed\/([^/?]+)/);
                if (embedMatch) return embedMatch[1];
                const shortsMatch = u.pathname.match(/^\/shorts\/([^/?]+)/);
                if (shortsMatch) return shortsMatch[1];
            }
        } catch (e) { /* URL inválida, se maneja abajo */ }
        return null;
    },

    // Abre el video de YouTube como mini-reproductor flotante (esquina de la pantalla),
    // sin bloquear el resto de la app — se puede seguir leyendo y deslizando la canción.
    youtubePlayerSongId: null,
    showYoutubeModal(url, songId) {
        this.youtubePlayerSongId = songId || null;
        const videoId = this.extractYoutubeId(url);
        if (!videoId) { window.open(url, '_blank', 'noopener'); return; }
        const wrap = document.getElementById('youtube-mini-iframe-wrap');
        const player = document.getElementById('youtube-mini-player');
        if (!wrap || !player) { window.open(url, '_blank', 'noopener'); return; }
        wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" title="Video de YouTube" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        player.style.display = 'block';
    },
    closeYoutubeMiniPlayer() {
        this.youtubePlayerSongId = null;
        const wrap = document.getElementById('youtube-mini-iframe-wrap');
        const player = document.getElementById('youtube-mini-player');
        if (wrap) wrap.innerHTML = ''; // quita el iframe -> detiene la reproducción
        if (player) player.style.display = 'none';
    },

    applyReaderFontSize() {
        const content = document.getElementById('song-content');
        if (!content) return;
        const scale = AppState.settings.readerFontScale || 1;
        content.style.fontSize = (15 * scale) + 'px';
    },
    adjustReaderFontSize(delta) {
        let scale = (AppState.settings.readerFontScale || 1) + delta;
        scale = Math.max(0.6, Math.min(2.2, Math.round(scale * 10) / 10));
        AppState.settings.readerFontScale = scale;
        Storage.saveSettings();
        this.applyReaderFontSize();
    },

    computeUniformOffset(song, setlist) {
        if (!setlist || !setlist.uniformKey || !song.keyBase) return 0;
        const targetIdx = Transposer.notes.indexOf(setlist.uniformKey);
        const root = song.keyBase.replace('m', '');
        let songIdx = Transposer.notes.indexOf(root);
        if (songIdx === -1) songIdx = Transposer.notesFlat.indexOf(root);
        if (targetIdx === -1 || songIdx === -1) return 0;
        let diff = (targetIdx - songIdx + 12) % 12;
        if (diff > 6) diff -= 12;
        return diff;
    },

    // Offset automático según la voz líder asignada a esta canción en este repertorio.
    // Se calcula en semitonos respecto a la tonalidad guardada de la canción (referencia: Sarah = 0).
    // PAUSADO A PETICIÓN: por ahora esta función queda lista pero no se usa (ver computeEffectiveOffset).
    // Se retomará cuando haya registro vocal de todas las voces del equipo.
    computeLeadVocalOffset(song, setlist) {
        if (!setlist || setlist.uniformKey) return 0;
        const leadVocal = (setlist.songLeadVocals && setlist.songLeadVocals[song.id]) || '';
        if (!leadVocal) return 0;
        const profiles = AppState.vocalProfiles || {};
        const offset = profiles[leadVocal];
        return (typeof offset === 'number' && !isNaN(offset)) ? offset : 0;
    },

    // Offset "de fábrica": tonalidad uniforme del repertorio si está activa, si no 0.
    // No tiene en cuenta ajustes manuales guardados — se usa como referencia para el botón "Base".
    computeDefaultOffset(song, setlist) {
        if (setlist && setlist.uniformKey) return this.computeUniformOffset(song, setlist);
        return 0;
    },

    // Offset efectivo a aplicar: si el usuario ya transportó manualmente esta canción dentro de
    // este repertorio, esa elección manda. Si no, se usa la tonalidad uniforme (si hay) o 0.
    // La voz líder asignada es solo una referencia visual — no transpone la canción todavía.
    computeEffectiveOffset(song, setlist) {
        if (setlist && setlist.songTransposeOverrides && typeof setlist.songTransposeOverrides[song.id] === 'number') {
            return setlist.songTransposeOverrides[song.id];
        }
        return this.computeDefaultOffset(song, setlist);
    },

    // Guarda (o borra) el ajuste manual de tonalidad de esta canción dentro del repertorio actual.
    // La pantalla ya cambió al instante; la subida a la nube espera a que dejes de pulsar
    // ♯/♭, para que varios toques seguidos se guarden de una sola vez.
    // Solo el creador del repertorio o el líder fijan el tono para todos. Si
    // transpone un miembro, el cambio se queda en su pantalla (no se guarda).
    persistSetlistTransposeOverride() {
        if (!AppState.currentSetlist || !AppState.currentSong) return;
        const sl = AppState.currentSetlist;
        if (!Perm.canEditSetlist(sl)) return;
        if (!sl.songTransposeOverrides) sl.songTransposeOverrides = {};
        sl.songTransposeOverrides[AppState.currentSong.id] = AppState.currentTranspose;
        Storage.scheduleSetlistsSave();
    },

    clearSetlistTransposeOverride() {
        if (!AppState.currentSetlist || !AppState.currentSong) return;
        const sl = AppState.currentSetlist;
        if (!Perm.canEditSetlist(sl)) return;
        if (sl.songTransposeOverrides) delete sl.songTransposeOverrides[AppState.currentSong.id];
        Storage.scheduleSetlistsSave();
    },

    showVocalProfilesModal() {
        const names = Team.memberNames();
        const profiles = AppState.vocalProfiles || {};
        this.createModal({
            title: '🎚️ Perfiles de voz',
            content: `
                <p style="margin-bottom:1rem; color:var(--text-secondary); font-size:0.9rem;">
                    Semitonos respecto a Sarah (referencia = 0). Positivo = más agudo, negativo = más grave.
                </p>
                ${names.map(name => `
                    <div class="form-group" style="display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:0.75rem;">
                        <label class="form-label" style="margin-bottom:0; min-width:100px;">${name}</label>
                        <input type="number" step="1" class="form-input vocal-profile-input" data-name="${name}" value="${(profiles[name] !== undefined && profiles[name] !== null) ? profiles[name] : 0}" style="max-width:110px;">
                    </div>
                `).join('')}
            `,
            actions: [
                { text: 'Cancelar', action: () => this.closeModal() },
                { text: 'Guardar', primary: true, action: () => this.saveVocalProfilesFromModal() }
            ]
        });
    },

    saveVocalProfilesFromModal() {
        const inputs = document.querySelectorAll('.vocal-profile-input');
        const profiles = {};
        inputs.forEach(inp => {
            const name = inp.dataset.name;
            const val = parseInt(inp.value);
            profiles[name] = isNaN(val) ? 0 : val;
        });
        AppState.vocalProfiles = profiles;
        Storage.saveVocalProfiles();
        this.closeModal();
        this.renderSetlistDetail();
        if (AppState.currentView === 'song-reader' && AppState.currentSetlist && AppState.currentSong) {
            this.viewSetlistSong(AppState.currentSong.id, false);
        }
    },

    // ============ ORDEN DE CANCIÓN — burbujas de colores en franja horizontal ============
    STRUCTURE_RULES: [
        [/^pre[\s-]?coro/i, 'PC', '#7c3aed', '#ffffff'],
        [/^estribillo/i, 'C', '#e11d48', '#ffffff'],
        [/^refr[aá]n/i, 'R', '#ea580c', '#ffffff'],
        [/^coro/i, 'C', '#dc2626', '#ffffff'],
        [/^(estrofa|verso)/i, 'E', '#2563eb', '#ffffff'],
        [/^intro/i, 'I', '#0d9488', '#ffffff'],
        [/^(puente|bridge)/i, 'P', '#16a34a', '#ffffff'],
        [/^interludio/i, 'INT', '#0891b2', '#ffffff'],
        [/^instr(umental)?\.?/i, 'INST', '#d97706', '#ffffff'],
        [/^solo/i, 'S', '#db2777', '#ffffff'],
        [/^outro/i, 'O', '#78716c', '#ffffff'],
        [/^final/i, 'F', '#111827', '#ffffff'],
        [/^tag/i, 'T', '#6b7280', '#ffffff'],
        [/^modulaci[oó]n/i, 'MOD', '#9333ea', '#ffffff'],
        [/^leyenda/i, 'LEY', '#6b7280', '#ffffff'],
        [/^espont[aá]neo/i, 'ESP', '#059669', '#ffffff']
    ],

    buildStructureChip(rawLabel) {
        const original = (rawLabel || '').trim();
        for (const [regex, short, color, textColor] of this.STRUCTURE_RULES) {
            const m = original.match(regex);
            if (m) {
                const rest = original.slice(m[0].length).trim();
                // Los números y las repeticiones van pegados a la abreviatura
                // ("Coro 2" -> C2, "Coro x4" -> Cx4), pero si lo que sigue es otra
                // palabra hace falta un espacio: un nombre compuesto como
                // "Instrumental Puente" se leía "INSTPuente", que no se entiende.
                const pegado = /^(\d|x\s*\d)/i.test(rest);
                const text = rest ? `${short}${pegado ? '' : ' '}${rest}` : short;
                return { text, color, textColor };
            }
        }
        return { text: original, color: '#4b5563', textColor: '#ffffff' };
    },

    // Igual que buildStructureChip pero solo devuelve la clave de categoría (para emparejar
    // entradas del "orden de la canción" con las secciones reales, sin formatear nada).
    getStructureCategoryKey(rawLabel) {
        const original = (rawLabel || '').trim();
        for (const [regex, short] of this.STRUCTURE_RULES) {
            if (original.match(regex)) return short;
        }
        return null;
    },

    getEffectiveStructure(song) {
        if (!song) return [];
        if (AppState.currentSetlist && AppState.currentSetlist.songStructures) {
            const override = AppState.currentSetlist.songStructures[song.id];
            if (override && override.length > 0) return override;
        }
        return song.structure || [];
    },

    renderStructureBar() {
        const bar = document.getElementById('song-structure-bar');
        const inner = document.getElementById('structure-bar-inner');
        if (!bar || !inner) return;
        const structure = this.getEffectiveStructure(AppState.currentSong);
        if (!structure.length) { bar.style.display = 'none'; inner.innerHTML = ''; StickyStructureBar.reset(); return; }
        bar.style.display = 'block';
        inner.innerHTML = structure.map((label, idx) => {
            const { text, color, textColor } = this.buildStructureChip(label);
            return `<span class="structure-chip" style="background:${color};color:${textColor}" data-index="${idx}" data-label="${label.replace(/"/g, '&quot;')}">${text}</span>`;
        }).join('');
        requestAnimationFrame(() => HorizontalStructureSync.update());
    },

    // Detecta si la letra actual se está mostrando "expandida según el orden" (una
    // burbuja = un bloque en pantalla, mismo orden) o "tal cual se escribió" (varias
    // burbujas pueden apuntar al mismo bloque). Del primer caso alcanza con el índice;
    // del segundo hay que buscar la etiqueta correspondiente en el propio texto en pantalla.
    scrollToStructureIndex(index, rawLabel) {
        const sectionEls = Array.from(document.querySelectorAll('#song-content .section'));
        if (!sectionEls.length) return;
        const isExpanded = !!this.getOrderedRenderSections(AppState.currentSong);
        let target = null;
        if (isExpanded) {
            target = sectionEls[index] || null;
        } else {
            const { baseText } = Teleprompter.parseStructureEntry(rawLabel);
            const allLabels = Array.from(document.querySelectorAll('#song-content .section-label'));
            const normalized = baseText.toLowerCase();
            let labelEl = allLabels.find(el => el.textContent.trim().toLowerCase() === normalized);
            if (!labelEl) {
                const category = this.getStructureCategoryKey(baseText);
                if (category) {
                    const sameCategory = allLabels.filter(el => this.getStructureCategoryKey(el.textContent.trim()) === category);
                    if (sameCategory.length) {
                        const numMatch = normalized.match(/(\d+)\s*$/);
                        const instanceNum = numMatch ? parseInt(numMatch[1], 10) : null;
                        labelEl = instanceNum ? sameCategory[Math.min(instanceNum - 1, sameCategory.length - 1)] : sameCategory[0];
                    }
                }
            }
            target = labelEl || null;
        }
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // Botones con los nombres reales de las secciones, para escribir el orden sin
    // tener que ir a mirarlos a la canción. Al pulsar uno se añade esa línea.
    buildStructurePicker(song) {
        const vistos = [];
        (this.splitSectionsIntoAnchors(song) || []).forEach(a => {
            const etiqueta = (a.label || '').trim();
            if (etiqueta && !vistos.includes(etiqueta)) vistos.push(etiqueta);
        });
        if (!vistos.length) return '';
        return `
            <p class="structure-picker-hint">Partes de esta canción — pulsa para añadirlas al orden:</p>
            <div class="structure-picker">
                ${vistos.map(n => `<button type="button" class="structure-pick" data-label="${n.replace(/"/g, '&quot;')}">${n}</button>`).join('')}
            </div>
        `;
    },

    bindStructurePicker(textareaId) {
        const textarea = document.getElementById(textareaId);
        if (!textarea) return;
        document.querySelectorAll('.structure-pick').forEach(btn => {
            btn.addEventListener('click', () => {
                const valor = textarea.value;
                const sep = (!valor || valor.endsWith('\n')) ? '' : '\n';
                textarea.value = valor + sep + btn.dataset.label + '\n';
                textarea.scrollTop = textarea.scrollHeight;
                textarea.focus();
            });
        });
    },

    // Editar el orden PROPIO DE ESTE REPERTORIO (cualquiera puede) — solo disponible viendo desde un repertorio
    showSetlistStructureModal() {
        if (!AppState.currentSetlist || !AppState.currentSong) return;
        const sl = AppState.currentSetlist;
        if (!Perm.canEditSetlist(sl)) return;
        const song = AppState.currentSong;
        const override = (sl.songStructures && sl.songStructures[song.id]) || [];
        const prefill = override.length > 0
            ? override.join('\n')
            : (song.structure && song.structure.length > 0 ? song.structure.join('\n') : (song.sections || []).map(s => s.label).join('\n'));

        this.createModal({
            title: `Orden en "${sl.name}"`,
            content: `
                ${this.buildStructurePicker(song)}
                <div class="form-group">
                    <textarea class="form-textarea" id="setlist-structure-textarea" style="min-height:220px; font-family:var(--mono-font); font-size:0.9rem;">${prefill}</textarea>
                </div>
            `,
            actions: [
                { text: 'Cancelar', action: () => this.closeModal() },
                { text: 'Guardar orden', primary: true, action: () => this.saveSetlistStructure() }
            ]
        });
        this.bindStructurePicker('setlist-structure-textarea');
    },

    saveSetlistStructure() {
        if (!AppState.currentSetlist || !AppState.currentSong || !Perm.canEditSetlist(AppState.currentSetlist)) { this.closeModal(); return; }
        const textarea = document.getElementById('setlist-structure-textarea');
        const lines = (textarea ? textarea.value : '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (!AppState.currentSetlist.songStructures) AppState.currentSetlist.songStructures = {};
        AppState.currentSetlist.songStructures[AppState.currentSong.id] = lines;
        Storage.saveSetlists();
        this.closeModal();
        this.renderStructureBar();
    },
    // ============ FIN ORDEN DE CANCIÓN ============

    // ============ NOTA DE BLOQUE Y VOZ LÍDER POR CANCIÓN, DENTRO DE UN REPERTORIO ============
    getSongBlockNote(song) {
        if (!song || !AppState.currentSetlist || !AppState.currentSetlist.songNotes) return '';
        return AppState.currentSetlist.songNotes[song.id] || '';
    },

    getSongLeadVocal(song) {
        if (!song || !AppState.currentSetlist || !AppState.currentSetlist.songLeadVocals) return '';
        return AppState.currentSetlist.songLeadVocals[song.id] || '';
    },

    showSongNoteModal(songId) {
        if (!AppState.currentSetlist) return;
        const sl = AppState.currentSetlist;
        if (!Perm.canEditSetlist(sl)) return;
        const song = AppState.songs.find(s => s.id === songId);
        if (!song) return;
        const existingNote = (sl.songNotes && sl.songNotes[songId]) || '';

        this.createModal({
            title: `Nota para "${song.title}"`,
            content: `
                <div class="form-group">
                    <textarea class="form-textarea" id="song-note-textarea" style="min-height:120px; font-size:0.9rem;">${existingNote}</textarea>
                </div>
            `,
            actions: [
                { text: 'Cancelar', action: () => this.closeModal() },
                { text: 'Quitar nota', action: () => this.saveSongNote(songId, '') },
                { text: 'Guardar', primary: true, action: () => {
                    const textarea = document.getElementById('song-note-textarea');
                    this.saveSongNote(songId, textarea ? textarea.value.trim() : '');
                } }
            ]
        });
    },

    saveSongNote(songId, text) {
        const sl = AppState.currentSetlist;
        if (!sl || !Perm.canEditSetlist(sl)) { this.closeModal(); return; }
        if (!sl.songNotes) sl.songNotes = {};
        if (text) sl.songNotes[songId] = text;
        else delete sl.songNotes[songId];
        Storage.saveSetlists();
        this.closeModal();
        this.renderSetlistDetail();
        if (AppState.currentSong && AppState.currentSong.id === songId) {
            this.updateReaderBlockNote();
        }
    },

    // Asigna (o quita) la voz líder de una canción dentro del repertorio actual, al instante — sin modal.
    setSongLeadVocal(songId, name) {
        const sl = AppState.currentSetlist;
        if (!sl || !Perm.canEditSetlist(sl)) return;
        if (!sl.songLeadVocals) sl.songLeadVocals = {};
        if (name) sl.songLeadVocals[songId] = name;
        else delete sl.songLeadVocals[songId];
        Storage.saveSetlists();
        this.renderSetlistDetail();
        if (AppState.currentSong && AppState.currentSong.id === songId && AppState.currentSetlist && AppState.currentSetlist.id === sl.id) {
            this.viewSetlistSong(songId, false);
        }
    },

    // Cambio del desplegable de voz en el LECTOR de la canción.
    // Dentro de un repertorio: se guarda igual que setSongLeadVocal.
    // Canción suelta (sin repertorio): solo previsualiza la tonalidad, no se guarda en ningún sitio.
    handleLeadVocalReaderChange(name) {
        if (!AppState.currentSong) return;
        if (AppState.currentSetlist) {
            this.setSongLeadVocal(AppState.currentSong.id, name);
        } else {
            const profiles = AppState.vocalProfiles || {};
            const offset = (name && typeof profiles[name] === 'number') ? profiles[name] : 0;
            AppState.currentTranspose = offset;
            if (AppState.notationMode !== 'degrees') {
                document.getElementById('current-key-reader').textContent =
                    Transposer.cleanChord(Transposer.transpose(AppState.currentSong.keyBase, offset));
            }
            this.renderSongContent();
        }
    },

    updateReaderBlockNote() {
        const el = document.getElementById('reader-block-note');
        if (!el) return;
        if (!AppState.currentSetlist || !AppState.currentSong) { el.style.display = 'none'; el.textContent = ''; return; }
        const note = this.getSongBlockNote(AppState.currentSong);
        if (note) { el.textContent = note; el.style.display = 'inline-block'; }
        else { el.style.display = 'none'; el.textContent = ''; }
    },

    updateReaderLeadVocal() {
        const el = document.getElementById('reader-lead-vocal');
        if (!el) return;
        if (!AppState.currentSetlist || !AppState.currentSong) { el.style.display = 'none'; el.textContent = ''; return; }
        const leadVocal = this.getSongLeadVocal(AppState.currentSong);
        if (leadVocal) { el.textContent = `🎤 Dirige: ${leadVocal}`; el.style.display = 'inline-block'; }
        else { el.style.display = 'none'; el.textContent = ''; }
    },
    // ============ FIN NOTA DE BLOQUE Y VOZ LÍDER ============

    viewSong(songId, push = true) {
        const song = AppState.songs.find(s => s.id === songId);
        if (!song) return;
        window.scrollTo(0, 0);
        AppState.cameFromSetlistId = null;
        AppState.currentSong = song;
        AppState.currentTranspose = 0;
        AppState.baseTransposeOffset = 0;
        AppState.notationMode = 'chords';
        AppState.voiceMode = false;
        this.resetReaderControlsUI();

        document.getElementById('reader-title').textContent = song.title;
        const metaText = this.formatReaderMeta(song);
        const metaEl = document.getElementById('reader-meta');
        metaEl.innerHTML = metaText;
        metaEl.style.display = metaText ? 'block' : 'none';

        const extraEl = document.getElementById('reader-extra-info');
        const extraHtml = this.formatReaderExtra(song);
        if (extraEl) { extraEl.innerHTML = extraHtml; extraEl.style.display = extraHtml ? 'block' : 'none'; }

        document.getElementById('current-key-reader').textContent = song.keyBase;
        this.renderSongContent();
        this.applyReaderFontSize();
        this.renderStructureBar();
        this.navigate('song-reader', false);
        WakeLockManager.request();

        if (push) HistoryManager.push({ view: 'song-reader', songId: song.id, setlistId: null });
    },

    viewSetlistSong(songId, push = true) {
        if (!AppState.currentSetlist) return;
        const catalogSong = AppState.songs.find(s => s.id === songId);
        if (!catalogSong) return;
        // Si este repertorio tiene su propia versión de la canción (acordes y
        // letra cambiados solo aquí), se muestra esa. El catálogo no cambia.
        const song = this.applySetlistVersion(catalogSong, AppState.currentSetlist);
        window.scrollTo(0, 0);

        AppState.cameFromSetlistId = AppState.currentSetlist.id;
        AppState.currentSong = song;
        const canEdit = Perm.canEditSetlist(AppState.currentSetlist);
        const effectiveOffset = this.computeEffectiveOffset(song, AppState.currentSetlist);
        const defaultOffset = this.computeDefaultOffset(song, AppState.currentSetlist);
        AppState.currentTranspose = effectiveOffset;
        // Para quien gestiona el repertorio, "Base" quita el ajuste guardado.
        // Para un miembro, "Base" vuelve al tono que fijó el equipo.
        AppState.baseTransposeOffset = canEdit ? defaultOffset : effectiveOffset;
        AppState.notationMode = 'chords';
        AppState.voiceMode = false;
        this.resetReaderControlsUI();

        // Orden propio y voz líder: solo quien gestiona el repertorio. Los demás
        // ven quién dirige en la etiqueta de arriba.
        const structureSetlistBtn = document.getElementById('btn-song-structure-setlist');
        if (structureSetlistBtn) structureSetlistBtn.style.display = canEdit ? 'inline-flex' : 'none';
        const leadVocalWrap = document.getElementById('lead-vocal-controls-wrap');
        if (leadVocalWrap) leadVocalWrap.classList.toggle('lv-hidden', !canEdit);

        document.getElementById('reader-title').textContent = song.title;
        const metaText = this.formatReaderMeta(song);
        const metaEl = document.getElementById('reader-meta');
        metaEl.innerHTML = metaText;
        metaEl.style.display = metaText ? 'block' : 'none';

        const extraEl = document.getElementById('reader-extra-info');
        if (extraEl) { extraEl.style.display = 'none'; extraEl.innerHTML = ''; }

        document.getElementById('current-key-reader').textContent = Transposer.cleanChord(Transposer.transpose(song.keyBase, effectiveOffset));
        this.renderSongContent();
        this.applyReaderFontSize();
        this.renderStructureBar();
        this.updateReaderBlockNote();
        this.updateReaderLeadVocal();
        this.updateReaderVersionNote(canEdit);
        this.populateLeadVocalReaderSelect((AppState.currentSetlist.songLeadVocals && AppState.currentSetlist.songLeadVocals[song.id]) || '');
        this.updateSetlistNavControls();
        this.navigate('song-reader', false);
        WakeLockManager.request();

        if (push) HistoryManager.push({ view: 'song-reader', songId: song.id, setlistId: AppState.currentSetlist.id });
    },

    // ============ VERSIÓN PROPIA DE UNA CANCIÓN EN UN REPERTORIO ============
    // El creador del repertorio o el líder pueden cambiar acordes y letra de
    // una canción SOLO para ese repertorio. Se guarda dentro del repertorio
    // (songVersions[idCanción]); el catálogo y los demás repertorios no cambian.
    getSetlistVersion(songId, setlist) {
        const sl = setlist || AppState.currentSetlist;
        return (sl && sl.songVersions && sl.songVersions[songId]) || null;
    },

    // Devuelve la canción tal como se ve en este repertorio: igual que la del
    // catálogo, pero con las secciones de su versión propia si la tiene.
    applySetlistVersion(song, setlist) {
        const version = this.getSetlistVersion(song.id, setlist);
        if (!version || !Array.isArray(version.sections) || !version.sections.length) return song;
        return { ...song, sections: version.sections, _setlistVersion: version };
    },

    // Pasa las secciones a texto (acordes encima de la letra), para editarlas.
    sectionsToText(sections) {
        return (sections || []).map(section => {
            const lines = [section.label || ''];
            (section.pairs || []).forEach(pair => {
                if (pair.acordes && pair.acordes.trim()) lines.push(pair.acordes.replace(/\s+$/, ''));
                if (pair.letra && pair.letra.trim()) lines.push(pair.letra.replace(/\s+$/, ''));
            });
            return lines.join('\n');
        }).join('\n\n');
    },

    updateReaderVersionNote(canEdit) {
        const btn = document.getElementById('btn-setlist-version');
        if (btn) btn.style.display = canEdit ? 'inline-flex' : 'none';
        const el = document.getElementById('reader-version-note');
        if (!el) return;
        const version = AppState.currentSong && AppState.currentSong._setlistVersion;
        if (!version) { el.style.display = 'none'; el.innerHTML = ''; return; }
        const who = version.updatedByName ? ` · por ${this.escapeHtml(version.updatedByName)}` : '';
        el.innerHTML = `✏️ Versión de este repertorio${who}` +
            (canEdit ? ` <button type="button" class="version-revert-btn" onclick="Router.revertSetlistVersion()">Volver a la original</button>` : '');
        el.style.display = 'inline-flex';
    },

    // Editor a pantalla completa, pensado sobre todo para móvil y tablet:
    // barra fija con Cancelar/Guardar, atajos para #, b, m, 7… (que en el
    // teclado del móvil están escondidos), letra de 16 px (en iPhone, con
    // menos, la pantalla hace zoom sola) y sin autocorrector (cambiaría "Em"
    // por "Me"). Se edita en el tono que se está viendo; al guardar se
    // devuelve al tono base de la canción.
    showSetlistVersionEditor() {
        const sl = AppState.currentSetlist;
        const song = AppState.currentSong;
        if (!sl || !song || !Perm.canEditSetlist(sl)) return;
        VersionEditor.open({
            song,
            setlist: sl,
            transpose: AppState.notationMode === 'degrees' ? 0 : (AppState.currentTranspose || 0),
            hasVersion: !!this.getSetlistVersion(song.id, sl)
        });
    },

    // Pasa las secciones a texto en el tono indicado (solo cambian los acordes).
    sectionsToTextInKey(sections, semitones) {
        if (!semitones) return this.sectionsToText(sections);
        const moved = (sections || []).map(sec => ({
            label: sec.label,
            pairs: (sec.pairs || []).map(p => ({
                acordes: p.acordes && p.acordes.trim() ? Transposer.cleanChord(Transposer.transpose(p.acordes, semitones)) : p.acordes,
                letra: p.letra
            }))
        }));
        return this.sectionsToText(moved);
    },

    // text: lo escrito en el editor; semitones: tono en el que se editó.
    saveSetlistVersion(text, semitones, initialText) {
        const sl = AppState.currentSetlist;
        const song = AppState.currentSong;
        if (!sl || !song || !Perm.canEditSetlist(sl)) return false;
        if (!text || !text.trim()) {
            alert('La canción no puede quedar vacía. Si quieres volver a la del catálogo, usa "Volver a la original".');
            return false;
        }
        // Sin cambios: no se toca nada.
        if (text === initialText) return true;
        let sections = ChordParser.detectAndParse(text, true);
        if (!sections.length) { alert('No se ha podido leer la canción. Revisa el texto.'); return false; }
        // Se guarda siempre en el tono base de la canción.
        if (semitones) {
            sections = sections.map(sec => ({
                label: sec.label,
                pairs: sec.pairs.map(p => ({
                    acordes: p.acordes && p.acordes.trim() ? Transposer.cleanChord(Transposer.transpose(p.acordes, -semitones)) : p.acordes,
                    letra: p.letra
                }))
            }));
        }
        const original = AppState.songs.find(s => s.id === song.id);
        if (!sl.songVersions) sl.songVersions = {};
        // Si ha quedado igual que la del catálogo, no hace falta guardar una versión.
        if (original && this.sectionsToText(sections) === this.sectionsToText(original.sections)) {
            delete sl.songVersions[song.id];
        } else {
            sl.songVersions[song.id] = {
                sections,
                updatedAt: new Date().toISOString(),
                updatedBy: Perm.uid(),
                updatedByName: AppState.member ? (AppState.member.name || '') : ''
            };
        }
        Storage.saveSetlist(sl);
        const keepTranspose = AppState.currentTranspose;
        this.viewSetlistSong(song.id, false);
        if (keepTranspose !== AppState.currentTranspose) {
            AppState.currentTranspose = keepTranspose;
            document.getElementById('current-key-reader').textContent =
                Transposer.cleanChord(Transposer.transpose(AppState.currentSong.keyBase, keepTranspose));
            this.renderSongContent();
        }
        this.renderSetlistDetail();
        return true;
    },

    revertSetlistVersion() {
        const sl = AppState.currentSetlist;
        const song = AppState.currentSong;
        if (!sl || !song || !Perm.canEditSetlist(sl)) return;
        if (!this.getSetlistVersion(song.id, sl)) return;
        if (!confirm('¿Volver a la versión del catálogo? Se perderán los cambios hechos en este repertorio.')) return;
        delete sl.songVersions[song.id];
        Storage.saveSetlist(sl);
        this.viewSetlistSong(song.id, false);
        this.renderSetlistDetail();
    },
    // ============ FIN VERSIÓN PROPIA ============

    resetReaderControlsUI() {
        const toggleBtn = document.getElementById('btn-toggle-notation');
        if (toggleBtn) toggleBtn.textContent = 'Ver en grados';
        const voiceBtn = document.getElementById('btn-voice-mode');
        if (voiceBtn) { voiceBtn.classList.remove('active-mode'); voiceBtn.textContent = '🎤 Modo Voz'; }
        const songContent = document.getElementById('song-content');
        if (songContent) songContent.classList.remove('voice-mode');
        const setlistNav = document.getElementById('setlist-nav-controls');
        if (setlistNav) setlistNav.style.display = 'none';
        const editBtn = document.getElementById('btn-edit-song');
        if (editBtn) editBtn.style.display = AppState.isAdmin ? 'inline-flex' : 'none';
        const structureSetlistBtn = document.getElementById('btn-song-structure-setlist');
        if (structureSetlistBtn) structureSetlistBtn.style.display = 'none';
        const extraEl = document.getElementById('reader-extra-info');
        if (extraEl) { extraEl.style.display = 'none'; extraEl.innerHTML = ''; }
        const blockNoteEl = document.getElementById('reader-block-note');
        if (blockNoteEl) { blockNoteEl.style.display = 'none'; blockNoteEl.textContent = ''; }
        const versionNoteEl = document.getElementById('reader-version-note');
        if (versionNoteEl) { versionNoteEl.style.display = 'none'; versionNoteEl.innerHTML = ''; }
        const versionBtn = document.getElementById('btn-setlist-version');
        if (versionBtn) versionBtn.style.display = 'none';
        const leadVocalEl = document.getElementById('reader-lead-vocal');
        if (leadVocalEl) { leadVocalEl.style.display = 'none'; leadVocalEl.textContent = ''; }
        const leadVocalSelect = document.getElementById('lead-vocal-reader-select');
        if (leadVocalSelect) leadVocalSelect.value = '';
        const leadVocalWrap = document.getElementById('lead-vocal-controls-wrap');
        if (leadVocalWrap) leadVocalWrap.classList.add('lv-hidden');
        StickyStructureBar.reset();
        Teleprompter.reset();
        // Si el vídeo o el metrónomo que están abiertos son de la canción que se
        // acaba de abrir, se dejan en marcha: es justo lo que quieres en un ensayo.
        const sameSongId = AppState.currentSong ? AppState.currentSong.id : null;
        if (this.youtubePlayerSongId !== sameSongId) this.closeYoutubeMiniPlayer();
        if (Metronome.songId !== sameSongId) Metronome.close();
        this.exitFullscreenMode();
    },

    updateSetlistNavControls() {
        const setlistNav = document.getElementById('setlist-nav-controls');
        const posLabel = document.getElementById('setlist-position-label');
        if (!setlistNav || !AppState.currentSetlist || !AppState.currentSong) return;
        const ids = AppState.currentSetlist.songIds || [];
        const idx = ids.indexOf(AppState.currentSong.id);
        if (idx === -1) { setlistNav.style.display = 'none'; return; }
        setlistNav.style.display = 'flex';
        posLabel.textContent = `${idx + 1} / ${ids.length}`;
        const prevBtn = document.getElementById('btn-prev-setlist-song');
        const nextBtn = document.getElementById('btn-next-setlist-song');
        if (prevBtn) prevBtn.disabled = idx <= 0;
        if (nextBtn) nextBtn.disabled = idx >= ids.length - 1;
    },

    gotoSetlistSong(direction) {
        if (!AppState.currentSetlist || !AppState.currentSong) return;
        const ids = AppState.currentSetlist.songIds || [];
        const idx = ids.indexOf(AppState.currentSong.id);
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= ids.length) return;
        const wasFullscreen = AppState.fullscreenMode;
        this.viewSetlistSong(ids[newIdx], false);
        if (wasFullscreen) { AppState.fullscreenMode = true; document.body.classList.add('fullscreen-active'); FullscreenUI.show(); }
    },

    editSong(songId) {
        if (!AppState.isAdmin) return;
        const song = AppState.songs.find(s => s.id === songId);
        if (!song) return;
        AppState.editingSongId = songId;
        AppState.currentSong = JSON.parse(JSON.stringify(song));
        AppState.isCreatingNew = false;
        this.navigate('edicion');
        Editor.loadSong(AppState.currentSong);
    },

    deleteSong(songId) {
        if (!AppState.isAdmin) return;
        if (confirm('¿Estás seguro de que quieres eliminar esta canción?')) {
            AppState.songs = AppState.songs.filter(s => s.id !== songId);
            Storage.deleteSong(songId);
            // Los restos que quedan en los repertorios (notas, voz, tono, orden) se
            // limpian solos la próxima vez que quien gestiona cada repertorio lo
            // guarde. Mientras tanto la canción simplemente no aparece.
            this.renderSongsList();
        }
    },

    // Versión sin DOM de la misma idea que usa el teleprompter para "anclas": separa
    // las secciones originales en bloques más chicos cuando dentro de una sección hay
    // una etiqueta interna (ej. una Estrofa que en realidad contiene un Pre-Coro metido
    // adentro). Sirve para poder armar la vista "según el orden" sin depender de medir
    // posiciones en pantalla.
    splitSectionsIntoAnchors(song) {
        const anchors = [];
        (song.sections || []).forEach(sectionData => {
            let current = { label: sectionData.label || '', pairs: [] };
            anchors.push(current);
            (sectionData.pairs || []).forEach(pair => {
                const letraTrim = (pair.letra || '').trim();
                const acordesEmpty = !pair.acordes || !pair.acordes.trim();
                const isInline = letraTrim && acordesEmpty && ChordParser.isSectionHeader(letraTrim);
                if (isInline) {
                    const inlineName = ChordParser.normalizeSectionName(letraTrim);
                    current = { label: inlineName, pairs: [] };
                    anchors.push(current);
                } else {
                    current.pairs.push(pair);
                }
            });
        });
        return anchors;
    },

    // Arma la letra siguiendo el "Orden de la canción" en vez del orden en que se
    // escribió originalmente: cada línea del orden (ej. "Coro x8") se convierte en su
    // propio bloque, con ese texto completo como título y el contenido de esa sección
    // debajo. Devuelve null si la canción no tiene ningún orden cargado.
    getOrderedRenderSections(song) {
        const structureRaw = this.getEffectiveStructure(song);
        if (!structureRaw.length) return null;
        const anchors = this.splitSectionsIntoAnchors(song);
        if (!anchors.length) return null;
        const result = [];
        structureRaw.forEach(rawEntry => {
            const { baseText } = Teleprompter.parseStructureEntry(rawEntry);
            const match = Teleprompter.matchSection(baseText, anchors);
            if (!match) return;
            result.push({ label: rawEntry.trim(), pairs: match.pairs });
        });
        return result.length ? result : null;
    },

    renderSongContent() {
        const content = document.getElementById('song-content');
        if (!AppState.currentSong) return;
        const song = AppState.currentSong;
        const mode = AppState.notationMode || 'chords';

        // Si la canción tiene un orden cargado, la letra se arma siguiendo ESE orden
        // (repitiendo bloques según haga falta), tanto desde Canciones como dentro
        // de un repertorio. Sin orden cargado se ve tal cual se escribió.
        // OJO: lo que el orden no mencione, no aparece.
        let sectionsToRender = song.sections;
        const ordered = this.getOrderedRenderSections(song);
        if (ordered) sectionsToRender = ordered;

        content.innerHTML = sectionsToRender.map(section => {
            const sectionChip = this.buildStructureChip(section.label);
            return `
            <div class="section">
                <div class="section-label" style="background:${sectionChip.color};color:${sectionChip.textColor}">${section.label}</div>
                ${section.pairs.map(pair => {
                    const letraTrim = (pair.letra || '').trim();
                    const acordesEmpty = !pair.acordes || !pair.acordes.trim();
                    if (letraTrim && acordesEmpty && ChordParser.isSectionHeader(letraTrim)) {
                        const inlineName = ChordParser.normalizeSectionName(letraTrim);
                        const inlineChip = this.buildStructureChip(inlineName);
                        return `<div class="section-label inline-label" style="background:${inlineChip.color};color:${inlineChip.textColor}">${inlineName}</div>`;
                    }
                    let chordDisplay = '';
                    if (pair.acordes) {
                        chordDisplay = mode === 'degrees'
                            ? KeyDegrees.toDegrees(pair.acordes, song.keyBase)
                            : Transposer.cleanChord(Transposer.transpose(pair.acordes, AppState.currentTranspose));
                    }
                    return `
                        <div class="pair">
                            ${chordDisplay ? `<div class="chord-line">${chordDisplay}</div>` : ''}
                            ${pair.letra ? `<div class="lyric-line">${pair.letra}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        }).join('');
        // Línea de créditos al final, solo con los datos que tenga la canción.
        const credits = this.formatSongCredits(song);
        if (credits) content.insertAdjacentHTML('beforeend', `<div class="song-credits">${credits}</div>`);
        content.classList.toggle('voice-mode', !!AppState.voiceMode);
    },

    // "Autores: … · © … · CCLI Canción # …" — cada parte solo si existe.
    formatSongCredits(song) {
        if (!song) return '';
        const parts = [];
        const authors = (song.authors || '').trim();
        const copyright = (song.copyright || '').trim();
        const ccli = (song.ccliNumber || '').trim();
        if (authors) parts.push(`Autores: ${this.escapeHtml(authors)}`);
        if (copyright) parts.push(this.escapeHtml(/^(©|\(c\))/i.test(copyright) ? copyright : `© ${copyright}`));
        if (ccli) parts.push(`CCLI Canción # ${this.escapeHtml(ccli)}`);
        return parts.join(' · ');
    },

    // Sincroniza el valor mostrado en el desplegable de tonalidad con el estado actual
    // (tonalidad transportada, o "GRADOS" si está en modo grados).
    transposeSong(semitones) {
        if (!AppState.currentSong) return;
        AppState.currentTranspose += semitones;
        this.persistSetlistTransposeOverride();
        if (AppState.notationMode !== 'degrees') {
            document.getElementById('current-key-reader').textContent =
                Transposer.cleanChord(Transposer.transpose(AppState.currentSong.keyBase, AppState.currentTranspose));
        }
        this.renderSongContent();
    },

    resetTransposition() {
        const target = AppState.baseTransposeOffset || 0;
        if (AppState.currentTranspose === target) return;
        AppState.currentTranspose = target;
        this.clearSetlistTransposeOverride();
        if (AppState.notationMode !== 'degrees') {
            document.getElementById('current-key-reader').textContent =
                Transposer.cleanChord(Transposer.transpose(AppState.currentSong.keyBase, target));
        }
        this.renderSongContent();
    },

    toggleNotation() {
        if (!AppState.currentSong) return;
        AppState.notationMode = AppState.notationMode === 'degrees' ? 'chords' : 'degrees';
        const btn = document.getElementById('btn-toggle-notation');
        if (btn) btn.textContent = AppState.notationMode === 'degrees' ? '🎹 Ver acordes' : 'Ver en grados';
        const keyLabel = document.getElementById('current-key-reader');
        keyLabel.textContent = AppState.notationMode === 'degrees'
            ? 'Grados'
            : Transposer.cleanChord(Transposer.transpose(AppState.currentSong.keyBase, AppState.currentTranspose));
        this.renderSongContent();
    },

    toggleVoiceMode() {
        if (!AppState.currentSong) return;
        AppState.voiceMode = !AppState.voiceMode;
        const btn = document.getElementById('btn-voice-mode');
        if (btn) { btn.textContent = AppState.voiceMode ? '🎹 Ver acordes' : '🎤 Modo Voz'; btn.classList.toggle('active-mode', AppState.voiceMode); }
        this.renderSongContent();
    },

    showInitialDialog() {
        if (!AppState.isAdmin) { AppState.isCreatingNew = false; this.navigate('canciones'); return; }
        const newSongId = this.generateId();
        this.createModal({
            title: 'Nueva Canción',
            content: `
                <div class="form-group"><label class="form-label">Título *</label><input type="text" class="form-input" id="modal-title" required></div>
                <div class="form-group"><label class="form-label">Autor/Intérprete</label><input type="text" class="form-input" id="modal-artist"></div>
                <div class="form-group">
                    <label class="form-label">Tonalidad Base (se puede detectar automáticamente después)</label>
                    <select class="form-select" id="modal-key">
                        <option value="C">C</option><option value="C#">C#</option><option value="D">D</option>
                        <option value="D#">D#</option><option value="E">E</option><option value="F">F</option>
                        <option value="F#">F#</option><option value="G">G</option><option value="G#">G#</option>
                        <option value="A">A</option><option value="A#">A#</option><option value="B">B</option>
                    </select>
                </div>
            `,
            actions: [
                { text: 'Cancelar', action: () => { this.closeModal(); AppState.isCreatingNew = false; this.navigate('canciones'); } },
                { text: 'Continuar', primary: true, action: () => this.proceedToCreation(newSongId) }
            ]
        });
    },

    proceedToCreation(songId) {
        const title = document.getElementById('modal-title').value.trim();
        if (!title) { alert('El título es obligatorio'); return; }
        const songData = {
            id: songId, title, artist: document.getElementById('modal-artist').value.trim(),
            keyBase: document.getElementById('modal-key').value, bpm: null, compas: '',
            originalKey: '', youtubeLink: '', structure: [],
            autoSections: AppState.settings.autoSections,
            sections: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
        AppState.currentSong = songData;
        AppState.editingSongId = null;
        this.closeModal();
        this.showTextInput();
    },

    showTextInput() {
        this.createModal({
            title: 'Pegar texto de la canción',
            content: `<div class="form-group"><textarea class="form-textarea" id="song-text-input" placeholder="Pega aquí el texto completo de tu canción con acordes y letra..."></textarea></div>`,
            actions: [
                { text: 'Cancelar', action: () => { this.closeModal(); AppState.isCreatingNew = false; this.navigate('canciones'); } },
                { text: 'Convertir a pares', primary: true, action: () => this.parseTextInput() }
            ]
        });
    },

    parseTextInput() {
        const text = document.getElementById('song-text-input').value;
        if (!text.trim()) { alert('Por favor, ingresa el texto de la canción.'); return; }
        const sections = ChordParser.detectAndParse(text, AppState.currentSong.autoSections);
        if (sections.length === 0) { alert('No se pudieron detectar acordes o letra en el texto.'); return; }
        AppState.currentSong.sections = sections;
        const detectedKey = KeyDetector.detectKey(sections);
        if (detectedKey) AppState.currentSong.keyBase = detectedKey;
        const bpmMatch = text.match(/TEMPO\s*:?\s*(\d+)/i);
        if (bpmMatch) AppState.currentSong.bpm = parseInt(bpmMatch[1]);
        const compasMatch = text.match(/Comp[aá]s\s*:?\s*(\d+\s*\/\s*\d+)/i);
        if (compasMatch) AppState.currentSong.compas = compasMatch[1].replace(/\s/g, '');
        AppState.isCreatingNew = false;
        this.closeModal();
        Editor.loadSong(AppState.currentSong);
    },

    // ============ REPERTORIO — sin cambios, abierto a todos ============
    showNewSetlistModal() {
        if (!Perm.canCreateSetlist()) return;
        const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const today = new Date();
        const defaultName = `${days[today.getDay()].charAt(0).toUpperCase() + days[today.getDay()].slice(1)} ${today.getDate()}/${today.getMonth() + 1}`;
        this.createModal({
            title: 'Nuevo repertorio',
            content: `
                <div class="form-group"><label class="form-label">Nombre *</label><input type="text" class="form-input" id="modal-setlist-name" value="${defaultName}"></div>
            `,
            actions: [
                { text: 'Cancelar', action: () => this.closeModal() },
                { text: 'Crear', primary: true, action: () => this.createSetlist() }
            ]
        });
    },

    // Solo el líder y los directores técnicos crean repertorios. Quien lo crea
    // queda como su "creador" y puede gestionarlo (además del líder).
    createSetlist() {
        if (!Perm.canCreateSetlist()) { this.closeModal(); return; }
        const name = document.getElementById('modal-setlist-name').value.trim();
        if (!name) { alert('El nombre es obligatorio'); return; }
        const setlist = {
            id: this.generateId(), name,
            createdBy: Perm.uid(),
            createdByName: AppState.member ? AppState.member.name : '',
            uniformKey: null, songStructures: {}, songNotes: {}, songLeadVocals: {}, songTransposeOverrides: {},
            convocados: {}, songIds: [], createdAt: new Date().toISOString()
        };
        AppState.setlists.push(setlist);
        AppState.currentSetlist = setlist;
        Storage.saveSetlist(setlist);
        this.closeModal();
        this.openSetlist(setlist.id);
    },

    // "1 canción" / "2 canciones" — sin el "(es)" entre paréntesis.
    formatSongCount(count) {
        return count === 1 ? '1 canción' : `${count} canciones`;
    },

    // Fecha corta ("23 sept"). Si el repertorio es de otro año se añade el año,
    // para que no parezca de este.
    formatShortDate(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        const opts = { day: 'numeric', month: 'short' };
        if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
        return d.toLocaleDateString('es-ES', opts).replace(/\./g, '');
    },

    // Las primeras canciones del repertorio, para saber qué hay dentro sin abrirlo.
    formatSetlistPreview(sl) {
        const titles = (sl.songIds || [])
            .map(id => AppState.songs.find(s => s.id === id))
            .filter(Boolean)
            .map(s => s.title);
        if (!titles.length) return 'Todavía sin canciones';
        const shown = titles.slice(0, 3).join(' · ');
        const rest = titles.length - 3;
        return rest > 0 ? `${shown} · +${rest}` : shown;
    },

    // Línea discreta de abajo: cuántas canciones, cuándo se creó y quién lo hizo.
    formatSetlistMeta(sl) {
        const parts = [this.formatSongCount((sl.songIds || []).length)];
        const date = this.formatShortDate(sl.createdAt);
        if (date) parts.push(date);
        const creator = sl.createdByName || sl.creatorName;
        if (creator) parts.push(`por ${this.escapeHtml(creator)}`);
        return parts.join(' • ');
    },

    renderSetlistsList() {
        const grid = document.getElementById('repertorio-grid');
        const emptyState = document.getElementById('repertorio-empty-state');
        // Si se llama antes de que la vista exista en la página, no hacemos nada:
        // vendrá otra llamada en cuanto esté lista.
        if (!grid || !emptyState) return;
        if (!AppState.teamId) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            emptyState.innerHTML = `<h3>Todavía no estás en ningún equipo</h3>
                <p>Los repertorios son de cada equipo. Cuando tengas el código de tu equipo, únete desde aquí.</p>
                <button class="btn btn-primary" style="margin-top:1rem;" onclick="Gate.goToOnboarding()">Unirme o crear un equipo</button>`;
            return;
        }
        if (AppState.setlists.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            emptyState.innerHTML = '<h3>Aún no hay repertorios</h3><p>' +
                (Perm.canCreateSetlist() ? 'Crea uno con "+ Nuevo" para armar la lista del domingo.' : 'Cuando el coordinador o un director técnico cree uno, aparecerá aquí.') + '</p>';
            return;
        }
        emptyState.style.display = 'none';
        grid.style.display = 'block';
        const sorted = [...AppState.setlists].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        grid.innerHTML = sorted.map(sl => `
            <div class="song-item setlist-item" onclick="Router.openSetlist('${sl.id}')">
                <div class="song-info">
                    <div class="song-title">${this.escapeHtml(sl.name)}</div>
                    <div class="setlist-preview">${this.escapeHtml(this.formatSetlistPreview(sl))}</div>
                    <div class="song-meta">${this.formatSetlistMeta(sl)}</div>
                </div>
                ${Perm.canEditSetlist(sl) ? `
                <div class="song-actions" onclick="event.stopPropagation()">
                    <button class="action-btn delete-btn btn-delete-compact" onclick="Router.deleteSetlist('${sl.id}')" title="Eliminar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        </svg>
                    </button>
                </div>` : ''}
            </div>
        `).join('');
    },

    openSetlist(setlistId, push = true) {
        const sl = AppState.setlists.find(s => s.id === setlistId);
        if (!sl) return;
        if (!sl.songStructures) sl.songStructures = {};
        if (!sl.songNotes) sl.songNotes = {};
        if (!sl.songLeadVocals) sl.songLeadVocals = {};
        if (!sl.songTransposeOverrides) sl.songTransposeOverrides = {};
        if (!sl.convocados) sl.convocados = {};
        AppState.currentSetlist = sl;
        this.navigate('repertorio-detail', false);
        if (push) HistoryManager.push({ view: 'repertorio-detail', setlistId });
    },

    deleteSetlist(setlistId) {
        const sl = AppState.setlists.find(s => s.id === setlistId);
        if (!sl || !Perm.canEditSetlist(sl)) return;
        if (confirm(`¿Eliminar el repertorio "${sl.name}"? No se puede deshacer.`)) {
            AppState.setlists = AppState.setlists.filter(s => s.id !== setlistId);
            Storage.deleteSetlist(setlistId);
            this.renderSetlistsList();
        }
    },

    toggleSetlistMenu() {
        const menu = document.getElementById('setlist-menu');
        if (menu) menu.hidden = !menu.hidden;
    },
    closeSetlistMenu() {
        const menu = document.getElementById('setlist-menu');
        if (menu) menu.hidden = true;
    },

    // Reordenar y borrar canciones se hace al preparar el repertorio, no al
    // tocarlo. Por eso esos botones viven en un modo aparte: así el domingo la
    // lista es solo la lista y cabe mucho más en pantalla.
    toggleSetlistEditMode() {
        if (!Perm.canEditSetlist(AppState.currentSetlist)) { AppState.setlistEditMode = false; return; }
        AppState.setlistEditMode = !AppState.setlistEditMode;
        this.renderSetlistDetail();
    },

    updateSetlistEditUI() {
        const list = document.getElementById('setlist-songs-list');
        if (list) list.classList.toggle('edit-mode', AppState.setlistEditMode);
        const btn = document.getElementById('btn-toggle-setlist-edit');
        if (btn) {
            btn.classList.toggle('active-mode', AppState.setlistEditMode);
            btn.textContent = AppState.setlistEditMode ? '✓ Terminar edición' : '✏️ Editar lista';
        }
        const bar = document.getElementById('setlist-edit-bar');
        if (bar) bar.hidden = !AppState.setlistEditMode;
    },

    renderSetlistDetail() {
        if (!AppState.currentSetlist) { this.navigate('repertorio'); return; }
        const sl = AppState.currentSetlist;
        // Quien no gestiona este repertorio lo ve y lo usa, pero no lo modifica:
        // sin menú de opciones, nombre bloqueado y voz líder solo como etiqueta.
        const canEdit = Perm.canEditSetlist(sl);
        if (!canEdit) AppState.setlistEditMode = false;
        const nameInput = document.getElementById('setlist-name-input');
        if (nameInput) {
            if (document.activeElement !== nameInput) nameInput.value = sl.name;
            nameInput.readOnly = !canEdit;
        }
        const menuWrap = document.querySelector('#view-repertorio-detail .setlist-menu-wrap');
        if (menuWrap) menuWrap.style.display = canEdit ? '' : 'none';
        if (!canEdit) this.closeSetlistMenu();
        this.renderConvocadosDisplay();

        const badge = document.getElementById('uniform-key-badge');
        const clearBtn = document.getElementById('btn-clear-uniform-key');
        if (badge) {
            if (sl.uniformKey) { badge.style.display = 'inline'; badge.textContent = `Tonalidad uniforme: ${sl.uniformKey}`; if (clearBtn) clearBtn.style.display = 'inline-flex'; }
            else { badge.style.display = 'none'; if (clearBtn) clearBtn.style.display = 'none'; }
        }

        const list = document.getElementById('setlist-songs-list');
        const empty = document.getElementById('setlist-empty-state');
        const songs = (sl.songIds || []).map(id => AppState.songs.find(s => s.id === id)).filter(Boolean);

        if (!list || !empty) return;
        this.updateSetlistEditUI();
        if (songs.length === 0) { list.style.display = 'none'; empty.style.display = 'block'; return; }
        empty.style.display = 'none';
        list.style.display = 'block';

        list.innerHTML = songs.map((song, idx) => {
            const offset = this.computeEffectiveOffset(song, sl);
            const displayKey = offset !== 0 ? Transposer.cleanChord(Transposer.transpose(song.keyBase, offset)) : song.keyBase;
            const note = (sl.songNotes && sl.songNotes[song.id]) || '';
            const leadVocal = (sl.songLeadVocals && sl.songLeadVocals[song.id]) || '';
            // Tonalidad, BPM (abre el metrónomo) y vídeo, sin salir de la lista:
            // en un ensayo son las tres referencias que se piden a cada rato.
            const metaParts = [`${displayKey}${offset !== 0 ? ` (orig. ${song.keyBase})` : ''}`];
            if (this.getSetlistVersion(song.id, sl)) metaParts.push('<span class="version-tag">✏️ versión propia</span>');
            if (song.bpm) {
                metaParts.push(`<span class="reader-bpm-clickable" title="Abrir metrónomo" onclick="event.stopPropagation(); Router.openMetronomeForSong('${song.id}')">${song.bpm} BPM</span>`);
            }
            if (song.youtubeLink) {
                const safeUrl = song.youtubeLink.replace(/'/g, '&#39;');
                metaParts.push(`<button type="button" class="youtube-inline-btn" onclick="event.stopPropagation(); Router.showYoutubeModal('${safeUrl}', '${song.id}')">▶ Vídeo</button>`);
            }
            return `
            <div class="song-item" onclick="Router.viewSetlistSong('${song.id}')">
                <div class="song-info">
                    ${note ? `<div class="song-block-note">${this.escapeHtml(note)}</div>` : ''}
                    <div class="song-title">${idx + 1}. ${song.title}</div>
                    <div class="song-meta">${metaParts.join(' • ')}</div>
                    ${canEdit ? `
                    <select class="lead-vocal-select" onclick="event.stopPropagation()" onchange="event.stopPropagation(); Router.setSongLeadVocal('${song.id}', this.value)">
                        <option value="">🎤 Sin asignar</option>
                        ${this.leadVocalOptions(leadVocal).map(name => `<option value="${this.escapeAttr(name)}" ${name === leadVocal ? 'selected' : ''}>🎤 ${this.escapeHtml(name)}</option>`).join('')}
                    </select>` : (leadVocal ? `<div class="lead-vocal-tag">🎤 ${this.escapeHtml(leadVocal)}</div>` : '')}
                </div>
                <div class="song-actions" onclick="event.stopPropagation()">
                    <button class="action-btn note-btn ${note ? 'has-note' : ''}" onclick="Router.showSongNoteModal('${song.id}')" title="${note ? 'Editar nota' : 'Añadir nota'}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                    </button>
                    <button class="action-btn" onclick="Router.moveSetlistSong(${idx}, -1)" title="Subir" ${idx === 0 ? 'style="opacity:0.3;pointer-events:none;"' : ''}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                    </button>
                    <button class="action-btn" onclick="Router.moveSetlistSong(${idx}, 1)" title="Bajar" ${idx === songs.length - 1 ? 'style="opacity:0.3;pointer-events:none;"' : ''}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                    </button>
                    <button class="action-btn delete-btn" onclick="Router.removeSetlistSong('${song.id}')" title="Quitar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        }).join('');
        this.updateSetlistEditUI();
    },

    // Abre el metrónomo de una canción sin tener que entrar en ella.
    openMetronomeForSong(songId) {
        const song = AppState.songs.find(s => s.id === songId);
        if (song) Metronome.open(song);
    },

    moveSetlistSong(index, direction) {
        const sl = AppState.currentSetlist;
        if (!sl || !Perm.canEditSetlist(sl)) return;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= sl.songIds.length) return;
        const id = sl.songIds.splice(index, 1)[0];
        sl.songIds.splice(newIndex, 0, id);
        Storage.saveSetlists();
        this.renderSetlistDetail();
    },

    removeSetlistSong(songId) {
        const sl = AppState.currentSetlist;
        if (!sl || !Perm.canEditSetlist(sl)) return;
        sl.songIds = sl.songIds.filter(id => id !== songId);
        Storage.saveSetlists();
        this.renderSetlistDetail();
    },

    showAddSongsToSetlistModal() {
        if (!AppState.currentSetlist || !Perm.canEditSetlist(AppState.currentSetlist)) return;
        const currentIds = AppState.currentSetlist.songIds || [];
        const available = AppState.songs.filter(s => !currentIds.includes(s.id));
        if (available.length === 0) { alert('Todas las canciones ya están en este repertorio.'); return; }
        const sorted = [...available].sort((a, b) => a.title.localeCompare(b.title, 'es'));
        this.createModal({
            title: 'Añadir canciones al repertorio',
            content: `
                <div class="form-group"><input type="text" class="form-input" id="setlist-add-search" placeholder="Buscar..."></div>
                <div id="setlist-add-list">
                    ${sorted.map(song => `
                        <div class="import-preview-item" data-title="${song.title.toLowerCase()}">
                            <input type="checkbox" data-song-id="${song.id}" class="setlist-add-checkbox">
                            <div class="import-preview-info">
                                <div class="import-preview-title">${song.title}</div>
                                <div class="import-preview-meta">${song.keyBase}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `,
            actions: [
                { text: 'Cancelar', action: () => this.closeModal() },
                { text: 'Añadir seleccionadas', primary: true, action: () => this.confirmAddSongsToSetlist() }
            ]
        });
        document.getElementById('setlist-add-search').addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('#setlist-add-list .import-preview-item').forEach(el => { el.style.display = el.dataset.title.includes(q) ? 'flex' : 'none'; });
        });
    },

    confirmAddSongsToSetlist() {
        const checked = document.querySelectorAll('.setlist-add-checkbox:checked');
        const sl = AppState.currentSetlist;
        if (!sl || !Perm.canEditSetlist(sl)) { this.closeModal(); return; }
        checked.forEach(cb => { const id = cb.dataset.songId; if (!sl.songIds.includes(id)) sl.songIds.push(id); });
        Storage.saveSetlists();
        this.closeModal();
        this.renderSetlistDetail();
    },

    showUniformKeyModal() {
        if (!AppState.currentSetlist || !Perm.canEditSetlist(AppState.currentSetlist)) return;
        const currentKey = AppState.currentSetlist.uniformKey || '';
        const keys = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
        this.createModal({
            title: 'Tonalidad uniforme del repertorio',
            content: `
                <div class="form-group">
                    <label class="form-label">Tonalidad</label>
                    <select class="form-select" id="modal-uniform-key">
                        <option value="">Sin tonalidad uniforme (usar la de cada canción)</option>
                        ${keys.map(k => `<option value="${k}" ${k === currentKey ? 'selected' : ''}>${k}</option>`).join('')}
                    </select>
                </div>
            `,
            actions: [
                { text: 'Cancelar', action: () => this.closeModal() },
                { text: 'Aplicar', primary: true, action: () => this.applyUniformKey() }
            ]
        });
    },

    applyUniformKey() {
        const val = document.getElementById('modal-uniform-key').value;
        const sl = AppState.currentSetlist;
        if (!sl || !Perm.canEditSetlist(sl)) { this.closeModal(); return; }
        sl.uniformKey = val || null;
        // La tonalidad uniforme debe aplicarse a TODAS las canciones por igual —
        // si alguna tenía un ajuste manual guardado de antes, ese ajuste le ganaba
        // y la dejaba en otra tonalidad distinta al resto. Se limpia para evitarlo.
        if (val) sl.songTransposeOverrides = {};
        Storage.saveSetlists();
        this.closeModal();
        this.renderSetlistDetail();
    },

    clearUniformKey() {
        const sl = AppState.currentSetlist;
        if (!sl || !Perm.canEditSetlist(sl)) return;
        sl.uniformKey = null;
        Storage.saveSetlists();
        this.renderSetlistDetail();
    },

    // ============ CONVOCATORIA (quién toca/canta qué en este repertorio) ============
    // Los nombres salen de las personas del equipo. Si alguien que estaba
    // convocado ya no está en el equipo, se sigue mostrando para no perderlo.
    CONVOCADOS_ROLES: [
        { key: 'bateria', label: 'Batería', color: '#dc2626' },
        { key: 'bajo', label: 'Bajo', color: '#1e3a8a' },
        { key: 'guitarra', label: 'Guitarra', color: '#d97706' },
        { key: 'piano', label: 'Piano', color: '#7c3aed' },
        { key: 'voces', label: 'Voces', color: '#0d9488', multi: true },
        { key: 'sonido', label: 'Sonido', color: '#64748b', multi: true }
    ],

    convocatoriaOptions(selected) {
        const names = Team.memberNames();
        (selected || []).forEach(n => { if (!names.includes(n)) names.push(n); });
        return names;
    },

    showEquipoModal() {
        if (!AppState.currentSetlist || !Perm.canEditSetlist(AppState.currentSetlist)) return;
        this.createModal({
            title: 'Convocatoria',
            content: `<div id="equipo-modal-body">${this.buildEquipoRowsHTML()}</div>`,
            actions: [{ text: 'Cerrar', primary: true, action: () => this.closeModal() }]
        });
        this.bindEquipoSelects();
    },

    buildEquipoRowsHTML() {
        const sl = AppState.currentSetlist;
        const current = (sl && sl.convocados) || {};
        return this.CONVOCADOS_ROLES.map(role => {
            const selected = current[role.key] || [];
            return `
                <details class="convocatoria-role" data-role-key="${role.key}">
                    <summary>${role.label}${selected.length ? ` (${selected.length})` : ''}</summary>
                    <div class="convocatoria-role-body">
                        <div class="convocatoria-name-list">
                            ${this.convocatoriaOptions(selected).map(name => `
                                <button type="button" class="convocatoria-name-btn${selected.includes(name) ? ' added' : ''}" data-role="${role.key}" data-name="${this.escapeAttr(name)}">${this.escapeHtml(name)}</button>
                            `).join('')}
                        </div>
                        <div class="convocatoria-selected" id="conv-selected-${role.key}">
                            ${this.renderConvocadoTags(role.key, selected)}
                        </div>
                    </div>
                </details>
            `;
        }).join('');
    },

    renderConvocadoTags(roleKey, selected) {
        if (!selected.length) return '<span class="convocatoria-empty">Nadie asignado todavía</span>';
        return selected.map(name => `<span class="convocatoria-selected-tag" data-role="${roleKey}" data-name="${this.escapeAttr(name)}">${this.escapeHtml(name)} ✕</span>`).join('');
    },

    bindEquipoSelects() {
        document.querySelectorAll('#equipo-modal-body .convocatoria-name-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleConvocadoPerson(btn.dataset.role, btn.dataset.name));
        });
        document.querySelectorAll('#equipo-modal-body .convocatoria-selected-tag').forEach(tag => {
            tag.addEventListener('click', () => this.toggleConvocadoPerson(tag.dataset.role, tag.dataset.name));
        });
    },

    // Marca/desmarca sin volver a dibujar todo el modal — así los desplegables
    // que ya estaban abiertos no se cierran solos al elegir un nombre.
    toggleConvocadoPerson(roleKey, name) {
        const sl = AppState.currentSetlist;
        if (!sl || !Perm.canEditSetlist(sl)) return;
        if (!sl.convocados) sl.convocados = {};
        if (!sl.convocados[roleKey]) sl.convocados[roleKey] = [];
        const idx = sl.convocados[roleKey].indexOf(name);
        if (idx === -1) sl.convocados[roleKey].push(name);
        else sl.convocados[roleKey].splice(idx, 1);
        Storage.saveSetlists();

        const selected = sl.convocados[roleKey];
        const role = this.CONVOCADOS_ROLES.find(r => r.key === roleKey);
        document.querySelectorAll(`#equipo-modal-body .convocatoria-name-btn[data-role="${roleKey}"]`).forEach(btn => {
            btn.classList.toggle('added', selected.includes(btn.dataset.name));
        });
        const selectedEl = document.getElementById(`conv-selected-${roleKey}`);
        if (selectedEl) {
            selectedEl.innerHTML = this.renderConvocadoTags(roleKey, selected);
            selectedEl.querySelectorAll('.convocatoria-selected-tag').forEach(tag => {
                tag.addEventListener('click', () => this.toggleConvocadoPerson(tag.dataset.role, tag.dataset.name));
            });
        }
        const summary = document.querySelector(`#equipo-modal-body details[data-role-key="${roleKey}"] summary`);
        if (summary && role) summary.textContent = `${role.label}${selected.length ? ` (${selected.length})` : ''}`;

        this.renderConvocadosDisplay();
    },

    renderConvocadosDisplay() {
        const el = document.getElementById('convocados-display');
        if (!el) return;
        const sl = AppState.currentSetlist;
        const data = (sl && sl.convocados) || {};
        const entries = this.CONVOCADOS_ROLES
            .map(role => ({ label: role.label, names: (data[role.key] || []) }))
            .filter(e => e.names.length > 0);
        if (!entries.length) { el.style.display = 'none'; el.innerHTML = ''; return; }
        el.style.display = 'flex';
        el.innerHTML = entries.map(e => `
            <span class="convocado-chip">
                <span class="instrumento">${e.label}:</span>
                <span class="persona">${this.escapeHtml(e.names.join(', '))}</span>
            </span>
        `).join('');
    },
    // ============ FIN EQUIPO ============
    // ============ FIN REPERTORIO ============

    // ============ IMPORTACIÓN MASIVA DE PDFs ============
    showBulkPDFImport() {
        this.createModal({
            title: '📄 Importar canciones en lote',
            content: `
                <p style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem;">Selecciona varios archivos PDF o Word (.docx) a la vez (en tono original, no en grados). Tonalidad, BPM y compás se detectan automáticamente. Podrás editar cada una después.</p>
                <div class="form-group"><input type="file" class="form-input" id="pdf-bulk-input" accept=".pdf,.docx" multiple></div>
                <div id="pdf-bulk-status" style="font-size: 0.9rem; color: var(--text-secondary);"></div>
            `,
            actions: [{ text: 'Cancelar', action: () => this.closeModal() }]
        });
        document.getElementById('pdf-bulk-input').addEventListener('change', (e) => this.handleBulkPDFFiles(Array.from(e.target.files)));
    },

    async handleBulkPDFFiles(files) {
        if (!files.length) return;
        const statusEl = document.getElementById('pdf-bulk-status');
        AppState.pendingImports = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (statusEl) statusEl.innerHTML = `🔄 Procesando ${i + 1} de ${files.length}: ${file.name}...`;
            try {
                const isDocx = /\.docx$/i.test(file.name);
                let text = isDocx ? await this.extractDocxText(file) : await this.extractPDFText(file);

                // Red de seguridad adicional: si un sufijo de acorde (add4, sus2, 7...) quedó
                // solo en su propia línea (el superíndice no se pudo pegar a su acorde base al
                // extraer el PDF), lo volvemos a unir buscando la línea no vacía más cercana arriba.
                const chordSuffixOnly = /^(maj7|maj9|m7|m9|dim|aug|add\d+|sus4|sus2|sus|6|7|9|11|13|°|ø)$/i;
                const mergeLines = text.split('\n');
                for (let li = 0; li < mergeLines.length; li++) {
                    const t = mergeLines[li].trim();
                    if (!t || !chordSuffixOnly.test(t)) continue;
                    for (let pj = li - 1; pj >= 0; pj--) {
                        if (!mergeLines[pj].trim()) continue;
                        mergeLines[pj] = mergeLines[pj].replace(/\s+$/, '') + t;
                        mergeLines[li] = '';
                        break;
                    }
                }
                text = mergeLines.join('\n');

                let explicitKey = null;
                const keyMatch = text.match(/(?:KEY|TONALIDAD|TONO)\s*:?\s*([A-G][#b]?m?)\b/i);
                if (keyMatch) explicitKey = keyMatch[1].charAt(0).toUpperCase() + keyMatch[1].slice(1);
                let bpm = null;
                const bpmMatch = text.match(/TEMPO\s*:?\s*(\d+)/i);
                if (bpmMatch) bpm = parseInt(bpmMatch[1]);
                let compas = '';
                const compasMatch = text.match(/(?:Comp[aá]s|Time)\s*:?\s*(\d+\s*\/\s*\d+)/i);
                if (compasMatch) compas = compasMatch[1].replace(/\s/g, '');

                // El título sale del nombre del archivo (guiones bajos = espacios).
                let title = file.name.replace(/\.(pdf|docx)$/i, '').replace(/_/g, ' ').trim();
                let detectedArtist = '';

                // Autor: si dentro del documento la línea siguiente al título parece
                // un nombre (y no un dato como la tonalidad), se toma como autor.
                if (!detectedArtist) {
                    const rawLines = text.split('\n').map(l => l.trim());
                    const titleLineIdx = rawLines.findIndex(l => l && l.toLowerCase() === title.toLowerCase());
                    if (titleLineIdx !== -1 && titleLineIdx + 1 < rawLines.length) {
                        const candidate = rawLines[titleLineIdx + 1];
                        const looksLikeMeta = !candidate || /^p[aá]gina\s*:?\s*\d+\s*\/\s*\d+$/i.test(candidate) ||
                            /tonalidad\s*:|key\s*:|tono\s*:|comp[aá]s\s*:|time\s*:|tempo\s*:/i.test(candidate);
                        if (!looksLikeMeta && candidate.length < 60) detectedArtist = candidate;
                    }
                }

                const lines = text.split('\n');
                const cleanedLines = lines.filter(line => {
                    const t = line.trim();
                    if (!t) return true;
                    if (/tonalidad\s*:|key\s*:|tono\s*:|comp[aá]s\s*:|time\s*:|tempo\s*:/i.test(t)) return false;
                    if (/^estructura$/i.test(t)) return false;
                    // Número de página y el título/autor repetidos en cada página.
                    if (/^p[aá]gina\s*:?\s*\d+\s*\/\s*\d+$/i.test(t)) return false;
                    if (t.toLowerCase() === title.toLowerCase()) return false;
                    if (detectedArtist && t === detectedArtist) return false;
                    return true;
                });
                text = cleanedLines.join('\n');

                const sections = ChordParser.detectAndParse(text, true);
                const autoDetectedKey = KeyDetector.detectKey(sections);
                let finalKey = autoDetectedKey || explicitKey || 'C';
                if (explicitKey && !explicitKey.includes('m')) finalKey = explicitKey;

                AppState.pendingImports.push({
                    id: this.generateId(),
                    title: title || 'Sin título',
                    artist: detectedArtist,
                    keyBase: finalKey,
                    bpm: bpm,
                    compas: compas,
                    originalKey: '',
                    youtubeLink: '',
                    structure: [],
                    autoSections: true,
                    sections: sections.length > 0 ? sections : [{ label: 'Sin sección', pairs: [{ acordes: '', letra: '(No se detectaron acordes, revisa manualmente)' }] }],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            } catch (error) { console.error(`Error procesando ${file.name}:`, error); }
        }
        this.showBulkImportPreview();
    },

    // Extrae el texto de un archivo Word (.docx) usando mammoth.js.
    // A diferencia del PDF, Word no tiene posiciones fijas de caracteres —
    // se conserva el texto tal cual esté escrito (con sus espacios), pero si
    // el documento usaba tabulaciones en vez de espacios para alinear los
    // acordes sobre la letra, esa alineación puede no quedar perfecta.
    extractDocxText(file) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof mammoth === 'undefined') { reject(new Error('mammoth.js no está cargado')); return; }
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                resolve(result.value || '');
            } catch (error) { reject(error); }
        });
    },

    extractPDFText(file) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof pdfjsLib === 'undefined') { reject(new Error('pdf.js no está cargado')); return; }
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1 });
                    const textContent = await page.getTextContent();
                    fullText += this.reconstructPageText(textContent, viewport.width) + '\n';
                }
                resolve(fullText);
            } catch (error) { reject(error); }
        });
    },

    reconstructPageText(textContent, pageWidth) {
        let items = textContent.items
            .filter(it => it.str && it.str.trim())
            .map(it => ({
                str: it.str,
                width: it.width || 0,
                x: it.transform[4],
                y: it.transform[5],
                // Tamaño de letra aproximado, para distinguir texto normal de un superíndice
                // (el "sus2" o "7" chiquito pegado arriba del nombre del acorde, ej. "Gsus2").
                fontSize: Math.abs(it.transform[3]) || it.height || 10
            }));
        if (!items.length) return '';

        // Paso 1: pegar los superíndices de acordes a su acorde base en vez de dejarlos
        // sueltos en su propia línea (ej. "G" + superíndice "sus2" -> un solo "Gsus2").
        const sizes = items.map(it => it.fontSize).sort((a, b) => a - b);
        const medianSize = sizes[Math.floor(sizes.length / 2)] || 10;
        const consumed = new Set();
        items.forEach((it, i) => {
            if (consumed.has(i) || it.fontSize >= medianSize * 0.75) return;
            let best = null, bestDist = Infinity;
            items.forEach((other, j) => {
                if (i === j || consumed.has(j) || other.fontSize < medianSize * 0.75) return;
                const dx = it.x - (other.x + other.width);
                const dy = it.y - other.y;
                if (dx < -1 || dx > 4) return;              // debe empezar justo después del acorde base
                if (dy < 0 || dy > other.fontSize) return;  // debe estar un poco más arriba (superíndice)
                const dist = Math.abs(dx) + dy;
                if (dist < bestDist) { bestDist = dist; best = other; }
            });
            if (best) { best.str += it.str; best.width = (it.x + it.width) - best.x; consumed.add(i); }
        });
        items = items.filter((_, i) => !consumed.has(i));

        const buildLines = (its) => {
            const lineGroups = [];
            const tolerance = 2;
            its.forEach(item => {
                let group = lineGroups.find(g => Math.abs(g.y - item.y) <= tolerance);
                if (!group) { group = { y: item.y, items: [] }; lineGroups.push(group); }
                group.items.push(item);
            });
            lineGroups.sort((a, b) => b.y - a.y);
            lineGroups.forEach(g => g.items.sort((a, b) => a.x - b.x));

            return lineGroups.map((group, gIdx) => {
                // Los acordes suelen ir flotando ARRIBA de la letra, justo sobre la sílaba
                // correspondiente. Eso deja un hueco horizontal en la línea de la letra que
                // no es un espacio real — es solo para hacerle lugar visualmente al acorde.
                const aboveItems = gIdx > 0 ? lineGroups[gIdx - 1].items : [];
                let lineText = '', lastEndX = null;
                group.items.forEach(it => {
                    if (lastEndX !== null) {
                        const gap = it.x - lastEndX;
                        const shadowedByAbove = aboveItems.some(a => a.x < it.x && (a.x + a.width) > lastEndX);
                        if (shadowedByAbove) {
                            if (gap > 12) lineText += ' ';
                        } else {
                            const fontSize = it.fontSize || 10;
                            const spaces = Math.max(1, Math.round(gap / (fontSize * 0.55)));
                            lineText += ' '.repeat(Math.min(spaces, 20));
                        }
                    }
                    lineText += it.str;
                    lastEndX = it.x + it.width;
                });
                return lineText;
            });
        };
        let leftItems = items, rightItems = [];
        if (pageWidth) {
            const boundary = pageWidth * 0.5;
            const potentialLeft = items.filter(it => it.x < boundary);
            const potentialRight = items.filter(it => it.x >= boundary);
            if (potentialLeft.length >= 8 && potentialRight.length >= 8) { leftItems = potentialLeft; rightItems = potentialRight; }
        }
        if (rightItems.length > 0) {
            const leftLines = buildLines(leftItems);
            const rightLines = buildLines(rightItems);
            return leftLines.join('\n') + '\n' + rightLines.join('\n');
        }
        return buildLines(leftItems).join('\n');
    },

    showBulkImportPreview() {
        this.closeModal();
        const imports = AppState.pendingImports;
        if (imports.length === 0) { alert('No se pudo procesar ningún PDF.'); return; }
        this.createModal({
            title: `Revisar ${imports.length} canción(es) importada(s)`,
            content: `
                <p style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem;">Desmarca las que no quieras guardar. Podrás editar título, tonalidad y contenido después.</p>
                <div id="import-preview-list">
                    ${imports.map((song, idx) => `
                        <div class="import-preview-item">
                            <input type="checkbox" checked data-idx="${idx}" class="import-checkbox">
                            <div class="import-preview-info">
                                <div class="import-preview-title">${song.title}</div>
                                <div class="import-preview-meta">Tonalidad: ${song.keyBase}${song.bpm ? ` • ${song.bpm} BPM` : ''}${song.compas ? ` • ${song.compas}` : ''} • ${song.sections.length} sección(es)</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `,
            actions: [
                { text: 'Cancelar todo', action: () => { AppState.pendingImports = []; this.closeModal(); } },
                { text: 'Guardar seleccionadas', primary: true, action: () => this.saveBulkImports() }
            ]
        });
    },

    saveBulkImports() {
        if (!AppState.isAdmin) return;
        const checkboxes = document.querySelectorAll('.import-checkbox');
        let savedCount = 0;
        const toSave = [];
        checkboxes.forEach(cb => {
            if (cb.checked) { const idx = parseInt(cb.dataset.idx); AppState.songs.push(AppState.pendingImports[idx]); toSave.push(AppState.pendingImports[idx]); savedCount++; }
        });
        Storage.saveSongs(toSave);
        AppState.pendingImports = [];
        this.closeModal();
        this.renderSongsList();
        alert(`✅ Se guardaron ${savedCount} canción(es).`);
    },
    // ============ FIN IMPORTACIÓN MASIVA ============

    createModal({ title, content, actions = [], wide = false }) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal${wide ? ' modal-wide' : ''}">
                <div class="modal-header"><h3 class="modal-title">${title}</h3><button class="btn-xs" onclick="Router.closeModal()">✕</button></div>
                <div class="modal-content">${content}</div>
                <div class="modal-footer">${actions.map((a, i) => `<button class="btn ${a.primary ? 'btn-primary' : ''}" onclick="Router.executeModalAction(${i})">${a.text}</button>`).join('')}</div>
            </div>
        `;
        overlay._actions = actions;
        document.body.appendChild(overlay);

        // Tocar el fondo cierra la ventana, pero DESLIZAR sobre él mueve la
        // página de detrás en vez de cerrarla: así se puede leer la canción sin
        // perder lo que se está escribiendo.
        let arrastrado = false;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay && !arrastrado) this.closeModal();
            arrastrado = false;
        });
        overlay.addEventListener('wheel', (e) => {
            if (e.target.closest('.modal')) return;   // dentro de la ventana, scroll normal
            this.desplazarFondo(e.clientX, e.clientY, e.deltaY);
        }, { passive: true });

        let ultimoY = null;
        overlay.addEventListener('touchstart', (e) => {
            ultimoY = e.target.closest('.modal') ? null : e.touches[0].clientY;
        }, { passive: true });
        overlay.addEventListener('touchmove', (e) => {
            if (ultimoY === null) return;
            const y = e.touches[0].clientY;
            if (Math.abs(ultimoY - y) > 2) arrastrado = true;
            this.desplazarFondo(e.touches[0].clientX, y, ultimoY - y);
            ultimoY = y;
        }, { passive: true });
        overlay.addEventListener('touchend', () => { ultimoY = null; }, { passive: true });

        this.makeModalDraggable(overlay);
        return overlay;
    },

    // En el editor la canción no se desplaza con la página: vive en un panel con
    // su propia barra. Así que buscamos qué hay realmente debajo del cursor y
    // movemos eso; si no hay nada con scroll propio, movemos la página.
    desplazarFondo(x, y, delta) {
        const debajo = document.elementsFromPoint(x, y);
        for (const el of debajo) {
            if (!el || el.closest('.modal-overlay')) continue;
            const est = getComputedStyle(el);
            const puede = (est.overflowY === 'auto' || est.overflowY === 'scroll');
            if (puede && el.scrollHeight > el.clientHeight + 1) { el.scrollTop += delta; return; }
        }
        window.scrollBy(0, delta);
    },

    // La ventana se arrastra por su barra de título, para poder apartarla y ver
    // lo que tapa (por ejemplo la lista de secciones mientras escribes el orden).
    makeModalDraggable(overlay) {
        const modal = overlay.querySelector('.modal');
        const header = overlay.querySelector('.modal-header');
        if (!modal || !header) return;
        let dragging = false, startX = 0, startY = 0, baseX = 0, baseY = 0;
        const punto = (e) => (e.touches && e.touches[0]) ? e.touches[0] : e;

        const empezar = (e) => {
            if (e.target.closest('button')) return;   // la X sigue cerrando
            const p = punto(e);
            dragging = true;
            startX = p.clientX; startY = p.clientY;
            baseX = modal._dx || 0; baseY = modal._dy || 0;
            overlay.classList.add('dragging');
        };
        const mover = (e) => {
            if (!dragging) return;
            const p = punto(e);
            modal._dx = baseX + (p.clientX - startX);
            modal._dy = baseY + (p.clientY - startY);
            modal.style.transform = `translate(${modal._dx}px, ${modal._dy}px)`;
            if (e.cancelable) e.preventDefault();
        };
        const soltar = () => {
            if (!dragging) return;
            dragging = false;
            overlay.classList.remove('dragging');
        };

        header.addEventListener('mousedown', empezar);
        header.addEventListener('touchstart', empezar, { passive: true });
        document.addEventListener('mousemove', mover);
        document.addEventListener('touchmove', mover, { passive: false });
        document.addEventListener('mouseup', soltar);
        document.addEventListener('touchend', soltar);
        // Se guardan para poder quitarlos al cerrar y no dejarlos sueltos.
        overlay._dragCleanup = () => {
            document.removeEventListener('mousemove', mover);
            document.removeEventListener('touchmove', mover);
            document.removeEventListener('mouseup', soltar);
            document.removeEventListener('touchend', soltar);
        };
    },
    executeModalAction(index) {
        const overlay = document.getElementById('modal-overlay');
        if (overlay && overlay._actions && overlay._actions[index]) overlay._actions[index].action();
    },
    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (!overlay) return;
        if (overlay._dragCleanup) overlay._dragCleanup();
        overlay.remove();
    },
    generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
};

// Editor
const Editor = {
    currentTranspose: 0,

    loadSong(song) {
        AppState.currentSong = song;
        document.getElementById('song-title-editor').value = song.title;
        const artistInput = document.getElementById('song-artist-editor');
        if (artistInput) artistInput.value = song.artist || '';
        this.render();
        this.renderOutline();
        this.updateChips();
        Storage.updateSaveStatus('saved');
    },

    updateChips() {
        const keySelect = document.getElementById('key-editor-select');
        if (keySelect) keySelect.value = AppState.currentSong.keyBase;
        const bpmInput = document.getElementById('bpm-editor-input');
        if (bpmInput) bpmInput.value = AppState.currentSong.bpm || '';
        const compasInput = document.getElementById('compas-editor-input');
        if (compasInput) compasInput.value = AppState.currentSong.compas || '';
        const originalKeySelect = document.getElementById('original-key-editor-select');
        if (originalKeySelect) originalKeySelect.value = AppState.currentSong.originalKey || '';
        const youtubeInput = document.getElementById('youtube-link-editor-input');
        if (youtubeInput) youtubeInput.value = AppState.currentSong.youtubeLink || '';
        const creditsFields = { 'credits-authors-input': 'authors', 'credits-copyright-input': 'copyright', 'credits-ccli-input': 'ccliNumber' };
        Object.entries(creditsFields).forEach(([id, field]) => {
            const el = document.getElementById(id);
            if (el) el.value = AppState.currentSong[field] || '';
        });
    },

    detectKey() {
        if (!AppState.currentSong || !AppState.currentSong.sections) return;
        const detected = KeyDetector.detectKey(AppState.currentSong.sections);
        if (!detected) { alert('No se pudieron detectar suficientes acordes para calcular la tonalidad.'); return; }
        AppState.currentSong.keyBase = detected;
        this.updateChips();
        Storage.updateSaveStatus('unsaved');
        alert(`Tonalidad detectada: ${detected}`);
    },

    showStructureModal() {
        if (!AppState.currentSong) return;
        const existing = AppState.currentSong.structure || [];
        const prefill = existing.length > 0
            ? existing.join('\n')
            : (AppState.currentSong.sections || []).map(s => s.label).join('\n');

        Router.createModal({
            title: `Orden de "${AppState.currentSong.title}"`,
            content: `
                <p style="margin-bottom:1rem; color:var(--text-secondary); font-size:0.9rem;">
                    Escribe el orden en que se toca esta canción (escuchando la versión original), una parte por línea. Repite líneas, añade "x2", "x4", o texto libre como "Instrumental" o "Final" según necesites. Este es el orden por defecto de la canción; cada repertorio puede tener su propio orden que sobrescribe este.
                </p>
                ${Router.buildStructurePicker(AppState.currentSong)}
                <div class="form-group">
                    <textarea class="form-textarea" id="structure-textarea" style="min-height:220px; font-family:var(--mono-font); font-size:0.9rem;">${prefill}</textarea>
                </div>
            `,
            actions: [
                { text: 'Cancelar', action: () => Router.closeModal() },
                { text: 'Guardar orden', primary: true, action: () => Editor.saveStructure() }
            ]
        });
        Router.bindStructurePicker('structure-textarea');
    },

    saveStructure() {
        if (!AppState.currentSong) { Router.closeModal(); return; }
        const textarea = document.getElementById('structure-textarea');
        const lines = (textarea ? textarea.value : '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
        AppState.currentSong.structure = lines;
        Router.closeModal();
        // Antes esto solo quedaba en memoria y se perdía si salías sin pulsar
        // "Guardar". Ahora el orden se sube en el momento.
        Router.saveCurrentSong(true);
    },

    render() {
        const content = document.getElementById('editor-content');
        if (!AppState.currentSong || !AppState.currentSong.sections || AppState.currentSong.sections.length === 0) {
            content.innerHTML = '<div class="empty-state"><h3>No hay contenido</h3><p>Usa "+ Sección" para empezar a añadir contenido.</p></div>';
            return;
        }
        content.innerHTML = AppState.currentSong.sections.map((section, sIndex) => `
            <div class="section-editor" data-section="${sIndex}">
                <div class="section-header-editor">
                    <input type="text" class="section-label-input" value="${section.label}" onchange="Editor.updateSectionLabel(${sIndex}, this.value)">
                    <div class="section-actions">
                        <button class="btn-xs" onclick="Editor.addPairToSection(${sIndex})">+ Par</button>
                        <button class="btn-xs" onclick="Editor.duplicateSection(${sIndex})" title="Duplicar la sección entera">📑</button>
                        <button class="btn-xs" onclick="Editor.moveSection(${sIndex}, -1)">↑</button>
                        <button class="btn-xs" onclick="Editor.moveSection(${sIndex}, 1)">↓</button>
                        <button class="btn-xs" onclick="Editor.deleteSection(${sIndex})">🗑️</button>
                    </div>
                </div>
                ${section.pairs ? section.pairs.map((pair, pIndex) => this.renderPair(pair, sIndex, pIndex)).join('') : ''}
            </div>
        `).join('');
        this.setupTextareaAutoResize();
    },

    renderPair(pair, sIndex, pIndex) {
        return `
            <div class="pair-editor">
                <div class="pair-header">
                    <span class="pair-label">Acordes/Letra ${pIndex + 1}</span>
                    <div class="pair-actions">
                        ${this.isLabelCandidate(pair) ? `<button class="btn-xs btn-split" onclick="Editor.splitSectionAtPair(${sIndex}, ${pIndex})" title="Convertir esta línea en una sección propia">✂️</button>` : ''}
                        <button class="btn-xs" onclick="Editor.duplicatePair(${sIndex}, ${pIndex})">📋</button>
                        <button class="btn-xs" onclick="Editor.movePair(${sIndex}, ${pIndex}, -1)">↑</button>
                        <button class="btn-xs" onclick="Editor.movePair(${sIndex}, ${pIndex}, 1)">↓</button>
                        <button class="btn-xs" onclick="Editor.deletePair(${sIndex}, ${pIndex})">🗑️</button>
                    </div>
                </div>
                <textarea class="chord-input" placeholder="Acordes..." onchange="Editor.updatePair(${sIndex}, ${pIndex}, 'acordes', this.value)" style="font-size: ${AppState.settings.fontSize}px;">${pair.acordes || ''}</textarea>
                <textarea class="lyric-input" placeholder="Letra..." onchange="Editor.updatePair(${sIndex}, ${pIndex}, 'letra', this.value)" style="font-size: ${AppState.settings.fontSize}px;">${pair.letra || ''}</textarea>
            </div>
        `;
    },

    renderOutline() {
        const outline = document.getElementById('sections-outline');
        if (!AppState.currentSong || !AppState.currentSong.sections) { outline.innerHTML = '<div class="text-center">Sin secciones</div>'; return; }
        const total = AppState.currentSong.sections.length;

        // Al importar un PDF es habitual que toda la canción caiga dentro de una o
        // dos secciones gigantes, con los nombres de las partes ("Estrofa 1",
        // "Instrumental"...) metidos como si fueran letra. Aquí se detectan y se
        // ofrece separarlas de una vez.
        const sueltas = this.findInlineLabels();
        const aviso = sueltas.length ? `
            <div class="outline-hint">
                <div class="outline-hint-text">
                    ${sueltas.length === 1 ? 'Hay 1 parte escrita' : `Hay ${sueltas.length} partes escritas`} dentro de otra sección:
                    <strong>${sueltas.slice(0, 4).map(f => f.name).join(', ')}${sueltas.length > 4 ? '…' : ''}</strong>
                </div>
                <button class="btn-xs" onclick="Editor.splitAllInlineLabels()">Separar en secciones</button>
            </div>
        ` : '';
        // Aquí se ven todas las secciones de un vistazo, así que es el mejor sitio
        // para reordenarlas: se mueven sin perderlas de vista ni bajar por el editor.
        outline.innerHTML = aviso + AppState.currentSong.sections.map((section, index) => `
            <div class="outline-item">
                <span class="outline-name" onclick="Editor.scrollToSection(${index})" title="Ir a esta sección">${section.label}</span>
                <span class="outline-count">${section.pairs ? section.pairs.length : 0}</span>
                <span class="outline-actions">
                    <button class="btn-xs" title="Subir" onclick="Editor.moveSection(${index}, -1, true)" ${index === 0 ? 'disabled' : ''}>↑</button>
                    <button class="btn-xs" title="Bajar" onclick="Editor.moveSection(${index}, 1, true)" ${index === total - 1 ? 'disabled' : ''}>↓</button>
                </span>
            </div>
        `).join('');
    },

    setupTextareaAutoResize() {
        document.querySelectorAll('.chord-input, .lyric-input').forEach(t => {
            t.addEventListener('input', () => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; });
            t.style.height = 'auto';
            t.style.height = t.scrollHeight + 'px';
        });
    },

    updateSectionLabel(sIndex, value) { AppState.currentSong.sections[sIndex].label = value; this.renderOutline(); Storage.updateSaveStatus('unsaved'); },
    updatePair(sIndex, pIndex, field, value) { AppState.currentSong.sections[sIndex].pairs[pIndex][field] = value; Storage.updateSaveStatus('unsaved'); },

    addSection() {
        const name = prompt('Nombre de la nueva sección:', 'Nueva sección');
        if (!name) return;
        if (!AppState.currentSong.sections) AppState.currentSong.sections = [];
        AppState.currentSong.sections.push({ label: name, pairs: [] });
        this.render(); this.renderOutline();
        Storage.updateSaveStatus('unsaved');
    },

    addPair() {
        if (!AppState.currentSong.sections || AppState.currentSong.sections.length === 0) this.addSection();
        this.addPairToSection(AppState.currentSong.sections.length - 1);
    },

    addPairToSection(sIndex) {
        if (!AppState.currentSong.sections[sIndex]) return;
        if (!AppState.currentSong.sections[sIndex].pairs) AppState.currentSong.sections[sIndex].pairs = [];
        AppState.currentSong.sections[sIndex].pairs.push({ acordes: '', letra: '' });
        this.render(); this.renderOutline();
        Storage.updateSaveStatus('unsaved');
    },

    duplicatePair(sIndex, pIndex) {
        const pair = AppState.currentSong.sections[sIndex].pairs[pIndex];
        if (!pair) return;
        AppState.currentSong.sections[sIndex].pairs.splice(pIndex + 1, 0, { acordes: pair.acordes, letra: pair.letra });
        this.render();
        Storage.updateSaveStatus('unsaved');
    },

    movePair(sIndex, pIndex, direction) {
        const section = AppState.currentSong.sections[sIndex];
        const newIndex = pIndex + direction;
        if (newIndex < 0 || newIndex >= section.pairs.length) return;
        const pair = section.pairs.splice(pIndex, 1)[0];
        section.pairs.splice(newIndex, 0, pair);
        this.render();
        Storage.updateSaveStatus('unsaved');
    },

    deletePair(sIndex, pIndex) {
        if (confirm('¿Eliminar este par?')) {
            AppState.currentSong.sections[sIndex].pairs.splice(pIndex, 1);
            this.render();
            Storage.updateSaveStatus('unsaved');
        }
    },

    // ¿Este par es en realidad el nombre de una parte de la canción? Lo es cuando
    // tiene texto, no tiene acordes, cabe en una línea corta y la app reconoce el
    // nombre ("Estrofa 2", "Instrumental", "Puente"...).
    isInlineLabel(pair) {
        const letra = (pair && pair.letra || '').trim();
        const sinAcordes = !pair || !pair.acordes || !pair.acordes.trim();
        return !!(letra && sinAcordes && ChordParser.isSectionHeader(letra));
    },

    // Más permisivo que el anterior: cualquier línea corta sin acordes PODRÍA ser
    // un nombre de parte, aunque la app no lo reconozca ("Vamp", "Tag final"...).
    // Se usa solo para decidir si enseñar el botón ✂️, nunca para separar en lote.
    isLabelCandidate(pair) {
        const letra = (pair && pair.letra || '').trim();
        const sinAcordes = !pair || !pair.acordes || !pair.acordes.trim();
        return !!(letra && sinAcordes && letra.length <= 40 && !letra.includes('\n'));
    },

    findInlineLabels() {
        const found = [];
        (AppState.currentSong && AppState.currentSong.sections || []).forEach((section, sIndex) => {
            (section.pairs || []).forEach((pair, pIndex) => {
                if (this.isInlineLabel(pair)) {
                    found.push({ sIndex, pIndex, name: ChordParser.normalizeSectionName(pair.letra.trim()) });
                }
            });
        });
        return found;
    },

    // Parte la sección en dos justo en ese par: el texto del par pasa a ser el
    // nombre de la sección nueva, y todo lo que venía debajo se va con ella.
    splitSectionAtPair(sIndex, pIndex) {
        const sections = AppState.currentSong && AppState.currentSong.sections;
        const section = sections && sections[sIndex];
        if (!section || !section.pairs || !section.pairs[pIndex]) return;
        const raw = (section.pairs[pIndex].letra || '').trim();
        if (!raw) return;
        const name = ChordParser.isSectionHeader(raw) ? ChordParser.normalizeSectionName(raw) : raw;
        const after = section.pairs.slice(pIndex + 1);
        section.pairs = section.pairs.slice(0, pIndex);
        sections.splice(sIndex + 1, 0, { label: name, pairs: after });
        this.cleanupEmptySections();
        this.render(); this.renderOutline();
        Storage.updateSaveStatus('unsaved');
    },

    // Separa de una vez todas las partes que quedaron metidas dentro de otra sección.
    splitAllInlineLabels() {
        const found = this.findInlineLabels();
        if (!found.length) { alert('No hay ninguna parte suelta que separar.'); return; }
        const nombres = found.map(f => f.name).join(', ');
        if (!confirm(`Se crearán ${found.length} sección(es) nueva(s): ${nombres}.\n\nNo se pierde nada: cada nombre pasa a ser el título de su sección y la letra que venía debajo se va con ella. ¿Continuar?`)) return;

        const result = [];
        (AppState.currentSong.sections || []).forEach(section => {
            let current = { label: section.label || 'Sin sección', pairs: [] };
            result.push(current);
            (section.pairs || []).forEach(pair => {
                if (this.isInlineLabel(pair)) {
                    current = { label: ChordParser.normalizeSectionName(pair.letra.trim()), pairs: [] };
                    result.push(current);
                } else {
                    current.pairs.push(pair);
                }
            });
        });
        AppState.currentSong.sections = result;
        this.cleanupEmptySections();
        this.render(); this.renderOutline();
        Storage.updateSaveStatus('unsaved');
    },

    // Al partir, la sección original puede quedarse sin nada dentro (cuando el
    // nombre suelto estaba justo al principio). Esas cáscaras vacías se quitan.
    cleanupEmptySections() {
        const sections = AppState.currentSong.sections || [];
        AppState.currentSong.sections = sections.filter(s => (s.pairs || []).length > 0);
        if (!AppState.currentSong.sections.length) AppState.currentSong.sections = sections;
    },

    // Copia una sección entera (con todos sus pares) justo debajo. Pensado para
    // "Estrofa 2": mismos acordes, letra distinta — duplicas y reescribes la letra.
    // Al copiar se le pone un número libre (Estrofa -> Estrofa 2) para que dos
    // secciones no compartan nombre; si no, el orden de la canción no sabría a
    // cuál de las dos se refiere.
    duplicateSection(sIndex) {
        const sections = AppState.currentSong && AppState.currentSong.sections;
        if (!sections || !sections[sIndex]) return;
        const copy = JSON.parse(JSON.stringify(sections[sIndex]));
        copy.label = this.nextFreeSectionLabel(copy.label);
        sections.splice(sIndex + 1, 0, copy);
        this.render(); this.renderOutline();
        Storage.updateSaveStatus('unsaved');
    },

    nextFreeSectionLabel(label) {
        const base = (label || 'Sección').replace(/\s*\d+\s*$/, '').trim() || 'Sección';
        const taken = (AppState.currentSong.sections || []).map(s => (s.label || '').trim().toLowerCase());
        for (let n = 2; n <= 30; n++) {
            const candidate = `${base} ${n}`;
            if (!taken.includes(candidate.toLowerCase())) return candidate;
        }
        return label;
    },

    // fromOutline: true cuando se pulsa desde la barra lateral. En ese caso no se
    // mueve la pantalla, para poder dar varias veces seguidas sin marearse; desde
    // el editor sí se sigue a la sección, que si no se pierde de vista al saltar.
    moveSection(sIndex, direction, fromOutline = false) {
        const newIndex = sIndex + direction;
        if (newIndex < 0 || newIndex >= AppState.currentSong.sections.length) return;
        const section = AppState.currentSong.sections.splice(sIndex, 1)[0];
        AppState.currentSong.sections.splice(newIndex, 0, section);
        this.render(); this.renderOutline();
        Storage.updateSaveStatus('unsaved');
        if (!fromOutline) this.scrollToSection(newIndex);
    },

    deleteSection(sIndex) {
        if (confirm('¿Eliminar esta sección y todos sus pares?')) {
            AppState.currentSong.sections.splice(sIndex, 1);
            this.render(); this.renderOutline();
            Storage.updateSaveStatus('unsaved');
        }
    },

    scrollToSection(sIndex) {
        const el = document.querySelector(`[data-section="${sIndex}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    transpose(semitones) {
        this.currentTranspose += semitones;
        if (!AppState.currentSong.sections) return;
        AppState.currentSong.sections.forEach(section => {
            if (section.pairs) {
                section.pairs.forEach(pair => {
                    if (pair.acordes && pair.acordes.trim()) pair.acordes = Transposer.cleanChord(Transposer.transpose(pair.acordes, semitones));
                });
            }
        });
        this.render();
        Storage.updateSaveStatus('unsaved');
    },

    resetTranspose() {
        if (this.currentTranspose === 0) return;
        this.transpose(-this.currentTranspose);
        this.currentTranspose = 0;
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    Storage.loadSettings();
    ConnectionBanner.init();
    // La app arranca bloqueada (pantalla de entrada) hasta saber quién entra y
    // en qué equipo está. Los datos se empiezan a escuchar en Team.start().
    document.body.classList.add('gated');

    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    SplashManager.startSafetyTimeout();

    // Si la app se esconde o se cierra con un cambio de repertorio todavía
    // esperando a subirse (ej. subiste el tono y cambiaste de app enseguida),
    // se sube en ese momento para que no se pierda.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') Storage.flushSetlistsSave();
    });
    window.addEventListener('pagehide', () => Storage.flushSetlistsSave());

    HistoryManager.init();
    Router.init();
    Auth.init();
    StickyStructureBar.init();
    HorizontalStructureSync.bindOnce();
    Teleprompter.bindInteractionListeners();

    document.addEventListener('keydown', (e) => {
        const isCtrlCmd = e.ctrlKey || e.metaKey;
        if (isCtrlCmd && e.key === 's') {
            e.preventDefault();
            if (AppState.currentView === 'edicion') Router.saveCurrentSong();
        } else if (e.key === 'Escape') {
            if (AppState.fullscreenMode) Router.requestExitFullscreen();
            else if (AppState.currentView === 'edicion') { Router.saveCurrentSong(); history.back(); }
        }
    });

    // Registro del service worker: requisito de Chrome para instalación real (sin barra de direcciones).
    // No cachea nada a propósito (ver comentarios en sw.js).
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(err => console.error('Error registrando el service worker:', err));
        });
    }
});
