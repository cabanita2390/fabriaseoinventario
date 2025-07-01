import { Test, TestingModule } from '@nestjs/testing';
import { UnidadmedidaController } from 'src/unidadmedida/unidadmedida.controller';
import { UnidadmedidaService } from 'src/unidadmedida/unidadmedida.service';
import { CreateUnidadmedidaDto } from 'src/unidadmedida/dto/create-unidadmedida.dto';
import { UpdateUnidadmedidaDto } from 'src/unidadmedida/dto/update-unidadmedida.dto';

describe('UnidadmedidaController', () => {
  let controller: UnidadmedidaController;
  let service: Partial<Record<keyof UnidadmedidaService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 1, nombre: 'Kilogramo' }),
      findAll: jest.fn().mockResolvedValue([{ id: 1, nombre: 'Kilogramo' }]),
      findOne: jest.fn().mockResolvedValue({ id: 2, nombre: 'Litro' }),
      update: jest.fn().mockResolvedValue({ id: 3, nombre: 'Metro' }),
      remove: jest.fn().mockResolvedValue({ deleted: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnidadmedidaController],
      providers: [{ provide: UnidadmedidaService, useValue: service }],
    }).compile();

    controller = module.get<UnidadmedidaController>(UnidadmedidaController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debe devolver todas las unidades de medida', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([{ id: 1, nombre: 'Kilogramo' }]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('debe crear una nueva unidad de medida', async () => {
      const dto: CreateUnidadmedidaDto = { nombre: 'Gramo' };
      const result = await controller.create(dto);
      expect(result).toEqual({ id: 1, nombre: 'Kilogramo' });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('debe devolver la unidad de medida con el id dado', async () => {
      const result = await controller.findOne(2);
      expect(result).toEqual({ id: 2, nombre: 'Litro' });
      expect(service.findOne).toHaveBeenCalledWith(2);
    });
  });

  describe('update', () => {
    it('debe actualizar la unidad de medida con el id dado', async () => {
      const dto: UpdateUnidadmedidaDto = { nombre: 'Mililitro' };
      const result = await controller.update(3, dto);
      expect(result).toEqual({ id: 3, nombre: 'Metro' });
      expect(service.update).toHaveBeenCalledWith(3, dto);
    });
  });

  describe('remove', () => {
    it('debe eliminar la unidad de medida con el id dado', async () => {
      const result = await controller.remove(4);
      expect(result).toEqual({ deleted: true });
      expect(service.remove).toHaveBeenCalledWith(4);
    });
  });
});
