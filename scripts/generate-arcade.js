const fs = require('fs');
const https = require('https');
const path = require('path');

const arcadeGamesDict = {
  "mslug": "Metal Slug",
  "mslug2": "Metal Slug 2",
  "mslugx": "Metal Slug X",
  "sf2": "Street Fighter II: The World Warrior",
  "sf2ce": "Street Fighter II' - Champion Edition",
  "ssf2t": "Super Street Fighter II Turbo",
  "xmcota": "X-Men: Children of the Atom",
  "msh": "Marvel Super Heroes",
  "xmvsf": "X-Men vs. Street Fighter",
  "marvelvs": "Marvel vs. Capcom: Clash of Super Heroes",
  "kof97": "The King of Fighters '97",
  "kof98": "The King of Fighters '98",
  "kof99": "The King of Fighters '99",
  "fatfury2": "Fatal Fury 2",
  "samsho": "Samurai Shodown",
  "samsho2": "Samurai Shodown II",
  "samsho3": "Samurai Shodown III",
  "samsho4": "Samurai Shodown IV",
  "garou": "Garou: Mark of the Wolves",
  "mk": "Mortal Kombat",
  "mk2": "Mortal Kombat II",
  "umk3": "Ultimate Mortal Kombat 3",
  "avsp": "Alien vs. Predator",
  "dino": "Cadillacs and Dinosaurs",
  "punisher": "The Punisher",
  "ffight": "Final Fight",
  "captcomm": "Captain Commando",
  "knights": "Knights of the Round",
  "kod": "The King of Dragons",
  "wof": "Warriors of Fate",
  "tmnt": "Teenage Mutant Ninja Turtles",
  "tmnt2": "Teenage Mutant Ninja Turtles - Turtles in Time",
  "simpsons": "The Simpsons",
  "xmen": "X-Men",
  "mystwarr": "Mystic Warriors",
  "vendetta": "Vendetta",
  "ddragon": "Double Dragon",
  "ddragon2": "Double Dragon II",
  "goldenax": "Golden Axe",
  "altbeast": "Altered Beast",
  "astorm": "Alien Storm",
  "ssriders": "Sunset Riders",
  "toki": "Toki",
  "rastan": "Rastan",
  "ghouls": "Ghouls'n Ghosts",
  "mwalk": "Moonwalker",
  "snowbros": "Snow Bros.",
  "tumblep": "Tumble Pop",
  "pang": "Pang",
  "spang": "Super Pang"
};

const romsDir = path.join(__dirname, '../arcade/roms');
if (!fs.existsSync(romsDir)) fs.mkdirSync(romsDir, { recursive: true });

const files = fs.readdirSync(romsDir).filter(f => f.endsWith('.zip'));
const gamesList = [];

files.forEach(file => {
    const id = file.replace('.zip', '');
    if (arcadeGamesDict[id]) {
        gamesList.push({
            id: id,
            title: arcadeGamesDict[id],
            rom: `roms/${file}`,
            cover: `assets/covers/${id}.png`
        });
    }
});

fs.writeFileSync(path.join(__dirname, '../arcade/data/games.json'), JSON.stringify(gamesList, null, 2));
console.log(`Generated arcade games.json with ${gamesList.length} local games`);
