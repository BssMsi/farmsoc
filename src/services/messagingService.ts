
import { v4 as uuidv4 } from 'uuid';
import { Message, Chat, MessageStatusUpdate } from '../types/message';
import { sendMessage as apiSendMessage, getChatMessages, getUserChats, createChat } from './apiService';
import { getMessageQueue } from './messageQueueService';
import { User } from '../types/user';

// Wrap the API send message function to match the expected signature
const apiSendMessageWrapper = (message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> => {
  return apiSendMessage(message.chatId, message);
};

// Create the message queue with the wrapped API send function
const messageQueue = getMessageQueue(apiSendMessageWrapper);

// Optimistic local message cache to improve UI responsiveness
let messageCache: { [chatId: string]: Message[] } = {};
let chatCache: Chat[] = [];

// Send a message through the queue system
export const sendMessage = async (
  chatId: string, 
  content: string, 
  sender: User, 
  attachments?: any[]
): Promise<Message> => {
  // Create a client-side message ID for optimistic updates
  const clientId = uuidv4();
  const now = new Date();
  
  // Create a message object
  const messageData: Omit<Message, 'id' | 'createdAt'> = {
    chatId,
    senderId: sender.id,
    content,
    isRead: false,
    status: 'sending',
    clientId,
    attachments
  };
  
  // Create an optimistic message for immediate UI update
  const optimisticMessage: Message = {
    ...messageData,
    id: `temp-${clientId}`,
    createdAt: now
  };
  
  // Update the local cache immediately for a responsive UI
  updateLocalMessageCache(chatId, optimisticMessage);
  
  // Update the chat's last message and time
  updateChatWithMessage(chatId, optimisticMessage);
  
  // Enqueue the message for reliable delivery
  await messageQueue.enqueue(messageData);
  
  return optimisticMessage;
};

// Register message sent callback to update the optimistic message
messageQueue.onMessageSent((sentMessage: Message) => {
  // Find and replace the optimistic message with the real one
  if (messageCache[sentMessage.chatId]) {
    const messageIndex = messageCache[sentMessage.chatId].findIndex(
      m => m.clientId === sentMessage.clientId || m.id === `temp-${sentMessage.clientId}`
    );
    
    if (messageIndex >= 0) {
      messageCache[sentMessage.chatId][messageIndex] = sentMessage;
    }
  }
  
  // Update the chat's last message if needed
  updateChatWithMessage(sentMessage.chatId, sentMessage);
});

// Handle failed messages
messageQueue.onMessageFailed((failedMessage) => {
  // Update status for failed messages in UI
  if (messageCache[failedMessage.message.chatId]) {
    const messageIndex = messageCache[failedMessage.message.chatId].findIndex(
      m => m.clientId === failedMessage.message.clientId || m.id === `temp-${failedMessage.message.clientId}`
    );
    
    if (messageIndex >= 0) {
      messageCache[failedMessage.message.chatId][messageIndex].status = 'failed';
    }
  }
});

// Get messages with local cache enhancement
export const getMessages = async (chatId: string, forceRefresh = false): Promise<Message[]> => {
  if (!messageCache[chatId] || forceRefresh) {
    try {
      const messages = await getChatMessages(chatId);
      messageCache[chatId] = messages;
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return messageCache[chatId] || [];
    }
  }
  
  return messageCache[chatId];
};

// Get chats with local cache
export const getChats = async (userId: string, forceRefresh = false): Promise<Chat[]> => {
  if (chatCache.length === 0 || forceRefresh) {
    try {
      const chats = await getUserChats(userId);
      chatCache = chats;
      return chats;
    } catch (error) {
      console.error('Error fetching chats:', error);
      return chatCache;
    }
  }
  
  return chatCache;
};

// Create a new chat
export const startNewChat = async (participants: string[], isGroup: boolean, groupName?: string): Promise<Chat> => {
  const chat = await createChat(participants, isGroup, groupName);
  
  // Update local cache
  if (!chatCache.find(c => c.id === chat.id)) {
    chatCache.unshift(chat);
  }
  
  return chat;
};

// Update message read status
export const markMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  // We would implement the actual API call here
  // For now, we'll just update the local cache
  if (messageCache[chatId]) {
    messageCache[chatId] = messageCache[chatId].map(message => {
      if (message.senderId !== userId && !message.isRead) {
        return { ...message, isRead: true };
      }
      return message;
    });
  }
  
  // Update unread count in chat cache
  const chatIndex = chatCache.findIndex(c => c.id === chatId);
  if (chatIndex >= 0) {
    chatCache[chatIndex].unreadCount = 0;
  }
};

// Helpers for managing the local cache
const updateLocalMessageCache = (chatId: string, message: Message) => {
  if (!messageCache[chatId]) {
    messageCache[chatId] = [];
  }
  
  // Check if we already have this message (by clientId or id)
  const existingIndex = messageCache[chatId].findIndex(
    m => (m.clientId && m.clientId === message.clientId) || m.id === message.id
  );
  
  if (existingIndex >= 0) {
    // Update existing message
    messageCache[chatId][existingIndex] = message;
  } else {
    // Add new message
    messageCache[chatId].push(message);
    
    // Sort by creation time
    messageCache[chatId].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }
};

const updateChatWithMessage = (chatId: string, message: Message) => {
  const chatIndex = chatCache.findIndex(c => c.id === chatId);
  
  if (chatIndex >= 0) {
    // Update last message
    chatCache[chatIndex].lastMessage = message;
    chatCache[chatIndex].updatedAt = message.createdAt;
    
    // Move this chat to the top of the list
    const chat = chatCache[chatIndex];
    chatCache.splice(chatIndex, 1);
    chatCache.unshift(chat);
  }
};

// Clear caches (for logout, etc.)
export const clearMessageCaches = () => {
  messageCache = {};
  chatCache = [];
};
