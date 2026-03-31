const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true,
    trim: true 
  },
  icon: { 
    type: String, 
    required: true,
    trim: true 
  },
  conditionType: {
    type: String,
    required: true,
    enum: [
      'xp_threshold',      // Earn X total XP
      'course_completion', // Complete X courses
      'streak_milestone',  // Maintain X day streak
      'challenge_complete',// Complete X challenges
      'perfect_score',     // Get X perfect scores
      'level_reached',     // Reach level X
      'league_reached',    // Reach specific league
      'monthly_top',       // Top performer of the month
      'special'            // Special/manual award
    ]
  },
  conditionValue: { 
    type: Number, 
    default: 0 
  },
  conditionDetails: {
    type: String,
    default: ''
  },
  rarity: {
    type: String,
    enum: ['Common', 'Rare', 'Epic', 'Legendary'],
    default: 'Common'
  },
  xpBonus: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

badgeSchema.index({ conditionType: 1, conditionValue: 1 });

const Badge = mongoose.model('Badge', badgeSchema);
module.exports = Badge;
