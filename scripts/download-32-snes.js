const fs = require('fs');
const https = require('https');
const path = require('path');
const gamesList = JSON.parse(fs.readFileSync(path.join(__dirname, '../snes/data/games.json'), 'utf8'));
const coversDir = path.join(__dirname, '../snes/assets/covers');

async function downloadCover(g, searchTitle) {
    const outputPath = path.join(coversDir, `${g.id}.png`);
    const encodedName = encodeURIComponent(searchTitle).replace(/'/g, '%27');
    const url = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/${encodedName}.png`;
    
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

async function tryNames(g) {
    let base = g.title;
    // Strip language tags if any were part of the title
    base = base.replace(/ \(.*?\)/g, "").trim();
    
    const candidates = [
        `${base} (USA)`,
        `${base} (USA) (En,Fr)`,
        `${base} (USA) (En,Fr,De)`,
        `${base} (USA) (En,Fr,De,Es)`,
        `${base} (USA) (En,Fr,De,Es,It)`,
        `${base} (USA) (En,Ja)`,
        `${base} (USA) (Es)`,
        `${base} (World)`,
        base
    ];
    
    for (const c of candidates) {
        if (await downloadCover(g, c)) {
            console.log(`[OK] Found cover for ${g.id} -> ${c}`);
            return true;
        }
    }
    console.log(`[FAIL] No cover for ${g.id}`);
    return false;
}

async function main() {
    let success = 0;
    for (const g of gamesList) {
        const coverPath = path.join(__dirname, '../snes', g.cover);
        if (!fs.existsSync(coverPath)) {
            if (await tryNames(g)) {
                success++;
            }
        }
    }
    console.log(`Downloaded ${success} new covers.`);
}

main();
