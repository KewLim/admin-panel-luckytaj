class DailyTrendingGames {
    constructor() {
        this.gamesData = null;
        this.dailyGames = [];
        this.isSpinning = false;
        
        // LuckyTaj YouTube Channel Videos - Replace with your actual video IDs
        this.youtubeVideos = [
            'E7He8psjoJ8', // Example video - replace with your actual video IDs
            // To add more videos from your channel:
            // 1. Go to your video on YouTube
            // 2. Copy the video ID from the URL (after watch?v=)
            // 3. Add it to this array like: 'VIDEO_ID_HERE',
            // 
            // Example:
            // 'dQw4w9WgXcQ', // Replace with your video ID
            // 'abc123def456', // Replace with your video ID  
            // 'xyz789uvw012', // Replace with your video ID
            //
            // The system will randomly pick one video per day
        ];
        
        this.init();
    }

    async init() {
        await this.loadGamesData();
        this.updateDateDisplay();
        this.generateDailyGames();
        this.loadRandomVideo();
        this.setupEventListeners();
        
        setTimeout(() => {
            this.autoSpin();
        }, 1000);
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
            `${now.toLocaleDateString('en-US', options)}`;
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

    loadRandomVideo() {
        if (this.youtubeVideos.length === 0) return;
        
        // Use date-based seeding for consistent daily video (like games)
        const today = new Date();
        const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
        const videoIndex = daysSinceEpoch % this.youtubeVideos.length;
        
        const selectedVideoId = this.youtubeVideos[videoIndex];
        
        // Update the iframe src
        const videoIframe = document.querySelector('.highlight-video');
        if (videoIframe) {
            videoIframe.src = `https://www.youtube.com/embed/${selectedVideoId}?rel=0&modestbranding=1&showinfo=0`;
            console.log('Loaded video:', selectedVideoId);
        }
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

    setupEventListeners() {
        const spinButton = document.getElementById('spinButton');
        spinButton.addEventListener('click', () => {
            if (!this.isSpinning) {
                this.hideTrendingGames();
                setTimeout(() => this.autoSpin(), 500);
            }
        });
    }

    autoSpin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        const reels = document.querySelectorAll('.reel');
        
        reels.forEach((reel, index) => {
            setTimeout(() => {
                reel.classList.add('spinning');
                this.updateReelContent(reel, this.dailyGames[index]?.image);
            }, index * 500);
        });

        setTimeout(() => {
            reels.forEach(reel => reel.classList.remove('spinning'));
            this.isSpinning = false;
            this.showTrendingGames();
            this.showSpinButton();
        }, 4000);
    }

    updateReelContent(reel, targetImage) {
        const items = reel.querySelectorAll('.reel-item');
        const emojis = ['🎮', '🎯', '🎲', '🃏', '🎊', '⚡'];
        
        items.forEach((item, index) => {
            if (index === 0) {
                setTimeout(() => {
                    if (targetImage) {
                        item.innerHTML = `<img src="${targetImage}" alt="Game" class="reel-game-image">`;
                    } else {
                        item.textContent = '🎮';
                    }
                }, 3000);
            } else {
                item.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            }
        });
    }

    showTrendingGames() {
        const trendingGamesSection = document.getElementById('trendingGames');
        const gamesGrid = document.getElementById('gamesGrid');
        
        gamesGrid.innerHTML = '';
        
        this.dailyGames.forEach((game, index) => {
            const gameCard = this.createGameCard(game);
            gamesGrid.appendChild(gameCard);
            
            setTimeout(() => {
                gameCard.classList.add('animate-in');
            }, index * 200);
        });
        
        trendingGamesSection.style.display = 'block';
        setTimeout(() => {
            trendingGamesSection.classList.add('show');
        }, 100);
    }

    hideTrendingGames() {
        const trendingGamesSection = document.getElementById('trendingGames');
        trendingGamesSection.classList.remove('show');
        setTimeout(() => {
            trendingGamesSection.style.display = 'none';
        }, 500);
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

    showSpinButton() {
        const spinButton = document.getElementById('spinButton');
        setTimeout(() => {
            spinButton.style.display = 'block';
        }, 1000);
    }

}

document.addEventListener('DOMContentLoaded', () => {
    new DailyTrendingGames();
});