/* ==========================================================================
   RETROGAMES · Melodías de espera
   --------------------------------------------------------------------------
   Música de fondo para el portal y los tres catálogos, para amenizar la
   espera mientras se elige y se carga un juego.

   Se engancha con una línea en el HTML:

       <script src="assets/audio/jukebox.js"></script>

   Cómo suena
   ----------
   No hay ficheros de audio: las melodías se sintetizan con la Web Audio API
   (onda cuadrada para la voz principal, triangular para el bajo, ruido para
   la percusión). Ocupa unos pocos KB, arranca al instante y no añade peso al
   repositorio, que ya va cargado de ROMs.

   Qué suena
   ---------
   Seis melodías **de dominio público**, de las que todo el mundo reconoce en
   dos compases. Los temas de los juegos famosos (Mario, Zelda, Sonic…) están
   protegidos por derechos de autor y publicarlos aquí sería infringirlos; el
   arreglo chiptune de estas seis es propio, así que tampoco depende de
   ficheros MIDI de terceros, que también tienen su propia autoría.

   Reglas de convivencia
   ---------------------
   · Los navegadores no dejan sonar nada hasta que el usuario toca la página:
     la música espera al primer toque.
   · Sigue sonando mientras se descarga el núcleo y carga el juego, y se
     desvanece en cuanto la partida arranca (avisa touch-controls.js).
   · Botón ♪ para silenciarla; la decisión se recuerda.
   ========================================================================== */

