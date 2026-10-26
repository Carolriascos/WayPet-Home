import { ForbiddenException } from '@nestjs/common';
import { ReportEntity } from '../entities/report.entity';
import { ReportRulesService } from './report-rules.service';

describe('ReportRulesService', () => {
  const service = new ReportRulesService();
  // Reporte de prueba cuyo dueño es el usuario con id 2
  const report = { id: 1, user: { id: 2 } } as unknown as ReportEntity;

  it('permite modificar al dueño del reporte', () => {
    expect(() =>
      service.ensureCanBeModifiedBy(report, { id: 2, role: 'usuario' }),
    ).not.toThrow();
  });

  it('permite modificar a un administrador', () => {
    expect(() =>
      service.ensureCanBeModifiedBy(report, { id: 9, role: 'administrador' }),
    ).not.toThrow();
  });

  it('rechaza a otro usuario con ForbiddenException', () => {
    expect(() =>
      service.ensureCanBeModifiedBy(report, { id: 3, role: 'usuario' }),
    ).toThrow(ForbiddenException);
  });
});