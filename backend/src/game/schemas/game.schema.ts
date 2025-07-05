import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameDocument = Game & Document;

@Schema()
export class Game {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  gameType: 'coinflip' | 'jackpot' | 'kol_predictor' | 'market_master';

  @Prop({ required: true })
  status: 'waiting' | 'playing' | 'completed';

  @Prop({ type: [Object], required: true })
  players: {
    id: string;
    username: string;
    avatar?: string;
    walletAddress: string;
  }[];

  @Prop({ required: true })
  betAmount: number;

  @Prop({ required: true })
  currency: 'SOL' | 'USDT';

  @Prop({ required: true })
  createdAt: Date;

  @Prop({
    type: {
      id: String,
      username: String,
      avatar: String,
      walletAddress: String
    },
    required: false
  })
  winner?: {
    id: string;
    username: string;
    avatar?: string;
    walletAddress: string;
  };
}

export const GameSchema = SchemaFactory.createForClass(Game);