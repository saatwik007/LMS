/**
 * One-time reconciliation job to sync league values for existing users
 * This ensures all users have correct league assignments based on their totalXp
 */

const User = require('../models/user.model');
const { computeLevel, computeLeague } = require('../utils/userStats');

async function reconcileUserLeagues() {
  try {
    console.log('🔄 Starting league reconciliation for existing users...');
    
    // Find all users
    const users = await User.find({}).select('_id totalXp level league');
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const user of users) {
      const totalXp = user.totalXp || 0;
      const correctLevel = computeLevel(totalXp);
      const correctLeague = computeLeague(totalXp);
      
      // Check if update is needed
      const needsUpdate = user.level !== correctLevel || user.league !== correctLeague;
      
      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, {
          $set: { level: correctLevel, league: correctLeague }
        });
        updatedCount++;
      } else {
        skippedCount++;
      }
    }
    
    console.log(`✅ League reconciliation completed: ${updatedCount} users updated, ${skippedCount} already correct`);
    
    return { updated: updatedCount, skipped: skippedCount, total: users.length };
  } catch (error) {
    console.error('❌ Error during league reconciliation:', error);
    throw error;
  }
}

module.exports = {
  reconcileUserLeagues
};
