const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const Video = require('../models/Video');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/videos/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit for videos
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only MP4, WebM, and OGG videos are allowed.'));
        }
    }
});

// Get current active video
router.get('/', async (req, res) => {
    try {
        const video = await Video.findOne({ isActive: true })
            .populate('uploadedBy', 'email')
            .sort({ createdAt: -1 });
        
        res.json(video);
    } catch (error) {
        console.error('Get video error:', error);
        res.status(500).json({ error: 'Failed to fetch video' });
    }
});

// Get all videos (admin only)
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const videos = await Video.find()
            .populate('uploadedBy', 'email')
            .sort({ createdAt: -1 });
        
        res.json(videos);
    } catch (error) {
        console.error('Get all videos error:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

// Upload/Update video URL (YouTube)
router.post('/url', authMiddleware, [
    body('videoType').isIn(['youtube', 'mp4']),
    body('videoUrl').trim().isLength({ min: 1 }),
    body('title').optional().trim().isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 500 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Invalid input', details: errors.array() });
        }

        const { videoType, videoUrl, title, description } = req.body;

        // Validate YouTube URL if type is youtube
        if (videoType === 'youtube') {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
            if (!youtubeRegex.test(videoUrl)) {
                return res.status(400).json({ error: 'Invalid YouTube URL' });
            }
        }

        const video = new Video({
            videoType,
            videoUrl,
            title: title || '',
            description: description || '',
            uploadedBy: req.admin._id
        });

        await video.save();
        await video.populate('uploadedBy', 'email');

        res.status(201).json({
            message: 'Video URL saved successfully',
            video
        });
    } catch (error) {
        console.error('Video URL save error:', error);
        res.status(500).json({ error: 'Failed to save video URL' });
    }
});

// Upload video file
router.post('/upload', authMiddleware, upload.single('video'), [
    body('title').optional().trim().isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 500 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Invalid input', details: errors.array() });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        const videoUrl = `/uploads/videos/${req.file.filename}`;

        const video = new Video({
            videoType: 'mp4',
            videoUrl: videoUrl,
            title: req.body.title || '',
            description: req.body.description || '',
            uploadedBy: req.admin._id
        });

        await video.save();
        await video.populate('uploadedBy', 'email');

        res.status(201).json({
            message: 'Video uploaded successfully',
            video
        });
    } catch (error) {
        console.error('Video upload error:', error);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});

// Update video
router.patch('/:id', authMiddleware, [
    body('title').optional().trim().isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('isActive').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Invalid input', details: errors.array() });
        }

        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Update allowed fields
        if (req.body.title !== undefined) video.title = req.body.title;
        if (req.body.description !== undefined) video.description = req.body.description;
        if (req.body.isActive !== undefined) video.isActive = req.body.isActive;

        await video.save();
        await video.populate('uploadedBy', 'email');

        res.json({
            message: 'Video updated successfully',
            video
        });
    } catch (error) {
        console.error('Video update error:', error);
        res.status(500).json({ error: 'Failed to update video' });
    }
});

// Delete video
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Delete file from filesystem if it's an uploaded MP4
        if (video.videoType === 'mp4' && video.videoUrl.startsWith('/uploads/')) {
            try {
                const filename = path.basename(video.videoUrl);
                await fs.unlink(path.join('uploads/videos', filename));
            } catch (fileError) {
                console.warn('Failed to delete video file:', fileError.message);
            }
        }

        // Delete from database
        await Video.findByIdAndDelete(req.params.id);

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Video delete error:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

module.exports = router;