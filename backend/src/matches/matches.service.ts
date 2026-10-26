import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { ReportEntity } from '../reports/entities/report.entity';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';
import { MatchEntity } from './entities/match.entity';
import { MatchRulesService } from './match-rules/match-rules.service';
import { NotificationsService } from '../notifications/notifications.service';
const MINIMUM_SIMILARITY = 50;

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchesRepository: Repository<MatchEntity>,

    @InjectRepository(ReportEntity)
    private readonly reportsRepository: Repository<ReportEntity>,

    private readonly matchRulesService: MatchRulesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async generateForReport(
    reportId: number,
    user: AuthUser,
  ): Promise<MatchEntity[]> {
    const report = await this.reportsRepository.findOne({
      where: { id: reportId },
      relations: { pet: true },
    });

    if (!report) {
      throw new NotFoundException(`Report with id ${reportId} was not found`);
    }

    await this.ensureCanUseReport(reportId, user);

    if (report.status !== 'activo') {
      throw new ConflictException('Only active reports can be compared');
    }

    const oppositeType = report.type === 'perdida' ? 'encontrada' : 'perdida';

    const candidates = await this.reportsRepository.find({
      where: { type: oppositeType, status: 'activo' },
      relations: { pet: true },
    });

    const newMatches: MatchEntity[] = [];

    for (const candidate of candidates) {
      const lostReport = report.type === 'perdida' ? report : candidate;
      const foundReport = report.type === 'perdida' ? candidate : report;

      const alreadyExists = await this.matchesRepository.existsBy({
        lostReport: { id: lostReport.id },
        foundReport: { id: foundReport.id },
      });

      if (alreadyExists) {
        continue;
      }

      const result = this.matchRulesService.calculateSimilarity(
        lostReport.pet,
        foundReport.pet,
      );

      if (result.similarityPercentage < MINIMUM_SIMILARITY) {
        continue;
      }

      const match = this.matchesRepository.create({
        similarityPercentage: result.similarityPercentage,
        matchingFeatures: result.matchingFeatures.join(','),
        status: 'pendiente',
        lostReport,
        foundReport,
      });

      const savedMatch = await this.matchesRepository.save(match);
      await this.notificationsService.createForMatch(savedMatch.id);
      newMatches.push(savedMatch);
    }

    return newMatches;
  }

  async findAll(user: AuthUser): Promise<MatchEntity[]> {
    return this.matchesRepository.find({
      where: this.visibleTo(user),
      relations: {
        lostReport: true,
        foundReport: true,
      },
      order: {
        similarityPercentage: 'DESC',
      },
    });
  }

  async findByReport(reportId: number, user: AuthUser): Promise<MatchEntity[]> {
    await this.ensureCanUseReport(reportId, user);

    return this.matchesRepository.find({
      where: [
        { lostReport: { id: reportId } },
        { foundReport: { id: reportId } },
      ],
      relations: {
        lostReport: true,
        foundReport: true,
      },
      order: {
        similarityPercentage: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<MatchEntity> {
    const match = await this.matchesRepository.findOne({
      where: { id },
      relations: {
        lostReport: true,
        foundReport: true,
      },
    });

    if (!match) {
      throw new NotFoundException(`Match with id ${id} was not found`);
    }

    return match;
  }

  async updateStatus(
    id: number,
    updateMatchStatusDto: UpdateMatchStatusDto,
    user: AuthUser,
  ): Promise<MatchEntity> {
    const match = await this.findOne(id);

    // Solo quien perdió la mascota (o un administrador) confirma o descarta
    if (user.role !== 'administrador') {
      const isOwner = await this.matchesRepository.existsBy({
        id,
        lostReport: { user: { id: user.id } },
      });

      if (!isOwner) {
        throw new ForbiddenException(
          'Only the owner of the lost report can change the match status',
        );
      }
    }

    this.matchRulesService.ensureCanChangeStatus(match.status);

    match.status = updateMatchStatusDto.status;

    // Si la coincidencia se confirma, los dos reportes quedan resueltos
    if (match.status === 'confirmada') {
      match.lostReport.status = 'resuelto';
      match.foundReport.status = 'resuelto';
      await this.reportsRepository.save([match.lostReport, match.foundReport]);
    }

    return this.matchesRepository.save(match);
  }

  // El administrador ve todo; el usuario solo las coincidencias de sus reportes
  private visibleTo(
    user: AuthUser,
  ): FindOptionsWhere<MatchEntity>[] | undefined {
    if (user.role === 'administrador') {
      return undefined;
    }

    return [
      { lostReport: { user: { id: user.id } } },
      { foundReport: { user: { id: user.id } } },
    ];
  }

  private async ensureCanUseReport(
    reportId: number,
    user: AuthUser,
  ): Promise<void> {
    if (user.role === 'administrador') {
      return;
    }

    const isOwner = await this.reportsRepository.existsBy({
      id: reportId,
      user: { id: user.id },
    });

    if (!isOwner) {
      throw new ForbiddenException('You can only use your own reports');
    }
  }
}
