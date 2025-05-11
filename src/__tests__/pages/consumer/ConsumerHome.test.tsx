
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import ConsumerHome from '../../../pages/consumer/ConsumerHome';
import { useAuth } from '../../../contexts/AuthContext';
import { mockGetPosts, mockGetProducts, mockGetProduct } from '../../mocks/apiServiceMock';

// Mock the useAuth hook
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the API services
jest.mock('../../../services/apiService', () => ({
  getPosts: mockGetPosts,
  getProducts: mockGetProducts,
  getProduct: mockGetProduct,
  getPersonalizedRecommendations: jest.fn().mockResolvedValue([]),
}));

describe('ConsumerHome Component', () => {
  beforeEach(() => {
    // Setup auth mock with consumer user
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: 'consumer1',
        name: 'Consumer Test',
        email: 'consumer@example.com',
        role: 'consumer',
        familyMembers: [
          { id: 'f1', name: 'Family Member 1', relationship: 'spouse' },
        ],
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders consumer home page correctly', async () => {
    render(<ConsumerHome />);
    
    // Check greeting is displayed
    expect(screen.getByText(/Hello, Consumer/i)).toBeInTheDocument();
    
    // Check tabs are displayed
    expect(screen.getByText('Feed')).toBeInTheDocument();
    expect(screen.getByText('For You')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(mockGetPosts).toHaveBeenCalled();
      expect(mockGetProducts).toHaveBeenCalled();
    });
  });

  test('displays loading state initially', () => {
    render(<ConsumerHome />);
    
    // Should show loading indicator for posts
    expect(screen.getByText(/Loading posts/i)).toBeInTheDocument();
  });

  test('switches between feed and recommendations tabs', async () => {
    render(<ConsumerHome />);
    
    // Should start with Feed tab active
    expect(screen.getByText('Feed').className).toContain('text-kisanly-primary');
    
    // Click on For You tab
    fireEvent.click(screen.getByText('For You'));
    
    // For You tab should now be active
    expect(screen.getByText('For You').className).toContain('text-kisanly-primary');
    
    // Should show recommendations section
    expect(screen.getByText('Recommended for you')).toBeInTheDocument();
    expect(screen.getByText('Based on your family preferences')).toBeInTheDocument();
    
    // Click back to Feed tab
    fireEvent.click(screen.getByText('Feed'));
    
    // Feed tab should now be active
    expect(screen.getByText('Feed').className).toContain('text-kisanly-primary');
  });

  test('displays empty state when no posts', async () => {
    // Override the mocks to return empty arrays
    mockGetPosts.mockResolvedValueOnce([]);
    
    render(<ConsumerHome />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading posts/i)).not.toBeInTheDocument();
    });
    
    // Should show empty state message
    expect(screen.getByText(/No posts to show/i)).toBeInTheDocument();
  });

  test('displays family members in recommendations tab', async () => {
    render(<ConsumerHome />);
    
    // Click on For You tab
    fireEvent.click(screen.getByText('For You'));
    
    // Should show family member
    expect(screen.getByText('For Family Member 1')).toBeInTheDocument();
  });
});
