const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const learningController = require('../controllers/learning.controller');

const router = express.Router();

router.get('/catalog', protect, learningController.getCourseCatalog);
router.get('/me/overview', protect, learningController.getMyLearningOverview);
router.post('/courses/:courseSlug/enroll', protect, learningController.enrollInCourse);
router.patch('/courses/:courseSlug/progress', protect, learningController.updateCourseProgress);
router.get('/leaderboard', protect, learningController.getLeaderboardHandler);
router.get('/me/activity', protect, learningController.getActivityHeatmap);

module.exports = router;
