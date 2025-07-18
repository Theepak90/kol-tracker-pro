import type { VercelRequest, VercelResponse } from '@vercel/node';

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  connected: boolean;
  timestamp: string;
  services: {
    telegram: {
      status: 'available' | 'unavailable';
      message: string;
    };
    backend: {
      status: 'available' | 'unavailable';
      message: string;
    };
  };
  uptime?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const healthResponse: HealthResponse = {
    status: 'ok',
    connected: true,
    timestamp: new Date().toISOString(),
    services: {
      telegram: {
        status: 'available',
        message: 'Telegram authentication service is running in demo mode'
      },
      backend: {
        status: 'available',
        message: 'Backend API services are operational'
      }
    }
  };

  // Check if external Telethon service is available
  try {
    const telethonUrl = process.env.TELETHON_SERVICE_URL;
    if (telethonUrl) {
      const response = await fetch(`${telethonUrl}/health`, {
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const telethonHealth = await response.json();
        healthResponse.services.telegram = {
          status: 'available',
          message: 'External Telethon service is connected'
        };
        healthResponse.uptime = telethonHealth.uptime;
      } else {
        healthResponse.services.telegram = {
          status: 'unavailable',
          message: 'External Telethon service responded with error'
        };
        healthResponse.status = 'degraded';
      }
    }
  } catch (error) {
    // Service not available, but that's okay - we have fallbacks
    healthResponse.services.telegram = {
      status: 'available',
      message: 'Using built-in demo authentication'
    };
  }

  res.status(200).json(healthResponse);
} 