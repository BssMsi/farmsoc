export type UserRole = 'consumer' | 'farmer' | 'influencer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  familyMembers?: FamilyMember[];
  socialLinks?: SocialLink[];
  bankDetails?: BankDetails;
  diseases?: string[];
}

export interface FamilyMember {
  id: string;
  name: string;
  age?: number;
  relationship: string;
  dietaryPreferences?: string[];
  healthConditions?: string[];
}

export interface SocialLink {
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'other';
  username: string;
  url?: string;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode?: string; // For Indian banks
  upiId?: string;
}
