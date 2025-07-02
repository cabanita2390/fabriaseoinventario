import { Test, TestingModule } from '@nestjs/testing';
import { BodegaController } from '../../src/bodega/bodega.controller';
import { BodegaService } from '../../src/bodega/bodega.service';
import { CreateBodegaDto } from '../../src/bodega/dto/create-bodega.dto';
import { UpdateBodegaDto } from '../../src/bodega/dto/update-bodega.dto';

describe('BodegaController', () => {
  let controller: BodegaController;
  let service: Partial<Record<keyof BodegaService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockImplementation((dto) => ({ id: 1, ...dto })),
      findAll: jest.fn().mockResolvedValue([{ id: 1, nombre: 'Central' }]),
      findOne: jest
        .fn()
        .mockImplementation((id) => ({ id, nombre: 'Central' })),
      update: jest.fn().mockImplementation((id, dto) => ({ id, ...dto })),
      remove: jest.fn().mockResolvedValue({ deleted: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BodegaController],
      providers: [{ provide: BodegaService, useValue: service }],
    }).compile();

    controller = module.get<BodegaController>(BodegaController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debe devolver todas las bodegas', async () => {
      await expect(controller.findAll()).resolves.toEqual([
        { id: 1, nombre: 'Central' },
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('debe crear una nueva bodega', () => {
      const dto: CreateBodegaDto = { nombre: 'Nueva', ubicacion: 'Sur' };
      expect(controller.create(dto)).toEqual({ id: 1, ...dto });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('debe devolver la bodega con el id dado', () => {
      expect(controller.findOne(42)).toEqual({ id: 42, nombre: 'Central' });
      expect(service.findOne).toHaveBeenCalledWith(42);
    });
  });

  describe('update', () => {
    it('debe actualizar la bodega con el id dado', () => {
      const dto: UpdateBodegaDto = { nombre: 'Modificada', ubicacion: 'Norte' };
      expect(controller.update(99, dto)).toEqual({ id: 99, ...dto });
      expect(service.update).toHaveBeenCalledWith(99, dto);
    });
  });

  describe('remove', () => {
    it('debe eliminar la bodega con el id dado', async () => {
      await expect(controller.remove(7)).resolves.toEqual({ deleted: true });
      expect(service.remove).toHaveBeenCalledWith(7);
    });
  });
});
