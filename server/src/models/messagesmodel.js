const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },       // unique ID of sender
  recipientId: { type: String, required: true },    // unique ID of recipient
  content: { type: String, required: true },        // message text
  type: { type: String, default: 'chat_message' },  // type of message
  timestamp: { type: Date, default: Date.now }           // timestamp
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
