
import { User } from '../types/user';
import { Product } from '../types/product';
import { Post } from '../types/post';
import { Event, Fundraiser, CropRequest } from '../types/event';
import { Order } from '../types/order';
import { Chat, Message } from '../types/message';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'consumer@example.com',
    name: 'John Consumer',
    role: 'consumer',
    profileImage: 'https://i.pravatar.cc/150?img=3',
    location: 'Mumbai, India',
    bio: 'Health-conscious consumer looking for fresh organic produce.',
    phoneNumber: '+91 9876543210',
    familyMembers: [
      { id: 'f1', name: 'Sarah', relationship: 'spouse', age: 35 },
      { id: 'f2', name: 'Tommy', relationship: 'son', age: 10 }
    ]
  },
  {
    id: '2',
    email: 'farmer@example.com',
    name: 'Jane Farmer',
    role: 'farmer',
    profileImage: 'https://i.pravatar.cc/150?img=4',
    location: 'Punjab, India',
    bio: 'Third-generation farmer specializing in organic vegetables and fruits.',
    phoneNumber: '+91 9876543211',
    socialLinks: [
      { platform: 'instagram', username: 'organicfarmerjane' },
      { platform: 'facebook', username: 'JaneFarmer' }
    ],
    bankDetails: {
      accountName: 'Jane Farmer',
      accountNumber: 'XXXX1234',
      bankName: 'State Bank of India',
      ifscCode: 'SBIN0001234',
      upiId: 'janefarmer@upi'
    }
  },
  {
    id: '3',
    email: 'influencer@example.com',
    name: 'Sam Influencer',
    role: 'influencer',
    profileImage: 'https://i.pravatar.cc/150?img=5',
    location: 'Delhi, India',
    bio: 'Food blogger and sustainable living advocate.',
    phoneNumber: '+91 9876543212',
    socialLinks: [
      { platform: 'instagram', username: 'sustainable_sam' },
      { platform: 'twitter', username: 'SamSustainable' },
      { platform: 'linkedin', username: 'sam-sustainable' }
    ]
  }
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 'p1',
    farmerId: '2',
    name: 'Organic Tomatoes',
    description: 'Fresh organic tomatoes grown without pesticides.',
    price: 60,
    images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    category: 'vegetables',
    quantity: 100,
    unit: 'kg',
    tags: ['organic', 'fresh', 'pesticide-free'],
    farmingMethod: 'organic',
    rating: 4.5,
    reviewCount: 27,
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15')
  },
  {
    id: 'p2',
    farmerId: '2',
    name: 'Basmati Rice',
    description: 'Premium quality aged basmati rice.',
    price: 150,
    images: ['https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    category: 'grains',
    quantity: 200,
    unit: 'kg',
    tags: ['basmati', 'premium', 'aged'],
    rating: 4.8,
    reviewCount: 42,
    createdAt: new Date('2023-05-16'),
    updatedAt: new Date('2023-05-16')
  },
  {
    id: 'p3',
    farmerId: '2',
    name: 'Fresh Strawberries',
    description: 'Sweet and juicy strawberries, picked at peak ripeness.',
    price: 120,
    images: ['https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    category: 'fruits',
    quantity: 50,
    unit: 'kg',
    tags: ['sweet', 'juicy', 'seasonal'],
    farmingMethod: 'organic',
    rating: 4.7,
    reviewCount: 18,
    createdAt: new Date('2023-05-17'),
    updatedAt: new Date('2023-05-17')
  },
  {
    id: 'p4',
    farmerId: '2',
    name: 'Pure Honey',
    description: 'Raw, unfiltered honey from wildflower nectar.',
    price: 350,
    images: ['https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    category: 'honey',
    quantity: 30,
    unit: 'kg',
    tags: ['raw', 'unfiltered', 'natural'],
    rating: 4.9,
    reviewCount: 36,
    createdAt: new Date('2023-05-18'),
    updatedAt: new Date('2023-05-18')
  },
  {
    id: 'p5',
    farmerId: '2',
    name: 'Fresh Spinach',
    description: 'Nutrient-rich spinach, harvested daily.',
    price: 40,
    images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    category: 'vegetables',
    quantity: 75,
    unit: 'kg',
    tags: ['green', 'leafy', 'nutrient-rich'],
    farmingMethod: 'hydroponic',
    rating: 4.4,
    reviewCount: 23,
    createdAt: new Date('2023-05-19'),
    updatedAt: new Date('2023-05-19')
  }
];

// Mock Posts
export const mockPosts: Post[] = [
  {
    id: 'post1',
    userId: '2',
    username: 'Jane Farmer',
    userRole: 'farmer',
    userProfileImage: 'https://i.pravatar.cc/150?img=4',
    type: 'post',
    content: 'Just harvested a fresh batch of organic tomatoes! Available now.',
    images: ['https://images.unsplash.com/photo-1592924357236-864f5bf5c177?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    linkedProducts: ['p1'],
    location: 'Punjab, India',
    createdAt: new Date('2023-06-01T09:30:00'),
    updatedAt: new Date('2023-06-01T09:30:00'),
    likes: 24,
    comments: [
      {
        id: 'c1',
        userId: '1',
        username: 'John Consumer',
        profileImage: 'https://i.pravatar.cc/150?img=3',
        content: 'Those look amazing! Will definitely order some.',
        createdAt: new Date('2023-06-01T10:15:00'),
        likes: 2
      }
    ]
  },
  {
    id: 'post2',
    userId: '3',
    username: 'Sam Influencer',
    userRole: 'influencer',
    userProfileImage: 'https://i.pravatar.cc/150?img=5',
    type: 'reel',
    content: 'Check out this amazing recipe using Jane\'s organic tomatoes!',
    video: 'https://www.example.com/videos/tomato-recipe.mp4',
    linkedProducts: ['p1'],
    createdAt: new Date('2023-06-02T14:45:00'),
    updatedAt: new Date('2023-06-02T14:45:00'),
    likes: 156,
    comments: [
      {
        id: 'c2',
        userId: '1',
        username: 'John Consumer',
        profileImage: 'https://i.pravatar.cc/150?img=3',
        content: 'This recipe looks delicious! Just ordered the tomatoes.',
        createdAt: new Date('2023-06-02T15:30:00'),
        likes: 5
      }
    ]
  },
  {
    id: 'post3',
    userId: '2',
    username: 'Jane Farmer',
    userRole: 'farmer',
    userProfileImage: 'https://i.pravatar.cc/150?img=4',
    type: 'post',
    content: 'Our strawberry season is in full swing! Limited quantity available, order now!',
    images: ['https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'],
    linkedProducts: ['p3'],
    location: 'Punjab, India',
    createdAt: new Date('2023-06-03T11:20:00'),
    updatedAt: new Date('2023-06-03T11:20:00'),
    likes: 42,
    comments: []
  }
];

// Mock Events
export const mockEvents: Event[] = [
  {
    id: 'e1',
    creatorId: '2',
    title: 'Strawberry Harvest Festival',
    description: 'Join us for a day of strawberry picking and fun activities.',
    type: 'harvest',
    startDate: new Date('2023-07-15T09:00:00'),
    endDate: new Date('2023-07-15T17:00:00'),
    location: 'Green Fields Farm, Punjab',
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    maxParticipants: 50,
    currentParticipants: 18,
    participants: ['1'],
    status: 'upcoming',
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-01')
  }
];

// Mock Fundraisers
export const mockFundraisers: Fundraiser[] = [
  {
    id: 'f1',
    farmerId: '2',
    title: 'Expand Our Organic Farm',
    description: 'Help us purchase new land to grow more organic produce.',
    goal: 500000,
    raised: 125000,
    image: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2023-08-01'),
    status: 'active',
    contributors: [
      {
        userId: '1',
        name: 'John Consumer',
        amount: 5000,
        date: new Date('2023-06-05'),
        isAnonymous: false
      },
      {
        userId: '3',
        name: 'Sam Influencer',
        amount: 15000,
        date: new Date('2023-06-10'),
        isAnonymous: false
      }
    ],
    updates: [
      {
        id: 'u1',
        content: 'We have reached 25% of our goal! Thank you to all contributors.',
        date: new Date('2023-06-15')
      }
    ],
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-15')
  }
];

// Mock Crop Requests
export const mockCropRequests: CropRequest[] = [
  {
    id: 'cr1',
    requesterId: '1',
    cropName: 'Purple Carrots',
    description: 'Looking for farmers who can grow organic purple carrots.',
    image: 'https://images.unsplash.com/photo-1598170845058-c2edb8b0eb1b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    votes: 12,
    voterIds: ['1', '3'],
    status: 'open',
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-10')
  }
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'o1',
    customerId: '1',
    items: [
      {
        productId: 'p1',
        productName: 'Organic Tomatoes',
        farmerId: '2',
        farmerName: 'Jane Farmer',
        quantity: 2,
        unitPrice: 60,
        totalPrice: 120,
        status: 'confirmed'
      },
      {
        productId: 'p3',
        productName: 'Fresh Strawberries',
        farmerId: '2',
        farmerName: 'Jane Farmer',
        quantity: 1,
        unitPrice: 120,
        totalPrice: 120,
        status: 'confirmed'
      }
    ],
    totalAmount: 240,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'upi',
    shippingAddress: {
      name: 'John Consumer',
      street: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400001',
      phoneNumber: '+91 9876543210'
    },
    billingAddress: {
      name: 'John Consumer',
      street: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400001',
      phoneNumber: '+91 9876543210'
    },
    deliveryDate: new Date('2023-06-20'),
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2023-06-15')
  }
];

// Mock Chats and Messages
export const mockChats: Chat[] = [
  {
    id: 'chat1',
    participants: ['1', '2'],
    participantNames: {
      '1': 'John Consumer',
      '2': 'Jane Farmer'
    },
    participantImages: {
      '1': 'https://i.pravatar.cc/150?img=3',
      '2': 'https://i.pravatar.cc/150?img=4'
    },
    isGroup: false,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-15')
  },
  {
    id: 'chat2',
    participants: ['1', '2', '3'],
    participantNames: {
      '1': 'John Consumer',
      '2': 'Jane Farmer',
      '3': 'Sam Influencer'
    },
    participantImages: {
      '1': 'https://i.pravatar.cc/150?img=3',
      '2': 'https://i.pravatar.cc/150?img=4',
      '3': 'https://i.pravatar.cc/150?img=5'
    },
    isGroup: true,
    groupName: 'Organic Enthusiasts',
    groupImage: 'https://images.unsplash.com/photo-1592378493700-fdd4effed869?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    createdBy: '3',
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-14')
  }
];

export const mockMessages: { [key: string]: Message[] } = {
  'chat1': [
    {
      id: 'm1',
      chatId: 'chat1',
      senderId: '1',
      content: 'Hi Jane, I\'m interested in your organic tomatoes.',
      createdAt: new Date('2023-06-15T10:30:00'),
      isRead: true
    },
    {
      id: 'm2',
      chatId: 'chat1',
      senderId: '2',
      content: 'Hello John! Thanks for your interest. They\'re freshly harvested today.',
      createdAt: new Date('2023-06-15T10:32:00'),
      isRead: true
    },
    {
      id: 'm3',
      chatId: 'chat1',
      senderId: '1',
      content: 'Great! I\'ll place an order right away.',
      createdAt: new Date('2023-06-15T10:35:00'),
      isRead: true
    }
  ],
  'chat2': [
    {
      id: 'm4',
      chatId: 'chat2',
      senderId: '3',
      content: 'Welcome to our group! This is a place to discuss organic farming and products.',
      createdAt: new Date('2023-06-10T14:00:00'),
      isRead: true
    },
    {
      id: 'm5',
      chatId: 'chat2',
      senderId: '1',
      content: 'Thanks for creating this group! I\'m excited to learn more about organic farming.',
      createdAt: new Date('2023-06-10T14:05:00'),
      isRead: true
    },
    {
      id: 'm6',
      chatId: 'chat2',
      senderId: '2',
      content: 'I\'ll be sharing updates about new harvests and farming practices here.',
      createdAt: new Date('2023-06-10T14:10:00'),
      isRead: true
    }
  ]
};
