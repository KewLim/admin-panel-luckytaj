# 🚀 LuckyTaj Admin Backend Setup Guide

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create or update the `.env` file with your configuration:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/lucky_taj_admin
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
ADMIN_EMAIL=admin@luckytaj.com
ADMIN_PASSWORD=admin123
NODE_ENV=development
```

**⚠️ IMPORTANT:** Change the default admin credentials and JWT secret in production!

### 3. Database Setup
Make sure MongoDB is running on your system, then create the admin user:

```bash
node scripts/setup-admin.js
```

### 4. Create Upload Directories
```bash
mkdir -p uploads/banners uploads/videos
```

### 5. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## 🌐 Access Points

- **Admin Panel:** http://localhost:3001/admin
- **API Base:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/health

## 🔐 Default Login Credentials

- **Email:** admin@luckytaj.com
- **Password:** admin123

**⚠️ Change these credentials immediately after first login!**

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout

### Banners
- `GET /api/banners` - Get all banners (admin only)
- `POST /api/banners` - Upload new banner
- `PATCH /api/banners/:id` - Update banner
- `DELETE /api/banners/:id` - Delete banner

### Comments
- `GET /api/comments` - Get all comments (admin only)
- `GET /api/comments/active` - Get active comments (public)
- `POST /api/comments` - Add new comment
- `PATCH /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Videos
- `GET /api/video` - Get current active video (public)
- `GET /api/video/all` - Get all videos (admin only)
- `POST /api/video/url` - Save YouTube URL
- `POST /api/video/upload` - Upload MP4 file
- `PATCH /api/video/:id` - Update video
- `DELETE /api/video/:id` - Delete video

## 📁 Project Structure

