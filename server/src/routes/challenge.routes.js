const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const challengeController = require('../controllers/challenge.controller');

const router = express.Router();

router.get('/', protect, challengeController.getActiveChallenges);
router.post('/:challengeId/claim', protect, challengeController.claimReward);
router.post('/sync', protect, challengeController.syncChallengeProgress);

module.exports = router;
