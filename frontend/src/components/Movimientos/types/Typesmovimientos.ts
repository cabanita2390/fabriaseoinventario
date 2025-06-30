export interface RowData {
  id: number;
  tipo: string;
  producto: string;
  cantidad: number;
  fecha: string;
  descripcion: string;
  unidad: string;
  proveedor: string;
  bodega: string;
  producto_id?: number;
  bodega_id?: number;
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