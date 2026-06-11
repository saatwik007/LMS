const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const learningController = require('../controllers/learning.controller');

const router = express.Router();

router.get('/catalog', protect, learningController.getCourseCatalog);
router.get('/me/overview', protect, learningController.getMyLearningOverview);
router.post('/courses/:courseSlug/enroll', protect, learningController.enrollInCourse);
router.patch('/courses/:courseSlug/progress', protect, learningController.updateCourseProgress);
router.get('/leaderboard', protect, learningController.getLeaderboardHandler);
router.get('/me/progress', protect, learningController.getMyProgress);
router.get('/me/activity', protect, learningController.getActivityHeatmap);
router.get('/weekly-progress', protect, async (req, res) => {
  const { startDate, endDate } = req.query;
  const userId = req.user.id;

  try {
    // Fetch lessons completed this week
    const lessonsCompleted = await Challenge.countDocuments({
      userId,
      completedAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      isCompleted: true
    });

    // Fetch XP earned this week
    const xpData = await UserProgress.findOne({ userId });
    const weeklyXp = xpData?.weeklyXp || 0;

    // Count unique days studied
    const activities = await UserProgress.findOne({ userId });
    const daysStudied = activities?.weekDaysStudied || 0;

    res.json({
      lessonsCompleted,
      xpEarned: weeklyXp,
      daysStudied
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
