const fs = require('fs');
const games = require('../arcade/data/games.json');

let missing = 0;
games.forEach(g => {
    const coverPath = __dirname + '/../arcade/' + g.cover;
    if (!fs.existsSync(coverPath)) {
        console.log("Missing cover for:", g.title);
        missing++;
    }
});
console.log(`Total missing: ${missing}`);
