const fs = require('fs');
const path = require('path');

const code = `
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
`;

function inject(filePath) {
    let js = fs.readFileSync(filePath, 'utf8');
    if (!js.includes("Auto Fullscreen on Rotation")) {
        fs.writeFileSync(filePath, js + "\n" + code);
        console.log("Injected into " + filePath);
    }
}

inject(path.join(__dirname, '../arcade/js/app.js'));
inject(path.join(__dirname, '../snes/js/app.js'));
