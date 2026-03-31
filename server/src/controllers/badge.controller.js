const Badge = require('../models/badge.model');
const User = require('../models/user.model');
const UserProgress = require('../models/userProgress.model');
const UserChallenge = require('../models/userChallenge.model');
const { syncLevelAndLeague } = require('../utils/userStats');

// Initialize default badges in the database
async function ensureDefaultBadges() {
  const defaultBadges = [
    // XP Thresholds
    { name: 'First Steps', description: 'Earn your first 100 XP', icon: '🎯', conditionType: 'xp_threshold', conditionValue: 100, rarity: 'Common', xpBonus: 10 },
    { name: 'Rising Star', description: 'Earn 500 XP', icon: '⭐', conditionType: 'xp_threshold', conditionValue: 500, rarity: 'Common', xpBonus: 25 },
    { name: 'XP Warrior', description: 'Earn 2000 XP', icon: '⚔️', conditionType: 'xp_threshold', conditionValue: 2000, rarity: 'Rare', xpBonus: 50 },
    { name: 'XP Legend', description: 'Earn 5000 XP', icon: '👑', conditionType: 'xp_threshold', conditionValue: 5000, rarity: 'Epic', xpBonus: 100 },
    { name: 'XP Titan', description: 'Earn 10000 XP', icon: '🏆', conditionType: 'xp_threshold', conditionValue: 10000, rarity: 'Legendary', xpBonus: 250 },
    
    // Course Completions
    { name: 'Course Starter', description: 'Complete your first course', icon: '📚', conditionType: 'course_completion', conditionValue: 1, rarity: 'Common', xpBonus: 50 },
    { name: 'Knowledge Seeker', description: 'Complete 3 courses', icon: '🎓', conditionType: 'course_completion', conditionValue: 3, rarity: 'Rare', xpBonus: 100 },
    { name: 'Master Learner', description: 'Complete 5 courses', icon: '🧠', conditionType: 'course_completion', conditionValue: 5, rarity: 'Epic', xpBonus: 200 },
    { name: 'Course Champion', description: 'Complete 10 courses', icon: '🏅', conditionType: 'course_completion', conditionValue: 10, rarity: 'Legendary', xpBonus: 500 },
    
    // Streak Milestones
    { name: 'Streak Starter', description: 'Maintain a 3-day streak', icon: '🔥', conditionType: 'streak_milestone', conditionValue: 3, rarity: 'Common', xpBonus: 15 },
    { name: 'Dedicated', description: 'Maintain a 7-day streak', icon: '💪', conditionType: 'streak_milestone', conditionValue: 7, rarity: 'Rare', xpBonus: 50 },
    { name: 'Unstoppable', description: 'Maintain a 30-day streak', icon: '🌟', conditionType: 'streak_milestone', conditionValue: 30, rarity: 'Epic', xpBonus: 150 },
    { name: 'Streak Legend', description: 'Maintain a 100-day streak', icon: '💎', conditionType: 'streak_milestone', conditionValue: 100, rarity: 'Legendary', xpBonus: 500 },
    
    // Challenge Completions
    { name: 'Challenge Accepted', description: 'Complete your first challenge', icon: '✅', conditionType: 'challenge_complete', conditionValue: 1, rarity: 'Common', xpBonus: 20 },
    { name: 'Challenge Crusher', description: 'Complete 10 challenges', icon: '💥', conditionType: 'challenge_complete', conditionValue: 10, rarity: 'Rare', xpBonus: 75 },
    { name: 'Challenge Master', description: 'Complete 50 challenges', icon: '🎖️', conditionType: 'challenge_complete', conditionValue: 50, rarity: 'Epic', xpBonus: 200 },
    
    // Perfect Scores
    { name: 'Perfectionist', description: 'Achieve 5 perfect scores', icon: '💯', conditionType: 'perfect_score', conditionValue: 5, rarity: 'Rare', xpBonus: 50 },
    { name: 'Flawless', description: 'Achieve 20 perfect scores', icon: '✨', conditionType: 'perfect_score', conditionValue: 20, rarity: 'Epic', xpBonus: 150 },
    
    // Level Milestones
    { name: 'Level 5 Hero', description: 'Reach Level 5', icon: '🚀', conditionType: 'level_reached', conditionValue: 5, rarity: 'Common', xpBonus: 25 },
    { name: 'Level 10 Elite', description: 'Reach Level 10', icon: '🔱', conditionType: 'level_reached', conditionValue: 10, rarity: 'Rare', xpBonus: 75 },
    { name: 'Level 20 Master', description: 'Reach Level 20', icon: '👑', conditionType: 'level_reached', conditionValue: 20, rarity: 'Epic', xpBonus: 200 },
    
    // League Achievements
    { name: 'Silver Achiever', description: 'Reach Silver League', icon: '🥈', conditionType: 'league_reached', conditionValue: 0, conditionDetails: 'Silver', rarity: 'Common', xpBonus: 50 },
    { name: 'Gold Champion', description: 'Reach Gold League', icon: '🥇', conditionType: 'league_reached', conditionValue: 0, conditionDetails: 'Gold', rarity: 'Rare', xpBonus: 100 },
    { name: 'Platinum Elite', description: 'Reach Platinum League', icon: '💠', conditionType: 'league_reached', conditionValue: 0, conditionDetails: 'Platinum', rarity: 'Epic', xpBonus: 200 },
    { name: 'Diamond Legend', description: 'Reach Diamond League', icon: '💎', conditionType: 'league_reached', conditionValue: 0, conditionDetails: 'Diamond', rarity: 'Legendary', xpBonus: 500 },
    
    // Monthly Top Performer
    { name: 'Monthly Champion', description: 'Top performer of the month', icon: '🏆', conditionType: 'monthly_top', conditionValue: 1, rarity: 'Legendary', xpBonus: 1000 },
    { name: 'Runner Up', description: 'Second place this month', icon: '🥈', conditionType: 'monthly_top', conditionValue: 2, rarity: 'Epic', xpBonus: 500 },
    { name: 'Top 3 Finisher', description: 'Third place this month', icon: '🥉', conditionType: 'monthly_top', conditionValue: 3, rarity: 'Epic', xpBonus: 300 }
  ];

  for (const badgeData of defaultBadges) {
    await Badge.findOneAndUpdate(
      { name: badgeData.name },
      { $set: { ...badgeData, isActive: true } },
      { upsert: true }
    );
  }
}

