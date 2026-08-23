const fs = require('fs');
const path = require('path');

const romsDir = path.join(__dirname, '../arcade/roms');
const coversDir = path.join(__dirname, '../arcade/assets/covers');
const outputJson = path.join(__dirname, '../arcade/data/games.json');

// MAME shortname to Full Name mapping
const friendlyNames = {
    'altbeast': 'Altered Beast',
    'astorm': 'Alien Storm',
    'avsp': 'Alien vs. Predator',
    'captcomm': 'Captain Commando',
    'ddragon': 'Double Dragon',
    'ddragon2': 'Double Dragon II: The Revenge',
    'dino': 'Cadillacs and Dinosaurs',
    'fatfury2': 'Fatal Fury 2',
    'ffight': 'Final Fight',
    'garou': 'Garou: Mark of the Wolves',
    'ghouls': "Ghouls 'n Ghosts",
    'knights': 'Knights of the Round',
    'kod': 'The King of Dragons',
    'kof97': "The King of Fighters '97",
    'kof98': "The King of Fighters '98",
    'kof99': "The King of Fighters '99",
    'mk': 'Mortal Kombat',
    'msh': 'Marvel Super Heroes',
    'mslug': 'Metal Slug',
    'mslug2': 'Metal Slug 2',
    'mslugx': 'Metal Slug X',
    'mystwarr': 'Mystic Warriors',
    'pang': 'Pang',
    'punisher': 'The Punisher',
    'rastan': 'Rastan',
    'samsho': 'Samurai Shodown',
    'samsho2': 'Samurai Shodown II',
    'samsho3': 'Samurai Shodown III',
    'samsho4': 'Samurai Shodown IV',
    'sf2': 'Street Fighter II',
    'sf2ce': "Street Fighter II': Champion Edition",
    'snowbros': 'Snow Bros.',
    'spang': 'Super Pang',
    'ssf2t': 'Super Street Fighter II Turbo',
    'ssriders': 'Sunset Riders',
    'tmnt': 'Teenage Mutant Ninja Turtles',
    'tmnt2': 'Teenage Mutant Ninja Turtles: Turtles in Time',
    'toki': 'Toki',
    'tumblep': 'Tumblepop',
    'umk3': 'Ultimate Mortal Kombat 3',
    'vendetta': 'Vendetta',
    'wof': 'Warriors of Fate',
    'xmcota': 'X-Men: Children of the Atom',
    'xmen': 'X-Men',
    'xmvsf': 'X-Men vs. Street Fighter'
};

const games = [];

if (fs.existsSync(romsDir)) {
    const files = fs.readdirSync(romsDir);
    for (const file of files) {
        if (file.endsWith('.zip')) {
            const basename = file.replace('.zip', '');
            
            // Look for a matching cover image (png or jpg)
            let coverFile = 'arcade-machine.jpg'; // default
            if (fs.existsSync(path.join(coversDir, basename + '.png'))) {
                coverFile = 'covers/' + basename + '.png';
            } else if (fs.existsSync(path.join(coversDir, basename + '.jpg'))) {
                coverFile = 'covers/' + basename + '.jpg';
            }
            
            // Format title
            let title = friendlyNames[basename] || basename;
            
            games.push({
                title: title,
                rom: 'roms/' + file,
                cover: 'assets/' + coverFile
            });
        }
    }
}

fs.writeFileSync(outputJson, JSON.stringify(games, null, 2));
console.log(`Successfully generated arcade catalog with ${games.length} games.`);