(function () {
    "use strict";

    var STORE_KEY = "rg-music";
    var VOLUME = 0.32;

    /* ----------------------------------------------------------------------
       1. Repertorio
       ----------------------------------------------------------------------
       Notación: "NOTA:duración", con la duración en semicorcheas (1 = semi-
       corchea, 2 = corchea, 4 = negra, 8 = blanca) y "-" para el silencio.
       `barSteps` es la duración del compás en esas mismas unidades: 16 para
       un 4/4, 12 para un 6/8 o un 3/4, 8 para un 2/4.
       ---------------------------------------------------------------------- */

    var TUNES = [
        {
            id: "korobeiniki",
            title: "Korobeiniki (canción popular rusa)",
            bpm: 150, barSteps: 16, wave: "square", drums: "x--hs--hx--hs--h",
            chords: "Em Am Em Am Dm Am B7 Em",
            melody:
                "E5:4 B4:2 C5:2 D5:4 C5:2 B4:2 " +
                "A4:4 A4:2 C5:2 E5:4 D5:2 C5:2 " +
                "B4:6 C5:2 D5:4 E5:4 " +
                "C5:4 A4:4 A4:4 -:4 " +
                "D5:6 F5:2 A5:4 G5:2 F5:2 " +
                "E5:6 C5:2 E5:4 D5:2 C5:2 " +
                "B4:4 B4:2 C5:2 D5:4 E5:4 " +
                "C5:4 A4:4 A4:4 -:4"
        },
        {
            id: "alegria",
            title: "Himno de la Alegría (Beethoven)",
            bpm: 124, barSteps: 16, wave: "square", drums: "x---s---x---s---",
            chords: "C G C G C G C C",
            melody:
                "E5:4 E5:4 F5:4 G5:4 " +
                "G5:4 F5:4 E5:4 D5:4 " +
                "C5:4 C5:4 D5:4 E5:4 " +
                "E5:6 D5:2 D5:8 " +
                "E5:4 E5:4 F5:4 G5:4 " +
                "G5:4 F5:4 E5:4 D5:4 " +
                "C5:4 C5:4 D5:4 E5:4 " +
                "D5:6 C5:2 C5:8"
        },
        {
            id: "fur-elise",
            title: "Para Elisa (Beethoven)",
            bpm: 108, barSteps: 12, wave: "square", drums: "",
            chords: "Am Am E Am Am Am Am",
            melody:
                "E5:1 D#5:1 E5:1 D#5:1 E5:1 B4:1 D5:1 C5:1 A4:4 " +
                "-:2 C4:2 E4:2 A4:2 B4:4 " +
                "-:2 E4:2 G#4:2 B4:2 C5:4 " +
                "-:2 E4:2 E5:1 D#5:1 E5:1 D#5:1 E5:1 B4:1 D5:1 C5:1 " +
                "A4:4 -:2 C4:2 E4:2 A4:2 " +
                "B4:4 -:2 E4:2 C5:2 B4:2 " +
                "A4:8 -:4"
        },
        {
            id: "marcha-turca",
            title: "Marcha Turca (Mozart)",
            bpm: 126, barSteps: 8, wave: "square", drums: "x-s-x-s-",
            chords: "Am Am E7 Am Am Am E7 Am",
            melody:
                "B4:1 A4:1 G#4:1 A4:1 C5:4 " +
                "D5:1 C5:1 B4:1 C5:1 E5:4 " +
                "F5:1 E5:1 D#5:1 E5:1 B5:4 " +
                "A5:1 G5:1 F5:1 E5:1 D5:1 C5:1 B4:1 A4:1 " +
                "B4:1 A4:1 G#4:1 A4:1 C5:4 " +
                "D5:1 C5:1 B4:1 C5:1 E5:4 " +
                "F5:1 E5:1 D#5:1 E5:1 B5:4 " +
                "A5:4 -:4"
        },
        {
            id: "greensleeves",
            title: "Greensleeves (tradicional inglesa)",
            bpm: 104, barSteps: 12, wave: "triangle", drums: "",
            chords: "Am C G Em Am C Em Am",
            melody:
                "C5:4 D5:2 E5:6 " +
                "F5:2 E5:4 D5:6 " +
                "B4:4 G4:2 A4:6 " +
                "B4:2 C5:4 A4:6 " +
                "A4:4 G#4:2 A4:6 " +
                "B4:4 G#4:2 E4:6 " +
                "C5:4 B4:2 A4:6 " +
                "A4:8 -:4"
        },
        {
            id: "toccata",
            title: "Tocata y fuga en re menor (Bach)",
            bpm: 96, barSteps: 16, wave: "sawtooth", drums: "",
            chords: "Dm Dm A7 Dm Dm Gm A7 Dm",
            melody:
                "A5:2 G5:2 A5:12 " +
                "G5:1 F5:1 E5:1 D5:1 C#5:2 D5:10 " +
                "-:4 E5:2 F5:2 E5:2 D5:2 C#5:4 " +
                "D5:8 -:8 " +
                "A4:2 G4:2 A4:12 " +
                "-:4 D5:2 C5:2 Bb4:2 A4:2 G4:4 " +
                "A4:2 Bb4:2 C5:2 D5:2 E5:4 C#5:4 " +
                "D5:8 -:8"
        }
    ];

    /* ----------------------------------------------------------------------
       2. Notas y acordes
       ---------------------------------------------------------------------- */

    var SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

    function midi(name) {
        var m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
        if (!m) return null;
        var n = SEMITONE[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
        return n + (parseInt(m[3], 10) + 1) * 12;
    }

    function hz(note) { return 440 * Math.pow(2, (note - 69) / 12); }

    function parseMelody(text) {
        var steps = [];
        text.trim().split(/\s+/).forEach(function (token) {
            var parts = token.split(":");
            var dur = parseInt(parts[1], 10) || 1;
            steps.push({ note: parts[0] === "-" ? null : midi(parts[0]), dur: dur });
        });
        return steps;
    }

    var QUALITY = { "": [0, 4, 7], "m": [0, 3, 7], "7": [0, 4, 7, 10], "m7": [0, 3, 7, 10] };

    function parseChords(text) {
        return text.trim().split(/\s+/).map(function (name) {
            var m = /^([A-G])(#|b)?(m7|m|7)?$/.exec(name);
            var root = SEMITONE[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
            var ivals = QUALITY[m[3] || ""];
            return {
                bass: root + 36,                                   // octava 2
                notes: ivals.map(function (i) { return root + 60 + i; })  // octava 4
            };
        });
    }

    /* ----------------------------------------------------------------------
       3. Motor de sonido
       ---------------------------------------------------------------------- */

    function Jukebox() {
        this.ctx = null;
        this.playing = false;
        this.timer = null;
        this.noise = null;
    }

    Jukebox.prototype.init = function () {
        if (this.ctx) return true;
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        this.ctx = new AC();

        this.master = this.ctx.createGain();
        this.master.gain.value = 0;
        this.master.connect(this.ctx.destination);

        /* Un eco corto: es lo que da el aire ochentero sin cargar la mezcla. */
        this.delay = this.ctx.createDelay(1);
        this.delay.delayTime.value = 0.26;
        this.feedback = this.ctx.createGain();
        this.feedback.gain.value = 0.24;
        this.echoLevel = this.ctx.createGain();
        this.echoLevel.gain.value = 0.28;
        this.delay.connect(this.feedback);
        this.feedback.connect(this.delay);
        this.delay.connect(this.echoLevel);
        this.echoLevel.connect(this.master);

        var frames = this.ctx.sampleRate * 0.5;
        this.noise = this.ctx.createBuffer(1, frames, this.ctx.sampleRate);
        var data = this.noise.getChannelData(0);
        for (var i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
        return true;
    };

    Jukebox.prototype.tone = function (wave, freq, at, dur, gain, echo) {
        var osc = this.ctx.createOscillator();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, at);
        var env = this.ctx.createGain();
        env.gain.setValueAtTime(0, at);
        env.gain.linearRampToValueAtTime(gain, at + 0.012);
        env.gain.linearRampToValueAtTime(gain * 0.65, at + Math.min(0.12, dur * 0.4));
        env.gain.setTargetAtTime(0, at + dur * 0.8, 0.05);
        osc.connect(env);
        env.connect(this.master);
        if (echo) env.connect(this.delay);
        osc.start(at);
        osc.stop(at + dur + 0.3);
    };

    Jukebox.prototype.hit = function (kind, at) {
        if (kind === "x") {                       // bombo
            var osc = this.ctx.createOscillator();
            var env = this.ctx.createGain();
            osc.frequency.setValueAtTime(130, at);
            osc.frequency.exponentialRampToValueAtTime(45, at + 0.11);
            env.gain.setValueAtTime(0.5, at);
            env.gain.exponentialRampToValueAtTime(0.001, at + 0.16);
            osc.connect(env); env.connect(this.master);
            osc.start(at); osc.stop(at + 0.2);
            return;
        }
        var src = this.ctx.createBufferSource();
        src.buffer = this.noise;
        var hp = this.ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = kind === "s" ? 1400 : 7000;
        var env = this.ctx.createGain();
        var len = kind === "s" ? 0.14 : 0.04;
        env.gain.setValueAtTime(kind === "s" ? 0.22 : 0.1, at);
        env.gain.exponentialRampToValueAtTime(0.001, at + len);
        src.connect(hp); hp.connect(env); env.connect(this.master);
        src.start(at); src.stop(at + len + 0.02);
    };

    Jukebox.prototype.load = function (tune) {
        this.tune = tune;
        this.chords = parseChords(tune.chords);
        this.steps = [];                            // paso -> nota que empieza
        var at = 0;
        parseMelody(tune.melody).forEach(function (n) {
            if (n.note) this.steps[at] = n;
            at += n.dur;
        }, this);
        this.total = at;
        this.stepDur = 60 / tune.bpm / 4;
        this.step = 0;
    };

    Jukebox.prototype.scheduleStep = function (step, at) {
        var tune = this.tune;
        var bar = Math.floor(step / tune.barSteps) % this.chords.length;
        var chord = this.chords[bar];
        var inBar = step % tune.barSteps;

        var note = this.steps[step];
        if (note) this.tone(tune.wave, hz(note.note), at, note.dur * this.stepDur, 0.16, true);

        /* Bajo a corcheas, saltando a la octava en los tiempos débiles. */
        if (inBar % 2 === 0) {
            var octave = (inBar % 4 === 0) ? 0 : 12;
            this.tone("triangle", hz(chord.bass + octave), at, this.stepDur * 1.8, 0.2, false);
        }

        /* Arpegio de acompañamiento: el truco de toda la vida para simular
           un acorde con una sola voz. */
        var arp = chord.notes[(step % chord.notes.length)];
        this.tone("square", hz(arp), at, this.stepDur * 0.7, 0.045, false);

        if (tune.drums) {
            var beat = tune.drums.charAt(inBar % tune.drums.length);
            if (beat && beat !== "-") this.hit(beat, at);
        }
    };

    Jukebox.prototype.pump = function () {
        var horizon = this.ctx.currentTime + 0.2;
        while (this.nextTime < horizon) {
            this.scheduleStep(this.step, this.nextTime);
            this.nextTime += this.stepDur;
            this.step++;
            if (this.step >= this.total) {          // fin de vuelta: otra melodía
                this.load(pickTune(this.tune));     // (load reinicia paso y tempo)
            }
        }
    };

    Jukebox.prototype.start = function () {
        if (this.playing || !this.init()) return;
        if (this.ctx.state === "suspended") this.ctx.resume();
        this.playing = true;
        if (!this.tune) this.load(pickTune(null));
        this.nextTime = this.ctx.currentTime + 0.08;
        this.master.gain.cancelScheduledValues(this.ctx.currentTime);
        this.master.gain.setValueAtTime(0, this.ctx.currentTime);
        this.master.gain.linearRampToValueAtTime(VOLUME, this.ctx.currentTime + 1.2);
        var self = this;
        this.timer = setInterval(function () { self.pump(); }, 40);
        this.pump();
    };

    Jukebox.prototype.stop = function (fade) {
        if (!this.playing) return;
        this.playing = false;
        clearInterval(this.timer);
        this.timer = null;
        var now = this.ctx.currentTime;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setValueAtTime(this.master.gain.value, now);
        this.master.gain.linearRampToValueAtTime(0, now + (fade === false ? 0.05 : 0.6));
    };

    function pickTune(avoid) {
        var pool = TUNES.filter(function (t) { return !avoid || t.id !== avoid.id; });
        return pool[Math.floor(Math.random() * pool.length)];
    }

    /* ----------------------------------------------------------------------
       4. Interfaz: botón ♪
       ---------------------------------------------------------------------- */

    var box = new Jukebox();
    var enabled = true;
    try { enabled = localStorage.getItem(STORE_KEY) !== "off"; } catch (e) { /* sin storage */ }

    var style = document.createElement("style");
    style.textContent =
        ".rg-music-btn{position:fixed;right:14px;bottom:14px;z-index:60;width:46px;height:46px;" +
        "display:flex;align-items:center;justify-content:center;border-radius:50%;cursor:pointer;" +
        "background:rgba(9,12,26,.72);border:1.5px solid rgba(255,0,255,.55);color:#fff;font-size:19px;" +
        "box-shadow:0 6px 18px rgba(0,0,0,.5),0 0 16px rgba(255,0,255,.25);transition:transform .15s ease,opacity .2s ease;" +
        "-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;touch-action:manipulation}" +
        ".rg-music-btn:active{transform:scale(.92)}" +
        ".rg-music-btn.is-off{opacity:.45;border-color:rgba(148,163,184,.5);box-shadow:0 6px 18px rgba(0,0,0,.5)}" +
        ".rg-music-btn.is-hidden{display:none}" +
        "@media (max-width:600px){.rg-music-btn{width:42px;height:42px;font-size:17px;right:10px;bottom:10px}}";
    document.head.appendChild(style);

    var button = document.createElement("div");
    button.className = "rg-music-btn" + (enabled ? "" : " is-off");
    button.setAttribute("role", "button");
    button.setAttribute("aria-label", "Música de fondo");
    button.title = "Música de fondo";
    button.textContent = enabled ? "♪" : "♪̸";

    function paint() {
        button.classList.toggle("is-off", !enabled);
        button.textContent = enabled ? "♪" : "♪̸";
        button.title = enabled ? "Silenciar la música" : "Poner música";
    }

    button.addEventListener("click", function () {
        enabled = !enabled;
        try { localStorage.setItem(STORE_KEY, enabled ? "on" : "off"); } catch (e) { /* sin storage */ }
        paint();
        if (enabled) box.start(); else box.stop();
    });

    function mount() {
        document.body.appendChild(button);
        /* Los navegadores exigen un gesto del usuario para sonar. */
        var wake = function () {
            document.removeEventListener("pointerdown", wake);
            document.removeEventListener("keydown", wake);
            if (enabled && !gameRunning) box.start();
        };
        document.addEventListener("pointerdown", wake);
        document.addEventListener("keydown", wake);
        if (enabled) box.start();          // por si el navegador ya lo permite
    }

    /* ----------------------------------------------------------------------
       5. Convivencia con el emulador
       ----------------------------------------------------------------------
       Mientras el juego se descarga y carga, la música sigue: es justo la
       espera que queremos amenizar. En cuanto la partida arranca de verdad
       (nos avisa touch-controls.js desde dentro del iframe) se desvanece,
       y vuelve al cerrar el modal.
       ---------------------------------------------------------------------- */

    var gameRunning = false;

    window.addEventListener("message", function (e) {
        if (!e.data || e.data.rg !== "gameStart") return;
        gameRunning = true;
        button.classList.add("is-hidden");
        box.stop();
    });

    function watchModal() {
        var modal = document.getElementById("emulator-modal");
        if (!modal || !window.MutationObserver) return;
        new MutationObserver(function () {
            if (modal.classList.contains("active")) return;
            if (!gameRunning) return;
            gameRunning = false;
            button.classList.remove("is-hidden");
            if (enabled) box.start();
        }).observe(modal, { attributes: true, attributeFilter: ["class"] });
    }

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) box.stop(false);
        else if (enabled && !gameRunning) box.start();
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { mount(); watchModal(); });
    } else {
        mount();
        watchModal();
    }
})();
