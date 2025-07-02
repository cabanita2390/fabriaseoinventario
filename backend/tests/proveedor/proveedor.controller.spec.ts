import { Test, TestingModule } from '@nestjs/testing';
import { ProveedorController } from '../../src/proveedor/proveedor.controller';
import { ProveedorService } from '../../src/proveedor/proveedor.service';
import { CreateProveedorDto } from '../../src/proveedor/dto/create-proveedor.dto';
import { UpdateProveedorDto } from '../../src/proveedor/dto/update-proveedor.dto';

describe('ProveedorController', () => {
  let controller: ProveedorController;
  let service: Partial<Record<keyof ProveedorService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockImplementation((dto) => ({ id: 1, ...dto })),
      findAll: jest
        .fn()
        .mockResolvedValue([
          {
            id: 1,
            nombre: 'Proveedor1',
            telefono: '1234567890',
            email: 'p1@example.com',
            direccion: 'Calle 1',
          },
        ]),
      findOne: jest
        .fn()
        .mockImplementation((id) => ({
          id,
          nombre: 'Proveedor2',
          telefono: '0987654321',
          email: 'p2@example.com',
          direccion: 'Calle 2',
        })),
      update: jest.fn().mockImplementation((id, dto) => ({ id, ...dto })),
      remove: jest.fn().mockResolvedValue({ deleted: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProveedorController],
      providers: [{ provide: ProveedorService, useValue: service }],
    }).compile();

    controller = module.get<ProveedorController>(ProveedorController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debe devolver todos los proveedores', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([
        {
          id: 1,
          nombre: 'Proveedor1',
          telefono: '1234567890',
          email: 'p1@example.com',
          direccion: 'Calle 1',
        },
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('debe crear un nuevo proveedor', async () => {
      const dto: CreateProveedorDto = {
        nombre: 'ProveedorX',
        telefono: '111222333',
        email: 'px@example.com',
        direccion: 'Calle X',
      };
      const result = await controller.create(dto);
      expect(result).toEqual({ id: 1, ...dto });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('debe devolver el proveedor con el id dado', async () => {
      const result = await controller.findOne(42);
      expect(result).toEqual({
        id: 42,
        nombre: 'Proveedor2',
        telefono: '0987654321',
        email: 'p2@example.com',
        direccion: 'Calle 2',
      });
      expect(service.findOne).toHaveBeenCalledWith(42);
    });
  });

  describe('update', () => {
    it('debe actualizar el proveedor con el id dado', async () => {
      const dto: UpdateProveedorDto = { telefono: '000999888' };
      const result = await controller.update(99, dto);
      expect(result).toEqual({ id: 99, ...dto });
      expect(service.update).toHaveBeenCalledWith(99, dto);
    });
  });

  describe('remove', () => {
    it('debe eliminar el proveedor con el id dado', async () => {
      const result = await controller.remove(7);
      expect(result).toEqual({ deleted: true });
      expect(service.remove).toHaveBeenCalledWith(7);
    });
  });
});
