import { Expose, Type } from 'class-transformer';

export class ProductoDto {
  @Expose()
  id: number;

  @Expose()
  nombre: string;
}

export class BodegaDto {
  @Expose()
  id: number;

  @Expose()
  nombre: string;
}

export class MovimientoResumenDto {
  @Expose()
  id: number;

  @Expose()
  tipo: string;

  @Expose()
  cantidad: number;

  @Expose()
  fechaMovimiento: string;

  @Expose()
  descripcion: string;

  @Expose()
  @Type(() => ProductoDto)
  producto: ProductoDto;

  @Expose()
  @Type(() => BodegaDto)
  bodega: BodegaDto;
}

export class ProductoStockDto {
  @Expose()
  id: number;

  @Expose()
  nombre: string;

  @Expose({ name: 'cantidadActual' })
  cantidadActual: number;
}

export class ProductoGraficoDto {
  @Expose()
  nombre: string;

  @Expose()
  totalStock: number;
}

export class DashboardResponseDto {
  @Expose()
  totalMovimientosHoy: number;

  @Expose()
  @Type(() => ProductoStockDto)
  productosBajoStock: ProductoStockDto[];

  @Expose()
  @Type(() => ProductoGraficoDto)
  top5ProductosMasBajoStock: ProductoGraficoDto[];

  @Expose()
  @Type(() => MovimientoResumenDto)
  ultimosMovimientos: MovimientoResumenDto[];
}
