import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KOLDocument = KOL & Document;

@Schema({
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'kols'
})
export class KOL {
  @Prop({ required: true })
  displayName: string;

  @Prop({ required: true, unique: true, index: true })
  telegramUsername: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: {
      totalPosts: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
      totalForwards: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now }
    },
    default: {}
  })
  stats: {
    totalPosts: number;
    totalViews: number;
    totalForwards: number;
    lastUpdated: Date;
  };

  // timestamps: true will automatically add these fields
  createdAt?: Date;
  updatedAt?: Date;
}

export const KOLSchema = SchemaFactory.createForClass(KOL);

// Create indexes for better performance
KOLSchema.index({ telegramUsername: 1 });
KOLSchema.index({ displayName: 1 });
KOLSchema.index({ 'stats.totalViews': -1 });
KOLSchema.index({ createdAt: -1 }); 