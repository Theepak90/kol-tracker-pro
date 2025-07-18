import { Module } from '@nestjs/common';
import { KOLController } from './kol.controller';
import { KOLService } from './kol.service';

@Module({
  imports: [],
  controllers: [KOLController],
  providers: [KOLService],
  exports: [KOLService]
})
export class KOLModule {} 