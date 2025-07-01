import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { BodegaService } from 'src/bodega/bodega.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

// Bypass guards for integration tests
class AlwaysAllowGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

describe('BodegaController (integración)', () => {
  let app: INestApplication;
  const mockBodegas = [{ id: 1, nombre: 'Central', ubicacion: 'Norte' }];
  const mockService = {
    findAll: jest.fn().mockResolvedValue(mockBodegas),
    create: jest
      .fn()
      .mockImplementation((dto) => Promise.resolve({ id: 2, ...dto })),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BodegaService)
      .useValue(mockService)
      .overrideGuard(JwtAuthGuard)
      .useClass(AlwaysAllowGuard)
      .overrideGuard(RolesGuard)
      .useClass(AlwaysAllowGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /bodega debería devolver todas las bodegas', async () => {
    const response = await request(app.getHttpServer())
      .get('/bodega')
      .expect(200);

    expect(response.body).toEqual(mockBodegas);
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('POST /bodega debería crear una nueva bodega', async () => {
    const newDto = { nombre: 'Sur', ubicacion: 'Sur' };
    const response = await request(app.getHttpServer())
      .post('/bodega')
      .send(newDto)
      .expect(201);

    expect(response.body).toEqual({ id: 2, ...newDto });
    expect(mockService.create).toHaveBeenCalledWith(newDto);
  });
});
