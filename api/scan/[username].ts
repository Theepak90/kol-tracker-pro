import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ChannelScanResult {
  channel: string;
  totalMembers: number;
  activeMembers: number;
  posts: {
    id: string;
    text: string;
    date: string;
    views: number;
    forwards: number;
  }[];
  analysis: {
    avgEngagement: number;
    topHashtags: string[];
    posting_frequency: string;
    risk_level: string;
  };
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

  try {
    const { username } = req.query;
    
    if (!username || typeof username !== 'string') {
      res.status(400).json({ error: 'Username parameter is required' });
      return;
    }

    const cleanUsername = username.replace('@', '').replace('https://t.me/', '');
    
    // Simulate channel scanning
    const result: ChannelScanResult = {
      channel: cleanUsername,
      totalMembers: Math.floor(Math.random() * 100000) + 1000,
      activeMembers: Math.floor(Math.random() * 10000) + 100,
      posts: Array.from({ length: 10 }, (_, i) => ({
        id: `post_${Date.now()}_${i}`,
        text: `📈 Market Analysis #${i + 1}: ${generateRandomCryptoPost()}`,
        date: new Date(Date.now() - i * 3600000).toISOString(),
        views: Math.floor(Math.random() * 10000) + 100,
        forwards: Math.floor(Math.random() * 1000) + 10
      })),
      analysis: {
        avgEngagement: Math.random() * 0.1 + 0.02,
        topHashtags: ['#crypto', '#defi', '#trading', '#bitcoin', '#ethereum', '#altcoins'].slice(0, Math.floor(Math.random() * 4) + 2),
        posting_frequency: ['Daily', 'Multiple times daily', 'Weekly', 'Irregular'][Math.floor(Math.random() * 4)],
        risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
      }
    };

    // Simulate processing time for realistic feel
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    res.status(200).json(result);
  } catch (error) {
    console.error('Channel scan error:', error);
    res.status(500).json({ error: 'Channel scanning failed' });
  }
}

function generateRandomCryptoPost(): string {
  const templates = [
    'Strong bullish momentum on $TOKEN - expecting 20-30% upside in the next 24h',
    'Breaking: Major whale accumulation detected on $TOKEN - could see significant movement',
    'Technical analysis shows $TOKEN breaking key resistance - perfect entry opportunity',
    'DeFi gem discovered: $TOKEN showing incredible fundamentals and low market cap',
    'Alert: $TOKEN showing unusual volume spikes - monitor closely for breakout',
    'Market update: $TOKEN forming bullish pattern - target levels updated',
    'Exclusive alpha: $TOKEN partnership announcement expected soon - accumulate now',
    'Analysis: $TOKEN tokenomics are extremely bullish - long-term hold recommendation'
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
} 