import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUnidadmedidaDto } from './dto/create-unidadmedida.dto';
import { UpdateUnidadmedidaDto } from './dto/update-unidadmedida.dto';
import { UnidadMedida } from '../entities/unidadmedida.entity';

@Injectable()
export class UnidadmedidaService {
  constructor(
    @InjectRepository(UnidadMedida)
    private readonly unidadRepo: Repository<UnidadMedida>,
  ) {}

  async create(
    createUnidadmedidaDto: CreateUnidadmedidaDto,
  ): Promise<UnidadMedida> {
    const entidad = this.unidadRepo.create(createUnidadmedidaDto);
    return this.unidadRepo.save(entidad);
  }

  async findAll(): Promise<UnidadMedida[]> {
    const unidades = await this.unidadRepo.find();

    // ✅ Validación de resultado vacío (mejora agregada)
    if (unidades.length === 0) {
      throw new NotFoundException('No hay unidades de medida registradas');
    }

    return unidades;
  }

  async findOne(id: number): Promise<UnidadMedida> {
    const entidad = await this.unidadRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(
        `Unidad de medida con id ${id} no encontrada`,
      );
    }
    return entidad;
  }

  async update(
    id: number,
    updateUnidadmedidaDto: UpdateUnidadmedidaDto,
  ): Promise<UnidadMedida> {
    const entidad = await this.unidadRepo.preload({
      id,
      ...updateUnidadmedidaDto,
    });
    if (!entidad) {
      throw new NotFoundException(
        `Unidad de medida con id ${id} no encontrada`,
      );
    }
    return this.unidadRepo.save(entidad);
  }

  async remove(id: number): Promise<void> {
    const entidad = await this.unidadRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(
        `Unidad de medida con id ${id} no encontrada`,
      );
    }
    await this.unidadRepo.remove(entidad);
  }
}
