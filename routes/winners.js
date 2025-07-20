const express = require('express');
const router = express.Router();
const Winner = require('../models/Winner');
const authMiddleware = require('../middleware/auth');

// Get all winners
router.get('/', authMiddleware, async (req, res) => {
    try {
        const winners = await Winner.find().sort({ createdAt: -1 });
        res.json(winners);
    } catch (error) {
        console.error('Error fetching winners:', error);
        res.status(500).json({ error: 'Failed to fetch winners' });
    }
});

// Get active winners (public endpoint for frontend)
router.get('/active', async (req, res) => {
    try {
        const winners = await Winner.find({ active: true })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(winners);
    } catch (error) {
        console.error('Error fetching active winners:', error);
        res.status(500).json({ error: 'Failed to fetch active winners' });
    }
});

// Add new winner
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, amount, game, timeAgo } = req.body;

        if (!name || !amount || !game || !timeAgo) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const winner = new Winner({
            name,
            amount,
            game,
            timeAgo,
            createdBy: req.admin.id
        });

        await winner.save();

        res.status(201).json({ 
            message: 'Winner added successfully',
            winner 
        });
    } catch (error) {
        console.error('Error adding winner:', error);
        res.status(500).json({ error: 'Failed to add winner' });
    }
});

// Update winner
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { name, amount, game, timeAgo, active } = req.body;
        
        const winner = await Winner.findById(req.params.id);
        if (!winner) {
            return res.status(404).json({ error: 'Winner not found' });
        }

        winner.name = name || winner.name;
        winner.amount = amount || winner.amount;
        winner.game = game || winner.game;
        winner.timeAgo = timeAgo || winner.timeAgo;
        if (typeof active !== 'undefined') {
            winner.active = active;
        }

        await winner.save();

        res.json({ 
            message: 'Winner updated successfully',
            winner 
        });
    } catch (error) {
        console.error('Error updating winner:', error);
        res.status(500).json({ error: 'Failed to update winner' });
    }
});

// Delete winner
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const winner = await Winner.findById(req.params.id);
        if (!winner) {
            return res.status(404).json({ error: 'Winner not found' });
        }

        await Winner.findByIdAndDelete(req.params.id);

        res.json({ message: 'Winner deleted successfully' });
    } catch (error) {
        console.error('Error deleting winner:', error);
        res.status(500).json({ error: 'Failed to delete winner' });
    }
});

module.exports = router;