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

// Get Telethon service URL from environment or use default
const TELETHON_SERVICE_URL = process.env.TELETHON_SERVICE_URL || 
                              process.env.VITE_TELETHON_SERVICE_URL || 
                              'http://localhost:8000';

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

    console.log(`🔐 Requesting real Telegram OTP for ${phone_number} via Telethon service at ${TELETHON_SERVICE_URL}`);

    try {
      // Call the Python Telethon service to send real OTP
      const telethonResponse = await fetch(`${TELETHON_SERVICE_URL}/auth/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phone_number,
          user_id: user_id
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (telethonResponse.ok) {
        const telethonData = await telethonResponse.json();
        console.log('✅ OTP request successful via Telethon service');
        
        res.status(200).json({
          success: true,
          message: `📱 Telegram verification code sent to ${phone_number}! Check your phone for the code.`,
          session_id: telethonData.session_id || `session_${user_id}_${Date.now()}`,
          phone_code_hash: telethonData.phone_code_hash
        });
        return;
      } else {
        const errorData = await telethonResponse.text();
        console.error('Telethon service error:', errorData);
        
        // Check if it's a service not available error
        if (telethonResponse.status === 404 || telethonResponse.status >= 500) {
          console.log('⚠️ Telethon service not available, using demo mode for testing');
          
          // Provide demo mode response for testing
          const demoOTP = String(Math.floor(Math.random() * 90000) + 10000);
          res.status(200).json({
            success: true,
            message: `📱 DEMO MODE: Verification code sent to ${phone_number}! Use code: ${demoOTP} (Real Telethon service is not running)`,
            session_id: `demo_session_${user_id}_${Date.now()}`,
            phone_code_hash: `demo_hash_${Date.now()}`,
            demo_code: demoOTP,
            is_demo: true
          });
          return;
        }
        
        res.status(telethonResponse.status).json({
          success: false,
          message: `Failed to send OTP: ${errorData}`
        });
        return;
      }
    } catch (telethonError) {
      console.error('Telethon service connection error:', telethonError);
      
      // Provide fallback demo mode when service is unavailable
      if (telethonError instanceof Error && (telethonError.name === 'AbortError' || telethonError.message.includes('fetch'))) {
        console.log('⚠️ Telethon service unreachable, providing demo mode for testing');
        
        const demoOTP = String(Math.floor(Math.random() * 90000) + 10000);
        res.status(200).json({
          success: true,
          message: `📱 DEMO MODE: Verification code sent to ${phone_number}! Use code: ${demoOTP} (Telethon service unreachable - deploy Python service for real authentication)`,
          session_id: `demo_session_${user_id}_${Date.now()}`,
          phone_code_hash: `demo_hash_${Date.now()}`,
          demo_code: demoOTP,
          is_demo: true
        });
        return;
      }
      
      res.status(503).json({
        success: false,
        message: 'Telegram service is currently unavailable. Please deploy the Python Telethon service and try again.'
      });
      return;
    }
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please try again.'
    });
  }
} 