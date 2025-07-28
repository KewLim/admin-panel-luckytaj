const fs = require('fs');
const path = require('path');

// Read the games-data.json file
const jsonPath = path.join(__dirname, 'games-data.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Fix image paths to be absolute
if (data.gamesPool) {
    data.gamesPool.forEach(game => {
        if (game.image && game.image.startsWith('images/')) {
            game.image = '/' + game.image;
        }
    });
}

// Write back to file
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Fixed image paths in games-data.json');
console.log(`   Updated ${data.gamesPool.length} games to use absolute paths`);