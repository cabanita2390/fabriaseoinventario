export interface RowData {
  id: number;
  tipo: string;
  producto: string;
  cantidad: number;
  unidad: string;
  descripcion: string;
  proveedor: string;
  bodega: string;
  fecha: string;          // Fecha original de la API
  fechaMovimiento?: string; // Campo alternativo de fecha (opcional)
  fechaFormateada?: string; // Fecha formateada para mostrar
  fechaOriginal?: string;   // Fecha original preservada para filtros
}
export interface ProductoAgrupado {
  id: number;
  nombre: string;
  tipoProducto: string;
  estado: string;
  unidadMedida?: { id: number; nombre: string };
  proveedor?: { id: number; nombre: string } | null;
  presentaciones: { id: number; nombre: string }[];
}

export interface Bodega {
  id: number;
  nombre: string;
}

export interface FiltroConfig {
  tipo: 'text' | 'date' | 'select';
  id: string;
  label: string;
  options?: string[];
}

export const filtrosConfig: FiltroConfig[] = [
  { tipo: 'date', id: 'fechaInicio', label: 'Fecha de inicio' },
  { tipo: 'date', id: 'fechaFin', label: 'Fecha fin' },
];