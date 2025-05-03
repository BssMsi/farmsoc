import { 
  mockUsers, 
  mockProducts, 
  mockPosts, 
  mockEvents, 
  mockFundraisers, 
  mockCropRequests, 
  mockOrders,
  mockChats,
  mockMessages
} from './mockData';
import { 
  User, 
  UserRole 
} from '../types/user';
import { 
  Product,
  CartItem 
} from '../types/product';
import { 
  Post,
  Comment 
} from '../types/post';
import { 
  Event, 
  Fundraiser, 
  CropRequest 
} from '../types/event';
import { 
  Order 
} from '../types/order';
import { 
  Chat, 
  Message 
} from '../types/message';

// User related API calls
export const getUser = async (userId: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        resolve(user);
      } else {
        reject(new Error('User not found'));
      }
    }, 300);
  });
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        const updatedUser = { ...mockUsers[userIndex], ...userData };
        mockUsers[userIndex] = updatedUser;
        resolve(updatedUser);
      } else {
        reject(new Error('User not found'));
      }
    }, 300);
  });
};

// Product related API calls
export const getProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProducts);
    }, 300);
  });
};

export const getProduct = async (productId: string): Promise<Product> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = mockProducts.find(p => p.id === productId);
      if (product) {
        resolve(product);
      } else {
        reject(new Error('Product not found'));
      }
    }, 300);
  });
};

export const getFarmerProducts = async (farmerId: string): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = mockProducts.filter(p => p.farmerId === farmerId);
      resolve(products);
    }, 300);
  });
};

export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProduct: Product = {
        ...productData,
        id: `p${mockProducts.length + 1}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockProducts.push(newProduct);
      resolve(newProduct);
    }, 300);
  });
};

// Post related API calls
export const getPosts = async (): Promise<Post[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPosts);
    }, 300);
  });
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const posts = mockPosts.filter(p => p.userId === userId);
      resolve(posts);
    }, 300);
  });
};

export const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments'>): Promise<Post> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPost: Post = {
        ...postData,
        id: `post${mockPosts.length + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        comments: []
      };
      mockPosts.push(newPost);
      resolve(newPost);
    }, 300);
  });
};

export const likePost = async (postId: string, userId: string): Promise<Post> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const postIndex = mockPosts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        mockPosts[postIndex] = {
          ...mockPosts[postIndex],
          likes: mockPosts[postIndex].likes + 1,
          isLikedByCurrentUser: true
        };
        resolve(mockPosts[postIndex]);
      } else {
        reject(new Error('Post not found'));
      }
    }, 300);
  });
};

export const addComment = async (postId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'likes'>): Promise<Post> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const postIndex = mockPosts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        const newComment: Comment = {
          ...comment,
          id: `c${new Date().getTime()}`,
          createdAt: new Date(),
          likes: 0
        };
        mockPosts[postIndex].comments.push(newComment);
        resolve(mockPosts[postIndex]);
      } else {
        reject(new Error('Post not found'));
      }
    }, 300);
  });
};

// Event related API calls
export const getEvents = async (): Promise<Event[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEvents);
    }, 300);
  });
};

export const joinEvent = async (eventId: string, userId: string): Promise<Event> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const eventIndex = mockEvents.findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        const event = mockEvents[eventIndex];
        if (!event.participants.includes(userId)) {
          event.participants.push(userId);
          event.currentParticipants += 1;
        }
        resolve(event);
      } else {
        reject(new Error('Event not found'));
      }
    }, 300);
  });
};

export const createEvent = async (eventData: Omit<Event, 'id' | 'participants' | 'currentParticipants' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newEvent: Event = {
        ...eventData,
        id: `e${mockEvents.length + 1}`,
        participants: [],
        currentParticipants: 0,
        status: 'upcoming',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockEvents.push(newEvent);
      resolve(newEvent);
    }, 300);
  });
};

// Fundraiser related API calls
export const getFundraisers = async (): Promise<Fundraiser[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockFundraisers);
    }, 300);
  });
};

export const contributeToFundraiser = async (fundraiserId: string, contribution: { userId: string, name: string, amount: number, isAnonymous: boolean }): Promise<Fundraiser> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const fundraiserIndex = mockFundraisers.findIndex(f => f.id === fundraiserId);
      if (fundraiserIndex !== -1) {
        const fundraiser = mockFundraisers[fundraiserIndex];
        fundraiser.contributors.push({
          ...contribution,
          date: new Date()
        });
        fundraiser.raised += contribution.amount;
        resolve(fundraiser);
      } else {
        reject(new Error('Fundraiser not found'));
      }
    }, 300);
  });
};

