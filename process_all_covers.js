const fs = require('fs');
const path = require('path');

const coversDir = path.join(__dirname, 'SNES Classic - COMPLETE USA Box Art (722 covers) (Remastered March 2021)');
const targetDir = path.join(__dirname, 'snes/assets/covers');

if (!fs.existsSync(targetDir)){
    fs.mkdirSync(targetDir, { recursive: true });
}

try {
    const downloadedCovers = fs.readdirSync(coversDir);
    let count = 0;

    downloadedCovers.forEach(file => {
        if (!file.endsWith('.png') && !file.endsWith('.jpg')) return;
        
        const ext = path.extname(file);
        const basename = path.basename(file, ext);
        
        const cleanTitle = basename.replace(/\s*\(.*?\)\s*/g, '').trim();
        const id = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        
        if (id) {
            const srcPath = path.join(coversDir, file);
            const destPath = path.join(targetDir, `${id}.png`); // Convert to unified png extension
            
            // Only copy if it doesn't exist to avoid overwriting or just overwrite
            fs.copyFileSync(srcPath, destPath);
            count++;
        }
    });

    console.log(`Successfully processed and moved ${count} covers.`);
} catch(e) {
    console.error("Error:", e);
}
