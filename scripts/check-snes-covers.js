const fs = require('fs');
const path = require('path');
const gamesList = JSON.parse(fs.readFileSync(path.join(__dirname, '../snes/data/games.json'), 'utf8'));
const coversDir = path.join(__dirname, '../snes/assets/covers');

let missing = 0;
for (const g of gamesList) {
    const coverPath = path.join(__dirname, '../snes', g.cover);
    if (!fs.existsSync(coverPath)) {
        missing++;
        console.log("Missing:", g.cover);
    }
}
console.log(`Total missing: ${missing} out of ${gamesList.length}`);
