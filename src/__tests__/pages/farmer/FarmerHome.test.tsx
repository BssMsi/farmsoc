
import React from 'react';
import { render, screen, waitFor } from '../../utils/test-utils';
import FarmerHome from '../../../pages/farmer/FarmerHome';
import { useAuth } from '../../../contexts/AuthContext';
import { mockGetProducts, mockGetPosts } from '../../mocks/apiServiceMock';

// Mock the Auth hook
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the API service
jest.mock('../../../services/apiService', () => ({
  getProducts: mockGetProducts,
  getPosts: mockGetPosts,
  getFarmerProducts: jest.fn().mockResolvedValue([]),
  getUserPosts: jest.fn().mockResolvedValue([]),
}));

describe('FarmerHome Component', () => {
  beforeEach(() => {
    // Setup auth mock with farmer user
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: 'farmer1',
        name: 'Farmer Test',
        email: 'farmer@example.com',
        role: 'farmer',
        profileImage: 'farmer-profile.jpg',
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders farmer home page correctly', async () => {
    render(<FarmerHome />);
    
    // Check that the welcome message is rendered
    expect(screen.getByText(/Welcome, Farmer Test/i)).toBeInTheDocument();
    
    // Check that dashboard sections are rendered
    expect(screen.getByText(/Your Products/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Recent Posts/i)).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(mockGetProducts).toHaveBeenCalled();
      expect(mockGetPosts).toHaveBeenCalled();
    });
  });

  test('displays loading state initially', () => {
    render(<FarmerHome />);
    
    // There should be at least one loading indicator
    expect(screen.getAllByText(/Loading/i).length).toBeGreaterThan(0);
  });

  test('renders empty state when no products or posts', async () => {
    // Override the mock to return empty arrays
    mockGetProducts.mockResolvedValueOnce([]);
    mockGetPosts.mockResolvedValueOnce([]);
    
    render(<FarmerHome />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryAllByText(/Loading/i).length).toBe(0);
    });
    
    // Check for empty state messages
    expect(screen.getByText(/You don't have any products yet/i)).toBeInTheDocument();
    expect(screen.getByText(/You haven't created any posts yet/i)).toBeInTheDocument();
  });

  test('renders weather widget', () => {
    render(<FarmerHome />);
    
    expect(screen.getByText(/Weather Forecast/i)).toBeInTheDocument();
  });

  test('renders AI assistant widget', () => {
    render(<FarmerHome />);
    
    expect(screen.getByText(/Farming Assistant/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask me anything about farming/i)).toBeInTheDocument();
  });
});