// Check and award badges to a user based on their current stats
async function checkAndAwardBadges(userId) {
  try {
    const user = await User.findById(userId).select('totalXp level league streakCount badges notifications');
    if (!user) return [];

    // Defensive initialization for mutable arrays
    if (!user.badges) user.badges = [];
    if (!user.notifications) user.notifications = [];

    // Get all active badges
    const allBadges = await Badge.find({ isActive: true });
    
    // Get already earned badge IDs
    const earnedBadgeIds = new Set(user.badges.map(b => String(b.badge)));
    
    // Track newly awarded badges
    const newlyAwarded = [];

    // Get user stats
    const userProgressDocs = await UserProgress.find({ user: userId });
    const completedCourses = userProgressDocs.filter(p => {
      const lectureProgress = p.lectureProgress || [];
      const totalLectures = lectureProgress.length;
      const completedLectures = lectureProgress.filter(lec => lec.completed).length;
      return totalLectures > 0 && completedLectures === totalLectures;
    }).length;

    const completedChallenges = await UserChallenge.countDocuments({ 
      user: userId, 
      completed: true 
    });

    // Count perfect scores
    let perfectScores = 0;
    userProgressDocs.forEach(doc => {
      const perfects = (doc.lectureProgress || []).filter(lec => lec.points >= 100);
      perfectScores += perfects.length;
    });

    // Check each badge condition
    for (const badge of allBadges) {
      // Skip if already earned
      if (earnedBadgeIds.has(String(badge._id))) continue;

      let shouldAward = false;

      switch (badge.conditionType) {
        case 'xp_threshold':
          shouldAward = user.totalXp >= badge.conditionValue;
          break;
        
        case 'course_completion':
          shouldAward = completedCourses >= badge.conditionValue;
          break;
        
        case 'streak_milestone':
          shouldAward = user.streakCount >= badge.conditionValue;
          break;
        
        case 'challenge_complete':
          shouldAward = completedChallenges >= badge.conditionValue;
          break;
        
        case 'perfect_score':
          shouldAward = perfectScores >= badge.conditionValue;
          break;
        
        case 'level_reached':
          shouldAward = user.level >= badge.conditionValue;
          break;
        
        case 'league_reached':
          if (badge.conditionDetails && user.league) {
            shouldAward = user.league.includes(badge.conditionDetails);
          }
          break;
        
        // monthly_top and special badges are awarded manually
        case 'monthly_top':
        case 'special':
          shouldAward = false;
          break;
      }

      if (shouldAward) {
        // Award the badge
        user.badges.push({
          badge: badge._id,
          earnedAt: new Date(),
          notified: false
        });

        // Add XP bonus if applicable
        if (badge.xpBonus > 0) {
          user.totalXp += badge.xpBonus;
          // Recalculate level and league
          syncLevelAndLeague(user);
        }

        // Add notification
        user.notifications.push({
          title: '🎉 Badge Earned!',
          detail: `You earned the "${badge.name}" badge! ${badge.xpBonus > 0 ? `+${badge.xpBonus} XP bonus` : ''}`
        });

        newlyAwarded.push({
          badgeId: String(badge._id),
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          rarity: badge.rarity,
          xpBonus: badge.xpBonus
        });
      }
    }

    // Save user if badges were awarded
    if (newlyAwarded.length > 0) {
      await user.save();
    }

    return newlyAwarded;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
}

// Award a specific badge to a user (for monthly rewards or special occasions)
async function awardBadgeToUser(userId, badgeId) {
  try {
    const user = await User.findById(userId);
    const badge = await Badge.findById(badgeId);

    if (!user || !badge) {
      return { success: false, message: 'User or badge not found' };
    }

    // Check if already awarded
    const alreadyHas = user.badges.some(b => String(b.badge) === String(badgeId));
    if (alreadyHas) {
      return { success: false, message: 'Badge already earned' };
    }

    // Award the badge
    user.badges.push({
      badge: badge._id,
      earnedAt: new Date(),
      notified: false
    });

    // Add XP bonus
    if (badge.xpBonus > 0) {
      user.totalXp += badge.xpBonus;
      // Recalculate level and league
      syncLevelAndLeague(user);
    }

    // Add notification
    user.notifications.push({
      title: '🎉 Badge Earned!',
      detail: `You earned the "${badge.name}" badge! ${badge.xpBonus > 0 ? `+${badge.xpBonus} XP bonus` : ''}`
    });

    await user.save();

    return {
      success: true,
      badge: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity,
        xpBonus: badge.xpBonus
      }
    };
  } catch (error) {
    console.error('Error awarding badge:', error);
    return { success: false, message: error.message };
  }
}

