const express = require('express');
const router = express.Router();
const { generateTasks } = require('../controllers/geminiController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes
router.post('/generate-tasks', authMiddleware, generateTasks);

module.exports = router;
