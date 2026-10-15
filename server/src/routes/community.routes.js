const express = require('express');
const { 
  createPost, 
  getFeed, 
  getPost,
  recordPostView,
  toggleLike, 
  addComment,
  deletePost,
  deleteComment,
  getUserPosts,
  updateProfileGridLayout,
  commentReply,
  likeComment,
  getPostImage,
  getPostVideo,
  discoverNearbyPeople
} = require('../controllers/community.controller');
const { protect } = require('../middlewares/auth.middleware');
const { postMediaUpload } = require('../middlewares/upload.middleware');

const router = express.Router();

// Get feed (paginated)
router.get('/feed', protect, getFeed);

// Proxy image from Drive
router.get('/posts/image/:fileId', getPostImage);

// Proxy video from Drive
router.get('/posts/video/:fileId', getPostVideo);

// Create a new post (with optional image)
router.post('/posts', protect, postMediaUpload, createPost);

// Get a single post
router.get('/posts/:postId', protect, getPost);

// Record one unique view per authenticated user
router.post('/posts/:postId/view', protect, recordPostView);

// Delete a post
router.delete('/posts/:postId', protect, deletePost);

// Get user's posts
router.get('/users/:userId/posts', protect, getUserPosts);

// Save the authenticated user's profile grid order and tile sizes
router.put('/users/:userId/profile-grid', protect, updateProfileGridLayout);

// Like/Unlike a post
router.post('/posts/:postId/like', protect, toggleLike);

// Add a comment
router.post('/posts/:postId/comments', protect, addComment);

// Like a comment
router.post('/posts/:postId/:commentId/likeComment', protect, likeComment);

// Add a comment reply
router.post('/posts/:postId/:commentId/commentReplies', protect, commentReply);

// Delete a comment
router.delete('/posts/:postId/comments/:commentId', protect, deleteComment);

// Discover people nearby
router.post('/discover/nearby', protect, discoverNearbyPeople);

module.exports = router;