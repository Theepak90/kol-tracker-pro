import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KOLDocument = KOL & Document;

@Schema({ timestamps: true })
export class KOL {
  @Prop({ required: true })
  displayName: string;

  @Prop({ required: true, unique: true })
  telegramUsername: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Object })
  stats?: {
    totalPosts: number;
    totalViews: number;
    totalForwards: number;
    lastUpdated: Date;
  };
}

export const KOLSchema = SchemaFactory.createForClass(KOL); 