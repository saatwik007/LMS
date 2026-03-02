const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3 },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
},
{
    timestamps: true
});

const userModal = mongoose.model('User', userSchema);
module.exports = userModal;