import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportEntity } from './entities/report.entity';
import { ReportRulesService } from './reports-rules/report-rules.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly reportsRepository: Repository<ReportEntity>,

    private readonly reportRulesService: ReportRulesService,
  ) {}

  async create(
    createReportDto: CreateReportDto,
    userId: number,
  ): Promise<ReportEntity> {
    //Primero creo, luego guardo (la mascota se guarda junto con el reporte)
    const report = this.reportsRepository.create({
      type: createReportDto.type,
      eventDate: createReportDto.eventDate,
      location: createReportDto.location,
      description: createReportDto.description,
      status: 'activo',
      user: { id: userId },
      pet: {
        name: createReportDto.petName ?? null,
        breed: createReportDto.breed,
        color: createReportDto.color,
        size: createReportDto.size,
        sex: createReportDto.sex,
        characteristics: createReportDto.characteristics ?? null,
        photoUrl: createReportDto.photoUrl ?? null,
      },
    });

    return this.reportsRepository.save(report);
  }

  async findAll(): Promise<ReportEntity[]> {
    return this.reportsRepository.find({
      relations: {
        pet: true,
        user: true,
      },
      select: {
        user: { id: true, name: true, phone: true },
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async findMine(userId: number): Promise<ReportEntity[]> {
    return this.reportsRepository.find({
      where: { user: { id: userId } },
      relations: {
        pet: true,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<ReportEntity> {
    const report = await this.reportsRepository.findOne({
      where: { id },
      relations: {
        pet: true,
        user: true,
      },
      select: {
        user: { id: true, name: true, phone: true },
      },
    });

    if (!report) {
      throw new NotFoundException(`Report with id ${id} was not found`);
    }

    return report;
  }

  async update(
    id: number,
    updateReportDto: UpdateReportDto,
    user: { id: number; role: string },
  ): Promise<ReportEntity> {
    const report = await this.findOne(id);

    this.reportRulesService.ensureCanBeModifiedBy(report, user);

    this.reportsRepository.merge(report, updateReportDto);

    return this.reportsRepository.save(report);
  }
}
