const mongoose = require('mongoose');
const Game = require('./models/Game');
const fs = require('fs').promises;
const path = require('path');

// Sample admin ID (you should replace with actual admin ID from your database)
const ADMIN_ID = '507f1f77bcf86cd799439011'; // Sample ObjectId

const sampleGames = [
    {
        filename: '3-china-pots.jpg',
        winAmount: '$12,450',
        winPlayer: 'Lucky***Dragon',
        winComment: 'Three pots opened and boom! Massive win streak!'
    },
    {
        filename: '5-fortune-dragon.jpg', 
        winAmount: '$18,750',
        winPlayer: 'Fortune***King',
        winComment: 'Dragon blessed me with incredible fortune today!'
    },
    {
        filename: '777-coins.jpg',
        winAmount: '$25,680',
        winPlayer: 'Triple***Seven',
        winComment: 'Hit the jackpot! 777 never felt so good!'
    },
    {
        filename: 'african-wildlife.jpg',
        winAmount: '$8,920',
        winPlayer: 'Safari***Hunter', 
        winComment: 'Wild animals brought wild wins!'
    },
    {
        filename: 'alien-smash.jpg',
        winAmount: '$15,300',
        winPlayer: 'Space***Warrior',
        winComment: 'Out of this world winnings! Aliens delivered!'
    },
    {
        filename: 'asgardian-rising.jpg',
        winAmount: '$22,150',
        winPlayer: 'Thor***Mighty',
        winComment: 'By the power of Asgard! Epic bonus round!'
    },
    {
        filename: 'banana-saga.jpg',
        winAmount: '$6,780',
        winPlayer: 'Monkey***King',
        winComment: 'Going bananas with these amazing wins!'
    },
    {
        filename: 'big-fishing.jpg',
        winAmount: '$14,200',
        winPlayer: 'Captain***Fish',
        winComment: 'Caught the biggest fish and biggest win!'
    }
];

async function seedGames() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/lucky-taj-admin');
        console.log('Connected to MongoDB');

        // Check if images exist
        const imagesPath = path.join(__dirname, 'images');
        const imageFiles = await fs.readdir(imagesPath);
        console.log(`Found ${imageFiles.length} images in folder`);

        // Clear existing games (optional)
        const existingCount = await Game.countDocuments();
        console.log(`Current games in database: ${existingCount}`);

        // Add sample games
        for (const gameData of sampleGames) {
            // Check if image file exists
            if (!imageFiles.includes(gameData.filename)) {
                console.log(`Skipping ${gameData.filename} - file not found`);
                continue;
            }

            // Convert filename to title
            const title = gameData.filename
                .replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());

            // Check if game already exists
            const existingGame = await Game.findOne({ image: gameData.filename });
            if (existingGame) {
                console.log(`Game with image ${gameData.filename} already exists`);
                continue;
            }

            const game = new Game({
                title,
                image: gameData.filename,
                recentWin: {
                    amount: gameData.winAmount,
                    player: gameData.winPlayer,
                    comment: gameData.winComment
                },
                createdBy: ADMIN_ID
            });

            await game.save();
            console.log(`✅ Added game: ${title}`);
        }

        console.log('\n🎮 Games seeding completed!');
        
        // Show final count
        const finalCount = await Game.countDocuments();
        console.log(`Total games in database: ${finalCount}`);

    } catch (error) {
        console.error('Error seeding games:', error);
    } finally {
        mongoose.disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    seedGames();
}

module.exports = { seedGames };