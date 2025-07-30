// src/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsuarioService } from '../usuario/usuario.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuarioService: UsuarioService,
  ) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const { username, password } = body;

    // Validar credenciales
    const usuario =
      await this.usuarioService.findByUsernameWithPassword(username);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await this.authService.comparePasswords(
      password,
      usuario.password,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token
    const token = await this.authService.generateJwt(usuario);

    // Excluir el password
    const { password: _, ...usuarioSinPassword } = usuario;

    return {
      user: usuarioSinPassword,
      access_token: token,
    };
  }
}
