const fs = require('fs');
const https = require('https');
const path = require('path');

const platform = 'arcade';
const gamesJsonPath = path.join(__dirname, `../${platform}/data/games.json`);
const coversDir = path.join(__dirname, `../${platform}/assets/covers/`);
const boxartsListPath = '/tmp/mame_boxarts.txt';
const titlesListPath = '/tmp/mame_titles.txt';

if (!fs.existsSync(gamesJsonPath)) process.exit(1);

const games = JSON.parse(fs.readFileSync(gamesJsonPath, 'utf8'));
const boxarts = fs.readFileSync(boxartsListPath, 'utf8').split('\n').filter(l => l.trim() !== '');
const titles = fs.readFileSync(titlesListPath, 'utf8').split('\n').filter(l => l.trim() !== '');

function normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function processList(list, type) {
    return list.map(filename => {
        let clean = filename.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/\.png$/i, '').trim();
        return {
            normalized: normalize(clean),
            original: filename,
            type: type
        };
    });
}

const allImages = [...processList(boxarts, 'Named_Boxarts'), ...processList(titles, 'Named_Titles')];

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
        
        let match = allImages.find(b => b.normalized === normTitle);
        
        if (!match) {
            match = allImages.find(b => b.normalized.includes(normTitle) || normTitle.includes(b.normalized));
        }

        if (match) {
            const encodedName = encodeURIComponent(match.original).replace(/'/g, '%27');
            const url = `https://raw.githubusercontent.com/libretro-thumbnails/MAME/master/${match.type}/${encodedName}`;
            const outputPath = path.join(__dirname, '../', platform, game.cover);
            
            console.log(`Matched: "${game.title}" -> "${match.original}" (${match.type})`);
            if (await downloadCover(url, outputPath)) {
                success++;
            } else {
                console.log(`  Failed to download: ${url}`);
            }
        } else {
            console.log(`[UNMATCHED] No fuzzy match for: ${game.title}`);
        }
    }
    console.log(`\nFinished! Successfully downloaded ${success} new arcade covers.`);
}

main();
