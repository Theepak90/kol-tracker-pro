import type { VercelRequest, VercelResponse } from '@vercel/node';

interface BotDetectionResult {
  username: string;
  isBot: boolean;
  confidence: number;
  analysis: {
    account_age: number;
    message_frequency: number;
    content_pattern_score: number;
    follower_ratio: number;
    profile_completeness: number;
  };
  recommendations: string[];
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

    const cleanUsername = username.replace('@', '');
    
    // Simulate bot detection analysis
    const isBot = Math.random() > 0.7; // 30% chance of being a bot
    const confidence = Math.random() * 0.3 + (isBot ? 0.7 : 0.2);

    const result: BotDetectionResult = {
      username: cleanUsername,
      isBot,
      confidence,
      analysis: {
        account_age: Math.floor(Math.random() * 1000) + 30,
        message_frequency: Math.random() * 10,
        content_pattern_score: Math.random(),
        follower_ratio: Math.random(),
        profile_completeness: Math.random()
      },
      recommendations: isBot 
        ? ['Account shows bot-like behavior', 'Consider manual verification', 'Monitor for spam patterns']
        : ['Account appears legitimate', 'Good engagement patterns', 'Regular posting schedule']
    };

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    res.status(200).json(result);
  } catch (error) {
    console.error('Bot detection error:', error);
    res.status(500).json({ error: 'Bot detection analysis failed' });
  }
} 