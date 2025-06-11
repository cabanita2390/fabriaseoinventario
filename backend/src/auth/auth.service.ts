// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../usuario/usuario.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usuarioService: UsuarioService) {}

  /** Crea un nuevo usuario (rol USUARIO por defecto) */
  async register(dto: RegisterDto) {
    // UsuarioService.create debe hacer hash y asignar rol
    const user = await this.usuarioService.create({
      username: dto.username,
      nombre: dto.nombre,
      password: dto.password,
    });
    // Omitimos el password antes de devolver
    const { password, ...rest } = user;
    return rest;
  }

  /** Valida credenciales y devuelve el usuario (sin password) */
  async login(dto: LoginDto) {
    const user = await this.usuarioService.findByUsernameWithPassword(
      dto.username,
    );
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const { password, ...rest } = user;
    return rest;
  }
}
