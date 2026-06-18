const Message = require('../models/messagesmodel');

exports.getConversation = async (req, res) => {
    try{
        const { recipientId } = req.params;
        const senderId = req.user._id;

        if(!recipientId) {
            return res.status(400).json({error: 'recipientId required'})
      }

      const messages = await Message.find({
        $or: [
            { senderId: senderId, recipientId: recipientId  },
            { senderId: recipientId, recipientId: senderId }
        ]
      })
      .sort({ timestamp: -1})
      .limit(5)
      .lean();

      res.json({ success: true, messages: messages.reverse() });
    } catch(error) {
        console.error('error fetching msg history', error);
        res.status(500).json({success: false, error:'failed to fetch msg'});
    };
};