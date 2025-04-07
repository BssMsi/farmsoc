
import { mockProducts, mockPosts, mockEvents, mockCropRequests, mockUsers } from '../../services/mockData';
import { Product } from '../../types/product';
import { Post } from '../../types/post';
import { Event, CropRequest } from '../../types/event';
import { User } from '../../types/user';

// Mock API service functions
export const mockGetProducts = jest.fn().mockResolvedValue(mockProducts);
export const mockGetProduct = jest.fn().mockImplementation((id: string) => {
  const product = mockProducts.find(p => p.id === id);
  if (product) {
    return Promise.resolve(product);
  }
  return Promise.reject(new Error('Product not found'));
});

export const mockCreateProduct = jest.fn().mockImplementation((productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newProduct: Product = {
    ...productData,
    id: `p${mockProducts.length + 1}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  return Promise.resolve(newProduct);
});

export const mockGetPosts = jest.fn().mockResolvedValue(mockPosts);
export const mockCreatePost = jest.fn().mockImplementation((postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments'>) => {
  const newPost: Post = {
    ...postData,
    id: `post${mockPosts.length + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: 0,
    comments: []
  };
  return Promise.resolve(newPost);
});

export const mockGetEvents = jest.fn().mockResolvedValue(mockEvents);
export const mockCreateEvent = jest.fn().mockImplementation((eventData: any) => {
  const newEvent: Event = {
    ...eventData,
    id: `e${mockEvents.length + 1}`,
    participants: [],
    currentParticipants: 0,
    status: 'upcoming',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  return Promise.resolve(newEvent);
});

export const mockGetCropRequests = jest.fn().mockResolvedValue(mockCropRequests);
export const mockCreateCropRequest = jest.fn().mockImplementation((requestData: any) => {
  const newRequest: CropRequest = {
    ...requestData,
    id: `cr${mockCropRequests.length + 1}`,
    votes: 1,
    voterIds: [requestData.requesterId],
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  return Promise.resolve(newRequest);
});

export const mockGetUser = jest.fn().mockImplementation((userId: string) => {
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    return Promise.resolve(user);
  }
  return Promise.reject(new Error('User not found'));
});

export const mockUpdateUser = jest.fn().mockImplementation((userId: string, userData: Partial<User>) => {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    const updatedUser = { ...mockUsers[userIndex], ...userData };
    return Promise.resolve(updatedUser);
  }
  return Promise.reject(new Error('User not found'));
});

// Add missing mock functions
export const mockSearchProducts = jest.fn().mockImplementation((query: string) => {
  const filteredProducts = mockProducts.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.description.toLowerCase().includes(query.toLowerCase()) ||
    p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );
  return Promise.resolve(filteredProducts);
});

export const mockSearchFarmers = jest.fn().mockImplementation((query: string) => {
  const filteredFarmers = mockUsers.filter(u => 
    u.role === 'farmer' && 
    (u.name.toLowerCase().includes(query.toLowerCase()) || 
    (u.bio && u.bio.toLowerCase().includes(query.toLowerCase())))
  );
  return Promise.resolve(filteredFarmers);
});

export const mockGetOrders = jest.fn().mockResolvedValue([
  {
    id: 'order1',
    userId: 'consumer1',
    products: [{ productId: 'p1', quantity: 2, price: 100 }],
    status: 'delivered',
    total: 200,
    deliveryAddress: '123 Test St',
    paymentMethod: 'card',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Mock the API service module
jest.mock('../../services/apiService', () => ({
  getProducts: mockGetProducts,
  getProduct: mockGetProduct,
  createProduct: mockCreateProduct,
  getPosts: mockGetPosts,
  createPost: mockCreatePost,
  getEvents: mockGetEvents,
  createEvent: mockCreateEvent,
  getCropRequests: mockGetCropRequests,
  createCropRequest: mockCreateCropRequest,
  getUser: mockGetUser,
  updateUser: mockUpdateUser,
  searchProducts: mockSearchProducts,
  searchFarmers: mockSearchFarmers,
  getOrders: mockGetOrders,
}));
