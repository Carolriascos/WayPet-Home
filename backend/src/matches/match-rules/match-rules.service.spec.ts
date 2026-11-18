import { MatchRulesService } from './match-rules.service';
import { PetFeatures } from '../pet-features.interface';
import { describe, it, expect } from '@jest/globals';

describe('MatchRulesServiceTest', () => {
  const service = new MatchRulesService();

  const lostPet: PetFeatures = {
    breed: 'Labrador',
    color: 'Black',
    size: 'Large',
    sex: 'Male',
  };

  it('returns 100 when every feature matches', () => {
    const foundPet = { ...lostPet } as PetFeatures;

    const result = service.calculateSimilarity(lostPet, foundPet);

    expect(result.similarityPercentage).toBe(100);
    expect(result.matchingFeatures).toEqual(['breed', 'color', 'size', 'sex']);
  });

  it('returns 0 when no feature matches', () => {
    const foundPet = {
      breed: 'Poodle',
      color: 'White',
      size: 'Small',
      sex: 'Female',
    } as PetFeatures;

    const result = service.calculateSimilarity(lostPet, foundPet);

    expect(result.similarityPercentage).toBe(0);
    expect(result.matchingFeatures).toEqual([]);
  });

  it('adds only the points of the features that match', () => {
    const foundPet = {
      breed: 'Labrador',
      color: 'White',
      size: 'Large',
      sex: 'Female',
    } as PetFeatures;

    const result = service.calculateSimilarity(lostPet, foundPet);

    expect(result.similarityPercentage).toBe(60);
    expect(result.matchingFeatures).toEqual(['breed', 'size']);
  });

  it('ignores uppercase and extra spaces', () => {
    const foundPet = {
      breed: ' labrador ',
      color: 'BLACK',
      size: 'large',
      sex: 'male',
    } as PetFeatures;

    const result = service.calculateSimilarity(lostPet, foundPet);

    expect(result.similarityPercentage).toBe(100);
  });
});
