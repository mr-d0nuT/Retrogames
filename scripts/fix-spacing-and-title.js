const fs = require('fs');
const path = require('path');
const indexPath = path.join(__dirname, '../index.html');

let html = fs.readFileSync(indexPath, 'utf8');

// 1. Fix RETROGAMES text size to never overflow using viewport scaling
// Replace text-4xl sm:text-6xl md:text-8xl with text-[clamp(2rem,10vw,6rem)]
html = html.replace(/text-4xl sm:text-6xl md:text-8xl mb-2 shrink/, 'mb-0 shrink" style="font-size: clamp(2rem, 10vw, 6rem); line-height: 1;');

// 2. Remove gap-4 md:gap-6 from the title container to bring donut closer if needed, actually keep gap-4
// Remove mb-2 from h1 (done above by changing to mb-0)

// 3. Fix the Sun margin
// Replace `margin: 20px auto;` with `margin: 0 auto; margin-top: -5px;`
html = html.replace(/margin:\s*20px\s+auto;/, 'margin: 0 auto; margin-top: -5px;');

// 4. Fix the Subtitle margin
// Replace mt-4 with something smaller, or use inline style for exact 2px.
html = html.replace(/mt-4 text-2xl/, 'text-2xl'); // remove mt-4
html = html.replace(/<p class="neon-subtitle relative z-10 text-2xl/, '<p class="neon-subtitle relative z-10 text-2xl" style="margin-top: 2px;"');

fs.writeFileSync(indexPath, html);
