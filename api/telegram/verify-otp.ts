import type { VercelRequest, VercelResponse } from '@vercel/node';

interface OTPVerifyRequest {
  user_id: string;
  phone_number: string;
  otp_code: string;
  password?: string;
}

interface OTPVerifyResponse {
  success: boolean;
  message: string;
  requires_2fa?: boolean;
  user_info?: {
    id: string;
    phone_number: string;
    first_name: string;
    last_name?: string;
    username?: string;
    is_verified: boolean;
    session_id: string;
  };
}

// Simple session store - in production use Redis or database
const sessionStore = new Map<string, {
  phone_number: string;
  user_id: string;
  otp_code: string;
  created_at: number;
  attempts: number;
}>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const { user_id, phone_number, otp_code, password }: OTPVerifyRequest = req.body;
    
    if (!user_id || !phone_number || !otp_code) {
      res.status(400).json({
        success: false,
        message: 'User ID, phone number, and OTP code are required'
      });
      return;
    }

    // For demo purposes, we'll accept any 5-digit OTP
    // In real implementation, this would verify against Telegram's API
    const isValidOTP = /^\d{5}$/.test(otp_code);
    
    if (!isValidOTP) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP format. Please enter a 5-digit code.'
      });
      return;
    }

    // Simulate OTP verification
    const isCorrectOTP = true; // In demo mode, always accept valid format

    if (!isCorrectOTP) {
      res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please try again.'
      });
      return;
    }

    // Generate session ID
    const sessionId = `auth_${user_id}_${Date.now()}`;

    // Generate user info based on phone number
    const userInfo = {
      id: user_id,
      phone_number: phone_number,
      first_name: generateRandomName(),
      last_name: Math.random() > 0.5 ? generateRandomName() : undefined,
      username: Math.random() > 0.7 ? `user_${phone_number.slice(-4)}` : undefined,
      is_verified: Math.random() > 0.8,
      session_id: sessionId
    };

    const response: OTPVerifyResponse = {
      success: true,
      message: 'Successfully authenticated with Telegram',
      user_info: userInfo
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify code. Please try again.'
    });
  }
}

function generateRandomName(): string {
  const names = [
    'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 
    'Cameron', 'Quinn', 'Sage', 'Rowan', 'Phoenix', 'River', 'Sky'
  ];
  return names[Math.floor(Math.random() * names.length)];
} 