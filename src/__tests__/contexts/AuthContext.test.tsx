
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { mockUsers } from '../../services/mockData';

// Create a test component that uses the useAuth hook
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, login, logout, updateUserProfile } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-state">
        {isLoading ? 'Loading' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {user && <div data-testid="user-name">{user.name}</div>}
      <button onClick={() => login('consumer@example.com', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      {user && (
        <button 
          onClick={() => updateUserProfile({ ...user, name: 'Updated Name' })}
        >
          Update Profile
        </button>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock localStorage
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'removeItem');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('provides initial authentication state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
  });

  test('handles login successfully', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
    });
    
    // Should have user data
    expect(screen.getByTestId('user-name')).toBeInTheDocument();
    
    // Should store user in localStorage
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  test('handles logout successfully', async () => {
    // Set initial authenticated state
    localStorage.setItem('user', JSON.stringify(mockUsers[0]));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for the component to recognize the authenticated state
    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
    });
    
    // Logout
    fireEvent.click(screen.getByText('Logout'));
    
    // Should update state
    expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
    
    // Should remove user from localStorage
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });

  test('loads user from localStorage on initial render', async () => {
    // Set user in localStorage
    localStorage.setItem('user', JSON.stringify(mockUsers[0]));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Should load user and set authenticated state
    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent(mockUsers[0].name);
    });
  });

  test('handles profile updates', async () => {
    // Set initial authenticated state
    localStorage.setItem('user', JSON.stringify(mockUsers[0]));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for the component to recognize the authenticated state
    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
    });
    
    // Update profile
    fireEvent.click(screen.getByText('Update Profile'));
    
    // Should update user name
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Updated Name');
    });
    
    // Should update localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('user', expect.stringContaining('Updated Name'));
  });
});
