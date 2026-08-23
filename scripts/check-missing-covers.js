const fs = require('fs');
const path = require('path');
const gamesList = JSON.parse(fs.readFileSync(path.join(__dirname, '../arcade/data/games.json'), 'utf8'));
const coversDir = path.join(__dirname, '../arcade/assets/covers');

const missing = [];
for (const g of gamesList) {
    if (!fs.existsSync(path.join(coversDir, `${g.id}.png`))) {
        missing.push(g.id);
    }
}
console.log("Missing covers:", missing);
