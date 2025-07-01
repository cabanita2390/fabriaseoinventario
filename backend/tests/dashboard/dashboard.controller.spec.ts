import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from '../../src/dashboard/dashboard.controller';
import { DashboardService } from '../../src/dashboard/dashboard.service';
import { DashboardResponseDto } from '../../src/dashboard/dto/dashboard-response.dto';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: Partial<Record<keyof DashboardService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      getDashboardData: jest.fn().mockResolvedValue({
        totalMovimientosHoy: 12,
        productosBajoStock: [{ id: 1, nombre: 'Central', cantidadActual: 3 }],
        top5ProductosMasBajoStock: [{ nombre: 'Central', totalStock: 3 }],
        ultimosMovimientos: [
          {
            id: 1,
            tipo: 'ENTRADA',
            cantidad: 5,
            fechaMovimiento: '2025-07-01T00:00:00.000Z',
            descripcion: 'Test',
            producto: { id: 1, nombre: 'Central' },
            bodega: { id: 1, nombre: 'Central' },
          },
        ],
      } as DashboardResponseDto),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: service }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('debe devolver el DTO con los datos del dashboard', async () => {
      const esperado: DashboardResponseDto = {
        totalMovimientosHoy: 12,
        productosBajoStock: [{ id: 1, nombre: 'Central', cantidadActual: 3 }],
        top5ProductosMasBajoStock: [{ nombre: 'Central', totalStock: 3 }],
        ultimosMovimientos: [
          {
            id: 1,
            tipo: 'ENTRADA',
            cantidad: 5,
            fechaMovimiento: '2025-07-01T00:00:00.000Z',
            descripcion: 'Test',
            producto: { id: 1, nombre: 'Central' },
            bodega: { id: 1, nombre: 'Central' },
          },
        ],
      };
      await expect(controller.getDashboard()).resolves.toEqual(esperado);
      expect(service.getDashboardData).toHaveBeenCalled();
    });
  });
});
