const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../arcade/data/games.json');
let games = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Take the first 50 games (we already curated the best ones at the top, or we can just slice)
games = games.slice(0, 50);

// Update their ROM paths to point to the local folder
games = games.map(g => {
    return {
        ...g,
        rom: `roms/${g.id}.zip`
    };
});

fs.writeFileSync(jsonPath, JSON.stringify(games, null, 2));
console.log(`Reduced to ${games.length} games and updated ROM paths to local.`);
