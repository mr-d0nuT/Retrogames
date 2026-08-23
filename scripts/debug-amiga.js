const fs = require('fs');

function normalizeTitle(title) {
    return title.toLowerCase()
        .replace(/\.zip$|\.adf$|\.png$/g, '')
        .replace(/\s*\(.*?\)\s*/g, '')
        .replace(/\s*\[.*?\]\s*/g, '')
        .replace(/[^a-z0-9]/g, '');
}

console.log(normalizeTitle("Addams Family, The (Europe).png"));
console.log(normalizeTitle("Addams Family.zip"));
