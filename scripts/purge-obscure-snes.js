const fs = require('fs');
const path = require('path');

const gamesPath = path.join(__dirname, '../snes/data/games.json');
const gamesList = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));

const validGames = [];
let deleted = 0;

for (const g of gamesList) {
    const coverPath = path.join(__dirname, '../snes', g.cover);
    if (!fs.existsSync(coverPath)) {
        const romPath = path.join(__dirname, '../snes', g.rom);
        if (fs.existsSync(romPath)) {
            fs.unlinkSync(romPath);
            console.log("Deleted ROM:", g.rom);
            deleted++;
        }
    } else {
        validGames.push(g);
    }
}

fs.writeFileSync(gamesPath, JSON.stringify(validGames, null, 2));
console.log(`Deleted ${deleted} obscure ROMs. Updated games.json to contain ${validGames.length} valid games.`);
