import { Test, TestingModule } from '@nestjs/testing';
import { MovimientoController } from '../../src/movimiento/movimiento.controller';
import { MovimientoService } from '../../src/movimiento/movimiento.service';
import {
  CreateMovimientoDto,
  TipoMovimiento,
} from '../../src/movimiento/dto/create-movimiento.dto';
import { UpdateMovimientoDto } from '../../src/movimiento/dto/update-movimiento.dto';

describe('MovimientoController', () => {
  let controller: MovimientoController;
  let service: Partial<Record<keyof MovimientoService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockImplementation((dto) => ({ id: 1, ...dto })),
      findAll: jest.fn().mockResolvedValue([
        {
          id: 1,
          tipo: TipoMovimiento.INGRESO,
          cantidad: 10,
          descripcion: 'desc',
          producto_idproducto: 2,
          bodega_idbodega: 3,
        },
      ]),
      findOne: jest.fn().mockImplementation((id) => ({
        id,
        tipo: TipoMovimiento.EGRESO,
        cantidad: 5,
        descripcion: undefined,
        producto_idproducto: 2,
        bodega_idbodega: 3,
      })),
      update: jest.fn().mockImplementation((id, dto) => ({ id, ...dto })),
      remove: jest.fn().mockResolvedValue({ deleted: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovimientoController],
      providers: [{ provide: MovimientoService, useValue: service }],
    }).compile();

    controller = module.get<MovimientoController>(MovimientoController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debe devolver todos los movimientos', async () => {
      await expect(controller.findAll()).resolves.toEqual([
        {
          id: 1,
          tipo: TipoMovimiento.INGRESO,
          cantidad: 10,
          descripcion: 'desc',
          producto_idproducto: 2,
          bodega_idbodega: 3,
        },
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('debe crear un nuevo movimiento', () => {
      const dto: CreateMovimientoDto = {
        tipo: TipoMovimiento.EGRESO,
        cantidad: 3,
        descripcion: 'hola',
        producto_idproducto: 2,
        bodega_idbodega: 3,
      };
      expect(controller.create(dto)).toEqual({ id: 1, ...dto });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('debe devolver el movimiento con el id dado', () => {
      expect(controller.findOne(42)).toEqual({
        id: 42,
        tipo: TipoMovimiento.EGRESO,
        cantidad: 5,
        descripcion: undefined,
        producto_idproducto: 2,
        bodega_idbodega: 3,
      });
      expect(service.findOne).toHaveBeenCalledWith(42);
    });
  });

  describe('update', () => {
    it('debe actualizar el movimiento con el id dado', () => {
      const dto: UpdateMovimientoDto = { cantidad: 7 };
      expect(controller.update(99, dto)).toEqual({ id: 99, ...dto });
      expect(service.update).toHaveBeenCalledWith(99, dto);
    });
  });

  describe('remove', () => {
    it('debe eliminar el movimiento con el id dado', async () => {
      await expect(controller.remove(7)).resolves.toEqual({ deleted: true });
      expect(service.remove).toHaveBeenCalledWith(7);
    });
  });
});
