# 🔧 Backend Admin Panel for Player Engagement Platform

## 📌 Overview

This backend panel will be used by site admins to manage **visual and interactive content** shown on the frontend of a gambling/entertainment site. The backend must be clean, password-protected, and optimized for quick content updates.

---

## 🔐 Auth & Access Control

- Admin login required (simple session-based or token auth is fine)
- Only verified admin can access dashboard to:
  - Upload/change banner images
  - Add/edit/delete fake chat-style comments
  - Upload or update a video URL for the "TV Session" section

---

## 📁 Features Required

### 1. 🎞 Banner Image Manager

- **Upload multiple image banners** (jpg, png, webp)
- Each banner has:
  - `Title` (optional)
  - `Image` file upload
  - `Active` status toggle (so old ones can be kept but hidden)
- Save to a folder like `/uploads/banners/`
- Store metadata in a DB (filename, title, active, upload date)

---

### 2. 💬 Fake Comments Manager

Create and manage **chat-style user comments** shown live on the frontend.

Each comment object will include:
- `username` (string, e.g., "LuckyNeha")
- `comment` (string, e.g., "Crazy Time ka bonus round hit kiya!")
- `avatar` (emoji or icon string)
- `timestamp` (optional – relative time like "5 mins ago")

Backend UI should:
- List all comments
- Add new comment
- Edit/delete existing ones
- Save in DB as an array or collection called `commentsFeed`

---

### 3. 📺 TV Session Video Uploader

- Admin should be able to upload:
  - A **YouTube link** or **.mp4 video link**
- Only one video should be active at a time (optional history view)
- Store as:
  ```json
  {
    "videoType": "youtube" | "mp4",
    "videoUrl": "https://youtube.com/xyz" or "/uploads/tv-session.mp4",
    "uploadedAt": timestamp
  }
🗃 Database Requirements
A NoSQL database (e.g., MongoDB) is preferred, but SQL is acceptable.

Recommended collections/tables:

banners

commentsFeed

tvSessionVideo

🚀 API Endpoints (Suggestion)
Method	Route	Description
GET	/api/banners	Get all banners
POST	/api/banners	Upload new banner
PATCH	/api/banners/:id	Edit banner
DELETE	/api/banners/:id	Delete banner
GET	/api/comments	Get all comments
POST	/api/comments	Add a new comment
DELETE	/api/comments/:id	Delete a comment
POST	/api/video	Upload/update video URL
GET	/api/video	Get current active video

🔒 Security
Admin login (basic email/password with hash or JWT auth)

No public uploads or routes exposed without login

All uploaded files should be sanitized and limited in size

📂 File Upload Notes
Use /uploads/banners/ for images

Use /uploads/videos/ for mp4s (if supported)

Validate all MIME types during upload

📄 Optional: Tech Stack Suggestions
Backend: Node.js (Express) / Python (Flask or Django)

Frontend Admin Panel: Plain HTML/CSS/JS or React/Vue

Storage: Local filesystem for media or AWS S3 (if cloud-ready)

Database: MongoDB or SQLite/Postgres

✅ Final Goal
Claude, build a secure admin panel with simple navigation tabs:

Banners

Fake Comments

TV Session

Each tab allows admin to manage content, and the backend exposes a clean API for the frontend to consume.