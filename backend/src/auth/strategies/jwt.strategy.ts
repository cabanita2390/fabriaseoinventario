// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioService } from '../../usuario/usuario.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly configService: ConfigService, // Para acceder al JWT_SECRET si quieres manejarlo como variable de entorno
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Expiración activa
      secretOrKey: configService.get('JWT_SECRET') || 'secreto', // Cambia esto por una variable real si usas dotenv
    });
  }

  async validate(payload: any) {
    const usuario = await this.usuarioService.findByUsernameWithPassword(
      payload.username,
    );

    if (!usuario) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    // Retornamos el usuario sin el password
    const { password, ...result } = usuario;
    return result;
  }
}
