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
    // 1) Creamos y guardamos la fila en inventario:
    const entidad = this.inventarioRepo.create({
      cantidad_actual: dto.cantidad_actual,
      fechaUltimaActualizacion: new Date(dto.fecha_ultima_actualizacion),
      producto: { id: dto.producto_idproducto },
      bodega: { id: dto.bodega_idbodega },
    });
    const resultadoGuardado = await this.inventarioRepo.save(entidad);

    // 2) Volver a consultar para cargar relaciones
    const inventarioCompleto = await this.inventarioRepo.findOne({
      where: { id: resultadoGuardado.id },
      relations: [
        'producto',
        'producto.presentacion',
        'producto.unidadMedida',
        'producto.proveedor',
        'bodega',
      ],
    });

    if (!inventarioCompleto) {
      // Aunque es muy improbable, por seguridad lanzamos excepción si no se encontró
      throw new NotFoundException(
        `Inventario con id ${resultadoGuardado.id} no encontrado después de guardar`,
      );
    }

    return inventarioCompleto; // <— Aquí se devuelve el objeto completo
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
