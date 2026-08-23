const fs = require('fs');
const path = require('path');

const romsDir = path.join(__dirname, '../snes/roms');
const outputFile = path.join(__dirname, '../snes/data/games.json');

try {
    const files = fs.readdirSync(romsDir);
    const games = [];

    files.forEach(file => {
        if (file.endsWith('.zip') || file.endsWith('.smc') || file.endsWith('.sfc')) {
            const ext = path.extname(file);
            const basename = path.basename(file, ext);
            
            // Clean up the title by removing tags like (USA), (En,Fr,De), etc.
            const cleanTitle = basename.replace(/\s*\(.*?\)\s*/g, '').trim();
            
            // Generate a URL-friendly ID
            const id = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            
            games.push({
                id: id,
                title: cleanTitle,
                rom: `roms/${file}`,
                cover: `assets/covers/${id}.png`
            });
        }
    });

    // Sort alphabetically by title
    games.sort((a, b) => a.title.localeCompare(b.title));

    fs.writeFileSync(outputFile, JSON.stringify(games, null, 2));
    console.log(`Successfully generated games.json with ${games.length} games.`);
} catch (error) {
    console.error("Error processing games:", error);
}
