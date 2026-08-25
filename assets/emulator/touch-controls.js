/* ==========================================================================
   RETROGAMES · HUD de controles táctiles
   --------------------------------------------------------------------------
   Se carga DENTRO del iframe del emulador, ANTES de emulatorjs/data/loader.js.
   La página anfitriona solo tiene que declarar el sistema:

       <script>window.RG_SYSTEM = 'snes';</script>   // 'snes' | 'arcade' | 'amiga'
       <link rel="stylesheet" href="../assets/emulator/touch-controls.css">
       <script src="../assets/emulator/touch-controls.js"></script>
       <script src="../emulatorjs/data/loader.js"></script>

   Qué hace
   --------
   1. Declara `EJS_VirtualGamepadSettings` con la botonera propia de cada
      sistema (y `EJS_defaultOptions` con el mapeo de teclas de Amiga).
   2. Cuando el mando existe, marca contenedores y botones con clases
      propias para que la hoja de estilos los coloque por rejilla.
   3. Sustituye la gestión táctil de EmulatorJS por una capa propia con:
      cruceta de 8 direcciones con sectores anchos en diagonal, deslizamiento
      entre botones, recuento de pulsaciones (UP compartido por cruceta y
      salto), vibración y atenuado por inactividad.

   Si algo de (2)/(3) fallara, EmulatorJS conserva su propio manejo táctil:
   el mando seguiría funcionando, solo perdería los extras.
   ========================================================================== */

