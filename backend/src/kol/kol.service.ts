import { Injectable, ConflictException } from '@nestjs/common';

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

@Injectable()
export class KOLService {
  private kols: Map<string, KOL> = new Map();
  private idCounter = 1;

  async create(kolData: {
    displayName: string;
    telegramUsername: string;
    description?: string;
    tags?: string[];
  }): Promise<KOL> {
    // Clean username
    const cleanUsername = kolData.telegramUsername.replace('@', '');

    // Check if KOL already exists
    const existingKOL = Array.from(this.kols.values()).find(
      kol => kol.telegramUsername === cleanUsername
    );
    if (existingKOL) {
      throw new ConflictException('KOL with this Telegram username already exists');
    }

    const kol: KOL = {
      id: this.idCounter.toString(),
      displayName: kolData.displayName,
      telegramUsername: cleanUsername,
      description: kolData.description,
      tags: kolData.tags || [],
      stats: {
        totalPosts: 0,
        totalViews: 0,
        totalForwards: 0,
        lastUpdated: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.kols.set(kol.id, kol);
    this.idCounter++;
    return kol;
  }

  async findAll(): Promise<KOL[]> {
    return Array.from(this.kols.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async findByUsername(username: string): Promise<KOL | null> {
    const cleanUsername = username.replace('@', '');
    return Array.from(this.kols.values()).find(
      kol => kol.telegramUsername === cleanUsername
    ) || null;
  }

  async remove(username: string): Promise<boolean> {
    const cleanUsername = username.replace('@', '');
    const kol = Array.from(this.kols.values()).find(
      kol => kol.telegramUsername === cleanUsername
    );
    
    if (!kol) return false;
    
    this.kols.delete(kol.id);
    return true;
  }

  async updateStats(username: string, stats: {
    totalPosts: number;
    totalViews: number;
    totalForwards: number;
  }): Promise<KOL | null> {
    const cleanUsername = username.replace('@', '');
    const kol = Array.from(this.kols.values()).find(
      kol => kol.telegramUsername === cleanUsername
    );
    
    if (!kol) return null;
    
    kol.stats = {
      ...stats,
      lastUpdated: new Date()
    };
    kol.updatedAt = new Date();
    
    this.kols.set(kol.id, kol);
    return kol;
  }
} 