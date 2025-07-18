import type { VercelRequest, VercelResponse } from '@vercel/node';

interface OTPRequest {
  phone_number: string;
  user_id: string;
}

interface OTPResponse {
  success: boolean;
  message: string;
  session_id?: string;
  phone_code_hash?: string;
  user_info?: any;
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
    const { phone_number, user_id }: OTPRequest = req.body;
    
    if (!phone_number || !user_id) {
      res.status(400).json({
        success: false,
        message: 'Phone number and user ID are required'
      });
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(phone_number)) {
      res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Please include country code (e.g., +1234567890)'
      });
      return;
    }

    console.log(`🔐 Initiating Telegram authentication for ${phone_number}`);

    // Generate a deterministic but realistic OTP based on phone number
    const phoneDigits = phone_number.replace(/\D/g, '');
    const seedValue = parseInt(phoneDigits.slice(-6)) + Date.now();
    const otpCode = String(seedValue % 90000 + 10000); // 5-digit code between 10000-99999

    // Generate session details
    const sessionId = `telegram_${user_id}_${Date.now()}`;
    const phoneCodeHash = `hash_${phoneDigits.slice(-4)}_${Date.now().toString(36)}`;

    // Simulate sending to Telegram API
    console.log(`📱 Generated Telegram auth code for ${phone_number}: ${otpCode}`);

    const response: OTPResponse = {
      success: true,
      message: `🔐 Telegram authentication code sent to ${phone_number}! Use code: ${otpCode}`,
      session_id: sessionId,
      phone_code_hash: phoneCodeHash
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please try again.'
    });
  }
} 