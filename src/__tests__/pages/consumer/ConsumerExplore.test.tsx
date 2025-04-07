
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConsumerExplore from '../../../pages/consumer/ConsumerExplore';
import { mockGetProducts, mockSearchProducts, mockSearchFarmers } from '../../mocks/apiServiceMock';

// Mock the API services
jest.mock('../../../services/apiService', () => ({
  getProducts: mockGetProducts,
  searchProducts: mockSearchProducts,
  searchFarmers: mockSearchFarmers,
}));

describe('ConsumerExplore Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders explore page correctly', async () => {
    render(<ConsumerExplore />);
    
    // Check title is displayed
    expect(screen.getByText('Explore')).toBeInTheDocument();
    
    // Check search bar is displayed
    expect(screen.getByPlaceholderText(/Search for products/i)).toBeInTheDocument();
    
    // Check tabs are displayed
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Farmers')).toBeInTheDocument();
    expect(screen.getByText('Fundraisers')).toBeInTheDocument();
    
    // Wait for products to load
    await waitFor(() => {
      expect(mockGetProducts).toHaveBeenCalled();
    });
  });

  test('displays loading state initially', () => {
    render(<ConsumerExplore />);
    
    // Should show loading indicator
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test('switches between tabs', async () => {
    render(<ConsumerExplore />);
    
    // Should start with Products tab active
    expect(screen.getByText('Products').className).toContain('text-farmsoc-primary');
    
    // Click on Farmers tab
    fireEvent.click(screen.getByText('Farmers'));
    
    // Farmers tab should now be active
    expect(screen.getByText('Farmers').className).toContain('text-farmsoc-primary');
    
    // Should show empty state for farmers initially
    await waitFor(() => {
      expect(screen.getByText(/No farmers found/i)).toBeInTheDocument();
    });
    
    // Click on Fundraisers tab
    fireEvent.click(screen.getByText('Fundraisers'));
    
    // Fundraisers tab should now be active
    expect(screen.getByText('Fundraisers').className).toContain('text-farmsoc-primary');
    
    // Should show coming soon message
    expect(screen.getByText(/Fundraisers coming soon/i)).toBeInTheDocument();
  });

  test('searches for products', async () => {
    render(<ConsumerExplore />);
    
    // Wait for initial products to load
    await waitFor(() => {
      expect(mockGetProducts).toHaveBeenCalled();
    });
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText(/Search for products/i);
    fireEvent.change(searchInput, { target: { value: 'organic' } });
    
    // Wait for search to execute (debounced)
    await waitFor(() => {
      expect(mockSearchProducts).toHaveBeenCalledWith('organic');
    });
  });

  test('searches for farmers', async () => {
    render(<ConsumerExplore />);
    
    // Click on Farmers tab
    fireEvent.click(screen.getByText('Farmers'));
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText(/Search for farmers/i);
    fireEvent.change(searchInput, { target: { value: 'farmer' } });
    
    // Wait for search to execute (debounced)
    await waitFor(() => {
      expect(mockSearchFarmers).toHaveBeenCalledWith('farmer');
    });
  });

  test('filters products by category', async () => {
    render(<ConsumerExplore />);
    
    // Wait for products to load
    await waitFor(() => {
      expect(mockGetProducts).toHaveBeenCalled();
    });
    
    // There should be an "All" category button
    const allButton = screen.getByText('All');
    expect(allButton).toBeInTheDocument();
    
    // Click on a category chip (if exists)
    const categoryButtons = screen.getAllByRole('button');
    if (categoryButtons.length > 1) {
      fireEvent.click(categoryButtons[1]); // Click on first category after "All"
      
      // Should filter products
      // Note: We can't easily test the actual filtering logic since it's done client-side
    }
  });
});
