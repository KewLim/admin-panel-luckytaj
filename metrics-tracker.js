/**
 * User Interaction Metrics Tracker
 * This script should be included in the main landing page to track user interactions
 */

class MetricsTracker {
    constructor() {
        this.sessionId = this.getOrCreateSessionId();
        this.userId = this.getUserId(); // If user is logged in
        this.baseURL = window.location.origin;
        this.currentTip = null;
        this.startTime = Date.now();
        this.isTracking = true;
        
        // Initialize tracking
        this.init();
    }
    
    init() {
        // Track page load
        this.trackPageView();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Track time spent (send every 30 seconds or on page unload)
        this.setupTimeTracking();
        
        console.log('MetricsTracker initialized', { sessionId: this.sessionId });
    }
    
    getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem('mt_session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('mt_session_id', sessionId);
        }
        return sessionId;
    }
    
    getUserId() {
        // Check if user is logged in (adapt this to your authentication system)
        const userToken = localStorage.getItem('userToken');
        if (userToken) {
            try {
                const payload = JSON.parse(atob(userToken.split('.')[1]));
                return payload.userId || payload.id;
            } catch (e) {
                return null;
            }
        }
        return null;
    }
    
    generateTipId() {
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `tip_${date}_${random}`;
    }
    
    async trackPageView() {
        try {
            this.currentTip = this.generateTipId();
            
            const response = await fetch(`${this.baseURL}/api/metrics/track/view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tipId: this.currentTip,
                    sessionId: this.sessionId,
                    userId: this.userId,
                    pageUrl: window.location.href
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.currentTip = result.tipId;
                console.log('Page view tracked:', this.currentTip);
            }
        } catch (error) {
            console.error('Error tracking page view:', error);
        }
    }
    
    async trackClick(clickUrl, clickTarget = null) {
        if (!this.currentTip || !this.isTracking) return;
        
        try {
            await fetch(`${this.baseURL}/api/metrics/track/click`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tipId: this.currentTip,
                    sessionId: this.sessionId,
                    userId: this.userId,
                    clickUrl,
                    clickTarget,
                    pageUrl: window.location.href
                })
            });
            
            console.log('Click tracked:', { clickUrl, clickTarget });
        } catch (error) {
            console.error('Error tracking click:', error);
        }
    }
    
    async trackTimeSpent(timeSpentMs) {
        if (!this.currentTip || !this.isTracking || timeSpentMs < 1000) return; // Don't track less than 1 second
        
        try {
            await fetch(`${this.baseURL}/api/metrics/track/time`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tipId: this.currentTip,
                    sessionId: this.sessionId,
                    userId: this.userId,
                    timeSpentMs,
                    pageUrl: window.location.href
                })
            });
            
            console.log('Time spent tracked:', timeSpentMs + 'ms');
        } catch (error) {
            console.error('Error tracking time spent:', error);
        }
    }
    
    setupEventListeners() {
        // Track clicks on links and buttons
        document.addEventListener('click', (event) => {
            const target = event.target.closest('a, button, [data-track-click]');
            if (target) {
                const clickUrl = target.href || target.getAttribute('data-click-url') || window.location.href;
                const clickTarget = target.getAttribute('data-track-click') || target.textContent.trim().substring(0, 50);
                this.trackClick(clickUrl, clickTarget);
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.tagName === 'FORM') {
                const formAction = form.action || window.location.href;
                this.trackClick(formAction, 'Form submission');
            }
        });
        
        // Track when user leaves the page
        window.addEventListener('beforeunload', () => {
            this.sendTimeSpent();
        });
        
        // Track when page becomes visible/hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.sendTimeSpent();
            } else {
                this.startTime = Date.now();
            }
        });
        
        // Track scroll depth (optional - can be useful for engagement metrics)
        let maxScrollDepth = 0;
        window.addEventListener('scroll', () => {
            const scrollDepth = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                // You could track scroll milestones here (25%, 50%, 75%, 100%)
                if (scrollDepth >= 75 && maxScrollDepth < 75) {
                    this.trackClick(window.location.href, 'Scroll 75%');
                }
            }
        });
    }
    
    setupTimeTracking() {
        // Send time spent every 30 seconds
        setInterval(() => {
            this.sendTimeSpent();
        }, 30000);
    }
    
    sendTimeSpent() {
        if (!this.isTracking) return;
        
        const timeSpent = Date.now() - this.startTime;
        if (timeSpent > 0) {
            this.trackTimeSpent(timeSpent);
            this.startTime = Date.now(); // Reset timer
        }
    }
    
    // Public method to manually track specific events
    trackEvent(eventName, eventData = {}) {
        this.trackClick(window.location.href, `Event: ${eventName}`, eventData);
    }
    
    // Public method to stop tracking (for privacy compliance)
    stopTracking() {
        this.isTracking = false;
        console.log('MetricsTracker stopped');
    }
    
    // Public method to resume tracking
    startTracking() {
        this.isTracking = true;
        this.startTime = Date.now();
        console.log('MetricsTracker resumed');
    }
}

// Initialize tracker when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.metricsTracker = new MetricsTracker();
    });
} else {
    window.metricsTracker = new MetricsTracker();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetricsTracker;
}