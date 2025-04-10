import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../../../components/common/ProductCard';
import { Product, ProductCategory } from '../../../types/product';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('ProductCard Component', () => {
  const mockProduct: Product = {
    id: '1',
    farmerId: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    images: ['test-image.jpg'],
    category: 'vegetables' as ProductCategory,
    quantity: 10,
    unit: 'kg',
    rating: 4.5,
    reviewCount: 10,
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

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('₹100')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(10 reviews)')).toBeInTheDocument();
  });

  it('renders product image correctly', () => {
    render(<ProductCard product={mockProduct} />);
    const image = screen.getByAltText('Test Product');
    expect(image).toHaveAttribute('src', 'test-image.jpg');
  });

  it('calls onAddToCart when add to cart button is clicked', () => {
    const onAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);
    
    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);
    
    expect(onAddToCart).toHaveBeenCalledTimes(1);
  });
});
