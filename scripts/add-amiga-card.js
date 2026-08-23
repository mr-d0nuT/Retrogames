const fs = require('fs');
const path = require('path');
const indexPath = path.join(__dirname, '../index.html');

let html = fs.readFileSync(indexPath, 'utf8');

const oldSega = `            <!-- Placeholder for SEGA -->
            <div class="console-card p-8 flex flex-col items-center justify-center opacity-50 cursor-not-allowed">
                <div class="text-6xl mb-6 grayscale">🦔</div>
                <h3 class="card-title text-gray-500">SEGA</h3>
                <p class="text-gray-500 font-mono text-sm mt-4 text-center">Sega Mega Drive<br>Genesis</p>
                <div class="mt-6 px-4 py-2 bg-gray-800 rounded-full text-xs font-bold font-mono tracking-widest uppercase text-gray-500">
                    COMING SOON
                </div>
            </div>`;

const newAmiga = `            <!-- Commodore Amiga Card -->
            <a href="amiga/index.html" class="platform-card block bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all transform hover:-translate-y-2">
                <div class="h-32 md:h-48 bg-gradient-to-br from-blue-900 to-indigo-900 relative">
                    <div class="absolute inset-0 flex items-center justify-center p-4">
                        <div class="text-6xl drop-shadow-2xl hover:scale-110 transition-transform duration-300">💾</div>
                    </div>
                    <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>
                </div>
                <div class="p-4 md:p-6">
                    <h2 class="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 mb-2 font-retro tracking-wide">Commodore Amiga</h2>
                    <p class="text-slate-400 text-xs md:text-sm font-medium">La era de los 16 bits en ordenador. Descubre sus joyas.</p>
                </div>
            </a>`;

html = html.replace(oldSega, newAmiga);

fs.writeFileSync(indexPath, html);
