/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
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
import { TipoProducto } from 'src/producto/dto/create-producto.dto';

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

  private readonly logger = new Logger('MovimientoService'); // al inicio de la clase

  async createMateriaPrima(dto: CreateMovimientoDto) {
    return this.create({
      ...dto,
      descripcion: dto.descripcion ?? 'Materia Prima',
    });
  }

  async createMaterialEnvase(dto: CreateMovimientoDto) {
    return this.create({
      ...dto,
      descripcion: dto.descripcion ?? 'Material Envase',
    });
  }

  async createEtiquetas(dto: CreateMovimientoDto) {
    return this.create({
      ...dto,
      descripcion: dto.descripcion ?? 'Etiquetas',
    });
  }

  async findByTipo(tipoProducto: TipoProducto): Promise<Movimiento[]> {
    const resultados = await this.movimientoRepo.find({
      where: {
        producto: {
          tipoProducto: tipoProducto,
        },
      },
      relations: [
        'producto',
        'producto.presentacion',
        'producto.unidadMedida',
        'producto.proveedor',
        'bodega',
      ],
    });

    if (resultados.length === 0) {
      throw new NotFoundException(
        `No hay movimientos registrados para ${tipoProducto}`,
      );
    }

    return resultados;
  }

  async findAll(): Promise<Movimiento[]> {
    const resultados = await this.movimientoRepo.find({
      relations: [
        'producto',
        'producto.presentacion',
        'producto.unidadMedida',
        'producto.proveedor',
        'bodega',
      ],
    });

    if (resultados.length === 0) {
      throw new NotFoundException('No hay movimientos registrados');
    }

    return resultados;
  }

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

  async create(dto: CreateMovimientoDto): Promise<any> {
    const reqId =
      (crypto as any).randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    const t0 = Date.now();

    console.log(`[${reqId}] [create] DTO recibido:`, dto);

    const tipo = dto.tipo ?? TipoMovimiento.INGRESO;
    const now = new Date();

    // --- PRECHECKS DE SOLO LOG (no cambian tu lógica) ---
    const preT0 = Date.now();
    try {
      // Verifica existencia del producto
      if (dto.producto_idproducto != null) {
        const prodRow = await this.movimientoRepo.manager.query(
          `SELECT idproducto FROM "producto" WHERE idproducto = $1 LIMIT 1`,
          [dto.producto_idproducto],
        );
        console.log(
          `[${reqId}] [precheck] producto_idproducto=${dto.producto_idproducto} ` +
            (prodRow?.length ? 'EXISTE' : 'NO_EXISTE'),
        );
      } else {
        console.log(
          `[${reqId}] [precheck] producto_idproducto NO enviado en DTO`,
        );
      }

      // Verifica existencia de la bodega
      if (dto.bodega_idbodega != null) {
        const bodRow = await this.movimientoRepo.manager.query(
          `SELECT idbodega FROM "bodega" WHERE idbodega = $1 LIMIT 1`,
          [dto.bodega_idbodega],
        );
        console.log(
          `[${reqId}] [precheck] bodega_idbodega=${dto.bodega_idbodega} ` +
            (bodRow?.length ? 'EXISTE' : 'NO_EXISTE'),
        );
      } else {
        console.log(`[${reqId}] [precheck] bodega_idbodega NO enviado en DTO`);
      }
    } catch (e) {
      console.log(
        `[${reqId}] [precheck] Error haciendo prechequeos:`,
        e?.message,
      );
    }
    console.log(`[${reqId}] [precheck] tardó ${Date.now() - preT0}ms`);

    // --- CREA ENTIDAD PARCIAL ---
    const mov = this.movimientoRepo.create({
      tipo,
      cantidad: dto.cantidad,
      fechaMovimiento: now,
      descripcion: dto.descripcion,
      // OJO: aquí se asignan FK por id; si el id no existe, el save fallará (FK)
      producto: { id: dto.producto_idproducto } as any,
      bodega: { id: dto.bodega_idbodega } as any,
    } as DeepPartial<Movimiento>);

    console.log(`[${reqId}] [create] Entidad preparada para guardar:`, {
      tipo,
      cantidad: dto.cantidad,
      fechaMovimiento: now.toISOString(),
      descripcion: dto.descripcion,
      producto_id: dto.producto_idproducto,
      bodega_id: dto.bodega_idbodega,
    });

    let guardado: Movimiento;
    const saveT0 = Date.now();
    try {
      guardado = await this.movimientoRepo.save(mov);
      console.log(
        `[${reqId}] [create] Guardado OK en ${Date.now() - saveT0}ms -> id=${guardado.id}`,
      );
    } catch (err: any) {
      // Super útil en Postgres: code + detail (p.ej. violaciones de FK)
      console.error(
        `[${reqId}] [create] Error al guardar (Postgres code=${err?.code} detail=${err?.detail})`,
      );
      console.error(`[${reqId}] [create] Error stack:`, err?.stack ?? err);
      throw new BadRequestException('Error al guardar el movimiento');
    }

    // --- INVENTARIO (upsert) ---
    const upT0 = Date.now();
    try {
      console.log(
        `[${reqId}] [inventario] upsert con ` +
          `producto=${guardado.producto?.id} bodega=${guardado.bodega?.id} ` +
          `tipo=${guardado.tipo} cant=${guardado.cantidad}`,
      );
      await this.upsertInventario(
        guardado.producto.id,
        guardado.bodega.id,
        guardado.tipo,
        guardado.cantidad,
        now,
      );
      console.log(`[${reqId}] [inventario] OK en ${Date.now() - upT0}ms`);
    } catch (e: any) {
      console.error(
        `[${reqId}] [inventario] Error en upsert: ${e?.message}`,
        e?.stack ?? '',
      );
      // Decide si relanzas o no; por ahora, seguimos arrojando errores arriba si el save falla.
    }

    // --- RECUPERA COMPLETO ---
    const findT0 = Date.now();
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
    console.log(`[${reqId}] [findOne] tardó ${Date.now() - findT0}ms`);

    if (!completo) {
      console.warn(
        `[${reqId}] [findOne] No se encontró movimiento id=${guardado.id}`,
      );
      throw new NotFoundException(`Movimiento ${guardado.id} no hallado`);
    }

    console.log(
      `[${reqId}] [done] Total ${Date.now() - t0}ms, id=${guardado.id}`,
    );

    return {
      ...completo,
      fechaMovimiento: this.formatearFechaColombia(completo.fechaMovimiento),
    };
  }

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
      producto: { id: anterior.producto.id },
      bodega: { id: anterior.bodega.id },
    };
    const entidad = await this.movimientoRepo.preload(parcial);

    if (!entidad)
      throw new NotFoundException(`Movimiento ${id} no existe tras preload`);

    await this.upsertInventario(
      anterior.producto.id,
      anterior.bodega.id,
      anterior.tipo === TipoMovimiento.INGRESO
        ? TipoMovimiento.EGRESO
        : TipoMovimiento.INGRESO,
      anterior.cantidad,
      new Date(),
    );

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

  async remove(id: number): Promise<{ message: string }> {
    const ent = await this.movimientoRepo.findOne({ where: { id } });
    if (!ent) throw new NotFoundException(`Movimiento ${id} no encontrado`);
    await this.movimientoRepo.remove(ent);
    return { message: `Movimiento ${id} eliminado` };
  }

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
