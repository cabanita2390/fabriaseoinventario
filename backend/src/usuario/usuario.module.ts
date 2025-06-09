// src/usuario/usuario.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario } from 'src/entities/usuario.entity';
import { Rol } from 'src/entities/rol.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario, // para inyectar UsuarioRepository
      Rol, // para inyectar RolRepository
    ]),
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
})
export class UsuarioModule {}
