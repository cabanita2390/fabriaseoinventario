/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException, // 👉 Agregado para manejar errores técnicos
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { Rol } from '../entities/rol.entity';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
  ) {}

  async create(dto: CreateRolDto): Promise<Rol> {
    const entidad = this.rolRepo.create({ nombre: dto.nombre });
    try {
      // 👉 Ya existía, se conserva
      return await this.rolRepo.save(entidad);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        throw new BadRequestException(
          `Ya existe un rol con nombre = ${dto.nombre}`,
        );
      }
      throw new InternalServerErrorException('Error al crear rol'); // 👉 Agregado manejo uniforme de errores técnicos
    }
  }

  async findAll(): Promise<Rol[]> {
    try {
      // 👉 Agregado try/catch
      return await this.rolRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Error al consultar roles'); // 👉 Agregado manejo de errores técnicos
    }
  }

  async findOne(id: number): Promise<Rol> {
    try {
      // 👉 Agregado try/catch
      const rol = await this.rolRepo.findOne({ where: { id } });
      if (!rol) {
        throw new NotFoundException(`Rol con id ${id} no encontrado`);
      }
      return rol;
    } catch (error) {
      throw new InternalServerErrorException('Error al consultar rol'); // 👉 Agregado manejo de errores técnicos
    }
  }

  async update(id: number, dto: UpdateRolDto): Promise<Rol> {
    try {
      // 👉 Agregado try/catch
      const entidad = await this.rolRepo.preload({ id, ...dto });
      if (!entidad) {
        throw new NotFoundException(`Rol con id ${id} no encontrado`);
      }
      return await this.rolRepo.save(entidad);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        throw new BadRequestException(
          `Ya existe un rol con nombre = ${dto.nombre}`,
        );
      }
      throw new InternalServerErrorException('Error al actualizar rol'); // 👉 Agregado manejo uniforme de errores técnicos
    }
  }

  async remove(id: number): Promise<void> {
    try {
      // 👉 Agregado try/catch
      const rol = await this.rolRepo.findOne({ where: { id } });
      if (!rol) {
        throw new NotFoundException(`Rol con id ${id} no encontrado`);
      }
      await this.rolRepo.remove(rol);
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar rol'); // 👉 Agregado manejo de errores técnicos
    }
  }
}
