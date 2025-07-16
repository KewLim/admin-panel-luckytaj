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