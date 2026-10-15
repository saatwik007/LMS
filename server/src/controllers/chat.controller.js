const mongoose = require('mongoose');
const Message = require('../models/messages.model');
const { Post } = require('../models/post.model');
const User = require('../models/user.model');
const { notifyUser } = require('./pushnotification.controller');

function formatSharedPost(post) {
    if (!post) return null;
    return {
        id: String(post._id),
        content: post.content || '',
        image: post.image || '',
        video: post.video || '',
        author: post.author ? {
            id: String(post.author._id),
            username: post.author.username,
            profilePic: post.author.profilePic || ''
        } : null
    };
}

function getAllowedContactIds(user) {
    const followerIds = new Set((user.followers || []).map(String));
    const contactIds = new Set((user.friends || []).map(String));
    (user.following || []).forEach(id => {
        if (followerIds.has(String(id))) contactIds.add(String(id));
    });
    return contactIds;
}

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
        // console.log('All messages in DB:', JSON.stringify(allMessages, null, 2));

        const messages = await Message.find({
            $or: [
                { senderId: senderId, recipientId: recipientObjId },  // ✅
                { senderId: recipientObjId, recipientId: senderId }   // ✅
            ]
        })
            .populate({
                path: 'postId',
                select: 'content image video author isActive',
                populate: { path: 'author', select: 'username profilePic' }
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

exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const recipientId = String(req.body.recipientId || '');
        const content = String(req.body.content || '').trim();

        if (!mongoose.Types.ObjectId.isValid(recipientId) || recipientId === String(senderId)) {
            return res.status(400).json({ success: false, error: 'Valid recipient required' });
        }
        if (!content || content.length > 2000) {
            return res.status(400).json({ success: false, error: 'Message must be between 1 and 2000 characters' });
        }

        const sender = await User.findById(senderId).select('username friends followers following');
        if (!sender) return res.status(404).json({ success: false, error: 'Sender not found' });
        if (!getAllowedContactIds(sender).has(recipientId)) {
            return res.status(403).json({ success: false, error: 'Messages can only be sent to friends' });
        }

        const message = await Message.create({
            senderId,
            recipientId,
            content,
            type: 'chat_message',
            delivered: false
        });
        const responseMessage = {
            id: String(message._id),
            senderId: String(senderId),
            recipientId,
            text: message.content,
            messageType: message.type,
            timestamp: message.timestamp
        };

        req.app.get('sendToUser')?.(recipientId, {
            type: 'chat-message',
            message: responseMessage
        });
        try {
            await notifyUser(recipientId, `New message from ${sender.username}`, content.slice(0, 100), {
                type: 'chat-message',
                senderId: String(senderId),
                recipientId,
                messageId: String(message._id)
            });
        } catch (notificationError) {
            console.error('Chat notification error:', notificationError);
        }

        return res.status(201).json({ success: true, message: responseMessage });
    } catch (error) {
        console.error('Send message error:', error);
        return res.status(500).json({ success: false, error: 'Failed to send message' });
    }
};

exports.sharePost = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { postId, recipientIds } = req.body;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ success: false, error: 'Valid postId required' });
        }
        if (!Array.isArray(recipientIds) || recipientIds.length === 0 || recipientIds.length > 20) {
            return res.status(400).json({ success: false, error: 'Select between 1 and 20 friends' });
        }

        const uniqueRecipientIds = [...new Set(recipientIds.map(String))];
        if (uniqueRecipientIds.some(id => !mongoose.Types.ObjectId.isValid(id) || id === String(senderId))) {
            return res.status(400).json({ success: false, error: 'Invalid recipient' });
        }

        const [sender, post] = await Promise.all([
            User.findById(senderId).select('username friends followers following'),
            Post.findOne({ _id: postId, isActive: true, isArchived: { $ne: true } })
                .select('content image video author')
                .populate('author', 'username profilePic')
        ]);
        if (!sender) return res.status(404).json({ success: false, error: 'Sender not found' });
        if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

        const friendIds = getAllowedContactIds(sender);
        if (uniqueRecipientIds.some(id => !friendIds.has(id))) {
            return res.status(403).json({ success: false, error: 'Posts can only be shared with friends' });
        }

        const sharedPost = formatSharedPost(post);
        const createdMessages = await Message.insertMany(uniqueRecipientIds.map(recipientId => ({
            senderId,
            recipientId,
            content: 'Shared a post',
            type: 'post_share',
            postId: post._id,
            delivered: false
        })));
        const sendToUser = req.app.get('sendToUser');

        await Promise.all(createdMessages.map(async (message) => {
            const recipientId = String(message.recipientId);
            const payload = {
                type: 'chat-message',
                message: {
                    id: String(message._id),
                    senderId: String(senderId),
                    recipientId,
                    text: message.content,
                    messageType: message.type,
                    post: sharedPost,
                    timestamp: message.timestamp
                }
            };
            sendToUser?.(recipientId, payload);
            try {
                await notifyUser(recipientId, `${sender.username} shared a post`, post.content?.slice(0, 100) || 'Open Messages to view it', {
                    type: 'post-share',
                    senderId: String(senderId),
                    postId: String(post._id),
                    messageId: String(message._id)
                });
            } catch (notificationError) {
                console.error('Post share notification error:', notificationError);
            }
        }));

        return res.status(201).json({ success: true, sharedCount: createdMessages.length });
    } catch (error) {
        console.error('Share post error:', error);
        return res.status(500).json({ success: false, error: 'Failed to share post' });
    }
};