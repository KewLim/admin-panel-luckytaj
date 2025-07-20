const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const bannerRoutes = require('./routes/banners');
const commentRoutes = require('./routes/comments');
const videoRoutes = require('./routes/video');
const gamesRoutes = require('./routes/games');
const winnersRoutes = require('./routes/winners');
const jackpotRoutes = require('./routes/jackpot');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? ['https://www.luckytaj.com'] : true,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve favicon files
app.use('/luckytaj-favicon', express.static(path.join(__dirname, 'luckytaj-favicon')));

// Serve admin panel static files
app.use('/admin', express.static(path.join(__dirname, 'admin-panel')));

// Serve main frontend files
app.use(express.static(__dirname, { 
    ignore: ['node_modules', 'admin-panel', 'uploads', 'models', 'routes', 'middleware', 'scripts']
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/winners', winnersRoutes);
app.use('/api/jackpot', jackpotRoutes);

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-panel', 'index.html'));
});

// Serve main frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
    });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, () => {
    console.log(`Admin backend server running on port ${PORT}`);
    console.log(`Admin panel available at: http://localhost:${PORT}/admin`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
});