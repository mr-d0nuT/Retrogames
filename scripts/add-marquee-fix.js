const fs = require('fs');
const path = require('path');

function updatePlatform(platform) {
    const jsPath = path.join(__dirname, `../${platform}/js/app.js`);
    const cssPath = path.join(__dirname, `../${platform}/css/style.css`);
    
    // 1. Update JS
    let js = fs.readFileSync(jsPath, 'utf8');
    
    // Find where renderGames ends.
    // We will inject it right before the end of the renderGames function block.
    // A reliable way is to find "grid.appendChild(card);\n        });\n"
    const hook = "grid.appendChild(card);\n        });";
    if (js.includes(hook) && !js.includes('marquee-auto')) {
        const insertion = `
        setTimeout(() => {
            document.querySelectorAll('.game-title').forEach(title => {
                if (title.scrollWidth > title.clientWidth) {
                    const overflow = title.scrollWidth - title.clientWidth;
                    title.style.setProperty('--overflow', '-' + overflow + 'px');
                    title.style.animation = 'marquee-auto ' + (3 + overflow/20) + 's linear infinite alternate';
                }
            });
        }, 100);`;
        js = js.replace(hook, hook + insertion);
        fs.writeFileSync(jsPath, js);
    }

    // 2. Update CSS
    if (fs.existsSync(cssPath)) {
        let css = fs.readFileSync(cssPath, 'utf8');
        css = css.replace(/\.game-card:hover \.game-title \{[\s\S]*?\}\n/g, '');
        if (!css.includes('marquee-auto')) {
            css += `\n
@keyframes marquee-auto {
    0%, 15% { transform: translateX(0); }
    85%, 100% { transform: translateX(var(--overflow)); }
}\n`;
            fs.writeFileSync(cssPath, css);
        }
    }
}

updatePlatform('arcade');
updatePlatform('snes');
updatePlatform('amiga');
