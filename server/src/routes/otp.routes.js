const express = require('express');
const { sendOtp, verifyOtp, logout } = require('../controllers/otp.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public
router.post('/send', sendOtp);
router.post('/verify', verifyOtp);
router.post('/logout', logout);

// Optional protected test route
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;