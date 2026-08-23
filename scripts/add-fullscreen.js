const fs = require('fs');
const path = require('path');

function addFullscreenHtml(platform) {
    const htmlPath = path.join(__dirname, `../${platform}/index.html`);
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    const targetHtml = `<button id="close-emulator" class="close-btn font-retro text-xs">CERRAR X</button>`;
    const newHtml = `<div class="flex gap-2">\n                <button id="fullscreen-btn" class="close-btn font-retro text-xs" style="background:#3b82f6;">FULLSCREEN [ ]</button>\n                <button id="close-emulator" class="close-btn font-retro text-xs">CERRAR X</button>\n            </div>`;
    
    html = html.replace(targetHtml, newHtml);
    fs.writeFileSync(htmlPath, html);
}

function addFullscreenJs(platform) {
    const jsPath = path.join(__dirname, `../${platform}/js/app.js`);
    let js = fs.readFileSync(jsPath, 'utf8');
    
    const jsLogic = `
    document.getElementById('fullscreen-btn').addEventListener('click', () => {
        const modal = document.getElementById('emulator-modal');
        if (!document.fullscreenElement) {
            modal.requestFullscreen().catch(err => console.log(err));
        } else {
            document.exitFullscreen();
        }
    });
`;
    // inject after closeModal listener
    js = js.replace(/closeModal\(\);\n    \}\);/, "closeModal();\n    });\n" + jsLogic);
    fs.writeFileSync(jsPath, js);
}

['snes', 'arcade'].forEach(p => {
    addFullscreenHtml(p);
    addFullscreenJs(p);
});

console.log("Added fullscreen buttons!");
