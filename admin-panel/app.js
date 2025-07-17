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
            // Load current active video
            const activeResponse = await fetch(`${this.baseURL}/api/video`);
            if (activeResponse.ok) {
                const activeVideo = await activeResponse.json();
                this.renderCurrentVideo(activeVideo);
            }

            // Load all videos for history
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

    renderCurrentVideo(video) {
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

        let videoPlayer = '';
        if (video.videoType === 'youtube') {
            const videoId = this.extractYouTubeId(video.videoUrl);
            videoPlayer = `<iframe class="video-player" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
        } else {
            videoPlayer = `<video class="video-player" controls><source src="${this.baseURL}${video.videoUrl}" type="video/mp4"></video>`;
        }

        content.innerHTML = `
            <div class="current-video">
                <h3>Current Active Video</h3>
                ${videoPlayer}
                <div class="video-info">
                    <div class="video-title">${video.title || 'Untitled'}</div>
                    <div class="video-description">${video.description || ''}</div>
                    <div class="video-meta">
                        Type: ${video.videoType.toUpperCase()}<br>
                        Uploaded: ${new Date(video.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        `;
    }

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
            item.innerHTML = `
                <div>
                    <strong>${video.title || 'Untitled'}</strong><br>
                    <small>${video.videoType.toUpperCase()} • ${new Date(video.createdAt).toLocaleDateString()}</small><br>
                    <span class="status-badge ${video.isActive ? 'status-active' : 'status-inactive'}">${video.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div>
                    <button class="btn btn-secondary" onclick="adminPanel.toggleVideoStatus('${video._id}', ${!video.isActive})">
                        ${video.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn btn-danger" onclick="adminPanel.deleteVideo('${video._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
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

// Initialize the admin panel
const adminPanel = new AdminPanel();