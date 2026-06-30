const { Post, Comment } = require('../models/post.model');
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
      .populate('comments.replies.author', 'username profilePic')
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
        postId: String(post._id),                          // ✅ postId belongs here, not inside author
        author: {
          id: String(comment.author._id),
          username: comment.author.username,
          profilePic: comment.author.profilePic || ''
        },
        content: comment.content,
        createdAt: comment.createdAt,
        likesCount: comment.likes?.length || 0,             // ✅ added
        isLikedByCurrentUser: comment.likes?.some(           // ✅ added
          id => String(id) === currentUserId
        ) ?? false,
        replies: comment.replies?.map(reply => ({            // ✅ this was completely missing
          id: String(reply._id),
          author: {
            id: String(reply.author._id),
            username: reply.author.username,
            profilePic: reply.author.profilePic || ''
          },
          content: reply.content,
          createdAt: reply.createdAt,
        })) || []
      })),
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLikedByCurrentUser: post.likes.some(id => String(id) === currentUserId),
      createdAt: post.createdAt,
      likesCount: post.comments.likes?.length || 0,
      isLikedByCurrentUser: post.comments.likes?.some(
        id => String(id) === currentUserId
      ) ?? false,
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
      .populate('comments.likes', '_id')
      .populate('comments.replies.author', 'username profilePic')
      .lean();

    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const replies = post.comments.reduce((acc, comment) => {
      acc[String(comment._id)] = comment.replies || [];
      return acc;
    }, {});

    console.log("response", replies)

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
        createdAt: comment.createdAt,
        replies: comment.replies?.map(reply => ({
          id: String(reply._id),
          author: {
            id: String(reply.author._id),
            username: reply.author.username,
          },
          content: reply.content,
          createdAt: reply.createdAt,
        })) || []
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
        postId: String(post._id),
        author: {
          id: String(newComment.author._id),
          username: newComment.author.username,
          profilePic: newComment.author.profilePic || ''
        },
        content: newComment.content,
        createdAt: newComment.createdAt,
        likesCount: 0,                     // ✅ added
        isLikedByCurrentUser: false,       // ✅ added
        replies: []                        // ✅ added
      },
      commentsCount: post.comments.length
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Add a reply to a comment
async function commentReply(req, res) {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    console.log('body:', req.body);           // ✅ if this doesn't print, wrong function is running
    console.log('originalUrl:', req.originalUrl);
    console.log('params-2:', req.params);

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Type something to post' })
    }

    if (content.length > 500) {
      return res.status(404).json({ message: 'Maximum type limit 500 characters' })
    }

    const post = await Post.findById(postId);
    const comment = post.comments.id(commentId);

    if (!post || !post.isActive) {
      return res.status(400).json({ message: 'Post not found' })
    }

    const reply = {
      author: req.user.id,
      content: content.trim(),
      createdAt: new Date()
    }

    comment.replies.push(reply);
    await post.save();

    const savedPost = await Post.findById(postId).populate(
      'comments.replies.author',
      'username profilePicture'
    );

    const savedComment = savedPost.comments.id(commentId);
    const savedReply = savedComment.replies[savedComment.replies.length - 1];

    return res.status(201).json({
      message: 'Reply saved successfully',
      reply: savedReply
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid post or comment Id' });
    };
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Like comment
async function likeComment(req, res) {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;
    const userIdString = String(userId);

    const post = await Post.findById(postId);


    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'post not found' })
    }
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'comment not found' });
    };

    if (!comment.likes) comment.likes = [];

    const commentLike = comment.likes.findIndex(id => String(id) === userIdString);
    // Unlike post if liked
    if (commentLike > -1) {
      comment.likes.splice(commentLike, 1);
      await post.save();
      return res.status(200).json({
        message: 'Comment disliked',
        likesCount: comment.likes.length,
        isLiked: false
      });
    } else {
      // Add like
      comment.likes.push(userId);
      await post.save();

      if (String(comment.author !== userIdString)) {
        const liker = await User.findById(userId).select('username');
        await User.findByIdAndUpdate(comment.author, {
          $push: {
            notifications: {
              title: 'Comment like',
              detail: `${liker.username} liked your comment`
            }
          }
        });
      }

      console.log('comment liked')
      return res.status(200).json({
        message: 'Comment liked',
        likesCount: comment.likes.length,
        isLiked: true
      });
    };
  } catch (error) {
    console.error('Comment like error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a post (author only)
async function deletePost(req, res) {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;
    console.log('DeletePost1', postId, userId);
    const post = await Post.findById(postId);
    console.log('DeletePost2', postId, userId, post);

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

    console.log("DeleteComment", JSON.stringify(req.params.commentId), postId, commentId, userId, post)

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
      comments: post.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(comment => ({
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
  getUserPosts,
  commentReply,
  likeComment
};
