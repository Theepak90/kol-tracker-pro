import React, { useState, useContext } from 'react';
import { TelegramAuthContext } from '../contexts/TelegramAuthContext';

interface TelegramAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TelegramAuthModal: React.FC<TelegramAuthModalProps> = ({ isOpen, onClose }) => {
  const { requestOTP, verifyOTP, isLoading, error } = useContext(TelegramAuthContext);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [sessionData, setSessionData] = useState<any>(null);
  const [demoOTP, setDemoOTP] = useState<string>('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  if (!isOpen) return null;

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    try {
      const result = await requestOTP(phoneNumber);
      if (result.success) {
        setSessionData(result);
        setStep('otp');
        
        // Check if this is demo mode and display the code
        if (result.is_demo && result.demo_code) {
          setDemoOTP(result.demo_code);
          setIsDemoMode(true);
        } else {
          setDemoOTP('');
          setIsDemoMode(false);
        }
      }
    } catch (err) {
      console.error('Phone submission error:', err);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || !sessionData) return;

    try {
      const result = await verifyOTP({
        user_id: sessionData.user_id || `user_${Date.now()}`,
        phone_number: phoneNumber,
        otp_code: otpCode,
        session_id: sessionData.session_id,
        phone_code_hash: sessionData.phone_code_hash
      });

      if (result.success) {
        // Close modal on success
        onClose();
        // Reset form
        setStep('phone');
        setPhoneNumber('');
        setOtpCode('');
        setSessionData(null);
        setDemoOTP('');
        setIsDemoMode(false);
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
    setDemoOTP('');
    setIsDemoMode(false);
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
            ? 'Enter your phone number to get started'
            : isDemoMode 
              ? 'Demo mode active - enter the code shown below'
              : 'Enter the verification code sent to your phone'
          }
        </p>

        {error && (
          <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-4">
            {error}
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
                placeholder="+919363348338"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., +1 for US)
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
            {isDemoMode && demoOTP && (
              <div className="bg-yellow-900 border border-yellow-600 text-yellow-200 px-4 py-3 rounded mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                  <div>
                    <p className="font-medium">Demo Mode</p>
                    <p className="text-sm">Use code: <span className="font-mono font-bold text-lg">{demoOTP}</span></p>
                    <p className="text-xs mt-1">Python Telethon service is not running</p>
                  </div>
                </div>
              </div>
            )}

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
                {isDemoMode 
                  ? 'Enter the demo code shown above'
                  : `Check your phone for the verification code sent to ${phoneNumber}`
                }
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtpCode('');
                  setDemoOTP('');
                  setIsDemoMode(false);
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
      </div>
    </div>
  );
};

export default TelegramAuthModal; 