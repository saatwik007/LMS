const mongoose = require('mongoose');
const Message = require('../models/messages.model');

exports.getConversation = async (req, res) => {
    try {
        console.log('req.user:', req.user); // ✅ add this
        const { recipientId } = req.params;
        const senderId = req.user.id;

        if (!recipientId) {
            return res.status(400).json({ error: 'recipientId required' })
        }

        const recipientObjId = new mongoose.Types.ObjectId(recipientId);

        const allMessages = await Message.find({}).limit(5).lean();
        console.log('All messages in DB:', JSON.stringify(allMessages, null, 2));

        const messages = await Message.find({
            $or: [
                { senderId: senderId, recipientId: recipientObjId },  // ✅
                { senderId: recipientObjId, recipientId: senderId }   // ✅
            ]
        })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();

        // ✅ Add these 4 lines
        console.log('senderId:', senderId, typeof senderId);
        console.log('recipientObjId:', recipientObjId, typeof recipientObjId);
        console.log('messages found:', messages.length);
        console.log('raw messages:', JSON.stringify(messages, null, 2));

        res.json({ success: true, messages: messages.reverse() });
    } catch (error) {
        console.error('error fetching msg history', error);
        res.status(500).json({ success: false, error: 'failed to fetch msg' });
    };
};