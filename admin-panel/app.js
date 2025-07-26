class AdminPanel {
    constructor() {
        this.token = localStorage.getItem('adminToken');
        this.baseURL = window.location.origin;
        this.alternativePorts = [3003, 3000, 3002, 8000, 8080, 5000]; // Added 3003 as first alternative
        this.currentPortIndex = 0;
        this.metricsInterval = null;
        this.charts = {};
        this.retryDelay = 1000; // Start with 1 second delay
        this.maxRetries = 3;
        this.init();
    }

    async init() {
        // Check if user is already logged in
        if (this.token) {
            const isValid = await this.verifyToken();
            if (isValid) {
                this.showDashboard();
                return;
            } else {
                localStorage.removeItem('adminToken');
                this.token = null;
            }
        }
        
        this.showLogin();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.clearLoginErrors();
            this.handleLogin();
        });
        
        // Clear errors when typing in email/password fields
        document.getElementById('email').addEventListener('input', () => {
            this.clearLoginErrors();
        });
        
        document.getElementById('password').addEventListener('input', () => {
            this.clearLoginErrors();
        });
    }

    setupDashboardEventListeners() {
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('.tab-btn');
                this.switchTab(target.dataset.tab);
            });
        });

        // Video tab switching in modal
        document.querySelectorAll('.video-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchVideoTab(e.target.dataset.type);
            });
        });

        // Form submissions
        document.getElementById('bannerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBannerUpload();
        });

        document.getElementById('commentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCommentSubmit();
        });

        document.getElementById('videoUrlForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleVideoUrlSubmit();
        });

        document.getElementById('videoUploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleVideoUpload();
        });

        document.getElementById('winnerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleWinnerSubmit();
        });

        document.getElementById('jackpotForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleJackpotSubmit();
        });

        document.getElementById('gameForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleGameSubmit();
        });
    }

    async verifyToken() {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async handleLogin(attempt = 0) {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        
        // Maximum attempts = 1 (original) + alternativePorts.length + 2 retries
        const maxTotalAttempts = 1 + this.alternativePorts.length + 2;
        
        if (attempt >= maxTotalAttempts) {
            errorDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-exclamation-triangle"></i>
                    Maximum retry attempts exceeded. Please wait and try again later.
                </div>
            `;
            errorDiv.style.display = 'block';
            this.hideLoading();
            return;
        }
        
        // Determine which URL to try
        let loginURL = this.baseURL;
        if (attempt > 0 && attempt <= this.alternativePorts.length) {
            const port = this.alternativePorts[attempt - 1];
            loginURL = `http://localhost:${port}`;
        }

        try {
            if (attempt === 0) this.showLoading();
            
            const response = await fetch(`${loginURL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();

            if (response.ok) {
                // Success - login worked
                this.token = data.token;
                localStorage.setItem('adminToken', this.token);
                
                // Update baseURL if we used an alternative port
                if (attempt > 0) {
                    this.baseURL = loginURL;
                    console.log(`Successfully logged in using port ${loginURL}`);
                }
                
                this.hideLoading();
                this.showDashboard();
                this.loadAdminInfo(data.admin);
                return;
            }
            
            // Handle 429 rate limiting
            if (response.status === 429) {
                if (attempt < this.alternativePorts.length) {
                    // Try alternative port immediately
                    const nextPort = this.alternativePorts[attempt];
                    console.log(`Port ${loginURL.split(':')[2] || 'default'} rate limited, trying port ${nextPort}...`);
                    errorDiv.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-exchange-alt"></i>
                            Rate limited. Trying port ${nextPort}...
                        </div>
                    `;
                    errorDiv.style.display = 'block';
                    
                    // Try next port after brief delay
                    setTimeout(() => {
                        this.handleLogin(attempt + 1);
                    }, 300);
                    return;
                } else {
                    // All ports tried and rate limited
                    errorDiv.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-exclamation-triangle"></i>
                            All servers are rate limited. Please wait 5 minutes and try again.
                        </div>
                    `;
                    errorDiv.style.display = 'block';
                    this.hideLoading();
                    return;
                }
            } else {
                // Other error (invalid credentials, etc.)
                errorDiv.textContent = data.error || 'Login failed';
                errorDiv.style.display = 'block';
                this.hideLoading();
                return;
            }
        } catch (error) {
            console.error('Login network error:', error);
            
            // Network error - try alternative port if available
            if (attempt < this.alternativePorts.length) {
                const nextPort = this.alternativePorts[attempt];
                console.log(`Network error on ${loginURL}, trying port ${nextPort}...`);
                errorDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-wifi"></i>
                        Connection failed. Trying port ${nextPort}...
                    </div>
                `;
                errorDiv.style.display = 'block';
                
                setTimeout(() => {
                    this.handleLogin(attempt + 1);
                }, 500);
                return;
            }
            
            errorDiv.textContent = 'Network error. Please check your connection and try again.';
            errorDiv.style.display = 'block';
            this.hideLoading();
        }
    }

    handleLogout() {
        localStorage.removeItem('adminToken');
        this.token = null;
        this.stopRealTimeUpdates();
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('loginError').style.display = 'none';
        document.getElementById('loginForm').reset();
    }

    async showDashboard() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        
        // Setup dashboard event listeners after elements are visible
        this.setupDashboardEventListeners();
        
        // Load admin info
        const adminInfo = await this.getAdminInfo();
        if (adminInfo) {
            this.loadAdminInfo(adminInfo.admin);
        }

        // Load initial data
        await this.loadMetrics();
        await this.loadComments();
        await this.loadVideos();
        
        // Start real-time metrics updates
        this.startRealTimeUpdates();
    }

    async getAdminInfo() {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            return response.ok ? await response.json() : null;
        } catch (error) {
            return null;
        }
    }

    loadAdminInfo(admin) {
        document.getElementById('adminEmail').textContent = admin.email;
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load data for the selected tab
        switch(tabName) {
            case 'metrics':
                this.loadMetrics();
                break;
            case 'comments':
                this.loadComments();
                break;
            case 'videos':
                this.loadVideos();
                break;
            case 'games':
                this.loadGamesData();
                break;
            case 'winners':
                this.loadWinners();
                break;
            case 'jackpot':
                this.loadJackpotData();
                break;
        }
    }

    switchVideoTab(tabType) {
        // Update tab buttons
        document.querySelectorAll('.video-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${tabType}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.video-form').forEach(form => {
            form.classList.remove('active');
        });
        
        if (tabType === 'youtube') {
            document.getElementById('videoUrlForm').classList.add('active');
        } else {
            document.getElementById('videoUploadForm').classList.add('active');
        }
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    // Real-time updates management
    startRealTimeUpdates() {
        // Update metrics every 30 seconds
        this.metricsInterval = setInterval(() => {
            if (document.getElementById('metrics').classList.contains('active')) {
                this.loadMetrics(true); // silent loading
            }
        }, 30000);
    }
    
    stopRealTimeUpdates() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }
    }
    
    clearLoginErrors() {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
        }
    }
    
    
    updateRealTimeIndicator(isRealTime) {
        const indicator = document.getElementById('realTimeIndicator');
        if (!indicator) return;
        
        if (isRealTime) {
            indicator.innerHTML = `
                <div style="width: 8px; height: 8px; background: #28a745; border-radius: 50%; animation: pulse 2s infinite;"></div>
                Live Data (Port 3003)
            `;
            indicator.style.color = '#28a745';
        } else {
            indicator.innerHTML = `
                <div style="width: 8px; height: 8px; background: #ffc107; border-radius: 50%; animation: pulse 2s infinite;"></div>
                Mock Data (Simulated)
            `;
            indicator.style.color = '#ffc107';
        }
    }

    // User Interaction Metrics Management
    async loadMetrics(silent = false) {
        try {
            if (!silent) this.showLoading();
            
            const [overview, devices, tips, trend] = await Promise.all([
                this.fetchMetricsOverview(),
                this.fetchDeviceDistribution(),
                this.fetchTipPerformance(),
                this.fetchMetricsTrend()
            ]);
            
            this.renderRealMetrics(overview, devices, tips, trend);
        } catch (error) {
            console.error('Error loading metrics:', error);
            // Fallback to mock data if API fails
            this.renderMockMetrics();
        } finally {
            if (!silent) this.hideLoading();
        }
    }

    async fetchMetricsOverview(days = 1) {
        try {
            // Try to fetch real-time data from port 3003
            const frontendResponse = await fetch(`http://localhost:3003/api/metrics/overview?days=${days}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (frontendResponse.ok) {
                return await frontendResponse.json();
            }
        } catch (error) {
            console.log('Frontend API not available, using admin API');
        }
        
        // Fallback to admin API
        const response = await fetch(`${this.baseURL}/api/metrics/overview?days=${days}`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return response.ok ? await response.json() : null;
    }

    async fetchDeviceDistribution(days = 1) {
        try {
            // Try to fetch real-time data from port 3003
            const frontendResponse = await fetch(`http://localhost:3003/api/metrics/devices?days=${days}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (frontendResponse.ok) {
                return await frontendResponse.json();
            }
        } catch (error) {
            console.log('Frontend API not available, using admin API');
        }
        
        // Fallback to admin API
        const response = await fetch(`${this.baseURL}/api/metrics/devices?days=${days}`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return response.ok ? await response.json() : null;
    }

    async fetchTipPerformance(days = 1) {
        try {
            // Try to fetch real-time data from port 3003
            const frontendResponse = await fetch(`http://localhost:3003/api/metrics/tips?days=${days}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (frontendResponse.ok) {
                return await frontendResponse.json();
            }
        } catch (error) {
            console.log('Frontend API not available, using admin API');
        }
        
        // Fallback to admin API
        const response = await fetch(`${this.baseURL}/api/metrics/tips?days=${days}`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return response.ok ? await response.json() : null;
    }

    async fetchMetricsTrend(days = 7) {
        try {
            // Try to fetch real-time data from port 3003
            const frontendResponse = await fetch(`http://localhost:3003/api/metrics/trend?days=${days}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (frontendResponse.ok) {
                return await frontendResponse.json();
            }
        } catch (error) {
            console.log('Frontend API not available, using admin API');
        }
        
        // Fallback to admin API
        const response = await fetch(`${this.baseURL}/api/metrics/trend?days=${days}`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return response.ok ? await response.json() : null;
    }

    renderRealMetrics(overview, devices, tips, trend) {
        if (overview) {
            // Update overview cards with real data
            document.getElementById('totalViews').textContent = overview.totalViews.value.toLocaleString();
            document.getElementById('uniqueVisitors').textContent = overview.uniqueVisitors.value.toLocaleString();
            document.getElementById('clickThroughRate').textContent = overview.clickThroughRate.value + '%';
            document.getElementById('avgTimeOnPage').textContent = overview.avgTimeOnPage.value + 's';
            
            // Update change indicators
            document.getElementById('totalViewsChange').textContent = `${overview.totalViews.change >= 0 ? '+' : ''}${overview.totalViews.change}% from last 24h`;
            document.getElementById('uniqueVisitorsChange').textContent = `${overview.uniqueVisitors.change >= 0 ? '+' : ''}${overview.uniqueVisitors.change}% from last 24h`;
            document.getElementById('clickThroughRateChange').textContent = `${overview.clickThroughRate.change >= 0 ? '+' : ''}${overview.clickThroughRate.change}% from yesterday`;
            document.getElementById('avgTimeOnPageChange').textContent = `${overview.avgTimeOnPage.change >= 0 ? '+' : ''}${overview.avgTimeOnPage.change}% from yesterday`;
            
            // Update change colors
            this.updateChangeColors('totalViewsChange', overview.totalViews.change);
            this.updateChangeColors('uniqueVisitorsChange', overview.uniqueVisitors.change);
            this.updateChangeColors('clickThroughRateChange', overview.clickThroughRate.change);
            this.updateChangeColors('avgTimeOnPageChange', overview.avgTimeOnPage.change);
        }
        
        // Create charts with real or trend data
        this.createRealCharts(trend);
        
        if (devices) {
            // Update device distribution
            const mobile = devices.mobile || { percentage: 0 };
            const desktop = devices.desktop || { percentage: 0 };
            const tablet = devices.tablet || { percentage: 0 };
            
            const mobilePerc = parseFloat(mobile.percentage);
            const desktopPerc = parseFloat(desktop.percentage);
            
            document.getElementById('mobilePercentage').textContent = mobilePerc + '%';
            document.getElementById('desktopPercentage').textContent = desktopPerc + '%';
            document.querySelector('.device-fill.mobile').style.width = mobilePerc + '%';
            document.querySelector('.device-fill.desktop').style.width = desktopPerc + '%';
        }
        
        if (tips && tips.length > 0) {
            // Update tips performance table
            const tipsTableBody = document.getElementById('tipsTableBody');
            tipsTableBody.innerHTML = tips.map(tip => `
                <div class="tips-row">
                    <div class="col-tip">${tip.tipId}</div>
                    <div class="col-views">${tip.views.toLocaleString()}</div>
                    <div class="col-unique">${tip.uniqueVisitors || 'N/A'}</div>
                    <div class="col-ctr">${tip.ctr.toFixed(1)}%</div>
                    <div class="col-time">${tip.avgTimeSeconds || 0}s</div>
                </div>
            `).join('');
        } else {
            document.getElementById('tipsTableBody').innerHTML = '<div class="no-data">No tip data available yet</div>';
        }
    }

    updateChangeColors(elementId, change) {
        const element = document.getElementById(elementId);
        const changeValue = parseFloat(change);
        if (changeValue > 0) {
            element.style.color = '#28a745'; // Green for positive
        } else if (changeValue < 0) {
            element.style.color = '#dc3545'; // Red for negative
        } else {
            element.style.color = '#6c757d'; // Gray for neutral
        }
    }

    createRealCharts(trendData) {
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            elements: {
                point: { radius: 0 },
                line: { tension: 0.4 }
            }
        };

        // Use real trend data if available, otherwise use mock data
        let labels, viewsData, clicksData, avgTimeData;
        
        if (trendData && trendData.length > 0) {
            labels = trendData.map(d => d._id);
            viewsData = trendData.map(d => d.views || 0);
            clicksData = trendData.map(d => d.clicks || 0);
            avgTimeData = trendData.map(d => Math.round((d.avgTimeMs || 0) / 1000));
            
            // Calculate unique visitors approximation (views * 0.8)
            const visitorsData = viewsData.map(v => Math.round(v * 0.8));
            // Calculate CTR
            const ctrData = viewsData.map((v, i) => v > 0 ? ((clicksData[i] / v) * 100) : 0);
            
            this.createChart('viewsChart', viewsData, '#667eea');
            this.createChart('visitorsChart', visitorsData, '#764ba2');
            this.createChart('ctrChart', ctrData, '#28a745');
            this.createChart('timeChart', avgTimeData, '#ffc107');
        } else {
            // Fallback to sample data
            this.createMiniCharts();
        }
    }

    createChart(canvasId, data, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        this.charts[canvasId] = new Chart(canvas, {
            type: 'line',
            data: {
                labels: Array(data.length).fill(''),
                datasets: [{
                    data: data,
                    borderColor: color,
                    backgroundColor: color + '20',
                    fill: true,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                elements: {
                    point: { radius: 0 },
                    line: { tension: 0.4 }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    renderMockMetrics() {
        // Generate more realistic real-time mock data
        const now = new Date();
        const baseViews = 12000;
        const viewVariation = Math.floor(Math.random() * 1000) + 200;
        const totalViews = baseViews + viewVariation;
        const uniqueVisitors = Math.floor(totalViews * 0.67);
        const ctr = (2.8 + Math.random() * 0.8).toFixed(1);
        const timeOnPage = Math.floor(38 + Math.random() * 10);
        
        // Update overview cards with dynamic mock data
        document.getElementById('totalViews').textContent = totalViews.toLocaleString();
        document.getElementById('uniqueVisitors').textContent = uniqueVisitors.toLocaleString();
        document.getElementById('clickThroughRate').textContent = ctr + '%';
        document.getElementById('avgTimeOnPage').textContent = timeOnPage + 's';
        
        // Generate realistic change indicators
        const viewsChange = (Math.random() * 20 - 5).toFixed(1);
        const visitorsChange = (Math.random() * 15 - 3).toFixed(1);
        const ctrChange = (Math.random() * 6 - 2).toFixed(1);
        const timeChange = (Math.random() * 10 - 3).toFixed(1);
        
        document.getElementById('totalViewsChange').textContent = `${viewsChange >= 0 ? '+' : ''}${viewsChange}% from last 24h`;
        document.getElementById('uniqueVisitorsChange').textContent = `${visitorsChange >= 0 ? '+' : ''}${visitorsChange}% from last 24h`;
        document.getElementById('clickThroughRateChange').textContent = `${ctrChange >= 0 ? '+' : ''}${ctrChange}% from yesterday`;
        document.getElementById('avgTimeOnPageChange').textContent = `${timeChange >= 0 ? '+' : ''}${timeChange}% from yesterday`;
        
        // Update change colors
        this.updateChangeColors('totalViewsChange', viewsChange);
        this.updateChangeColors('uniqueVisitorsChange', visitorsChange);
        this.updateChangeColors('clickThroughRateChange', ctrChange);
        this.updateChangeColors('avgTimeOnPageChange', timeChange);
        
        // Create mini charts with dynamic data
        this.createMiniCharts();
        
        // Generate realistic device distribution
        const mobilePerc = Math.floor(65 + Math.random() * 8);
        const desktopPerc = 100 - mobilePerc;
        document.getElementById('mobilePercentage').textContent = mobilePerc + '%';
        document.getElementById('desktopPercentage').textContent = desktopPerc + '%';
        document.querySelector('.device-fill.mobile').style.width = mobilePerc + '%';
        document.querySelector('.device-fill.desktop').style.width = desktopPerc + '%';
        
        // Update tips performance table
        const tipsTableBody = document.getElementById('tipsTableBody');
        tipsTableBody.innerHTML = `
            <div class="tips-row">
                <div class="col-tip">tip_20250724_001</div>
                <div class="col-views">2,340</div>
                <div class="col-unique">1,890</div>
                <div class="col-ctr">4.1%</div>
                <div class="col-time">45s</div>
            </div>
            <div class="tips-row">
                <div class="col-tip">tip_20250724_002</div>
                <div class="col-views">1,980</div>
                <div class="col-unique">1,560</div>
                <div class="col-ctr">2.8%</div>
                <div class="col-time">38s</div>
            </div>
            <div class="tips-row">
                <div class="col-tip">tip_20250724_003</div>
                <div class="col-views">3,120</div>
                <div class="col-unique">2,450</div>
                <div class="col-ctr">3.5%</div>
                <div class="col-time">52s</div>
            </div>
            <div class="tips-row">
                <div class="col-tip">tip_20250724_004</div>
                <div class="col-views">1,670</div>
                <div class="col-unique">1,320</div>
                <div class="col-ctr">2.1%</div>
                <div class="col-time">35s</div>
            </div>
            <div class="tips-row">
                <div class="col-tip">tip_20250724_005</div>
                <div class="col-views">3,340</div>
                <div class="col-unique">2,100</div>
                <div class="col-ctr">4.7%</div>
                <div class="col-time">48s</div>
            </div>
        `;
    }

    createMiniCharts() {
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            elements: {
                point: { radius: 0 },
                line: { tension: 0.4 }
            }
        };

        // Generate sample data for last 7 days with some randomness
        const labels = ['6d', '5d', '4d', '3d', '2d', '1d', 'Today'];
        const generateTrendData = (base, variation) => {
            return labels.map((_, i) => Math.floor(base + (Math.random() * variation) + (i * 200)));
        };
        
        // Views Chart
        if (this.charts['viewsChart']) {
            this.charts['viewsChart'].destroy();
        }
        this.charts['viewsChart'] = new Chart(document.getElementById('viewsChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: generateTrendData(8000, 2000),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    borderWidth: 2
                }]
            },
            options: {
                ...chartOptions,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        enabled: true,
                        callbacks: {
                            title: () => 'Views',
                            label: (context) => `Views: ${context.parsed.y.toLocaleString()}`
                        }
                    }
                }
            }
        });

        // Visitors Chart
        if (this.charts['visitorsChart']) {
            this.charts['visitorsChart'].destroy();
        }
        this.charts['visitorsChart'] = new Chart(document.getElementById('visitorsChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: generateTrendData(6500, 1500),
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    fill: true,
                    borderWidth: 2
                }]
            },
            options: {
                ...chartOptions,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        enabled: true,
                        callbacks: {
                            title: () => 'Unique Visitors',
                            label: (context) => `Visitors: ${context.parsed.y.toLocaleString()}`
                        }
                    }
                }
            }
        });

        // CTR Chart
        if (this.charts['ctrChart']) {
            this.charts['ctrChart'].destroy();
        }
        this.charts['ctrChart'] = new Chart(document.getElementById('ctrChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: labels.map(() => parseFloat((2.5 + Math.random() * 1.5).toFixed(1))),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true,
                    borderWidth: 2
                }]
            },
            options: {
                ...chartOptions,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        enabled: true,
                        callbacks: {
                            title: () => 'Click-Through Rate',
                            label: (context) => `CTR: ${context.parsed.y}%`
                        }
                    }
                }
            }
        });

        // Time Chart
        if (this.charts['timeChart']) {
            this.charts['timeChart'].destroy();
        }
        this.charts['timeChart'] = new Chart(document.getElementById('timeChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: labels.map(() => Math.floor(35 + Math.random() * 15)),
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    fill: true,
                    borderWidth: 2
                }]
            },
            options: {
                ...chartOptions,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        enabled: true,
                        callbacks: {
                            title: () => 'Avg. Time on Page',
                            label: (context) => `Time: ${context.parsed.y}s`
                        }
                    }
                }
            }
        });
    }

    renderBanners(banners) {
        const grid = document.getElementById('bannersGrid');
        grid.innerHTML = '';

        banners.forEach(banner => {
            const card = document.createElement('div');
            card.className = 'banner-card';
            card.innerHTML = `
                <img src="${this.baseURL}/uploads/banners/${banner.filename}" alt="${banner.title}" class="banner-image">
                <div class="banner-info">
                    <div class="banner-title">${banner.title || 'Untitled'}</div>
                    <div class="banner-meta">
                        Uploaded: ${new Date(banner.createdAt).toLocaleDateString()}<br>
                        Size: ${(banner.size / 1024).toFixed(1)} KB<br>
                        Status: <span class="status-badge ${banner.isActive ? 'status-active' : 'status-inactive'}">${banner.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div class="banner-actions">
                        <button class="btn btn-secondary" onclick="adminPanel.toggleBannerStatus('${banner._id}', ${!banner.isActive})">
                            ${banner.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button class="btn btn-danger" onclick="adminPanel.deleteBanner('${banner._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    async handleBannerUpload() {
        const form = document.getElementById('bannerForm');
        const fileInput = document.getElementById('bannerFile');
        
        // Validate file selection
        if (!fileInput.files || fileInput.files.length === 0) {
            this.showError('Please select a file to upload');
            return;
        }

        const file = fileInput.files[0];
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        // Validate file type
        if (!allowedTypes.includes(file.type)) {
            this.showError('Invalid file type. Please upload JPG, PNG, or WebP images only.');
            return;
        }

        // Validate file size
        if (file.size > maxSize) {
            this.showError('File size too large. Maximum size is 5MB.');
            return;
        }

        const formData = new FormData(form);

        try {
            this.showLoading();
            console.log('Uploading banner...', file.name, file.type, file.size);
            
            const response = await fetch(`${this.baseURL}/api/banners`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });

            console.log('Upload response:', response.status, response.statusText);

            if (response.ok) {
                const result = await response.json();
                console.log('Upload successful:', result);
                this.closeBannerModal();
                await this.loadBanners();
                this.showSuccess('Banner uploaded successfully!');
            } else {
                const error = await response.json();
                console.error('Upload error:', error);
                this.showError(error.error || `Upload failed: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            this.showError(`Network error: ${error.message}. Please try again.`);
        } finally {
            this.hideLoading();
        }
    }

    async toggleBannerStatus(bannerId, isActive) {
        try {
            const response = await fetch(`${this.baseURL}/api/banners/${bannerId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive })
            });

            if (response.ok) {
                await this.loadBanners();
                this.showSuccess(`Banner ${isActive ? 'activated' : 'deactivated'} successfully!`);
            }
        } catch (error) {
            this.showError('Failed to update banner status');
        }
    }

    async deleteBanner(bannerId) {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        try {
            const response = await fetch(`${this.baseURL}/api/banners/${bannerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                await this.loadBanners();
                this.showSuccess('Banner deleted successfully!');
            }
        } catch (error) {
            this.showError('Failed to delete banner');
        }
    }

    // Comment Management
    async loadComments() {
        try {
            const response = await fetch(`${this.baseURL}/api/comments`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const comments = await response.json();
                this.renderComments(comments);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    renderComments(comments) {
        const table = document.getElementById('commentsTable');
        table.innerHTML = '';

        comments.forEach(comment => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            item.innerHTML = `
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-avatar">${comment.avatar}</span>
                        <span class="comment-username">${comment.username}</span>
                        <span class="comment-timestamp">${comment.timestamp}</span>
                        <span class="status-badge ${comment.isActive ? 'status-active' : 'status-inactive'}">${comment.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div class="comment-text">${comment.comment}</div>
                    <div class="comment-meta">Added: ${new Date(comment.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="comment-actions">
                    <button class="btn btn-secondary" onclick="adminPanel.editComment('${comment._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-secondary" onclick="adminPanel.toggleCommentStatus('${comment._id}', ${!comment.isActive})">
                        ${comment.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn btn-danger" onclick="adminPanel.deleteComment('${comment._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            table.appendChild(item);
        });
    }

    async handleCommentSubmit() {
        const form = document.getElementById('commentForm');
        const formData = new FormData(form);
        const commentId = formData.get('id');
        
        const data = {
            username: formData.get('username'),
            comment: formData.get('comment'),
            avatar: formData.get('avatar'),
            timestamp: formData.get('timestamp') || undefined
        };

        try {
            this.showLoading();
            const url = commentId ? 
                `${this.baseURL}/api/comments/${commentId}` : 
                `${this.baseURL}/api/comments`;
            const method = commentId ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.closeCommentModal();
                await this.loadComments();
                this.showSuccess(`Comment ${commentId ? 'updated' : 'added'} successfully!`);
            } else {
                const error = await response.json();
                this.showError(error.error || 'Operation failed');
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    editComment(commentId) {
        // Find comment data and populate form
        // This is a simplified version - in a real app, you'd fetch the specific comment
        this.openCommentModal();
        document.getElementById('commentId').value = commentId;
    }

    async toggleCommentStatus(commentId, isActive) {
        try {
            const response = await fetch(`${this.baseURL}/api/comments/${commentId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive })
            });

            if (response.ok) {
                await this.loadComments();
                this.showSuccess(`Comment ${isActive ? 'activated' : 'deactivated'} successfully!`);
            }
        } catch (error) {
            this.showError('Failed to update comment status');
        }
    }

    async deleteComment(commentId) {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const response = await fetch(`${this.baseURL}/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                await this.loadComments();
                this.showSuccess('Comment deleted successfully!');
            }
        } catch (error) {
            this.showError('Failed to delete comment');
        }
    }

    // Video Management
    async loadVideos() {
        try {
            // Load all videos for display
            const allResponse = await fetch(`${this.baseURL}/api/video/all`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            if (allResponse.ok) {
                const allVideos = await allResponse.json();
                this.renderVideoHistory(allVideos);
            }
        } catch (error) {
            console.error('Error loading videos:', error);
        }
    }

    /* renderCurrentVideo(video) {
        const content = document.getElementById('videoContent');
        
        if (!video) {
            content.innerHTML = `
                <div class="current-video">
                    <h3>No Active Video</h3>
                    <p>Add a video to get started.</p>
                </div>
            `;
            return;
        }

        let videoThumbnail = '';
        let videoUrl = '';
        
        if (video.videoType === 'youtube') {
            const videoId = this.extractYouTubeId(video.videoUrl);
            videoThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        } else {
            videoThumbnail = '/placeholder-video-thumbnail.jpg'; // You can add a placeholder
            videoUrl = `${this.baseURL}${video.videoUrl}`;
        }

        content.innerHTML = `
            <div class="current-video">
                <h3>Current Active Video</h3>
                <div class="video-thumbnail-container" onclick="window.open('${videoUrl}', '_blank')">
                    <div class="video-thumbnail">
                        <img src="${videoThumbnail}" alt="Video Thumbnail" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjMzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjMzOCIgZmlsbD0iIzE4MjAyNSIvPjx0ZXh0IHg9IjMwMCIgeT0iMTY5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+📺 Video Thumbnail</dGV4dD48L3N2Zz4='">
                        <div class="play-button">
                            <svg width="68" height="48" viewBox="0 0 68 48">
                                <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                                <path d="M45,24 27,14 27,34" fill="#fff"></path>
                            </svg>
                        </div>
                        <div class="video-duration">
                            ${video.videoType === 'youtube' ? 'YouTube' : 'MP4'}
                        </div>
                    </div>
                </div>
                <div class="video-info">
                    <div class="video-title">${video.title || 'Untitled'}</div>
                    <div class="video-description">${video.description || ''}</div>
                    <div class="video-meta">
                        Type: ${video.videoType.toUpperCase()}<br>
                        Uploaded: ${new Date(video.createdAt).toLocaleDateString()}<br>
                        <a href="${videoUrl}" target="_blank" class="btn btn-primary" style="margin-top: 10px;">
                            <i class="fas fa-play"></i> Watch Video
                        </a>
                    </div>
                </div>
            </div>
        `;
    } */

    renderVideoHistory(videos) {
        const history = document.getElementById('videoHistory');
        const historyContainer = history.querySelector('.video-history') || history;
        
        // Clear existing content except the h3
        const h3 = historyContainer.querySelector('h3');
        historyContainer.innerHTML = '';
        if (h3) historyContainer.appendChild(h3);

        videos.forEach(video => {
            const item = document.createElement('div');
            item.className = 'video-history-item';
            
            let thumbnailUrl = '';
            let videoUrl = '';
            
            if (video.videoType === 'youtube') {
                const videoId = this.extractYouTubeId(video.videoUrl);
                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            } else {
                thumbnailUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iIzM0MzUzZSIvPjx0ZXh0IHg9IjE2MCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5O6IE1QNCBWaWRlbzwvdGV4dD48L3N2Zz4=';
                videoUrl = `${this.baseURL}${video.videoUrl}`;
            }
            
            item.innerHTML = `
                <div class="video-history-thumbnail">
                    <img src="${thumbnailUrl}" alt="Video Thumbnail" onclick="window.open('${videoUrl}', '_blank')">
                    <div class="video-history-play">▶</div>
                </div>
                <div class="video-history-details">
                    <div>
                        <strong>${video.title || 'Untitled'}</strong><br>
                        <small>${video.videoType.toUpperCase()} • ${new Date(video.createdAt).toLocaleDateString()}</small><br>
                        <span class="status-badge ${video.isActive ? 'status-active' : 'status-inactive'}">${video.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div class="video-history-actions">
                        <div class="dropdown-menu">
                            <button class="dropdown-trigger" onclick="toggleVideoDropdown('${video._id}')">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="dropdown-content" id="dropdown-${video._id}">
                                <button class="dropdown-item" onclick="adminPanel.toggleVideoStatus('${video._id}', ${!video.isActive}); hideVideoDropdown('${video._id}')">
                                    <i class="fas fa-${video.isActive ? 'eye-slash' : 'eye'}"></i>
                                    ${video.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button class="dropdown-item delete" onclick="adminPanel.deleteVideo('${video._id}'); hideVideoDropdown('${video._id}')">
                                    <i class="fas fa-trash"></i>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            historyContainer.appendChild(item);
        });
    }

    async handleVideoUrlSubmit() {
        const form = document.getElementById('videoUrlForm');
        const formData = new FormData(form);
        
        const data = {
            videoType: 'youtube',
            videoUrl: formData.get('videoUrl'),
            title: formData.get('title'),
            description: formData.get('description')
        };

        try {
            this.showLoading();
            const response = await fetch(`${this.baseURL}/api/video/url`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.closeVideoModal();
                await this.loadVideos();
                this.showSuccess('Video URL saved successfully!');
            } else {
                const error = await response.json();
                this.showError(error.error || 'Save failed');
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async handleVideoUpload() {
        const form = document.getElementById('videoUploadForm');
        const formData = new FormData(form);

        try {
            this.showLoading();
            const response = await fetch(`${this.baseURL}/api/video/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });

            if (response.ok) {
                this.closeVideoModal();
                await this.loadVideos();
                this.showSuccess('Video uploaded successfully!');
            } else {
                const error = await response.json();
                this.showError(error.error || 'Upload failed');
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async toggleVideoStatus(videoId, isActive) {
        try {
            const response = await fetch(`${this.baseURL}/api/video/${videoId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive })
            });

            if (response.ok) {
                await this.loadVideos();
                this.showSuccess(`Video ${isActive ? 'activated' : 'deactivated'} successfully!`);
            }
        } catch (error) {
            this.showError('Failed to update video status');
        }
    }

    async deleteVideo(videoId) {
        if (!confirm('Are you sure you want to delete this video?')) return;

        try {
            const response = await fetch(`${this.baseURL}/api/video/${videoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                await this.loadVideos();
                this.showSuccess('Video deleted successfully!');
            }
        } catch (error) {
            this.showError('Failed to delete video');
        }
    }

    extractYouTubeId(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : false;
    }

    // Modal Management
    openBannerModal() {
        document.getElementById('bannerModal').style.display = 'block';
        document.getElementById('bannerForm').reset();
    }

    closeBannerModal() {
        document.getElementById('bannerModal').style.display = 'none';
    }

    openCommentModal() {
        document.getElementById('commentModal').style.display = 'block';
        document.getElementById('commentForm').reset();
    }

    closeCommentModal() {
        document.getElementById('commentModal').style.display = 'none';
    }

    openVideoModal() {
        document.getElementById('videoModal').style.display = 'block';
        document.getElementById('videoUrlForm').reset();
        document.getElementById('videoUploadForm').reset();
        this.switchVideoTab('youtube');
    }

    closeVideoModal() {
        document.getElementById('videoModal').style.display = 'none';
    }

    // Utility Methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Remove any existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add to body
        document.body.appendChild(notification);

        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    // ===============================
    // NEW FEATURES - GAMES MANAGEMENT
    // ===============================

    async loadGamesData() {
        const section = document.getElementById('games');
        if (!section.classList.contains('active')) return;

        try {
            // Load games list
            const gamesResponse = await fetch(`${this.baseURL}/api/games/list`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (gamesResponse.ok) {
                const games = await gamesResponse.json();
                this.renderGamesList(games);
            }
            
            // Load available images for modals
            await this.loadGameImages();
        } catch (error) {
            this.showError('Failed to load games data');
        }
    }

    renderGamesStatus(status) {
        const container = document.getElementById('gamesStatus');
        container.innerHTML = `
            <div class="status-item">
                <strong>Total Games in Pool:</strong> ${status.totalGames}
            </div>
            <div class="status-item">
                <strong>Configured Games per Day:</strong> ${status.configuredGames}
            </div>
            <div class="status-item">
                <strong>Last Refresh:</strong> ${new Date(status.lastRefresh).toLocaleString()}
            </div>
            <div class="status-item">
                <strong>Next Refresh:</strong> ${status.refreshTime} IST Daily
            </div>
            ${status.error ? `<div class="status-item error"><strong>Error:</strong> ${status.error}</div>` : ''}
        `;
    }

    async refreshDailyGames() {
        try {
            this.showLoading();
            const response = await fetch(`${this.baseURL}/api/games/refresh`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                await this.loadGamesData();
                this.showSuccess('Games pool refreshed successfully!');
            } else {
                const error = await response.json();
                this.showError(error.error || 'Refresh failed');
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async updateGamesConfig() {
        const totalGames = document.getElementById('totalGames').value;
        const refreshTime = document.getElementById('refreshTime').value;

        try {
            this.showLoading();
            const response = await fetch(`${this.baseURL}/api/games/config`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ totalGames: parseInt(totalGames), refreshTime })
            });

            if (response.ok) {
                await this.loadGamesData();
                this.showSuccess('Games configuration updated successfully!');
            } else {
                const error = await response.json();
                this.showError(error.error || 'Update failed');
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    renderGamesList(games) {
        const container = document.getElementById('gamesList');
        
        if (games.length === 0) {
            container.innerHTML = '<div class="empty-state">No games found. Add your first game!</div>';
            return;
        }

        container.innerHTML = games.map(game => `
            <div class="game-item">
                <div class="game-images">
                    <img src="/images/${game.image}" alt="${game.title}" class="game-image-preview" title="Game Image">
                </div>
                <div class="game-info">
                    <h4 class="game-title">${game.title}</h4>
                    <div class="game-win-info">
                        <strong>${game.recentWin.amount}</strong> by ${game.recentWin.player}
                    </div>
                    <div class="game-win-comment" style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                        "${game.recentWin.comment.substring(0, 80)}${game.recentWin.comment.length > 80 ? '...' : ''}"
                    </div>
                    <div class="game-created" style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
                        Added: ${new Date(game.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div class="game-actions">
                    <button class="btn ${game.active ? 'btn-success' : 'btn-outline-secondary'} btn-sm" 
                            onclick="adminPanel.toggleGame('${game._id}', ${!game.active})">
                        ${game.active ? 'Active' : 'Activate'}
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="adminPanel.editGame('${game._id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="adminPanel.deleteGame('${game._id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    async loadGameImages() {
        if (this.gameImages) return; // Already loaded
        
        try {
            const response = await fetch(`${this.baseURL}/api/games/images`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                this.gameImages = await response.json();
                console.log('Loaded game images:', this.gameImages.length);
            }
        } catch (error) {
            console.error('Error loading game images:', error);
        }
    }

    renderImageGallery() {
        const gallery = document.getElementById('imageGallery');
        if (!this.gameImages) return;
        
        gallery.innerHTML = this.gameImages.map(image => `
            <div class="image-gallery-item" data-image="${image.filename}" onclick="adminPanel.selectImage('${image.filename}', '${image.name}', '${image.path}')">
                <img src="${image.path}" alt="${image.name}">
                <div class="image-name">${image.name}</div>
            </div>
        `).join('');
    }

    selectImage(filename, name, path) {
        // Remove previous selection
        document.querySelectorAll('.image-gallery-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to clicked item
        const selectedItem = document.querySelector(`[data-image="${filename}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        // Update hidden field and preview
        document.getElementById('selectedImage').value = filename;
        document.getElementById('selectedImageName').textContent = name;
        document.getElementById('selectedImageImg').src = path;
        document.getElementById('selectedImagePreview').style.display = 'block';
    }

    async openGameModal(gameId = null) {
        await this.loadGameImages(); // Ensure images are loaded
        
        const modal = document.getElementById('gameModal');
        const form = document.getElementById('gameForm');
        
        // Reset form and gallery
        form.reset();
        document.getElementById('gameId').value = '';
        document.getElementById('selectedImage').value = '';
        document.getElementById('selectedImagePreview').style.display = 'none';
        
        // Clear gallery selections
        document.querySelectorAll('.image-gallery-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        if (gameId) {
            // Edit mode - fetch and populate form
            try {
                const response = await fetch(`${this.baseURL}/api/games/list`, {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                const games = await response.json();
                const game = games.find(g => g._id === gameId);
                
                if (game) {
                    document.getElementById('gameId').value = game._id;
                    document.getElementById('gameTitle').value = game.title;
                    document.getElementById('winAmount').value = game.recentWin.amount;
                    document.getElementById('winPlayer').value = game.recentWin.player;
                    document.getElementById('winComment').value = game.recentWin.comment;
                    
                    // Pre-select the current image and disable gallery for edit mode
                    const gallery = document.getElementById('imageGallery');
                    gallery.style.display = 'none';
                    document.getElementById('selectedImage').value = game.image;
                    document.getElementById('selectedImageName').textContent = game.image.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '').replace(/-/g, ' ');
                    document.getElementById('selectedImageImg').src = `/images/${game.image}`;
                    document.getElementById('selectedImagePreview').style.display = 'block';
                    
                    // Add note for edit mode
                    const galleryLabel = document.querySelector('label[for="imageGallery"]');
                    if (galleryLabel) {
                        galleryLabel.innerHTML = 'Current Image <small style="color: #666;">(Image cannot be changed in edit mode)</small>';
                    }
                }
            } catch (error) {
                console.error('Error loading game for edit:', error);
            }
        } else {
            // Add mode - show gallery
            document.getElementById('imageGallery').style.display = 'grid';
            this.renderImageGallery();
            
            // Reset label
            const galleryLabel = document.querySelector('label[for="imageGallery"]');
            if (galleryLabel) {
                galleryLabel.textContent = 'Select Game Image';
            }
        }
        
        modal.style.display = 'block';
    }

    closeGameModal() {
        document.getElementById('gameModal').style.display = 'none';
    }

    async handleGameSubmit() {
        const form = document.getElementById('gameForm');
        const gameId = document.getElementById('gameId').value;

        try {
            this.showLoading();
            
            if (gameId) {
                // Edit mode - JSON data for updates
                const gameData = {
                    title: form.title.value,
                    recentWin: {
                        amount: form.winAmount.value || '$5,000',
                        player: form.winPlayer.value || 'Lucky***Player',
                        comment: form.winComment.value || 'Amazing game! Just won big!'
                    }
                };
                
                const response = await fetch(`${this.baseURL}/api/games/${gameId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify(gameData)
                });

                if (response.ok) {
                    this.closeGameModal();
                    await this.loadGamesData();
                    this.showSuccess('Game updated successfully!');
                } else {
                    const error = await response.json();
                    this.showError(error.error || 'Update failed');
                }
            } else {
                // Add mode - JSON data for game creation
                const gameData = {
                    title: form.title.value,
                    selectedImage: form.selectedImage.value,
                    winAmount: form.winAmount.value || '$5,000',
                    winPlayer: form.winPlayer.value || 'Lucky***Player',
                    winComment: form.winComment.value || 'Amazing game! Just won big!'
                };
                
                const response = await fetch(`${this.baseURL}/api/games/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify(gameData)
                });

                if (response.ok) {
                    this.closeGameModal();
                    await this.loadGamesData();
                    this.showSuccess('Game added successfully!');
                } else {
                    const error = await response.json();
                    this.showError(error.error || 'Upload failed');
                }
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async toggleGame(gameId, newActiveState) {
        try {
            this.showLoading();
            const response = await fetch(`${this.baseURL}/api/games/${gameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ active: newActiveState })
            });
            
            if (response.ok) {
                await this.loadGamesData();
                this.showSuccess(`Game ${newActiveState ? 'activated' : 'deactivated'} successfully!`);
            } else {
                const error = await response.json();
                this.showError(error.error || 'Update failed');
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async editGame(gameId) {
        await this.openGameModal(gameId);
    }

    async deleteGame(gameId) {
        if (!confirm('Are you sure you want to delete this game?')) return;

        try {
            this.showLoading();
            const response = await fetch(`${this.baseURL}/api/games/${gameId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                await this.loadGamesData();
                this.showSuccess('Game deleted successfully!');
            } else {
                const error = await response.json();
                this.showError(error.error || 'Delete failed');
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    // ===============================
    // WINNERS MANAGEMENT
    // ===============================

    async loadWinners() {
        const section = document.getElementById('winners');
        if (!section.classList.contains('active')) return;

        try {
            const response = await fetch(`${this.baseURL}/api/winners`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                const winners = await response.json();
                this.renderWinners(winners);
            } else {
                this.showError('Failed to load winners');
            }
        } catch (error) {
            this.showError('Failed to load winners');
        }
    }

    renderWinners(winners) {
        const container = document.getElementById('winnersTable');
        
        if (winners.length === 0) {
            container.innerHTML = '<div class="empty-state">No winners found. Add your first winner!</div>';
            return;
        }

        container.innerHTML = winners.map(winner => `
            <div class="winner-item">
                <div class="winner-info">
                    <div class="winner-avatar">${winner.name.charAt(0).toUpperCase()}</div>
                    <div class="winner-details">
                        <h4>${winner.name}</h4>
                        <p>${winner.game} • ${winner.timeAgo}</p>
                    </div>
                </div>
                <div class="winner-amount">${winner.amount}</div>
                <div class="winner-actions">
                    <span class="status-badge ${winner.active ? 'status-active' : 'status-inactive'}">
                        ${winner.active ? 'Active' : 'Inactive'}
                    </span>
                    <button class="btn btn-secondary btn-sm" onclick="adminPanel.editWinner('${winner._id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="adminPanel.deleteWinner('${winner._id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    openWinnerModal(winnerId = null) {
        const modal = document.getElementById('winnerModal');
        const form = document.getElementById('winnerForm');
        
        if (winnerId) {
            // Edit mode - populate form
            // Implementation would fetch winner data and populate form
        } else {
            // Add mode - reset form
            form.reset();
            document.getElementById('winnerId').value = '';
        }
        
        modal.style.display = 'block';
        
        // Set up form submission
        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.handleWinnerSubmit();
        };
    }

    closeWinnerModal() {
        document.getElementById('winnerModal').style.display = 'none';
    }

    async handleWinnerSubmit() {
        const form = document.getElementById('winnerForm');
        const formData = new FormData(form);
        
        const data = {
            name: formData.get('name'),
            amount: formData.get('amount'),
            game: formData.get('game'),
            timeAgo: formData.get('timeAgo')
        };

        try {
            this.showLoading();
            const winnerId = formData.get('id');
            const url = winnerId ? `/api/winners/${winnerId}` : '/api/winners';
            const method = winnerId ? 'PUT' : 'POST';

            const response = await fetch(`${this.baseURL}${url}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.closeWinnerModal();
                await this.loadWinners();
                this.showSuccess('Winner saved successfully!');
            } else {
                const error = await response.json();
                this.showError(error.error || 'Save failed');
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async deleteWinner(winnerId) {
        if (!confirm('Are you sure you want to delete this winner?')) return;

        try {
            this.showLoading();
            const response = await fetch(`${this.baseURL}/api/winners/${winnerId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                await this.loadWinners();
                this.showSuccess('Winner deleted successfully!');
            } else {
                const error = await response.json();
                this.showError(error.error || 'Delete failed');
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    // ===============================
    // JACKPOT MANAGEMENT
    // ===============================

    async loadJackpotData() {
        const section = document.getElementById('jackpot');
        if (!section.classList.contains('active')) return;

        try {
            const response = await fetch(`${this.baseURL}/api/jackpot`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                const messages = await response.json();
                this.renderJackpotMessages(messages);
            }

            // Load prediction times
            this.renderPredictionTimes();
        } catch (error) {
            this.showError('Failed to load jackpot data');
        }
    }

    renderPredictionTimes() {
        const container = document.getElementById('predictionTimes');
        const times = ['2:00 AM', '10:00 AM', '5:00 PM'];
        
        container.innerHTML = times.map(time => `
            <div class="prediction-time-item">
                <span>${time} IST</span>
                <span class="status-badge status-active">Active</span>
            </div>
        `).join('');
    }

    renderJackpotMessages(messages) {
        const container = document.getElementById('jackpotMessagesTable');
        
        if (messages.length === 0) {
            container.innerHTML = '<div class="empty-state">No jackpot messages found. Add your first message!</div>';
            return;
        }

        container.innerHTML = messages.map(message => `
            <div class="message-item">
                <div class="message-content">
                    <div class="message-text">${message.message}</div>
                    <div class="message-meta">
                        <span class="message-category">${message.category}</span>
                        <span class="message-time">⏰ ${this.formatPredictionTime(message.predictionTime)}</span>
                    </div>
                </div>
                <div class="message-actions">
                    <button class="btn ${message.active ? 'btn-success' : 'btn-outline-secondary'} btn-sm" 
                            onclick="adminPanel.toggleJackpotMessage('${message._id}', ${!message.active})">
                        ${message.active ? 'Active' : 'Activate'}
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="adminPanel.editJackpotMessage('${message._id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="adminPanel.deleteJackpotMessage('${message._id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    async openJackpotModal(messageId = null) {
        const modal = document.getElementById('jackpotModal');
        const form = document.getElementById('jackpotForm');
        
        if (messageId) {
            // Edit mode - fetch and populate form
            try {
                const response = await fetch(`${this.baseURL}/api/jackpot`, {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                const messages = await response.json();
                const message = messages.find(m => m._id === messageId);
                
                if (message) {
                    document.getElementById('jackpotId').value = message._id;
                    document.getElementById('jackpotMessage').value = message.message;
                    document.getElementById('jackpotCategory').value = message.category;
                    document.getElementById('jackpotTime').value = message.predictionTime || '';
                }
            } catch (error) {
                console.error('Error loading message for edit:', error);
            }
        } else {
            // Add mode - reset form
            form.reset();
            document.getElementById('jackpotId').value = '';
        }
        
        modal.style.display = 'block';
        
        // Set up form submission
        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.handleJackpotSubmit();
        };
    }

    closeJackpotModal() {
        document.getElementById('jackpotModal').style.display = 'none';
    }

    async handleJackpotSubmit() {
        const form = document.getElementById('jackpotForm');
        const formData = new FormData(form);
        
        const data = {
            message: formData.get('message'),
            category: formData.get('category'),
            predictionTime: formData.get('predictionTime')
        };

        try {
            this.showLoading();
            const messageId = formData.get('id');
            const url = messageId ? `/api/jackpot/${messageId}` : '/api/jackpot';
            const method = messageId ? 'PUT' : 'POST';

            const response = await fetch(`${this.baseURL}${url}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.closeJackpotModal();
                await this.loadJackpotData();
                this.showSuccess('Jackpot message saved successfully!');
            } else {
                const error = await response.json();
                this.showError(error.error || 'Save failed');
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async toggleJackpotMessage(messageId, newActiveState) {
        try {
            this.showLoading();
            const response = await fetch(`${this.baseURL}/api/jackpot/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ active: newActiveState })
            });
            
            if (response.ok) {
                await this.loadJackpotData();
                this.showSuccess(`Jackpot message ${newActiveState ? 'activated' : 'deactivated'} successfully!`);
            } else {
                const error = await response.json();
                this.showError(error.error || 'Update failed');
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async deleteJackpotMessage(messageId) {
        if (!confirm('Are you sure you want to delete this jackpot message?')) return;

        try {
            this.showLoading();
            const response = await fetch(`${this.baseURL}/api/jackpot/${messageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                await this.loadJackpotData();
                this.showSuccess('Jackpot message deleted successfully!');
            } else {
                const error = await response.json();
                this.showError(error.error || 'Delete failed');
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    formatPredictionTime(predictionTime) {
        if (!predictionTime) return 'No time set';
        
        const timeMap = {
            '2:00': '2:00 AM',
            '10:00': '10:00 AM', 
            '17:00': '5:00 PM'
        };
        
        return timeMap[predictionTime] || predictionTime;
    }

    async editJackpotMessage(messageId) {
        await this.openJackpotModal(messageId);
    }

}

// Global functions for onclick handlers
function refreshMetrics() {
    adminPanel.loadMetrics();
}

function openCommentModal() {
    adminPanel.openCommentModal();
}

function closeCommentModal() {
    adminPanel.closeCommentModal();
}

function openVideoModal() {
    adminPanel.openVideoModal();
}

function closeVideoModal() {
    adminPanel.closeVideoModal();
}

function openWinnerModal() {
    adminPanel.openWinnerModal();
}

function closeWinnerModal() {
    adminPanel.closeWinnerModal();
}

function openJackpotModal() {
    adminPanel.openJackpotModal();
}

function closeJackpotModal() {
    adminPanel.closeJackpotModal();
}

function refreshDailyGames() {
    adminPanel.refreshDailyGames();
}

function openGameModal() {
    adminPanel.openGameModal();
}

function closeGameModal() {
    adminPanel.closeGameModal();
}

function updateGamesConfig() {
    adminPanel.updateGamesConfig();
}

// Video dropdown functions
function toggleVideoDropdown(videoId) {
    const dropdown = document.getElementById(`dropdown-${videoId}`);
    const isVisible = dropdown.classList.contains('show');
    
    // Hide all other dropdowns first
    document.querySelectorAll('.dropdown-content.show').forEach(dd => {
        dd.classList.remove('show');
    });
    
    // Toggle current dropdown
    if (!isVisible) {
        dropdown.classList.add('show');
    }
}

function hideVideoDropdown(videoId) {
    const dropdown = document.getElementById(`dropdown-${videoId}`);
    dropdown.classList.remove('show');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown-menu')) {
        document.querySelectorAll('.dropdown-content.show').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }
});

// OTP Management Functions
let currentOTPPage = 1;
const otpLogsPerPage = 50;

async function loadOTPLogs(page = 1) {
    try {
        const response = await fetch(`/api/otp/logs?page=${page}&limit=${otpLogsPerPage}`);
        const data = await response.json();
        
        if (data.success) {
            displayOTPLogs(data.logs);
            updateOTPPagination(data.pagination);
            currentOTPPage = page;
        } else {
            throw new Error('Failed to load OTP logs');
        }
    } catch (error) {
        console.error('Error loading OTP logs:', error);
        document.getElementById('otpTableBody').innerHTML = `
            <tr>
                <td colspan="5" class="loading-message" style="color: red;">
                    Error loading OTP logs: ${error.message}
                </td>
            </tr>
        `;
    }
}

async function loadOTPStats() {
    try {
        const response = await fetch('/api/otp/stats');
        const data = await response.json();
        
        if (data.success) {
            const stats = data.stats;
            document.getElementById('totalRequests').textContent = stats.totalRequests;
            document.getElementById('todayRequests').textContent = stats.todayRequests;
            document.getElementById('uniquePhones').textContent = stats.uniquePhoneNumbers;
            
            if (stats.lastRequestTime) {
                const lastTime = new Date(stats.lastRequestTime);
                const timeStr = lastTime.toLocaleString();
                document.getElementById('lastRequestTime').textContent = timeStr;
            } else {
                document.getElementById('lastRequestTime').textContent = 'Never';
            }
        }
    } catch (error) {
        console.error('Error loading OTP stats:', error);
    }
}

function displayOTPLogs(logs) {
    const tbody = document.getElementById('otpTableBody');
    
    if (!logs || logs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="loading-message">
                    No OTP logs found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = logs.map(log => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        const truncatedUA = log.userAgent.length > 50 ? 
            log.userAgent.substring(0, 50) + '...' : log.userAgent;
        
        return `
            <tr>
                <td class="timestamp">${timestamp}</td>
                <td class="phone-number">${log.phone}</td>
                <td><span class="otp-code">${log.otpCode}</span></td>
                <td class="ip-address">${log.ip}</td>
                <td class="user-agent" title="${log.userAgent}">${truncatedUA}</td>
            </tr>
        `;
    }).join('');
}

function updateOTPPagination(pagination) {
    const paginationDiv = document.getElementById('otpPagination');
    
    if (pagination.total <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button onclick="loadOTPLogs(${pagination.current - 1})" 
                ${pagination.current === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> Previous
        </button>
    `;
    
    // Page info
    paginationHTML += `
        <span class="pagination-info">
            Page ${pagination.current} of ${pagination.total}
            (${pagination.totalLogs} total logs)
        </span>
    `;
    
    // Next button
    paginationHTML += `
        <button onclick="loadOTPLogs(${pagination.current + 1})" 
                ${pagination.current === pagination.total ? 'disabled' : ''}>
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationDiv.innerHTML = paginationHTML;
}

async function refreshOTPLogs() {
    await loadOTPStats();
    await loadOTPLogs(currentOTPPage);
}

async function clearOTPLogs() {
    if (!confirm('Are you sure you want to clear all OTP logs? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/otp/clear', {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            await refreshOTPLogs();
        } else {
            throw new Error('Failed to clear logs');
        }
    } catch (error) {
        console.error('Error clearing OTP logs:', error);
        alert('Error clearing logs: ' + error.message);
    }
}

// Initialize the admin panel
const adminPanel = new AdminPanel();

// Load OTP data when OTP tab is activated
document.addEventListener('DOMContentLoaded', function() {
    // Override the existing tab switching to load OTP data
    const originalSwitchTab = adminPanel.switchTab;
    adminPanel.switchTab = function(tabName) {
        originalSwitchTab.call(this, tabName);
        
        if (tabName === 'otp-requests') {
            loadOTPStats();
            loadOTPLogs(1);
        }
    };
});