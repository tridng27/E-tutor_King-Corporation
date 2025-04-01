import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

const MessageArea = ({ partner, messages, onSendMessage, loading, currentUser }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center">
        <h3 className="text-lg font-medium">{partner.Name}</h3>
        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {partner.Role}
        </span>
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
            const isSentByMe = message.SenderID === currentUser.UserID;
            
            return (
              <div 
                key={message.MessageID} 
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
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim() || loading}
          className="ml-2 px-5 py-2 bg-blue-600 text-white rounded-full disabled:bg-blue-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageArea;
