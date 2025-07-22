import React, { useState } from 'react';
import { useTelegramAuth } from '../contexts/TelegramAuthContext';

interface TelegramAuthModalProps {
  onAuthSuccess: (userInfo: any) => void;
  onClose: () => void;
}

const TelegramAuthModal: React.FC<TelegramAuthModalProps> = ({ onAuthSuccess, onClose }) => {
  const { requestOTP, verifyOTP, isLoading, error, clearStaleAuth } = useTelegramAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [sessionData, setSessionData] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Clear any stale auth data when component mounts
  React.useEffect(() => {
    clearStaleAuth();
    // Generate a fresh user ID for this authentication session
    const freshUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentUserId(freshUserId);
    localStorage.setItem('telegram_user_id', freshUserId);
    console.log('🆔 TelegramAuth - Fresh user ID for authentication:', freshUserId);
  }, []);

  // Component is now rendered conditionally by parent

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || !currentUserId) return;

    console.log('📱 TelegramAuth - Requesting OTP with user ID:', currentUserId);
    
    try {
      const result = await requestOTP(phoneNumber);
      if (result.success) {
        console.log('✅ TelegramAuth - OTP request successful:', result);
        setSessionData(result);
        setStep('otp');
      }
    } catch (err) {
      console.error('Phone submission error:', err);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || !sessionData || !currentUserId) return;

    console.log('🔐 TelegramAuth - Verifying OTP with user ID:', currentUserId);

    try {
      const result = await verifyOTP({
        user_id: currentUserId, // Use the consistent user ID
        phone_number: phoneNumber,
        otp_code: otpCode,
        session_id: sessionData.session_id,
        phone_code_hash: sessionData.phone_code_hash
      });

      if (result.success) {
        console.log('✅ TelegramAuth - OTP verification successful:', result);
        console.log('🔗 TelegramAuth - Authenticated user ID:', currentUserId);
        
        // Ensure the user info includes the correct user ID
        const authResult = {
          ...result,
          user_info: {
            ...result.user_info,
            authenticated_user_id: currentUserId
          }
        };
        
        // Call success callback with user info
        onAuthSuccess(authResult);
        
        // Show success message briefly before closing
        setMessage(`✅ Authentication successful as ${result.user_info?.first_name}! You can now scan channels.`);
        
        // Close modal after a brief delay
        setTimeout(() => {
          onClose();
          // Reset form
          setStep('phone');
          setPhoneNumber('');
          setOtpCode('');
          setSessionData(null);
          setMessage('');
        }, 2000);
      }
    } catch (err) {
      console.error('OTP verification error:', err);
    }
  };

  const handleCancel = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtpCode('');
    setSessionData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-600 rounded-full p-3">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Connect Telegram
        </h2>
        
        <p className="text-gray-400 text-center mb-6">
          {step === 'phone' 
            ? 'Enter your phone number to authenticate with Telegram'
            : 'Enter the verification code sent to your phone'
          }
        </p>

        {error && (
          <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <div>
                <p className="font-medium">Service Error</p>
                <p className="text-sm">{error}</p>
                {error.includes('Python Telethon service') && (
                  <p className="text-xs mt-1">
                    Run: <code className="bg-red-800 px-1 py-0.5 rounded">python backend/telethon_service/main.py</code>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <p className="text-sm">{message}</p>
            </div>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit}>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., +91 for India, +1 for US)
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !phoneNumber.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-md transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                    Send Code
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOTPSubmit}>
            <div className="mb-4">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                id="otp"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 5-digit code"
                maxLength={6}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Check your phone for the verification code sent to {phoneNumber}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtpCode('');
                }}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !otpCode.trim() || otpCode.length < 4}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white rounded-md transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Verify
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Real Telegram authentication requires the Python Telethon service to be running.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TelegramAuthModal;
export { TelegramAuthModal as TelegramAuth }; 