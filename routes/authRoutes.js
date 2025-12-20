const express = require('express');
const router = express.Router();
const { register, login, getMe, updateXp, updateVp, getAllUsers } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.post('/xp/update', authMiddleware, updateXp);
router.post('/vp/update', authMiddleware, updateVp);
router.get('/users', authMiddleware, getAllUsers);

module.exports = router;
