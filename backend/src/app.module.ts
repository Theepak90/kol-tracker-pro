import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KOLModule } from './kol/kol.module';
import { GameModule } from './game/game.module';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { BotDetectionModule } from './bot-detection/bot-detection.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // MongoDB connection
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/kol-tracker-pro',
      {
        retryWrites: true,
        w: 'majority',
        retryAttempts: 5,
        retryDelay: 1000,
      }
    ),

    // Static assets (frontend build)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'dist'),
      exclude: ['/api*'],
    }),

    // Misc modules
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