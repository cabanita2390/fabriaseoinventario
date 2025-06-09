// src/rol/rol.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
      return await this.rolRepo.save(entidad);
    } catch (error) {
      // Código 23505 = UNIQUE VIOLATION (nombre duplicado)
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        throw new BadRequestException(
          `Ya existe un rol con nombre = ${dto.nombre}`,
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<Rol[]> {
    return this.rolRepo.find();
  }

  async findOne(id: number): Promise<Rol> {
    const rol = await this.rolRepo.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException(`Rol con id ${id} no encontrado`);
    }
    return rol;
  }

  async update(id: number, dto: UpdateRolDto): Promise<Rol> {
    const entidad = await this.rolRepo.preload({ id, ...dto });
    if (!entidad) {
      throw new NotFoundException(`Rol con id ${id} no encontrado`);
    }
    try {
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
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const rol = await this.rolRepo.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException(`Rol con id ${id} no encontrado`);
    }
    await this.rolRepo.remove(rol);
  }
}
