/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/usuario/usuario.service.ts
import {
  Injectable,
  // NotFoundException,
  // BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { Repository, QueryFailedError } from 'typeorm';
// import { CreateUsuarioDto } from './dto/create-usuario.dto';
// import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from '../entities/usuario.entity';
// import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  // private async hashPassword(password: string): Promise<string> {
  //   const salt = await bcrypt.genSalt(10);
  //   return bcrypt.hash(password, salt);
  // }

  // async create(dto: CreateUsuarioDto): Promise<any> {
  //   // 1) Hashear la contraseña
  //   const passwordHash = await this.hashPassword(dto.password);

  //   // 2) Crear entidad
  //   const entidad = this.usuarioRepo.create({
  //     nombre: dto.nombre,
  //     email: dto.email,
  //     password: passwordHash,
  //     rol: { id: dto.rol_idrol },
  //   });

  //   let guardado: Usuario;
  //   try {
  //     guardado = await this.usuarioRepo.save(entidad);
  //   } catch (error) {
  //     // Si la violación de llave foránea (rol no existe):
  //     if (
  //       error instanceof QueryFailedError &&
  //       (error as any).code === '23503'
  //     ) {
  //       throw new BadRequestException(
  //         `No existe un rol con id = ${dto.rol_idrol}`,
  //       );
  //     }
  //     // Si la restricción de unicidad de email falla:
  //     if (
  //       error instanceof QueryFailedError &&
  //       (error as any).code === '23505'
  //     ) {
  //       throw new BadRequestException(
  //         `Ya existe un usuario con el email = ${dto.email}`,
  //       );
  //     }
  //     throw error;
  //   }

  //   // 3) Recargar para incluir relación a Rol (eager: true ya la carga),
  //   //    y NO incluir la contraseña en la respuesta.
  //   const completo = await this.usuarioRepo.findOne({
  //     where: { id: guardado.id },
  //     relations: ['rol'],
  //   });
  //   if (!completo) {
  //     throw new NotFoundException(
  //       `Usuario con id ${guardado.id} no encontrado después de guardar`,
  //     );
  //   }

  //   // 4) Omitir password del JSON de respuesta
  //   const { password, ...sinPassword } = completo;
  //   return sinPassword;
  // }

  // async findAll(): Promise<any[]> {
  //   const lista = await this.usuarioRepo.find({ relations: ['rol'] });
  //   return lista.map((u) => {
  //     const { password, ...sinPassword } = u;
  //     return sinPassword;
  //   });
  // }

  // async findOne(id: number): Promise<any> {
  //   const entidad = await this.usuarioRepo.findOne({
  //     where: { id },
  //     relations: ['rol'],
  //   });
  //   if (!entidad) {
  //     throw new NotFoundException(`Usuario con id ${id} no encontrado`);
  //   }
  //   const { password, ...sinPassword } = entidad;
  //   return sinPassword;
  // }

  // async update(id: number, dto: UpdateUsuarioDto): Promise<any> {
  //   // Si viene contraseña, rehashémosla:
  //   if (dto.password) {
  //     dto.password = await this.hashPassword(dto.password);
  //   }

  //   const entidad = await this.usuarioRepo.preload({
  //     id,
  //     ...dto,
  //     // Si vino rol_idrol reemplazamos la relación:
  //     ...(dto.rol_idrol ? { rol: { id: dto.rol_idrol } } : {}),
  //   });
  //   if (!entidad) {
  //     throw new NotFoundException(`Usuario con id ${id} no encontrado`);
  //   }

  //   try {
  //     await this.usuarioRepo.save(entidad);
  //   } catch (error) {
  //     if (
  //       error instanceof QueryFailedError &&
  //       (error as any).code === '23503'
  //     ) {
  //       throw new BadRequestException(
  //         `No existe un rol con id = ${dto.rol_idrol}`,
  //       );
  //     }
  //     if (
  //       error instanceof QueryFailedError &&
  //       (error as any).code === '23505'
  //     ) {
  //       throw new BadRequestException(
  //         `Ya existe un usuario con el email = ${dto.email}`,
  //       );
  //     }
  //     throw error;
  //   }

  //   const actualizado = await this.usuarioRepo.findOne({
  //     where: { id },
  //     relations: ['rol'],
  //   });
  //   if (!actualizado) {
  //     throw new NotFoundException(
  //       `Usuario con id ${id} no encontrado después de actualizar`,
  //     );
  //   }
  //   const { password, ...sinPassword } = actualizado;
  //   return sinPassword;
  // }

  // async remove(id: number): Promise<void> {
  //   const entidad = await this.usuarioRepo.findOne({ where: { id } });
  //   if (!entidad) {
  //     throw new NotFoundException(`Usuario con id ${id} no encontrado`);
  //   }
  //   await this.usuarioRepo.remove(entidad);
  // }
}
