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
  login: (userInfo: TelegramUser, sessionId: string) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  requestOTP: (phoneNumber: string) => Promise<any>;
  verifyOTP: (request: OTPVerifyRequest) => Promise<any>;
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

  // Generate a unique user ID for this session
  const userId = React.useMemo(() => {
    const stored = localStorage.getItem('telegram_user_id');
    if (stored) return stored;
    
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('telegram_user_id', newId);
    return newId;
  }, []);

  const requestOTP = async (phoneNumber: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/telegram/request-otp', {
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
      const response = await fetch('/api/telegram/verify-otp', {
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

      // If verification successful, log the user in
      if (data.user_info) {
        login(data.user_info, data.user_info.session_id);
      }

      return data;
    } catch (err) {
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

  const login = (userInfo: TelegramUser, sessionId: string) => {
    setUser(userInfo);
    setSessionId(sessionId);
    localStorage.setItem('telegram_user_info', JSON.stringify(userInfo));
    localStorage.setItem('telegram_session_id', sessionId);
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
    }
  };

  useEffect(() => {
    // Check for stored auth info
    const storedUser = localStorage.getItem('telegram_user_info');
    const storedSessionId = localStorage.getItem('telegram_session_id');
    
    if (storedUser && storedSessionId) {
      try {
        const userInfo = JSON.parse(storedUser);
        setUser(userInfo);
        setSessionId(storedSessionId);
      } catch (error) {
        console.error('Failed to parse stored user info:', error);
        localStorage.removeItem('telegram_user_info');
        localStorage.removeItem('telegram_session_id');
      }
    }
    
    // Check auth status with server
    checkAuthStatus();
  }, [userId]);

  const value: TelegramAuthContextType = {
    user,
    isAuthenticated: !!user,
    sessionId,
    login,
    logout,
    checkAuthStatus,
    requestOTP,
    verifyOTP,
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