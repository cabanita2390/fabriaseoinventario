import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { BodegaController } from 'src/bodega/bodega.controller';
import { BodegaService } from 'src/bodega/bodega.service';
import { AuthService } from 'src/auth/auth.service';
import { UsuarioService } from 'src/usuario/usuario.service';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

describe('E2E Auth & Roles (módulo ligero) sobre /bodega', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockBodega = {
    id: 1,
    nombre: 'BodegaTest',
    ubicacion: 'UbicaciónTest',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
      ],
      controllers: [BodegaController],
      providers: [
        {
          provide: BodegaService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockBodega]),
            create: jest.fn().mockResolvedValue(mockBodega),
          },
        },
        AuthService,
        {
          provide: UsuarioService,
          useValue: {
            findByUsernameWithPassword: jest.fn().mockResolvedValue({
              id: 1,
              username: 'admin',
              password: 'x',
              rol: { nombre: 'ADMIN' },
            }),
          },
        },
        JwtStrategy,
        { provide: ConfigService, useValue: { get: () => 'test-secret' } },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  }, 10000);

  afterAll(async () => {
    await app.close();
  });

  it('ACEPTA GET /bodega con token ADMIN → 200 OK', async () => {
    const token = jwtService.sign({
      sub: 1,
      username: 'admin',
      rol: { nombre: 'ADMIN' },
    });
    const res = await request(app.getHttpServer())
      .get('/bodega')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toEqual([mockBodega]);
  });

  it('RECHAZA GET /bodega sin token → 401', async () => {
    await request(app.getHttpServer()).get('/bodega').expect(401);
  });

  it('RECHAZA POST /bodega con rol insuficiente → 403', async () => {
    const token = jwtService.sign({
      sub: 1,
      username: 'user',
      rol: { nombre: 'OPERARIO_PRODUCCION' },
    });
    await request(app.getHttpServer())
      .post('/bodega')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'X', ubicacion: 'Y' })
      .expect(403);
  });
});
