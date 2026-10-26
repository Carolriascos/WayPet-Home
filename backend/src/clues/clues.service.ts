
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClueEntity } from './entities/clue.entity';
import { ReportEntity } from '../reports/entities/report.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { CreateClueDto, UpdateClueDto } from './dto';

@Injectable()
export class CluesService {
  constructor(
    @InjectRepository(ClueEntity)
    private readonly cluesRepository: Repository<ClueEntity>,

    @InjectRepository(ReportEntity)
    private readonly reportsRepository: Repository<ReportEntity>,

    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(
    dto: CreateClueDto,
    currentUser: AuthUser,
  ): Promise<ClueEntity> {
    const report = await this.reportsRepository.findOne({
      where: { id: dto.reportId },
    });

    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    const user = await this.usersRepository.findOne({
      where: { id: currentUser.id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const clue = this.cluesRepository.create({
      report,
      user,
      description: dto.description,
      location: dto.location,
      sightedAt: new Date(dto.sightedAt),
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      photoUrl: dto.photoUrl ?? null,
    });

    return this.cluesRepository.save(clue);
  }

  
async findAll(): Promise<ClueEntity[]> {
  return this.cluesRepository.find({
    relations: { report: true },
    select: {
      id: true,
      description: true,
      location: true,
      sightedAt: true,
      latitude: true,
      longitude: true,
      photoUrl: true,
      createdAt: true,
    },
    order: { createdAt: 'DESC' },
  });
}

  async findOne(id: number): Promise<ClueEntity> {
    const clue = await this.cluesRepository.findOne({
      where: { id },
      relations: { report: true, user: true },
    });

    if (!clue) {
      throw new NotFoundException('Pista no encontrada');
    }

    return clue;
  }

  private checkPermission(
    clue: ClueEntity,
    currentUser: AuthUser,
  ): void {
    const isOwner = clue.user.id === currentUser.id;
    const isAdmin = currentUser.role === 'administrador';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta pista',
      );
    }
  }

  async update(
    id: number,
    dto: UpdateClueDto,
    currentUser: AuthUser,
  ): Promise<ClueEntity> {
    const clue = await this.findOne(id);

    this.checkPermission(clue, currentUser);

    if (dto.reportId !== undefined) {
      const report = await this.reportsRepository.findOne({
        where: { id: dto.reportId },
      });

      if (!report) {
        throw new NotFoundException('Reporte no encontrado');
      }

      clue.report = report;
    }

    if (dto.description !== undefined) {
      clue.description = dto.description;
    }

    if (dto.location !== undefined) {
      clue.location = dto.location;
    }

    if (dto.sightedAt !== undefined) {
      clue.sightedAt = new Date(dto.sightedAt);
    }

    if (dto.latitude !== undefined) {
      clue.latitude = dto.latitude;
    }

    if (dto.longitude !== undefined) {
      clue.longitude = dto.longitude;
    }

    if (dto.photoUrl !== undefined) {
      clue.photoUrl = dto.photoUrl;
    }

    return this.cluesRepository.save(clue);
  }

  async remove(
    id: number,
    currentUser: AuthUser,
  ): Promise<void> {
    const clue = await this.findOne(id);

    this.checkPermission(clue, currentUser);

    await this.cluesRepository.remove(clue);
  }
}
