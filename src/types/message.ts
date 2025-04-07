
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  clientId?: string; // For optimistic updates and deduplication
  attachments?: Attachment[];
}

export interface Chat {
  id: string;
  participants: string[]; // user IDs
  participantNames: { [key: string]: string };
  participantImages: { [key: string]: string };
  lastMessage?: Message;
  unreadCount?: number;
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size: number;
  thumbnailUrl?: string;
  uploadProgress?: number;
  status?: 'uploading' | 'uploaded' | 'failed';
}

// For real-time message status updates
export interface MessageStatusUpdate {
  messageId: string;
  status: 'delivered' | 'read';
  updatedAt: Date;
}
