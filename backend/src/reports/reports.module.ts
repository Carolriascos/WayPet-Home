import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../auth/entities/user.entity';
import { PetEntity } from './entities/pet.entity';
import { ReportEntity } from './entities/report.entity';
import { ReportRulesService } from './reports-rules/report-rules.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity, PetEntity, UserEntity])],
  controllers: [ReportsController],
  providers: [ReportsService, ReportRulesService],
})
export class ReportsModule {}
