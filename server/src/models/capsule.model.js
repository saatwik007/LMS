const mongoose = require('mongoose');

const capsuleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mediaFileId: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video'], default: "image" },
    caption: { type: String, default: "", maxlength: 200 },

    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

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

module.exports = mongoose.model("Capsule", capsuleSchema);