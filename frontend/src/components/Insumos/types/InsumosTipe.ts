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

  export type RolUsuario = 
  | 'ADMIN'
  | 'LIDER_PRODUCCION'
  | 'RECEPTOR_MP'
  | 'RECEPTOR_ENVASE'
  | 'RECEPTOR_ETIQUETAS'
  | 'OPERARIO_PRODUCCION'
  | 'USUARIO';

// Mapeo de acciones permitidas por rol
export const PERMISOS_POR_ROL: Record<RolUsuario, Tipo[]> = {
  ADMIN: [
    'Ingreso de materia prima', 
    'Salida de materia prima',
    'Ingreso de Envase',
    'Salida de Envase',
    'Ingreso de Etiqueta',
    'Salida de Etiqueta'
  ],
  LIDER_PRODUCCION: [
    'Ingreso de materia prima', 
    'Salida de materia prima',
    'Ingreso de Envase',
    'Salida de Envase',
    'Ingreso de Etiqueta',
    'Salida de Etiqueta'
  ],
  RECEPTOR_MP: ['Ingreso de materia prima','Salida de materia prima'],
  RECEPTOR_ENVASE: ['Ingreso de Envase','Salida de Envase'],
  RECEPTOR_ETIQUETAS: ['Ingreso de Etiqueta','Salida de Etiqueta'],
  OPERARIO_PRODUCCION: ['Salida de Envase','Salida de Etiqueta'],
  USUARIO: []
};

export const INIT_FORM: FormState = {
  tipo: "Ingreso",
  producto: null,
  presentacionSeleccionada: null,
  cantidad: "",
  fecha: new Date().toISOString().slice(0, 10),
  descripcion: "",
  bodega: "",
};