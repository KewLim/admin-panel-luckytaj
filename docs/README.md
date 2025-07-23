# 🎰 LuckyTaj Admin Panel & Frontend Integration

A comprehensive admin panel with backend API integration for managing daily trending games, winner boards, jackpot countdowns, and video content.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Frontend Integration](#frontend-integration)
- [Admin Panel Guide](#admin-panel-guide)
- [File Structure](#file-structure)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This project combines a Node.js/Express backend with MongoDB database and a responsive frontend admin panel. The system manages:

- **Daily Games**: Automatic refresh configuration and pool management
- **Winner Board**: Display recent winners with customizable data
- **Jackpot Timer**: Countdown messages with category-based organization
- **Video Content**: YouTube/MP4 video management for TV sessions
- **Banner System**: Image upload and management
- **Comment System**: Fake engagement comments

## ✨ Features

### 🔧 Admin Panel
- **Secure Authentication**: JWT-based login system
- **6 Management Tabs**: Banners, Comments, Videos, Daily Games, Winner Board, Jackpot Timer
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live data synchronization

### 🌐 Frontend Integration
- **Dynamic Data Loading**: Automatic backend integration with graceful fallbacks
- **Cross-Origin Support**: Seamless API communication
- **Mobile Optimized**: Full responsive design

### 🗄️ Database Features
- **MongoDB Integration**: Robust data persistence
- **7 Collections**: Admins, Banners, Comments, Videos, GameConfigs, Winners, JackpotMessages
- **Data Validation**: Comprehensive input validation and sanitization

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd landing-page
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

4. **Configure environment**
   ```bash
   # Copy and edit .env file
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/lucky_taj_admin
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   ADMIN_EMAIL=admin@luckytaj.com
   ADMIN_PASSWORD=admin123
   NODE_ENV=development
   ```

5. **Create admin user**
   ```bash
   node scripts/setup-admin.js
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Access the applications**
   - **Admin Panel**: http://localhost:3001/admin
   - **Main Frontend**: http://localhost:3001
   - **Health Check**: http://localhost:3001/health

### Default Login Credentials
- **Email**: `admin@luckytaj.com`
- **Password**: `admin123`

## 📚 API Documentation

### 🔐 Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@luckytaj.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "64a7f8d9e1234567890",
    "email": "admin@luckytaj.com",
    "lastLogin": "2025-07-19T00:00:00.000Z"
  }
}
```

#### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <jwt_token>
```

### 🎮 Games Management API

#### Get Games Configuration
```http
GET /api/games/config
Authorization: Bearer <jwt_token>
```

**Location**: `routes/games.js:8-24`

#### Update Games Configuration
```http
POST /api/games/config
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "totalGames": 6,
  "refreshTime": "12:00"
}
```

**Location**: `routes/games.js:27-53`

#### Get Games Status
```http
GET /api/games/status
Authorization: Bearer <jwt_token>
```

**Location**: `routes/games.js:56-78`

### 🏆 Winner Board API

#### Get All Winners (Admin)
```http
GET /api/winners
Authorization: Bearer <jwt_token>
```

**Location**: `routes/winners.js:8-16`

#### Get Active Winners (Public)
```http
GET /api/winners/active
```

**Location**: `routes/winners.js:19-29`  
**Frontend Integration**: `script.js:1325`

#### Add New Winner
```http
POST /api/winners
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Lucky****2",
  "amount": "₹24,000",
  "game": "Jili Boxing King",
  "timeAgo": "2 mins ago"
}
```

**Location**: `routes/winners.js:32-54`

#### Update Winner
```http
PUT /api/winners/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "active": false
}
```

**Location**: `routes/winners.js:57-85`

#### Delete Winner
```http
DELETE /api/winners/:id
Authorization: Bearer <jwt_token>
```

**Location**: `routes/winners.js:88-104`

### 🎰 Jackpot Messages API

#### Get All Messages (Admin)
```http
GET /api/jackpot
Authorization: Bearer <jwt_token>
```

**Location**: `routes/jackpot.js:8-16`

#### Get Active Messages (Public)
```http
GET /api/jackpot/active
```

**Location**: `routes/jackpot.js:19-29`  
**Frontend Integration**: `script.js:1697`

#### Add New Message
```http
POST /api/jackpot
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "message": "Aaj 9:30PM se 10:00PM tak Dragon Tiger mein bonus rate double hoga!",
  "category": "Dragon Tiger"
}
```

**Location**: `routes/jackpot.js:32-54`

### 📹 Video Management API

#### Get Current Active Video (Public)
```http
GET /api/video/current
```

**Location**: `routes/video.js:211-243`  
**Frontend Integration**: `script.js:233`

**Response:**
```json
{
  "_id": "64a7f8d9e1234567890",
  "videoType": "youtube",
  "videoUrl": "https://www.youtube.com/watch?v=ABC123",
  "videoId": "ABC123",
  "title": "Amazing Wins Compilation",
  "description": "Watch incredible jackpot wins!",
  "createdAt": "2025-07-19T00:00:00.000Z"
}
```

#### Upload YouTube Video
```http
POST /api/video/url
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "videoUrl": "https://www.youtube.com/watch?v=ABC123",
  "title": "New Video",
  "description": "Video description"
}
```

**Location**: `routes/video.js:97-125`

## 🎨 Frontend Integration

### Dynamic Data Loading

The frontend automatically loads data from the backend with graceful fallbacks:

#### Winner Board Integration
```javascript
// Location: script.js:1322-1396
async initializeWinnerBoard() {
    try {
        const response = await fetch('/api/winners/active');
        if (response.ok) {
            const backendWinners = await response.json();
            // Convert and display backend data
        }
    } catch (error) {
        // Fallback to hardcoded data
    }
}
```

#### Jackpot Messages Integration
```javascript
// Location: script.js:1687-1730
async initializeJackpotCountdown() {
    try {
        const response = await fetch('/api/jackpot/active');
        if (response.ok) {
            const messages = await response.json();
            this.jackpotMessages = messages.map(msg => msg.message);
        }
    } catch (error) {
        // Fallback to default messages
    }
}
```

#### Video Content Integration
```javascript
// Location: script.js:230-329
async loadRandomVideo() {
    try {
        const response = await fetch('/api/video/current');
        if (response.ok) {
            const videoData = await response.json();
            this.loadVideoFromBackend(videoData);
            return;
        }
    } catch (error) {
        // Fallback to hardcoded video list
    }
}
```

### Admin Panel Tab Management

```javascript
// Location: admin-panel/app.js:186-205
switchTab(tabName) {
    switch(tabName) {
        case 'games': this.loadGamesData(); break;
        case 'winners': this.loadWinners(); break;
        case 'jackpot': this.loadJackpotData(); break;
        // ... other tabs
    }
}
```

## 🎛️ Admin Panel Guide

### Accessing the Admin Panel

1. **Navigate to**: http://localhost:3001/admin
2. **Login with**:
   - Email: `admin@luckytaj.com`
   - Password: `admin123`

### Managing Content

#### 🎮 Daily Games Tab
- **Purpose**: Configure daily games refresh settings
- **Features**:
  - Set games per day (3-12 range)
  - Configure refresh time (IST)
  - View current pool status
  - Force refresh games

**Admin Panel Location**: `admin-panel/app.js:819-891`

#### 🏆 Winner Board Tab
- **Purpose**: Manage winner display data
- **Features**:
  - Add new winners
  - Edit existing winners
  - Set active/inactive status
  - Delete winners

**Admin Panel Location**: `admin-panel/app.js:916-1036`

#### 🎰 Jackpot Timer Tab
- **Purpose**: Manage jackpot countdown messages
- **Features**:
  - Add prediction messages
  - Categorize by game type
  - Set active/inactive status
  - View prediction times (2AM, 10AM, 5PM IST)

**Admin Panel Location**: `admin-panel/app.js:1060-1187`

#### 📹 TV Session Tab
- **Purpose**: Manage video content
- **Features**:
  - Upload YouTube URLs
  - Upload MP4 files
  - Set active video
  - Video history tracking

#### 🖼️ Banners Tab
- **Purpose**: Manage promotional banners
- **Features**:
  - Upload images (JPG, PNG, WebP)
  - Set banner titles
  - Active/inactive status

#### 💬 Fake Comments Tab
- **Purpose**: Manage engagement comments
- **Features**:
  - Add user comments
  - Set avatars and timestamps
  - Active/inactive status

## 📁 File Structure

```
landing-page/
├── 📄 README.md                    # This documentation
├── 📄 server.js                    # Main server file
├── 📄 package.json                 # Dependencies and scripts
├── 📄 .env                         # Environment configuration
├── 📄 index.html                   # Main frontend page
├── 📄 script.js                    # Frontend JavaScript
├── 📄 styles.css                   # Frontend styles
├── 📄 games-data.json              # Games pool data
│
├── 📁 admin-panel/                 # Admin panel frontend
│   ├── 📄 index.html               # Admin panel HTML
│   ├── 📄 app.js                   # Admin panel JavaScript
│   └── 📄 styles.css               # Admin panel styles
│
├── 📁 models/                      # Database models
│   ├── 📄 Admin.js                 # Admin user model
│   ├── 📄 Banner.js                # Banner model
│   ├── 📄 Comment.js               # Comment model
│   ├── 📄 Video.js                 # Video model
│   ├── 📄 GameConfig.js            # 🆕 Games configuration
│   ├── 📄 Winner.js                # 🆕 Winner board data
│   └── 📄 JackpotMessage.js        # 🆕 Jackpot messages
│
├── 📁 routes/                      # API route handlers
│   ├── 📄 auth.js                  # Authentication routes
│   ├── 📄 banners.js               # Banner management
│   ├── 📄 comments.js              # Comment management
│   ├── 📄 video.js                 # Video management
│   ├── 📄 games.js                 # 🆕 Games management
│   ├── 📄 winners.js               # 🆕 Winner management
│   └── 📄 jackpot.js               # 🆕 Jackpot management
│
├── 📁 middleware/                  # Express middleware
│   └── 📄 auth.js                  # JWT authentication
│
├── 📁 scripts/                     # Utility scripts
│   └── 📄 setup-admin.js           # Create admin user
│
└── 📁 uploads/                     # File uploads
    ├── 📁 banners/                 # Banner images
    └── 📁 videos/                  # Video files
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Login Problems
**Symptom**: "Unexpected identifier" JavaScript error

