const mongoose = require('mongoose');

const userChallengeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  rewardClaimed: {
    type: Boolean,
    default: false
  },
  claimedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

userChallengeSchema.index({ user: 1, challenge: 1 }, { unique: true });
userChallengeSchema.index({ user: 1, completed: 1 });

const UserChallenge = mongoose.model('UserChallenge', userChallengeSchema);
module.exports = UserChallenge;
