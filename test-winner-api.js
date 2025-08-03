const fetch = require('node-fetch');

async function testWinnerAPI() {
    try {
        // First login to get token
        console.log('🔐 Logging in...');
        const loginResponse = await fetch('http://localhost:3003/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@luckytaj.com',
                password: 'admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
            console.error('❌ Login failed:', loginData);
            return;
        }
        
        console.log('✅ Login successful');
        const token = loginData.token;
        
        // Test adding a winner
        console.log('\n📝 Adding a new winner...');
        const winnerData = {
            username: "TestUser****",
            game: "Test Game",
            betAmount: 100,
            winAmount: 5000,
            multiplier: "50x",
            quote: "This is a test quote!",
            avatar: "🎯"
        };
        
        const addResponse = await fetch('http://localhost:3003/api/winners', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(winnerData)
        });
        
        const addResult = await addResponse.json();
        
        if (addResponse.ok) {
            console.log('✅ Winner added successfully:', addResult);
        } else {
            console.error('❌ Failed to add winner:', addResult);
        }
        
        // Test getting winners
        console.log('\n📋 Getting all winners...');
        const getResponse = await fetch('http://localhost:3003/api/winners/active');
        const winners = await getResponse.json();
        
        if (getResponse.ok) {
            console.log(`✅ Found ${winners.length} winners`);
            winners.forEach((winner, i) => {
                console.log(`${i + 1}. ${winner.username} - ${winner.game} - ₹${winner.winAmount}`);
            });
        } else {
            console.error('❌ Failed to get winners:', winners);
        }
        
    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

testWinnerAPI();