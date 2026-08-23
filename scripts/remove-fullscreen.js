const fs = require('fs');
const path = require('path');

function removeFullscreenHtml(platform) {
    const htmlPath = path.join(__dirname, `../${platform}/index.html`);
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Replace the div containing both buttons with just the close button
    const targetHtml = /<div class="flex gap-2">[\s\S]*?<\/div>/;
    const newHtml = `<button id="close-emulator" class="close-btn font-retro text-xs">CERRAR X</button>`;
    
    html = html.replace(targetHtml, newHtml);
    fs.writeFileSync(htmlPath, html);
}

function removeFullscreenJs(platform) {
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
    });`;
    
    js = js.replace(jsLogic, "");
    fs.writeFileSync(jsPath, js);
}

['snes', 'arcade'].forEach(p => {
    removeFullscreenHtml(p);
    removeFullscreenJs(p);
});

console.log("Removed fullscreen buttons!");
