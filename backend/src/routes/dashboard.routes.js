const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

/**
 * @route   GET /api/dashboard
 * @desc    Get protected dashboard data
 * @access  Private (Requires valid Access Token)
 */
router.get('/', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Protected Executive Dashboard',
    user: {
      id: req.user.sub,
      email: req.user.email,
      name: req.user.name
    },
    metrics: {
      totalUsers: 1250,
      activeSessions: 42,
      securityScore: '98/100 (A+)',
      authMethod: 'Dual-Token JWT (Access + HttpOnly Refresh)',
      systemStatus: 'Operational',
      lastLogin: new Date().toISOString()
    },
    recentActivities: [
      { id: 1, action: 'User authentication', timestamp: new Date(Date.now() - 500000).toISOString(), ip: '192.168.1.1' },
      { id: 2, action: 'Access Token issued (15m expiry)', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'Success' },
      { id: 3, action: 'HttpOnly Refresh Token rotated in DB', timestamp: new Date(Date.now() - 100000).toISOString(), status: 'Success' }
    ]
  });
});

module.exports = router;