(function () {
    "use strict";

    /* ----------------------------------------------------------------------
       Índices del RetroPad (los mismos que usa gameManager.simulateInput)
       ---------------------------------------------------------------------- */
    var PAD = {
        B: 0, Y: 1, SELECT: 2, START: 3,
        UP: 4, DOWN: 5, LEFT: 6, RIGHT: 7,
        A: 8, X: 9, L: 10, R: 11
    };

    /* ----------------------------------------------------------------------
       Botoneras por sistema
       ----------------------------------------------------------------------
       ARCADE · mame2003_plus usa el mapeo "RetroPad classic":
                B=botón 1, A=2, Y=3, X=4, L=5, R=6, SELECT=moneda, START=start.
                Por eso las etiquetas son los números reales de MAME.
       AMIGA  · PUAE: B=disparo, A=2º disparo, X=Space (por defecto),
                SELECT=teclado virtual (por defecto). Y, L, R y START se mapean
                en EJS_defaultOptions. El botón "▲" repite el UP del joystick,
                que en Amiga es el salto de casi todos los juegos.
                JOY/MOUSE conmuta el modo raton del nucleo: con el activado la
                cruceta mueve el puntero y FUEGO/F2 son los clics. Ademas, el
                dedo sobre la pantalla mueve el raton (ver installPointerBridge).
       ---------------------------------------------------------------------- */
    var LAYOUTS = {
        snes: {
            buttons: [
                { id: "x", text: "X", input: PAD.X, location: "right", shape: "round" },
                { id: "y", text: "Y", input: PAD.Y, location: "right", shape: "round" },
                { id: "a", text: "A", input: PAD.A, location: "right", shape: "round" },
                { id: "b", text: "B", input: PAD.B, location: "right", shape: "round" },
                { id: "l", text: "L", input: PAD.L, location: "top", shape: "pill" },
                { id: "r", text: "R", input: PAD.R, location: "top", shape: "pill" },
                { id: "select", text: "SELECT", input: PAD.SELECT, location: "center", shape: "pill" },
                { id: "start", text: "START", input: PAD.START, location: "center", shape: "pill" }
            ]
        },
        arcade: {
            buttons: [
                { id: "btn1", text: "1", input: PAD.B, location: "right", shape: "round" },
                { id: "btn2", text: "2", input: PAD.A, location: "right", shape: "round" },
                { id: "btn3", text: "3", input: PAD.Y, location: "right", shape: "round" },
                { id: "btn4", text: "4", input: PAD.X, location: "right", shape: "round" },
                { id: "btn5", text: "5", input: PAD.L, location: "right", shape: "round" },
                { id: "btn6", text: "6", input: PAD.R, location: "right", shape: "round" },
                { id: "coin", text: "COIN", input: PAD.SELECT, location: "center", shape: "pill" },
                { id: "start", text: "START", input: PAD.START, location: "center", shape: "pill" }
            ]
        },
        amiga: {
            options: {
                "puae_mapper_x": "RETROK_SPACE",
                "puae_mapper_y": "RETROK_RETURN",
                "puae_mapper_l": "MOUSE_LEFT_BUTTON",
                "puae_mapper_r": "MOUSE_RIGHT_BUTTON",
                "puae_mapper_select": "TOGGLE_VKBD",
                "puae_mapper_start": "SWITCH_JOYMOUSE"
            },
            buttons: [
                { id: "jump", text: "▲", input: PAD.UP, location: "right", shape: "round", label: "Saltar" },
                { id: "fire2", text: "F2", input: PAD.A, location: "right", shape: "round", label: "Disparo 2" },
                { id: "fire", text: "FIRE", input: PAD.B, location: "right", shape: "round", label: "Disparo" },
                { id: "mouse_l", text: "MOUSE L", input: PAD.L, location: "top", shape: "pill" },
                { id: "mouse_r", text: "MOUSE R", input: PAD.R, location: "top", shape: "pill" },
                { id: "space", text: "SPACE", input: PAD.X, location: "center", shape: "pill" },
                { id: "enter", text: "ENTER", input: PAD.Y, location: "center", shape: "pill" },
                { id: "vkbd", text: "TECLADO", input: PAD.SELECT, location: "center", shape: "pill" },
                { id: "joymouse", text: "JOY/MOUSE", input: PAD.START, location: "center", shape: "pill", label: "Cambiar entre joystick y raton" }
            ]
        }
    };

    var SYSTEM = String(window.RG_SYSTEM || "snes").toLowerCase();
    var LAYOUT = LAYOUTS[SYSTEM] || LAYOUTS.snes;

    /* ----------------------------------------------------------------------
       1. Configuración que lee loader.js
       ---------------------------------------------------------------------- */

    window.EJS_VirtualGamepadSettings = LAYOUT.buttons.map(function (b) {
        return {
            type: "button",
            text: b.text,
            id: b.id,
            location: b.location,
            input_value: b.input
        };
    }).concat([{
        type: "dpad",
        id: "dpad",
        location: "left",
        joystickInput: false,
        inputValues: [PAD.UP, PAD.DOWN, PAD.LEFT, PAD.RIGHT]
    }]);

    if (LAYOUT.options) {
        window.EJS_defaultOptions = Object.assign({}, LAYOUT.options, window.EJS_defaultOptions || {});
    }

    /* ----------------------------------------------------------------------
       2. Utilidades
       ---------------------------------------------------------------------- */

    function haptic(ms) {
        try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* sin vibración */ }
    }

    /* Los `env(safe-area-inset-*)` valen 0 dentro de un iframe: los leemos del
       documento padre (mismo origen) y los inyectamos como variables CSS. */
    function syncSafeArea() {
        var insets = { top: 0, right: 0, bottom: 0, left: 0 };
        try {
            var doc = window.parent.document;
            var probe = doc.getElementById("rg-safe-area-probe");
            if (!probe) {
                probe = doc.createElement("div");
                probe.id = "rg-safe-area-probe";
                probe.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;" +
                    "pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) " +
                    "env(safe-area-inset-bottom) env(safe-area-inset-left);";
                doc.body.appendChild(probe);
            }
            var cs = doc.defaultView.getComputedStyle(probe);
            insets.top = parseFloat(cs.paddingTop) || 0;
            insets.right = parseFloat(cs.paddingRight) || 0;
            insets.bottom = parseFloat(cs.paddingBottom) || 0;
            insets.left = parseFloat(cs.paddingLeft) || 0;
        } catch (e) { /* origen distinto: nos quedamos con los env() del iframe */ }

        if (!insets.top && !insets.right && !insets.bottom && !insets.left) return;
        var style = document.documentElement.style;
        style.setProperty("--rg-sat", insets.top + "px");
        style.setProperty("--rg-sar", insets.right + "px");
        style.setProperty("--rg-sab", insets.bottom + "px");
        style.setProperty("--rg-sal", insets.left + "px");
    }

    /* ----------------------------------------------------------------------
       3. Cruceta: dibujo vectorial sobre la superficie táctil de EmulatorJS
       ---------------------------------------------------------------------- */

    var DPAD_PATH =
        "M33,13 A11,11 0 0 1 44,2 L56,2 A11,11 0 0 1 67,13 L67,26 A7,7 0 0 0 74,33 " +
        "L87,33 A11,11 0 0 1 98,44 L98,56 A11,11 0 0 1 87,67 L74,67 A7,7 0 0 0 67,74 " +
        "L67,87 A11,11 0 0 1 56,98 L44,98 A11,11 0 0 1 33,87 L33,74 A7,7 0 0 0 26,67 " +
        "L13,67 A11,11 0 0 1 2,56 L2,44 A11,11 0 0 1 13,33 L26,33 A7,7 0 0 0 33,26 Z";

    function paintDpad(host) {
        if (host.querySelector(".rg-dpad-art")) return;
        host.insertAdjacentHTML("afterbegin",
            '<svg class="rg-dpad-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
                '<defs><clipPath id="rg-dpad-clip"><path d="' + DPAD_PATH + '"/></clipPath></defs>' +
                '<path class="rg-dpad-body" d="' + DPAD_PATH + '"/>' +
                '<g clip-path="url(#rg-dpad-clip)">' +
                    '<rect class="rg-seg rg-seg-up" x="0" y="0" width="100" height="34"/>' +
                    '<rect class="rg-seg rg-seg-down" x="0" y="66" width="100" height="34"/>' +
                    '<rect class="rg-seg rg-seg-left" x="0" y="0" width="34" height="100"/>' +
                    '<rect class="rg-seg rg-seg-right" x="66" y="0" width="34" height="100"/>' +
                '</g>' +
                '<circle class="rg-hub" cx="50" cy="50" r="9"/>' +
                '<path class="rg-arrow rg-arrow-up" d="M50,12 L57,25 L43,25 Z"/>' +
                '<path class="rg-arrow rg-arrow-down" d="M50,88 L43,75 L57,75 Z"/>' +
                '<path class="rg-arrow rg-arrow-left" d="M12,50 L25,43 L25,57 Z"/>' +
                '<path class="rg-arrow rg-arrow-right" d="M88,50 L75,57 L75,43 Z"/>' +
            '</svg>');
    }

    /* ----------------------------------------------------------------------
       4. Capa de entrada propia
       ---------------------------------------------------------------------- */

    /* Semiángulo de los sectores rectos: 19° deja 38° para cada dirección
       recta y 52° para cada diagonal — mucho más tolerante que el reparto
       original de EmulatorJS (20° de diagonal) para medias lunas y saltos. */
    var CARDINAL_HALF = 19;
    var DEAD_ZONE = 0.17;
    var DIRS = [["up", PAD.UP], ["down", PAD.DOWN], ["left", PAD.LEFT], ["right", PAD.RIGHT]];

    function installInput(root, dpadSurface) {
        var counts = Object.create(null);   // índice RetroPad -> nº de dedos
        var active = Object.create(null);   // id de toque -> destino
        var dstate = { up: 0, down: 0, left: 0, right: 0 };
        var idleTimer = null;

        function sim(index, value) {
            var emu = window.EJS_emulator;
            if (!emu || !emu.gameManager) return;
            try { emu.gameManager.simulateInput(0, index, value); } catch (e) { /* núcleo no listo */ }
        }

        function press(index) {
            counts[index] = (counts[index] || 0) + 1;
            if (counts[index] === 1) sim(index, 1);
        }

        function release(index) {
            var next = (counts[index] || 0) - 1;
            counts[index] = next > 0 ? next : 0;
            if (next <= 0) sim(index, 0);
        }

        function wake() {
            root.classList.remove("rg-idle");
            if (idleTimer) clearTimeout(idleTimer);
            idleTimer = setTimeout(function () { root.classList.add("rg-idle"); }, 4500);
        }

        function setDpad(up, down, left, right) {
            var next = { up: up, down: down, left: left, right: right };
            for (var i = 0; i < DIRS.length; i++) {
                var name = DIRS[i][0];
                if (next[name] === dstate[name]) continue;
                if (next[name]) press(DIRS[i][1]); else release(DIRS[i][1]);
                if (dpadSurface) dpadSurface.classList.toggle("ejs_dpad_" + name + "_pressed", !!next[name]);
            }
            if (dpadSurface && (next.up || next.down || next.left || next.right) &&
                !(dstate.up || dstate.down || dstate.left || dstate.right)) haptic(6);
            dstate = next;
        }

        function aimDpad(clientX, clientY) {
            var box = dpadSurface.getBoundingClientRect();
            var dx = clientX - (box.left + box.width / 2);
            var dy = clientY - (box.top + box.height / 2);
            if (Math.sqrt(dx * dx + dy * dy) < box.width * DEAD_ZONE) return setDpad(0, 0, 0, 0);

            var a = Math.atan2(-dy, dx) * 180 / Math.PI;
            if (a < 0) a += 360;
            var h = CARDINAL_HALF;
            if (a < h || a >= 360 - h) setDpad(0, 0, 0, 1);
            else if (a < 90 - h) setDpad(1, 0, 0, 1);
            else if (a < 90 + h) setDpad(1, 0, 0, 0);
            else if (a < 180 - h) setDpad(1, 0, 1, 0);
            else if (a < 180 + h) setDpad(0, 0, 1, 0);
            else if (a < 270 - h) setDpad(0, 1, 1, 0);
            else if (a < 270 + h) setDpad(0, 1, 0, 0);
            else setDpad(0, 1, 0, 1);
        }

        function buttonAt(x, y) {
            var el = document.elementFromPoint(x, y);
            if (!el || !el.closest) return null;
            var btn = el.closest(".rg-btn");
            return (btn && root.contains(btn)) ? btn : null;
        }

        function grab(btn) {
            btn.classList.add("is-down");
            press(parseInt(btn.getAttribute("data-rg-input"), 10));
            haptic(9);
        }

        function drop(btn) {
            btn.classList.remove("is-down");
            release(parseInt(btn.getAttribute("data-rg-input"), 10));
        }

        function releaseAll() {
            for (var id in active) {
                if (active[id] && active[id].button) active[id].button.classList.remove("is-down");
                delete active[id];
            }
            for (var index in counts) {
                if (counts[index] > 0) sim(index, 0);
                counts[index] = 0;
            }
            dstate = { up: 0, down: 0, left: 0, right: 0 };
            if (dpadSurface) {
                dpadSurface.classList.remove("ejs_dpad_up_pressed", "ejs_dpad_down_pressed",
                    "ejs_dpad_left_pressed", "ejs_dpad_right_pressed");
            }
        }

        function onStart(e) {
            var touches = e.changedTouches;
            var handled = false;
            for (var i = 0; i < touches.length; i++) {
                var t = touches[i];
                var target = t.target;
                if (dpadSurface && (target === dpadSurface || dpadSurface.contains(target))) {
                    active[t.identifier] = { dpad: true };
                    aimDpad(t.clientX, t.clientY);
                    handled = true;
                    continue;
                }
                var btn = (target.closest && target.closest(".rg-btn")) || buttonAt(t.clientX, t.clientY);
                if (btn && root.contains(btn)) {
                    active[t.identifier] = { button: btn };
                    grab(btn);
                    handled = true;
                }
            }
            if (handled) { e.preventDefault(); e.stopPropagation(); wake(); }
        }

        function onMove(e) {
            var touches = e.changedTouches;
            var handled = false;
            for (var i = 0; i < touches.length; i++) {
                var t = touches[i];
                var slot = active[t.identifier];
                if (!slot) continue;
                handled = true;
                if (slot.dpad) {
                    aimDpad(t.clientX, t.clientY);
                    continue;
                }
                /* Deslizar de un botón a otro (imprescindible en lucha):
                   si el dedo sale a la nada, mantenemos el botón original. */
                var over = buttonAt(t.clientX, t.clientY);
                if (over && over !== slot.button) {
                    drop(slot.button);
                    slot.button = over;
                    grab(over);
                }
            }
            if (handled) { e.preventDefault(); e.stopPropagation(); }
        }

        function onEnd(e) {
            var touches = e.changedTouches;
            var handled = false;
            for (var i = 0; i < touches.length; i++) {
                var slot = active[touches[i].identifier];
                if (!slot) continue;
                handled = true;
                delete active[touches[i].identifier];
                if (slot.dpad) setDpad(0, 0, 0, 0);
                else if (slot.button) drop(slot.button);
            }
            if (handled) { e.preventDefault(); e.stopPropagation(); wake(); }
        }

        root.addEventListener("touchstart", onStart, { capture: true, passive: false });
        root.addEventListener("touchmove", onMove, { capture: true, passive: false });
        root.addEventListener("touchend", onEnd, { capture: true, passive: false });
        root.addEventListener("touchcancel", onEnd, { capture: true, passive: false });

        /* Nada de teclas encasquilladas al girar el móvil o cambiar de app. */
        window.addEventListener("orientationchange", releaseAll);
        window.addEventListener("resize", releaseAll);
        window.addEventListener("blur", releaseAll);
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) releaseAll();
        });

        wake();
        return { wake: wake, releaseAll: releaseAll };
    }

    /* ----------------------------------------------------------------------
       5. Amiga: arrastrar por la pantalla mueve el raton
       ----------------------------------------------------------------------
       PUAE toma el raton de los eventos de raton del navegador, asi que
       traducimos el dedo a movimiento relativo sobre el lienzo. Un toque corto
       y quieto es un clic izquierdo; arrastrar SOLO mueve el puntero. (Antes
       cada arrastre empezaba con un clic, asi que era imposible apuntar en
       juegos como Lemmings sin pulsar lo primero que hubiera debajo.)
       ---------------------------------------------------------------------- */

    var POINTER = { speed: 1.6, tapMs: 260, tapPx: 12, clickMs: 90 };

    function installPointerBridge(canvas) {
        var touchId = null, startX = 0, startY = 0, lastX = 0, lastY = 0, startAt = 0, dragged = false;

        function mouse(type, x, y, mx, my) {
            /* Sin burbujeo a proposito: el nucleo escucha en el propio lienzo,
               mientras que EmulatorJS abre su barra de menu con cualquier
               mousemove que suba hasta el contenedor. Asi el raton llega al
               juego sin que el menu tape los controles a cada arrastre. */
            var ev = new MouseEvent(type, {
                bubbles: false, cancelable: true, view: window, button: 0,
                clientX: x, clientY: y
            });
            if (typeof mx === "number") {
                Object.defineProperty(ev, "movementX", { value: mx });
                Object.defineProperty(ev, "movementY", { value: my });
            }
            canvas.dispatchEvent(ev);
        }

        function mine(list) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].identifier === touchId) return list[i];
            }
            return null;
        }

        canvas.addEventListener("touchstart", function (e) {
            if (touchId !== null) return;               /* solo el primer dedo */
            var t = e.changedTouches[0];
            touchId = t.identifier;
            startX = lastX = t.clientX;
            startY = lastY = t.clientY;
            startAt = Date.now();
            dragged = false;
            e.preventDefault();
        }, { passive: false });

        canvas.addEventListener("touchmove", function (e) {
            var t = mine(e.changedTouches);
            if (!t) return;
            var dx = t.clientX - lastX, dy = t.clientY - lastY;
            lastX = t.clientX;
            lastY = t.clientY;
            if (Math.abs(t.clientX - startX) > POINTER.tapPx ||
                Math.abs(t.clientY - startY) > POINTER.tapPx) dragged = true;
            if (dx || dy) mouse("mousemove", t.clientX, t.clientY, dx * POINTER.speed, dy * POINTER.speed);
            e.preventDefault();
        }, { passive: false });

        function release(e) {
            var t = mine(e.changedTouches);
            if (!t) return;
            touchId = null;
            if (!dragged && Date.now() - startAt < POINTER.tapMs) {
                mouse("mousedown", t.clientX, t.clientY);
                haptic(9);
                setTimeout(function () { mouse("mouseup", t.clientX, t.clientY); }, POINTER.clickMs);
            }
            e.preventDefault();
        }

        canvas.addEventListener("touchend", release, { passive: false });
        canvas.addEventListener("touchcancel", release, { passive: false });
    }

    /* ----------------------------------------------------------------------
       6. Montaje
       ---------------------------------------------------------------------- */

    function decorate(emulator) {
        var root = emulator.virtualGamepad;
        root.classList.add("rg-pad", "rg-sys-" + SYSTEM);

        var bands = root.children;                 // top, center, left, right
        bands[0].classList.add("rg-band", "rg-band-top");
        bands[1].classList.add("rg-band", "rg-band-center");
        bands[2].classList.add("rg-cluster", "rg-cluster-primary");
        bands[3].classList.add("rg-cluster", "rg-cluster-action");

        LAYOUT.buttons.forEach(function (b) {
            var el = root.querySelector(".b_" + b.id);
            if (!el) return;
            el.classList.add("rg-btn", b.shape === "pill" ? "rg-pill" : "rg-round");
            el.setAttribute("data-rg-input", b.input);
            el.setAttribute("role", "button");
            el.setAttribute("aria-label", b.label || b.text);
        });

        var dpadHost = root.querySelector(".b_dpad");
        var dpadSurface = root.querySelector(".ejs_dpad_main");
        if (dpadHost) paintDpad(dpadHost);

        var input = installInput(root, dpadSurface);

        if (emulator.elements && emulator.elements.menuToggle) {
            emulator.elements.menuToggle.classList.add("rg-menu");
        }

        if (SYSTEM === "amiga" && emulator.canvas) {
            installPointerBridge(emulator.canvas);
        }

        /* iPadOS se identifica como escritorio, así que EmulatorJS deja el
           mando apagado en tablets. Si el puntero principal es un dedo lo
           encendemos al arrancar la partida —después de que se apliquen los
           ajustes guardados— y sin persistirlo, para que el usuario pueda
           desactivarlo desde el menú si quiere. */
        if (typeof emulator.on === "function") {
            emulator.on("start", function () {
                if (input) input.wake();   /* el HUD entra a plena opacidad */
                try {
                    var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
                    var stored = emulator.preGetSetting ? emulator.preGetSetting("virtual-gamepad") : null;
                    if (!coarse || stored) return;
                    if (emulator.changeSettingOption) emulator.changeSettingOption("virtual-gamepad", "enabled", true);
                    if (emulator.toggleVirtualGamepad) emulator.toggleVirtualGamepad(true);
                } catch (e) { /* ajuste opcional */ }
            });
        }
    }

    function whenReady(callback) {
        var deadline = Date.now() + 120000;
        (function poll() {
            var emu = window.EJS_emulator;
            if (emu && emu.virtualGamepad && emu.virtualGamepad.children.length >= 4) {
                try { callback(emu); } catch (err) { console.warn("[RG] HUD táctil:", err); }
                return;
            }
            if (Date.now() > deadline) return;
            setTimeout(poll, 90);
        })();
    }

    syncSafeArea();
    window.addEventListener("orientationchange", function () { setTimeout(syncSafeArea, 260); });
    window.addEventListener("resize", function () { setTimeout(syncSafeArea, 260); });
    whenReady(decorate);
})();
