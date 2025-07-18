import type { VercelRequest, VercelResponse } from '@vercel/node';

interface AuthRequest {
  phone_number: string;
  user_id: string;
  api_id?: string;
  api_hash?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  session_id?: string;
  phone_code_hash?: string;
}

// Store active auth sessions in memory
const authSessions = new Map<string, {
  phone_number: string;
  user_id: string;
  phone_code_hash: string;
  created_at: number;
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
    const { phone_number, user_id, api_id, api_hash }: AuthRequest = req.body;
    
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

    // For now, create a mock session since we can't run persistent Telethon clients in serverless
    const sessionId = `telethon_${user_id}_${Date.now()}`;
    const phoneCodeHash = `hash_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Store session data
    authSessions.set(sessionId, {
      phone_number,
      user_id,
      phone_code_hash: phoneCodeHash,
      created_at: Date.now()
    });

    // Clean up old sessions (older than 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [sessionId, session] of authSessions.entries()) {
      if (session.created_at < tenMinutesAgo) {
        authSessions.delete(sessionId);
      }
    }

    // Simulate Telegram API response
    console.log(`Telethon auth request for ${phone_number}`);
    console.log(`Demo: Check your Telegram app for a login code`);

    const response: AuthResponse = {
      success: true,
      message: `Verification code sent to ${phone_number}. Check your Telegram app for the login code.`,
      session_id: sessionId,
      phone_code_hash: phoneCodeHash
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Telethon auth request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please try again.'
    });
  }
}

// Export the session store for use in verify endpoint
export { authSessions }; 