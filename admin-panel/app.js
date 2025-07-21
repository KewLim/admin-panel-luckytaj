class AdminPanel {
    constructor() {
        this.token = localStorage.getItem('adminToken');
        this.baseURL = window.location.origin;
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
            this.handleLogin();
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

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            this.showLoading();
            const response = await fetch(`${this.baseURL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                localStorage.setItem('adminToken', this.token);
                this.showDashboard();
                this.loadAdminInfo(data.admin);
            } else {
                errorDiv.textContent = data.error || 'Login failed';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            errorDiv.textContent = 'Network error. Please try again.';
            errorDiv.style.display = 'block';
        } finally {
            this.hideLoading();
        }
    }

    handleLogout() {
        localStorage.removeItem('adminToken');
        this.token = null;
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
        await this.loadBanners();
        await this.loadComments();
        await this.loadVideos();
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
            case 'banners':
                this.loadBanners();
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

    // Banner Management
    async loadBanners() {
        try {
            const response = await fetch(`${this.baseURL}/api/banners`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const banners = await response.json();
                this.renderBanners(banners);
            }
        } catch (error) {
            console.error('Error loading banners:', error);
        }
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
            // Load games status
            const statusResponse = await fetch(`${this.baseURL}/api/games/status`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (statusResponse.ok) {
                const status = await statusResponse.json();
                this.renderGamesStatus(status);
            }

            // Load config
            const configResponse = await fetch(`${this.baseURL}/api/games/config`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (configResponse.ok) {
                const config = await configResponse.json();
                document.getElementById('totalGames').value = config.totalGames;
                document.getElementById('refreshTime').value = config.refreshTime;
            }
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
                    <span class="message-category">${message.category}</span>
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
            category: formData.get('category')
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

    async editJackpotMessage(messageId) {
        await this.openJackpotModal(messageId);
    }

}

// Global functions for onclick handlers
function openBannerModal() {
    adminPanel.openBannerModal();
}

function closeBannerModal() {
    adminPanel.closeBannerModal();
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

// Initialize the admin panel
const adminPanel = new AdminPanel();