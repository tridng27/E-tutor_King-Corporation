import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { io } from 'socket.io-client';

const MessageArea = ({ partner, messages: initialMessages, onSendMessage, loading, currentUser }) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(initialMessages || []);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Debug logs to help identify issues
  useEffect(() => {
    console.log("Current user:", currentUser?.UserID);
    console.log("Partner:", partner?.UserID);
    console.log("Initial messages:", initialMessages?.length);
  }, [currentUser, partner, initialMessages]);
  
  // Initialize socket connection
  useEffect(() => {
    // Connect to socket server with the direct-messages namespace
    const socketUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/direct-messages`;
    console.log("Connecting to socket server:", socketUrl);
    
    socketRef.current = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    
    // Debug socket connection
    socketRef.current.on('connect', () => {
      console.log('Socket connected with ID:', socketRef.current.id);
      setSocketConnected(true);
      
      // Join user's room for receiving messages
      if (currentUser?.UserID) {
        console.log('Joining room for user:', currentUser.UserID);
        socketRef.current.emit('join', currentUser.UserID);
      }
    });
    
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
    });
    
    // Listen for incoming messages
    socketRef.current.on('receive_message', (message) => {
      console.log('Received message via socket:', message);
      
      setMessages(prevMessages => {
        // Check if message already exists to prevent duplicates
        const exists = prevMessages.some(m => m.MessageID === message.MessageID);
        if (exists) {
          console.log('Message already exists, skipping');
          return prevMessages;
        }
        
        // Only add message if it's part of this conversation
        const isRelevantMessage = 
          (message.SenderID === currentUser?.UserID && message.ReceiverID === partner?.UserID) ||
          (message.SenderID === partner?.UserID && message.ReceiverID === currentUser?.UserID);
        
        console.log('Is message relevant to this conversation?', isRelevantMessage);
        
        if (isRelevantMessage) {
          console.log('Adding new message to conversation');
          return [...prevMessages, message];
        }
        
        return prevMessages;
      });
      
      // If we receive a message from partner, they're no longer typing
      if (message.SenderID === partner?.UserID) {
        setPartnerTyping(false);
      }
    });
    
    // Listen for typing indicators
    socketRef.current.on('user_typing', (data) => {
      console.log('Typing indicator received:', data);
      if (data.userID === partner?.UserID) {
        setPartnerTyping(data.isTyping);
      }
    });
    
    // Listen for errors
    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    // Clean up on unmount or when dependencies change
    return () => {
      console.log('Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setSocketConnected(false);
    };
  }, [currentUser?.UserID]); // Only re-connect when user changes
  
  // Handle partner change - rejoin room if needed
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && partner?.UserID) {
      console.log('Partner changed to:', partner.UserID);
    }
  }, [partner?.UserID]);
  
  // Update messages when prop changes
  useEffect(() => {
    if (initialMessages) {
      console.log('Updating messages from props:', initialMessages.length);
      setMessages(initialMessages);
    }
  }, [initialMessages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, partnerTyping]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping && socketRef.current && socketRef.current.connected && partner?.UserID) {
      setIsTyping(true);
      socketRef.current.emit('typing', {
        senderID: currentUser.UserID,
        receiverID: partner.UserID,
        isTyping: true
      });
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && socketRef.current.connected && partner?.UserID) {
        setIsTyping(false);
        socketRef.current.emit('typing', {
          senderID: currentUser.UserID,
          receiverID: partner.UserID,
          isTyping: false
        });
      }
    }, 2000);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socketRef.current && socketRef.current.connected && partner?.UserID) {
      console.log('Sending message to:', partner.UserID);
      
      // Send message through socket only
      socketRef.current.emit('send_message', {
        senderID: currentUser.UserID,
        receiverID: partner.UserID,
        content: newMessage
      });
      
      // Don't call onSendMessage here as it's likely causing the duplicate
      // The socket server will emit the message back to you, which will be caught
      // by the 'receive_message' event handler
      
      // Clear typing indicator
      setIsTyping(false);
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('typing', {
          senderID: currentUser.UserID,
          receiverID: partner.UserID,
          isTyping: false
        });
      }
      
      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      setNewMessage('');
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center">
        <h3 className="text-lg font-medium">{partner?.Name}</h3>
        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {partner?.Role}
        </span>
        {socketConnected ? (
          <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
            Connected
          </span>
        ) : (
          <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
            Disconnected
          </span>
        )}
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet</p>
            <p className="mt-2">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message) => {
            const isSentByMe = message.SenderID === currentUser?.UserID;
            
            return (
              <div 
                key={message.MessageID || `temp-${Date.now()}-${Math.random()}`} 
                className={`max-w-[70%] mb-3 ${isSentByMe ? 'self-end' : 'self-start'}`}
              >
                <div 
                  className={`px-4 py-2.5 rounded-2xl relative
                            ${isSentByMe 
                              ? 'bg-blue-600 text-white rounded-br-sm' 
                              : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}
                >
                  <p className="break-words">{message.Content}</p>
                  <span 
                    className={`text-xs block mt-1 text-right
                              ${isSentByMe ? 'text-blue-100' : 'text-gray-500'}`}
                  >
                    {formatDistanceToNow(new Date(message.Timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing indicator */}
        {partnerTyping && (
          <div className="self-start max-w-[70%] mb-3">
            <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-2xl rounded-bl-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form 
        className="p-3 border-t border-gray-200 flex"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          disabled={loading || !socketConnected}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim() || loading || !socketConnected}
          className="ml-2 px-5 py-2 bg-blue-600 text-white rounded-full disabled:bg-blue-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageArea;
