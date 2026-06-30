const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },        // message text
  type: { type: String, default: 'chat_message' },  // type of message
  timestamp: { type: Date, default: Date.now },           // timestamp
  delivered: { type: Boolean, default: false }       // delivery check
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
