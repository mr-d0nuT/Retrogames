const fs = require('fs');
const path = require('path');
const indexPath = path.join(__dirname, '../index.html');

let html = fs.readFileSync(indexPath, 'utf8');

// 1. Make Donut logo bigger on mobile
html = html.replace(/w-16 sm:w-24 md:w-36/, 'w-24 sm:w-28 md:w-36');

// 2. Make Sun smaller on mobile using responsive CSS
const sunCss = `.synthwave-sun {
            position: relative;
            width: 200px;
            height: 200px;`;
const newSunCss = `.synthwave-sun {
            position: relative;
            width: 140px;
            height: 140px;`;
html = html.replace(sunCss, newSunCss);

// Add media query for desktop sun
const headEnd = '</style>';
const mqSun = `
        @media (min-width: 768px) {
            .synthwave-sun { width: 200px; height: 200px; }
        }
    </style>`;
html = html.replace(headEnd, mqSun);

// 3. Make SNES and Arcade cards smaller on mobile
// Replace h-48 with h-32 md:h-48
html = html.replace(/class="h-48 bg-gradient/g, 'class="h-32 md:h-48 bg-gradient');
// Replace padding p-6 with p-4 md:p-6
html = html.replace(/<div class="p-6">/g, '<div class="p-4 md:p-6">');
// Replace title size
html = html.replace(/text-2xl font-bold/g, 'text-xl md:text-2xl font-bold');
html = html.replace(/text-slate-400 text-sm/g, 'text-slate-400 text-xs md:text-sm');

fs.writeFileSync(indexPath, html);
