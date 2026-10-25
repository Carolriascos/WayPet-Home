import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEntity } from './entities/match.entity';
import { MatchRulesService } from './match-rules/match-rules.service';

@Module({
  imports: [TypeOrmModule.forFeature([MatchEntity])],
  providers: [MatchRulesService],
})
export class MatchesModule {}
