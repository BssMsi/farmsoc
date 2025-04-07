
export interface Event {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  type: 'harvest' | 'workshop' | 'market' | 'other';
  startDate: Date;
  endDate: Date;
  location: string;
  image?: string;
  maxParticipants?: number;
  currentParticipants: number;
  participants: string[]; // user IDs
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Fundraiser {
  id: string;
  farmerId: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  image?: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  contributors: Contributor[];
  updates: FundraiserUpdate[];
  createdAt: Date;
  updatedAt: Date;
}

interface Contributor {
  userId: string;
  name: string;
  amount: number;
  date: Date;
  isAnonymous: boolean;
}

interface FundraiserUpdate {
  id: string;
  content: string;
  image?: string;
  date: Date;
}

export interface CropRequest {
  id: string;
  requesterId: string;
  cropName: string;
  description: string;
  image?: string;
  votes: number;
  voterIds: string[];
  status: 'open' | 'fulfilled' | 'cancelled';
  fulfilledBy?: string; // farmer ID
  createdAt: Date;
  updatedAt: Date;
}
