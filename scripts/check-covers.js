const fs = require('fs');
const games = require('../snes/data/games.json');

let missing = 0;
games.forEach(g => {
    const coverPath = __dirname + '/../snes/' + g.cover;
    if (!fs.existsSync(coverPath)) {
        console.log("Missing cover for:", g.title);
        missing++;
    }
});
console.log(`Total missing: ${missing}`);
