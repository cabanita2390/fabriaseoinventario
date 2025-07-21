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

  async create(createDto: CreatePresentacionDto): Promise<Presentacion> {
    // 1. Validación de reglas de negocio antes de persistir
    if (!createDto.nombre || createDto.nombre.trim().length === 0) {
      throw new BadRequestException(
        'El nombre de la presentación es obligatorio',
      );
    }

    // 2. Chequeo de unicidad (por ejemplo nombre único)
    const exists = await this.presentacionRepo.findOne({
      where: { nombre: createDto.nombre.trim() },
    });
    if (exists) {
      throw new ConflictException(
        `Ya existe una presentación con nombre '${createDto.nombre}'`,
      );
    }

    // 3. Creación de la entidad
    const entidad = this.presentacionRepo.create({
      ...createDto,
      nombre: createDto.nombre.trim(),
    });

    // 4. Intento de guardado con captura de errores de BD
    try {
      return await this.presentacionRepo.save(entidad);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // Por ejemplo violación de FK, constraint de DB, etc.
        throw new BadRequestException(
          'Error en la base de datos al crear la presentación',
        );
      }
      // Cualquier otro error no previsto
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
