const express = require('express');
const { 
  createPost, 
  getFeed, 
  getIndianMusic,
  getTrendingMusic,
  searchMusic,
  streamMusic,
  getPost,
  recordPostView,
  toggleLike, 
  getSavedLibrary,
  toggleSavedPost,
  setSavedPostCollections,
  createSavedCollection,
  renameSavedCollection,
  deleteSavedCollection,
  togglePostArchive,
  getArchivedPosts,
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

router.get('/music/search', protect, searchMusic);
router.get('/music/discover/indian', protect, getIndianMusic);
router.get('/music/trending', protect, getTrendingMusic);
router.get('/music/:provider/:trackId/stream', streamMusic);

// Proxy image from Drive
router.get('/posts/image/:fileId', getPostImage);

// Proxy video from Drive
router.get('/posts/video/:fileId', getPostVideo);

// Create a new post (with optional image)
router.post('/posts', protect, postMediaUpload, createPost);

// Private saved-post library and collections
router.get('/saved', protect, getSavedLibrary);
router.post('/saved/collections', protect, createSavedCollection);
router.patch('/saved/collections/:collectionId', protect, renameSavedCollection);
router.delete('/saved/collections/:collectionId', protect, deleteSavedCollection);
router.get('/archive', protect, getArchivedPosts);
router.post('/posts/:postId/save', protect, toggleSavedPost);
router.put('/posts/:postId/save/collections', protect, setSavedPostCollections);
router.post('/posts/:postId/archive', protect, togglePostArchive);

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