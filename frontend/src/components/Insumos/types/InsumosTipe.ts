export interface Presentacion {
  id: number;
  nombre: string;
}

export interface ProductoAgrupado {
  id: number;
  nombre: string;
  tipoProducto: string;
  estado: string;
  unidadMedida: { id: number; nombre: string } | null;
  proveedor: { id: number; nombre: string } | null;
  presentaciones: [Presentacion, ...Presentacion[]]; // Al menos una presentación
}


export interface FormState {
  tipo: string;
  producto: ProductoAgrupado | null;
  presentacionSeleccionada: Presentacion | null;
  cantidad: number | "";
  fecha: string;
  descripcion: string;
  bodega: string;
}

export interface InventarioItem {
  id: number;
  cantidad_actual: number;
  fechaUltimaActualizacion: string;
  producto: {
    id: number;
  };
  bodega: {
    id: number;
  };
}

export interface UpdateInventarioDto {
  cantidad_actual: number;
  fecha_ultima_actualizacion: string;
  producto_idproducto: number;
  bodega_idbodega: number;
}

export const SECCIONES = [
  {
    titulo: 'Materia Prima',
    acciones: ['Ingreso de materia prima', 'Salida de materia prima'],
  },
  {
    titulo: 'Envases',
    acciones: ['Ingreso de Envase', 'Salida de Envase'],
  },
  {
    titulo: 'Etiquetas',
    acciones: ['Ingreso de Etiqueta', 'Salida de Etiqueta'],
  },
] as const;

export type Tipo =
  | 'Ingreso de materia prima'
  | 'Salida de materia prima'
  | 'Ingreso de Envase'
  | 'Salida de Envase'
  | 'Ingreso de Etiqueta'
  | 'Salida de Etiqueta';

export const INIT_FORM: FormState = {
  tipo: "Ingreso",
  producto: null,
  presentacionSeleccionada: null,
  cantidad: "",
  fecha: new Date().toISOString().slice(0, 10),
  descripcion: "",
  bodega: "",
};