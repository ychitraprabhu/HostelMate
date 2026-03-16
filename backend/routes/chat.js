const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');

// POST /api/chat/send (student or owner)
router.post('/send', verifyToken, chatController.sendMessage);

// GET /api/chat/conversations (student or owner)
// Note: Put this before /:hostel_id/:other_user_id so it doesn't get treated as a parameter
router.get('/conversations', verifyToken, chatController.getConversations);

// GET /api/chat/:hostel_id/:other_user_id (student or owner)
router.get('/:hostel_id/:other_user_id', verifyToken, chatController.getConversation);

module.exports = router;
