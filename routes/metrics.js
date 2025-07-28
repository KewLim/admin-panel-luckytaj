const express = require('express');
const router = express.Router();
const UserInteraction = require('../models/UserInteraction');
const auth = require('../middleware/auth');

// Helper function to detect device type from user agent
function getDeviceInfo(userAgent) {
    const ua = userAgent.toLowerCase();
    let deviceType = 'desktop';
    let os = 'Unknown';
    let browser = 'Unknown';
    
    // Device type detection
    if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(ua)) {
        deviceType = 'mobile';
    } else if (/tablet|ipad/.test(ua)) {
        deviceType = 'tablet';
    }
    
    // OS detection
    if (/windows/.test(ua)) os = 'Windows';
    else if (/macintosh|mac os x/.test(ua)) os = 'Mac';
    else if (/android/.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/.test(ua)) os = 'iOS';
    else if (/linux/.test(ua)) os = 'Linux';
    
    // Browser detection
    if (/chrome/.test(ua)) browser = 'Chrome';
    else if (/firefox/.test(ua)) browser = 'Firefox';
    else if (/safari/.test(ua)) browser = 'Safari';
    else if (/edge/.test(ua)) browser = 'Edge';
    
    return { deviceType, os, browser };
}

// Helper function to generate tip ID
function generateTipId() {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `tip_${date}_${random}`;
}

// PUBLIC ENDPOINTS (No authentication required)

// Track tip view
router.post('/track/view', async (req, res) => {
    try {
        const { tipId, sessionId, userId } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
        const userAgent = req.get('User-Agent') || '';
        const deviceInfo = getDeviceInfo(userAgent);
        
        const interaction = new UserInteraction({
            tipId: tipId || generateTipId(),
            sessionId,
            userId,
            ipAddress,
            interactionType: 'view',
            deviceInfo: {
                ...deviceInfo,
                userAgent
            },
            referrer: req.get('Referer') || '',
            pageUrl: req.body.pageUrl || ''
        });
        
        await interaction.save();
        res.json({ success: true, tipId: interaction.tipId });
    } catch (error) {
        console.error('Error tracking view:', error);
        // Return success even if database fails to prevent blocking user experience
        res.json({ success: true, tipId: generateTipId(), warning: 'Database unavailable' });
    }
});

// Track tip click
router.post('/track/click', async (req, res) => {
    try {
        const { tipId, sessionId, userId, clickUrl, clickTarget } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent') || '';
        const deviceInfo = getDeviceInfo(userAgent);
        
        const interaction = new UserInteraction({
            tipId,
            sessionId,
            userId,
            ipAddress,
            interactionType: 'click',
            deviceInfo: {
                ...deviceInfo,
                userAgent
            },
            clickUrl,
            clickTarget,
            referrer: req.get('Referer') || '',
            pageUrl: req.body.pageUrl || ''
        });
        
        await interaction.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking click:', error);
        res.status(500).json({ error: 'Failed to track click' });
    }
});

// Track time spent
router.post('/track/time', async (req, res) => {
    try {
        const { tipId, sessionId, userId, timeSpentMs } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent') || '';
        const deviceInfo = getDeviceInfo(userAgent);
        
        const interaction = new UserInteraction({
            tipId,
            sessionId,
            userId,
            ipAddress,
            interactionType: 'time_spent',
            timeSpentMs: parseInt(timeSpentMs),
            deviceInfo: {
                ...deviceInfo,
                userAgent
            },
            referrer: req.get('Referer') || '',
            pageUrl: req.body.pageUrl || ''
        });
        
        await interaction.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error tracking time:', error);
        res.status(500).json({ error: 'Failed to track time' });
    }
});

// ADMIN ENDPOINTS (Authentication required)