// Get all badges with user's earn status
async function getAllBadgesWithStatus(req, res) {
  try {
    await ensureDefaultBadges();

    const allBadges = await Badge.find({ isActive: true }).sort({ rarity: -1, conditionValue: 1 });
    const user = await User.findById(req.user.id).select('badges');

    const earnedBadgeIds = new Set((user?.badges || []).map(b => String(b.badge)));

    const badgesWithStatus = allBadges.map(badge => ({
      id: String(badge._id),
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      conditionType: badge.conditionType,
      conditionValue: badge.conditionValue,
      conditionDetails: badge.conditionDetails,
      rarity: badge.rarity,
      xpBonus: badge.xpBonus,
      earned: earnedBadgeIds.has(String(badge._id)),
      earnedAt: user?.badges.find(b => String(b.badge) === String(badge._id))?.earnedAt || null
    }));

    return res.status(200).json({ badges: badgesWithStatus });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Get user's earned badges with full details
async function getUserBadges(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select('badges')
      .populate('badges.badge');

    const earnedBadges = (user?.badges || [])
      .filter(b => b.badge) // Filter out any null references
      .map(b => ({
        id: String(b.badge._id),
        name: b.badge.name,
        description: b.badge.description,
        icon: b.badge.icon,
        rarity: b.badge.rarity,
        xpBonus: b.badge.xpBonus,
        earnedAt: b.earnedAt
      }))
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));

    return res.status(200).json({ badges: earnedBadges });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  ensureDefaultBadges,
  checkAndAwardBadges,
  awardBadgeToUser,
  getAllBadgesWithStatus,
  getUserBadges
};
