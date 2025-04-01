const { DirectMessage, User } = require('../models');
const { Op } = require('sequelize');

// Send a direct message
const sendMessage = async (senderID, receiverID, content) => {
  // Check if both users exist
  const sender = await User.findByPk(senderID);
  const receiver = await User.findByPk(receiverID);
  
  if (!sender || !receiver) {
    throw new Error('Sender or receiver not found');
  }
  
  return await DirectMessage.create({
    SenderID: senderID,
    ReceiverID: receiverID,
    Content: content
  });
};

// Get conversation between two users
const getConversation = async (userID1, userID2) => {
  const messages = await DirectMessage.findAll({
    where: {
      [Op.or]: [
        { SenderID: userID1, ReceiverID: userID2 },
        { SenderID: userID2, ReceiverID: userID1 }
      ]
    },
    order: [['Timestamp', 'ASC']]
  });
  
  return messages;
};

// Get all conversations for a user
const getUserConversations = async (userID) => {
  // Get unique users this person has chatted with
  const sentMessages = await DirectMessage.findAll({
    attributes: ['ReceiverID'],
    where: { SenderID: userID },
    group: ['ReceiverID']
  });
  
  const receivedMessages = await DirectMessage.findAll({
    attributes: ['SenderID'],
    where: { ReceiverID: userID },
    group: ['SenderID']
  });
  
  // Combine unique user IDs
  const chatPartnerIDs = new Set([
    ...sentMessages.map(msg => msg.ReceiverID),
    ...receivedMessages.map(msg => msg.SenderID)
  ]);
  
  // Get user details and latest message for each conversation
  const conversations = [];
  for (const partnerID of chatPartnerIDs) {
    const latestMessage = await DirectMessage.findOne({
      where: {
        [Op.or]: [
          { SenderID: userID, ReceiverID: partnerID },
          { SenderID: partnerID, ReceiverID: userID }
        ]
      },
      order: [['Timestamp', 'DESC']]
    });
    
    const partner = await User.findByPk(partnerID, {
      attributes: ['UserID', 'Name', 'Email', 'Role']
    });
    
    if (partner) {
      conversations.push({
        partner,
        latestMessage
      });
    }
  }
  
  return conversations;
};

// Mark messages as read
const markAsRead = async (messageIDs, userID) => {
  return await DirectMessage.update(    
    { IsRead: true },
    { 
      where: { 
        MessageID: messageIDs,
        ReceiverID: userID
      } 
    }
  );
};

module.exports = {
  sendMessage,
  getConversation,
  getUserConversations,
  markAsRead
};
