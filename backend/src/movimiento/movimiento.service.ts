/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/movimiento/movimiento.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, QueryFailedError, Repository } from 'typeorm';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
// import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import { Movimiento } from '../entities/movimiento.entity';
import { Inventario } from 'src/entities/inventario.entity';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';

@Injectable()
export class MovimientoService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
    @InjectRepository(Inventario)
    private readonly inventarioRepo: Repository<Inventario>,
  ) {}

  async create(dto: CreateMovimientoDto): Promise<any> {
    const now = new Date();
    const mov = this.movimientoRepo.create({
      tipo: dto.tipo,
      cantidad: dto.cantidad,
      fechaMovimiento: now,
      descripcion: dto.descripcion,
      producto: { id: dto.producto_idproducto },
      bodega: { id: dto.bodega_idbodega },
    });

    let guardado: Movimiento;
    try {
      guardado = await this.movimientoRepo.save(mov);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23503'
      ) {
        const detail = (error as any).detail as string;
        if (detail.includes('(producto_idproducto)'))
          throw new BadRequestException(
            `No existe un producto con id = ${dto.producto_idproducto}`,
          );
        if (detail.includes('(bodega_idbodega)'))
          throw new BadRequestException(
            `No existe una bodega con id = ${dto.bodega_idbodega}`,
          );
      }
      throw error;
    }

    // <-- Aquí: pasamos INGRESO/EGRESO directamente
    await this.upsertInventario(
      guardado.producto.id,
      guardado.bodega.id,
      guardado.tipo,
      guardado.cantidad,
      now,
    );

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
    if (!completo)
      throw new NotFoundException(
        `Movimiento con id ${guardado.id} no encontrado después de guardar`,
      );

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

  /**
   * Si ya existe un inventario para ese producto+bodega,
   * ajusta cantidad_actual (INGRESO suma, EGRESO resta) y actualiza fecha.
   * Si no existe, lo crea.
   */
  private async upsertInventario(
    productoId: number,
    bodegaId: number,
    tipoMovimiento: 'INGRESO' | 'EGRESO',
    cantidad: number,
    fecha: Date,
  ) {
    const inv = await this.inventarioRepo.findOne({
      where: {
        producto: { id: productoId },
        bodega: { id: bodegaId },
      },
    });

    if (inv) {
      inv.cantidad_actual +=
        tipoMovimiento === 'INGRESO' ? cantidad : -cantidad;
      inv.fechaUltimaActualizacion = fecha;
      await this.inventarioRepo.save(inv);
    } else {
      const nuevo = this.inventarioRepo.create({
        producto: { id: productoId },
        bodega: { id: bodegaId },
        cantidad_actual: tipoMovimiento === 'INGRESO' ? cantidad : -cantidad,
        fechaUltimaActualizacion: fecha,
      });
      await this.inventarioRepo.save(nuevo);
    }
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

  async update(id: number, dto: UpdateMovimientoDto): Promise<Movimiento> {
    const parcial: DeepPartial<Movimiento> = { id };
    if (dto.tipo) parcial.tipo = dto.tipo;
    if (dto.cantidad !== undefined) parcial.cantidad = dto.cantidad;
    if (dto.descripcion !== undefined) parcial.descripcion = dto.descripcion;
    if (dto.producto_idproducto !== undefined)
      parcial.producto = { id: dto.producto_idproducto };
    if (dto.bodega_idbodega !== undefined)
      parcial.bodega = { id: dto.bodega_idbodega };

    const entidad = await this.movimientoRepo.preload({ id, ...parcial });
    if (!entidad) {
      throw new NotFoundException(`Movimiento con id ${id} no encontrado`);
    }
    await this.movimientoRepo.save(entidad);

    // Recargar relaciones
    const actualizado = await this.movimientoRepo.findOne({
      where: { id },
      relations: [
        'producto',
        'producto.presentacion',
        'producto.unidadMedida',
        'producto.proveedor',
        'bodega',
      ],
    });
    if (!actualizado) {
      throw new NotFoundException(
        `Movimiento con id ${id} no encontrado después de actualizar`,
      );
    }
    return actualizado;
  }

  async remove(id: number): Promise<void> {
    const entidad = await this.movimientoRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Movimiento con id ${id} no encontrado`);
    }
    await this.movimientoRepo.remove(entidad);
  }
}
