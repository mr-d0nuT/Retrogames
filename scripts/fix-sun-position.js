const fs = require('fs');
const path = require('path');
const indexPath = path.join(__dirname, '../index.html');

let html = fs.readFileSync(indexPath, 'utf8');

// 1. Remove sun from old location
html = html.replace(/\s*<div class="synthwave-sun">[\s\S]*?<\/div>\s*<\/div>/, '');

// 2. Insert sun inside header
const headerStart = '<header class="w-full py-12 text-center relative z-10 flex flex-col items-center mt-20">';
const newHeader = headerStart + `
        <div class="synthwave-sun">
            <div class="sun-stripes"></div>
        </div>`;
html = html.replace(headerStart, newHeader);

// 3. Make sure text elements inside header have relative positioning so they appear above the absolute sun
html = html.replace('<div class="flex flex-row items-center justify-center gap-6">', '<div class="flex flex-row items-center justify-center gap-6 relative z-10">');
html = html.replace('<p class="neon-subtitle">The Ultimate Arcade Portal</p>', '<p class="neon-subtitle relative z-10 mt-4">The Ultimate Arcade Portal</p>');

// 4. Update CSS for .synthwave-sun
const oldCss = `.synthwave-sun {
            position: fixed;
            top: 15%;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            height: 300px;`;

const newCss = `.synthwave-sun {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            height: 400px;`;
html = html.replace(oldCss, newCss);

// 5. Update z-index of synthwave-sun
html = html.replace('z-index: -2;', 'z-index: 0;');

fs.writeFileSync(indexPath, html);
