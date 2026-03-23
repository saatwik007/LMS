const mongoose = require('mongoose');

const lectureProgressSchema = new mongoose.Schema(
{
lectureNumber: { type: Number, required: true, min: 1 },
points: { type: Number, required: true, default: 0, min: 0 },
completed: { type: Boolean, default: false },
completedAt: { type: Date, default: null }
},
{ _id: false }
);

const userProgressSchema = new mongoose.Schema(
{
user: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User',
required: true,
index: true
},
course: {
type: mongoose.Schema.Types.ObjectId,
ref: 'Course',
required: true,
index: true
},
status: {
type: String,
enum: ['active', 'paused', 'completed'],
default: 'active',
required: true
},
totalPoints: {
type: Number,
required: true,
default: 0,
min: 0
},
lectureProgress: {
type: [lectureProgressSchema],
required: true,
default: []
}
},
{ timestamps: true }
);

// Prevent duplicate progress docs for same user-course
userProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);