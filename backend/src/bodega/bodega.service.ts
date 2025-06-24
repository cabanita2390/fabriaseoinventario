/* eslint-disable @typescript-eslint/no-unused-vars */
// src/bodega/bodega.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
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
      // 👉 Mejora: Log y relanzamiento controlado
      throw new InternalServerErrorException('Error al crear la bodega');
    }
  }

  async findAll(): Promise<Bodega[]> {
    try {
      return await this.bodegaRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Error al consultar bodegas');
    }
  }

  async findOne(id: number): Promise<Bodega> {
    const entidad = await this.bodegaRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Bodega con id ${id} no encontrada`);
    }
    return entidad;
  }

  async update(id: number, dto: UpdateBodegaDto): Promise<Bodega> {
    const entidad = await this.bodegaRepo.preload({ id, ...dto });
    if (!entidad) {
      throw new NotFoundException(`Bodega con id ${id} no encontrada`);
    }
    try {
      return await this.bodegaRepo.save(entidad);
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar la bodega');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const entidad = await this.bodegaRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Bodega con id ${id} no encontrada`);
    }
    try {
      await this.bodegaRepo.remove(entidad);
      return { message: `Bodega con id ${id} eliminada correctamente` };
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar la bodega');
    }
  }
}
