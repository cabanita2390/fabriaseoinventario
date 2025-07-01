import {useAuthFetch} from '../../ui/useAuthFetch';
import { RowData, ProductoAgrupado, Bodega } from '../types/Typesmovimientos';

export const fetchMovimientos = async (authFetch: any): Promise<RowData[]> => {
  try {
    const response = await authFetch('http://localhost:3000/movimiento');
    const json = await response.json();
    
    return json.map((mov: any) => ({
      id: mov.id,
      tipo: mov.tipo === 'INGRESO' ? 'Entrada' : 'Salida',
      producto: mov.producto?.nombre || '',
      cantidad: mov.cantidad,
      fecha: mov.fechaMovimiento.split('T')[0],
      descripcion: mov.descripcion || '',
      unidad: mov.producto?.unidadMedida?.nombre || '',
      proveedor: mov.producto?.proveedor?.nombre || '',
      bodega: mov.bodega?.nombre || '',
      producto_id: mov.producto?.id,
      bodega_id: mov.bodega?.id,
    }));
  } catch (error) {
    console.error("Error al cargar los movimientos:", error);
    throw error;
  }
};

export const updateMovimiento = async (
  authFetch: any,
  id: number,
  payload: any
): Promise<Response> => {
  return authFetch(`http://localhost:3000/movimiento/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

export const fetchProductosAgrupados = async (authFetch: any): Promise<ProductoAgrupado[]> => {
  try {
    const res = await authFetch('http://localhost:3000/producto');
    const data = await res.json();

    const agrupados: ProductoAgrupado[] = [];
    for (const producto of data) {
      const existente = agrupados.find(p => p.nombre === producto.nombre);
      if (existente) {
        if (!existente.presentaciones.some(pr => pr.id === producto.presentacion.id)) {
          existente.presentaciones.push(producto.presentacion);
        }
      } else {
        agrupados.push({
          ...producto,
          presentaciones: [producto.presentacion],
        });
      }
    }
    return agrupados;
  } catch (err) {
    console.error("Error cargando productos:", err);
    throw err;
  }
};

export const fetchBodegas = async (authFetch: any): Promise<Bodega[]> => {
  try {
    const res = await authFetch('http://localhost:3000/bodega');
    return await res.json();
  } catch (err) {
    console.error("Error cargando bodegas:", err);
    throw err;
  }
};