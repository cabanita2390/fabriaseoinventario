import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { BodegaService } from 'src/bodega/bodega.service';
import { ProductoService } from 'src/producto/producto.service';
import { MovimientoService } from 'src/movimiento/movimiento.service';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

// Guard que siempre permite todas las peticiones
class AlwaysAllowGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

describe('Flujo E2E: Inventario completo', () => {
  let app: INestApplication;

  const mockBodega = {
    id: 1,
    nombre: 'BodegaTest',
    ubicacion: 'UbicaciónTest',
  };
  const mockProducto = {
    id: 2,
    nombre: 'ProdTest',
    tipoProducto: 'MATERIA_PRIMA',
    subtipoInsumo: undefined,
    estado: 'ACTIVO',
    presentacion_idpresentacion: 0,
    unidadmedida_idunidadmedida: 0,
    proveedor_idproveedor: 0,
  };
  const mockMovimiento = {
    id: 3,
    tipo: 'INGRESO',
    cantidad: 5,
    descripcion: 'DescTest',
    producto_idproducto: mockProducto.id,
    bodega_idbodega: mockBodega.id,
  };
  const mockDashboard = {
    totalMovimientosHoy: 1,
    productosBajoStock: [],
    top5ProductosMasBajoStock: [],
    ultimosMovimientos: [],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BodegaService)
      .useValue({ create: jest.fn().mockResolvedValue(mockBodega) })
      .overrideProvider(ProductoService)
      .useValue({ create: jest.fn().mockResolvedValue(mockProducto) })
      .overrideProvider(MovimientoService)
      .useValue({ create: jest.fn().mockResolvedValue(mockMovimiento) })
      .overrideProvider(DashboardService)
      .useValue({
        getDashboardData: jest.fn().mockResolvedValue(mockDashboard),
      })
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

  it('debe cumplir el flujo completo: bodega, producto, movimiento, dashboard', async () => {
    // Crear bodega
    const resBodega = await request(app.getHttpServer())
      .post('/bodega')
      .send({ nombre: mockBodega.nombre, ubicacion: mockBodega.ubicacion })
      .expect(201);
    expect(resBodega.body).toEqual(mockBodega);

    // Crear producto
    const resProducto = await request(app.getHttpServer())
      .post('/producto')
      .send({
        nombre: mockProducto.nombre,
        tipoProducto: mockProducto.tipoProducto,
        estado: mockProducto.estado,
        presentacion_idpresentacion: mockProducto.presentacion_idpresentacion,
        unidadmedida_idunidadmedida: mockProducto.unidadmedida_idunidadmedida,
        proveedor_idproveedor: mockProducto.proveedor_idproveedor,
      })
      .expect(201);
    expect(resProducto.body).toEqual(mockProducto);

    // Crear movimiento
    const resMov = await request(app.getHttpServer())
      .post('/movimiento')
      .send({
        tipo: mockMovimiento.tipo,
        cantidad: mockMovimiento.cantidad,
        descripcion: mockMovimiento.descripcion,
        producto_idproducto: mockMovimiento.producto_idproducto,
        bodega_idbodega: mockMovimiento.bodega_idbodega,
      })
      .expect(201);
    expect(resMov.body).toEqual(mockMovimiento);

    // Consultar dashboard
    const resDash = await request(app.getHttpServer())
      .get('/dashboard')
      .expect(200);
    expect(resDash.body).toEqual(mockDashboard);
  });
});
