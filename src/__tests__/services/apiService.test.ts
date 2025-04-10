import {
  getProducts,
  getProduct,
  createProduct,
  getPosts,
  createPost,
  getEvents,
  createEvent,
  getCropRequests,
  createCropRequest,
  getUser,
  updateUser,
  addToCart,
  getCart,
  searchProducts,
  searchFarmers
} from '../../services/apiService';
import { mockProducts, mockPosts, mockEvents, mockCropRequests, mockUsers } from '../../services/mockData';

// Mock the setTimeout to make tests run faster
jest.useFakeTimers();

describe('API Service', () => {
  beforeEach(() => {
    // Clear any mock implementations before each test
    jest.clearAllMocks();
  });

  describe('Product API', () => {
    test('getProducts should return all products', async () => {
      const products = await getProducts();
      expect(products).toEqual(mockProducts);
    });

    test('getProduct should return a specific product', async () => {
      const product = await getProduct(mockProducts[0].id);
      expect(product).toEqual(mockProducts[0]);
    });

    test('getProduct should reject if product not found', async () => {
      await expect(getProduct('non-existent-id')).rejects.toThrow('Product not found');
    });

    test('createProduct should create a new product', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        farmerId: 'farmer1',
        images: ['image1.jpg'],
        category: 'vegetables' as const,
        quantity: 10,
        unit: 'kg' as const,
        tags: ['organic', 'fresh']
      };

      const newProduct = await createProduct(productData);
      expect(newProduct).toHaveProperty('id');
      expect(newProduct.name).toBe('Test Product');
    });

    describe('searchProducts', () => {
      it('should return products matching the search query', async () => {
        const results = await searchProducts('organic');
        expect(results.length).toBeGreaterThan(0);
        const matchesName = results.some(product => 
          product.name.toLowerCase().includes('organic')
        );
        const matchesDescription = results.some(product => 
          product.description.toLowerCase().includes('organic')
        );
        expect(matchesName || matchesDescription).toBeTruthy();
      });
    });
  });

  describe('Post API', () => {
    test('getPosts should return all posts', async () => {
      const posts = await getPosts();
      expect(posts).toEqual(mockPosts);
    });

    test('createPost should create a new post', async () => {
      const postData = {
        userId: 'user1',
        username: 'Test User',
        userRole: 'farmer' as const,
        userProfileImage: 'profile.jpg',
        type: 'post' as const, // Fix: use valid PostType
        content: 'Test post content',
        images: [],
        video: '',
        linkedProducts: [],
        location: 'Test Location',
        tags: ['farm', 'organic']
      };

      const newPost = await createPost(postData);
      expect(newPost).toHaveProperty('id');
      expect(newPost.content).toBe('Test post content');
    });
  });

  describe('Event API', () => {
    test('getEvents should return all events', async () => {
      const events = await getEvents();
      expect(events).toEqual(mockEvents);
    });

    test('createEvent should create a new event', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000), // One day later
        location: 'Test Location',
        organizerId: 'user1',
        organizerName: 'Test Organizer',
        maxParticipants: 50,
        image: 'event.jpg',
        isOnline: false,
        tags: ['workshop', 'farming'],
        type: 'workshop' as const, // Fix the type to be a literal
        creatorId: 'user1'
      };

      const newEvent = await createEvent(eventData);
      expect(newEvent).toHaveProperty('id');
      expect(newEvent.title).toBe('Test Event');
    });
  });

  describe('Crop Request API', () => {
    test('getCropRequests should return all crop requests', async () => {
      const requests = await getCropRequests();
      expect(requests).toEqual(mockCropRequests);
    });

    test('createCropRequest should create a new crop request', async () => {
      const requestData = {
        cropName: 'Tomatoes', // Add required field
        description: 'Test Description',
        requesterName: 'Test Requester',
        requesterId: 'user1',
        cropType: 'tomatoes',
        quantity: 100,
        unit: 'kg' as const,
        deadline: new Date(Date.now() + 604800000), // One week later
        preferredFarmingMethod: 'organic',
        budget: 5000,
        location: 'Test Location'
      };

      const newRequest = await createCropRequest(requestData);
      expect(newRequest).toHaveProperty('id');
      expect(newRequest.cropName).toBe('Tomatoes'); // Fix: use cropName instead of title
    });
  });

  describe('User API', () => {
    test('getUser should return a user', async () => {
      const user = await getUser(mockUsers[0].id);
      expect(user).toEqual(mockUsers[0]);
    });

    test('updateUser should update a user', async () => {
      const userData = {
        name: 'Updated Name',
        bio: 'Updated Bio'
      };

      const updatedUser = await updateUser(mockUsers[0].id, userData);
      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.bio).toBe('Updated Bio');
    });

    test('searchFarmers should return filtered farmers', async () => {
      const results = await searchFarmers('farm');
      expect(results.length).toBeGreaterThan(0);
      // Check that all returned users are farmers
      results.forEach(user => {
        expect(user.role).toBe('farmer');
      });
    });
  });

  describe('Cart API', () => {
    test('addToCart and getCart should work correctly', async () => {
      // First add to cart
      await addToCart(mockProducts[0].id, 2);
      
      // Then check if product is in cart
      const cart = await getCart();
      expect(cart.length).toBeGreaterThan(0);
      
      const addedItem = cart.find(item => item.productId === mockProducts[0].id);
      expect(addedItem).toBeDefined();
      expect(addedItem?.quantity).toBe(2);
    });
  });
});
