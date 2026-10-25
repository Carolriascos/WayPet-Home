import { describe, jest, beforeEach, it, expect } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { MatchEntity } from '../matches/entities/match.entity';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';

describe('NotificationsServiceTest', () => {
  let service: NotificationsService;

  const notificationsRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn<(options: any) => Promise<NotificationEntity[]>>(),
    findOne: jest.fn<(options: any) => Promise<NotificationEntity | null>>(),
  };

  const matchesRepositoryMock = {
    findOne: jest.fn<(options: any) => Promise<MatchEntity | null>>(),
  };

  const user: AuthUser = {
    id: 7,
    email: 'owner@test.com',
    role: 'usuario',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(NotificationEntity),
          useValue: notificationsRepositoryMock,
        },
        {
          provide: getRepositoryToken(MatchEntity),
          useValue: matchesRepositoryMock,
        },
      ],
    }).compile();

    service = moduleRef.get(NotificationsService);
  });

  it('creates one notification for each owner of the match', async () => {
    const match = {
      id: 5,
      similarityPercentage: 90,
      lostReport: { user: { id: 7 } },
      foundReport: { user: { id: 8 } },
    } as unknown as MatchEntity;

    matchesRepositoryMock.findOne.mockResolvedValue(match);
    notificationsRepositoryMock.create.mockImplementation((data) => data);

    await service.createForMatch(5);

    expect(notificationsRepositoryMock.save).toHaveBeenCalledWith([
      expect.objectContaining({ user: { id: 7 }, match }),
      expect.objectContaining({ user: { id: 8 }, match }),
    ]);
  });

  it('throws NotFoundException when the match does not exist', async () => {
    matchesRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.createForMatch(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(notificationsRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('only lists the notifications of the user', async () => {
    notificationsRepositoryMock.find.mockResolvedValue([]);

    await service.findMine(user);

    expect(notificationsRepositoryMock.find).toHaveBeenCalledWith({
      where: { user: { id: 7 } },
      relations: { match: true },
      order: { createdAt: 'DESC' },
    });
  });

  it('marks a notification as read', async () => {
    const notification = { id: 3, isRead: false } as NotificationEntity;

    notificationsRepositoryMock.findOne.mockResolvedValue(notification);
    notificationsRepositoryMock.save.mockImplementation((data) =>
      Promise.resolve(data),
    );

    const result = await service.markAsRead(3, user);

    expect(result.isRead).toBe(true);
    expect(notificationsRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: 3, user: { id: 7 } },
    });
  });

  it('throws NotFoundException when the notification belongs to someone else', async () => {
    notificationsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.markAsRead(3, user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(notificationsRepositoryMock.save).not.toHaveBeenCalled();
  });
});
