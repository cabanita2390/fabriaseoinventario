import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { Inventario } from '../entities/inventario.entity';
import { Producto } from '../entities/producto.entity';
import { Bodega } from '../entities/bodega.entity';
import { TipoProducto } from 'src/producto/dto/create-producto.dto';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(Inventario)
    private readonly inventarioRepo: Repository<Inventario>,

    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,

    @InjectRepository(Bodega)
    private readonly bodegaRepo: Repository<Bodega>,
  ) {}

  private validarFechaColombia(fecha: string): Date {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('La fecha ingresada no es válida');
    }
    return date;
  }

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

  async create(dto: CreateInventarioDto): Promise<any> {
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

    const fecha = this.validarFechaColombia(dto.fecha_ultima_actualizacion);

    const entidad = this.inventarioRepo.create({
      cantidad_actual: dto.cantidad_actual,
      fechaUltimaActualizacion: fecha,
      producto: { id: dto.producto_idproducto },
      bodega: { id: dto.bodega_idbodega },
    });

    try {
      const resultadoGuardado = await this.inventarioRepo.save(entidad);

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
        throw new NotFoundException(
          `Inventario con id ${resultadoGuardado.id} no encontrado después de guardar`,
        );
      }

      return {
        ...inventarioCompleto,
        fechaUltimaActualizacion: this.formatearFechaColombia(
          inventarioCompleto.fechaUltimaActualizacion,
        ),
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al crear el inventario');
    }
  }

  async findAll(tipoProducto?: TipoProducto): Promise<any[]> {
    try {
      const whereClause = tipoProducto ? { producto: { tipoProducto } } : {};

      const inventarios = await this.inventarioRepo.find({
        relations: ['producto', 'bodega'],
        where: whereClause,
      });

      return inventarios.map((inv) => ({
        ...inv,
        fechaUltimaActualizacion: this.formatearFechaColombia(
          inv.fechaUltimaActualizacion,
        ),
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al consultar el inventario',
      );
    }
  }

  async findByTipo(tipoProducto: TipoProducto): Promise<any[]> {
    try {
      const inventarios = await this.inventarioRepo.find({
        where: {
          producto: {
            tipoProducto: tipoProducto,
          },
        },
        relations: ['producto', 'bodega'],
      });

      if (inventarios.length === 0) {
        throw new NotFoundException(
          `No hay inventario registrado para ${tipoProducto}`,
        );
      }

      return inventarios.map((inv) => ({
        ...inv,
        fechaUltimaActualizacion: this.formatearFechaColombia(
          inv.fechaUltimaActualizacion,
        ),
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al consultar el inventario por tipo de producto',
      );
    }
  }

  async findOne(id: number): Promise<any> {
    const entidad = await this.inventarioRepo.findOne({
      where: { id },
      relations: ['producto', 'bodega'],
    });

    if (!entidad) {
      throw new NotFoundException(`Inventario con id ${id} no encontrado`);
    }

    return {
      ...entidad,
      fechaUltimaActualizacion: this.formatearFechaColombia(
        entidad.fechaUltimaActualizacion,
      ),
    };
  }

  async update(id: number, dto: UpdateInventarioDto): Promise<any> {
    const datosParciales: DeepPartial<Inventario> = { id };

    if (dto.cantidad_actual !== undefined) {
      datosParciales.cantidad_actual = dto.cantidad_actual;
    }

    if (dto.fecha_ultima_actualizacion) {
      const fecha = this.validarFechaColombia(dto.fecha_ultima_actualizacion);
      datosParciales.fechaUltimaActualizacion = fecha;
    }

    if (dto.producto_idproducto !== undefined) {
      const producto = await this.productoRepo.findOne({
        where: { id: dto.producto_idproducto },
      });
      if (!producto) {
        throw new BadRequestException('El producto especificado no existe');
      }
      datosParciales.producto = { id: dto.producto_idproducto };
    }

    if (dto.bodega_idbodega !== undefined) {
      const bodega = await this.bodegaRepo.findOne({
        where: { id: dto.bodega_idbodega },
      });
      if (!bodega) {
        throw new BadRequestException('La bodega especificada no existe');
      }
      datosParciales.bodega = { id: dto.bodega_idbodega };
    }

    const entidad = await this.inventarioRepo.preload({
      id,
      ...datosParciales,
    });

    if (!entidad) {
      throw new NotFoundException(`Inventario con id ${id} no encontrado`);
    }

    try {
      const inventarioActualizado = await this.inventarioRepo.save(entidad);

      return {
        ...inventarioActualizado,
        fechaUltimaActualizacion: this.formatearFechaColombia(
          inventarioActualizado.fechaUltimaActualizacion,
        ),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar el inventario',
      );
    }
  }

  async remove(id: number): Promise<void> {
    const entidad = await this.inventarioRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Inventario con id ${id} no encontrado`);
    }
    await this.inventarioRepo.remove(entidad);
  }
}
