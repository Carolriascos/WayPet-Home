import 'reflect-metadata'; 
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateClueDto } from './create-clue.dto';

describe('CreateClueDto', () => {
  const validClue = {
    reportId: 1,
    description: 'Vi un perro negro cerca del parque.',
    location: 'Parque del Ingenio, Cali',
    sightedAt: '2026-10-24T18:30:00-05:00',
    latitude: 3.377,
    longitude: -76.531,
    photoUrl: 'https://example.com/perro.jpg',
  };

  async function validateClue(data: Record<string, unknown>) {
    const dto = plainToInstance(CreateClueDto, data);
    return validate(dto);
  }

  it('acepta una pista con datos válidos', async () => {
    const errors = await validateClue(validClue);
    expect(errors).toHaveLength(0);
  });

  it('rechaza un reportId negativo', async () => {
    const errors = await validateClue({
      ...validClue,
      reportId: -5,
    });

    expect(errors.some((error) => error.property === 'reportId'))
      .toBe(true);
  });

  it('rechaza una descripción demasiado corta', async () => {
    const errors = await validateClue({
      ...validClue,
      description: 'perro',
    });

    expect(errors.some((error) => error.property === 'description'))
      .toBe(true);
  });

  it('rechaza una fecha inválida', async () => {
    const errors = await validateClue({
      ...validClue,
      sightedAt: 'ayer',
    });

    expect(errors.some((error) => error.property === 'sightedAt'))
      .toBe(true);
  });

  it('rechaza coordenadas fuera de rango', async () => {
    const errors = await validateClue({
      ...validClue,
      latitude: 100,
      longitude: -200,
    });

    expect(errors.some((error) => error.property === 'latitude'))
      .toBe(true);

    expect(errors.some((error) => error.property === 'longitude'))
      .toBe(true);
  });
});
