import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types/message';
import { openDB, IDBPDatabase } from 'idb';

// Interface for queued messages
export interface QueuedMessage {
  id: string;
  message: Omit<Message, 'id' | 'createdAt'>;
  attempts: number;
  status: 'pending' | 'sending' | 'failed' | 'sent';
  createdAt: Date;
  lastAttempt?: Date;
}

// Database setup
const DB_NAME = 'message_queue_db';
const DB_VERSION = 1;
const MESSAGE_STORE = 'messages';
const SENT_STORE = 'sent_messages';

// Initialize the IndexedDB database
const initDatabase = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create a store for the message queue
      if (!db.objectStoreNames.contains(MESSAGE_STORE)) {
        const messageStore = db.createObjectStore(MESSAGE_STORE, { keyPath: 'id' });
        messageStore.createIndex('status', 'status');
        messageStore.createIndex('chatId', 'message.chatId');
      }
      
      // Create a store for sent messages (for offline sync)
      if (!db.objectStoreNames.contains(SENT_STORE)) {
        const sentStore = db.createObjectStore(SENT_STORE, { keyPath: 'id' });
        sentStore.createIndex('chatId', 'chatId');
      }
    },
  });
};

// MessageQueue class for managing message queue operations
export class MessageQueue {
  private db: IDBPDatabase | null = null;
  private processingQueue = false;
  private batchSize = 50;
  private maxRetries = 5;
  private retryDelays = [1000, 3000, 5000, 10000, 30000]; // Delay in ms for each retry attempt
  private onMessageSentCallbacks: ((message: Message) => void)[] = [];
  private onMessageFailedCallbacks: ((queuedMessage: QueuedMessage) => void)[] = [];
  private processorIntervalId: NodeJS.Timeout | null = null;
  private onlineSendFunction: (message: Omit<Message, 'id' | 'createdAt'>) => Promise<Message>;
  
  constructor(sendFunction: (message: Omit<Message, 'id' | 'createdAt'>) => Promise<Message>) {
    this.onlineSendFunction = sendFunction;
    this.init();
  }
  
  private async init() {
    try {
      this.db = await initDatabase();
      
      // Set up the queue processor interval
      this.processorIntervalId = setInterval(() => this.processQueue(), 200);
      
      // Listen for online/offline events
      window.addEventListener('online', () => {
        console.log('Online: Starting message queue processing');
        this.processQueue();
      });
      
      console.log('Message queue initialized');
    } catch (error) {
      console.error('Failed to initialize message queue:', error);
    }
  }
  
  public async enqueue(message: Omit<Message, 'id' | 'createdAt'>): Promise<string> {
    if (!this.db) {
      await this.init();
      if (!this.db) throw new Error('Failed to initialize database');
    }
    
    const queuedMessage: QueuedMessage = {
      id: uuidv4(),
      message,
      attempts: 0,
      status: 'pending',
      createdAt: new Date()
    };
    
    await this.db.put(MESSAGE_STORE, queuedMessage);
    
    // Attempt to process the queue immediately if we're online
    if (navigator.onLine) {
      this.processQueue();
    }
    
    return queuedMessage.id;
  }
  
