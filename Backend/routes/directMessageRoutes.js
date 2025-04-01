const express = require('express');
const router = express.Router();
const directMessageController = require('../controllers/directMessageController');
const { authenticateUser } = require('../Middleware/roleMiddleware');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Send a direct message
router.post('/send', directMessageController.sendMessage);

// Get conversation between current user and another user
router.get('/conversation/:userID', directMessageController.getConversation);

// Get all conversations for current user
router.get('/conversations', directMessageController.getUserConversations);

// Mark messages as read
router.put('/read', directMessageController.markAsRead);

module.exports = router;
