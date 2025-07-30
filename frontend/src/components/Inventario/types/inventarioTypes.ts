export interface UnidadMedida {
  id: number;
  nombre: string;
}

export interface Presentacion {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  nombre: string;
  tipoProducto: string;
  estado: string;
  presentacion: Presentacion;
  unidadMedida: UnidadMedida;
}

export interface Bodega {
  id: number;
  nombre: string;
  ubicacion: string;
}

export interface InventarioItemAPI {
  id: number;
  cantidad_actual: number;
  fechaUltimaActualizacion: string;
  producto: Producto;
  bodega: Bodega;
}

export interface InventarioItem {
  id: number;
  nombre: string;
  tipo: string;
  presentacion: string;
  unidad_medida: string;
  cantidad_actual: number;
  estado: string;
  fechaUltimaActualizacion: string;
  bodega: string;
  producto_id?: number;
  bodega_id?: number;
}