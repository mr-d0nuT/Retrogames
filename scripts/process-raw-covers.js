const fs = require('fs');
const path = require('path');

const rawDir = path.join(__dirname, '../snes/assets/raw_covers');
const targetDir = path.join(__dirname, '../snes/assets/covers');

if (!fs.existsSync(rawDir)) {
    console.log("No raw_covers directory found. Skipping cover processing.");
    process.exit(0);
}
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

let count = 0;
const rawFiles = fs.readdirSync(rawDir);

rawFiles.forEach(file => {
    if (file.endsWith('.png') || file.endsWith('.jpg')) {
        const ext = path.extname(file);
        const basename = path.basename(file, ext);
        
        // Clean title logic
        const cleanTitle = basename.replace(/\s*\(.*?\)\s*/g, '').trim();
        const id = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        
        if (id) {
            const srcPath = path.join(rawDir, file);
            const destPath = path.join(targetDir, `${id}${ext}`); // Keep original extension but use ID
            
            // Move file
            fs.renameSync(srcPath, destPath);
            count++;
        }
    }
});

console.log(`Processed and moved ${count} covers from raw_covers to covers.`);
