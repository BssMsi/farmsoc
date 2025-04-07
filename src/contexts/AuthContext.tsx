
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, User } from '../types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('farmsoc_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Mock login for now - will replace with Supabase implementation
      const mockUsers = [
        { id: '1', email: 'consumer@example.com', name: 'John Consumer', role: 'consumer' as UserRole, profileImage: 'https://i.pravatar.cc/150?img=3' },
        { id: '2', email: 'farmer@example.com', name: 'Jane Farmer', role: 'farmer' as UserRole, profileImage: 'https://i.pravatar.cc/150?img=4' },
        { id: '3', email: 'influencer@example.com', name: 'Sam Influencer', role: 'influencer' as UserRole, profileImage: 'https://i.pravatar.cc/150?img=5' }
      ];
      
      const loggedInUser = mockUsers.find(u => u.email === email);
      
      if (loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem('farmsoc_user', JSON.stringify(loggedInUser));
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: UserRole, name: string) => {
    try {
      setIsLoading(true);
      // Mock signup for now - will replace with Supabase implementation
      const newUser = {
        id: Math.random().toString(36).substring(7),
        email,
        name,
        role,
        profileImage: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
      };
      
      setUser(newUser);
      localStorage.setItem('farmsoc_user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('farmsoc_user');
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('farmsoc_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signUp,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
