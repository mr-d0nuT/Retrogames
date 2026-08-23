const fs = require('fs');
const path = require('path');

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function processPlatform(platform) {
    const rawDir = path.join(__dirname, `../${platform}/assets/raw_covers/`);
    const finalDir = path.join(__dirname, `../${platform}/assets/covers/`);
    
    if (!fs.existsSync(rawDir)) return;
    if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });

    const files = fs.readdirSync(rawDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

    let processed = 0;
    files.forEach(file => {
        const ext = path.extname(file);
        const basename = path.basename(file, ext);
        // Strip out common tags from the raw image name if any
        const cleanName = basename.replace(/\(USA\)|\(Europe\)|\(Japan\)|\(Rev [0-9A-Z]\)/gi, '').trim();
        const id = slugify(cleanName);
        
        const sourcePath = path.join(rawDir, file);
        const destPath = path.join(finalDir, `${id}.png`); // standardize to .png for the catalog
        
        fs.renameSync(sourcePath, destPath);
        processed++;
    });

    if (processed > 0) {
        console.log(`Processed ${processed} raw covers for ${platform}.`);
    }
}

['snes', 'arcade'].forEach(processPlatform);
