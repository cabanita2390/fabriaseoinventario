import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePresentacionDto } from './dto/create-presentacion.dto';
import { UpdatePresentacionDto } from './dto/update-presentacion.dto';
import { Presentacion } from '../entities/presentacion.entity';

@Injectable()
export class PresentacionService {
  constructor(
    @InjectRepository(Presentacion)
    private readonly presentacionRepo: Repository<Presentacion>,
  ) {}

  async create(createDto: CreatePresentacionDto): Promise<Presentacion> {
    const entidad = this.presentacionRepo.create(createDto);
    return this.presentacionRepo.save(entidad);
  }

  async findAll(): Promise<Presentacion[]> {
    try {
      return await this.presentacionRepo.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al consultar las presentaciones',
      );
    }
  }

  async findOne(id: number): Promise<Presentacion> {
    const entidad = await this.presentacionRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Presentación con id ${id} no encontrada`);
    }
    return entidad;
  }

  async update(
    id: number,
    updateDto: UpdatePresentacionDto,
  ): Promise<Presentacion> {
    const entidad = await this.presentacionRepo.preload({
      id,
      ...updateDto,
    });
    if (!entidad) {
      throw new NotFoundException(`Presentación con id ${id} no encontrada`);
    }
    return this.presentacionRepo.save(entidad);
  }

  async remove(id: number): Promise<void> {
    const entidad = await this.presentacionRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Presentación con id ${id} no encontrada`);
    }
    await this.presentacionRepo.remove(entidad);
  }
}
