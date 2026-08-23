document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("games-grid");
    const modal = document.getElementById("emulator-modal");
    const closeBtn = document.getElementById("close-emulator");
    const modalTitle = document.getElementById("modal-title");
    
    // Load games from JSON
    fetch("data/games.json")
        .then(response => response.json())
        .then(games => {
            renderGames(games);
        })
        .catch(error => {
            console.error("Error loading games:", error);
            grid.innerHTML = '<p class="text-red-400">Error loading games list.</p>';
        });

    function renderGames(games) {
        grid.innerHTML = "";
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
