import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KOL, KOLDocument } from '../schemas/kol.schema';

@Injectable()
export class KOLService {
  constructor(
    @InjectModel(KOL.name) private readonly kolModel: Model<KOLDocument>
  ) {}

  async create(kolData: {
    displayName: string;
    telegramUsername: string;
    description?: string;
    tags?: string[];
  }): Promise<KOLDocument> {
    // Clean username
    const cleanUsername = kolData.telegramUsername.replace('@', '');

    // Check if KOL already exists
    const existingKOL = await this.kolModel.findOne({ 
      telegramUsername: cleanUsername 
    });
    
    if (existingKOL) {
      throw new ConflictException('KOL with this Telegram username already exists');
    }

    const kol = new this.kolModel({
      displayName: kolData.displayName,
      telegramUsername: cleanUsername,
      description: kolData.description || '',
      tags: kolData.tags || [],
      stats: {
        totalPosts: 0,
        totalViews: 0,
        totalForwards: 0,
        lastUpdated: new Date()
      }
    });

    return await kol.save();
  }

  async findAll(): Promise<KOLDocument[]> {
    return await this.kolModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUsername(username: string): Promise<KOLDocument | null> {
    const cleanUsername = username.replace('@', '');
    return await this.kolModel.findOne({ 
      telegramUsername: cleanUsername 
    }).exec();
  }

  async findById(id: string): Promise<KOLDocument | null> {
    return await this.kolModel.findById(id).exec();
  }

  async remove(username: string): Promise<boolean> {
    const cleanUsername = username.replace('@', '');
    const result = await this.kolModel.deleteOne({ 
      telegramUsername: cleanUsername 
    });
    
    return result.deletedCount > 0;
  }

  async removeById(id: string): Promise<boolean> {
    const result = await this.kolModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async updateStats(username: string, stats: {
    totalPosts: number;
    totalViews: number;
    totalForwards: number;
  }): Promise<KOLDocument | null> {
    const cleanUsername = username.replace('@', '');
    
    return await this.kolModel.findOneAndUpdate(
      { telegramUsername: cleanUsername },
      { 
        $set: {
          'stats.totalPosts': stats.totalPosts,
          'stats.totalViews': stats.totalViews,
          'stats.totalForwards': stats.totalForwards,
          'stats.lastUpdated': new Date()
        }
      },
      { new: true }
    ).exec();
  }

  async update(username: string, updateData: Partial<KOL>): Promise<KOLDocument | null> {
    const cleanUsername = username.replace('@', '');
    
    return await this.kolModel.findOneAndUpdate(
      { telegramUsername: cleanUsername },
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async getTopKOLsByViews(limit: number = 10): Promise<KOLDocument[]> {
    return await this.kolModel
      .find()
      .sort({ 'stats.totalViews': -1 })
      .limit(limit)
      .exec();
  }

  async searchKOLs(query: string): Promise<KOLDocument[]> {
    const searchRegex = new RegExp(query, 'i');
    
    return await this.kolModel
      .find({
        $or: [
          { displayName: { $regex: searchRegex } },
          { telegramUsername: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { tags: { $in: [searchRegex] } }
        ]
      })
      .sort({ 'stats.totalViews': -1 })
      .exec();
  }

  async getKOLsByTags(tags: string[]): Promise<KOLDocument[]> {
    return await this.kolModel
      .find({ tags: { $in: tags } })
      .sort({ 'stats.totalViews': -1 })
      .exec();
  }
} 