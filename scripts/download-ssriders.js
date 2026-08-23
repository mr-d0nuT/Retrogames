const fs = require('fs');
const https = require('https');
const path = require('path');

const coversDir = path.join(__dirname, '../arcade/assets/covers');
const outputPath = path.join(coversDir, 'ssriders.png');

const urls = [
    "https://raw.githubusercontent.com/libretro-thumbnails/MAME/master/Named_Boxarts/Sunset%20Riders%20(4%20Players%20ver%20EAC).png",
    "https://raw.githubusercontent.com/libretro-thumbnails/MAME/master/Named_Titles/Sunset%20Riders%20(4%20Players%20ver%20EAC).png",
    "https://raw.githubusercontent.com/libretro-thumbnails/MAME/master/Named_Boxarts/Sunset%20Riders.png",
    "https://raw.githubusercontent.com/libretro-thumbnails/MAME/master/Named_Titles/Sunset%20Riders.png",
    "https://raw.githubusercontent.com/libretro-thumbnails/MAME/master/Named_Snaps/Sunset%20Riders.png"
];

async function tryDownload() {
    for (const url of urls) {
        console.log("Trying:", url);
        const success = await new Promise((resolve) => {
            https.get(url, (res) => {
                if (res.statusCode === 200) {
                    const file = fs.createWriteStream(outputPath);
                    res.pipe(file);
                    file.on('finish', () => { file.close(); resolve(true); });
                } else {
                    resolve(false);
                }
            }).on('error', () => resolve(false));
        });
        if (success) {
            console.log("Successfully downloaded!");
            return;
        }
    }
    console.log("Failed to find cover.");
}

tryDownload();
