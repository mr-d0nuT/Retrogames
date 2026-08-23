const fs = require('fs');
const https = require('https');
const path = require('path');

const platform = 'snes';
const gamesJsonPath = path.join(__dirname, `../${platform}/data/games.json`);
const coversDir = path.join(__dirname, `../${platform}/assets/covers/`);
const boxartsListPath = '/tmp/snes_boxarts.txt';

if (!fs.existsSync(gamesJsonPath)) process.exit(1);

const games = JSON.parse(fs.readFileSync(gamesJsonPath, 'utf8'));
const boxarts = fs.readFileSync(boxartsListPath, 'utf8').split('\n').filter(l => l.trim() !== '');

function normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Map normalized names to actual file names in repo
const normalizedBoxarts = boxarts.map(filename => {
    // filename is like "Super Mario World 2 - Yoshi's Island (USA).png"
    // We strip (USA), etc. and normalize
    let clean = filename.replace(/\(USA\)|\(Europe\)|\(Japan\)/gi, '').replace(/\.png$/i, '');
    return {
        normalized: normalize(clean),
        original: filename
    };
});

let missingCovers = [];
games.forEach(game => {
    const coverPath = path.join(__dirname, '../', platform, game.cover);
    if (!fs.existsSync(coverPath)) {
        missingCovers.push(game);
    }
});

console.log(`Found ${missingCovers.length} games missing covers.`);

async function downloadCover(url, outputPath) {
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
    let success = 0;
    for (let game of missingCovers) {
        const normTitle = normalize(game.title);
        
        // Find best match: exact match on normalized title
        let match = normalizedBoxarts.find(b => b.normalized === normTitle);
        
        // If not exact, find one that contains it or is contained by it
        if (!match) {
            match = normalizedBoxarts.find(b => b.normalized.includes(normTitle) || normTitle.includes(b.normalized));
        }

        if (match) {
            const encodedName = encodeURIComponent(match.original).replace(/'/g, '%27');
            const url = `https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/${encodedName}`;
            const outputPath = path.join(__dirname, '../', platform, game.cover);
            
            console.log(`Matched: "${game.title}" -> "${match.original}"`);
            if (await downloadCover(url, outputPath)) {
                success++;
            } else {
                console.log(`  Failed to download: ${url}`);
            }
        } else {
            console.log(`[UNMATCHED] No fuzzy match for: ${game.title}`);
        }
    }
    console.log(`\nFinished! Successfully downloaded ${success} new covers.`);
}

main();
