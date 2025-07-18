import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage for KOLs (same as our backend)
interface KOL {
  id: string;
  displayName: string;
  telegramUsername: string;
  description?: string;
  tags: string[];
  stats: {
    totalPosts: number;
    totalViews: number;
    totalForwards: number;
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Global storage (persists across function calls within the same instance)
let kols: Map<string, KOL> = new Map();
let idCounter = 1;

// Initialize with some sample data if empty
if (kols.size === 0) {
  const sampleKOLs: KOL[] = [
    {
      id: '1',
      displayName: 'CryptoKing',
      telegramUsername: 'cryptoking_official',
      description: 'Leading crypto analyst with proven track record',
      tags: ['DeFi', 'Analytics', 'Trading'],
      stats: {
        totalPosts: 847,
        totalViews: 2847502,
        totalForwards: 18294,
        lastUpdated: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      displayName: 'DeFi Master',
      telegramUsername: 'defi_master_pro',
      description: 'Specialized in yield farming and liquidity strategies',
      tags: ['DeFi', 'Yield Farming', 'Strategy'],
      stats: {
        totalPosts: 623,
        totalViews: 1847293,
        totalForwards: 12847,
        lastUpdated: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  sampleKOLs.forEach(kol => {
    kols.set(kol.id, kol);
    idCounter = Math.max(idCounter, parseInt(kol.id) + 1);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all KOLs
        const allKOLs = Array.from(kols.values()).sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
        res.status(200).json(allKOLs);
        break;

      case 'POST':
        // Create new KOL
        const { displayName, telegramUsername, description, tags } = req.body;
        
        if (!displayName || !telegramUsername) {
          res.status(400).json({ error: 'displayName and telegramUsername are required' });
          return;
        }

        // Check if KOL already exists
        const cleanUsername = telegramUsername.replace('@', '');
        const existingKOL = Array.from(kols.values()).find(
          kol => kol.telegramUsername === cleanUsername
        );
        
        if (existingKOL) {
          res.status(409).json({ error: 'KOL with this Telegram username already exists' });
          return;
        }

        const newKOL: KOL = {
          id: idCounter.toString(),
          displayName,
          telegramUsername: cleanUsername,
          description: description || '',
          tags: tags || [],
          stats: {
            totalPosts: 0,
            totalViews: 0,
            totalForwards: 0,
            lastUpdated: new Date()
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        kols.set(newKOL.id, newKOL);
        idCounter++;
        
        res.status(201).json(newKOL);
        break;

      case 'PUT':
        // Update KOL (if we had the ID in the path)
        res.status(200).json({ message: 'Update functionality available' });
        break;

      case 'DELETE':
        // Delete KOL (if we had the ID in the path)
        res.status(200).json({ message: 'Delete functionality available' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 