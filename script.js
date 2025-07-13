class DailyTrendingGames {
    constructor() {
        this.gamesData = null;
        this.dailyGames = [];
        this.isSpinning = false;
        
        this.init();
    }

    async init() {
        await this.loadGamesData();
        this.updateDateDisplay();
        this.generateDailyGames();
        this.showTrendingGames();
    }

    async loadGamesData() {
        try {
            const response = await fetch('./games-data.json');
            this.gamesData = await response.json();
            console.log('Games data loaded:', this.gamesData);
        } catch (error) {
            console.error('Error loading games data:', error);
            this.gamesData = { gamesPool: [] };
        }
    }

    updateDateDisplay() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('dateDisplay').textContent = 
            `Today's Selection - ${now.toLocaleDateString('en-US', options)}`;
    }

    generateDailyGames() {
        if (!this.gamesData.gamesPool.length) return;

        const today = new Date();
        const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
        
        // Use modulo logic as specified in README
        const totalGames = this.gamesData.gamesPool.length;
        const startIndex = daysSinceEpoch % totalGames;
        
        // Select 3 games using rotating index
        this.dailyGames = [];
        for (let i = 0; i < 3; i++) {
            const gameIndex = (startIndex + i) % totalGames;
            this.dailyGames.push(this.gamesData.gamesPool[gameIndex]);
        }
        console.log('Daily games selected:', this.dailyGames);
    }

    stringToSeed(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    shuffleArrayWithSeed(array, seed) {
        const rng = this.seededRandom(seed);
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    seededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }


    showTrendingGames() {
        const gamesGrid = document.getElementById('gamesGrid');
        
        gamesGrid.innerHTML = '';
        
        this.dailyGames.forEach((game, index) => {
            const gameCard = this.createGameCard(game);
            gamesGrid.appendChild(gameCard);
            
            setTimeout(() => {
                gameCard.classList.add('animate-in');
            }, index * 200);
        });
    }

    createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        card.innerHTML = `
            <div class="game-thumbnail">
                <img src="${game.image}" alt="${game.title}" class="game-image">
            </div>
            <div class="game-title">${game.title}</div>
            <div class="win-info">
                <div class="win-amount">🏆 Recent Win: ${game.recentWin.amount}</div>
                <div class="win-comment">"${game.recentWin.comment}"</div>
                <div class="player-name">- ${game.recentWin.player}</div>
            </div>
        `;
        
        return card;
    }

}

document.addEventListener('DOMContentLoaded', () => {
    new DailyTrendingGames();
});