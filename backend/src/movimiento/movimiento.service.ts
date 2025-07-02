// src/movimiento/movimiento.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Movimiento } from 'src/entities/movimiento.entity';
import {
  CreateMovimientoDto,
  TipoMovimiento,
} from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import { Producto } from 'src/entities/producto.entity';
import { Bodega } from 'src/entities/bodega.entity';
import { Inventario } from 'src/entities/inventario.entity';

@Injectable()
export class MovimientoService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    @InjectRepository(Bodega)
    private readonly bodegaRepo: Repository<Bodega>,
    @InjectRepository(Inventario)
    private readonly inventarioRepo: Repository<Inventario>,
  ) {}

  /** Lista todos los movimientos */
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

  /** Busca un movimiento por id */
  async findOne(id: number): Promise<any> {
    const ent = await this.movimientoRepo.findOne({
      where: { id },
      relations: [
        'producto',
        'producto.presentacion',
        'producto.unidadMedida',
        'producto.proveedor',
        'bodega',
      ],
    });
    if (!ent) throw new NotFoundException(`Movimiento ${id} no encontrado`);
    return {
      ...ent,
      fechaMovimiento: this.formatearFechaColombia(ent.fechaMovimiento),
    };
  }

  /** Crea un nuevo movimiento e impacta el inventario */
  async create(dto: CreateMovimientoDto): Promise<any> {
    const tipo = dto.tipo ?? TipoMovimiento.INGRESO;
    const now = new Date();

    const mov = this.movimientoRepo.create({
      tipo,
      cantidad: dto.cantidad,
      fechaMovimiento: now,
      descripcion: dto.descripcion,
      producto: { id: dto.producto_idproducto },
      bodega: { id: dto.bodega_idbodega },
    } as DeepPartial<Movimiento>);

    let guardado: Movimiento;
    try {
      guardado = await this.movimientoRepo.save(mov);
    } catch (err) {
      // aquí podrías mapear errores de FK a BadRequestException
      throw err;
    }

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
      throw new NotFoundException(`Movimiento ${guardado.id} no hallado`);

    return {
      ...completo,
      fechaMovimiento: this.formatearFechaColombia(completo.fechaMovimiento),
    };
  }

  /** Actualiza un movimiento: revierte el viejo impacto y aplica el nuevo */
  async update(id: number, dto: UpdateMovimientoDto): Promise<any> {
    const anterior = await this.movimientoRepo.findOne({
      where: { id },
      relations: ['producto', 'bodega'],
    });

    if (!anterior) throw new NotFoundException(`Movimiento ${id} no existe`);

    const parcial: DeepPartial<Movimiento> = {
      id,
      tipo: dto.tipo ?? TipoMovimiento.INGRESO,
      cantidad: dto.cantidad,
      descripcion: dto.descripcion,
      // si no vinieron en el DTO, reutilizo la anterior:
      producto: { id: anterior.producto.id },
      bodega: { id: anterior.bodega.id },
    };
    const entidad = await this.movimientoRepo.preload(parcial);

    if (!entidad)
      throw new NotFoundException(`Movimiento ${id} no existe tras preload`);

    // 1) Revertir impacto antiguo
    await this.upsertInventario(
      anterior.producto.id,
      anterior.bodega.id,
      anterior.tipo === TipoMovimiento.INGRESO
        ? TipoMovimiento.EGRESO
        : TipoMovimiento.INGRESO,
      anterior.cantidad,
      new Date(),
    );
    // 2) Aplicar impacto actualizado
    await this.upsertInventario(
      entidad.producto.id,
      entidad.bodega.id,
      entidad.tipo,
      entidad.cantidad,
      new Date(),
    );

    await this.movimientoRepo.save(entidad);

    const updated = await this.movimientoRepo.findOne({
      where: { id },
      relations: [
        'producto',
        'producto.presentacion',
        'producto.unidadMedida',
        'producto.proveedor',
        'bodega',
      ],
    });
    if (!updated)
      throw new NotFoundException(`Movimiento ${id} no hallado tras update`);

    return {
      ...updated,
      fechaMovimiento: this.formatearFechaColombia(updated.fechaMovimiento),
    };
  }

  /** Elimina un movimiento (no revierte inventario) */
  async remove(id: number): Promise<{ message: string }> {
    const ent = await this.movimientoRepo.findOne({ where: { id } });
    if (!ent) throw new NotFoundException(`Movimiento ${id} no encontrado`);
    await this.movimientoRepo.remove(ent);
    return { message: `Movimiento ${id} eliminado` };
  }

  /**
   * Inserta o actualiza la fila de inventario:
   * - la crea en 0 si no existe
   * - suma o resta la cantidad sin validar negativo
   */
  private async upsertInventario(
    productoId: number,
    bodegaId: number,
    tipo: TipoMovimiento,
    cantidad: number,
    fecha: Date,
  ) {
    let inv = await this.inventarioRepo.findOne({
      where: { producto: { id: productoId }, bodega: { id: bodegaId } },
    });

    if (!inv) {
      inv = this.inventarioRepo.create({
        producto: { id: productoId },
        bodega: { id: bodegaId },
        cantidad_actual: 0,
        fechaUltimaActualizacion: fecha,
      });
    }

    inv.cantidad_actual +=
      tipo === TipoMovimiento.INGRESO ? cantidad : -cantidad;
    inv.fechaUltimaActualizacion = fecha;
    return this.inventarioRepo.save(inv);
  }

  private formatearFechaColombia(d: Date): string {
    return d.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
