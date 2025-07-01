import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ JWT_SECRET: 'test-secret' })],
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET'),
            signOptions: { expiresIn: '1h' },
          }),
          inject: [ConfigService],
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
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: UsuarioService,
          useValue: {
            findByUsernameWithPassword: jest
              .fn()
              .mockImplementation((username) => {
                if (username === 'admin') {
                  return Promise.resolve({
                    id: 1,
                    username: 'admin',
                    password: 'hashed_password',
                    rol: { nombre: 'ADMIN' },
                  });
                }
                if (username === 'operario') {
                  return Promise.resolve({
                    id: 2,
                    username: 'operario',
                    password: 'hashed_password',
                    rol: { nombre: 'OPERARIO_PRODUCCION' },
                  });
                }
                // Para cualquier otro usuario, devolver null
                return Promise.resolve(null);
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
      username: 'admin', // Este username debe coincidir con el mock
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
      sub: 2,
      username: 'operario', // Usuario diferente con rol insuficiente
      rol: { nombre: 'OPERARIO_PRODUCCION' },
    });

    const response = await request(app.getHttpServer())
      .post('/bodega')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'X', ubicacion: 'Y' });

    expect(response.status).toBe(403);
    expect(response.body.message).toContain(
      'No tienes permisos para acceder a este recurso',
    );
  });

  it('ACEPTA POST /bodega con token ADMIN → 201 Created', async () => {
    const token = jwtService.sign({
      sub: 1,
      username: 'admin', // Usuario admin con permisos
      rol: { nombre: 'ADMIN' },
    });

    const res = await request(app.getHttpServer())
      .post('/bodega')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Nueva Bodega', ubicacion: 'Nueva Ubicación' })
      .expect(201);

    expect(res.body).toEqual(mockBodega);
  });
});
