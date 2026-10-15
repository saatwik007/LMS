const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const { protect } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);

// Search users
router.get('/search', socialController.searchUsers);

// Directional follows and private-profile requests
router.get('/follow-status/:userId', socialController.getFollowStatus);
router.post('/follow/:userId', socialController.followUser);
router.delete('/follow/:userId', socialController.unfollowUser);
router.get('/follow-requests', socialController.getFollowRequests);
router.post('/follow-requests/:userId/approve', socialController.approveFollowRequest);
router.delete('/follow-requests/:userId', socialController.rejectFollowRequest);
router.get('/followers/:userId', socialController.getFollowers);
router.get('/following/:userId', socialController.getFollowing);
router.post('/block/:userId', socialController.blockUser);
router.delete('/block/:userId', socialController.unblockUser);
router.patch('/privacy', socialController.updatePrivacy);

// Friend requests
router.get('/friend-requests', socialController.getFriendRequests);
router.post('/friend-request/:userId', socialController.sendFriendRequest);
router.post('/friend-request/:requestId/accept', socialController.acceptFriendRequest);
router.post('/friend-request/:requestId/reject', socialController.rejectFriendRequest);

// Friends management
router.get('/friends', socialController.getFriends);
router.get('/friends/leaderboard', socialController.getFriendsLeaderboard);
router.delete('/friends/:friendId', socialController.removeFriend);

module.exports = router;
