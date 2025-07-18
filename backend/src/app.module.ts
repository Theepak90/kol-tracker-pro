import { Module } from '@nestjs/common';
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