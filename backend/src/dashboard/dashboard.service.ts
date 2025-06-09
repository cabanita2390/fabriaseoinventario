// src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
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
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,

    @InjectRepository(Inventario)
    private readonly inventarioRepo: Repository<Inventario>,
  ) {}

  async getDashboardData(): Promise<DashboardResponseDto> {
    // --- totalMovimientosHoy ---
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const totalMovimientosHoy = await this.movimientoRepo.count({
      where: {
        fechaMovimiento: Between(hoy, manana),
      },
    });

    // --- productosBajoStock (umbral configurable) ---
    const UMBRAL_BAJO_STOCK = 10;
    const inventariosBajo = await this.inventarioRepo.find({
      relations: ['producto'],
      where: { cantidad_actual: Between(0, UMBRAL_BAJO_STOCK) },
    });

    const productosBajoStock: ProductoStockDto[] = inventariosBajo.map(
      (inv) => ({
        id: inv.producto.id,
        nombre: inv.producto.nombre,
        cantidad_actual: inv.cantidad_actual,
      }),
    );

    // --- top5ProductosMasBajoStock ---
    const topCinco = await this.inventarioRepo.find({
      relations: ['producto'],
      order: { cantidad_actual: 'ASC' },
      take: 5,
    });
    const top5ProductosMasBajoStock: ProductoGraficoDto[] = topCinco.map(
      (inv) => ({
        nombre: inv.producto.nombre,
        totalStock: inv.cantidad_actual,
      }),
    );

    // --- ultimosMovimientos (6) ---
    const ultimosRaw = await this.movimientoRepo.find({
      relations: ['producto', 'bodega'],
      order: { fechaMovimiento: 'DESC' },
      take: 6,
    });
    const ultimosMovimientos: MovimientoResumenDto[] = ultimosRaw.map((m) => ({
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
  }
}
