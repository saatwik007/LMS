/**
 * Shared utility for XP, level, and league calculations
 * Centralizes the logic to ensure consistency across all XP mutation paths
 */

const XP_PER_LEVEL = 500;

/**
 * Compute user level from total XP
 */
function computeLevel(totalXp) {
  return Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1);
}

/**
 * Compute user league tier based on total XP
 */
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

/**
 * Recalculate and update user's level and league from totalXp
 * Call this after any operation that modifies totalXp
 * @param {Object} user - Mongoose user document
 * @returns {Object} Updated stats { level, league }
 */
function syncLevelAndLeague(user) {
  const totalXp = user.totalXp || 0;
  user.level = computeLevel(totalXp);
  user.league = computeLeague(totalXp);
  return { level: user.level, league: user.league };
}

/**
 * Recalculate and persist user's level and league from totalXp
 * For use with findByIdAndUpdate patterns
 * @param {mongoose.Model} User - User model
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Updated stats
 */
async function syncLevelAndLeagueById(User, userId) {
  const user = await User.findById(userId).select('totalXp');
  if (!user) {
    throw new Error('User not found');
  }
  
  const totalXp = user.totalXp || 0;
  const level = computeLevel(totalXp);
  const league = computeLeague(totalXp);
  
  await User.findByIdAndUpdate(userId, { $set: { level, league } });
  
  return { level, league, totalXp };
}

module.exports = {
  XP_PER_LEVEL,
  computeLevel,
  computeLeague,
  syncLevelAndLeague,
  syncLevelAndLeagueById
};
