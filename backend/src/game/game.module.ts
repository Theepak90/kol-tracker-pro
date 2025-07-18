import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  imports: [],
  providers: [GameGateway, GameService],
  exports: [GameService]
})
export class GameModule {} 