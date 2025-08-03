const mongoose = require('mongoose');
require('dotenv').config();

const Winner = require('./models/Winner');
const Admin = require('./models/Admin');

async function testAddWinner() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('Connected to MongoDB');

        const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
        if (!admin) {
            console.error('Admin not found');
            process.exit(1);
        }

        // Test adding a winner directly to database
        const newWinner = new Winner({
            username: "DirectAdd****",
            game: "Direct Test Game",
            betAmount: 200,
            winAmount: 10000,
            multiplier: "50x",
            quote: "Added directly to database!",
            avatar: "🚀",
            createdBy: admin._id
        });

        await newWinner.save();
        console.log('✅ Winner added directly to database:', newWinner.username);

        // List all winners
        const allWinners = await Winner.find({ active: true });
        console.log(`\n📋 Total active winners: ${allWinners.length}`);
        allWinners.forEach(winner => {
            console.log(`- ${winner.username}: ₹${winner.winAmount} from ${winner.game}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testAddWinner();