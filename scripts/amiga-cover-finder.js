const fs = require('fs');
const path = require('path');
const https = require('https');

const romsDir = path.join(__dirname, '../amiga/roms');
const coversDir = path.join(__dirname, '../amiga/assets/covers');
const jsonPath = path.join(__dirname, '../amiga/data/games.json');

const LIBRETRO_BASE_URL = 'https://thumbnails.libretro.com/Commodore%20-%20Amiga/Named_Boxarts/';

function fetchIndex() {
    return new Promise((resolve, reject) => {
        https.get(LIBRETRO_BASE_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const files = [];
                const regex = /href="([^"]+\.png)"/g;
                let match;
                while ((match = regex.exec(data)) !== null) {
                    files.push(decodeURIComponent(match[1]));
                }
                resolve(files);
            });
        }).on('error', reject);
    });
}

function normalizeTitle(title) {
    return title.toLowerCase().replace(/\.png$/g, "").replace(/, the/g, "").replace(/^the /g, "")
        .replace(/\.zip$|\.adf$/, '')
        .replace(/\s*\(.*?\)\s*/g, '')
        .replace(/\s*\[.*?\]\s*/g, '')
        .replace(/[^a-z0-9]/g, '');
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(dest, () => reject(new Error(`Failed to download ${url}: ${response.statusCode}`)));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function run() {
    console.log("Fetching Libretro Amiga index...");
    let availableCovers = [];
    try {
        availableCovers = await fetchIndex();
        console.log(`Found ${availableCovers.length} covers on Libretro.`);
    } catch(e) {
        console.error("Failed to fetch index:", e.message);
        return;
    }

    const romFiles = fs.readdirSync(romsDir).filter(f => f.endsWith('.zip') || f.endsWith('.adf'));
    const games = [];

    for (const rom of romFiles) {
        const cleanName = rom.replace(/\.zip$|\.adf$/, '');
        const normRom = normalizeTitle(cleanName);
        let bestMatch = null;

        // Try exact match without tags first
        let matches = availableCovers.filter(c => normalizeTitle(c) === normRom);
        
        if (matches.length > 0) {
            // Prefer (Europe) or (USA) if multiple
            bestMatch = matches.find(c => c.includes('(Europe)')) || matches.find(c => c.includes('(USA)')) || matches[0];
        }

        const coverFilename = cleanName + '.png';
        const localCoverPath = path.join(coversDir, coverFilename);

        if (bestMatch && !fs.existsSync(localCoverPath)) {
            const url = LIBRETRO_BASE_URL + encodeURIComponent(bestMatch);
            console.log(`Downloading ${bestMatch} for ${rom}...`);
            try {
                await downloadImage(url, localCoverPath);
            } catch(e) {
                console.log(`Failed to download ${bestMatch}: ${e.message}`);
            }
        }

        games.push({
            title: cleanName,
            rom: 'roms/' + rom,
            cover: fs.existsSync(localCoverPath) ? 'assets/covers/' + coverFilename : 'assets/amiga-logo.png'
        });
    }

    fs.writeFileSync(jsonPath, JSON.stringify(games, null, 2));
    console.log(`Finished! Generated games.json with ${games.length} games.`);
}

run();
