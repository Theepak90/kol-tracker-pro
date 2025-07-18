import type { VercelRequest, VercelResponse } from '@vercel/node';

interface OTPVerifyRequest {
  user_id: string;
  phone_number: string;
  otp_code: string;
  password?: string;
  session_id?: string;
  phone_code_hash?: string;
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
    session_string?: string;
  };
}

// Telethon service URL - should match the request endpoint
const TELETHON_SERVICE_URL = process.env.TELETHON_SERVICE_URL || 'https://kol-tracker-telethon.onrender.com';

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
    const { user_id, phone_number, otp_code, password, session_id, phone_code_hash }: OTPVerifyRequest = req.body;
    
    if (!user_id || !phone_number || !otp_code) {
      res.status(400).json({
        success: false,
        message: 'User ID, phone number, and OTP code are required'
      });
      return;
    }

    // Validate OTP format (Telegram codes are usually 5 digits)
    const isValidOTP = /^\d{4,6}$/.test(otp_code);
    if (!isValidOTP) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP format. Please enter the code from your phone.'
      });
      return;
    }

    console.log(`🔐 Verifying real Telegram OTP for ${phone_number} via Telethon service`);

    try {
      // Call the Python Telethon service to verify real OTP
      const telethonResponse = await fetch(`${TELETHON_SERVICE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id,
          phone_number: phone_number,
          otp_code: otp_code,
          password: password,
          session_id: session_id,
          phone_code_hash: phone_code_hash
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (telethonResponse.ok) {
        const telethonData = await telethonResponse.json();
        console.log(`✅ OTP verification successful for ${phone_number}`);
        
        // Forward the response from Telethon service
        res.status(200).json(telethonData);
        return;
      } else {
        const errorData = await telethonResponse.text();
        console.error('Telethon verification error:', errorData);
        
        // Try to parse error response
        try {
          const errorJson = JSON.parse(errorData);
          res.status(telethonResponse.status).json(errorJson);
        } catch {
          res.status(telethonResponse.status).json({
            success: false,
            message: `Verification failed: ${errorData}`
          });
        }
        return;
      }
    } catch (telethonError) {
      console.error('Telethon service connection error:', telethonError);
      
      res.status(503).json({
        success: false,
        message: 'Telegram service is currently unavailable. Please try again in a few moments.'
      });
      return;
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify code. Please try again.'
    });
  }
} 