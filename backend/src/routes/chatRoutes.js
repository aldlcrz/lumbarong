const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware());

router.post('/send', chatController.sendMessage);
router.get('/conversations', chatController.getConversations);
router.get('/:otherUserId', chatController.getConversation);

module.exports = router;
