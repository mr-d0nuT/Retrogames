const fs = require('fs');
const path = require('path');

function addMarqueeToCss(filePath) {
    let css = fs.readFileSync(filePath, 'utf8');
    
    const marqueeCss = `
.game-title-container {
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
}

.game-title {
    font-weight: 600;
    font-size: 1.1rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
    display: inline-block;
    white-space: nowrap;
    /* Optional: add transition for smooth hover start */
    transition: transform 0.2s;
}

/* When the card is hovered, animate the title */
.game-card:hover .game-title {
    /* We use a simple animation. For very long text, you can adjust the duration */
    animation: marquee 5s linear infinite;
}

@keyframes marquee {
    0% { transform: translateX(0%); }
    20% { transform: translateX(0%); } /* Pause at start */
    100% { transform: translateX(-100%); }
}
`;

    // Replace old game-title rule if it exists
    css = css.replace(/\.game-title\s*{[^}]*}/g, '');
    css += marqueeCss;
    
    fs.writeFileSync(filePath, css);
    console.log("Added marquee to", filePath);
}

function updateAppJs(filePath) {
    let js = fs.readFileSync(filePath, 'utf8');
    
    // Wrap game-title inside a game-title-container
    js = js.replace(/<div class="game-info">\s*<div class="game-title">\${game\.title}<\/div>\s*<\/div>/g, 
    `<div class="game-info">
                        <div class="game-title-container">
                            <div class="game-title">\${game.title}</div>
                        </div>
                    </div>`);
                    
    fs.writeFileSync(filePath, js);
    console.log("Updated JS for marquee in", filePath);
}

addMarqueeToCss(path.join(__dirname, '../arcade/css/style.css'));
addMarqueeToCss(path.join(__dirname, '../snes/css/style.css'));

updateAppJs(path.join(__dirname, '../arcade/js/app.js'));
updateAppJs(path.join(__dirname, '../snes/js/app.js'));

