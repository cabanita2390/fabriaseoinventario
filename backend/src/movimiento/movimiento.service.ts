// src/movimiento/movimiento.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import {
  CreateMovimientoDto,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TipoMovimiento,
} from './dto/create-movimiento.dto';
// import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import { Movimiento } from '../entities/movimiento.entity';

@Injectable()
export class MovimientoService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
  ) {}

  async create(dto: CreateMovimientoDto): Promise<any> {
    // 1) Preparamos la entidad usando la fecha actual
    const now = new Date(); // momento en servidor (UTC o local segun configuración)
    const entidad = this.movimientoRepo.create({
      tipo: dto.tipo,
      cantidad: dto.cantidad,
      fechaMovimiento: now,
      descripcion: dto.descripcion,
      producto: { id: dto.producto_idproducto },
      bodega: { id: dto.bodega_idbodega },
    });

    let guardado: Movimiento;
    try {
      // 2) Guardamos la fila (aquí puede fallar FK)
      guardado = await this.movimientoRepo.save(entidad);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23503'
      ) {
        const detail: string = (error as any).detail;
        if (detail.includes('(producto_idproducto)')) {
          throw new BadRequestException(
            `No existe un producto con id = ${dto.producto_idproducto}`,
          );
        }
        if (detail.includes('(bodega_idbodega)')) {
          throw new BadRequestException(
            `No existe una bodega con id = ${dto.bodega_idbodega}`,
          );
        }
        throw new BadRequestException(
          'Violación de llave foránea al crear Movimiento',
        );
      }
      throw error;
    }

    // 3) Recargamos con relaciones para conseguir todos los campos anidados
    const completo = await this.movimientoRepo.findOne({
      where: { id: guardado.id },
      relations: [
        'producto',
        'producto.presentacion',
        'producto.unidadMedida',
        'producto.proveedor',
        'bodega',
      ],
    });
    if (!completo) {
      throw new NotFoundException(
        `Movimiento con id ${guardado.id} no encontrado después de guardar`,
      );
    }

    // 4) Devolvemos JSON, formateando fechaMovimiento en zona America/Bogota
    return {
      ...completo,
      fechaMovimiento: completo.fechaMovimiento.toLocaleString('es-CO', {
        timeZone: 'America/Bogota',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  }

  async findAll(): Promise<Movimiento[]> {
    return this.movimientoRepo.find({
      relations: [
        'producto',
        'producto.presentacion',
        'producto.unidadMedida',
        'producto.proveedor',
        'bodega',
      ],
    });
  }

  async findOne(id: number): Promise<Movimiento> {
    const entidad = await this.movimientoRepo.findOne({
      where: { id },
      relations: [
        'producto',
        'producto.presentacion',
        'producto.unidadMedida',
        'producto.proveedor',
        'bodega',
      ],
    });
    if (!entidad) {
      throw new NotFoundException(`Movimiento con id ${id} no encontrado`);
    }
    return entidad;
  }

  // async update(id: number, dto: UpdateMovimientoDto): Promise<Movimiento> {
  //   const parcial: Partial<Movimiento> = {};
  //   if (dto.tipo) parcial.tipo = dto.tipo;
  //   if (dto.cantidad !== undefined) parcial.cantidad = dto.cantidad;
  //   if (dto.fecha_movimiento)
  //     parcial.fechaMovimiento = new Date(dto.fecha_movimiento);
  //   if (dto.descripcion !== undefined) parcial.descripcion = dto.descripcion;
  //   if (dto.producto_idproducto !== undefined)
  //     parcial.producto = { id: dto.producto_idproducto };
  //   if (dto.bodega_idbodega !== undefined)
  //     parcial.bodega = { id: dto.bodega_idbodega };

  //   const entidad = await this.movimientoRepo.preload({ id, ...parcial });
  //   if (!entidad) {
  //     throw new NotFoundException(`Movimiento con id ${id} no encontrado`);
  //   }
  //   await this.movimientoRepo.save(entidad);

  //   // Recargar relaciones
  //   const actualizado = await this.movimientoRepo.findOne({
  //     where: { id },
  //     relations: [
  //       'producto',
  //       'producto.presentacion',
  //       'producto.unidadMedida',
  //       'producto.proveedor',
  //       'bodega',
  //     ],
  //   });
  //   if (!actualizado) {
  //     throw new NotFoundException(
  //       `Movimiento con id ${id} no encontrado después de actualizar`,
  //     );
  //   }
  //   return actualizado;
  // }

  async remove(id: number): Promise<void> {
    const entidad = await this.movimientoRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Movimiento con id ${id} no encontrado`);
    }
    await this.movimientoRepo.remove(entidad);
  }
}
