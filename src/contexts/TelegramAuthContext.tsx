import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_CONFIG } from '../config/api';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
}

interface OTPRequest {
  phone_number: string;
}

interface OTPVerifyRequest {
  user_id: string;
  phone_number: string;
  otp_code: string;
  password?: string;
  session_id?: string;
  phone_code_hash?: string;
}

interface TelegramAuthContextType {
  user: TelegramUser | null;
  isAuthenticated: boolean;
  sessionId: string | null;
  login: (userInfo: TelegramUser, sessionId: string, actualUserId?: string) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  requestOTP: (phoneNumber: string) => Promise<any>;
  verifyOTP: (request: OTPVerifyRequest) => Promise<any>;
  clearStaleAuth: () => void;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export { TelegramAuthContext };

export const useTelegramAuth = () => {
  const context = useContext(TelegramAuthContext);
  if (!context) {
    throw new Error('useTelegramAuth must be used within a TelegramAuthProvider');
  }
  return context;
};

interface TelegramAuthProviderProps {
  children: ReactNode;
}

export const TelegramAuthProvider: React.FC<TelegramAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate a unique user ID for this session and ensure it's consistent
  const [userId, setUserId] = React.useState<string>(() => {
    // Always clear any existing mismatched data first
    const existingId = localStorage.getItem('telegram_user_id');
    const existingInfo = localStorage.getItem('telegram_user_info');
    const existingSession = localStorage.getItem('telegram_session_id');
    
    // If we have partial data, clear everything to start fresh
    if ((existingId && !existingInfo) || (existingInfo && !existingId)) {
      console.log('🧹 Clearing mismatched auth data...');
      localStorage.removeItem('telegram_user_id');
      localStorage.removeItem('telegram_user_info');
      localStorage.removeItem('telegram_session_id');
    }
    
    const stored = localStorage.getItem('telegram_user_id');
    if (stored) {
      console.log('🔄 Using existing user ID:', stored);
      return stored;
    }
    
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('telegram_user_id', newId);
    console.log('🆔 Generated fresh user ID:', newId);
    return newId;
  });

  // Separate effect for initializing auth state (runs only once)
  useEffect(() => {
    const initializeAuth = () => {
      // Check for stored auth info and validate consistency
      const storedUser = localStorage.getItem('telegram_user_info');
      const storedSessionId = localStorage.getItem('telegram_session_id');
      const storedUserId = localStorage.getItem('telegram_user_id');
      
      // Validate data consistency - if inconsistent, clear all but don't regenerate userId
      if ((storedUser && !storedUserId) || (storedSessionId && !storedUserId)) {
        console.warn('🔄 Inconsistent auth data detected - clearing auth data');
        localStorage.removeItem('telegram_user_info');
        localStorage.removeItem('telegram_session_id');
        
        setUser(null);
        setSessionId(null);
        setLoading(false);
        return;
      }
      
      // If we have complete stored data, restore it
      if (storedUser && storedSessionId && storedUserId) {
        try {
          const userInfo = JSON.parse(storedUser);
          setUser(userInfo);
          setSessionId(storedSessionId);
        } catch (error) {
          console.error('Failed to parse stored user info:', error);
          localStorage.removeItem('telegram_user_info');
          localStorage.removeItem('telegram_session_id');
          setUser(null);
          setSessionId(null);
        }
      }
      
      setLoading(false);
      
      // Check auth status with server (async)
      checkAuthStatus();
    };

    initializeAuth();
  }, []); // Empty dependency array - runs only once on mount

  const requestOTP = async (phoneNumber: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.TELETHON_SERVICE.BASE_URL}${API_CONFIG.TELETHON_SERVICE.ENDPOINTS.REQUEST_OTP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          user_id: userId
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (request: OTPVerifyRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.TELETHON_SERVICE.BASE_URL}${API_CONFIG.TELETHON_SERVICE.ENDPOINTS.VERIFY_OTP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      // If verification successful, FORCE synchronize user ID and log in
      if (data.user_info) {
        console.log('🔥 FORCING USER ID SYNC - Current:', userId, 'Auth used:', request.user_id);
        
        // CRITICAL: The backend stores the client with request.user_id
        // We MUST use the same user_id that was sent for verification
        const authenticatedUserId = request.user_id;
        
        console.log('🔧 Backend authenticated user ID:', authenticatedUserId);
        console.log('🔧 Session ID returned:', data.user_info.session_id);
        
        // ALWAYS update to the authenticated user ID to ensure scanning works
        if (authenticatedUserId !== userId) {
          console.log('🔧 Updating frontend user ID to match backend authentication:', authenticatedUserId);
          setUserId(authenticatedUserId);
          localStorage.setItem('telegram_user_id', authenticatedUserId);
        }
        
        login(data.user_info, data.user_info.session_id, authenticatedUserId);
      }

      return data;
    } catch (err) {
      console.error('TelegramAuthContext.verifyOTP() - error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify OTP';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_CONFIG.TELETHON_SERVICE.BASE_URL}/user-session/${userId}`);
      const data = await response.json();
      
      if (data.success && data.user_info) {
        setUser(data.user_info);
        setSessionId(data.session_id);
      } else {
        setUser(null);
        setSessionId(null);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setUser(null);
      setSessionId(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userInfo: TelegramUser, sessionId: string, actualUserId?: string) => {
    const useUserId = actualUserId || userId;
    console.log('✅ Telegram authentication successful for:', userInfo.first_name || userInfo.username);
    console.log('✅ Using user ID:', useUserId);
    
    setUser(userInfo);
    setSessionId(sessionId);
    localStorage.setItem('telegram_user_info', JSON.stringify(userInfo));
    localStorage.setItem('telegram_session_id', sessionId);
    
    // CRITICAL: Always store the actual authenticated user ID
    localStorage.setItem('telegram_user_id', useUserId);
    
    // Update internal state to match
    if (actualUserId && actualUserId !== userId) {
      setUserId(actualUserId);
    }
    
    // Double-check synchronization
    console.log('🔗 Auth complete - localStorage sync:');
    console.log('  user_id:', localStorage.getItem('telegram_user_id'));
    console.log('  session_id:', localStorage.getItem('telegram_session_id'));
  };

  const logout = async () => {
    try {
      await fetch(`${API_CONFIG.TELETHON_SERVICE.BASE_URL}/user-session/${userId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      setUser(null);
      setSessionId(null);
      localStorage.removeItem('telegram_user_info');
      localStorage.removeItem('telegram_session_id');
      localStorage.removeItem('telegram_user_id'); // Clear user ID too for fresh start
    }
  };

  // Helper function to clear stale authentication data
  const clearStaleAuth = () => {
    console.log('🔄 Clearing stale authentication data...');
    setUser(null);
    setSessionId(null);
    localStorage.removeItem('telegram_user_info');
    localStorage.removeItem('telegram_session_id');
    // Keep the existing userId - don't regenerate to avoid loops
    console.log('🆔 Keeping existing user ID:', userId);
  };

  const value: TelegramAuthContextType = {
    user,
    isAuthenticated: !!user,
    sessionId,
    login,
    logout,
    checkAuthStatus,
    requestOTP,
    verifyOTP,
    clearStaleAuth,
    loading,
    isLoading,
    error,
  };

  return (
    <TelegramAuthContext.Provider value={value}>
      {children}
    </TelegramAuthContext.Provider>
  );
}; 