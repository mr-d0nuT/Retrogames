const fs = require('fs');
const path = require('path');
const cssPath = path.join(__dirname, '../emulatorjs/data/emulator.css');

let css = fs.readFileSync(cssPath, 'utf8');

const oldCss = `.ejs_virtualGamepad_bottom {
    position: absolute;
    bottom: 10px;
    height: 30px;
    width: 124px;
    left: 50%;
    margin-left: -62px;
}`;

const newCss = `.ejs_virtualGamepad_bottom {
    position: absolute;
    bottom: 190px;
    height: 30px;
    width: 124px;
    left: 10px;
    margin-left: 0;
}`;

css = css.replace(oldCss, newCss);

fs.writeFileSync(cssPath, css);
