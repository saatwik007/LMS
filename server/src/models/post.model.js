const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {_id: true});

const commentSchema = new mongoose.Schema({
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  image: {
    type: String,
    default: '',
  },
  voiceNote: {
    url: {type: String, default: ''},
    duration: {type: Number, default: 0}
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  replies: [replySchema]
}, { _id: true });

const postMusicSchema = new mongoose.Schema({
  provider: { type: String, enum: ['audius', 'jamendo'], required: true },
  trackId: { type: String, required: true, maxlength: 100 },
  title: { type: String, required: true, maxlength: 300 },
  artist: { type: String, required: true, maxlength: 200 },
  artworkUrl: { type: String, default: '' },
  sourceUrl: { type: String, required: true },
  license: { type: String, required: true, maxlength: 300 },
  licenseUrl: { type: String, default: '' },
  duration: { type: Number, default: 0, min: 0 },
  startTime: { type: Number, default: 0, min: 0 },
  volume: { type: Number, default: 0.7, min: 0, max: 1 }
}, { _id: false });

const postSchema = new mongoose.Schema({
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  content: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000
  },
  image: { 
    type: String, 
    default: '' 
  },
  video: {
    type: String,
    default: ''
  },
  music: {
    type: postMusicSchema,
    default: null
  },
  driveFileId: {
    type: String,
    default: ''
  },
  hashtags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for performance
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ likes: 1 });

const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);
module.exports = {Post, Comment};
