import { Test, TestingModule } from '@nestjs/testing';
import { RolController } from '../../src/rol/rol.controller';
import { RolService } from '../../src/rol/rol.service';
import { CreateRolDto } from '../../src/rol/dto/create-rol.dto';
import { UpdateRolDto } from '../../src/rol/dto/update-rol.dto';

describe('RolController', () => {
  let controller: RolController;
  let service: Partial<Record<keyof RolService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 1, nombre: 'Admin' }),
      findAll: jest.fn().mockResolvedValue([{ id: 1, nombre: 'Admin' }]),
      findOne: jest.fn().mockResolvedValue({ id: 2, nombre: 'User' }),
      update: jest.fn().mockResolvedValue({ id: 3, nombre: 'UpdatedRole' }),
      remove: jest.fn().mockResolvedValue({ deleted: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolController],
      providers: [{ provide: RolService, useValue: service }],
    }).compile();

    controller = module.get<RolController>(RolController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debe devolver todos los roles', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([{ id: 1, nombre: 'Admin' }]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('debe crear un nuevo rol', async () => {
      const dto: CreateRolDto = { nombre: 'Admin' };
      const result = await controller.create(dto);
      expect(result).toEqual({ id: 1, nombre: 'Admin' });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('debe devolver el rol con el id dado', async () => {
      const result = await controller.findOne(2);
      expect(result).toEqual({ id: 2, nombre: 'User' });
      expect(service.findOne).toHaveBeenCalledWith(2);
    });
  });

  describe('update', () => {
    it('debe actualizar el rol con el id dado', async () => {
      const dto: UpdateRolDto = { nombre: 'UpdatedRole' };
      const result = await controller.update(3, dto);
      expect(result).toEqual({ id: 3, nombre: 'UpdatedRole' });
      expect(service.update).toHaveBeenCalledWith(3, dto);
    });
  });

  describe('remove', () => {
    it('debe eliminar el rol con el id dado', async () => {
      const result = await controller.remove(4);
      expect(result).toEqual({ deleted: true });
      expect(service.remove).toHaveBeenCalledWith(4);
    });
  });
});
