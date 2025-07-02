import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';

import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { UsuarioService } from 'src/usuario/usuario.service';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

import { BodegaController } from 'src/bodega/bodega.controller';
import { BodegaService } from 'src/bodega/bodega.service';

import { ProductoController } from 'src/producto/producto.controller';
import { ProductoService } from 'src/producto/producto.service';

import { InventarioController } from 'src/inventario/inventario.controller';
import { InventarioService } from 'src/inventario/inventario.service';

import { MovimientoController } from 'src/movimiento/movimiento.controller';
import { MovimientoService } from 'src/movimiento/movimiento.service';

import { DashboardController } from 'src/dashboard/dashboard.controller';
import { DashboardService } from 'src/dashboard/dashboard.service';

describe('E2E Full-stack Flow', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({ JWT_SECRET: 'test-secret' })],
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (cs: ConfigService) => ({
            secret: cs.get('JWT_SECRET'),
            signOptions: { expiresIn: '1h' },
          }),
          inject: [ConfigService],
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
      ],
      controllers: [
        AuthController,
        BodegaController,
        ProductoController,
        InventarioController,
        MovimientoController,
        DashboardController,
      ],
      providers: [
        // AuthService stub: bypass bcrypt and JWT generation
        {
          provide: AuthService,
          useValue: {
            comparePasswords: jest.fn().mockResolvedValue(true),
            generateJwt: jest
              .fn()
              .mockImplementation((user) =>
                jwtService.sign({
                  sub: user.id,
                  username: user.username,
                  rol: user.rol,
                }),
              ),
          },
        },
        {
          provide: UsuarioService,
          useValue: {
            findByUsernameWithPassword: jest.fn().mockImplementation((user) => {
              if (user === 'admin')
                return Promise.resolve({
                  id: 1,
                  username: 'admin',
                  password: 'pass',
                  rol: { nombre: 'ADMIN' },
                });
              return Promise.resolve(null);
            }),
          },
        },
        JwtStrategy,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        // Bodega
        {
          provide: BodegaService,
          useValue: {
            create: jest
              .fn()
              .mockResolvedValue({ id: 1, nombre: 'B1', ubicacion: 'U1' }),
          },
        },
        // Producto
        {
          provide: ProductoService,
          useValue: {
            create: jest
              .fn()
              .mockResolvedValue({
                id: 2,
                nombre: 'P1',
                tipoProducto: 'MATERIA_PRIMA',
                estado: 'ACTIVO',
                presentacion_idpresentacion: 1,
                unidadmedida_idunidadmedida: 1,
                proveedor_idproveedor: 1,
              }),
          },
        },
        // Inventario
        {
          provide: InventarioService,
          useValue: {
            create: jest
              .fn()
              .mockResolvedValue({
                id: 3,
                cantidad_actual: 100,
                fecha_ultima_actualizacion: new Date().toISOString(),
                producto_idproducto: 2,
                bodega_idbodega: 1,
              }),
          },
        },
        // Movimiento
        {
          provide: MovimientoService,
          useValue: {
            create: jest
              .fn()
              .mockResolvedValue({
                id: 4,
                tipo: 'INGRESO',
                cantidad: 10,
                producto_idproducto: 2,
                bodega_idbodega: 1,
              }),
          },
        },
        // Dashboard
        {
          provide: DashboardService,
          useValue: {
            getDashboardData: jest
              .fn()
              .mockResolvedValue({
                totalMovimientosHoy: 1,
                productosBajoStock: [],
                top5ProductosMasBajoStock: [],
                ultimosMovimientos: [],
              }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  }, 20000);

  afterAll(async () => {
    await app.close();
  });

  it('executes full flow: login → CRUD → dashboard', async () => {
    // 1. login
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'pass' })
      .expect(201);
    const token = loginRes.body.access_token;

    const authHeader = { Authorization: `Bearer ${token}` };

    // 2. create bodega
    await request(app.getHttpServer())
      .post('/bodega')
      .set(authHeader)
      .send({ nombre: 'B1', ubicacion: 'U1' })
      .expect(201);

    // 3. create producto
    await request(app.getHttpServer())
      .post('/producto')
      .set(authHeader)
      .send({
        nombre: 'P1',
        tipoProducto: 'MATERIA_PRIMA',
        estado: 'ACTIVO',
        presentacion_idpresentacion: 1,
        unidadmedida_idunidadmedida: 1,
        proveedor_idproveedor: 1,
      })
      .expect(201);

    // 4. create inventario
    await request(app.getHttpServer())
      .post('/inventario')
      .set(authHeader)
      .send({
        cantidad_actual: 100,
        fecha_ultima_actualizacion: new Date().toISOString(),
        producto_idproducto: 2,
        bodega_idbodega: 1,
      })
      .expect(201);

    // 5. create movimiento
    await request(app.getHttpServer())
      .post('/movimiento')
      .set(authHeader)
      .send({
        tipo: 'INGRESO',
        cantidad: 10,
        producto_idproducto: 2,
        bodega_idbodega: 1,
      })
      .expect(201);

    // 6. dashboard
    const dashRes = await request(app.getHttpServer())
      .get('/dashboard')
      .set(authHeader)
      .expect(200);

    expect(dashRes.body.totalMovimientosHoy).toBe(1);
  });
});
