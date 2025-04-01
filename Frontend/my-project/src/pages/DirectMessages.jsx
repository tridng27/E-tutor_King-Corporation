import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import ConversationList from '../components/DirectMessages/ConversationList';
import MessageArea from '../components/DirectMessages/MessageArea';
import UserSearch from '../components/DirectMessages/UserSearch';
import Sidebar from '../components/sidebar'; // Import the Sidebar component

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

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userId && conversations.length > 0) {
      const conversation = conversations.find(
        conv => conv.partner.UserID.toString() === userId
      );
      
      if (conversation) {
        selectConversation(conversation);
      }
    }
  }, [userId, conversations]);

  const handleSelectConversation = (conversation) => {
    selectConversation(conversation);
    setShowSearch(false);
  };

  const handleSendMessage = async (content) => {
    if (!currentConversation || !content.trim()) return;
    
    try {
      const receiverID = currentConversation.partner.UserID;
      await sendMessage(receiverID, content);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    }
  };

  const handleStartNewConversation = () => {
    setShowSearch(true);
    selectConversation(null);
  };

  const handleSelectUser = async (selectedUser) => {
    const existingConversation = conversations.find(
      conv => conv.partner.UserID === selectedUser.UserID
    );
    
    if (existingConversation) {
      selectConversation(existingConversation);
    } else {
      const newConversation = {
        partner: selectedUser,
        latestMessage: null
      };
      selectConversation(newConversation);
    }
    
    setShowSearch(false);
  };

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
              partner={currentConversation.partner}
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={loading}
              currentUser={user}
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
