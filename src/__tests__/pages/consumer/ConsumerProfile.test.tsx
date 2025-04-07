
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConsumerProfile from '../../../pages/consumer/ConsumerProfile';
import { useAuth } from '../../../contexts/AuthContext';
import { mockGetOrders } from '../../mocks/apiServiceMock';

// Mock the useAuth hook
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock the API services
jest.mock('../../../services/apiService', () => ({
  getOrders: mockGetOrders,
}));

describe('ConsumerProfile Component', () => {
  const mockUser = {
    id: 'consumer1',
    name: 'Consumer Test',
    email: 'consumer@example.com',
    role: 'consumer',
    bio: 'Test bio',
    location: 'Test location',
    phoneNumber: '1234567890',
    profileImage: 'profile.jpg',
    familyMembers: [
      { id: 'f1', name: 'Family Member 1', relationship: 'spouse', age: 30 },
    ],
  };

  const mockUpdateUserProfile = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    // Setup auth mock with consumer user
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      updateUserProfile: mockUpdateUserProfile,
      logout: mockLogout,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders profile page correctly', () => {
    render(<ConsumerProfile />);
    
    // Check user info is displayed
    expect(screen.getByText('Consumer Test')).toBeInTheDocument();
    expect(screen.getByText('Consumer')).toBeInTheDocument();
    expect(screen.getByText('Test location')).toBeInTheDocument();
    
    // Check tabs are displayed
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Family')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
  });

  test('switches between profile tabs', () => {
    render(<ConsumerProfile />);
    
    // Should start with Profile tab active
    expect(screen.getByText('Profile Information')).toBeInTheDocument();
    
    // Click on Family tab
    fireEvent.click(screen.getByText('Family'));
    
    // Family tab should now be active
    expect(screen.getByText('Family Members')).toBeInTheDocument();
    expect(screen.getByText('Family Member 1')).toBeInTheDocument();
    
    // Click on Orders tab
    fireEvent.click(screen.getByText('Orders'));
    
    // Orders tab should now be active
    expect(screen.getByText('Your Orders')).toBeInTheDocument();
    expect(screen.getByText(/Loading orders/i)).toBeInTheDocument();
    
    // Click on Payment tab
    fireEvent.click(screen.getByText('Payment'));
    
    // Payment tab should now be active
    expect(screen.getByText('Payment Methods')).toBeInTheDocument();
    expect(screen.getByText(/No payment methods saved yet/i)).toBeInTheDocument();
  });

  test('allows editing profile', async () => {
    render(<ConsumerProfile />);
    
    // Click edit button
    fireEvent.click(screen.getByText('Edit'));
    
    // Should show edit form
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    
    // Update name
    const nameInput = screen.getByLabelText('Full Name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    expect(nameInput.value).toBe('Updated Name');
    
    // Save changes
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Should call updateUserProfile
    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledWith({
        ...mockUser,
        name: 'Updated Name',
      });
    });
  });

  test('allows adding family members', async () => {
    render(<ConsumerProfile />);
    
    // Go to Family tab
    fireEvent.click(screen.getByText('Family'));
    
    // Fill form
    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Family Member' } });
    
    const relationshipSelect = screen.getByLabelText('Relationship') as HTMLSelectElement;
    fireEvent.change(relationshipSelect, { target: { value: 'child' } });
    
    const ageInput = screen.getByLabelText('Age (optional)') as HTMLInputElement;
    fireEvent.change(ageInput, { target: { value: '10' } });
    
    // Add member
    fireEvent.click(screen.getByText('Add Member'));
    
    // Should call updateUserProfile
    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledWith({
        ...mockUser,
        familyMembers: [
          ...mockUser.familyMembers,
          expect.objectContaining({
            name: 'New Family Member',
            relationship: 'child',
            age: 10,
          }),
        ],
      });
    });
  });

  test('allows removing family members', async () => {
    render(<ConsumerProfile />);
    
    // Go to Family tab
    fireEvent.click(screen.getByText('Family'));
    
    // Click remove button
    fireEvent.click(screen.getByText('Remove'));
    
    // Should call updateUserProfile
    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledWith({
        ...mockUser,
        familyMembers: [],
      });
    });
  });

  test('handles logout', async () => {
    render(<ConsumerProfile />);
    
    // Click logout button
    fireEvent.click(screen.getByText('Log Out'));
    
    // Should call logout
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
