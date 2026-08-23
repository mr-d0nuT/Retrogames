const fs = require('fs');
const https = require('https');
const path = require('path');

const gamesFile = path.join(__dirname, '../snes/data/games.json');
const games = JSON.parse(fs.readFileSync(gamesFile, 'utf8'));

let missingGames = games.filter(g => !fs.existsSync(path.join(__dirname, '../snes', g.cover)));
console.log(`Found ${missingGames.length} missing covers. Beginning download...`);

async function downloadCover(game) {
    let romName = path.basename(game.rom, '.zip');
    
    // Libretro naming standard fixes (some characters are replaced in libretro)
    romName = romName.replace(/&/g, '_'); // Ampersand is usually underscore in libretro
    
    const encodedName = encodeURIComponent(romName).replace(/'/g, '%27');
    const url = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/${encodedName}.png`;
    
    const outputPath = path.join(__dirname, '../snes', game.cover);
    
    return new Promise((resolve) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(outputPath);
                res.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
            } else {
                resolve(false);
            }
        }).on('error', () => resolve(false));
    });
}

async function main() {
    let successCount = 0;
    for (const game of missingGames) {
        const success = await downloadCover(game);
        if (success) {
            successCount++;
            console.log(`[SUCCESS] Downloaded: ${game.title}`);
        } else {
            console.log(`[FAILED] Not found: ${game.title}`);
        }
    }
    console.log(`\nFinished! Downloaded ${successCount} missing covers.`);
}
main();