```
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── models/                # Database models
│   ├── Admin.js
│   ├── Banner.js
│   ├── Comment.js
│   └── Video.js
├── routes/                # API routes
│   ├── auth.js
│   ├── banners.js
│   ├── comments.js
│   └── video.js
├── middleware/            # Custom middleware
│   └── auth.js
├── admin-panel/           # Frontend admin panel
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── uploads/               # File uploads
│   ├── banners/
│   └── videos/
└── scripts/               # Utility scripts
    └── setup-admin.js
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- File upload validation
- CORS protection
- Rate limiting
- Helmet security headers
- Input validation
- File size limits

## 🎯 Admin Panel Features

### 1. Banner Management
- Upload images (JPG, PNG, WebP)
- Set titles and descriptions
- Activate/deactivate banners
- Delete unused banners
- Preview uploaded images

### 2. Fake Comments Management
- Add realistic user comments
- Set usernames and avatars
- Configure timestamps
- Activate/deactivate comments
- Edit existing comments

### 3. TV Session Videos
- Upload MP4 files or YouTube URLs
- Only one active video at a time
- Video history tracking
- Preview functionality

## 🚨 Production Considerations

1. **Change default credentials**
2. **Use strong JWT secret**
3. **Configure proper CORS origins**
4. **Set up HTTPS**
5. **Use cloud storage for uploads (AWS S3)**
6. **Set up proper logging**
7. **Configure MongoDB with authentication**
8. **Set up backup procedures**

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env
   - Verify database permissions

2. **File Upload Fails**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure proper MIME types

3. **Authentication Issues**
   - Verify JWT secret is set
   - Check token expiration
   - Ensure admin user exists

### Debug Mode
Set `NODE_ENV=development` in .env for detailed error messages.

## 📞 Support

For technical support, check the server logs and ensure all dependencies are properly installed.




🚀 LuckyTaj Backend Admin Panel - Complete User Guide

  📖 Overview

  The backend admin panel is a complete content management system for the LuckyTaj gambling
  platform. It allows admins to manage banner images, fake chat comments, and TV session
  videos through a secure web interface.

  ---
  📁 File Structure & Functions

  Core Backend Files

  # server.js - Main Server Application

  - Function: Entry point that starts the Express server
  - Features: Sets up middleware, routes, database connection, and security
  - Port: Runs on port 3001 by default
  - Security: Implements CORS, rate limiting, and helmet protection

  # package.json - Project Dependencies

  - Function: Defines all required Node.js packages and scripts
  - Key Dependencies: Express, MongoDB, JWT, Multer (file uploads), security packages
  - Scripts: npm start (production) and npm run dev (development with auto-restart)

  # .env - Environment Configuration

  - Function: Stores sensitive configuration like database URLs and secrets
  - Contains: MongoDB URI, JWT secret, admin credentials, server port
  - Security: Never commit this file - contains passwords and secrets

  ---
  Database Models (/models/ directory)

  Admin.js - Administrator User Model

  - Function: Defines admin user structure for authentication
  - Features: Email/password validation, automatic password hashing
  - Security: Uses bcrypt with 12 salt rounds for password protection

  Banner.js - Banner Image Management

  - Function: Stores uploaded banner images metadata
  - Fields: Title, filename, file size, MIME type, active status
  - Features: Tracks who uploaded each banner and when

  Comment.js - Fake Comments System

  - Function: Manages fake chat comments for user engagement
  - Fields: Username, comment text, avatar emoji, timestamp
  - Purpose: Creates illusion of active user engagement on frontend

  Video.js - TV Session Video Management

  - Function: Handles both YouTube URLs and uploaded MP4 videos
  - Features: Only one video can be active at a time
  - Types: Supports YouTube links and direct MP4 file uploads

  ---
  API Routes (/routes/ directory)

  auth.js - Authentication System

  - Function: Handles admin login/logout and token verification
  - Endpoints:
    - POST /api/auth/login - Admin login
    - GET /api/auth/verify - Check if token is valid
    - POST /api/auth/logout - Admin logout

  banners.js - Banner Management API

  - Function: CRUD operations for banner images
  - Features: File upload validation, image processing, status management
  - Security: Only authenticated admins can upload/modify banners

  comments.js - Comments Management API

  - Function: Manage fake comments that appear on the frontend
  - Special: Has public endpoint /api/comments/active for frontend to fetch
  - Features: Add, edit, activate/deactivate fake user comments

  video.js - Video Management API

  - Function: Handle TV session videos (YouTube URLs or MP4 uploads)
  - Features: Video file validation, YouTube URL parsing, active video switching
  - Limits: 100MB max for MP4 uploads

  ---
  Security & Middleware (/middleware/ directory)

  auth.js - Authentication Middleware

  - Function: Protects admin-only routes by verifying JWT tokens
  - Security: Checks token validity and admin permissions before allowing access
  - Usage: Applied to all admin API endpoints

  ---
  Admin Panel Frontend (/admin-panel/ directory)

  index.html - Admin Interface Structure

  - Function: Main admin panel HTML with login form and dashboard
  - Features: Tab navigation, modals for adding content, responsive design
  - Sections: Login screen, banners management, comments management, video management

  styles.css - Admin Panel Styling

  - Function: Professional styling for the admin interface
  - Features: Responsive design, modern UI components, loading states
  - Theme: Clean, professional look with LuckyTaj branding

  app.js - Admin Panel JavaScript

  - Function: Handles all frontend interactions and API communications
  - Features: Login handling, content management, file uploads, real-time updates
  - Security: Token-based authentication with automatic logout on expiry

  ---
  Utility Scripts (/scripts/ directory)

  setup-admin.js - Initial Admin Setup

  - Function: Creates the first admin user in the database
  - Usage: Run once during initial setup
  - Security: Uses environment variables for admin credentials

  ---
  Documentation

  README-backend.md - Original Requirements

  - Function: Contains the original specification for the admin panel
  - Content: Feature requirements, API specifications, security requirements

  README-BACKEND-SETUP.md - Setup Instructions

  - Function: Complete guide for installing and configuring the system
  - Content: Step-by-step setup, troubleshooting, API documentation

  ---
  🛠️ Complete Setup Guide (MongoDB Installation Required)

  Step 1: Install MongoDB

  For macOS:

  # Install MongoDB using Homebrew
  brew tap mongodb/brew
  brew install mongodb-community

  # Start MongoDB service
  brew services start mongodb/brew/mongodb-community

  For Windows:

  1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
  2. Run the installer and follow the setup wizard
  3. MongoDB will start automatically as a Windows service

  For Linux (Ubuntu/Debian):

  # Import MongoDB public GPG key
  curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o
  /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

  # Add MongoDB repository
  echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] 
  https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee
  /etc/apt/sources.list.d/mongodb-org-7.0.list

  # Update and install
  sudo apt-get update
  sudo apt-get install -y mongodb-org

  # Start MongoDB
  sudo systemctl start mongod
  sudo systemctl enable mongod

  Step 2: Verify MongoDB Installation

  # Check if MongoDB is running
  mongosh --eval "db.runCommand({ connectionStatus: 1 })"

  Step 3: Install Project Dependencies

  # Navigate to your project directory
  cd /Users/admin/Documents/landing-page

  # Install all required packages
  npm install

  Step 4: Configure Environment Variables

  Check your .env file and update if needed:
  PORT=3001
  MONGODB_URI=mongodb://localhost:27017/lucky_taj_admin
  JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
  ADMIN_EMAIL=admin@luckytaj.com
  ADMIN_PASSWORD=admin123
  NODE_ENV=development

  Step 5: Create Upload Directories

  mkdir -p uploads/banners uploads/videos

  Step 6: Setup Admin User

  node scripts/setup-admin.js
  You should see: "Admin user created successfully: admin@luckytaj.com"

  Step 7: Start the Admin Panel

  # Development mode (auto-restarts on changes)
  npm run dev

  # OR Production mode
  npm start

  Step 8: Access the Admin Panel

  1. Open your web browser
  2. Go to: http://localhost:3001/admin
  3. Login with:
    - Email: admin@luckytaj.com
    - Password: admin123

  ---
  🎯 How to Use the Admin Panel

  1. Banner Management

  - Purpose: Upload promotional banners for the gambling site
  - How to use:
    a. Click "Banners" tab
    b. Click "Add Banner" button
    c. Fill in title (optional) and select image file
    d. Click "Upload Banner"
    e. Use "Activate/Deactivate" to control which banners show
    f. Use "Delete" to remove unwanted banners

  2. Fake Comments Management

  - Purpose: Create realistic user engagement on the frontend
  - How to use:
    a. Click "Fake Comments" tab
    b. Click "Add Comment" button
    c. Enter username (like "LuckyRaju92")
    d. Write comment in Romanized Hindi (like "Bhai full paisa vasool!")
    e. Select avatar emoji and timestamp
    f. Click "Save Comment"
    g. Activate/deactivate comments as needed

  3. TV Session Videos

  - Purpose: Manage the main video content shown on the site
  - How to use:
    a. Click "TV Session" tab
    b. Click "Add Video" button
    c. Choose either:
        - YouTube URL: Paste YouTube link
      - Upload MP4: Select video file from computer
    d. Add title and description (optional)
    e. Click "Save Video URL" or "Upload Video"
    f. Only one video can be active at a time

  ---
  🔧 Troubleshooting Common Issues

  MongoDB Connection Error

  - Problem: "MongoDB connection error"
  - Solution: Make sure MongoDB is running: brew services start 
  mongodb/brew/mongodb-community

  Port Already in Use

  - Problem: "Port 3001 is already in use"
  - Solution: Kill existing process: lsof -ti:3001 | xargs kill -9

  Admin User Not Found

  - Problem: Can't login with default credentials
  - Solution: Run setup script again: node scripts/setup-admin.js

  File Upload Fails

  - Problem: Images/videos won't upload
  - Solution: Check upload directories exist: mkdir -p uploads/banners uploads/videos

  ---
  🚨 Important Security Notes

  1. Change Default Password: Immediately change admin password after first login
  2. Update JWT Secret: Use a strong, unique JWT secret in production
  3. Database Security: Set up MongoDB authentication for production
  4. HTTPS: Use HTTPS in production (not HTTP)
  5. Backup: Regularly backup your MongoDB database

  ---
  📞 Getting Started Checklist

  - MongoDB installed and running
  - Project dependencies installed (npm install)
  - Upload directories created
  - Admin user created (node scripts/setup-admin.js)
  - Server started (npm run dev)
  - Admin panel accessible at http://localhost:3001/admin
  - Successfully logged in with default credentials
  - Changed default admin password

  Once you complete this checklist, your admin panel will be fully operational and ready to
  manage content for the LuckyTaj gambling platform!
