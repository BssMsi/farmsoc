
import React from 'react';
import { Check, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { Chat } from '../../types/message';
import { useAuth } from '../../contexts/AuthContext';

interface ChatListItemProps {
  chat: Chat;
  onClick: () => void;
  currentUserId?: string;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, onClick, currentUserId }) => {
  const { user } = useAuth();
  const userId = currentUserId || user?.id;
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    // If message is from today, show time
    if (
      messageDate.getDate() === now.getDate() &&
      messageDate.getMonth() === now.getMonth() &&
      messageDate.getFullYear() === now.getFullYear()
    ) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // If message is from this week, show day name
    const diff = now.getTime() - messageDate.getTime();
    const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 7) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    }
    
    // Otherwise show date
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getChatName = () => {
    if (chat.isGroup) return chat.groupName || 'Group Chat';
    
    if (userId) {
      const otherParticipantId = chat.participants.find(id => id !== userId);
      return otherParticipantId ? chat.participantNames[otherParticipantId] : 'Unknown User';
    }
    
    return 'Unknown User';
  };
  
  const getChatImage = () => {
    if (chat.isGroup) return chat.groupImage || 'https://via.placeholder.com/40?text=Group';
    
    if (userId) {
      const otherParticipantId = chat.participants.find(id => id !== userId);
      return otherParticipantId ? 
        chat.participantImages[otherParticipantId] || 'https://via.placeholder.com/40' : 
        'https://via.placeholder.com/40';
    }
    
    return 'https://via.placeholder.com/40';
  };

  // Render message status indicator
  const renderMessageStatus = () => {
    if (!chat.lastMessage || chat.lastMessage.senderId !== userId) return null;
    
    switch (chat.lastMessage.status) {
      case 'sending':
        return <Loader size={12} className="text-gray-400 animate-spin ml-1" />;
      case 'failed':
        return <AlertCircle size={12} className="text-red-500 ml-1" />;
      case 'delivered':
        return <Check size={12} className="text-gray-400 ml-1" />;
      case 'read':
        return <CheckCircle size={12} className="text-green-500 ml-1" />;
      default:
        return null;
    }
  };
  
  return (
    <div 
      className="flex items-center p-3 cursor-pointer hover:bg-gray-50"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={getChatImage()} 
          alt={getChatName()} 
          className="w-12 h-12 rounded-full object-cover"
        />
        {(chat.unreadCount && chat.unreadCount > 0) && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
          </div>
        )}
      </div>
      <div className="ml-3 flex-1">
        <div className="flex justify-between">
          <div className="font-medium">{getChatName()}</div>
          {chat.updatedAt && (
            <div className="text-xs text-gray-500">
              {formatTime(chat.updatedAt)}
            </div>
          )}
        </div>
        {chat.lastMessage && (
          <div className="flex items-center">
            <div className="text-sm text-gray-500 truncate flex-1">
              {chat.lastMessage.content}
            </div>
            {renderMessageStatus()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
