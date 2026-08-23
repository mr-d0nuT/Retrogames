const fs = require('fs');
const path = require('path');

// 1. Setup CSS
const snesCss = fs.readFileSync(path.join(__dirname, '../snes/css/style.css'), 'utf8');
const amigaCss = snesCss.replace(/from-blue-400 via-purple-400 to-pink-500/g, 'from-orange-400 via-red-500 to-yellow-500'); // Amiga colors
fs.writeFileSync(path.join(__dirname, '../amiga/css/style.css'), amigaCss);

// 2. Setup JS
let snesJs = fs.readFileSync(path.join(__dirname, '../snes/js/app.js'), 'utf8');
snesJs = snesJs.replace(/window\.EJS_core = 'snes';/g, "window.EJS_core = 'puae';");
snesJs = snesJs.replace(/fetch\('data\/games\.json'\)/g, "fetch('data/games.json')");
fs.writeFileSync(path.join(__dirname, '../amiga/js/app.js'), snesJs);

// 3. Setup HTML
let snesHtml = fs.readFileSync(path.join(__dirname, '../snes/index.html'), 'utf8');
snesHtml = snesHtml.replace(/<title>SNES Classics<\/title>/g, '<title>Commodore Amiga</title>');
snesHtml = snesHtml.replace(/snes-console\.png/g, 'amiga-logo.png');
snesHtml = snesHtml.replace(/SNES CLASSICS/g, 'COMMODORE AMIGA');
snesHtml = snesHtml.replace(/<p class="text-slate-400 max-w-2xl mx-auto mb-8">Revive la magia de los 16 bits.*<\/p>/, '<p class="text-slate-400 max-w-2xl mx-auto mb-8">El mejor ordenador de 16 bits de la historia.</p>');
snesHtml = snesHtml.replace(/id="snes-grid"/g, 'id="amiga-grid"');
fs.writeFileSync(path.join(__dirname, '../amiga/index.html'), snesHtml);

// Make sure index.html actually points to amiga-grid
let updatedJs = fs.readFileSync(path.join(__dirname, '../amiga/js/app.js'), 'utf8');
updatedJs = updatedJs.replace(/document\.getElementById\('snes-grid'\)/g, "document.getElementById('amiga-grid')");
fs.writeFileSync(path.join(__dirname, '../amiga/js/app.js'), updatedJs);