// Crop Request related API calls
export const getCropRequests = async (): Promise<CropRequest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCropRequests);
    }, 300);
  });
};

export const createCropRequest = async (requestData: Omit<CropRequest, 'id' | 'votes' | 'voterIds' | 'status' | 'createdAt' | 'updatedAt'>): Promise<CropRequest> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRequest: CropRequest = {
        ...requestData,
        id: `cr${mockCropRequests.length + 1}`,
        votes: 1,
        voterIds: [requestData.requesterId],
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockCropRequests.push(newRequest);
      resolve(newRequest);
    }, 300);
  });
};

export const voteCropRequest = async (requestId: string, userId: string): Promise<CropRequest> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const requestIndex = mockCropRequests.findIndex(r => r.id === requestId);
      if (requestIndex !== -1) {
        const request = mockCropRequests[requestIndex];
        if (!request.voterIds.includes(userId)) {
          request.voterIds.push(userId);
          request.votes += 1;
        }
        resolve(request);
      } else {
        reject(new Error('Crop request not found'));
      }
    }, 300);
  });
};

// Order related API calls
export const getOrders = async (userId: string): Promise<Order[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orders = mockOrders.filter(o => o.customerId === userId);
      resolve(orders);
    }, 300);
  });
};

export const getFarmerOrders = async (farmerId: string): Promise<Order[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orders = mockOrders.filter(o => 
        o.items.some(item => item.farmerId === farmerId)
      );
      resolve(orders);
    }, 300);
  });
};

export const createOrder = async (orderData: { customerId: string, items: CartItem[], shippingAddress: any, billingAddress: any, paymentMethod: string }): Promise<Order> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Calculate order details
      const orderItems = orderData.items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        farmerId: item.product.farmerId,
        farmerName: 'Jane Farmer', // This would be dynamically fetched in a real app
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.product.price * item.quantity,
        status: 'pending' as const
      }));

      const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

      const newOrder: Order = {
        id: `o${mockOrders.length + 1}`,
        customerId: orderData.customerId,
        items: orderItems,
        totalAmount,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: orderData.paymentMethod as any,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockOrders.push(newOrder);
      resolve(newOrder);
    }, 300);
  });
};

// Chat related API calls
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const chats = mockChats.filter(c => c.participants.includes(userId));
      
      // Add last message to each chat
      const chatsWithLastMessage = chats.map(chat => {
        const chatMessages = mockMessages[chat.id] || [];
        const lastMessage = chatMessages.length > 0 
          ? chatMessages[chatMessages.length - 1] 
          : undefined;
        
        return {
          ...chat,
          lastMessage
        };
      });
      
      resolve(chatsWithLastMessage);
    }, 300);
  });
};

export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const messages = mockMessages[chatId] || [];
      resolve(messages);
    }, 300);
  });
};

export const sendMessage = async (chatId: string, message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!mockMessages[chatId]) {
        mockMessages[chatId] = [];
      }
      
      const newMessage: Message = {
        ...message,
        id: `m${new Date().getTime()}`,
        createdAt: new Date()
      };
      
      mockMessages[chatId].push(newMessage);
      
      // Update chat's updatedAt time
      const chatIndex = mockChats.findIndex(c => c.id === chatId);
      if (chatIndex !== -1) {
        mockChats[chatIndex].updatedAt = new Date();
      }
      
      resolve(newMessage);
    }, 300);
  });
};

export const createChat = async (participants: string[], isGroup: boolean, groupName?: string): Promise<Chat> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Get participant details
      const participantNames: {[key: string]: string} = {};
      const participantImages: {[key: string]: string} = {};
      
      participants.forEach(userId => {
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
          participantNames[userId] = user.name;
          participantImages[userId] = user.profileImage || '';
        }
      });
      
      const newChat: Chat = {
        id: `chat${mockChats.length + 1}`,
        participants,
        participantNames,
        participantImages,
        isGroup,
        ...(isGroup && groupName ? { groupName } : {}),
        createdBy: participants[0],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockChats.push(newChat);
      resolve(newChat);
    }, 300);
  });
};

// Cart functionality
let cart: CartItem[] = [];

export const getCart = async (): Promise<CartItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(cart);
    }, 100);
  });
};

