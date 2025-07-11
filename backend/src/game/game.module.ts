import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameGateway } from './game.gateway';
import { Game, GameSchema } from './schemas/game.schema';
import { GameService } from './game.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }])
  ],
  providers: [GameGateway, GameService],
  exports: [GameService]
})
export class GameModule {} 