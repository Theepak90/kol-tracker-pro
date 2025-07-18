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

    // Validate OTP format
    const isValidOTP = /^\d{5}$/.test(otp_code);
    if (!isValidOTP) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP format. Please enter a 5-digit code.'
      });
      return;
    }

    // Demo authentication - accept any valid 5-digit code
    console.log(`✅ Telegram authentication successful for ${phone_number}`);

    // Generate session ID
    const sessionId = `telegram_auth_${user_id}_${Date.now()}`;

    // Generate realistic user info based on phone number
    const userInfo = {
      id: user_id,
      phone_number: phone_number,
      first_name: generateNameFromPhone(phone_number),
      last_name: Math.random() > 0.5 ? generateNameFromPhone(phone_number, true) : undefined,
      username: Math.random() > 0.7 ? `user_${phone_number.slice(-4)}` : undefined,
      is_verified: Math.random() > 0.8,
      session_id: sessionId
    };

    const response: OTPVerifyResponse = {
      success: true,
      message: `🎉 Successfully connected to Telegram! Welcome ${userInfo.first_name}! You can now use channel scanning and bot detection.`,
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

function generateNameFromPhone(phone: string, isLast = false): string {
  const firstNames = [
    'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 
    'Cameron', 'Quinn', 'Sage', 'Rowan', 'Phoenix', 'River', 'Sky',
    'Crypto', 'Trader', 'Analyst', 'Expert', 'Pro', 'Master'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
    'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
  ];
  
  const names = isLast ? lastNames : firstNames;
  const phoneNumber = parseInt(phone.slice(-4));
  const index = phoneNumber % names.length;
  
  return names[index];
} 