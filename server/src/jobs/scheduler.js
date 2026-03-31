const cron = require('node-cron');
const User = require('../models/user.model');
const Badge = require('../models/badge.model');
const { awardBadgeToUser } = require('../controllers/badge.controller');
const { syncLevelAndLeagueById } = require('../utils/userStats');

// Monthly reward distribution - runs on the 1st of every month at midnight
function startMonthlyRewardJob() {
  // Run at 00:00 on the 1st day of every month
  cron.schedule('0 0 1 * *', async () => {
    console.log('🏆 Running monthly reward distribution...');
    
    try {
      // Get the top 3 performers from last month
      const lastMonthStart = new Date();
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
      lastMonthStart.setDate(1);
      lastMonthStart.setHours(0, 0, 0, 0);
      
      const lastMonthEnd = new Date();
      lastMonthEnd.setDate(1);
      lastMonthEnd.setHours(0, 0, 0, 0);

      // Find users by total XP (top performers)
      const topPerformers = await User.find({})
        .select('_id username totalXp')
        .sort({ totalXp: -1 })
        .limit(3);

      if (topPerformers.length === 0) {
        console.log('No users to award monthly badges.');
        return;
      }

      // Get monthly badge IDs
      const monthlyChampionBadge = await Badge.findOne({ name: 'Monthly Champion' });
      const runnerUpBadge = await Badge.findOne({ name: 'Runner Up' });
      const top3Badge = await Badge.findOne({ name: 'Top 3 Finisher' });

      // Award badges to top 3
      for (let i = 0; i < topPerformers.length; i++) {
        const user = topPerformers[i];
        let badge = null;

        if (i === 0 && monthlyChampionBadge) {
          badge = monthlyChampionBadge;
        } else if (i === 1 && runnerUpBadge) {
          badge = runnerUpBadge;
        } else if (i === 2 && top3Badge) {
          badge = top3Badge;
        }

        if (badge) {
          const result = await awardBadgeToUser(user._id, badge._id);
          if (result.success) {
            console.log(`✅ Awarded "${badge.name}" to ${user.username}`);
          } else {
            console.log(`⚠️ Could not award "${badge.name}" to ${user.username}: ${result.message}`);
          }
        }
      }

      // Award bonus XP to top 10 users
      const top10Users = await User.find({})
        .select('_id username totalXp')
        .sort({ totalXp: -1 })
        .limit(10);

      const bonuses = [500, 300, 200, 150, 100, 75, 50, 40, 30, 25];

      for (let i = 0; i < top10Users.length; i++) {
        const user = top10Users[i];
        const bonus = bonuses[i] || 25;

        await User.findByIdAndUpdate(user._id, {
          $inc: { totalXp: bonus },
          $push: {
            notifications: {
              title: '🎁 Monthly Bonus!',
              detail: `You ranked #${i + 1} last month! +${bonus} XP bonus`
            }
          }
        });

        // Recalculate and persist level and league after XP change
        await syncLevelAndLeagueById(User, user._id);

        console.log(`💰 Awarded ${bonus} XP bonus to ${user.username} (Rank #${i + 1})`);
      }

      console.log('✅ Monthly reward distribution completed!');
    } catch (error) {
      console.error('❌ Error in monthly reward distribution:', error);
    }
  });

  console.log('📅 Monthly reward job scheduled (1st of every month at midnight)');
}

// Weekly reminder to complete challenges - runs every Monday at 9 AM
function startWeeklyChallengeReminder() {
  // Run at 09:00 every Monday
  cron.schedule('0 9 * * 1', async () => {
    console.log('📢 Sending weekly challenge reminders...');
    
    try {
      const activeUsers = await User.find({}).select('_id');
      
      for (const user of activeUsers) {
        await User.findByIdAndUpdate(user._id, {
          $push: {
            notifications: {
              title: '🎯 New Week, New Challenges!',
              detail: 'Check out this week\'s challenges and earn awesome rewards!'
            }
          }
        });
      }

      console.log(`✅ Sent challenge reminders to ${activeUsers.length} users`);
    } catch (error) {
      console.error('❌ Error sending challenge reminders:', error);
    }
  });

  console.log('📅 Weekly challenge reminder scheduled (Every Monday at 9 AM)');
}

module.exports = {
  startMonthlyRewardJob,
  startWeeklyChallengeReminder
};
