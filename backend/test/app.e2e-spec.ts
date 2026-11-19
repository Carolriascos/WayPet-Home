import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';


describe('Reportes (integración)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let dataSource: DataSource;

  const suffix = Date.now();
  const password = 'Clave1234';
  const owner = {
    name: 'Dueña Prueba',
    email: `owner.${suffix}@waypet.test`,
    phone: '3001112233',
  };
  const stranger = {
    name: 'Otra Persona',
    email: `stranger.${suffix}@waypet.test`,
    phone: '3004445566',
  };
  const admin = {
    name: 'Admin Prueba',
    email: `admin.${suffix}@waypet.test`,
    phone: '3007778899',
  };

  let ownerToken = '';
  let strangerToken = '';
  let adminToken = '';
  let reportId = 0;

  const validReport = {
    type: 'perdida',
    petName: 'Max',
    breed: 'Labrador',
    color: 'Dorado',
    size: 'grande',
    sex: 'macho',
    characteristics: 'Especie: Perro; collar azul',
    eventDate: '2026-11-10',
    location: 'Parque del Perro, Cali',
    description: 'Se perdió durante un paseo',
  };

  async function registerAndLogin(user: typeof owner): Promise<string> {
    await http
      .post('/api/auth/register')
      .send({ ...user, password })
      .expect(201);
    const login = await http
      .post('/api/auth/login')
      .send({ email: user.email, password })
      .expect(200);
    return (login.body as { access_token: string }).access_token;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    http = request(app.getHttpServer());
    dataSource = app.get(DataSource);

    ownerToken = await registerAndLogin(owner);
    strangerToken = await registerAndLogin(stranger);
    adminToken = await registerAndLogin(admin);

    // El rol de administrador se asigna en la base de datos.
    await dataSource.query(
      `UPDATE users SET role = 'administrador' WHERE email = $1`,
      [admin.email],
    );
  });

  afterAll(async () => {
    const emails = [owner.email, stranger.email, admin.email];
    await dataSource.query(
      `DELETE FROM matches WHERE lost_report_id IN (SELECT id FROM reports WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1)))
          OR found_report_id IN (SELECT id FROM reports WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1)))`,
      [emails],
    );
    const pets: { pet_id: number }[] = await dataSource.query(
      `SELECT pet_id FROM reports WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))`,
      [emails],
    );
    await dataSource.query(
      `DELETE FROM reports WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))`,
      [emails],
    );
    if (pets.length > 0) {
      await dataSource.query(`DELETE FROM pets WHERE id = ANY($1)`, [
        pets.map((row) => row.pet_id),
      ]);
    }
    await dataSource.query(`DELETE FROM users WHERE email = ANY($1)`, [emails]);
    await app.close();
  });

  it('rechaza crear un reporte sin token (401)', async () => {
    await http.post('/api/reports').send(validReport).expect(401);
  });

  it('rechaza datos inválidos con 400 y mensajes de validación', async () => {
    const response = await http
      .post('/api/reports')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ ...validReport, type: 'otra', location: '' })
      .expect(400);

    expect(Array.isArray((response.body as { message: unknown }).message)).toBe(
      true,
    );
  });

  it('crea un reporte válido y lo deja activo, asociado al usuario', async () => {
    const response = await http
      .post('/api/reports')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(validReport)
      .expect(201);

    const body = response.body as {
      id: number;
      status: string;
      pet: { breed: string; sex: string };
    };
    expect(body.status).toBe('activo');
    expect(body.pet.breed).toBe('Labrador');
    expect(body.pet.sex).toBe('macho');
    reportId = body.id;
  });

  it('muestra el reporte en "mis reportes" del dueño y no en los de otro usuario', async () => {
    const mine = await http
      .get('/api/reports/mine')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);
    const others = await http
      .get('/api/reports/mine')
      .set('Authorization', `Bearer ${strangerToken}`)
      .expect(200);

    expect((mine.body as { id: number }[]).map((r) => r.id)).toContain(
      reportId,
    );
    expect((others.body as { id: number }[]).map((r) => r.id)).not.toContain(
      reportId,
    );
  });

  it('devuelve el detalle del reporte y 404 si no existe', async () => {
    const detail = await http
      .get(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${strangerToken}`)
      .expect(200);
    expect((detail.body as { location: string }).location).toBe(
      validReport.location,
    );

    await http
      .get('/api/reports/99999999')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(404);
  });

  it('prohíbe a otro usuario editar un reporte ajeno (403) sin modificarlo', async () => {
    await http
      .patch(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${strangerToken}`)
      .send({ location: 'Lugar manipulado' })
      .expect(403);

    const detail = await http
      .get(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);
    expect((detail.body as { location: string }).location).toBe(
      validReport.location,
    );
  });

  it('permite al dueño editar ubicación y descripción', async () => {
    const response = await http
      .patch(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ location: 'Calle 5, Cali', description: 'Descripción nueva' })
      .expect(200);

    const body = response.body as { location: string; description: string };
    expect(body.location).toBe('Calle 5, Cali');
    expect(body.description).toBe('Descripción nueva');
  });

  it('permite a un administrador marcar como resuelto un reporte ajeno', async () => {
    const response = await http
      .patch(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'resuelto' })
      .expect(200);

    expect((response.body as { status: string }).status).toBe('resuelto');
  });
});