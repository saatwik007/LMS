const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { profileImageUpload } = require('../middlewares/upload.middleware');

const router = express.Router();

router.post('/user/register', authController.registerUser);
router.post('/user/login', authController.loginUser);
router.get('/user/me', protect, authController.getCurrentUser);
router.get('/user/:userId/public', protect, authController.getPublicProfile);
router.patch('/user/profile', protect, authController.updateProfile);
router.patch('/user/profile/image', protect, profileImageUpload, authController.uploadProfileImage);
router.get('/user/notifications', protect, authController.getNotifications);
router.patch('/user/notifications/:notificationId/read', protect, authController.markNotificationRead);
router.patch('/user/streak', protect, authController.updateStreak);
router.post('/user/rewards/claim', protect, authController.claimReward);
router.get('/user/logout', authController.logoutUser);

module.exports = router;
