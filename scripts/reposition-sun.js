const fs = require('fs');
const path = require('path');
const indexPath = path.join(__dirname, '../index.html');

let html = fs.readFileSync(indexPath, 'utf8');

// 1. Move the sun HTML
const sunHtml = `        <div class="synthwave-sun">\n            <div class="sun-stripes"></div>\n        </div>\n`;
html = html.replace(sunHtml, '');

const insertTarget = '</div>\n        <p class="neon-subtitle';
html = html.replace(insertTarget, '</div>\n' + sunHtml + '        <p class="neon-subtitle');

// 2. Modify the CSS
const oldCssRegex = /\.synthwave-sun\s*\{[^}]+\}/;
const newCss = `.synthwave-sun {
            position: relative;
            width: 200px;
            height: 200px;
            background: linear-gradient(to bottom, #ffea00 0%, #ff00ff 100%);
            border-radius: 50%;
            box-shadow: 0 0 50px #ff00ff;
            z-index: 0;
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            margin: 20px auto;
        }`;

html = html.replace(oldCssRegex, newCss);

fs.writeFileSync(indexPath, html);
