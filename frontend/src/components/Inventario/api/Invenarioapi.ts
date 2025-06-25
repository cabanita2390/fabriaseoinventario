import { InventarioItemAPI, Bodega,InventarioItem } from '../types/inventarioTypes';

const API_BASE_URL = 'http://localhost:3000';

export const fetchInventario = async (): Promise<InventarioItemAPI[]> => {
  const response = await fetch(`${API_BASE_URL}/inventario`);
  if (!response.ok) throw new Error('Error al cargar el inventario');
  return response.json();
};

export const fetchBodegas = async (): Promise<Bodega[]> => {
  const response = await fetch(`${API_BASE_URL}/bodega`);
  if (!response.ok) throw new Error('Error al cargar las bodegas');
  return response.json();
};

export const updateInventarioItem = async (id: number, payload: {
  cantidad_actual: number;
  producto_idproducto?: number;
  bodega_idbodega?: number;
}) => {
  const response = await fetch(`${API_BASE_URL}/inventario/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Error al actualizar el inventario');
  return response.json();
};

export const formatFecha = (fechaStr: string): string => {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const transformInventarioData = (data: InventarioItemAPI[]): InventarioItem[] => {
  return data.map(item => ({
    id: item.id,
    nombre: item.producto.nombre,
    tipo: item.producto.tipoProducto,
    presentacion: item.producto.presentacion.nombre,
    unidad_medida: item.producto.unidadMedida.nombre,
    cantidad_actual: item.cantidad_actual,
    estado: item.producto.estado,
    fechaUltimaActualizacion: formatFecha(item.fechaUltimaActualizacion),
    bodega: item.bodega.nombre,
    producto_id: item.producto.id,
    bodega_id: item.bodega.id
  }));
};