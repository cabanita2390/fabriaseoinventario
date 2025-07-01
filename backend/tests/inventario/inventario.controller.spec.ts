import { Test, TestingModule } from '@nestjs/testing';
import { InventarioController } from '../../src/inventario/inventario.controller';
import { InventarioService } from '../../src/inventario/inventario.service';
import { CreateInventarioDto } from '../../src/inventario/dto/create-inventario.dto';
import { UpdateInventarioDto } from '../../src/inventario/dto/update-inventario.dto';

describe('InventarioController', () => {
  let controller: InventarioController;
  let service: Partial<Record<keyof InventarioService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockImplementation(dto => ({ id: 1, ...dto })),
      findAll: jest.fn().mockResolvedValue([
        { id: 1, cantidad_actual: 10, fecha_ultima_actualizacion: '2025-07-01T00:00:00.000Z', producto_idproducto: 2, bodega_idbodega: 3 },
      ]),
      findOne: jest.fn().mockImplementation(id => ({ id, cantidad_actual: 10, fecha_ultima_actualizacion: '2025-07-01T00:00:00.000Z', producto_idproducto: 2, bodega_idbodega: 3 })),
      update: jest.fn().mockImplementation((id, dto) => ({ id, ...dto })),
      remove: jest.fn().mockResolvedValue({ deleted: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventarioController],
      providers: [{ provide: InventarioService, useValue: service }],
    }).compile();

    controller = module.get<InventarioController>(InventarioController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debe devolver todos los inventarios', async () => {
      await expect(controller.findAll()).resolves.toEqual([
        { id: 1, cantidad_actual: 10, fecha_ultima_actualizacion: '2025-07-01T00:00:00.000Z', producto_idproducto: 2, bodega_idbodega: 3 },
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('debe crear un nuevo inventario', () => {
      const dto: CreateInventarioDto = { cantidad_actual: 5, fecha_ultima_actualizacion: '2025-07-01T00:00:00.000Z', producto_idproducto: 2, bodega_idbodega: 3 };
      expect(controller.create(dto)).toEqual({ id: 1, ...dto });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('debe devolver el inventario con el id dado', () => {
      expect(controller.findOne(42)).toEqual({ id: 42, cantidad_actual: 10, fecha_ultima_actualizacion: '2025-07-01T00:00:00.000Z', producto_idproducto: 2, bodega_idbodega: 3 });
      expect(service.findOne).toHaveBeenCalledWith(42);
    });
  });

  describe('update', () => {
    it('debe actualizar el inventario con el id dado', () => {
      const dto: UpdateInventarioDto = { cantidad_actual: 15 };
      expect(controller.update(99, dto)).toEqual({ id: 99, ...dto });
      expect(service.update).toHaveBeenCalledWith(99, dto);
    });
  });

  describe('remove', () => {
    it('debe eliminar el inventario con el id dado', async () => {
      await expect(controller.remove(7)).resolves.toEqual({ deleted: true });
      expect(service.remove).toHaveBeenCalledWith(7);
    });
  });
});
