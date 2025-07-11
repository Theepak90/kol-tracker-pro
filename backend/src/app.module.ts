import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { KOLModule } from './kol/kol.module';
import { GameModule } from './game/game.module';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { BotDetectionModule } from './bot-detection/bot-detection.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/kol-tracker'),
    HttpModule,
    KOLModule,
    GameModule,
    AuthModule,
    BotDetectionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 