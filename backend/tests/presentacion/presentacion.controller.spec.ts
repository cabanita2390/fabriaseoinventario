import { Test, TestingModule } from '@nestjs/testing';
import { PresentacionController } from '../../src/presentacion/presentacion.controller';
import { PresentacionService } from '../../src/presentacion/presentacion.service';
import { CreatePresentacionDto } from '../../src/presentacion/dto/create-presentacion.dto';
import { UpdatePresentacionDto } from '../../src/presentacion/dto/update-presentacion.dto';

describe('PresentacionController', () => {
  let controller: PresentacionController;
  let service: Partial<Record<keyof PresentacionService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockImplementation(dto => ({ id: 1, ...dto })),
      findAll: jest.fn().mockResolvedValue([
        { id: 1, nombre: 'Caja Grande' },
      ]),
      findOne: jest.fn().mockImplementation(id => ({ id, nombre: 'Caja Mediana' })),
      update: jest.fn().mockImplementation((id, dto) => ({ id, ...dto })),
      remove: jest.fn().mockResolvedValue({ deleted: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PresentacionController],
      providers: [{ provide: PresentacionService, useValue: service }],
    }).compile();

    controller = module.get<PresentacionController>(PresentacionController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debe devolver todas las presentaciones', async () => {
      await expect(controller.findAll()).resolves.toEqual([
        { id: 1, nombre: 'Caja Grande' },
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('debe crear una nueva presentacion', async () => {
      const dto: CreatePresentacionDto = { nombre: 'Sobre Pequeño' };
      await expect(controller.create(dto)).resolves.toEqual({ id: 1, ...dto });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('debe devolver la presentacion con el id dado', async () => {
      await expect(controller.findOne(42)).resolves.toEqual({ id: 42, nombre: 'Caja Mediana' });
      expect(service.findOne).toHaveBeenCalledWith(42);
    });
  });

  describe('update', () => {
    it('debe actualizar la presentacion con el id dado', async () => {
      const dto: UpdatePresentacionDto = { nombre: 'Caja Pequeña' };
      await expect(controller.update(99, dto)).resolves.toEqual({ id: 99, ...dto });
      expect(service.update).toHaveBeenCalledWith(99, dto);
    });
  });

  describe('remove', () => {
    it('debe eliminar la presentacion con el id dado', async () => {
      await expect(controller.remove(7)).resolves.toEqual({ deleted: true });
      expect(service.remove).toHaveBeenCalledWith(7);
    });
  });
});
