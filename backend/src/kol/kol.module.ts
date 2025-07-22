import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KOLController } from './kol.controller';
import { KOLService } from './kol.service';
import { KOL, KOLSchema } from '../schemas/kol.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KOL.name, schema: KOLSchema }
    ])
  ],
  controllers: [KOLController],
  providers: [KOLService],
  exports: [KOLService, MongooseModule]
})
export class KOLModule {} 