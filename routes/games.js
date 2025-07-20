const express = require('express');
const router = express.Router();
const GameConfig = require('../models/GameConfig');
const authMiddleware = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

// Get current games configuration
router.get('/config', authMiddleware, async (req, res) => {
    try {
        let config = await GameConfig.findOne().sort({ createdAt: -1 });
        
        if (!config) {
            config = new GameConfig({
                totalGames: 6,
                refreshTime: '12:00',
                createdBy: req.admin.id
            });
            await config.save();
        }

        res.json(config);
    } catch (error) {
        console.error('Error fetching games config:', error);
        res.status(500).json({ error: 'Failed to fetch games configuration' });
    }
});

// Update games configuration
router.post('/config', authMiddleware, async (req, res) => {
    try {
        const { totalGames, refreshTime } = req.body;

        if (!totalGames || !refreshTime) {
            return res.status(400).json({ error: 'Total games and refresh time are required' });
        }

        if (totalGames < 3 || totalGames > 12) {
            return res.status(400).json({ error: 'Total games must be between 3 and 12' });
        }

        const config = new GameConfig({
            totalGames,
            refreshTime,
            createdBy: req.admin.id
        });

        await config.save();

        res.json({ 
            message: 'Games configuration updated successfully',
            config 
        });
    } catch (error) {
        console.error('Error updating games config:', error);
        res.status(500).json({ error: 'Failed to update games configuration' });
    }
});

// Get current games status
router.get('/status', authMiddleware, async (req, res) => {
    try {
        const gamesPath = path.join(__dirname, '../games-data.json');
        
        try {
            const gamesData = await fs.readFile(gamesPath, 'utf8');
            const games = JSON.parse(gamesData);
            
            const config = await GameConfig.findOne().sort({ createdAt: -1 });
            
            res.json({
                totalGames: games.gamesPool?.length || 0,
                configuredGames: config?.totalGames || 6,
                lastRefresh: config?.lastRefresh || new Date(),
                refreshTime: config?.refreshTime || '12:00'
            });
        } catch (fileError) {
            res.json({
                totalGames: 0,
                configuredGames: 6,
                lastRefresh: new Date(),
                refreshTime: '12:00',
                error: 'Games data file not found'
            });
        }
    } catch (error) {
        console.error('Error fetching games status:', error);
        res.status(500).json({ error: 'Failed to fetch games status' });
    }
});

// Force refresh games pool
router.post('/refresh', authMiddleware, async (req, res) => {
    try {
        const config = await GameConfig.findOne().sort({ createdAt: -1 });
        
        if (config) {
            config.lastRefresh = new Date();
            await config.save();
        }

        res.json({ 
            message: 'Games pool refreshed successfully',
            lastRefresh: new Date()
        });
    } catch (error) {
        console.error('Error refreshing games:', error);
        res.status(500).json({ error: 'Failed to refresh games pool' });
    }
});

module.exports = router;