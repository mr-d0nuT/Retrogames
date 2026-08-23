const fs = require('fs');
const path = require('path');

const platform = process.argv[2] || 'snes';

const romsDir = path.join(__dirname, `../${platform}/roms/`);
const coversDir = path.join(__dirname, `../${platform}/assets/covers/`);
const dataDir = path.join(__dirname, `../${platform}/data/`);
const outputFile = path.join(dataDir, 'games.json');

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Check if roms directory exists
if (!fs.existsSync(romsDir)) {
    console.log(`No roms directory found for ${platform}`);
    fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
    process.exit(0);
}

const romFiles = fs.readdirSync(romsDir).filter(file => file.endsWith('.zip') || file.endsWith('.smc') || file.endsWith('.sfc'));

const gamesList = romFiles.map(file => {
    // Basic title parsing (remove extension and common tags like (USA))
    const rawTitle = file.replace(/\.zip|\.smc|\.sfc/g, '');
    const cleanTitle = rawTitle.replace(/\(USA\)|\(Europe\)|\(Japan\)|\(Rev [0-9A-Z]\)/gi, '').trim();
    const id = slugify(cleanTitle);

    return {
        id: id,
        title: cleanTitle,
        rom: `roms/${file}`,
        cover: `assets/covers/${id}.png` // Default expected path
    };
});

fs.writeFileSync(outputFile, JSON.stringify(gamesList, null, 2));
console.log(`Successfully generated games.json for ${platform} with ${gamesList.length} games.`);
