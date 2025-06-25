/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException, // 👉 Agregado para manejo de errores técnicos
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { Proveedor } from '../entities/proveedor.entity';

@Injectable()
export class ProveedorService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepo: Repository<Proveedor>,
  ) {}

  async create(dto: CreateProveedorDto): Promise<Proveedor> {
    const entidad = this.proveedorRepo.create(dto);

    try {
      // 👉 Agregado try/catch
      return await this.proveedorRepo.save(entidad);
    } catch (error) {
      throw new InternalServerErrorException('Error al crear proveedor'); // 👉 Manejo de error técnico
    }
  }

  async findAll(): Promise<Proveedor[]> {
    try {
      // 👉 Agregado try/catch
      return await this.proveedorRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Error al consultar proveedores'); // 👉 Manejo de error técnico
    }
  }

  async findOne(id: number): Promise<Proveedor> {
    try {
      // 👉 Agregado try/catch
      const entidad = await this.proveedorRepo.findOne({ where: { id } });
      if (!entidad) {
        throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
      }
      return entidad;
    } catch (error) {
      throw new InternalServerErrorException('Error al consultar proveedor'); // 👉 Manejo de error técnico
    }
  }

  async update(id: number, dto: UpdateProveedorDto): Promise<Proveedor> {
    try {
      // 👉 Agregado try/catch
      const entidad = await this.proveedorRepo.preload({
        id,
        ...dto,
      });
      if (!entidad) {
        throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
      }
      return await this.proveedorRepo.save(entidad);
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar proveedor'); // 👉 Manejo de error técnico
    }
  }

  async remove(id: number): Promise<void> {
    try {
      // 👉 Agregado try/catch
      const entidad = await this.proveedorRepo.findOne({ where: { id } });
      if (!entidad) {
        throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
      }
      await this.proveedorRepo.remove(entidad);
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar proveedor'); // 👉 Manejo de error técnico
    }
  }
}
