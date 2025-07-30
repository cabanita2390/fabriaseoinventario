import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException, // 👉 Agregado para manejo de errores técnicos
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Producto } from '../entities/producto.entity';
import { Presentacion } from 'src/entities/presentacion.entity';
import { UnidadMedida } from 'src/entities/unidadmedida.entity';
import { Proveedor } from 'src/entities/proveedor.entity';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,

    @InjectRepository(Presentacion)
    private readonly presRepo: Repository<Presentacion>,

    @InjectRepository(UnidadMedida)
    private readonly umRepo: Repository<UnidadMedida>,

    @InjectRepository(Proveedor)
    private readonly provRepo: Repository<Proveedor>,
  ) {}

  async create(dto: CreateProductoDto): Promise<Producto> {
    // Validar FK Presentacion
    const pres = await this.presRepo.findOne({
      where: { id: dto.presentacion_idpresentacion },
    });
    if (!pres) {
      throw new BadRequestException(
        `No existe presentacion con id = ${dto.presentacion_idpresentacion}`,
      );
    }

    // Validar FK UnidadMedida
    const um = await this.umRepo.findOne({
      where: { id: dto.unidadmedida_idunidadmedida },
    });
    if (!um) {
      throw new BadRequestException(
        `No existe unidad de medida con id = ${dto.unidadmedida_idunidadmedida}`,
      );
    }

    // Validar FK Proveedor (opcional)
    let prov: Proveedor | undefined;
    if (dto.proveedor_idproveedor) {
      const found = await this.provRepo.findOne({
        where: { id: dto.proveedor_idproveedor },
      });
      if (!found) {
        throw new BadRequestException(
          `No existe proveedor con id = ${dto.proveedor_idproveedor}`,
        );
      }
      prov = found;
    }

    const entidad = new Producto();
    entidad.nombre = dto.nombre;
    entidad.tipoProducto = dto.tipoProducto;
    entidad.subtipoInsumo = dto.subtipoInsumo ?? '';
    entidad.estado = dto.estado;
    entidad.presentacion = { id: pres.id } as Presentacion;
    entidad.unidadMedida = { id: um.id } as UnidadMedida;
    entidad.proveedor = prov ? ({ id: prov.id } as Proveedor) : undefined;

    try {
      return await this.productoRepo.save(entidad);
    } catch (error) {
      throw new InternalServerErrorException('Error al crear el producto'); // 👉 Cambié el manejo de errores a uno más limpio
    }
  }

  async findAll(): Promise<Producto[]> {
    try {
      // 👉 Agregado try/catch para manejo robusto
      return await this.productoRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Error al consultar productos'); // 👉 Agregado manejo de errores técnicos
    }
  }

  async findOne(id: number): Promise<Producto> {
    const entidad = await this.productoRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    return entidad;
  }

  async update(id: number, dto: UpdateProductoDto): Promise<Producto> {
    // 👉 Validar claves foráneas nuevas si se envían
    if (dto.presentacion_idpresentacion) {
      const pres = await this.presRepo.findOne({
        where: { id: dto.presentacion_idpresentacion },
      });
      if (!pres) {
        throw new BadRequestException(
          `No existe presentacion con id = ${dto.presentacion_idpresentacion}`,
        );
      }
    }

    if (dto.unidadmedida_idunidadmedida) {
      const um = await this.umRepo.findOne({
        where: { id: dto.unidadmedida_idunidadmedida },
      });
      if (!um) {
        throw new BadRequestException(
          `No existe unidad de medida con id = ${dto.unidadmedida_idunidadmedida}`,
        );
      }
    }

    if (dto.proveedor_idproveedor) {
      const prov = await this.provRepo.findOne({
        where: { id: dto.proveedor_idproveedor },
      });
      if (!prov) {
        throw new BadRequestException(
          `No existe proveedor con id = ${dto.proveedor_idproveedor}`,
        );
      }
    }

    const parcial: Partial<Producto> = { id };
    if (dto.nombre !== undefined) parcial.nombre = dto.nombre;
    if (dto.tipoProducto !== undefined) parcial.tipoProducto = dto.tipoProducto;
    if (dto.subtipoInsumo !== undefined)
      parcial.subtipoInsumo = dto.subtipoInsumo;
    if (dto.estado !== undefined) parcial.estado = dto.estado;
    if (dto.presentacion_idpresentacion !== undefined) {
      parcial.presentacion = {
        id: dto.presentacion_idpresentacion,
      } as Presentacion;
    }
    if (dto.unidadmedida_idunidadmedida !== undefined) {
      parcial.unidadMedida = {
        id: dto.unidadmedida_idunidadmedida,
      } as UnidadMedida;
    }
    if (dto.proveedor_idproveedor !== undefined) {
      parcial.proveedor = { id: dto.proveedor_idproveedor } as Proveedor;
    }

    const entidad = await this.productoRepo.preload(parcial);
    if (!entidad) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    try {
      return await this.productoRepo.save(entidad);
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar el producto'); // 👉 Manejamos el error de forma uniforme
    }
  }

  async remove(id: number): Promise<void> {
    const entidad = await this.productoRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    await this.productoRepo.remove(entidad);
  }
}