**Solution**:
```bash
# Check server logs
tail -f server.log

# Restart server
npm run dev

# Clear browser cache
Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
```

#### 2. Frontend Not Loading Backend Data
**Symptom**: Winner board shows hardcoded data instead of admin panel data

**Solution**:
```bash
# Ensure accessing through server, not file://
# Correct: http://localhost:3001
# Wrong: file:///Users/.../index.html

# Test API endpoints
curl http://localhost:3001/api/winners/active
curl http://localhost:3001/api/jackpot/active
```

#### 3. Database Connection Issues
**Symptom**: "MongoDB connection error"

**Solution**:
```bash
# Check MongoDB status
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

#### 4. Port Already in Use
**Symptom**: "Port 3001 is already in use"

**Solution**:
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm run dev
```

### Testing API Endpoints

```bash
# Test server health
curl http://localhost:3001/health

# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@luckytaj.com","password":"admin123"}'

# Test public endpoints
curl http://localhost:3001/api/winners/active
curl http://localhost:3001/api/jackpot/active
curl http://localhost:3001/api/video/current
```

### Debug Mode

Enable detailed logging:
```bash
NODE_ENV=development npm run dev
```

Check browser console (F12) for frontend errors.

## 📞 Support

For technical support:
1. Check server logs for backend issues
2. Check browser console for frontend issues
3. Verify all dependencies are installed
4. Ensure MongoDB is running
5. Test API endpoints individually

## 🔐 Security Notes

### Production Deployment
- Change default admin password
- Update JWT secret key
- Enable MongoDB authentication
- Use HTTPS certificates
- Set up proper firewall rules
- Regular database backups

### Environment Variables
```bash
# Production .env example
PORT=3001
MONGODB_URI=mongodb://localhost:27017/lucky_taj_admin
JWT_SECRET=your_super_secure_256_bit_secret_key
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure_password_123
NODE_ENV=production
```

---

## 🎉 Success!

Your LuckyTaj Admin Panel is now fully operational with:
- ✅ Complete backend API
- ✅ Responsive admin interface
- ✅ Dynamic frontend integration
- ✅ Comprehensive documentation

**Admin Panel**: http://localhost:3001/admin  
**Main Site**: http://localhost:3001

Happy managing! 🚀