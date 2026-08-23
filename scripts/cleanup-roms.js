const fs = require('fs');
const path = require('path');

const romsDir = path.join(__dirname, '../snes/roms/');
const files = fs.readdirSync(romsDir).filter(f => f.endsWith('.zip') || f.endsWith('.smc') || f.endsWith('.sfc'));

let deletedCount = 0;
let deletedNames = [];

// 1. Delete unofficial / bad / hack / proto dumps
const badTags = /\[b[0-9]*\]|\[h[0-9]*\]|\[p\]|\[t\]|\(Beta\)|\(Proto\)|\(Sample\)|\(Demo\)|\(Unl\)|\[T\+Eng/i;

let validFiles = [];

files.forEach(file => {
    if (badTags.test(file)) {
        fs.unlinkSync(path.join(romsDir, file));
        deletedNames.push(file);
        deletedCount++;
    } else {
        validFiles.push(file);
    }
});

// 2. Remove duplicates, keep highest revision
// Revisions usually look like "(Rev 1)", "(Rev A)", "(V1.1)", etc.
const groups = {};

validFiles.forEach(file => {
    // Extract base name by removing Rev, V1.x, and standard tags to find duplicates
    // E.g. "Game (USA) (Rev 1).zip" -> "Game (USA)"
    let baseName = file.replace(/\(Rev [A-Z0-9]\)/i, '').replace(/\(V[0-9]\.[0-9]\)/i, '').replace('.zip', '').trim();
    
    if (!groups[baseName]) {
        groups[baseName] = [];
    }
    groups[baseName].push(file);
});

Object.keys(groups).forEach(base => {
    const versions = groups[base];
    if (versions.length > 1) {
        // Sort to get the highest revision last
        versions.sort((a, b) => {
            // A simple string sort usually works since "(Rev 2)" > "(Rev 1)" and "(Rev 1)" > ""
            return a.localeCompare(b);
        });
        
        // Keep the last one, delete the rest
        const keep = versions.pop();
        versions.forEach(delFile => {
            fs.unlinkSync(path.join(romsDir, delFile));
            deletedNames.push(delFile);
            deletedCount++;
        });
    }
});

console.log(`Cleaned up ${deletedCount} files.`);
// console.log("Deleted files:\n" + deletedNames.join("\n"));
