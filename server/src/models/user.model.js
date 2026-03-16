const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  detail: { type: String, default: '', trim: true },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3 },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' },
  totalXp: { type: Number, default: 0, min: 0, index: true },
  level: { type: Number, default: 1, min: 1 },
  streakCount: { type: Number, default: 0, min: 0 },
  notifications: { type: [notificationSchema], default: [] }
},
{
    timestamps: true
});

const userModal = mongoose.model('User', userSchema);
module.exports = userModal;