import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Image, Smile, AlertCircle, Loader, CheckCircle, Check } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { getMessages, sendMessage, markMessagesAsRead } from '../../services/messagingService';
import { Message, Chat as ChatType } from '../../types/message';
import { useToast } from '@/hooks/use-toast';

const Chat: React.FC = () => {
  const { id: chatId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  // Get all chats to find the current one
  const { data: chats = [] } = useQuery({
    queryKey: ['chats', user?.id],
    queryFn: async () => {
      // This would normally fetch chats, but we'll use whatever we already have in the cache
      return queryClient.getQueryData<ChatType[]>(['chats', user?.id]) || [];
    },
    enabled: !!user
  });
  
  // Find the current chat
  const currentChat = chats.find(chat => chat.id === chatId);
  
  // Get messages for this chat
  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => getMessages(chatId || '', false),
    enabled: !!chatId,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
  
  // Mark messages as read when chat is opened
  useEffect(() => {
    if (chatId && user) {
      markMessagesAsRead(chatId, user.id).catch(console.error);
    }
  }, [chatId, user]);
  
  // Handle scroll to track if user is at the bottom
  const handleScroll = useCallback(() => {
    if (messageListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
      setIsAtBottom(Math.abs(scrollHeight - scrollTop - clientHeight) < 10);
    }
  }, []);
  
  // Scroll to bottom when new messages arrive (if already at bottom)
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);
  
  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Send message handler
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !chatId) return;
    
    try {
      setSending(true);
      await sendMessage(chatId, newMessage, user);
      setNewMessage('');
      scrollToBottom();
      
      // Refresh messages to include the new one
      refetch();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Message Queued",
        description: "Your message will be delivered when connection is restored.",
        variant: "default"
      });
    } finally {
      setSending(false);
    }
  };
  
  // Get chat name and image
  const getChatName = () => {
    if (!currentChat) return 'Chat';
    
    if (currentChat.isGroup) return currentChat.groupName || 'Group Chat';
    
    if (user) {
      const otherParticipantId = currentChat.participants.find(id => id !== user.id);
      return otherParticipantId ? currentChat.participantNames[otherParticipantId] : 'Unknown User';
    }
    
    return 'Unknown User';
  };
  
  const getChatImage = () => {
    if (!currentChat) return 'https://via.placeholder.com/40';
    
    if (currentChat.isGroup) return currentChat.groupImage || 'https://via.placeholder.com/40?text=Group';
    
    if (user) {
      const otherParticipantId = currentChat.participants.find(id => id !== user.id);
      return otherParticipantId ? 
        currentChat.participantImages[otherParticipantId] || 'https://via.placeholder.com/40' : 
        'https://via.placeholder.com/40';
    }
    
    return 'https://via.placeholder.com/40';
  };
  
  const formatMessageTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const formatMessageDate = (date: Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    
    // If message is from today
    if (
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear()
    ) {
      return 'Today';
    }
    
    // If message is from yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (
      messageDate.getDate() === yesterday.getDate() &&
      messageDate.getMonth() === yesterday.getMonth() &&
      messageDate.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday';
    }
    
    // Otherwise show full date
    return messageDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = {};
  messages.forEach(message => {
    const date = formatMessageDate(message.createdAt);
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  // Render message status indicator
  const renderMessageStatus = (message: Message) => {
    if (message.senderId !== user?.id) return null;
    
    switch (message.status) {
      case 'sending':
        return <Loader size={12} className="text-gray-400 animate-spin ml-1" />;
      case 'failed':
        return <AlertCircle size={12} className="text-red-500 ml-1" />;
      case 'delivered':
        return <Check size={12} className="text-gray-400 ml-1" />;
      case 'read':
        return <CheckCircle size={12} className="text-green-500 ml-1" />;
      default:
        return <Check size={12} className="text-gray-400 ml-1" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat header */}
      <div className="p-4 border-b flex items-center">
        <button 
          className="p-1 mr-3 text-gray-600"
          onClick={() => navigate('/app/messages')}
        >
          <ArrowLeft size={20} />
        </button>
        <img 
          src={getChatImage()} 
          alt={getChatName()} 
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <div className="font-medium">{getChatName()}</div>
          {currentChat?.isGroup && (
            <div className="text-xs text-gray-500">
              {currentChat.participants.length} participants
            </div>
          )}
        </div>
      </div>
      
      {/* Messages area */}
      <div 
        className="flex-1 overflow-y-auto p-4 bg-gray-50" 
        ref={messageListRef}
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="text-center p-4 text-gray-500">Loading messages...</div>
        ) : Object.keys(groupedMessages).length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            <p className="mb-2">No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="text-center my-4">
                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                  {date}
                </span>
              </div>
              
              {dateMessages.map((message) => {
                const isCurrentUser = message.senderId === user?.id;
                const isTemporary = message.id.startsWith('temp-');
                
                return (
                  <div 
                    key={message.id}
                    className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isCurrentUser && (
                      <img 
                        src={
                          currentChat?.isGroup ? 
                          currentChat.participantImages[message.senderId] || 'https://via.placeholder.com/40' : 
                          getChatImage()
                        } 
                        alt="Sender" 
                        className="w-8 h-8 rounded-full object-cover mr-2 self-end"
                      />
                    )}
                    <div className="max-w-[75%]">
                      {currentChat?.isGroup && !isCurrentUser && (
                        <div className="text-xs text-gray-500 mb-1 ml-1">
                          {currentChat.participantNames[message.senderId] || 'Unknown User'}
                        </div>
                      )}
                      <div className={`rounded-lg px-4 py-2 inline-block ${
                        isCurrentUser ? 
                        'bg-kisanly-primary text-white rounded-br-none' : 
                        'bg-white border rounded-bl-none'
                      } ${isTemporary ? 'opacity-70' : ''}`}>
                        {message.content}
                        <div className={`text-xs mt-1 text-right flex items-center justify-end ${
                          isCurrentUser ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {formatMessageTime(message.createdAt)}
                          {renderMessageStatus(message)}
                        </div>
                      </div>
                      {message.status === 'failed' && (
                        <div className="text-xs text-red-500 mt-1 text-right">
                          Failed to send. <button className="underline">Retry</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
        
        {!isAtBottom && messages.length > 10 && (
          <button 
            className="fixed bottom-20 right-6 bg-white shadow-md rounded-full p-2"
            onClick={scrollToBottom}
          >
            <ArrowLeft className="transform rotate-90" size={20} />
          </button>
        )}
      </div>
      
      {/* Message input */}
      <div className="p-3 border-t flex items-center">
        <button className="p-2 text-gray-500 hover:text-kisanly-primary">
          <Image size={20} />
        </button>
        <button className="p-2 text-gray-500 hover:text-kisanly-primary">
          <Smile size={20} />
        </button>
        <input 
          type="text" 
          className="flex-1 border rounded-full px-4 py-2 mx-2 focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={sending}
        />
        <button 
          className={`p-2 rounded-full ${
            newMessage.trim() && !sending ? 'bg-kisanly-primary text-white' : 'bg-gray-200 text-gray-400'
          }`}
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Chat;
