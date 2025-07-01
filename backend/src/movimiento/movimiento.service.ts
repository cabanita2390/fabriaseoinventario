import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { Movimiento } from '../entities/movimiento.entity';
import { Inventario } from 'src/entities/inventario.entity';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import { Producto } from '../entities/producto.entity';
import { Bodega } from '../entities/bodega.entity';

@Injectable()
export class MovimientoService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,

    @InjectRepository(Inventario)
    private readonly inventarioRepo: Repository<Inventario>,

    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,

    @InjectRepository(Bodega)
    private readonly bodegaRepo: Repository<Bodega>,
  ) {}

  private formatearFechaColombia(fecha: Date): string {
    const opciones: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Bogota',
    };
    return new Intl.DateTimeFormat('es-CO', opciones)
      .format(fecha)
      .replace(',', '');
  }

  async create(dto: CreateMovimientoDto): Promise<any> {
    // Validar existencia de producto y bodega
    const producto = await this.productoRepo.findOne({
      where: { id: dto.producto_idproducto },
    });
    if (!producto) {
      throw new BadRequestException('El producto especificado no existe');
    }

    const bodega = await this.bodegaRepo.findOne({
      where: { id: dto.bodega_idbodega },
    });
    if (!bodega) {
      throw new BadRequestException('La bodega especificada no existe');
    }

    const now = new Date();

    // Validar stock suficiente si es EGRESO
    await this.validarStockDisponible(
      dto.producto_idproducto,
      dto.bodega_idbodega,
      dto.tipo,
      dto.cantidad,
    );

    const mov = this.movimientoRepo.create({
      tipo: dto.tipo,
      cantidad: dto.cantidad,
      fechaMovimiento: now,
      descripcion: dto.descripcion,
      producto: { id: dto.producto_idproducto },
      bodega: { id: dto.bodega_idbodega },
    });

    const guardado = await this.movimientoRepo.save(mov);

    await this.upsertInventario(
      dto.producto_idproducto,
      dto.bodega_idbodega,
      dto.tipo,
      dto.cantidad,
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

    if (!completo) {
      throw new NotFoundException(
        `Movimiento con id ${guardado.id} no encontrado después de guardar`,
      );
    }

    return {
      ...completo,
      fechaMovimiento: this.formatearFechaColombia(completo.fechaMovimiento),
    };
  }

  private async validarStockDisponible(
    productoId: number,
    bodegaId: number,
    tipoMovimiento: 'INGRESO' | 'EGRESO',
    cantidad: number,
  ) {
    if (tipoMovimiento === 'EGRESO') {
      const inventario = await this.inventarioRepo.findOne({
        where: { producto: { id: productoId }, bodega: { id: bodegaId } },
      });

      if (!inventario || inventario.cantidad_actual < cantidad) {
        throw new BadRequestException(
          'Stock insuficiente para realizar el egreso',
        );
      }
    }
  }

  private async upsertInventario(
    productoId: number,
    bodegaId: number,
    tipoMovimiento: 'INGRESO' | 'EGRESO',
    cantidad: number,
    fecha: Date,
  ) {
    const inv = await this.inventarioRepo.findOne({
      where: { producto: { id: productoId }, bodega: { id: bodegaId } },
    });

    if (inv) {
      inv.cantidad_actual +=
        tipoMovimiento === 'INGRESO' ? cantidad : -cantidad;
      inv.fechaUltimaActualizacion = fecha;

      if (inv.cantidad_actual < 0) {
        throw new BadRequestException(
          'La cantidad actual no puede ser negativa',
        );
      }

      await this.inventarioRepo.save(inv);
    } else {
      const nuevo = this.inventarioRepo.create({
        producto: { id: productoId },
        bodega: { id: bodegaId },
        cantidad_actual: tipoMovimiento === 'INGRESO' ? cantidad : -cantidad,
        fechaUltimaActualizacion: fecha,
      });

      if (nuevo.cantidad_actual < 0) {
        throw new BadRequestException(
          'No se puede crear inventario con stock negativo',
        );
      }

      await this.inventarioRepo.save(nuevo);
    }
  }

  async findAll(): Promise<any[]> {
    try {
      const movimientos = await this.movimientoRepo.find({
        relations: [
          'producto',
          'producto.presentacion',
          'producto.unidadMedida',
          'producto.proveedor',
          'bodega',
        ],
      });

      return movimientos.map((mov) => ({
        ...mov,
        fechaMovimiento: this.formatearFechaColombia(mov.fechaMovimiento),
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al consultar los movimientos',
      );
    }
  }

  async findOne(id: number): Promise<any> {
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

    return {
      ...entidad,
      fechaMovimiento: this.formatearFechaColombia(entidad.fechaMovimiento),
    };
  }

  async update(id: number, dto: UpdateMovimientoDto): Promise<any> {
    const movimientoAnterior = await this.movimientoRepo.findOne({
      where: { id },
      relations: ['producto', 'bodega'],
    });

    if (!movimientoAnterior) {
      throw new NotFoundException(`Movimiento con id ${id} no encontrado`);
    }

    const parcial: DeepPartial<Movimiento> = { id };

    if (dto.tipo) parcial.tipo = dto.tipo;
    if (dto.cantidad !== undefined) parcial.cantidad = dto.cantidad;
    if (dto.descripcion !== undefined) parcial.descripcion = dto.descripcion;

    if (dto.producto_idproducto !== undefined) {
      const producto = await this.productoRepo.findOne({
        where: { id: dto.producto_idproducto },
      });
      if (!producto) {
        throw new BadRequestException('El producto especificado no existe');
      }
      parcial.producto = { id: dto.producto_idproducto };
    }

    if (dto.bodega_idbodega !== undefined) {
      const bodega = await this.bodegaRepo.findOne({
        where: { id: dto.bodega_idbodega },
      });
      if (!bodega) {
        throw new BadRequestException('La bodega especificada no existe');
      }
      parcial.bodega = { id: dto.bodega_idbodega };
    }

    const entidad = await this.movimientoRepo.preload({ id, ...parcial });
    if (!entidad) {
      throw new NotFoundException(`Movimiento con id ${id} no encontrado`);
    }

    // Revertir impacto del movimiento anterior en el inventario
    await this.upsertInventario(
      movimientoAnterior.producto.id,
      movimientoAnterior.bodega.id,
      movimientoAnterior.tipo === 'INGRESO' ? 'EGRESO' : 'INGRESO',
      movimientoAnterior.cantidad,
      new Date(),
    );

    // Aplicar impacto del movimiento actualizado
    await this.validarStockDisponible(
      entidad.producto.id,
      entidad.bodega.id,
      entidad.tipo,
      entidad.cantidad,
    );

    await this.upsertInventario(
      entidad.producto.id,
      entidad.bodega.id,
      entidad.tipo,
      entidad.cantidad,
      new Date(),
    );

    await this.movimientoRepo.save(entidad);

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

    return {
      ...actualizado,
      fechaMovimiento: this.formatearFechaColombia(actualizado.fechaMovimiento),
    };
  }

  async remove(id: number): Promise<void> {
    const entidad = await this.movimientoRepo.findOne({
      where: { id },
      relations: ['producto', 'bodega'],
    });

    if (!entidad) {
      throw new NotFoundException(`Movimiento con id ${id} no encontrado`);
    }

    // Revertir el movimiento en el inventario
    await this.upsertInventario(
      entidad.producto.id,
      entidad.bodega.id,
      entidad.tipo === 'INGRESO' ? 'EGRESO' : 'INGRESO',
      entidad.cantidad,
      new Date(),
    );

    await this.movimientoRepo.remove(entidad);
  }
}
