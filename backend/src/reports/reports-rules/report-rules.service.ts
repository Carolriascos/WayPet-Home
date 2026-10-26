import { ForbiddenException, Injectable } from '@nestjs/common';
import { ReportEntity } from '../entities/report.entity';

@Injectable()
export class ReportRulesService {
  ensureCanBeModifiedBy(
    report: ReportEntity,
    user: { id: number; role: string },
  ): void {
    const isOwner = report.user.id === user.id;
    const isAdministrator = user.role === 'administrador';

    if (!isOwner && !isAdministrator) {
      throw new ForbiddenException('You can only modify your own reports');
    }
  }
}
