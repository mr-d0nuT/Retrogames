document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("games-grid");
    const modal = document.getElementById("emulator-modal");
    const closeBtn = document.getElementById("close-emulator");
    const modalTitle = document.getElementById("modal-title");
    
    let allGames = [];
    let currentFilter = { text: "", letter: "ALL" };

    // Load games from JSON
    fetch("data/games.json")
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
        const alphaContainer = document.getElementById("alphabet-container");
        
        // Generate A-Z buttons
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        letters.forEach(letter => {
            const btn = document.createElement("button");
            btn.className = "alpha-btn px-2.5 py-1.5 rounded-md text-xs font-mono font-bold text-slate-400 hover:text-white hover:bg-purple-600/50 transition-all";
            btn.dataset.letter = letter;
            btn.textContent = letter;
            alphaContainer.appendChild(btn);
        });

        const allAlphaBtns = document.querySelectorAll(".alpha-btn");

        // Search Input Listener
        searchInput.addEventListener("input", (e) => {
            currentFilter.text = e.target.value.toLowerCase();
            applyFilters();
        });

        // Alphabet Listener
        allAlphaBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                // Remove active styling from all buttons
                allAlphaBtns.forEach(b => {
                    b.classList.remove("text-white", "bg-purple-600", "shadow-[0_0_10px_rgba(168,85,247,0.8)]");
                    b.classList.add("text-slate-400");
                });
                
                // Add active styling to clicked button
                const target = e.target;
                target.classList.remove("text-slate-400");
                target.classList.add("text-white", "bg-purple-600", "shadow-[0_0_10px_rgba(168,85,247,0.8)]");
                
                currentFilter.letter = target.dataset.letter;
                applyFilters();
            });
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
            const fallbackImage = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect fill='%23334155' width='300' height='400'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='24' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Cover%3C/text%3E%3C/svg%3E";

            card.innerHTML = `
                <div class="cover-wrapper">
                    <img src="${game.cover}" alt="${game.title}" onerror="this.src='${fallbackImage}'">
                    <div class="overlay"></div>
                    <div class="game-info">
                        <div class="game-title">${game.title}</div>
                    </div>
                </div>
            `;
            
            card.addEventListener("click", () => launchGame(game));
            grid.appendChild(card);
        });
    }

    function launchGame(game) {
        modalTitle.textContent = game.title;
        modal.classList.add("active");
        
        // Clean up previous emulator instance if any
        document.getElementById("game-container").innerHTML = "<div id='game'></div>";

        // Safari Audio Crackling Fix
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        if (window.AudioContext && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
            const originalAudioContext = window.AudioContext;
            window.AudioContext = function(options) {
                return new originalAudioContext(Object.assign({ latencyHint: 'playback', sampleRate: 44100 }, options || {}));
            };
            window.AudioContext.prototype = originalAudioContext.prototype;
        }

        // Initialize EmulatorJS
        window.EJS_player = '#game';
        window.EJS_core = 'snes';
        window.EJS_gameUrl = game.rom;
        window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
        
        // Load the EmulatorJS script dynamically
        const script = document.createElement("script");
        script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
        script.id = "ejs-loader";
        document.body.appendChild(script);
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
