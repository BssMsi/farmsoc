
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PostCard from '../../../components/common/PostCard';
import { Post } from '../../../types/post';

describe('PostCard Component', () => {
  const mockPost: Post = {
    id: 'post1',
    userId: 'user1',
    username: 'Test User',
    userRole: 'farmer',
    userProfileImage: 'https://example.com/profile.jpg',
    type: 'post', // Changed to a valid PostType
    content: 'This is a test post',
    images: ['https://example.com/image.jpg'],
    video: '',
    linkedProducts: [],
    location: 'Test Location',
    tags: ['organic', 'farming'],
    likes: 10,
    comments: [
      {
        id: 'c1',
        userId: 'user2',
        username: 'Commenter',
        profileImage: 'https://example.com/commenter.jpg',
        content: 'Great post!',
        createdAt: new Date(),
        likes: 5
      }
    ],
    isLikedByCurrentUser: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockProduct = {
    id: 'p1',
    name: 'Test Product',
    description: 'Test description',
    price: 100,
    farmerId: 'farmer1',
    images: ['https://example.com/product.jpg'],
    category: 'vegetables',
    quantity: 10,
    unit: 'kg',
    tags: ['organic'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  test('renders post card correctly', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('This is a test post')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Likes count
  });

  test('renders with linked product', () => {
    render(<PostCard post={mockPost} linkedProduct={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(`₹${mockProduct.price}`)).toBeInTheDocument();
  });

  test('renders image when post has images', () => {
    render(<PostCard post={mockPost} />);
    
    const image = screen.getByAltText('Post content');
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  test('displays farmer badge when user is a farmer', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('farmer')).toBeInTheDocument();
  });

  test('formats time ago correctly', () => {
    // Set a fixed date for testing
    const fixedDate = new Date();
    fixedDate.setMinutes(fixedDate.getMinutes() - 5); // 5 minutes ago
    
    const postWithFixedDate = {
      ...mockPost,
      createdAt: fixedDate,
    };
    
    render(<PostCard post={postWithFixedDate} />);
    
    // The formatTimeAgo function should return something like "5m"
    expect(screen.getByText(/\d+m/)).toBeInTheDocument();
  });

  test('shows comments section when comment button clicked', () => {
    render(<PostCard post={mockPost} />);
    
    // Click on the comments button
    fireEvent.click(screen.getByText('1')); // Number of comments
    
    // Comment section should be visible
    expect(screen.getByText('Commenter')).toBeInTheDocument();
    expect(screen.getByText('Great post!')).toBeInTheDocument();
  });
});
