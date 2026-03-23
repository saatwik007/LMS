// const mongoose = require('mongoose');

// const courseSchema = new mongoose.Schema({
// title: { type: String, required: true, trim: true },
// description: { type: String, required: true, trim: true },

// enrolledUsers: {
// type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
// required: true,
// default: [],
// validate: {
// validator: (v) => v !== null,
// message: 'enrolledUsers cannot be null'
// }
// }
// }, {
// timestamps: true
// });

// const courseModel = mongoose.model('Course', courseSchema);
// module.exports = courseModel

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
{
slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
title: { type: String, required: true, trim: true },
description: { type: String, required: true, trim: true },
domain: { type: String, default: 'General', trim: true },
level: { type: String, default: 'Beginner', trim: true },
totalLectures: { type: Number, required: true, min: 1 }
},
{ timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);