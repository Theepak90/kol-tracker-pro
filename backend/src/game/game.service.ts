import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from './schemas/game.schema';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>
  ) {}

  async create(gameData: Partial<Game>): Promise<Game> {
    const game = new this.gameModel(gameData);
    return game.save();
  }

  async findById(id: string): Promise<Game | null> {
    return this.gameModel.findOne({ id }).exec();
  }

  async findActiveGames(): Promise<Game[]> {
    return this.gameModel
      .find({ status: 'waiting' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateGame(id: string, update: Partial<Game>): Promise<Game | null> {
    return this.gameModel
      .findOneAndUpdate({ id }, update, { new: true })
      .exec();
  }

  async deleteGame(id: string): Promise<void> {
    await this.gameModel.deleteOne({ id }).exec();
  }
} 