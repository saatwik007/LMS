const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  goalMetric: {
    type: String,
    required: true,
    enum: ['xp_earned', 'lessons_completed', 'streak_days', 'perfect_scores', 'courses_enrolled']
  },
  goalValue: {
    type: Number,
    required: true,
    min: 1
  },
  xpReward: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startsAt: {
    type: Date,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

challengeSchema.index({ type: 1, isActive: 1, expiresAt: 1 });

const Challenge = mongoose.model('Challenge', challengeSchema);
module.exports = Challenge;
