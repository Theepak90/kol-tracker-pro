import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export interface User {
  _id: string;
  username: string;
  email: string;
  walletAddress?: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise' | 'custom';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  console.log('AuthProvider - user:', user, 'isLoading:', isLoading);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('Checking auth...');
    try {
      const token = authService.getToken();
      console.log('Token found:', !!token);
      
      if (token) {
        try {
          const user = await authService.getProfile();
          console.log('Profile fetched:', user);
          setUser(user);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          authService.removeToken(); // Clear invalid token
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authService.removeToken(); // Clear invalid token
    } finally {
      setIsLoading(false);
      console.log('Auth check completed');
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login for:', email);
      const { token, user } = await authService.login(email, password);
      console.log('Login successful:', user);
      setUser(user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting registration for:', email);
      const { token, user } = await authService.register(username, email, password);
      console.log('Registration successful:', user);
      setUser(user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out...');
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 