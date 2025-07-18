class DailyTrendingGames {
    constructor() {
        this.gamesData = null;
        this.dailyGames = [];
        this.isSpinning = false;
        this.notificationPermission = null;
        
        // LuckyTaj YouTube Channel Videos - Main video section (changes daily)
        this.youtubeVideos = [
            'E7He8psjoJ8', // Example video - replace with your actual video IDs
            //'RU-LstcZQMY',
            //'2cbiW84IuoU', 
            //'1uporVtLEog', 
            //'W10-7uKWZ3I',
            //'kQ924gJSnJ4',
            //'1iiv7O1KH4A',
            //'plzgfP_2Jg0',
            //'daMgJA6wvmY',
            //'PfoG2Uyj-Jk',
            //'HEYsC5YJADk',
            //'y_qGxMbpsJ0',
            //'zvjgVpOdY7w',
            //'DQ9Ku_8oe6Q',
            //'u_vuwY4la7Y',
            //'ys8rhut3gHM',
        ];
        
        // Tournament TV Videos - Changes every 6 hours
        this.tournamentTvVideos = [
            'Fr3bXkHriGM', 
            'POl3GtraHeo&t',
            'ma5lm-ExMaA',
            'akm4ys-WUN0',
            'n14gIPk9_yo',
            'GPXxOzK8A50',
            'f0tUF8RLHwE',
            'CfrVafvX3XI',
            'D8g38fkFHFw',
            'be1pSS2NSbY',
            '7Bw0FSjSRpI',
            'sZo46xEeOi4',
            'GQUl8O97-S8',
        ];
        
        // Video descriptions mapping for dynamic content
        this.videoDescriptions = {
            'E7He8psjoJ8': 'Watch incredible jackpot wins and mega payouts from our top players!',
            'RU-LstcZQMY': 'Experience the excitement of live casino action with massive multipliers!',
            '2cbiW84IuoU': 'See how players turn small bets into life-changing wins at LuckyTaj!',
            '1uporVtLEog': 'Discover the hottest slot games with amazing bonus features and free spins!',
            'W10-7uKWZ3I': 'Join the winners circle with these incredible casino success stories!',
            'kQ924gJSnJ4': 'Feel the rush of hitting progressive jackpots and massive cash prizes!',
            '1iiv7O1KH4A': 'Learn winning strategies from our most successful high-roller players!',
            'plzgfP_2Jg0': 'Witness epic bonus rounds and spectacular win celebrations!',
            'daMgJA6wvmY': 'Get inspired by these amazing comeback stories and big win moments!',
            'PfoG2Uyj-Jk': 'Experience the thrill of tournament victories and championship wins!',
            'HEYsC5YJADk': 'See why LuckyTaj players keep winning big every single day!',
            'y_qGxMbpsJ0': 'Watch real players hit incredible streaks and massive payouts!',
            'zvjgVpOdY7w': 'Discover the secrets behind these mind-blowing jackpot wins!',
            'DQ9Ku_8oe6Q': 'Experience heart-stopping moments of pure casino excitement!',
            'u_vuwY4la7Y': 'Join thousands of players celebrating their biggest wins at LuckyTaj!'
        };
        
        // Tournament Dashboard Data
        this.tournamentWinners = [];
        this.dailyTotalWinnings = 0;
        this.winnerRefreshInterval = null;
        
        // Video position tracking
        this.videoPositionTracker = null;
        this.currentVideoId = null;
        
        this.init();
    }

    async init() {
        this.setupLazyLoading();
        await this.loadGamesData();
        this.updateDateDisplay();
        this.generateDailyGames();
        this.setupEventListeners();
        
        // Setup daily games refresh at 12pm IST
        this.setupDailyGamesRefresh();
        
        // Request notification permission after user interaction
        setTimeout(() => {
            this.requestNotificationPermission();
        }, 3000);
        
        // Setup daily notification scheduling
        this.setupDailyNotifications();
        
        // Delay video loading for better initial page performance
        setTimeout(() => {
            this.loadRandomVideo();
        }, 500);
        
        setTimeout(() => {
            this.autoSpin();
        }, 1000);
        
        // Initialize tournament dashboard
        this.initializeTournamentDashboard();
        
        // Initialize tournament TV
        this.initializeTournamentTV();
        
        // Initialize retention modules
        this.initializeRetentionModules();
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

        // Get current time in GMT+5:30 (Indian Standard Time)
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        const istTime = new Date(utcTime + (5.5 * 60 * 60 * 1000));
        
        // Calculate days since epoch using IST date (not local time)
        const istDate = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
        const daysSinceEpoch = Math.floor(istDate.getTime() / (1000 * 60 * 60 * 24));
        
        // Use modulo logic as specified in README
        const totalGames = this.gamesData.gamesPool.length;
        const startIndex = daysSinceEpoch % totalGames;
        
        // Select 3 games using rotating index
        this.dailyGames = [];
        for (let i = 0; i < 3; i++) {
            const gameIndex = (startIndex + i) % totalGames;
            this.dailyGames.push(this.gamesData.gamesPool[gameIndex]);
        }
        console.log('Daily games selected for IST date:', istDate.toDateString(), this.dailyGames);
    }

    // Utility function to mimic CSS clamp() in JavaScript
    clampValue(min, preferred, max) {
        return Math.min(Math.max(min, preferred), max);
    }

    setupLazyLoading() {
        // Intersection Observer for lazy loading
        this.lazyLoadObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadLazyElement(entry.target);
                    this.lazyLoadObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: this.clampValue(100, window.innerWidth * 0.2, 300) + 'px', // Dynamic margin
            threshold: 0.1
        });

        // Observe all lazy loading elements
        document.querySelectorAll('.lazy-load').forEach(element => {
            this.lazyLoadObserver.observe(element);
        });
    }

    loadLazyElement(element) {
        if (element.tagName === 'IFRAME') {
            const dataSrc = element.getAttribute('data-src');
            if (dataSrc) {
                element.src = dataSrc;
                element.classList.add('loaded');
                
                // Hide video skeleton
                const videoSkeleton = document.getElementById('videoSkeleton');
                if (videoSkeleton) {
                    setTimeout(() => {
                        videoSkeleton.classList.add('hidden');
                    }, 300);
                }
            }
        }
        
        if (element.tagName === 'IMG') {
            const dataSrc = element.getAttribute('data-src');
            if (dataSrc) {
                const imageSkeleton = element.parentElement.querySelector('.image-skeleton');
                
                // Handle image load success
                element.onload = () => {
                    element.classList.add('loaded');
                    if (imageSkeleton) {
                        imageSkeleton.classList.add('hidden');
                    }
                };
                
                // Handle image load error
                element.onerror = () => {
                    element.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzM0NDk1ZSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+🎮</dGV4dD48L3N2Zz4=';
                    element.classList.add('loaded');
                    if (imageSkeleton) {
                        imageSkeleton.classList.add('hidden');
                    }
                };
                
                element.src = dataSrc;
            }
        }
    }

    loadRandomVideo() {
        if (this.youtubeVideos.length === 0) return;
        
        // Use date-based seeding for consistent daily video (like games)
        const today = new Date();
        const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
        const videoIndex = daysSinceEpoch % this.youtubeVideos.length;
        
        const selectedVideoId = this.youtubeVideos[videoIndex];
        const videoUrl = `https://www.youtube.com/embed/${selectedVideoId}?rel=0&modestbranding=1&showinfo=0`;
        
        // Update the iframe data-src for lazy loading
        const videoIframe = document.querySelector('.highlight-video');
        const videoSkeleton = document.getElementById('videoSkeleton');
        const videoDescription = document.querySelector('.video-description');
        
        if (videoIframe) {
            videoIframe.setAttribute('data-src', videoUrl);
            
            // Update video description dynamically based on video ID
            if (videoDescription) {
                const description = this.videoDescriptions[selectedVideoId] || 'Experience the thrill of big wins and exciting gameplay!';
                videoDescription.textContent = description;
            }
            
            // Simulate loading delay for better UX
            setTimeout(() => {
                if (videoSkeleton) {
                    videoSkeleton.classList.add('hidden');
                }
                
                // Load immediately if in viewport, otherwise let Intersection Observer handle it
                const rect = videoIframe.getBoundingClientRect();
                const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
                
                if (inViewport) {
                    this.loadLazyElement(videoIframe);
                }
            }, this.clampValue(800, window.innerWidth * 2, 1500)); // Dynamic delay
            
            console.log('Prepared video for lazy loading:', selectedVideoId);
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
        
        // Get reel index (1, 2, 3) for ranking
        const reelIndex = parseInt(reel.id.replace('reel', '')) - 1;
        const rankingLabels = [
            { number: '1', class: 'gold' },
            { number: '2', class: 'silver' }, 
            { number: '3', class: 'bronze' }
        ];
        const ranking = rankingLabels[reelIndex] || { number: reelIndex + 1, class: 'bronze' };
        
        items.forEach((item, index) => {
            if (index === 0) {
                setTimeout(() => {
                    if (targetImage) {
                        // Preload the image before inserting
                        const img = new Image();
                        img.onload = () => {
                            // Image is loaded, insert DOM element first (hidden) with ranking label
                            item.innerHTML = `
                                <div class="reel-ranking-label ${ranking.class}">${ranking.number}</div>
                                <img src="${targetImage}" alt="Game" class="reel-game-image">
                            `;
                            const insertedImg = item.querySelector('.reel-game-image');
                            
                            // Small delay to ensure DOM is ready, then trigger animation
                            setTimeout(() => {
                                insertedImg.classList.add('loaded');
                            }, 50);
                        };
                        img.onerror = () => {
                            // Fallback to emoji if image fails
                            item.textContent = '🎮';
                        };
                        // Start loading the image
                        img.src = targetImage;
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
    setTimeout(() => {
        const trendingGamesSection = document.getElementById('trendingGames');
        const gamesGrid = document.getElementById('gamesGrid');

        gamesGrid.innerHTML = '';

        this.dailyGames.forEach((game, index) => {
            const gameCard = this.createGameCard(game, index);
            gamesGrid.appendChild(gameCard);

            // Observe the new lazy load images
            const lazyImage = gameCard.querySelector('.lazy-load');
            if (lazyImage && this.lazyLoadObserver) {
                this.lazyLoadObserver.observe(lazyImage);

                // Load immediately since trending games are visible after slot animation
                setTimeout(() => {
                    const rect = lazyImage.getBoundingClientRect();
                    const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
                    if (inViewport) {
                        this.loadLazyElement(lazyImage);
                    }
                }, 100);
            }

            // Animate with staggered delay
            setTimeout(() => {
                gameCard.classList.add('animate-in');
            }, index * 200);
        });

        trendingGamesSection.style.display = 'block';
        setTimeout(() => {
            trendingGamesSection.classList.add('show');
        }, 100);
    }, 700); // 1 second delay before starting
}

    hideTrendingGames() {
        const trendingGamesSection = document.getElementById('trendingGames');
        trendingGamesSection.classList.remove('show');
        setTimeout(() => {
            trendingGamesSection.style.display = 'none';
        }, 500);
    }

    createGameCard(game, index) {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        // Determine ranking label
        const rankingLabels = [
            { number: '1', class: 'gold' },
            { number: '2', class: 'silver' }, 
            { number: '3', class: 'bronze' }
        ];
        const ranking = rankingLabels[index] || { number: index + 1, class: 'bronze' };
        
        card.innerHTML = `
            <div class="game-thumbnail">
                <div class="ranking-label ${ranking.class}">${ranking.number}</div>
                <img data-src="${game.image}" src="" alt="${game.title}" class="game-image lazy-load" loading="lazy">
                <div class="image-skeleton"></div>
            </div>
            <div class="game-title">${game.title}</div>
            <div class="win-screenshot">
                <img data-src="${game.screenshot}" src="" alt="Win Screenshot" class="screenshot-image lazy-load" loading="lazy">
                <div class="image-skeleton"></div>
            </div>
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

    // Notification System
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        // Check if already granted
        if (Notification.permission === 'granted') {
            this.notificationPermission = 'granted';
            console.log('Notifications already enabled');
            return;
        }

        // Don't ask if denied
        if (Notification.permission === 'denied') {
            return;
        }

        // Show custom notification prompt
        this.showNotificationPrompt();
    }

    showNotificationPrompt() {
        const promptContainer = document.createElement('div');
        promptContainer.className = 'notification-prompt';
        promptContainer.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🔔</div>
                <div class="notification-text">
                    <h3>Daily Game Tips</h3>
                    <p>Get notified about today's big win games every day at 12 PM!</p>
                </div>
                <div class="notification-actions">
                    <button class="allow-btn" onclick="window.dailyGames.enableNotifications()">Allow</button>
                    <button class="deny-btn" onclick="window.dailyGames.dismissNotificationPrompt()">Not Now</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(promptContainer);
        
        // Store reference for easy removal
        this.notificationPromptElement = promptContainer;
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            this.dismissNotificationPrompt();
        }, 10000);
    }

    async enableNotifications() {
        try {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission;
            
            if (permission === 'granted') {
                this.showSuccessMessage('🎉 Notifications enabled! You\'ll get daily game tips at 12 PM.');
                this.scheduleDailyNotification();
            } else {
                this.showSuccessMessage('📱 You can enable notifications later in your browser settings.');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
        
        this.dismissNotificationPrompt();
    }

    dismissNotificationPrompt() {
        if (this.notificationPromptElement) {
            this.notificationPromptElement.classList.add('fade-out');
            setTimeout(() => {
                if (this.notificationPromptElement && this.notificationPromptElement.parentNode) {
                    this.notificationPromptElement.parentNode.removeChild(this.notificationPromptElement);
                }
            }, 300);
        }
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.classList.add('fade-out');
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 300);
        }, 3000);
    }

    setupDailyGamesRefresh() {
        // Calculate time until next 12pm IST
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        const istTime = new Date(utcTime + (5.5 * 60 * 60 * 1000));
        
        const next12pm = new Date(istTime);
        next12pm.setHours(12, 0, 0, 0);
        
        // If 12pm has already passed today, schedule for tomorrow
        if (istTime.getTime() > next12pm.getTime()) {
            next12pm.setDate(next12pm.getDate() + 1);
        }
        
        const timeUntilRefresh = next12pm.getTime() - istTime.getTime();
        
        console.log('Next games refresh scheduled for:', next12pm.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
        
        // Set timeout for the next refresh
        setTimeout(() => {
            this.refreshDailyGames();
            // Set up recurring daily refresh every 24 hours
            setInterval(() => {
                this.refreshDailyGames();
            }, 24 * 60 * 60 * 1000);
        }, timeUntilRefresh);
    }

    refreshDailyGames() {
        console.log('Refreshing daily games at 12pm IST');
        
        // Regenerate daily games
        this.generateDailyGames();
        
        // Update date display
        this.updateDateDisplay();
        
        // Hide current trending games
        this.hideTrendingGames();
        
        // Restart the slot machine animation with new games
        setTimeout(() => {
            this.autoSpin();
        }, 500);
    }

    setupDailyNotifications() {
        // Check for notification support
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            return;
        }

        // Schedule notification for next 12 PM GMT+5:30
        this.scheduleDailyNotification();
    }

    scheduleDailyNotification() {
        if (Notification.permission !== 'granted') {
            return;
        }

        // Calculate next 12 PM GMT+5:30 (IST)
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // 5:30 hours in milliseconds
        const istNow = new Date(now.getTime() + istOffset);
        
        const nextNotification = new Date(istNow);
        nextNotification.setHours(12, 0, 0, 0); // Set to 12:00 PM IST
        
        // If 12 PM has already passed today, schedule for tomorrow
        if (istNow.getTime() > nextNotification.getTime()) {
            nextNotification.setDate(nextNotification.getDate() + 1);
        }
        
        // Convert back to local time
        const localNotificationTime = new Date(nextNotification.getTime() - istOffset);
        const timeUntilNotification = localNotificationTime.getTime() - now.getTime();
        
        console.log(`Next notification scheduled for: ${localNotificationTime.toLocaleString()}`);
        
        // Schedule the notification
        setTimeout(() => {
            this.sendDailyGameNotification();
            // Schedule next day's notification
            this.scheduleDailyNotification();
        }, timeUntilNotification);
    }

    sendDailyGameNotification() {
        if (Notification.permission !== 'granted' || !this.dailyGames.length) {
            return;
        }

        const todayGame = this.dailyGames[0]; // First game of the day
        const notification = new Notification('🎰 LuckyTaj Daily Game Tip', {
            body: `Today's big win game: ${todayGame.title}! Recent win: ${todayGame.recentWin.amount}`,
            icon: todayGame.image || '/favicon.ico',
            badge: 'https://www.luckytaj.com/luckytaj/img/logo.png',
            tag: 'daily-game-tip',
            requireInteraction: false,
            silent: false,
            data: {
                gameTitle: todayGame.title,
                url: 'https://www.luckytaj.com/en-in/slot'
            }
        });

        notification.onclick = function() {
            window.focus();
            window.open('https://www.luckytaj.com/en-in/slot', '_blank');
            notification.close();
        };

        // Auto-close after 10 seconds
        setTimeout(() => {
            notification.close();
        }, 10000);
    }

    // Direct WhatsApp Share with Screenshot
    async shareToWhatsAppDirect() {
        if (!this.dailyGames.length) {
            this.showSuccessMessage('⏳ Please wait for games to load first!');
            return;
        }

        this.showSuccessMessage('📸 Capturing screenshot...');

        try {
            // Get the trending games section
            const trendingSection = document.getElementById('trendingGames');
            
            // Temporarily remove animation to get clean screenshot
            const gameCards = trendingSection.querySelectorAll('.game-card');
            gameCards.forEach(card => {
                card.style.animation = 'none';
            });

            // Capture screenshot
            const canvas = await html2canvas(trendingSection, {
                backgroundColor: '#151a43', // LuckyTaj brand background color
                scale: 2, // Higher quality
                useCORS: true,
                allowTaint: false,
                logging: false,
                width: trendingSection.offsetWidth,
                height: trendingSection.offsetHeight
            });

            // Restore animations
            gameCards.forEach((card, index) => {
                card.style.animation = `cardPulse 6s ease-in-out infinite`;
                card.style.animationDelay = `${index * 2}s`;
            });

            const today = new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            // Create WhatsApp message
            const whatsappMessage = `🎰 *LuckyTaj Daily Game Tips* - ${today}

🔥 Check out today's big win games! 
💰 These are trending with amazing wins!

*Play Now:* https://www.luckytaj.com/en-in/slot

#LuckyTaj #BigWins #CasinoGames`;

            // Try to share with Web Share API (includes image)
            if (navigator.share && navigator.canShare) {
                try {
                    canvas.toBlob(async (blob) => {
                        const file = new File([blob], 'luckytaj-daily-games.png', { type: 'image/png' });
                        
                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                title: 'LuckyTaj Daily Game Tips',
                                text: whatsappMessage,
                                files: [file]
                            });
                            this.showSuccessMessage('🎉 Completed!');
                        } else {
                            this.fallbackImageShare(canvas, whatsappMessage);
                        }
                    }, 'image/png');
                } catch (error) {
                    console.log('Web Share failed, using fallback');
                    this.fallbackImageShare(canvas, whatsappMessage);
                }
            } else {
                this.fallbackImageShare(canvas, whatsappMessage);
            }

        } catch (error) {
            console.error('Screenshot failed:', error);
            this.showSuccessMessage('❌ Screenshot failed. Sharing text instead...');
            this.shareTextOnly();
        }
    }

    fallbackImageShare(canvas, message) {
        // Create download link for the image
        const link = document.createElement('a');
        link.download = `luckytaj-daily-games-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        
        // Auto-download the image
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Open WhatsApp with text message
        setTimeout(() => {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }, 500);

        this.showSuccessMessage('📱 Image downloaded! Share it with the WhatsApp message.');
    }

    shareTextOnly() {
        const today = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const gamesList = this.dailyGames.map((game, index) => 
            `${index + 1}. *${game.title}* - Recent Win: ${game.recentWin.amount}`
        ).join('\n');

        const whatsappMessage = `🎰 *LuckyTaj Daily Game Tips* - ${today}

🔥 *Today's Big Win Games are:*
${gamesList}

💰 These games are trending with amazing wins!
🎮 Join thousands of players winning big at LuckyTaj

*Play Now:* https://www.luckytaj.com/en-in/slot

#LuckyTaj #BigWins #CasinoGames`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
        
        this.showSuccessMessage('📱 Opening WhatsApp...');
    }

    // Tournament Dashboard Methods
    initializeTournamentDashboard() {
        this.generateInitialWinners();
        this.updateDailyTotal();
        this.startWinnerUpdates();
    }

    generateInitialWinners() {
        const indianNames = [
            'Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anita', 'Suresh', 'Kavita',
            'Rahul', 'Meera', 'Arjun', 'Pooja', 'Kiran', 'Deepika', 'Rohan', 'Shreya',
            'Anil', 'Ritu', 'Manoj', 'Nisha', 'Sanjay', 'Geeta', 'Vinay', 'Sunita',
            'Ravi', 'Lata', 'Ajay', 'Manju', 'Prakash', 'Seema', 'Gopal', 'Usha',
            'Neha', 'Harsh', 'Divya', 'Abhishek', 'Isha', 'Karthik', 'Swati', 'Tushar',
            'Bhavna', 'Yash', 'Chitra', 'Mohit', 'Tanvi', 'Nikhil', 'Payal', 'Dev',
            'Juhi', 'Alok', 'Madhuri', 'Sameer'
        ];

        const cities = [
            'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
            'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam', 'Patna',
            'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot'
        ];

        // Generate 15 initial winners
        for (let i = 0; i < 15; i++) {
            const name = indianNames[Math.floor(Math.random() * indianNames.length)];
            const city = cities[Math.floor(Math.random() * cities.length)];
            const vipLevel = Math.floor(Math.random() * 20) + 1; // Random VIP 1-20
            const amount = this.generateRandomAmount();
            const time = this.generateTodayTime();
            
            this.tournamentWinners.push({
                name: `${name} ${city.charAt(0)}***   VIP ${vipLevel}`,
                phone: this.generateIndianPhone(),
                amount: amount,
                time: time,
                timestamp: Date.now() - (i * 30000) // Spread over last 30 minutes
            });
        }

        // Sort by timestamp (newest first)
        this.tournamentWinners.sort((a, b) => b.timestamp - a.timestamp);
        this.updateWinnersDisplay();
    }

    generateRandomAmount() {
        // Generate amounts between ₹1000 and ₹10000
        const min = 1000;
        const max = 10000;
        const amount = Math.floor(Math.random() * (max - min + 1)) + min;
        
        // Round to nearest 50 for more realistic amounts
        return Math.round(amount / 50) * 50;
    }

    generateTodayTime() {
        const now = new Date();
        // Generate time from 6 AM to current time (GMT+5:30)
        const startOfDay = new Date(now);
        startOfDay.setHours(6, 0, 0, 0);
        
        const randomTime = new Date(startOfDay.getTime() + Math.random() * (now.getTime() - startOfDay.getTime()));
        
        return randomTime.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
        });
    }

    generateIndianPhone() {
        // Generate realistic Indian phone number pattern
        const prefixes = ['98', '99', '97', '96', '95', '94', '93', '92', '91', '90'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const remaining = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        return `+91 ${prefix}${remaining.substring(0, 4)}***${remaining.substring(7)}`;
    }

    updateDailyTotal() {
        // Calculate today's total from all winners
        this.dailyTotalWinnings = this.tournamentWinners.reduce((total, winner) => {
            return total + winner.amount;
        }, 0);

        // Add some extra random amount to make it more impressive
        this.dailyTotalWinnings += Math.floor(Math.random() * 50000) + 100000;

        const totalElement = document.getElementById('totalWinners');
        if (totalElement) {
            totalElement.textContent = `₹${this.dailyTotalWinnings.toLocaleString('en-IN')} Won Today`;
        }
    }

    startWinnerUpdates() {
        // Update winners every 2 seconds
        this.winnerRefreshInterval = setInterval(() => {
            this.addNewWinner();
        }, 2000);
    }

    addNewWinner() {
        const indianNames = [
            'Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anita', 'Suresh', 'Kavita',
            'Rahul', 'Meera', 'Arjun', 'Pooja', 'Kiran', 'Deepika', 'Rohan', 'Shreya',
            'Anil', 'Ritu', 'Manoj', 'Nisha', 'Sanjay', 'Geeta', 'Vinay', 'Sunita'
        ];

        const cities = [
            'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
            'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam', 'Patna'
        ];

        const name = indianNames[Math.floor(Math.random() * indianNames.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const vipLevel = Math.floor(Math.random() * 20) + 1; // Random VIP 1-20
        const amount = this.generateRandomAmount();

        const newWinner = {
            name: `${name} ${city.charAt(0)}*** VIP ${vipLevel}`,
            phone: this.generateIndianPhone(),
            amount: amount,
            time: 'Just now',
            timestamp: Date.now()
        };

        // Add to beginning of array
        this.tournamentWinners.unshift(newWinner);

        // Keep only last 20 winners to prevent memory issues
        if (this.tournamentWinners.length > 20) {
            this.tournamentWinners = this.tournamentWinners.slice(0, 20);
        }

        // Update daily total
        this.dailyTotalWinnings += amount;
        const totalElement = document.getElementById('totalWinners');
        if (totalElement) {
            totalElement.textContent = `₹${this.dailyTotalWinnings.toLocaleString('en-IN')} Won Today`;
        }

        this.updateWinnersDisplay();
    }

    updateWinnersDisplay() {
        const winnersList = document.getElementById('winnersList');
        if (!winnersList) return;

        winnersList.innerHTML = '';

        this.tournamentWinners.forEach((winner, index) => {
            const winnerElement = document.createElement('div');
            winnerElement.className = 'winner-record';
            winnerElement.style.animationDelay = `${index * 0.1}s`;

            winnerElement.innerHTML = `
                <div class="winner-info">
                    <div class="winner-name">${winner.name}</div>
                    <div class="winner-phone">${winner.phone}</div>
                    <div class="winner-time">${winner.time}</div>
                </div>
                <div class="winner-amount">₹${winner.amount.toLocaleString('en-IN')}</div>
            `;

            winnersList.appendChild(winnerElement);
        });

        // Auto-scroll to top to show newest winner
        winnersList.scrollTop = 0;
    }

    // Tournament TV Methods
    initializeTournamentTV() {
        console.log('Initializing Tournament TV...');
        console.log('Tournament TV Videos array:', this.tournamentTvVideos);
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            this.loadTournamentTvVideo();
        }, 500);
    }

    loadTournamentTvVideo() {
        console.log('Loading Tournament TV video...');
        
        if (this.tournamentTvVideos.length === 0) {
            console.error('No tournament TV videos available');
            return;
        }
        
        // Randomly select a video on each page refresh
        const randomIndex = Math.floor(Math.random() * this.tournamentTvVideos.length);
        const selectedVideoId = this.tournamentTvVideos[randomIndex];
        console.log('Selected video ID:', selectedVideoId);
        
        // Skip if video ID is empty
        if (!selectedVideoId) {
            console.error('Empty video ID');
            return;
        }
        
        this.currentVideoId = selectedVideoId;
        
        // Start at 20 seconds
        const startTime = 20;
        
        // Try multiple video URL formats for better compatibility
        // Add cache-busting parameter to force reload
        const cacheBuster = Date.now() + Math.random();
        
        const videoUrls = [
            `https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&mute=1&start=${startTime}&loop=1&playlist=${selectedVideoId}&controls=0&disablekb=1&v=${cacheBuster}`,
            `https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&mute=1&start=${startTime}&loop=1&playlist=${selectedVideoId}&controls=0&v=${cacheBuster}`,
            `https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&mute=1&start=${startTime}&loop=1&playlist=${selectedVideoId}&v=${cacheBuster}`,
            `https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&mute=1&start=${startTime}&v=${cacheBuster}`
        ];
        
        // Update the tournament TV iframe
        const tvVideoIframe = document.getElementById('tournamentTvVideo');
        console.log('TV Video iframe element:', tvVideoIframe);
        
        if (tvVideoIframe) {
            // Try the first URL
            const videoUrl = videoUrls[0];
            console.log('Setting video URL:', videoUrl);
            tvVideoIframe.src = videoUrl;
            
            // Add a timeout to check if video loaded
            setTimeout(() => {
                // If iframe still doesn't have content, try alternative approach
                if (!tvVideoIframe.contentDocument && tvVideoIframe.src) {
                    console.log('Trying alternative video URL...');
                    tvVideoIframe.src = videoUrls[1];
                }
            }, 3000);
            
            console.log('Tournament TV video setup complete');
        } else {
            console.error('Tournament TV iframe element not found in DOM!');
            // Check if the tournament dashboard exists
            const dashboard = document.getElementById('tournamentDashboard');
            console.log('Tournament dashboard found:', !!dashboard);
            
            // List all elements with "tournament" in their ID
            const tournamentElements = document.querySelectorAll('[id*="tournament"]');
            console.log('All tournament elements:', Array.from(tournamentElements).map(el => el.id));
        }
    }

    startVideoPositionTracking() {
        // Clear any existing tracker
        if (this.videoPositionTracker) {
            clearInterval(this.videoPositionTracker);
        }
        
        // Track video position every 10 seconds
        this.videoPositionTracker = setInterval(() => {
            if (this.currentVideoId) {
                const now = new Date();
                const sixHourPeriodStart = Math.floor(now.getTime() / (1000 * 60 * 60 * 6)) * (1000 * 60 * 60 * 6);
                const timeSincePeriodStart = now.getTime() - sixHourPeriodStart;
                const currentPosition = Math.floor(timeSincePeriodStart / 1000);
                
                this.saveVideoPosition(this.currentVideoId, currentPosition);
            }
        }, 10000); // Save position every 10 seconds
    }

    saveVideoPosition(videoId, position) {
        try {
            const videoPositions = JSON.parse(localStorage.getItem('tournamentVideoPositions')) || {};
            videoPositions[videoId] = {
                position: position,
                timestamp: Date.now(),
                sixHourPeriod: Math.floor(Date.now() / (1000 * 60 * 60 * 6))
            };
            localStorage.setItem('tournamentVideoPositions', JSON.stringify(videoPositions));
        } catch (error) {
            console.log('Could not save video position:', error);
        }
    }

    getSavedVideoPosition(videoId) {
        try {
            const videoPositions = JSON.parse(localStorage.getItem('tournamentVideoPositions')) || {};
            const savedData = videoPositions[videoId];
            
            if (savedData) {
                const currentSixHourPeriod = Math.floor(Date.now() / (1000 * 60 * 60 * 6));
                
                // Only use saved position if it's from the same 6-hour period
                if (savedData.sixHourPeriod === currentSixHourPeriod) {
                    return savedData.position;
                }
            }
            
            return null;
        } catch (error) {
            console.log('Could not get saved video position:', error);
            return null;
        }
    }

    // Share Functionality (keeping original for backup)
    shareDailyTips() {
        if (!this.dailyGames.length) {
            this.showSuccessMessage('⏳ Please wait for games to load first!');
            return;
        }

        const today = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // Create share message with today's games
        const gamesList = this.dailyGames.map((game, index) => 
            `${index + 1}. ${game.title} - Recent Win: ${game.recentWin.amount}`
        ).join('\n');

        const shareMessage = `🎰 LuckyTaj Daily Game Tips - ${today}

Today's Big Win Games:
${gamesList}

🔥 These games are trending with amazing wins!
💰 Join thousands of players winning big at LuckyTaj

Play Now: https://www.luckytaj.com/en-in/slot

#LuckyTaj #BigWins #CasinoGames #DailyTips`;

        // Check if Web Share API is supported (mainly mobile)
        if (navigator.share && this.isMobile()) {
            navigator.share({
                title: 'LuckyTaj Daily Game Tips',
                text: shareMessage,
                url: 'https://www.luckytaj.com/en-in/slot'
            }).then(() => {
                this.showSuccessMessage('🎉 Thanks for sharing!');
            }).catch((error) => {
                console.log('Share cancelled');
                this.fallbackShare(shareMessage);
            });
        } else {
            this.fallbackShare(shareMessage);
        }
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    fallbackShare(message) {
        // Show share options modal
        this.showShareModal(message);
    }

    showShareModal(message) {
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-modal-content">
                <div class="share-modal-header">
                    <h3>📤 Share Daily Game Tips</h3>
                    <button class="close-modal" onclick="this.closest('.share-modal').remove()">×</button>
                </div>
                <div class="share-options">
                    <button class="share-option whatsapp" onclick="window.dailyGames.shareToWhatsApp('${encodeURIComponent(message)}')">
                        <span class="share-icon">📱</span>
                        WhatsApp
                    </button>
                    <button class="share-option telegram" onclick="window.dailyGames.shareToTelegram('${encodeURIComponent(message)}')">
                        <span class="share-icon">✈️</span>
                        Telegram
                    </button>
                    <button class="share-option copy" onclick="window.dailyGames.copyToClipboard('${encodeURIComponent(message)}')">
                        <span class="share-icon">📋</span>
                        Copy Text
                    </button>
                    <button class="share-option twitter" onclick="window.dailyGames.shareToTwitter('${encodeURIComponent(message)}')">
                        <span class="share-icon">🐦</span>
                        Twitter
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    shareToWhatsApp(encodedMessage) {
        const message = decodeURIComponent(encodedMessage);
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        document.querySelector('.share-modal').remove();
        this.showSuccessMessage('🎉 Opening WhatsApp...');
    }

    shareToTelegram(encodedMessage) {
        const message = decodeURIComponent(encodedMessage);
        const telegramUrl = `https://t.me/share/url?url=https://www.luckytaj.com&text=${encodeURIComponent(message)}`;
        window.open(telegramUrl, '_blank');
        document.querySelector('.share-modal').remove();
        this.showSuccessMessage('🎉 Opening Telegram...');
    }

    shareToTwitter(encodedMessage) {
        const message = decodeURIComponent(encodedMessage);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        window.open(twitterUrl, '_blank');
        document.querySelector('.share-modal').remove();
        this.showSuccessMessage('🎉 Opening Twitter...');
    }

    async copyToClipboard(encodedMessage) {
        const message = decodeURIComponent(encodedMessage);
        try {
            await navigator.clipboard.writeText(message);
            document.querySelector('.share-modal').remove();
            this.showSuccessMessage('📋 Copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
            this.showSuccessMessage('❌ Copy failed. Please try again.');
        }
    }

    
    // Retention Modules Implementation
    initializeRetentionModules() {
        console.log('Initializing retention modules...');
        
        // Initialize all modules
        this.initializeWinnerBoard();
        this.initializeCommentSection();
        this.initializeLiveInteraction();
        this.initializeJackpotCountdown();
    }
    
    // Module 1: WinnerBoard
    initializeWinnerBoard() {
        this.winnerData = [
            {
                username: "Lucky****2",
                game: "Jili Boxing King",
                betAmount: 500,
                winAmount: 24000,
                multiplier: "48x",
                quote: "Bhai full paisa vasool ho gaya aaj!",
                avatar: "👑"
            },
            {
                username: "Meena****n",
                game: "BNG Three China Pots",
                betAmount: 1000,
                winAmount: 32000,
                multiplier: "32x",
                quote: "Aaj toh lag raha hai mera din hai!",
                avatar: "💎"
            },
            {
                username: "Vikram****i",
                game: "Evolution Crazy Time",
                betAmount: 750,
                winAmount: 18000,
                multiplier: "24x",
                quote: "Arre yaar itna paisa dekh kar khushi se jump kar raha hu!",
                avatar: "🔥"
            },
            {
                username: "Pooja****y",
                game: "Crazy Time",
                betAmount: 2000,
                winAmount: 50000,
                multiplier: "25x",
                quote: "Main toh pagal ho gayi hu khushi se!",
                avatar: "⭐"
            }
        ];
        
        this.renderWinnerBoard();
    }
    
    renderWinnerBoard() {
        const winnersGrid = document.getElementById('winnersGrid');
        if (!winnersGrid) return;
        
        winnersGrid.innerHTML = '';
        
        this.winnerData.forEach((winner, index) => {
            const winnerCard = document.createElement('div');
            winnerCard.className = 'winner-card';
            winnerCard.style.animationDelay = `${index * 0.2}s`;
            
            winnerCard.innerHTML = `
                <div class="winner-avatar">${winner.avatar}</div>
                <div class="winner-username">${winner.username}</div>
                <div class="winner-game">${winner.game}</div>
                <div class="winner-stats">
                    <span class="winner-bet">₹${winner.betAmount}</span>
                    <span class="winner-multiplier">${winner.multiplier}</span>
                </div>
                <div class="winner-amount">₹${winner.winAmount.toLocaleString()}</div>
                <div class="winner-quote">"${winner.quote}"</div>
            `;
            
            winnersGrid.appendChild(winnerCard);
        });
    }
    
    // Module 2: CommentSection
    initializeCommentSection() {
        this.topics = [
        "Aaj raat ka sabse paisa kamane wala game?",
        "Kya hai sabse lucky time slots?",
        "Weekend mein konsa game best hai?",
        "Big win ke liye kya strategy use karte ho?",
        "Crazy Time mein kis round mein sabse zyada jeeta?",
        "Lightning Roulette ka multiplier kab kaam karta hai?",
        "Jili Game ya PG slot – aaj kya zyada de raha hai?",
        "Kya aaj Sweet Bonanza ne kisi ko bada diya?",
        "Kaunsa PG slot sabse zyada bonus dera hai aaj?",
        "Fastspin ke kaunse game se aaj log kama rahe hain?",
        "Kya Jili slots mein free spins easily mil rahe hain?",
        "BNG ke kaunse game mein aaj jackpot gira?",
        "Kya tumhe bhi Big Bass bonanza mein bada mila?",
        "Fishing game mein kaunsa gun use kiya profit ke liye?",
        "Jili Fishing mein golden dragon pakda kisi ne?",
        "Cash or Crash mein green streak kitni der chali aaj?",
        "Kya koi Evolution Gaming mein 50x leke gaya?",
        "Aaj Lucky Roulette ne kisko crorepati banaya?",
        "Kaunse game mein aaj sabse zyada 'Toh' active dikh rahe hain?",
        "Aaj ke liye koi time-based winning trick hai kya?"
        ];
        
        this.comments = [
            { username: "Desi****07", comment: "Kal Boxing King mein 20k jeet gaya bhai", time: "3 mins ago", avatar: "🎯" },
            { username: "Payal****ka", comment: "Lightning Roulette ne toh aaj kamaal kar diya", time: "5 mins ago", avatar: "💫" },
            { username: "BigS****am", comment: "Crazy Time still OP, consistent win milta hai.", time: "10 mins ago", avatar: "🎲" },
            { username: "Lucky****ha", comment: "Crazy Time ka bonus round hit kiya, full paisa double", time: "15 mins ago", avatar: "🍀" },
            { username: "Mast****Ji", comment: "Bhai timing matters a lot, raat 9-11 best hai.", time: "20 mins ago", avatar: "⏰" },
            { username: "Game****rl", comment: "Small bet se start karo, phir gradually increase.", time: "25 mins ago", avatar: "🎮" },
            { username: "Spin****Raj", comment: "PG Slot ka bonus round fatafat aaya", time: "2 mins ago", avatar: "🎰" },
            { username: "Lucky****ya", comment: "Evolution Gaming stream mast chal rahi thi", time: "3 mins ago", avatar: "♣️" },
            { username: "Reel****tar", comment: "Jili ke slots mein back to back wild mila 🔥", time: "4 mins ago", avatar: "🤑" },
            { username: "Baccarat****ji", comment: "Evolution Baccarat ne kal raat paisa double kar diya", time: "5 mins ago", avatar: "🃏" },
            { username: "Game****Ver", comment: "Fishing Yilufa mein bada bonus fish mila 😍", time: "6 mins ago", avatar: "🐟" },
            { username: "Munni****Baaz", comment: "Fastspin slots full speed mein chal rahe hain", time: "7 mins ago", avatar: "⚡" },
            { username: "Desi****Patel", comment: "Evolution Gaming ka thrill alag hi level ka hai", time: "8 mins ago", avatar: "🎴" },
            { username: "Rocket****ram", comment: "Crazy Time ka 10x multiplier dekh ke aankh phadak gayi 😂", time: "9 mins ago", avatar: "🚀" },
            { username: "Neha****Queen", comment: "BNG slots mein wilds line ban gayi thi", time: "10 mins ago", avatar: "👸" },
            { username: "Chintu****Win", comment: "Fish Hunter mein gold cannon ka kamaal dekha", time: "11 mins ago", avatar: "🔫" },

            { username: "King****Don", comment: "Live Roulette ne toh life bana di bhai", time: "12 mins ago", avatar: "🎯" },
            { username: "Tota****Bhai", comment: "PG Slots ka Fortune Tiger hit hai is week", time: "13 mins ago", avatar: "🐯" },
            { username: "Fast****Girl", comment: "Dinosaur Tycoon mein mast boss fight hua", time: "14 mins ago", avatar: "🦖" },
            { username: "Ludo****OP", comment: "Cash or Crash mein risky tha, par maza aaya", time: "15 mins ago", avatar: "🪂" },
            { username: "Spin****Didi", comment: "Treasure Bowl se treasure hi nikal gaya 😄", time: "16 mins ago", avatar: "💰" },
            { username: "Tiger****Maa", comment: "Dragon Tiger mein dragon streak chalu tha", time: "17 mins ago", avatar: "🐉" },
            { username: "Kismat****Boy", comment: "Monopoly Live ka Chance round full OP tha", time: "18 mins ago", avatar: "🏦" },
            { username: "Reel****Rani", comment: "PG Slot Fortune Rabbit ka bonus banger", time: "19 mins ago", avatar: "🐰" },
            { username: "Munna****Spin", comment: "Fishing ka laser cannon toh sab ud gaya", time: "20 mins ago", avatar: "💥" },
            { username: "Deal****King", comment: "Deal or No Deal mein banker barbaad ho gaya 😂", time: "21 mins ago", avatar: "💼" },

            { username: "Bet****Veer", comment: "Ganesha Fortune ka win ratio kaafi accha chal raha hai", time: "22 mins ago", avatar: "🃏" },
            { username: "Fish****Fan", comment: "Ocean King ne 200x diya bro", time: "23 mins ago", avatar: "🌊" },
            { username: "Lucky****Star", comment: "Jili ka Crazy Seven kaafi smooth chal raha hai", time: "24 mins ago", avatar: "⭐" },
            { username: "Patakha****Ji", comment: "Lightning Roulette mein 100x mila aaj", time: "25 mins ago", avatar: "⚡" },
            { username: "Dilli****Lad", comment: "Fastspin slots are totally underrated", time: "26 mins ago", avatar: "🎲" },
            { username: "Drama****Dee", comment: "Baccarat ka banker streak next level tha", time: "27 mins ago", avatar: "📈" },
            { username: "Lover****999", comment: "Slots ke graphics full Bollywood vibes de rahe hain", time: "28 mins ago", avatar: "🎬" },
            { username: "Jhakas****OP", comment: "Fishing Yilufa full paisa vasool game hai", time: "29 mins ago", avatar: "🎣" },
            { username: "Gamer****Toh", comment: "Crazy Time ke results unpredictable rehte hain", time: "30 mins ago", avatar: "🎡" },
            { username: "Naari****Power", comment: "Aaj girls bhi top leaderboard mein hain", time: "31 mins ago", avatar: "💃" },

            { username: "Andar****Pro", comment: "Fortune Gems ke liye time fix kar liya ab", time: "32 mins ago", avatar: "🕒" },
            { username: "OP****Dhamaka", comment: "Fish Catch mein golden bomb mila finally", time: "33 mins ago", avatar: "💣" },
            { username: "Reel****Sultan", comment: "PG Slots ne ek aur mega win diya", time: "34 mins ago", avatar: "🏆" },
            { username: "Toofan****Boy", comment: "Fastspin reels are full thunder mode", time: "35 mins ago", avatar: "🌪️" },
            { username: "Spin****Lover", comment: "Jili Lucky Ball ka round dekh ke maza aa gaya", time: "36 mins ago", avatar: "🎱" },
            { username: "Mast****Babu", comment: "Dealer ka luck match karta hai kya?", time: "37 mins ago", avatar: "🤔" },
            { username: "Bano****Raja", comment: "Evolution ka tension next level hai 😬", time: "38 mins ago", avatar: "🃏" },
            { username: "Fish****Mitra", comment: "Fish Hunter mein cannon upgrade ke baad OP ho gaya", time: "39 mins ago", avatar: "🔫" },
            { username: "Aish****Launda", comment: "Evolution Live Games ka vibe hi alag hai", time: "40 mins ago", avatar: "🎥" },
            { username: "Shanti****Patni", comment: "Crazy Time stream dekh ke betting sikhi", time: "41 mins ago", avatar: "📺" },

            { username: "Desi****Spin", comment: "Jili ka Golden Empire slot sahi chal raha hai", time: "42 mins ago", avatar: "👑" },
            { username: "Game****Kaka", comment: "Fish Battle Royale aaj full intense tha", time: "43 mins ago", avatar: "🔥" },
            { username: "Spin****Guru", comment: "PG Slot mein full jackpot laga aaj", time: "44 mins ago", avatar: "💸" },
            { username: "Rajni****Power", comment: "Live Blackjack stream kaafi informative thi", time: "45 mins ago", avatar: "♠️" },
            { username: "Toofan****Di", comment: "Slots mein 5x combo bana diya accidentally", time: "46 mins ago", avatar: "💥" },
            { username: "Tez****Chhora", comment: "Fastspin reels toh lightning se bhi tez hain", time: "47 mins ago", avatar: "⚡" },
            { username: "Item****Queen", comment: "Treasure Hunter ne aaj bhi line banayi hai!", time: "48 mins ago", avatar: "🏹" },
            { username: "Udaan****Girl", comment: "Fishing Yilufa ka dragon fish epic tha", time: "49 mins ago", avatar: "🐉" },
            { username: "Ladka****OP", comment: "Evolution Live ka UI bhi smooth lag raha hai", time: "50 mins ago", avatar: "🖥️" },
            { username: "Choti****Didi", comment: "Crazy Time wheel ne aaj fire de diya 🔥", time: "51 mins ago", avatar: "🎡" },

            { username: "Spin****Wale", comment: "PG Slot Tiger Warrior ka round lucky gaya", time: "52 mins ago", avatar: "🐅" },
            { username: "Bhola****Bhai", comment: "Dealer ki smile se hi pata chal gaya jeetne wale ka 😄", time: "53 mins ago", avatar: "😎" },
            { username: "Masti****Dost", comment: "Fastspin slot speed OP hai", time: "54 mins ago", avatar: "🏁" },
            { username: "Desi****Diva", comment: "Jili slots are underrated gems", time: "55 mins ago", avatar: "💎" },
            { username: "Patel****King", comment: "Fish game ka cannon blast sabse mazedaar part hai", time: "56 mins ago", avatar: "🔫" },
            { username: "Madam****Ji", comment: "PG game stream kal ka top trending tha", time: "57 mins ago", avatar: "🎥" },
            { username: "Munna****Fish", comment: "Laser cannon ka blast dekha? Full screen wipeout", time: "58 mins ago", avatar: "🚨" },
            { username: "Quick****OP", comment: "Live Blackjack ka pace sahi lagta hai", time: "59 mins ago", avatar: "⏱️" },
            { username: "Raja****999", comment: "Fortune Ox slot mein bada win aaya finally", time: "60 mins ago", avatar: "🐂" },
            { username: "Bebo****Lover", comment: "Streamer ki commentary aur bonus dono OP", time: "61 mins ago", avatar: "🎤" }
        ];
        
        this.currentTopicIndex = 0;
        this.renderCommentSection();
        
        // Rotate topics every 30 seconds
        setInterval(() => {
            this.rotateCommentTopic();
        }, 30000);
    }
    
    renderCommentSection() {
        const topicTitle = document.getElementById('topicTitle');
        const commentsContainer = document.getElementById('commentsContainer');
        
        if (!topicTitle || !commentsContainer) return;
        
        topicTitle.textContent = this.topics[this.currentTopicIndex];
        
        commentsContainer.innerHTML = '';
        
        // Randomly shuffle comments to show different ones each time
        const shuffledComments = [...this.comments].sort(() => Math.random() - 0.5);
        
        // Show only 6 random comments to keep it manageable
        const commentsToShow = shuffledComments.slice(0, 6);
        
        commentsToShow.forEach((comment, index) => {
            setTimeout(() => {
                const commentItem = document.createElement('div');
                commentItem.className = 'comment-item';
                
                commentItem.innerHTML = `
                    <div class="comment-avatar">${comment.avatar}</div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-username">${comment.username}</span>
                            <span class="comment-time">${comment.time}</span>
                        </div>
                        <div class="comment-text">${comment.comment}</div>
                    </div>
                `;
                
                commentsContainer.appendChild(commentItem);
            }, index * 500);
        });
    }
    
    rotateCommentTopic() {
        this.currentTopicIndex = (this.currentTopicIndex + 1) % this.topics.length;
        this.renderCommentSection();
    }
    
    // Module 3: LiveInteraction
    initializeLiveInteraction() {
        this.liveFeed = [
            { type: "comment", username: "Sweet****een", message: "Kya mast spin tha yaar", avatar: "👸" },
            { type: "gift", username: "Munna****ing", message: "Gift diya: Rocket x1", avatar: "👑", giftName: "Rocket", giftIcon: "🚀" },
            { type: "comment", username: "Raju****OP", message: "Streamer full fire mode mein hai", avatar: "🔥" },
            { type: "gift", username: "Lucky****ha", message: "Gift diya: Golden Coin x10", avatar: "💰", giftName: "Golden Coin", giftIcon: "🪙" },
            { type: "comment", username: "Game****ter", message: "Bhai ye toh jackpot wala session lag raha hai", avatar: "🎯" },
            { type: "gift", username: "Diamo****een", message: "Gift diya: Diamond x5", avatar: "💎", giftName: "Diamond", giftIcon: "💎" },
            { type: "comment", username: "Winn****cle", message: "Sabko lucky vibes mil rahe hain aaj", avatar: "🍀" },
            { type: "gift", username: "Big****oss", message: "Gift diya: Crown x1", avatar: "👑", giftName: "Crown", giftIcon: "👑" },
            { type: "comment", username: "Spin****iya", message: "PG Slots mein aaj full paisa vasool", avatar: "🎰" },
            { type: "comment", username: "Jili****een", message: "Golden Empire slot ka bonus round dekhna banta hai", avatar: "👑" },
            { type: "comment", username: "Fast****der", message: "3 wild symbols back-to-back mila bhai 🔥", avatar: "🏎️" },
            { type: "comment", username: "Sona****aRe", message: "Treasure Hunter ne toh dil khush kar diya", avatar: "💰" },
            { type: "comment", username: "Chak****pin", message: "BNG slots mein aj ka spin OP gaya", avatar: "🗡️" },
            { type: "comment", username: "Mega****Raj", message: "Jili ke Lucky Ball ne mega win diya", avatar: "💥" },
            { type: "comment", username: "Turb****ter", message: "Fastspin ke reels toh jet speed pe the bhai", avatar: "🚀" },
            { type: "comment", username: "Lali****ots", message: "PG Slots ka Fortune Mouse ka animation cute hai 😍", avatar: "🐭" },
            { type: "comment", username: "Bitt****ner", message: "Wild Wild Riches se 100x aaya re baba", avatar: "🤑" },
            { type: "comment", username: "Reel****g98", message: "Spin start kiya aur scatter symbols aa gaye pehle hi", avatar: "🎲" },
            { type: "comment", username: "Fish****nia", message: "Dinosaur Tycoon mein bada shark pakda 😂", avatar: "🦈" },
            { type: "comment", username: "Nish****een", message: "Fishing Yilufa ne mujhe lucky banaya aaj", avatar: "🎣" },
            { type: "comment", username: "Rohi****Big", message: "Fish Catch mein Dragon fish mila finally", avatar: "🐉" },
            { type: "comment", username: "Ocea****ter", message: "Ocean King ka final boss easy gaya bhaiyo", avatar: "🌊" },
            { type: "comment", username: "Sona****aba", message: "Jili Fishing mein gold fish pakad ke mazza aa gaya", avatar: "🐠" },
            { type: "comment", username: "Trig****hOP", message: "Fish Hunter ka cannon upgrade OP tha 🔥", avatar: "🔫" },
            { type: "comment", username: "Luck****ish", message: "Crazy fishing session raha yaar", avatar: "🎯" },
            { type: "comment", username: "Deep****een", message: "Fishing Yilufa se 200x mila OMG", avatar: "👸" },
            { type: "comment", username: "Bhai****non", message: "Laser cannon activate kiya aur pura screen clean 😂", avatar: "💥" },
            { type: "comment", username: "Kill****tch", message: "Fish Battle Royale hi chal raha tha lagta hai 😅", avatar: "⚔️" },
            { type: "comment", username: "Bacc****oss", message: "Evolution Baccarat ke dealer full chill mein 😎", avatar: "🃏" },
            { type: "comment", username: "Teen****amp", message: "Lucky Neko stream OP chal rahi hai", avatar: "♠️" },
            { type: "comment", username: "Live****een", message: "Crazy Time ka wheel full rotate gaya re", avatar: "🎡" },
            { type: "comment", username: "Anda****rGG", message: "Cash or Crash ka moment tha mast", avatar: "🚁" },
            { type: "comment", username: "Roul****aja", message: "Lightning Roulette ne aaj 100x diya", avatar: "⚡" },
            { type: "comment", username: "Drag****rOP", message: "Tiger win streak dekh ke shock lag gaya", avatar: "🐯" },
            { type: "comment", username: "Udaa****ers", message: "Monopoly Live ka Chance card banger tha", avatar: "🎲" },
            { type: "comment", username: "Nikk****Big", message: "Deal or No Deal mein banker OP nikal gaya", avatar: "💼" },
            { type: "comment", username: "Boll****rat", message: "Lagta hai aaj dealer bhi Bollywood fan hai 😂", avatar: "🎬" },
            { type: "comment", username: "Game****Fan", message: "Evolution ke live games full paisa vasool lagte hain", avatar: "📺" },
            { type: "comment", username: "Mast****adi", message: "Aaj toh full entertainment mil raha hai", avatar: "😎" },
            { type: "comment", username: "Desi****ner", message: "Sab game mein loot machi hai bhai log", avatar: "🥇" },
            { type: "comment", username: "Turb****ori", message: "Tapori style mein spin ghooma re", avatar: "🌀" },
            { type: "comment", username: "Naar****kti", message: "Girls bhi top wins le rahi hain", avatar: "💃" },
            { type: "comment", username: "Baaz****rns", message: "Haar ke jeetne wale ko hi Baazigar kehte hain 💪", avatar: "🎭" },
            { type: "comment", username: "Emot****har", message: "Mere coins chale gaye 🥲", avatar: "😭" },
            { type: "comment", username: "JaiM****aDi", message: "Spin se pehle thoda bhakti zaruri hai 🙏", avatar: "🛕" },
            { type: "comment", username: "UPKa****nda", message: "Luck ho toh aisa UP style mein", avatar: "🎯" },
            { type: "comment", username: "Full****eOP", message: "Streamer ki commentary OP 😂", avatar: "🎤" },
            { type: "comment", username: "Dill****Don", message: "Delhi boys always win re", avatar: "🧢" },

        ];
        
        this.liveFeedIndex = 0;
        this.startLiveFeed();
    }
    
    startLiveFeed() {
        const liveFeedContainer = document.getElementById('liveFeed');
        if (!liveFeedContainer) return;
        
        // Add initial messages
        this.liveFeed.slice(0, 4).forEach((message, index) => {
            setTimeout(() => {
                this.addLiveMessage(message);
            }, index * 1000);
        });
        
        // Continue adding messages every 3-5 seconds
        setInterval(() => {
            if (this.liveFeedIndex < this.liveFeed.length) {
                this.addLiveMessage(this.liveFeed[this.liveFeedIndex]);
                this.liveFeedIndex++;
                
                if (this.liveFeedIndex >= this.liveFeed.length) {
                    this.liveFeedIndex = 0; // Reset to loop
                }
            }
        }, Math.random() * 2000 + 3000); // 3-5 seconds
    }
    
    addLiveMessage(messageData) {
        const liveFeedContainer = document.getElementById('liveFeed');
        if (!liveFeedContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `live-message ${messageData.type}`;
        
        const giftIcon = messageData.giftIcon ? `<span class="gift-icon">${messageData.giftIcon}</span>` : '';
        
        messageElement.innerHTML = `
            <div class="live-avatar">${messageData.avatar}</div>
            <div class="live-content">
                <div class="live-username">${messageData.username}</div>
                <div class="live-text">${messageData.message}${giftIcon}</div>
            </div>
        `;
        
        liveFeedContainer.appendChild(messageElement);
        
        // Remove old messages if too many
        const messages = liveFeedContainer.children;
        if (messages.length > 8) {
            liveFeedContainer.removeChild(messages[0]);
        }
        
        // Auto scroll to bottom
        liveFeedContainer.scrollTop = liveFeedContainer.scrollHeight;
    }
    
    // Module 4: JackpotCountdown
    initializeJackpotCountdown() {
        // Daily prediction times in GMT+5:30 (IST): 2:00 AM, 10:00 AM, 5:00 PM
        this.predictionTimes = [
            { hour: 2, minute: 0 },  // 2:00 AM
            { hour: 10, minute: 0 }, // 10:00 AM
            { hour: 17, minute: 0 }  // 5:00 PM
        ];
        
        this.jackpotMessages = [
            "Aaj 9:30PM se 10:00PM tak Dragon Tiger mein bonus rate double hoga!",
            "System prediction: Next 30 minutes mein BNG SLot jackpot hit hone wala hai!",
            "Alert! Fishing Gamed mein agle 30 min lucky streak chalega!",
            "Mega prediction: Crazy Time bonus wheel aaj lucky hai!",
            "Lucky prediction: PG Slots mein agle 30 min mega wins aa rahe hain!",
            "Special alert: Jili games mein bonus rounds active hone wale hain!",
            "Hot prediction: Live casino mein multipliers high chal rahe hain!"
        ];
        
        this.currentMessageIndex = Math.floor(Math.random() * this.jackpotMessages.length);
        this.checkPredictionStatus();
        this.startCountdown();
    }
    
    checkPredictionStatus() {
        const now = new Date();
        const istTime = this.getISTTime(now);
        const currentPrediction = this.getCurrentActivePrediction(istTime);
        
        if (currentPrediction) {
            // Active prediction session - show CTA button and count down remaining time
            this.targetTime = currentPrediction.endTime;
            this.isActivePrediction = true;
            this.showActivePredictionCTA();
        } else {
            // No active prediction, show next prediction time and count down to it
            this.isActivePrediction = false;
            this.targetTime = this.getNextPredictionTime(istTime);
            this.showNextPredictionCTA();
        }
    }
    
    getISTTime(date) {
        const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
        return new Date(utcTime + (5.5 * 60 * 60 * 1000));
    }
    
    getCurrentActivePrediction(istTime) {
        for (let prediction of this.predictionTimes) {
            const predictionStart = new Date(istTime);
            predictionStart.setHours(prediction.hour, prediction.minute, 0, 0);
            
            const predictionEnd = new Date(predictionStart.getTime() + (30 * 60 * 1000)); // 30 minutes duration
            
            if (istTime >= predictionStart && istTime <= predictionEnd) {
                return {
                    startTime: predictionStart.getTime(),
                    endTime: predictionEnd.getTime()
                };
            }
        }
        return null;
    }
    
    getNextPredictionTime(istTime) {
        let nextPrediction = null;
        const today = new Date(istTime);
        
        // Check remaining predictions today
        for (let prediction of this.predictionTimes) {
            const predictionTime = new Date(today);
            predictionTime.setHours(prediction.hour, prediction.minute, 0, 0);
            
            if (predictionTime > istTime) {
                nextPrediction = predictionTime;
                break;
            }
        }
        
        // If no more predictions today, get first prediction tomorrow
        if (!nextPrediction) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(this.predictionTimes[0].hour, this.predictionTimes[0].minute, 0, 0);
            nextPrediction = tomorrow;
        }
        
        return nextPrediction.getTime();
    }
    
    updateJackpotMessage() {
        const messageElement = document.getElementById('jackpotMessage');
        if (messageElement && this.isActivePrediction) {
            messageElement.textContent = this.jackpotMessages[this.currentMessageIndex];
        }
    }
    
    showNextPredictionCTA() {
        const messageElement = document.getElementById('jackpotMessage');
        
        if (messageElement) {
            // Get next prediction time to display
            const now = new Date();
            const istTime = this.getISTTime(now);
            const nextPredictionTime = this.getNextPredictionDisplayTime(istTime);
            
            messageElement.innerHTML = `
                <div class="prediction-cta-container">
                    <p class="next-prediction-text">Prediction will be ready on ${nextPredictionTime} GMT+5:30</p>
                </div>
            `;
        }
    }
    
    getNextPredictionDisplayTime(istTime) {
        const timeLabels = ['2:00 AM', '10:00 AM', '5:00 PM'];
        
        for (let i = 0; i < this.predictionTimes.length; i++) {
            const prediction = this.predictionTimes[i];
            const predictionTime = new Date(istTime);
            predictionTime.setHours(prediction.hour, prediction.minute, 0, 0);
            
            if (predictionTime > istTime) {
                return timeLabels[i];
            }
        }
        
        // If no more predictions today, return first prediction tomorrow
        return timeLabels[0] + ' (Tomorrow)';
    }
    
    showActivePredictionCTA() {
        const messageElement = document.getElementById('jackpotMessage');
        
        if (messageElement) {
            messageElement.innerHTML = `
                <div class="prediction-cta-container">
                    <p class="next-prediction-text">🔥 Live prediction session active! 🔥</p>
                    <a href="https://www.luckytaj.com/en-in/slot" target="_blank" class="prediction-cta-btn">
                        <span class="cta-icon">🎰</span>
                        <span class="cta-main-text">Play Now & Win Big!</span>
                        <span class="cta-sub-text">Prediction is LIVE - Don't miss it!</span>
                    </a>
                </div>
            `;
        }
    }
    
    startCountdown() {
        this.countdownInterval = setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }
    
    updateCountdown() {
        const now = Date.now();
        const timeLeft = this.targetTime - now;
        
        if (timeLeft <= 0) {
            // Time's up - check what happens next
            if (this.isActivePrediction) {
                // Prediction session ended, show next prediction time
                this.isActivePrediction = false;
                this.targetTime = this.getNextPredictionTime(this.getISTTime(new Date()));
                this.showNextPredictionCTA();
            } else {
                // Countdown to next prediction reached, start prediction session
                this.isActivePrediction = true;
                this.targetTime = Date.now() + (30 * 60 * 1000); // 30 minutes from now
                this.showActivePredictionCTA();
                this.updateJackpotMessage();
            }
            return;
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
    }

}

document.addEventListener('DOMContentLoaded', () => {
    window.dailyGames = new DailyTrendingGames();
});