export const addToCart = async (productId: string, quantity: number): Promise<CartItem[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const product = await getProduct(productId);
        
        const existingItemIndex = cart.findIndex(item => item.productId === productId);
        
        if (existingItemIndex !== -1) {
          // Update existing item
          cart[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          cart.push({
            productId,
            product,
            quantity
          });
        }
        
        resolve(cart);
      } catch (error) {
        reject(error);
      }
    }, 200);
  });
};

export const updateCartItem = async (productId: string, quantity: number): Promise<CartItem[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const itemIndex = cart.findIndex(item => item.productId === productId);
      
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          cart = cart.filter(item => item.productId !== productId);
        } else {
          // Update quantity
          cart[itemIndex].quantity = quantity;
        }
        resolve(cart);
      } else {
        reject(new Error('Item not in cart'));
      }
    }, 200);
  });
};

export const removeFromCart = async (productId: string): Promise<CartItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      cart = cart.filter(item => item.productId !== productId);
      resolve(cart);
    }, 200);
  });
};

export const clearCart = async (): Promise<CartItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      cart = [];
      resolve(cart);
    }, 200);
  });
};

// Search functionality
export const searchProducts = async (query: string): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowercaseQuery = query.toLowerCase();
      const results = mockProducts.filter(
        product => 
          product.name.toLowerCase().includes(lowercaseQuery) || 
          product.description.toLowerCase().includes(lowercaseQuery)
      );
      resolve(results);
    }, 300);
  });
};

export const searchFarmers = async (query: string): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowercaseQuery = query.toLowerCase();
      const results = mockUsers.filter(
        user => 
          user.role === 'farmer' &&
          (user.name.toLowerCase().includes(lowercaseQuery) || 
          (user.bio && user.bio.toLowerCase().includes(lowercaseQuery)) ||
          (user.location && user.location.toLowerCase().includes(lowercaseQuery)))
      );
      resolve(results);
    }, 300);
  });
};

// AI chatbot for farmers
export const aiChatbotResponse = async (message: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple mock responses for different scenarios
      if (message.toLowerCase().includes('add product')) {
        resolve("I can help you add a product. What's the name of the product you want to add?");
      } else if (message.toLowerCase().includes('create post')) {
        resolve("Let's create a post. What would you like to share about your farm or products?");
      } else if (message.toLowerCase().includes('fundraiser')) {
        resolve("I can help you set up a fundraiser. What are you raising funds for?");
      } else if (message.toLowerCase().includes('order')) {
        resolve("Do you want to check your pending orders or completed orders?");
      } else {
        resolve("I'm your farming assistant. I can help you add products, create posts, organize events, or check orders. What would you like to do?");
      }
    }, 500);
  });
};

// Recommendations for consumers
export const getPersonalizedRecommendations = async (userId: string): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would use user preferences, purchase history, etc.
      // For now, just return random products
      const shuffled = [...mockProducts].sort(() => 0.5 - Math.random());
      resolve(shuffled.slice(0, 3));
    }, 300);
  });
};

// Health check functionality
export interface HealthCheckResponse {
  productId: string;
  flag: 'pass' | 'fail';
  comments: string;
}

export const performHealthCheck = async (
  diseases: string[],
  cartItems: CartItem[]
): Promise<HealthCheckResponse[]> => {
  try {
    // Convert cart items to a simpler format for the API
    const products = cartItems.map(item => ({
      id: item.productId,
      name: item.product.name,
      category: item.product.category,
      description: item.product.description
    }));
    
    // Call the backend API
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://140.245.233.27:8080'}/health-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ diseases, products })
    });
    
    if (!response.ok) {
      throw new Error('Health check API failed');
    }
    
    const results = await response.json();
    return results;
  } catch (error) {
    console.error('Health check API error:', error);
    
    // Fallback to mock implementation if API call fails
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = cartItems.map(item => {
          const product = item.product;
          const isSafe = Math.random() > 0.3; // Random pass/fail for demo
          
          const result: HealthCheckResponse = {
            productId: product.id,
            flag: isSafe ? 'pass' : 'fail',
            comments: isSafe 
              ? `${product.name} is safe for consumption with your health conditions.` 
              : `${product.name} may not be suitable for people with ${diseases[0] || 'your condition'}. Please consult with your doctor.`
          };
          
          return result;
        });
        
        resolve(results);
      }, 500);
    });
  }
};
