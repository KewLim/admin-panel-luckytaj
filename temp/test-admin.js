const mongoose = require('mongoose');
const Game = require('./models/Game');

async function testDatabase() {
    try {
        await mongoose.connect('mongodb://localhost:27017/lucky-taj-admin');
        console.log('✅ Connected to MongoDB');

        const games = await Game.find().limit(5);
        console.log(`✅ Found ${games.length} games in database`);
        
        games.forEach((game, index) => {
            console.log(`${index + 1}. ${game.title} - ${game.recentWin.amount} (Active: ${game.active})`);
        });
        
        const activeGames = await Game.find({ active: true });
        console.log(`✅ ${activeGames.length} games are currently active`);
        
        if (activeGames.length === 0) {
            console.log('⚠️ No active games! This is why frontend shows no games.');
            console.log('Let me activate the first 3 games...');
            
            const gamesToActivate = games.slice(0, 3);
            for (const game of gamesToActivate) {
                game.active = true;
                await game.save();
                console.log(`✅ Activated: ${game.title}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Database error:', error);
    } finally {
        mongoose.disconnect();
    }
}

testDatabase();