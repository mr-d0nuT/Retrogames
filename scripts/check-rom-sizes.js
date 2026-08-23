const https = require('https');
const games = require('../arcade/data/games.json');

async function getFileSize(url) {
    return new Promise((resolve) => {
        // We use the direct download URL to check size, not /cors/ because /cors/ might be 500
        const directUrl = url.replace('/cors/', '/download/');
        https.request(directUrl, { method: 'HEAD' }, (res) => {
            if (res.statusCode === 302) {
                https.request(res.headers.location, { method: 'HEAD' }, (res2) => {
                    resolve(parseInt(res2.headers['content-length'] || 0));
                }).end();
            } else {
                resolve(parseInt(res.headers['content-length'] || 0));
            }
        }).on('error', () => resolve(0)).end();
    });
}

async function main() {
    let totalSize = 0;
    console.log("Checking sizes for 10 games as a sample...");
    for (let i = 0; i < 10; i++) {
        const size = await getFileSize(games[i].rom);
        console.log(`${games[i].id}: ${(size / 1024 / 1024).toFixed(2)} MB`);
        totalSize += size;
    }
    console.log(`Estimated total for 100 games: ${(totalSize * 10 / 1024 / 1024).toFixed(2)} MB`);
}
main();
