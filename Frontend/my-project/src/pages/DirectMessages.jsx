import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import ConversationList from '../components/DirectMessages/ConversationList';
import MessageArea from '../components/DirectMessages/MessageArea';
import UserSearch from '../components/DirectMessages/UserSearch';
import Sidebar from '../components/sidebar';

const DirectMessages = () => {
  const {
    user,
    conversations,
    currentConversation,
    messages,
    messageLoading: loading,
    messageError: error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    selectConversation,
    setMessageError: setError
  } = useGlobal();
  
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const { userId } = useParams();
  
  // Use a ref to track the previous partner ID to prevent infinite loops
  const prevPartnerIdRef = useRef(null);
  const prevUrlIdRef = useRef(null);

  // Debug log for initial render and URL changes
  useEffect(() => {
    console.log("DirectMessages: URL userId parameter:", userId);
    console.log("DirectMessages: Current conversation partner:", currentConversation?.partner?.UserID);
    
    // Store the current URL ID in the ref
    prevUrlIdRef.current = userId;
  }, [userId, currentConversation]);

  // Fetch conversations on initial load
  useEffect(() => {
    console.log("DirectMessages: Fetching conversations...");
    fetchConversations();
  }, []);

  // Handle URL parameter changes and select the appropriate conversation
  useEffect(() => {
    if (userId && conversations.length > 0) {
      console.log("DirectMessages: Looking for conversation with partner ID from URL:", userId);
      
      // Convert both to strings for comparison to avoid type issues
      const conversation = conversations.find(
        conv => String(conv.partner.UserID) === String(userId)
      );
      
      if (conversation) {
        console.log("DirectMessages: Found matching conversation from URL:", conversation.partner.Name);
        
        // Check if we need to update the current conversation
        if (!currentConversation || String(currentConversation.partner.UserID) !== String(userId)) {
          console.log("DirectMessages: Updating current conversation to match URL");
          selectConversation(conversation);
        }
      } else {
        console.log("DirectMessages: No matching conversation found for URL partner ID:", userId);
      }
    }
  }, [userId, conversations, currentConversation, selectConversation]);

  // Fetch messages when current conversation changes
  useEffect(() => {
    if (currentConversation && currentConversation.partner) {
      const currentPartnerId = currentConversation.partner.UserID;
      
      console.log("DirectMessages: Current conversation partner ID:", currentPartnerId);
      console.log("DirectMessages: Previous partner ID ref:", prevPartnerIdRef.current);
      
      // Only fetch messages if the partner ID has changed
      if (prevPartnerIdRef.current !== currentPartnerId) {
        console.log("DirectMessages: Partner ID changed, fetching messages");
        fetchMessages(currentPartnerId);
        
        // Update the ref to the current partner ID
        prevPartnerIdRef.current = currentPartnerId;
        
        // Also update the URL if it doesn't match the current conversation
        if (String(userId) !== String(currentPartnerId)) {
          console.log("DirectMessages: URL doesn't match current conversation, updating URL");
          navigate(`/messages/${currentPartnerId}`, { replace: true });
        }
      }
    }
  }, [currentConversation, fetchMessages, userId, navigate]);

  const handleSelectConversation = (conversation) => {
    console.log("DirectMessages: Selecting conversation with partner:", conversation.partner.Name);
    console.log("DirectMessages: Partner ID:", conversation.partner.UserID);
    
    // Update the URL first
    navigate(`/messages/${conversation.partner.UserID}`);
    
    // Then update the state
    selectConversation(conversation);
    setShowSearch(false);
  };

  const handleSendMessage = async (content) => {
    if (!currentConversation || !content.trim()) return;
    
    try {
      const receiverID = currentConversation.partner.UserID;
      console.log("DirectMessages: Sending message to partner ID:", receiverID);
      await sendMessage(receiverID, content);
    } catch (err) {
      console.error("DirectMessages: Error sending message:", err);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleStartNewConversation = () => {
    console.log("DirectMessages: Starting new conversation");
    setShowSearch(true);
    selectConversation(null);
  };

  const handleSelectUser = async (selectedUser) => {
    console.log("DirectMessages: Selected user for new conversation:", selectedUser.Name);
    console.log("DirectMessages: Selected user ID:", selectedUser.UserID);
    
    const existingConversation = conversations.find(
      conv => String(conv.partner.UserID) === String(selectedUser.UserID)
    );
    
    if (existingConversation) {
      console.log("DirectMessages: Found existing conversation with this user");
      navigate(`/messages/${existingConversation.partner.UserID}`);
      selectConversation(existingConversation);
    } else {
      console.log("DirectMessages: Creating new conversation with this user");
      const newConversation = {
        partner: selectedUser,
        latestMessage: null
      };
      navigate(`/messages/${selectedUser.UserID}`);
      selectConversation(newConversation);
    }
    
    setShowSearch(false);
  };

  // Ensure user and partner IDs are strings for the MessageArea component
  const preparedUser = user ? {
    ...user,
    UserID: String(user.UserID)
  } : null;
  
  const preparedPartner = currentConversation?.partner ? {
    ...currentConversation.partner,
    UserID: String(currentConversation.partner.UserID)
  } : null;

  return (
    <div className="flex">
      {/* Add Sidebar */}
      <Sidebar />
      
      {/* Main content - adjust margin-left to accommodate sidebar */}
      <div className="flex flex-1 h-[calc(100vh-80px)] bg-gray-50 rounded-lg overflow-hidden shadow-md m-5 ml-20">
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Messages</h2>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
              onClick={handleStartNewConversation}
            >
              New Message
            </button>
          </div>
          
          {loading && !showSearch && conversations.length === 0 && (
            <div className="p-4 text-center text-gray-500">Loading conversations...</div>
          )}
          
          {!showSearch && (
            <ConversationList 
              conversations={conversations}
              selectedConversation={currentConversation}
              onSelectConversation={handleSelectConversation}
            />
          )}
          
          {showSearch && (
            <UserSearch onSelectUser={handleSelectUser} />
          )}
        </div>
        
        <div className="flex-1 bg-white flex flex-col">
          {currentConversation ? (
            <MessageArea 
              partner={preparedPartner}
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={loading}
              currentUser={preparedUser}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 text-gray-500">
              <p>Select a conversation or start a new one</p>
            </div>
          )}
        </div>
        
        {error && (
          <div className="absolute bottom-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-between items-center">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-red-700 hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessages;
