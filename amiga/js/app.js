document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("games-grid");
    const modal = document.getElementById("emulator-modal");
    const closeBtn = document.getElementById("close-emulator");
    const modalTitle = document.getElementById("modal-title");
    
    let allGames = [];
    let currentFilter = { text: "", letter: "ALL" };

    // Load games from JSON (with cache buster to prevent old lists)
    fetch("data/games.json?v=" + new Date().getTime())
        .then(response => response.json())
        .then(games => {
            // Sort alphabetically by title
            allGames = games.sort((a, b) => a.title.localeCompare(b.title));
            renderGames(allGames);
            setupSearch();
        })
        .catch(error => {
            console.error("Error loading games:", error);
            grid.innerHTML = '<p class="text-red-400">Error loading games list.</p>';
        });

    function setupSearch() {
        const searchInput = document.getElementById("search-input");
        const alphaSelect = document.getElementById("alphabet-select");
        
        // Generate A-Z options
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        letters.forEach(letter => {
            const opt = document.createElement("option");
            opt.value = letter;
            opt.textContent = letter;
            alphaSelect.appendChild(opt);
        });

        // Search Input Listener
        searchInput.addEventListener("input", (e) => {
            currentFilter.text = e.target.value.toLowerCase();
            
            // Auto-reset alphabet to ALL when typing to avoid confusion
            if (currentFilter.text.length > 0 && currentFilter.letter !== "ALL") {
                currentFilter.letter = "ALL";
                alphaSelect.value = "ALL";
            }
            
            applyFilters();
        });

        // Alphabet Dropdown Listener
        alphaSelect.addEventListener("change", (e) => {
            currentFilter.letter = e.target.value;
            applyFilters();
        });
    }

    function applyFilters() {
        const filtered = allGames.filter(game => {
            const matchesText = game.title.toLowerCase().includes(currentFilter.text);
            
            let matchesLetter = true;
            if (currentFilter.letter !== "ALL") {
                const firstChar = game.title.charAt(0).toUpperCase();
                if (currentFilter.letter === "#") {
                    matchesLetter = !/[A-Z]/.test(firstChar);
                } else {
                    matchesLetter = (firstChar === currentFilter.letter);
                }
            }
            return matchesText && matchesLetter;
        });
        
        renderGames(filtered);
    }

    function renderGames(games) {
        grid.innerHTML = "";
        
        if (games.length === 0) {
            grid.innerHTML = '<div class="col-span-full flex justify-center py-20"><p class="text-2xl font-mono text-fuchsia-500 shadow-[0_0_10px_rgba(255,0,255,0.8)]">GAME OVER! NO SE ENCONTRÓ NADA.</p></div>';
            return;
        }

        games.forEach(game => {
            const card = document.createElement("div");
            card.className = "game-card glass";
            
            // Si la carátula falla al cargar, mostramos un color por defecto
            const fallbackImage = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22400%22 viewBox=%220 0 300 400%22%3E%3Crect fill=%22%231e293b%22 width=%22300%22 height=%22400%22/%3E%3Ctext fill=%22%2394a3b8%22 font-family=%22monospace%22 font-size=%2224%22 dy=%2210.5%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3ENo Cover%3C/text%3E%3C/svg%3E";

            card.innerHTML = `
                <div class="cover-wrapper">
                    <img src="${game.cover}" alt="${game.title}" loading="lazy" onerror="this.src='${fallbackImage}'">
                    <div class="overlay"></div>
                    <div class="game-info">
                        <div class="game-title-container">
                            <div class="game-title">${game.title}</div>
                        </div>
                    </div>
                </div>
            `;
            
            card.addEventListener("click", () => launchGame(game));
            grid.appendChild(card);
        });
        setTimeout(() => {
            document.querySelectorAll('.game-title').forEach(title => {
                if (title.scrollWidth > title.parentElement.clientWidth) {
                    const overflow = title.scrollWidth - title.parentElement.clientWidth;
                    title.style.setProperty('--overflow', '-' + overflow + 'px');
                    title.style.animation = 'marquee-auto ' + (3 + overflow/20) + 's linear infinite alternate';
                }
            });
        }, 100);
    }

    function launchGame(game) {
        modalTitle.textContent = game.title;
        modal.classList.add("active");
        
        const container = document.getElementById("game-container");
        container.innerHTML = "";
        
        // Create an iframe to sandbox the emulator. 
        // This ensures audio and memory are perfectly wiped when closed.
        const iframe = document.createElement("iframe");
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        iframe.id = "emulator-iframe";
        
        container.appendChild(iframe);

        const iframeDoc = iframe.contentWindow.document;
        
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                                body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; overscroll-behavior: none; }
                #game { width: 100%; height: 100%; }
                .ejs_start_button {
                    animation: pulse-neon 1.5s infinite alternate !important;
                    border: 3px solid #ff00ff !important;
                    border-radius: 50px !important;
                }
                @keyframes pulse-neon {
                    0% {
                        box-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff, inset 0 0 10px #ff00ff;
                        border-color: #ff00ff;
                    }
                    50% {
                        box-shadow: 0 0 15px #00ffff, 0 0 30px #00ffff, inset 0 0 15px #00ffff;
                        border-color: #00ffff;
                    }
                    100% {
                        box-shadow: 0 0 10px #ff00ff, 0 0 25px #ff00ff, inset 0 0 10px #ff00ff;
                        border-color: #ff00ff;
                    }
                }
            </style>

            <!-- HUD de controles tactiles (posiciones por sistema y orientacion) -->
            <link rel="stylesheet" href="../assets/emulator/touch-controls.css?v=3">
        </head>
        <body>
            <div id="game"></div>
            <script>
                // Safari Audio Unlocker
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                if (window.AudioContext) {
                    const unlockCtx = new window.AudioContext();
                    unlockCtx.resume();
                }

                window.EJS_player = '#game';
                window.EJS_core = 'puae';
                // El mapeo de teclas del nucleo PUAE (Space, Return, botones de
                // raton y teclado virtual) lo declara touch-controls.js con los
                // valores que espera EmulatorJS en EJS_defaultOptions.
                window.EJS_gameUrl = '${game.rom}'; 
                window.EJS_backgroundImage = window.location.origin + window.location.pathname.replace('index.html', '') + '${game.cover}';
                window.EJS_backgroundBlur = true;
                window.EJS_biosUrl = "../amiga/bios.zip";
                window.EJS_pathtodata = '../emulatorjs/data/';
            
                // El raton tactil (arrastrar = mover, tocar = clic) lo monta
                // touch-controls.js, junto al resto de la entrada tactil.
            </script>

            <script>window.RG_SYSTEM = 'amiga';</script>
            <script src="../assets/emulator/touch-controls.js?v=3"></script>
            <script src="../emulatorjs/data/loader.js"></script>
        </body>
        </html>
        `;
        
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
        
        // Ensure iframe gets focus so gamepads/keyboard work without clicking
        iframe.focus();
    }

    // Close emulator
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
        // Remove the script and clear the container to stop the emulator
        const script = document.getElementById("ejs-loader");
        if (script) {
            script.remove();
        }
        document.getElementById("game-container").innerHTML = "";
        
        // EJS sets some global variables/intervals that might keep running.
        // A clean reload might be safer for memory, but for now we just clear the DOM.
        // If audio keeps playing, a page reload is the most robust way to kill it in EJS.
        // window.location.reload(); 
    });
});


// Auto Fullscreen on Rotation
const mql = window.matchMedia("(orientation: landscape)");
mql.addEventListener("change", (e) => {
    try {
        if (e.matches) {
            const elem = document.documentElement;
            if (elem.requestFullscreen) { elem.requestFullscreen().catch(err=>{}); }
            else if (elem.webkitRequestFullscreen) { elem.webkitRequestFullscreen(); }
        } else {
            if (document.exitFullscreen) { document.exitFullscreen().catch(err=>{}); }
            else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
        }
    } catch(err) {
        console.log("Fullscreen blocked by browser policy");
    }
});
