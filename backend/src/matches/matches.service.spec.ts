import { describe, jest, beforeEach, it, expect } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportEntity } from '../reports/entities/report.entity';
import { MatchEntity } from './entities/match.entity';
import { MatchRulesService } from './match-rules/match-rules.service';
import { MatchesService } from './matches.service';

describe('MatchesServiceTest', () => {
  let service: MatchesService;

  const matchesRepositoryMock = {
    find: jest.fn(),
    findOne: jest.fn<(options: any) => Promise<MatchEntity | null>>(),
    existsBy: jest.fn<(options: any) => Promise<boolean>>(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const reportsRepositoryMock = {
    find: jest.fn<(options: any) => Promise<ReportEntity[]>>(),
    findOne: jest.fn<(options: any) => Promise<ReportEntity | null>>(),
    save: jest.fn(),
  };

  const matchRulesServiceMock = {
    calculateSimilarity: jest.fn(),
    ensureCanChangeStatus: jest.fn(),
  };

  const lostReportMock = {
    id: 1,
    type: 'perdida',
    status: 'activo',
    pet: {
      id: 1,
      breed: 'Labrador',
      color: 'Black',
      size: 'Large',
      sex: 'Male',
    },
  } as ReportEntity;

  const foundReportMock = {
    id: 2,
    type: 'encontrada',
    status: 'activo',
    pet: {
      id: 2,
      breed: 'Labrador',
      color: 'Black',
      size: 'Large',
      sex: 'Male',
    },
  } as ReportEntity;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: getRepositoryToken(MatchEntity),
          useValue: matchesRepositoryMock,
        },
        {
          provide: getRepositoryToken(ReportEntity),
          useValue: reportsRepositoryMock,
        },
        {
          provide: MatchRulesService,
          useValue: matchRulesServiceMock,
        },
      ],
    }).compile();

    service = moduleRef.get(MatchesService);
  });

  it('returns a match when the id exists', async () => {
    const matchMock = {
      id: 5,
      similarityPercentage: 90,
      status: 'pendiente',
    } as MatchEntity;

    matchesRepositoryMock.findOne.mockResolvedValue(matchMock);

    const result = await service.findOne(5);

    expect(result).toEqual(matchMock);
    expect(matchesRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: 5 },
      relations: { lostReport: true, foundReport: true },
    });
  });

  it('throws NotFoundException when the match does not exist', async () => {
    matchesRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.findOne(5)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException when the report does not exist', async () => {
    reportsRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.generateForReport(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws ConflictException when the report is not active', async () => {
    reportsRepositoryMock.findOne.mockResolvedValue({
      ...lostReportMock,
      status: 'resuelto',
    });

    await expect(service.generateForReport(1)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('saves a match when the similarity is 50 or more', async () => {
    reportsRepositoryMock.findOne.mockResolvedValue(lostReportMock);
    reportsRepositoryMock.find.mockResolvedValue([foundReportMock]);
    matchesRepositoryMock.existsBy.mockResolvedValue(false);
    matchRulesServiceMock.calculateSimilarity.mockReturnValue({
      similarityPercentage: 90,
      matchingFeatures: ['breed', 'color', 'size'],
    });
    matchesRepositoryMock.create.mockImplementation((data) => data);
    matchesRepositoryMock.save.mockImplementation((data) =>
      Promise.resolve({ id: 10, ...(data as object) }),
    );

    const result = await service.generateForReport(1);

    expect(result).toHaveLength(1);
    expect(matchesRepositoryMock.create).toHaveBeenCalledWith({
      similarityPercentage: 90,
      matchingFeatures: 'breed,color,size',
      status: 'pendiente',
      lostReport: lostReportMock,
      foundReport: foundReportMock,
    });
    expect(matchesRepositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('does not save a match when the similarity is below 50', async () => {
    reportsRepositoryMock.findOne.mockResolvedValue(lostReportMock);
    reportsRepositoryMock.find.mockResolvedValue([foundReportMock]);
    matchesRepositoryMock.existsBy.mockResolvedValue(false);
    matchRulesServiceMock.calculateSimilarity.mockReturnValue({
      similarityPercentage: 30,
      matchingFeatures: ['color'],
    });

    const result = await service.generateForReport(1);

    expect(result).toEqual([]);
    expect(matchesRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('does not repeat a match that already exists', async () => {
    reportsRepositoryMock.findOne.mockResolvedValue(lostReportMock);
    reportsRepositoryMock.find.mockResolvedValue([foundReportMock]);
    matchesRepositoryMock.existsBy.mockResolvedValue(true);

    const result = await service.generateForReport(1);

    expect(result).toEqual([]);
    expect(matchRulesServiceMock.calculateSimilarity).not.toHaveBeenCalled();
    expect(matchesRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('marks both reports as resolved when the match is confirmed', async () => {
    const pendingMatch = {
      id: 5,
      status: 'pendiente',
      lostReport: { ...lostReportMock },
      foundReport: { ...foundReportMock },
    } as MatchEntity;

    matchesRepositoryMock.findOne.mockResolvedValue(pendingMatch);
    matchesRepositoryMock.save.mockImplementation((data) =>
      Promise.resolve(data),
    );

    const result = await service.updateStatus(5, { status: 'confirmada' });

    expect(matchRulesServiceMock.ensureCanChangeStatus).toHaveBeenCalledWith(
      'pendiente',
    );
    expect(result.status).toBe('confirmada');
    expect(result.lostReport.status).toBe('resuelto');
    expect(result.foundReport.status).toBe('resuelto');
    expect(reportsRepositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('does not change the reports when the match is discarded', async () => {
    const pendingMatch = {
      id: 5,
      status: 'pendiente',
      lostReport: { ...lostReportMock },
      foundReport: { ...foundReportMock },
    } as MatchEntity;

    matchesRepositoryMock.findOne.mockResolvedValue(pendingMatch);
    matchesRepositoryMock.save.mockImplementation((data) =>
      Promise.resolve(data),
    );

    const result = await service.updateStatus(5, { status: 'descartada' });

    expect(result.status).toBe('descartada');
    expect(reportsRepositoryMock.save).not.toHaveBeenCalled();
  });
});