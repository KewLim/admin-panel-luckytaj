# 🎰 LuckyTaj Daily Games System

A complete web application for displaying daily trending games with admin management panel.

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Access the application:**
   - **Main Page**: http://localhost:3001/
   - **Admin Panel**: http://localhost:3001/admin/

## 📁 Project Structure

```
landing-page/
├── 📄 Main Application Files
│   ├── index.html              # Main landing page
│   ├── script.js               # Frontend JavaScript
│   ├── styles.css              # Main CSS styles
│   └── server.js               # Express server
│
├── 🎮 Game Assets
│   ├── images/                 # Game images (48+ images)
│   ├── games-data.json         # Fallback game data
│   └── luckytaj-favicon/       # Favicon files
│
├── 🔧 Backend Components
│   ├── models/                 # MongoDB models
│   │   ├── Game.js
│   │   ├── Admin.js
│   │   ├── JackpotMessage.js
│   │   └── ...
│   ├── routes/                 # API routes
│   │   ├── games.js
│   │   ├── auth.js
│   │   └── ...
│   ├── middleware/             # Authentication middleware
│   └── uploads/                # File uploads directory
│
├── 👨‍💼 Admin Panel
│   ├── admin-panel/
│   │   ├── index.html          # Admin interface
│   │   ├── app.js              # Admin JavaScript
│   │   └── styles.css          # Admin styles
│
├── 📚 Documentation
│   ├── docs/                   # All documentation
│   │   ├── README.md
│   │   ├── README-backend.md
│   │   └── ADMIN-PANEL-USER-GUIDE.md
│
├── 🧪 Testing
│   ├── tests/                  # Test files
│   │   ├── test-admin-login.html
│   │   ├── test-complete-workflow.html
│   │   └── ...
│
├── 🗂️ Development
│   ├── temp/                   # Temporary/development files
│   ├── scripts/                # Setup scripts
│   └── node_modules/           # Dependencies
│
└── 📦 Configuration
    ├── package.json
    └── package-lock.json
```

## 🎯 Features

### 🎮 Main Page Features
- **Random Game Display**: Shows 3 random games from database
- **Game Information**: Images, titles, recent wins, player comments
- **Responsive Design**: Mobile-optimized (390px width)
- **Real-time Loading**: Fetches fresh games from API

### 👨‍💼 Admin Panel Features
- **Game Management**: Add/edit/delete games
- **Image Gallery**: Select from 48+ pre-loaded game images
- **Win Information**: Configure amounts, player names, comments
- **Authentication**: Secure login system
- **Real-time Updates**: Changes reflect immediately

## 🗄️ Database

### Games Collection
- **17 active games** ready for display
- **Random selection** of 3 games per request
- **Win information** with amounts, players, comments

### Admin System
- **Secure authentication** with JWT tokens
- **Role-based access** to admin features

## 🌐 API Endpoints

### Public Endpoints
- `GET /api/games/daily` - Get 3 random games for display

### Admin Endpoints (Require Authentication)
- `GET /api/games/list` - List all games
- `POST /api/games/add` - Add new game
- `PUT /api/games/:id` - Update game
- `DELETE /api/games/:id` - Delete game
- `GET /api/games/images` - Get available images

## 🧪 Testing

Access test files at:
- **Admin Test**: http://localhost:3001/tests/test-admin-login.html
- **Complete Workflow**: http://localhost:3001/tests/test-complete-workflow.html
- **Admin Fixed**: http://localhost:3001/tests/test-admin-fixed.html

## 📖 Documentation

Detailed documentation available in `/docs/`:
- **Backend Setup**: `docs/README-backend.md`
- **Admin Guide**: `docs/ADMIN-PANEL-USER-GUIDE.md`
- **API Reference**: `docs/README.md`

## 🔧 Development

### Adding New Games
1. Login to admin panel
2. Go to "Daily Games" tab
3. Click "Add Game"
4. Select image from gallery
5. Fill in game details
6. Save

### Database Management
```bash
# Seed initial games (development only)
node temp/seed-games.js

# Add more games (development only)
node temp/add-more-games.js
```

## 🚀 Deployment

1. Install dependencies: `npm install`
2. Start MongoDB service
3. Run server: `npm start`
4. Access at: http://localhost:3001

## 📝 Notes

- **Images**: 48+ game images available in `/images/` folder
- **Fallback**: System has fallback data if database is empty
- **Mobile**: Optimized for 390px mobile screens
- **Security**: JWT authentication for admin features