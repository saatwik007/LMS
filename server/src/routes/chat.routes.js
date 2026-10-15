const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const chatController = require('../controllers/chat.controller')

router.use(protect);

router.post('/messages', chatController.sendMessage);
router.post('/share-post', chatController.sharePost);
router.get('/:recipientId', chatController.getConversation);

module.exports = router;