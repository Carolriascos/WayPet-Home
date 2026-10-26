import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from '../reports/entities/report.entity';
import { MatchEntity } from './entities/match.entity';
import { MatchRulesService } from './match-rules/match-rules.service';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { NotificationsModule } from '../notifications/notifications.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([MatchEntity, ReportEntity]),
    NotificationsModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService, MatchRulesService],
})
export class MatchesModule {}
