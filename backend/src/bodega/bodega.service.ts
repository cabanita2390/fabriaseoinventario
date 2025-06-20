/* eslint-disable @typescript-eslint/no-unused-vars */
// src/bodega/bodega.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { UpdateBodegaDto } from './dto/update-bodega.dto';
import { Bodega } from '../entities/bodega.entity';

@Injectable()
export class BodegaService {
  constructor(
    @InjectRepository(Bodega)
    private readonly bodegaRepo: Repository<Bodega>,
  ) {}

  async create(dto: CreateBodegaDto): Promise<Bodega> {
    try {
      const entidad = this.bodegaRepo.create(dto);
      return await this.bodegaRepo.save(entidad);
    } catch (error) {
      // Manejo o relanzamiento
      throw new InternalServerErrorException('Error al crear bodega');
    }
  }

  async findAll(): Promise<Bodega[]> {
    return this.bodegaRepo.find();
  }

  async findOne(id: number): Promise<Bodega> {
    const entidad = await this.bodegaRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Bodega con id ${id} no encontrada`);
    }
    return entidad;
  }

  async update(id: number, dto: UpdateBodegaDto): Promise<Bodega> {
    const entidad = await this.bodegaRepo.preload({
      id,
      ...dto,
    });
    if (!entidad) {
      throw new NotFoundException(`Bodega con id ${id} no encontrada`);
    }
    return this.bodegaRepo.save(entidad);
  }

  async remove(id: number): Promise<{ message: string }> {
    const entidad = await this.bodegaRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Bodega con id ${id} no encontrada`);
    }
    await this.bodegaRepo.remove(entidad);
    return { message: `Bodega con id ${id} eliminada correctamente` };
  }
}
