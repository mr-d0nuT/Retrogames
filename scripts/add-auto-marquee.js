const fs = require('fs');
const path = require('path');

function updatePlatform(platform) {
    const jsPath = path.join(__dirname, `../${platform}/js/app.js`);
    const cssPath = path.join(__dirname, `../${platform}/css/style.css`);
    
    // 1. Update JS
    let js = fs.readFileSync(jsPath, 'utf8');
    
    // Find where grid.innerHTML = ... ends.
    // It's followed by .join('') or similar.
    const hook = "grid.innerHTML = games.map(game => `";
    if (js.includes(hook) && !js.includes('auto-marquee')) {
        const insertion = `
            setTimeout(() => {
                document.querySelectorAll('.game-title').forEach(title => {
                    if (title.scrollWidth > title.clientWidth) {
                        const overflow = title.scrollWidth - title.clientWidth;
                        title.style.setProperty('--overflow', '-' + overflow + 'px');
                        title.style.animation = 'marquee-auto ' + (2 + overflow/20) + 's linear infinite alternate';
                    }
                });
            }, 100);
`;
        // Insert after the grid assignment
        js = js.replace(/(grid\.innerHTML = games\.map\([\s\S]*?\}\);)/, "$1" + insertion);
        fs.writeFileSync(jsPath, js);
    }

    // 2. Update CSS
    let css = fs.readFileSync(cssPath, 'utf8');
    // Remove the old hover marquee
    css = css.replace(/\.game-card:hover \.game-title \{[\s\S]*?\}\n/g, '');
    
    if (!css.includes('marquee-auto')) {
        css += `\n
@keyframes marquee-auto {
    0%, 10% { transform: translateX(0); }
    90%, 100% { transform: translateX(var(--overflow)); }
}
`;
        fs.writeFileSync(cssPath, css);
    }
}

updatePlatform('arcade');
updatePlatform('snes');
