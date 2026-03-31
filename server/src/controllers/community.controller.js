const Post = require('../models/post.model');
const User = require('../models/user.model');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Create a new post
async function createPost(req, res) {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    if (content.length > 2000) {
      return res.status(400).json({ message: 'Post content exceeds 2000 characters' });
    }

    const postData = {
      author: req.user.id,
      content: content.trim(),
      image: ''
    };

    // Handle image upload if present
    if (req.file && req.file.buffer) {
      try {
        const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'post-images');
        
        // Ensure directory exists
        try {
          await fs.access(uploadsDir);
        } catch {
          await fs.mkdir(uploadsDir, { recursive: true });
        }

        const timestamp = Date.now();
        const fileName = `post-${req.user.id}-${timestamp}.webp`;
        const filePath = path.join(uploadsDir, fileName);

        // Process and save image
        await sharp(req.file.buffer)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(filePath);

        postData.image = `/uploads/post-images/${fileName}`;
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        return res.status(500).json({ message: 'Failed to process image' });
      }
    }

    const post = await Post.create(postData);
    
    // Populate author details
    await post.populate('author', 'username profilePic league level totalXp');

    return res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: String(post._id),
        author: {
          id: String(post.author._id),
          username: post.author.username,
          profilePic: post.author.profilePic || '',
          league: post.author.league || 'Bronze 1',
          level: post.author.level || 1,
          totalXp: post.author.totalXp || 0
        },
        content: post.content,
        image: post.image,
        likes: [],
        comments: [],
        likesCount: 0,
        commentsCount: 0,
        isLikedByCurrentUser: false,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Get feed with pagination
async function getFeed(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    const total = await Post.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const posts = await Post.find(filter)
      .populate('author', 'username profilePic league level totalXp')
      .populate('comments.author', 'username profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const currentUserId = String(req.user.id);

    const formattedPosts = posts.map(post => ({
      id: String(post._id),
      author: {
        id: String(post.author._id),
        username: post.author.username,
        profilePic: post.author.profilePic || '',
        league: post.author.league || 'Bronze 1',
        level: post.author.level || 1,
        totalXp: post.author.totalXp || 0
      },
      content: post.content,
      image: post.image,
      likes: post.likes.map(id => String(id)),
      comments: post.comments.map(comment => ({
        id: String(comment._id),
        author: {
          id: String(comment.author._id),
          username: comment.author.username,
          profilePic: comment.author.profilePic || ''
        },
        content: comment.content,
        createdAt: comment.createdAt
      })),
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLikedByCurrentUser: post.likes.some(id => String(id) === currentUserId),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    return res.status(200).json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Get a single post
async function getPost(req, res) {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId)
      .populate('author', 'username profilePic league level totalXp')
      .populate('comments.author', 'username profilePic')
      .lean();

    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const currentUserId = String(req.user.id);

    const formattedPost = {
      id: String(post._id),
      author: {
        id: String(post.author._id),
        username: post.author.username,
        profilePic: post.author.profilePic || '',
        league: post.author.league || 'Bronze 1',
        level: post.author.level || 1,
        totalXp: post.author.totalXp || 0
      },
      content: post.content,
      image: post.image,
      likes: post.likes.map(id => String(id)),
      comments: post.comments.map(comment => ({
        id: String(comment._id),
        author: {
          id: String(comment.author._id),
          username: comment.author.username,
          profilePic: comment.author.profilePic || ''
        },
        content: comment.content,
        createdAt: comment.createdAt
      })),
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLikedByCurrentUser: post.likes.some(id => String(id) === currentUserId),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    };

    return res.status(200).json({ post: formattedPost });
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Like/Unlike a post
async function toggleLike(req, res) {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userIdString = String(userId);
    const likeIndex = post.likes.findIndex(id => String(id) === userIdString);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      await post.save();
      return res.status(200).json({
        message: 'Post unliked',
        likesCount: post.likes.length,
        isLiked: false
      });
    } else {
      // Like
      post.likes.push(userId);
      await post.save();

      // Send notification to post author (if not self-like)
      if (String(post.author) !== userIdString) {
        const liker = await User.findById(userId).select('username');
        await User.findByIdAndUpdate(post.author, {
          $push: {
            notifications: {
              title: '❤️ New Like',
              detail: `${liker.username} liked your post`
            }
          }
        });
      }

      return res.status(200).json({
        message: 'Post liked',
        likesCount: post.likes.length,
        isLiked: true
      });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Add a comment to a post
async function addComment(req, res) {
  try {
    const postId = req.params.postId;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    if (content.length > 500) {
      return res.status(400).json({ message: 'Comment exceeds 500 characters' });
    }

    const post = await Post.findById(postId);

    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      author: req.user.id,
      content: content.trim(),
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    // Send notification to post author (if not self-comment)
    if (String(post.author) !== String(req.user.id)) {
      const commenter = await User.findById(req.user.id).select('username');
      await User.findByIdAndUpdate(post.author, {
        $push: {
          notifications: {
            title: '💬 New Comment',
            detail: `${commenter.username} commented on your post`
          }
        }
      });
    }

    // Populate the new comment's author details
    await post.populate('comments.author', 'username profilePic');

    const newComment = post.comments[post.comments.length - 1];

    return res.status(201).json({
      message: 'Comment added',
      comment: {
        id: String(newComment._id),
        author: {
          id: String(newComment.author._id),
          username: newComment.author.username,
          profilePic: newComment.author.profilePic || ''
        },
        content: newComment.content,
        createdAt: newComment.createdAt
      },
      commentsCount: post.comments.length
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Delete a post (author only)
async function deletePost(req, res) {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (String(post.author) !== String(userId)) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    // Soft delete
    post.isActive = false;
    await post.save();

    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Delete a comment (author only)
async function deleteComment(req, res) {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const commentIndex = post.comments.findIndex(c => String(c._id) === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = post.comments[commentIndex];

    // Check if user is the comment author or post author
    if (String(comment.author) !== String(userId) && String(post.author) !== String(userId)) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    return res.status(200).json({
      message: 'Comment deleted successfully',
      commentsCount: post.comments.length
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Get user's posts
async function getUserPosts(req, res) {
  try {
    const userId = req.params.userId || req.user.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { author: userId, isActive: true };

    const total = await Post.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const posts = await Post.find(filter)
      .populate('author', 'username profilePic league level totalXp')
      .populate('comments.author', 'username profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const currentUserId = String(req.user.id);

    const formattedPosts = posts.map(post => ({
      id: String(post._id),
      author: {
        id: String(post.author._id),
        username: post.author.username,
        profilePic: post.author.profilePic || '',
        league: post.author.league || 'Bronze 1',
        level: post.author.level || 1,
        totalXp: post.author.totalXp || 0
      },
      content: post.content,
      image: post.image,
      likes: post.likes.map(id => String(id)),
      comments: post.comments.map(comment => ({
        id: String(comment._id),
        author: {
          id: String(comment.author._id),
          username: comment.author.username,
          profilePic: comment.author.profilePic || ''
        },
        content: comment.content,
        createdAt: comment.createdAt
      })),
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLikedByCurrentUser: post.likes.some(id => String(id) === currentUserId),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    return res.status(200).json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createPost,
  getFeed,
  getPost,
  toggleLike,
  addComment,
  deletePost,
  deleteComment,
  getUserPosts
};
