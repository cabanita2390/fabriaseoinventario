import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Repository, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Movimiento } from '../entities/movimiento.entity';
import { Inventario } from '../entities/inventario.entity';
import {
  DashboardResponseDto,
  MovimientoResumenDto,
  ProductoGraficoDto,
  ProductoStockDto,
} from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,

    @InjectRepository(Inventario)
    private readonly inventarioRepo: Repository<Inventario>,
  ) {}

  async getDashboardData(): Promise<DashboardResponseDto> {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);

      const totalMovimientosHoy = await this.movimientoRepo.count({
        where: {
          fechaMovimiento: Between(hoy, manana),
        },
      });

      const UMBRAL_BAJO_STOCK = 10;
      const inventariosBajo = await this.inventarioRepo.find({
        relations: ['producto'],
        where: { cantidad_actual: Between(0, UMBRAL_BAJO_STOCK) },
      });

      const productosBajoStock: ProductoStockDto[] = inventariosBajo
        .filter((inv) => inv.producto)
        .map((inv) => ({
          id: inv.producto.id,
          nombre: inv.producto.nombre,
          cantidad_actual: inv.cantidad_actual,
        }));

      const topCinco = await this.inventarioRepo.find({
        relations: ['producto'],
        order: { cantidad_actual: 'ASC' },
        take: 5,
      });

      const top5ProductosMasBajoStock: ProductoGraficoDto[] = topCinco
        .filter((inv) => inv.producto)
        .map((inv) => ({
          nombre: inv.producto.nombre,
          totalStock: inv.cantidad_actual,
        }));

      const ultimosRaw = await this.movimientoRepo.find({
        relations: ['producto', 'bodega'],
        order: { fechaMovimiento: 'DESC' },
        take: 6,
      });

      const ultimosMovimientos: MovimientoResumenDto[] = ultimosRaw
        .filter((m) => m.producto && m.bodega)
        .map((m) => ({
          id: m.id,
          tipo: m.tipo,
          cantidad: m.cantidad,
          fechaMovimiento: m.fechaMovimiento.toISOString(),
          descripcion: m.descripcion,
          producto: {
            id: m.producto.id,
            nombre: m.producto.nombre,
          },
          bodega: {
            id: m.bodega.id,
            nombre: m.bodega.nombre,
          },
        }));

      return {
        totalMovimientosHoy,
        productosBajoStock,
        top5ProductosMasBajoStock,
        ultimosMovimientos,
      };
    } catch (error) {
      this.logger.error('Error generando datos del dashboard', error);
      throw new InternalServerErrorException(
        'No se pudo obtener la información del dashboard',
      );
    }
  }
}
