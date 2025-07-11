import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BotDetectionController } from './bot-detection.controller';
import { BotDetectionService } from './bot-detection.service';

@Module({
  imports: [HttpModule],
  controllers: [BotDetectionController],
  providers: [BotDetectionService],
  exports: [BotDetectionService],
})
export class BotDetectionModule {} 