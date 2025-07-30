// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async generateJwt(usuario: Usuario): Promise<string> {
    const payload = {
      sub: usuario.id,
      username: usuario.username,
      rol: usuario.rol?.nombre,
    };
    return this.jwtService.signAsync(payload);
  }
}
