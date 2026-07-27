const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, me } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', verifyToken, me);

module.exports = router;
