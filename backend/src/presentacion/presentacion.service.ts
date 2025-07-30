import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreatePresentacionDto } from './dto/create-presentacion.dto';
import { UpdatePresentacionDto } from './dto/update-presentacion.dto';
import { Presentacion } from '../entities/presentacion.entity';

@Injectable()
export class PresentacionService {
  constructor(
    @InjectRepository(Presentacion)
    private readonly presentacionRepo: Repository<Presentacion>,
  ) {}

  async create(dto: CreatePresentacionDto): Promise<Presentacion> {
    const nombre = dto.nombre.trim();
    const tipoProducto = dto.tipoProducto;

    // 1) Validación básica
    if (!nombre) {
      throw new BadRequestException(
        'El nombre de la presentación es obligatorio',
      );
    }

    // 2) Validación de unicidad por nombre + tipo
    const exists = await this.presentacionRepo.findOne({
      where: { nombre, tipoProducto }, // ✅ incluye tipoProducto
    });
    if (exists) {
      throw new ConflictException(
        `Ya existe una presentación '${nombre}' para tipo ${tipoProducto}`,
      );
    }

    // 3) Creamos la entidad con ambos campos
    const entidad = this.presentacionRepo.create({
      nombre,
      tipoProducto, // ✅ persiste el tipo
    });

    // 4) Guardado con manejo de errores
    try {
      return await this.presentacionRepo.save(entidad);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Error en la base de datos al crear la presentación',
        );
      }
      throw new InternalServerErrorException(
        'No se pudo crear la presentación',
      );
    }
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
