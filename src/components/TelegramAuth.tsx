import React, { useState } from 'react';
import { Phone, Shield, Check, AlertCircle, Loader2 } from 'lucide-react';
import { API_CONFIG } from '../config/api';

interface TelegramAuthProps {
  onAuthSuccess: (userInfo: any) => void;
  onClose: () => void;
}

interface TelegramAuthResponse {
  success: boolean;
  message: string;
  session_id?: string;
  requires_2fa?: boolean;
  user_info?: any;
}

const TelegramAuth: React.FC<TelegramAuthProps> = ({ onAuthSuccess, onClose }) => {
  const [step, setStep] = useState<'phone' | 'otp' | '2fa'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');

  // Generate a unique user ID for this session
  const userId = React.useMemo(() => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const requestOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_CONFIG.TELETHON_SERVICE.BASE_URL}/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          user_id: userId
        }),
      });

      const data: TelegramAuthResponse = await response.json();

      if (data.success) {
        if (data.user_info) {
          // Already authenticated
          onAuthSuccess(data.user_info);
        } else {
          // OTP sent
          setSessionId(data.session_id || '');
          setStep('otp');
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode.trim()) {
      setError('Please enter the OTP code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_CONFIG.TELETHON_SERVICE.BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          phone_number: phoneNumber,
          otp_code: otpCode,
          password: password || undefined
        }),
      });

      const data: TelegramAuthResponse = await response.json();

      if (data.success) {
        onAuthSuccess(data.user_info);
      } else {
        if (data.requires_2fa) {
          setStep('2fa');
        } else {
          setError(data.message);
        }
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'phone') {
      requestOTP();
    } else if (step === 'otp' || step === '2fa') {
      verifyOTP();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-2xl p-8 w-full max-w-md mx-4 border border-slate-700">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Connect Telegram
          </h2>
          <p className="text-slate-400">
            {step === 'phone' && 'Enter your phone number to get started'}
            {step === 'otp' && 'Enter the verification code sent to your phone'}
            {step === '2fa' && 'Enter your 2FA password'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 'phone' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-1">
                Include country code (e.g., +1 for US)
              </p>
            </div>
          )}

          {step === 'otp' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="12345"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                maxLength={6}
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter the 5-digit code sent to {phoneNumber}
              </p>
            </div>
          )}

          {step === '2fa' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                2FA Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your 2FA password"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-1">
                Your Telegram account has 2FA enabled
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {step === 'phone' ? 'Sending...' : 'Verifying...'}
                </>
              ) : (
                <>
                  {step === 'phone' && <Phone className="w-4 h-4" />}
                  {step === 'otp' && <Check className="w-4 h-4" />}
                  {step === '2fa' && <Shield className="w-4 h-4" />}
                  {step === 'phone' ? 'Send Code' : 'Verify'}
                </>
              )}
            </button>
          </div>
        </form>

        {step === 'otp' && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <button
              onClick={() => {
                setStep('phone');
                setOtpCode('');
                setError('');
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Use different phone number
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelegramAuth; 