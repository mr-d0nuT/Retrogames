const fs = require('fs');
const path = require('path');

const platform = 'snes';
const romsDir = path.join(__dirname, `../${platform}/roms/`);
const files = fs.readdirSync(romsDir).filter(f => f.endsWith('.zip') || f.endsWith('.smc') || f.endsWith('.sfc'));

const groups = {};

files.forEach(file => {
    // Strip everything inside () and []
    let baseName = file.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/\.zip|\.smc|\.sfc/g, '').trim();
    if (!groups[baseName]) groups[baseName] = [];
    groups[baseName].push(file);
});

let deletedCount = 0;

function scoreFile(file) {
    let score = 50; // base score
    if (file.includes('Rev 2')) score += 12;
    if (file.includes('Rev 1')) score += 11;
    if (file.includes('Rev ')) score += 10;
    
    // Multi-language is usually good
    if (file.includes('En,Fr')) score += 5;
    
    // Bad stuff
    if (file.includes('Arcade')) score -= 20;
    if (file.includes('Proto')) score -= 20;
    if (file.includes('Alt ')) score -= 20;
    if (file.includes('Beta')) score -= 20;
    
    return score;
}

Object.keys(groups).forEach(base => {
    const versions = groups[base];
    if (versions.length > 1) {
        // Sort by score ascending
        versions.sort((a, b) => scoreFile(a) - scoreFile(b));
        
        // Keep the one with highest score
        const keep = versions.pop();
        
        // Delete the rest
        versions.forEach(delFile => {
            console.log(`Deleting duplicate: ${delFile} (Kept: ${keep})`);
            fs.unlinkSync(path.join(romsDir, delFile));
            deletedCount++;
        });
    }
});

console.log(`\nDeleted ${deletedCount} duplicate ROMs.`);
