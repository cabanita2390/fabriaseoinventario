// src/usuario/usuario.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
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

  // 1) Función auxiliar para hashear la contraseña
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Crear un nuevo usuario.
   * - Asigna siempre el rol por defecto "USUARIO".
   * - No se recibe rol en el DTO.
   * - Hashea la contraseña.
   * - Maneja email duplicado.
   */
  async create(dto: CreateUsuarioDto): Promise<any> {
    // 1.1) Hashear contraseña
    const passwordHash = await this.hashPassword(dto.password);

    // 1.2) Obtener el rol por defecto "USUARIO"
    const rolPorDefecto = await this.rolRepo.findOne({
      where: { nombre: 'USUARIO' },
    });
    if (!rolPorDefecto) {
      throw new BadRequestException(
        `El rol por defecto "USUARIO" no existe en la base de datos`,
      );
    }

    // 1.3) Crear la entidad Usuario
    const usuarioEntity = this.usuarioRepo.create({
      nombre: dto.nombre,
      email: dto.email,
      password: passwordHash,
      rol: rolPorDefecto,
    });

    let guardado: Usuario;
    try {
      guardado = await this.usuarioRepo.save(usuarioEntity);
    } catch (error) {
      // Código 23505 = email duplicado
      if (error instanceof QueryFailedError && (error as any).code === '23505') {
        throw new BadRequestException(
          `Ya existe un usuario con el email = ${dto.email}`,
        );
      }
      throw error;
    }

    // 1.4) Recargar para incluir "rol" y eliminar "password" de la respuesta
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

  /**
   * Listar todos los usuarios.
   * - Incluye el objeto "rol".
   * - Omite la propiedad "password".
   */
  async findAll(): Promise<any[]> {
    const lista = await this.usuarioRepo.find({ relations: ['rol'] });
    return lista.map((u) => {
      const { password, ...sinPassword } = u;
      return sinPassword;
    });
  }

  /**
   * Obtener un usuario por ID.
   * - Si no existe, lanza NotFoundException.
   * - Incluye "rol" y omite "password".
   */
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

  /**
   * DTO para actualización: nombre, email o password.
   * - No permite cambiar rol, siempre mantiene "USUARIO" a menos que después se modifique por un administrador.
   * - Si llega "password", lo rehasea.
   * - Maneja email duplicado.
   */
  async update(id: number, dto: UpdateUsuarioDto): Promise<any> {
    // 1) Si se envía nueva contraseña, rehasearla
    if (dto.password) {
      dto.password = await this.hashPassword(dto.password);
    }

    // 2) Preload recarga la entidad con ID + campos a actualizar
    const entidad = await this.usuarioRepo.preload({ id, ...dto });
    if (!entidad) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    try {
      await this.usuarioRepo.save(entidad);
    } catch (error) {
      // 23505 = email duplicado
      if (error instanceof QueryFailedError && (error as any).code === '23505') {
        throw new BadRequestException(
          `Ya existe un usuario con el email = ${dto.email}`,
        );
      }
      throw error;
    }

    // 3) Recargar para incluir "rol" y omitir "password"
    const actualizado = await this.usuarioRepo.findOne({
      where: { id },
      relations: ['rol'],
    });
    if (!actualizado) {
      throw new NotFoundException(
        `Usuario con id ${id} no encontrado después de actualizar`,
      );
    }
    const { password, ...sinPassword } = actualizado;
    return sinPassword;
  }

  /**
   * Eliminar un usuario por ID.
   * - Si no existe, lanza NotFoundException.
   */
  async remove(id: number): Promise<void> {
    const entidad = await this.usuarioRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    await this.usuarioRepo.remove(entidad);
  }
}
