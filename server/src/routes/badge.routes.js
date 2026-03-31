const express = require('express');
const { getAllBadgesWithStatus, getUserBadges } = require('../controllers/badge.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all badges with user's earn status
router.get('/', protect, getAllBadgesWithStatus);

// Get user's earned badges
router.get('/earned', protect, getUserBadges);

module.exports = router;
