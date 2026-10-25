import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity } from '../reports/entities/report.entity';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';
import { MatchEntity } from './entities/match.entity';
import { MatchRulesService } from './match-rules/match-rules.service';

const MINIMUM_SIMILARITY = 50;

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchesRepository: Repository<MatchEntity>,

    @InjectRepository(ReportEntity)
    private readonly reportsRepository: Repository<ReportEntity>,

    private readonly matchRulesService: MatchRulesService,
  ) {}

  async generateForReport(reportId: number): Promise<MatchEntity[]> {
    const report = await this.reportsRepository.findOne({
      where: { id: reportId },
      relations: { pet: true },
    });

    if (!report) {
      throw new NotFoundException(`Report with id ${reportId} was not found`);
    }

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

      newMatches.push(await this.matchesRepository.save(match));
    }

    return newMatches;
  }

  async findAll(): Promise<MatchEntity[]> {
    return this.matchesRepository.find({
      relations: {
        lostReport: true,
        foundReport: true,
      },
      order: {
        similarityPercentage: 'DESC',
      },
    });
  }

  async findByReport(reportId: number): Promise<MatchEntity[]> {
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
  ): Promise<MatchEntity> {
    const match = await this.findOne(id);
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
}
