import type { VercelRequest, VercelResponse } from '@vercel/node';

interface OTPRequest {
  phone_number: string;
  user_id: string;
}

interface OTPResponse {
  success: boolean;
  message: string;
  session_id?: string;
  user_info?: any;
}

// Store active sessions in memory (in production, use Redis or database)
const activeSessions = new Map<string, {
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

    // Generate OTP code (5 digits)
    const otpCode = Math.floor(10000 + Math.random() * 90000).toString();
    const sessionId = `session_${user_id}_${Date.now()}`;

    // Store session data
    activeSessions.set(sessionId, {
      phone_number,
      user_id,
      otp_code: otpCode,
      created_at: Date.now(),
      attempts: 0
    });

    // Simulate sending OTP (in real implementation, this would send via Telegram API)
    console.log(`OTP for ${phone_number}: ${otpCode}`);

    // Clean up old sessions (older than 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.created_at < tenMinutesAgo) {
        activeSessions.delete(sessionId);
      }
    }

    const response: OTPResponse = {
      success: true,
      message: `Verification code sent to ${phone_number}. Please enter the 5-digit code.`,
      session_id: sessionId
    };

    // For demo purposes, include the OTP in development
    if (process.env.NODE_ENV !== 'production') {
      response.message += ` Demo OTP: ${otpCode}`;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please try again.'
    });
  }
} 