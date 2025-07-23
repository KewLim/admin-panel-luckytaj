const mongoose = require('mongoose');
const Game = require('./models/Game');

const ADMIN_ID = '507f1f77bcf86cd799439011';

const additionalGames = [
    {
        filename: '3-coin-volcanoes.jpg',
        winAmount: '$19,840',
        winPlayer: 'Volcano***Master',
        winComment: 'Three volcanoes erupted with coins! Incredible heat!'
    },
    {
        filename: '3-pots-of-egypt.jpg',
        winAmount: '$16,720',
        winPlayer: 'Pharaoh***Gold',
        winComment: 'Ancient Egyptian magic brought modern riches!'
    },
    {
        filename: 'coin-up-lightning.jpg',
        winAmount: '$13,580',
        winPlayer: 'Lightning***Strike',
        winComment: 'Lightning fast wins! Coins raining from the sky!'
    },
    {
        filename: 'dragon-soar-hyper-wild.jpg',
        winAmount: '$28,950',
        winPlayer: 'Dragon***Rider',
        winComment: 'Hyper wild dragon took me to the moon!'
    },
    {
        filename: 'wild-bandito.jpg',
        winAmount: '$11,460',
        winPlayer: 'Bandito***Chief',
        winComment: 'Wild west adventure with wild winnings!'
    },
    {
        filename: 'wild-bounty-showdown.jpg',
        winAmount: '$21,380',
        winPlayer: 'Bounty***Hunter',
        winComment: 'Showdown delivered the ultimate bounty!'
    },
    {
        filename: 'gates-of-olympus.jpg',
        winAmount: '$35,200',
        winPlayer: 'Zeus***Thunder',
        winComment: 'Gods opened the gates to divine riches!'
    },
    {
        filename: 'sweet-bonanza.jpg',
        winAmount: '$9,750',
        winPlayer: 'Candy***Crusher',
        winComment: 'Sweet victory tastes like big money!'
    },
    {
        filename: 'sugar-rush.jpg',
        winAmount: '$17,630',
        winPlayer: 'Sugar***Rush',
        winComment: 'Sugar rush led to a cash rush!'
    },
    {
        filename: 'big-bass-bonanza.jpg',
        winAmount: '$24,890',
        winPlayer: 'Bass***Master',
        winComment: 'Caught the biggest bass and biggest bonus!'
    }
];

async function addMoreGames() {
    try {
        await mongoose.connect('mongodb://localhost:27017/lucky-taj-admin');
        console.log('Connected to MongoDB');

        for (const gameData of additionalGames) {
            const title = gameData.filename
                .replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());

            const existingGame = await Game.findOne({ image: gameData.filename });
            if (existingGame) {
                console.log(`Game ${title} already exists`);
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

            try {
                await game.save();
                console.log(`✅ Added game: ${title}`);
            } catch (error) {
                console.log(`❌ Failed to add ${title}: ${error.message}`);
            }
        }

        const finalCount = await Game.countDocuments();
        console.log(`\n🎮 Total games in database: ${finalCount}`);

    } catch (error) {
        console.error('Error adding games:', error);
    } finally {
        mongoose.disconnect();
    }
}

addMoreGames();