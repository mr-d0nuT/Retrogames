const fs = require('fs');
const path = require('path');
const indexPath = path.join(__dirname, '../index.html');

let html = fs.readFileSync(indexPath, 'utf8');

// 1. Remove hardcoded font-size from .neon-subtitle CSS
html = html.replace(/font-size:\s*2\.5rem;/, '');

// 2. Add Tailwind responsive text sizes to the subtitle paragraph
html = html.replace(
    '<p class="neon-subtitle relative z-10 mt-4">The Ultimate Arcade Portal</p>',
    '<p class="neon-subtitle relative z-10 mt-4 text-2xl sm:text-3xl md:text-4xl px-4 text-center">The Ultimate Arcade Portal</p>'
);

fs.writeFileSync(indexPath, html);
