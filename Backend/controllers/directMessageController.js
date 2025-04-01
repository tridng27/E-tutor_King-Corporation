const directMessageService = require('../services/directMessageService');

// Send a direct message
const sendMessage = async (req, res) => {
  try {
    const { receiverID, content } = req.body;
    const senderID = req.user.UserID;
    
    if (!receiverID || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and message content are required'
      });
    }
    
    const message = await directMessageService.sendMessage(senderID, receiverID, content);
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get conversation between current user and another user
const getConversation = async (req, res) => {
  try {
    const userID1 = req.user.UserID;
    const userID2 = req.params.userID;
    
    if (!userID2) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const messages = await directMessageService.getConversation(userID1, userID2);
    
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all conversations for current user
const getUserConversations = async (req, res) => {
  try {
    const userID = req.user.UserID;
    
    const conversations = await directMessageService.getUserConversations(userID);
    
    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { messageIDs } = req.body;
    const userID = req.user.UserID;
    
    if (!messageIDs || !Array.isArray(messageIDs) || messageIDs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid message IDs array is required'
      });
    }
    
    await directMessageService.markAsRead(messageIDs, userID);
    
    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getUserConversations,
  markAsRead
};
