import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { UsuarioService } from '../../src/usuario/usuario.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<Record<keyof AuthService, jest.Mock>>;
  let usuarioService: Partial<Record<keyof UsuarioService, jest.Mock>>;

  beforeEach(async () => {
    authService = {
      comparePasswords: jest.fn(),
      generateJwt: jest.fn(),
    };
    usuarioService = {
      findByUsernameWithPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsuarioService, useValue: usuarioService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const username = 'user1';
    const password = 'pass';
    const hashedPassword = 'hashed';
    const userEntity = {
      id: 1,
      username,
      password: hashedPassword,
      rol: { nombre: 'ADMIN' },
      email: 'a@b',
      nombre: 'User',
    };

    it('lanza UnauthorizedException si no existe el usuario', async () => {
      usuarioService.findByUsernameWithPassword!.mockResolvedValue(null);

      await expect(controller.login({ username, password }))
        .rejects
        .toThrow(UnauthorizedException);

      expect(usuarioService.findByUsernameWithPassword)
        .toHaveBeenCalledWith(username);
    });

    it('lanza UnauthorizedException si la contraseña es inválida', async () => {
      usuarioService.findByUsernameWithPassword!.mockResolvedValue(userEntity);
      authService.comparePasswords!.mockResolvedValue(false);

      await expect(controller.login({ username, password }))
        .rejects
        .toThrow(UnauthorizedException);

      expect(authService.comparePasswords)
        .toHaveBeenCalledWith(password, hashedPassword);
    });

    it('retorna user y access_token si credenciales válidas', async () => {
      usuarioService.findByUsernameWithPassword!.mockResolvedValue(userEntity);
      authService.comparePasswords!.mockResolvedValue(true);
      authService.generateJwt!.mockResolvedValue('token123');

      const result = await controller.login({ username, password });

      expect(result).toEqual({
        user: {
          id: 1,
          username,
          rol: { nombre: 'ADMIN' },
          email: 'a@b',
          nombre: 'User',
        },
        access_token: 'token123',
      });

      expect(authService.generateJwt)
        .toHaveBeenCalledWith(userEntity);
    });
  });
});
