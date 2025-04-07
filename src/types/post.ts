
export type PostType = 'post' | 'reel' | 'story';

export interface Post {
  id: string;
  userId: string;
  username: string;
  userRole: 'farmer' | 'influencer';
  userProfileImage?: string;
  type: PostType;
  content: string;
  images?: string[];
  video?: string;
  linkedProducts?: string[]; // Product IDs
  location?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  comments: Comment[];
  isLikedByCurrentUser?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  profileImage?: string;
  content: string;
  createdAt: Date;
  likes: number;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  profileImage?: string;
  media: string;
  type: 'image' | 'video';
  createdAt: Date;
  expiresAt: Date;
  linkedProductId?: string;
  viewedBy: string[];
}
