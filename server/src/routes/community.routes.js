const express = require('express');
const { 
  createPost, 
  getFeed, 
  getPost,
  toggleLike, 
  addComment,
  deletePost,
  deleteComment,
  getUserPosts
} = require('../controllers/community.controller');
const { protect } = require('../middlewares/auth.middleware');
const { profileImageUpload } = require('../middlewares/upload.middleware');

const router = express.Router();

// Get feed (paginated)
router.get('/feed', protect, getFeed);

// Create a new post (with optional image)
router.post('/posts', protect, profileImageUpload, createPost);

// Get a single post
router.get('/posts/:postId', protect, getPost);

// Delete a post
router.delete('/posts/:postId', protect, deletePost);

// Get user's posts
router.get('/users/:userId/posts', protect, getUserPosts);

// Like/Unlike a post
router.post('/posts/:postId/like', protect, toggleLike);

// Add a comment
router.post('/posts/:postId/comments', protect, addComment);

// Delete a comment
router.delete('/posts/:postId/comments/:commentId', protect, deleteComment);

module.exports = router;
