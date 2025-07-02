import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from 'src/usuario/usuario.controller';
import { UsuarioService } from 'src/usuario/usuario.service';
import { CreateUsuarioDto } from 'src/usuario/dto/create-usuario.dto';
import { UpdateUsuarioDto } from 'src/usuario/dto/update-usuario.dto';

describe('UsuarioController', () => {
  let controller: UsuarioController;
  let service: Partial<Record<keyof UsuarioService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({
        id: 1,
        username: 'user1',
        nombre: 'User One',
        email: 'u1@test.com',
        rol: { nombre: 'ADMIN' },
      }),
      findAll: jest
        .fn()
        .mockResolvedValue([
          {
            id: 1,
            username: 'user1',
            nombre: 'User One',
            email: 'u1@test.com',
            rol: { nombre: 'ADMIN' },
          },
        ]),
      findOne: jest.fn().mockResolvedValue({
        id: 2,
        username: 'user2',
        nombre: 'User Two',
        email: 'u2@test.com',
        rol: { nombre: 'OPERARIO_PRODUCCION' },
      }),
      update: jest.fn().mockResolvedValue({
        id: 3,
        username: 'user3',
        nombre: 'User Three',
        email: 'u3@test.com',
        rol: { nombre: 'OPERARIO_PRODUCCION' },
      }),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [{ provide: UsuarioService, useValue: service }],
    }).compile();

    controller = module.get<UsuarioController>(UsuarioController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debe devolver todos los usuarios', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([
        {
          id: 1,
          username: 'user1',
          nombre: 'User One',
          email: 'u1@test.com',
          rol: { nombre: 'ADMIN' },
        },
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('debe crear un nuevo usuario', async () => {
      const dto: CreateUsuarioDto = {
        username: 'userX',
        nombre: 'User X',
        email: 'ux@test.com',
        password: 'pass123',
      };
      const created = await controller.create(dto);
      expect(created).toEqual({
        id: 1,
        username: 'user1',
        nombre: 'User One',
        email: 'u1@test.com',
        rol: { nombre: 'ADMIN' },
      });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('debe devolver el usuario con el id dado', async () => {
      const result = await controller.findOne(2);
      expect(result).toEqual({
        id: 2,
        username: 'user2',
        nombre: 'User Two',
        email: 'u2@test.com',
        rol: { nombre: 'OPERARIO_PRODUCCION' },
      });
      expect(service.findOne).toHaveBeenCalledWith(2);
    });
  });

  describe('update', () => {
    it('debe actualizar el usuario con el id dado', async () => {
      const dto: UpdateUsuarioDto = { nombre: 'Updated Name' };
      const result = await controller.update(3, dto);
      expect(result).toEqual({
        id: 3,
        username: 'user3',
        nombre: 'User Three',
        email: 'u3@test.com',
        rol: { nombre: 'OPERARIO_PRODUCCION' },
      });
      expect(service.update).toHaveBeenCalledWith(3, dto);
    });
  });

  describe('remove', () => {
    it('debe eliminar el usuario con el id dado', async () => {
      const result = await controller.remove(4);
      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(4);
    });
  });
});
