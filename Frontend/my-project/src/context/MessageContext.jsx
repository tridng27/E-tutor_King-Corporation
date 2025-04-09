import { createContext, useState, useContext, useEffect, useCallback } from "react";
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
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserConversations();
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load conversations');
      setLoading(false);
    }
  }, []);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (userID) => {
    try {
      console.log("Fetching messages for user ID:", userID);
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
      console.error("Error fetching messages:", error);
      setError('Failed to load messages');
      setLoading(false);
    }
  }, [fetchConversations]);

  // Send a message
  const sendMessage = useCallback(async (receiverID, content) => {
    try {
      console.log("Sending message to receiver ID:", receiverID);
      await apiService.sendDirectMessage(receiverID, content);
      // Refresh messages
      await fetchMessages(receiverID);
      // Refresh conversations
      await fetchConversations();
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      setError('Failed to send message');
      return false;
    }
  }, [fetchMessages, fetchConversations]);

  // Search users
  const searchUsers = useCallback(async (query) => {
    try {
      console.log("Searching for users with query:", query);
      const response = await apiService.searchUsers(query);
      console.log("Search results:", response);
      return response.data || [];
    } catch (error) {
      console.error("Failed to search users:", error);
      setError('Failed to search users');
      return [];
    }
  }, []);

  // Select a conversation - FIXED VERSION
  const selectConversation = useCallback((conversation) => {
    console.log("Selecting conversation with partner:", conversation?.partner?.UserID);
    
    // First update the current conversation state
    setCurrentConversation(conversation);
    
    // Then fetch messages if we have a conversation
    if (conversation && conversation.partner) {
      // We don't need to await this - it will update the messages state when done
      fetchMessages(conversation.partner.UserID);
    } else {
      // Clear messages if no conversation is selected
      setMessages([]);
    }
  }, [fetchMessages]);

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
