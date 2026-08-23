const fs = require('fs');
const path = require('path');
const indexPath = path.join(__dirname, '../index.html');

let html = fs.readFileSync(indexPath, 'utf8');

const oldHtml = `                    <!-- Placeholder Arcade logo or graphic -->
                    <div class="absolute inset-0 flex items-center justify-center text-6xl opacity-50">🕹️</div>
                    <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900 to-transparent"></div>`;

const newHtml = `                    <div class="absolute inset-0 flex items-center justify-center p-4">
                        <img src="arcade/assets/arcade-machine.jpg" alt="Arcade Machine" class="max-h-full object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-300" style="mix-blend-mode: lighten;">
                    </div>
                    <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>`;

html = html.replace(oldHtml, newHtml);

fs.writeFileSync(indexPath, html);
