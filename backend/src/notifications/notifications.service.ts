import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { MatchEntity } from '../matches/entities/match.entity';
import { NotificationEntity } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationsRepository: Repository<NotificationEntity>,

    @InjectRepository(MatchEntity)
    private readonly matchesRepository: Repository<MatchEntity>,
  ) {}

  // Avisa a los dos dueños de los reportes de que hay una posible coincidencia
  async createForMatch(matchId: number): Promise<void> {
    const match = await this.matchesRepository.findOne({
      where: { id: matchId },
      relations: { lostReport: { user: true }, foundReport: { user: true } },
    });

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found`);
    }

    const notifications = [
      this.notificationsRepository.create({
        user: { id: match.lostReport.user.id },
        match,
        message: `Hay una posible coincidencia (${match.similarityPercentage}%) con una mascota encontrada.`,
      }),
      this.notificationsRepository.create({
        user: { id: match.foundReport.user.id },
        match,
        message: `Hay una posible coincidencia (${match.similarityPercentage}%) con una mascota perdida.`,
      }),
    ];

    await this.notificationsRepository.save(notifications);
  }

  async findMine(user: AuthUser): Promise<NotificationEntity[]> {
    return this.notificationsRepository.find({
      where: { user: { id: user.id } },
      relations: { match: true },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number, user: AuthUser): Promise<NotificationEntity> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} was not found`);
    }

    notification.isRead = true;

    return this.notificationsRepository.save(notification);
  }
}
