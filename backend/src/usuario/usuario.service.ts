/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/usuario/usuario.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import type { FindOneOptions } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
  ) {}

  // 👉 Función auxiliar para hashear la contraseña
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // 👉 Crear un nuevo usuario
  async create(dto: CreateUsuarioDto): Promise<any> {
    const passwordHash = await this.hashPassword(dto.password);

    const rolPorDefecto = await this.rolRepo.findOne({
      where: { nombre: 'OPERARIO_PRODUCCION' },
    });
    if (!rolPorDefecto) {
      throw new BadRequestException(
        `El rol por defecto "USUARIO" no existe en la base de datos`,
      );
    }

    const usuarioEntity = this.usuarioRepo.create({
      username: dto.username,
      nombre: dto.nombre ?? dto.username,
      email: dto.email,
      password: passwordHash,
      rol: rolPorDefecto,
    });

    let guardado: Usuario;
    try {
      guardado = await this.usuarioRepo.save(usuarioEntity);
    } catch (error) {
      // 👉 Manejo de error por username o email duplicado
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        throw new BadRequestException(
          `El username o email ya están registrados`,
        );
      }
      throw error;
    }

    const completo = await this.usuarioRepo.findOne({
      where: { id: guardado.id },
      relations: ['rol'],
    });
    if (!completo) {
      throw new NotFoundException(
        `Usuario con id ${guardado.id} no encontrado después de guardar`,
      );
    }
    const { password, ...sinPassword } = completo;
    return sinPassword;
  }

  // 👉 Listar todos los usuarios sin mostrar contraseñas
  async findAll(): Promise<any[]> {
    const lista = await this.usuarioRepo.find({ relations: ['rol'] });
    return lista.map((u) => {
      const { password, ...sinPassword } = u;
      return sinPassword;
    });
  }

  // 👉 Obtener usuario por ID sin mostrar contraseña
  async findOne(id: number): Promise<any> {
    const entidad = await this.usuarioRepo.findOne({
      where: { id },
      relations: ['rol'],
    });
    if (!entidad) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    const { password, ...sinPassword } = entidad;
    return sinPassword;
  }

  // 👉 Actualizar usuario (nombre, email o contraseña)
  async update(id: number, dto: UpdateUsuarioDto): Promise<any> {
    // 1) Si viene rol_idrol, búscalo (puede devolver null)
    let rolEntity: Rol | null = null;
    if (dto.rol_idrol !== undefined) {
      rolEntity = await this.rolRepo.findOne({ where: { id: dto.rol_idrol } });
      if (!rolEntity) {
        throw new BadRequestException(
          `El rol con id ${dto.rol_idrol} no existe`,
        );
      }
    }

    // 2) Preloadizar al usuario, inyectando la relación sólo si la tenemos
    const entidad = await this.usuarioRepo.preload({
      id,
      ...dto,
      ...(rolEntity ? { rol: rolEntity } : {}),
    } as any);

    if (!entidad) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    // 3) Guardar cambios
    try {
      await this.usuarioRepo.save(entidad);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        throw new BadRequestException(
          `El username o email ya están registrados`,
        );
      }
      throw error;
    }

    // 4) Volver a cargar para devolver sin password
    const actualizado = await this.usuarioRepo.findOne({
      where: { id },
      relations: ['rol'],
    });
    if (!actualizado) {
      throw new NotFoundException(
        `Usuario con id ${id} no encontrado después de actualizar`,
      );
    }

    // 5) TS aún cree que puede ser null, así que usa ! para afirmar “no es null”
    const { password, ...sinPassword } = actualizado!;

    return sinPassword;
  }

  // 👉 Eliminar usuario por ID
  async remove(id: number): Promise<void> {
    const entidad = await this.usuarioRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    await this.usuarioRepo.remove(entidad);
  }

  // 👉 Buscar usuario por username (incluye hash de la contraseña)
  async findByUsernameWithPassword(
    username: string,
    options?: FindOneOptions<Usuario>,
  ) {
    return this.usuarioRepo.findOne({
      where: { username },
      relations: ['rol'],
    });
  }
}
