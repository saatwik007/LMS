const mongoose = require('mongoose');

const capsuleCommentReplySchema = new mongoose.Schema({
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

const capsuleCommentSchema = new mongoose.Schema({
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
  voiceNote: {
    url: { type: String, default: '' },
    duration: { type: Number, default: 0 }
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
  replies: [capsuleCommentReplySchema]
}, { _id: true });

const capsuleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mediaFileId: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video'], default: "image" },
    caption: { type: String, default: "", maxlength: 200 },
    comments: [capsuleCommentSchema],

    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],

    streakCount: { type: Number, default: 1 },
    streakStartsFrom: { type: Date, default: Date.now },
    revivedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Capsule", default: null },

    expiresAt: { type: Date, required: true },
    deleteAt: { type: Date, required: true },

  },
  { timestamps: true }
);

capsuleSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 });
capsuleSchema.index({ user: 1, createdAt: -1 });

const Capsule = mongoose.model("Capsule", capsuleSchema);
const CapsuleComment = mongoose.model('CapsuleComment', capsuleCommentSchema);
const CapsuleCommentReply = mongoose.model('CapusleCommentReply', capsuleCommentReplySchema);
module.exports = { Capsule, CapsuleComment, CapsuleCommentReply };