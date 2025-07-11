import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KOL, KOLDocument } from '../schemas/kol.schema';

@Injectable()
export class KOLService {
  constructor(
    @InjectModel(KOL.name) private kolModel: Model<KOLDocument>
  ) {}

  async create(kolData: {
    displayName: string;
    telegramUsername: string;
    description?: string;
    tags?: string[];
  }): Promise<KOL> {
    // Clean username
    const cleanUsername = kolData.telegramUsername.replace('@', '');

    // Check if KOL already exists
    const existingKOL = await this.kolModel.findOne({ telegramUsername: cleanUsername });
    if (existingKOL) {
      throw new ConflictException('KOL with this Telegram username already exists');
    }

    const kol = new this.kolModel({
      ...kolData,
      telegramUsername: cleanUsername,
      stats: {
        totalPosts: 0,
        totalViews: 0,
        totalForwards: 0,
        lastUpdated: new Date()
      }
    });

    return kol.save();
  }

  async findAll(): Promise<KOL[]> {
    return this.kolModel.find().exec();
  }

  async findByUsername(username: string): Promise<KOL | null> {
    const cleanUsername = username.replace('@', '');
    return this.kolModel.findOne({ telegramUsername: cleanUsername }).exec();
  }

  async update(username: string, updateData: Partial<KOL>): Promise<KOL | null> {
    const cleanUsername = username.replace('@', '');
    return this.kolModel
      .findOneAndUpdate(
        { telegramUsername: cleanUsername },
        updateData,
        { new: true }
      )
      .exec();
  }

  async delete(username: string): Promise<boolean> {
    const cleanUsername = username.replace('@', '');
    const result = await this.kolModel.deleteOne({ telegramUsername: cleanUsername }).exec();
    return result.deletedCount > 0;
  }

  async updateStats(username: string, stats: {
    totalPosts: number;
    totalViews: number;
    totalForwards: number;
  }): Promise<KOL | null> {
    const cleanUsername = username.replace('@', '');
    return this.kolModel
      .findOneAndUpdate(
        { telegramUsername: cleanUsername },
        {
          stats: {
            ...stats,
            lastUpdated: new Date()
          }
        },
        { new: true }
      )
      .exec();
  }
} 