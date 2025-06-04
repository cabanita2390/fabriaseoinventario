// src/inventario/inventario.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventarioDto } from './dto/create-inventario.dto';
// import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { Inventario } from '../entities/inventario.entity';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(Inventario)
    private readonly inventarioRepo: Repository<Inventario>,
  ) {}

  async create(dto: CreateInventarioDto): Promise<Inventario> {
    const entidad = this.inventarioRepo.create({
      cantidad_actual: dto.cantidad_actual,
      fechaUltimaActualizacion: new Date(dto.fecha_ultima_actualizacion),
      producto: { id: dto.producto_idproducto },
      bodega: { id: dto.bodega_idbodega },
    });
    return this.inventarioRepo.save(entidad);
  }

  async findAll(): Promise<Inventario[]> {
    return this.inventarioRepo.find();
  }

  async findOne(id: number): Promise<Inventario> {
    const entidad = await this.inventarioRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Inventario con id ${id} no encontrado`);
    }
    return entidad;
  }

  // async update(id: number, dto: UpdateInventarioDto): Promise<Inventario> {
  //   const datosParciales: Partial<Inventario> = {};
  //   if (dto.cantidad_actual !== undefined) {
  //     datosParciales.cantidad_actual = dto.cantidad_actual;
  //   }
  //   if (dto.fecha_ultima_actualizacion) {
  //     datosParciales.fechaUltimaActualizacion = new Date(
  //       dto.fecha_ultima_actualizacion,
  //     );
  //   }
  //   if (dto.producto_idproducto !== undefined) {
  //     datosParciales.producto = { id: dto.producto_idproducto };
  //   }
  //   if (dto.bodega_idbodega !== undefined) {
  //     datosParciales.bodega = { id: dto.bodega_idbodega };
  //   }

  //   const entidad = await this.inventarioRepo.preload({
  //     id,
  //     ...datosParciales,
  //   });
  //   if (!entidad) {
  //     throw new NotFoundException(`Inventario con id ${id} no encontrado`);
  //   }
  //   return this.inventarioRepo.save(entidad);
  // }

  async remove(id: number): Promise<void> {
    const entidad = await this.inventarioRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Inventario con id ${id} no encontrado`);
    }
    await this.inventarioRepo.remove(entidad);
  }
}
