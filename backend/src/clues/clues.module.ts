
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClueEntity } from './entities/clue.entity';
import { ReportEntity } from '../reports/entities/report.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { CluesService } from './clues.service';
import { CluesController } from './clues.controller';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClueEntity,
      ReportEntity,
      UserEntity,
    ]),
  ],
  controllers: [CluesController],
  providers: [CluesService, RolesGuard],
  exports: [CluesService],
})
export class CluesModule {}
