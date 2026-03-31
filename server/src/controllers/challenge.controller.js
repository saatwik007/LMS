const Challenge = require('../models/challenge.model');
const UserChallenge = require('../models/userChallenge.model');
const User = require('../models/user.model');
const UserProgress = require('../models/userProgress.model');

// Helper function to compute league from XP
function computeLeague(totalXp) {
  // Diamond: 6000+
  if (totalXp >= 15000) return 'Diamond 3';
  if (totalXp >= 10000) return 'Diamond 2';
  if (totalXp >= 6000) return 'Diamond 1';
  
  // Platinum: 3000-5999
  if (totalXp >= 5000) return 'Platinum 3';
  if (totalXp >= 4000) return 'Platinum 2';
  if (totalXp >= 3000) return 'Platinum 1';
  
  // Gold: 1500-2999
  if (totalXp >= 2500) return 'Gold 3';
  if (totalXp >= 2000) return 'Gold 2';
  if (totalXp >= 1500) return 'Gold 1';
  
  // Silver: 500-1499
  if (totalXp >= 1167) return 'Silver 3';
  if (totalXp >= 834) return 'Silver 2';
  if (totalXp >= 500) return 'Silver 1';
  
  // Bronze: 0-499
  if (totalXp >= 334) return 'Bronze 3';
  if (totalXp >= 167) return 'Bronze 2';
  return 'Bronze 1';
}

// Helper to ensure default challenges exist
async function ensureDefaultChallenges() {
  const now = new Date();
  
  // Daily challenges
  const dailyStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dailyEnd = new Date(dailyStart);
  dailyEnd.setDate(dailyEnd.getDate() + 1);

  const dailyChallenges = [
    {
      type: 'daily',
      title: 'Earn 50 XP',
      description: 'Complete lessons to earn 50 XP today',
      goalMetric: 'xp_earned',
      goalValue: 50,
      xpReward: 25,
      startsAt: dailyStart,
      expiresAt: dailyEnd
    },
    {
      type: 'daily',
      title: 'Complete 3 Lessons',
      description: 'Finish 3 lessons with 90% or higher',
      goalMetric: 'lessons_completed',
      goalValue: 3,
      xpReward: 30,
      startsAt: dailyStart,
      expiresAt: dailyEnd
    },
    {
      type: 'daily',
      title: 'Perfect Streak',
      description: 'Get 10 correct answers in a row',
      goalMetric: 'perfect_scores',
      goalValue: 1,
      xpReward: 40,
      startsAt: dailyStart,
      expiresAt: dailyEnd
    }
  ];

  // Weekly challenges
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weeklyChallenges = [
    {
      type: 'weekly',
      title: 'Earn 500 XP',
      description: 'Accumulate 500 XP this week',
      goalMetric: 'xp_earned',
      goalValue: 500,
      xpReward: 100,
      startsAt: weekStart,
      expiresAt: weekEnd
    },
    {
      type: 'weekly',
      title: 'Complete 20 Lessons',
      description: 'Finish 20 lessons this week',
      goalMetric: 'lessons_completed',
      goalValue: 20,
      xpReward: 150,
      startsAt: weekStart,
      expiresAt: weekEnd
    },
    {
      type: 'weekly',
      title: '7-Day Streak',
      description: 'Log in and learn every day this week',
      goalMetric: 'streak_days',
      goalValue: 7,
      xpReward: 200,
      startsAt: weekStart,
      expiresAt: weekEnd
    }
  ];

  // Monthly challenges
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  const monthlyChallenges = [
    {
      type: 'monthly',
      title: 'Earn 2000 XP',
      description: 'Accumulate 2000 XP this month',
      goalMetric: 'xp_earned',
      goalValue: 2000,
      xpReward: 500,
      startsAt: monthStart,
      expiresAt: monthEnd
    },
    {
      type: 'monthly',
      title: 'Complete 100 Lessons',
      description: 'Finish 100 lessons this month',
      goalMetric: 'lessons_completed',
      goalValue: 100,
      xpReward: 600,
      startsAt: monthStart,
      expiresAt: monthEnd
    },
    {
      type: 'monthly',
      title: 'Master 3 Courses',
      description: 'Enroll in and complete 3 courses',
      goalMetric: 'courses_enrolled',
      goalValue: 3,
      xpReward: 800,
      startsAt: monthStart,
      expiresAt: monthEnd
    }
  ];

  const allChallenges = [...dailyChallenges, ...weeklyChallenges, ...monthlyChallenges];

  for (const challengeData of allChallenges) {
    await Challenge.findOneAndUpdate(
      { 
        type: challengeData.type,
        title: challengeData.title,
        startsAt: challengeData.startsAt
      },
      { $set: { ...challengeData, isActive: true } },
      { upsert: true }
    );
  }

  // Deactivate expired challenges
  await Challenge.updateMany(
    { expiresAt: { $lt: now }, isActive: true },
    { $set: { isActive: false } }
  );
}

