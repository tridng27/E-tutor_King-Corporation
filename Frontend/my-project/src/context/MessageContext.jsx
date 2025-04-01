import { createContext, useState, useContext, useEffect } from "react";
import apiService from "../services/apiService";

export const MessageContext = createContext(null);

export const MessageProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Calculate unread message count
  useEffect(() => {
    if (conversations.length > 0) {
      const count = conversations.reduce((total, conv) => {
        if (conv.latestMessage && !conv.latestMessage.IsRead && 
            conv.latestMessage.SenderID === conv.partner.UserID) {
          return total + 1;
        }
        return total;
      }, 0);
      setUnreadCount(count);
    }
  }, [conversations]);

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserConversations();
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load conversations');
      setLoading(false);
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (userID) => {
    try {
      setLoading(true);
      const response = await apiService.getConversation(userID);
      setMessages(response.data);
      
      // Mark unread messages as read
      const unreadMessageIDs = response.data
        .filter(msg => !msg.IsRead && msg.SenderID === userID)
        .map(msg => msg.MessageID);
      
      if (unreadMessageIDs.length > 0) {
        await apiService.markMessagesAsRead(unreadMessageIDs);
      }
      
      setLoading(false);
      
      // Update conversations to reflect read status
      if (unreadMessageIDs.length > 0) {
        fetchConversations();
      }
    } catch (error) {
      setError('Failed to load messages');
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (receiverID, content) => {
    try {
      await apiService.sendDirectMessage(receiverID, content);
      // Refresh messages
      await fetchMessages(receiverID);
      // Refresh conversations
      await fetchConversations();
      return true;
    } catch (error) {
      setError('Failed to send message');
      return false;
    }
  };

  // Search users
  // In MessageContext.jsx
const searchUsers = async (query) => {
    try {
      console.log("Searching for users with query:", query); // Add this for debugging
      const response = await apiService.searchUsers(query);
      console.log("Search results:", response); // Add this for debugging
      return response.data || []; // Make sure we're returning the data array
    } catch (error) {
      console.error("Failed to search users:", error);
      setError('Failed to search users');
      return [];
    }
  };

  // Select a conversation
  const selectConversation = async (conversation) => {
    setCurrentConversation(conversation);
    if (conversation) {
      await fetchMessages(conversation.partner.UserID);
    }
  };

  return (
    <MessageContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loading,
        error,
        unreadCount,
        fetchConversations,
        fetchMessages,
        sendMessage,
        searchUsers,
        selectConversation,
        setCurrentConversation,
        setError
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

// Custom hook to use the message context
export const useMessage = () => useContext(MessageContext);