// Get overview metrics
router.get('/overview', auth, async (req, res) => {
    try {
        const { days = 1 } = req.query;
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - (parseInt(days) * 24 * 60 * 60 * 1000));
        
        const [totalViews, uniqueVisitors, clickThroughRate, avgTimeOnPage] = await Promise.all([
            UserInteraction.getTotalViews(startDate, endDate),
            UserInteraction.getUniqueVisitors(startDate, endDate),
            UserInteraction.getClickThroughRate(startDate, endDate),
            UserInteraction.getAverageTimeOnPage(startDate, endDate)
        ]);
        
        // Get previous period for comparison
        const prevStartDate = new Date(startDate.getTime() - (parseInt(days) * 24 * 60 * 60 * 1000));
        const [prevViews, prevVisitors, prevCTR, prevAvgTime] = await Promise.all([
            UserInteraction.getTotalViews(prevStartDate, startDate),
            UserInteraction.getUniqueVisitors(prevStartDate, startDate),
            UserInteraction.getClickThroughRate(prevStartDate, startDate),
            UserInteraction.getAverageTimeOnPage(prevStartDate, startDate)
        ]);
        
        // Calculate percentage changes
        const calculateChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous * 100).toFixed(1);
        };
        
        res.json({
            totalViews: {
                value: totalViews,
                change: calculateChange(totalViews, prevViews)
            },
            uniqueVisitors: {
                value: uniqueVisitors,
                change: calculateChange(uniqueVisitors, prevVisitors)
            },
            clickThroughRate: {
                value: parseFloat(clickThroughRate),
                change: calculateChange(parseFloat(clickThroughRate), parseFloat(prevCTR))
            },
            avgTimeOnPage: {
                value: avgTimeOnPage,
                change: calculateChange(avgTimeOnPage, prevAvgTime)
            }
        });
    } catch (error) {
        console.error('Error getting overview metrics:', error);
        res.status(500).json({ error: 'Failed to get overview metrics' });
    }
});

// Get device distribution
router.get('/devices', auth, async (req, res) => {
    try {
        const { days = 1 } = req.query;
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - (parseInt(days) * 24 * 60 * 60 * 1000));
        
        const distribution = await UserInteraction.getDeviceDistribution(startDate, endDate);
        res.json(distribution);
    } catch (error) {
        console.error('Error getting device distribution:', error);
        res.status(500).json({ error: 'Failed to get device distribution' });
    }
});

// Get tip performance
router.get('/tips', auth, async (req, res) => {
    try {
        const { days = 1 } = req.query;
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - (parseInt(days) * 24 * 60 * 60 * 1000));
        
        const performance = await UserInteraction.getTipPerformance(startDate, endDate);
        res.json(performance);
    } catch (error) {
        console.error('Error getting tip performance:', error);
        res.status(500).json({ error: 'Failed to get tip performance' });
    }
});

// Get metrics trend (for charts)
router.get('/trend', auth, async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const trend = await UserInteraction.getMetricsTrend(parseInt(days));
        res.json(trend);
    } catch (error) {
        console.error('Error getting metrics trend:', error);
        res.status(500).json({ error: 'Failed to get metrics trend' });
    }
});

// Get real-time metrics (last hour)
router.get('/realtime', auth, async (req, res) => {
    try {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - (60 * 60 * 1000)); // Last hour
        
        const pipeline = [
            {
                $match: {
                    timestamp: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        minute: { $minute: '$timestamp' },
                        interactionType: '$interactionType'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.minute',
                    views: {
                        $sum: {
                            $cond: [{ $eq: ['$_id.interactionType', 'view'] }, '$count', 0]
                        }
                    },
                    clicks: {
                        $sum: {
                            $cond: [{ $eq: ['$_id.interactionType', 'click'] }, '$count', 0]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ];
        
        const realtimeData = await UserInteraction.aggregate(pipeline);
        res.json(realtimeData);
    } catch (error) {
        console.error('Error getting realtime metrics:', error);
        res.status(500).json({ error: 'Failed to get realtime metrics' });
    }
});

// Clean old data (optional endpoint for maintenance)
router.delete('/cleanup', auth, async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const cutoffDate = new Date(Date.now() - (parseInt(days) * 24 * 60 * 60 * 1000));
        
        const result = await UserInteraction.deleteMany({
            timestamp: { $lt: cutoffDate }
        });
        
        res.json({
            success: true,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error cleaning up old data:', error);
        res.status(500).json({ error: 'Failed to cleanup old data' });
    }
});

module.exports = router;