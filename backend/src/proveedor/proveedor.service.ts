// src/proveedor/proveedor.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.proveedorRepo.save(entidad);
  }

  async findAll(): Promise<Proveedor[]> {
    return this.proveedorRepo.find();
  }

  async findOne(id: number): Promise<Proveedor> {
    const entidad = await this.proveedorRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
    }
    return entidad;
  }

  async update(id: number, dto: UpdateProveedorDto): Promise<Proveedor> {
    const entidad = await this.proveedorRepo.preload({
      id,
      ...dto,
    });
    if (!entidad) {
      throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
    }
    return this.proveedorRepo.save(entidad);
  }

  async remove(id: number): Promise<void> {
    const entidad = await this.proveedorRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
    }
    await this.proveedorRepo.remove(entidad);
  }
}
