// src/dashboard/dto/dashboard-response.dto.ts

export interface MovimientoResumenDto {
  id: number;
  tipo: string;
  cantidad: number;
  fechaMovimiento: string;
  descripcion: string;
  producto: {
    id: number;
    nombre: string;
  };
  bodega: {
    id: number;
    nombre: string;
  };
}

export interface ProductoStockDto {
  id: number;
  nombre: string;
  cantidad_actual: number;
}

export interface ProductoGraficoDto {
  nombre: string;
  totalStock: number;
}

export interface DashboardResponseDto {
  totalMovimientosHoy: number;
  productosBajoStock: ProductoStockDto[];
  top5ProductosMasBajoStock: ProductoGraficoDto[];
  ultimosMovimientos: MovimientoResumenDto[]; // ahora 6
}
