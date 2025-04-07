
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../../../components/common/ProductCard';
import { Product } from '../../../types/product';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('ProductCard Component', () => {
  const mockProduct: Product = {
    id: 'p1',
    name: 'Test Product',
    description: 'This is a test product description',
    price: 100,
    farmerId: 'farmer1',
    images: ['https://example.com/image.jpg'],
    category: 'vegetables',
    quantity: 10,
    unit: 'kg',
    tags: ['organic', 'fresh'],
    farmingMethod: 'organic',
    nutritionalInfo: {
      calories: 50,
      proteins: 2,
      carbohydrates: 10,
      fats: 0.5,
    },
    isFeatured: true,
    rating: 4.5,
    reviewCount: 10,
    availabilityDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  test('renders product card correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₹100')).toBeInTheDocument();
  });

  test('displays badge when product is organic', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Organic')).toBeInTheDocument();
  });

  test('displays placeholder image when no image is provided', () => {
    const productWithoutImage = {
      ...mockProduct,
      images: [],
    };
    
    render(<ProductCard product={productWithoutImage} />);
    
    const image = screen.getByAltText('Test Product');
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder'));
  });

  test('calls navigate when clicked', () => {
    const navigateMock = jest.fn();
    
    // Override the useNavigate mock
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigateMock);
    
    render(<ProductCard product={mockProduct} />);
    
    fireEvent.click(screen.getByText('Test Product'));
    
    expect(navigateMock).toHaveBeenCalledWith(`/app/product/${mockProduct.id}`);
  });
});
