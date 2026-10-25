import { Injectable } from '@nestjs/common';
import { PetFeatures } from '../pet-features.interface';

@Injectable()
export class MatchRulesService {
  calculateSimilarity(
    lostPet: PetFeatures,
    foundPet: PetFeatures,
  ): {
    similarityPercentage: number;
    matchingFeatures: string[];
  } {
    let similarityPercentage = 0;
    const matchingFeatures: string[] = [];

    if (this.isSame(lostPet.breed, foundPet.breed)) {
      similarityPercentage += 40;
      matchingFeatures.push('breed');
    }

    if (this.isSame(lostPet.color, foundPet.color)) {
      similarityPercentage += 30;
      matchingFeatures.push('color');
    }

    if (this.isSame(lostPet.size, foundPet.size)) {
      similarityPercentage += 20;
      matchingFeatures.push('size');
    }

    if (this.isSame(lostPet.sex, foundPet.sex)) {
      similarityPercentage += 10;
      matchingFeatures.push('sex');
    }

    return { similarityPercentage, matchingFeatures };
  }

  private isSame(first: string, second: string): boolean {
    return first.trim().toLowerCase() === second.trim().toLowerCase();
  }
}