  private async processQueue() {
    // Avoid running multiple queue processors simultaneously
    if (this.processingQueue || !navigator.onLine || !this.db) return;
    
    try {
      this.processingQueue = true;
      
      // Get pending messages and sort by creation time (oldest first)
      const pendingMessages = await this.db.getAllFromIndex(
        MESSAGE_STORE, 
        'status', 
        'pending'
      );
      
      if (pendingMessages.length === 0) {
        this.processingQueue = false;
        return;
      }
      
      // Sort by creation time
      pendingMessages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      // Process in batches
      const batch = pendingMessages.slice(0, this.batchSize);
      const sendPromises = batch.map(item => this.sendMessage(item));
      
      await Promise.allSettled(sendPromises);
      
    } catch (error) {
      console.error('Error processing message queue:', error);
    } finally {
      this.processingQueue = false;
      
      // If there are more messages, keep processing
      const pendingCount = await this.pendingCount();
      if (pendingCount > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }
  
  private async sendMessage(queuedMessage: QueuedMessage): Promise<void> {
    if (!this.db) return;
    
    // Update status to sending
    queuedMessage.status = 'sending';
    queuedMessage.attempts += 1;
    queuedMessage.lastAttempt = new Date();
    await this.db.put(MESSAGE_STORE, queuedMessage);
    
    try {
      // Attempt to send the message
      const sentMessage = await this.onlineSendFunction(queuedMessage.message);
      
      // If successful, remove from queue and add to sent store
      await this.db.delete(MESSAGE_STORE, queuedMessage.id);
      await this.db.put(SENT_STORE, {
        id: sentMessage.id,
        chatId: sentMessage.chatId,
        senderId: sentMessage.senderId,
        content: sentMessage.content,
        createdAt: sentMessage.createdAt,
        isRead: sentMessage.isRead,
        attachments: sentMessage.attachments
      });
      
      // Notify listeners
      this.onMessageSentCallbacks.forEach(callback => callback(sentMessage));
      
    } catch (error) {
      console.error(`Failed to send message (attempt ${queuedMessage.attempts}):`, error);
      
      // Update the queued message with failure or retry info
      if (queuedMessage.attempts >= this.maxRetries) {
        queuedMessage.status = 'failed';
        await this.db.put(MESSAGE_STORE, queuedMessage);
        
        // Notify listeners about failure
        this.onMessageFailedCallbacks.forEach(callback => callback(queuedMessage));
      } else {
        // Calculate backoff time for next retry
        const retryDelay = this.retryDelays[Math.min(queuedMessage.attempts - 1, this.retryDelays.length - 1)];
        
        // Set back to pending for retry
        queuedMessage.status = 'pending';
        await this.db.put(MESSAGE_STORE, queuedMessage);
        
        // Schedule retry after delay
        setTimeout(() => this.processQueue(), retryDelay);
      }
    }
  }
  
  public async pendingCount(): Promise<number> {
    if (!this.db) return 0;
    return this.db.countFromIndex(MESSAGE_STORE, 'status', 'pending');
  }
  
  public async failedCount(): Promise<number> {
    if (!this.db) return 0;
    return this.db.countFromIndex(MESSAGE_STORE, 'status', 'failed');
  }
  
  public async retryFailed(): Promise<void> {
    if (!this.db) return;
    
    const failedMessages = await this.db.getAllFromIndex(MESSAGE_STORE, 'status', 'failed');
    
    for (const message of failedMessages) {
      message.status = 'pending';
      message.attempts = 0;
      await this.db.put(MESSAGE_STORE, message);
    }
    
    this.processQueue();
  }
  
  public onMessageSent(callback: (message: Message) => void): () => void {
    this.onMessageSentCallbacks.push(callback);
    
    // Return a function to remove this callback
    return () => {
      this.onMessageSentCallbacks = this.onMessageSentCallbacks.filter(cb => cb !== callback);
    };
  }
  
  public onMessageFailed(callback: (message: QueuedMessage) => void): () => void {
    this.onMessageFailedCallbacks.push(callback);
    
    // Return a function to remove this callback
    return () => {
      this.onMessageFailedCallbacks = this.onMessageFailedCallbacks.filter(cb => cb !== callback);
    };
  }
  
  public destroy(): void {
    if (this.processorIntervalId) {
      clearInterval(this.processorIntervalId);
    }
    
    window.removeEventListener('online', () => this.processQueue());
    
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Create a singleton instance
let messageQueueInstance: MessageQueue | null = null;

export const getMessageQueue = (
  sendFunction: (message: Omit<Message, 'id' | 'createdAt'>) => Promise<Message>
) => {
  if (!messageQueueInstance) {
    messageQueueInstance = new MessageQueue(sendFunction);
  }
  return messageQueueInstance;
};
