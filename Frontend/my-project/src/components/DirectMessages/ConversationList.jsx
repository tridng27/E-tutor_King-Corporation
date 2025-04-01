import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ConversationList = ({ conversations, selectedConversation, onSelectConversation }) => {
  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No conversations yet</p>
        <p className="mt-2">Start a new message to connect with someone</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => {
        const { partner, latestMessage } = conversation;
        const isSelected = selectedConversation && 
                          selectedConversation.partner.UserID === partner.UserID;
        
        const hasUnread = latestMessage && 
                         !latestMessage.IsRead && 
                         latestMessage.SenderID === partner.UserID;
        
        return (
          <div 
            key={partner.UserID}
            className={`p-3 border-b border-gray-100 cursor-pointer flex items-start
                      ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                      ${hasUnread ? 'bg-blue-50/70' : ''}`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="mr-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {partner.Name.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="font-medium text-gray-900 truncate">{partner.Name}</h4>
                {latestMessage && (
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(latestMessage.Timestamp), { addSuffix: true })}
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                {latestMessage ? (
                  <p className="text-sm text-gray-600 truncate">
                    {latestMessage.Content.length > 40 
                      ? `${latestMessage.Content.substring(0, 40)}...` 
                      : latestMessage.Content}
                  </p>
                ) : (
                  <p className="text-sm italic text-gray-400">No messages yet</p>
                )}
                
                {hasUnread && <span className="w-2 h-2 rounded-full bg-blue-600 ml-2 flex-shrink-0"></span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
