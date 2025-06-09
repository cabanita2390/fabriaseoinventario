import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
    // 1) Validar existencia de FK
    const pres = await this.presRepo.findOne({
      where: { id: dto.presentacion_idpresentacion },
    });
    if (!pres) {
      throw new BadRequestException(
        `No existe una presentacion con id = ${dto.presentacion_idpresentacion}`,
      );
    }

    const um = await this.umRepo.findOne({
      where: { id: dto.unidadmedida_idunidadmedida },
    });
    if (!um) {
      throw new BadRequestException(
        `No existe una unidad de medida con id = ${dto.unidadmedida_idunidadmedida}`,
      );
    }

    // Prepara la entidad. Al usar { eager: true } en las relaciones,
    // TypeORM esperará que existan las entidades referidas con esos IDs.
    const entidad = this.productoRepo.create({
      nombre: dto.nombre,
      tipoProducto: dto.tipoProducto,
      subtipoInsumo: dto.subtipoInsumo,
      estado: dto.estado,
      presentacion: { id: dto.presentacion_idpresentacion },
      unidadMedida: { id: dto.unidadmedida_idunidadmedida },
      // proveedor: { id: dto.proveedor_idproveedor },
    });
    return this.productoRepo.save(entidad);
  }

  async findAll(): Promise<Producto[]> {
    return this.productoRepo.find();
  }

  async findOne(id: number): Promise<Producto> {
    const entidad = await this.productoRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    return entidad;
  }

  async update(id: number, dto: UpdateProductoDto): Promise<Producto> {
    const entidad = await this.productoRepo.preload({
      id,
      ...dto,
      // Si llegan claves relacionadas, TypeORM las convertirá a relaciones internas
      ...(dto.presentacion_idpresentacion && {
        presentacion: { id: dto.presentacion_idpresentacion },
      }),
      ...(dto.unidadmedida_idunidadmedida && {
        unidadMedida: { id: dto.unidadmedida_idunidadmedida },
      }),
      ...(dto.proveedor_idproveedor && {
        proveedor: { id: dto.proveedor_idproveedor },
      }),
    });
    if (!entidad) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    return this.productoRepo.save(entidad);
  }

  async remove(id: number): Promise<void> {
    const entidad = await this.productoRepo.findOne({ where: { id } });
    if (!entidad) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    await this.productoRepo.remove(entidad);
  }
}