// Calculate user's progress for a specific challenge
async function calculateProgress(userId, challenge) {
  const periodStart = challenge.startsAt;
  const periodEnd = challenge.expiresAt;

  switch (challenge.goalMetric) {
    case 'xp_earned': {
      const progressDocs = await UserProgress.find({
        user: userId,
        updatedAt: { $gte: periodStart, $lte: periodEnd }
      });
      const totalXp = progressDocs.reduce((sum, doc) => sum + (doc.totalPoints || 0), 0);
      return Math.min(totalXp, challenge.goalValue);
    }

    case 'lessons_completed': {
      const progressDocs = await UserProgress.find({
        user: userId,
        updatedAt: { $gte: periodStart, $lte: periodEnd }
      });
      let completedCount = 0;
      progressDocs.forEach((doc) => {
        const completed = (doc.lectureProgress || []).filter(
          (lec) => lec.completed && lec.completedAt >= periodStart && lec.completedAt <= periodEnd
        );
        completedCount += completed.length;
      });
      return Math.min(completedCount, challenge.goalValue);
    }

    case 'streak_days': {
      const user = await User.findById(userId).select('streakCount');
      return Math.min(user?.streakCount || 0, challenge.goalValue);
    }

    case 'perfect_scores': {
      // For now, simplified logic - in production you'd track this separately
      const progressDocs = await UserProgress.find({
        user: userId,
        updatedAt: { $gte: periodStart, $lte: periodEnd }
      });
      let perfectCount = 0;
      progressDocs.forEach((doc) => {
        const perfect = (doc.lectureProgress || []).filter(
          (lec) => lec.points >= 100 && lec.completedAt >= periodStart && lec.completedAt <= periodEnd
        );
        perfectCount += perfect.length;
      });
      return Math.min(perfectCount, challenge.goalValue);
    }

    case 'courses_enrolled': {
      const enrolledCount = await UserProgress.countDocuments({
        user: userId,
        createdAt: { $gte: periodStart, $lte: periodEnd }
      });
      return Math.min(enrolledCount, challenge.goalValue);
    }

    default:
      return 0;
  }
}

// Get active challenges with user progress
async function getActiveChallenges(req, res) {
  try {
    await ensureDefaultChallenges();

    const type = req.query.type; // 'daily', 'weekly', 'monthly', or omit for all
    const now = new Date();

    const filter = {
      isActive: true,
      expiresAt: { $gt: now }
    };

    if (type && ['daily', 'weekly', 'monthly'].includes(type)) {
      filter.type = type;
    }

    const challenges = await Challenge.find(filter).sort({ type: 1, createdAt: 1 });

    const challengesWithProgress = await Promise.all(
      challenges.map(async (challenge) => {
        let userChallengeDoc = await UserChallenge.findOne({
          user: req.user.id,
          challenge: challenge._id
        });

        // Calculate current progress
        const currentProgress = await calculateProgress(req.user.id, challenge);

        // Create or update UserChallenge document
        if (!userChallengeDoc) {
          userChallengeDoc = await UserChallenge.create({
            user: req.user.id,
            challenge: challenge._id,
            progress: currentProgress,
            completed: currentProgress >= challenge.goalValue
          });
        } else {
          userChallengeDoc.progress = currentProgress;
          if (currentProgress >= challenge.goalValue && !userChallengeDoc.completed) {
            userChallengeDoc.completed = true;
            userChallengeDoc.completedAt = new Date();
          }
          await userChallengeDoc.save();
        }

        return {
          id: String(challenge._id),
          type: challenge.type,
          title: challenge.title,
          description: challenge.description,
          goalMetric: challenge.goalMetric,
          goalValue: challenge.goalValue,
          progress: userChallengeDoc.progress,
          completed: userChallengeDoc.completed,
          rewardClaimed: userChallengeDoc.rewardClaimed,
          xpReward: challenge.xpReward,
          expiresAt: challenge.expiresAt
        };
      })
    );

    return res.status(200).json({ challenges: challengesWithProgress });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Claim reward for a completed challenge
async function claimReward(req, res) {
  try {
    const challengeId = req.params.challengeId;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found.' });
    }

    const userChallenge = await UserChallenge.findOne({
      user: req.user.id,
      challenge: challengeId
    });

    if (!userChallenge) {
      return res.status(404).json({ message: 'You have not started this challenge.' });
    }

    if (!userChallenge.completed) {
      return res.status(400).json({ message: 'Challenge is not completed yet.' });
    }

    if (userChallenge.rewardClaimed) {
      return res.status(400).json({ message: 'Reward already claimed.' });
    }

    // Award XP to user
    const user = await User.findById(req.user.id);
    user.totalXp = (user.totalXp || 0) + challenge.xpReward;
    
    // Recompute level and league
    const XP_PER_LEVEL = 500;
    user.level = Math.max(1, Math.floor(user.totalXp / XP_PER_LEVEL) + 1);
    user.league = computeLeague(user.totalXp);
    
    await user.save();

    // Mark reward as claimed
    userChallenge.rewardClaimed = true;
    userChallenge.claimedAt = new Date();
    await userChallenge.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        notifications: {
          title: 'Challenge Completed!',
          detail: `You earned ${challenge.xpReward} XP from "${challenge.title}"`
        }
      }
    });

    return res.status(200).json({
      message: 'Reward claimed successfully!',
      xpEarned: challenge.xpReward,
      newTotalXp: user.totalXp
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Sync progress for all active challenges (called after lesson completion)
async function syncChallengeProgress(req, res) {
  try {
    await ensureDefaultChallenges();

    const now = new Date();
    const activeChallenges = await Challenge.find({
      isActive: true,
      expiresAt: { $gt: now }
    });

    for (const challenge of activeChallenges) {
      const currentProgress = await calculateProgress(req.user.id, challenge);

      await UserChallenge.findOneAndUpdate(
        { user: req.user.id, challenge: challenge._id },
        {
          $set: {
            progress: currentProgress,
            completed: currentProgress >= challenge.goalValue,
            completedAt: currentProgress >= challenge.goalValue ? new Date() : null
          }
        },
        { upsert: true }
      );
    }

    return res.status(200).json({ message: 'Progress synced successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getActiveChallenges,
  claimReward,
  syncChallengeProgress
};
