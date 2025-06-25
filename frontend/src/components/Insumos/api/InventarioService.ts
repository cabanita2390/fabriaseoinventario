import { InventarioItem, UpdateInventarioDto } from '../types/InsumosTipe';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const validateId = (id: number): void => {
  if (!Number.isInteger(id)) throw new Error(`ID inválido: ${id}`);
  if (id <= 0) throw new Error(`ID debe ser positivo: ${id}`);
};


const validateNumber = (value: number, name: string): void => {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`${name} debe ser un número válido`);
  }
  if (value < 0) throw new Error(`${name} no puede ser negativo`);
};

export const obtenerInventarioExistente = async (
  productoId: number, 
  bodegaId: number
): Promise<InventarioItem | null> => {
  try {
    validateId(productoId);
    validateId(bodegaId);

    const response = await fetch(`${API_BASE_URL}/inventario`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status} al obtener inventario`);
    }

    const inventario: InventarioItem[] = await response.json();
    
    if (!Array.isArray(inventario)) {
      throw new Error('Formato de respuesta inválido');
    }

    return inventario.find(item => 
      item?.producto?.id === productoId && 
      item?.bodega?.id === bodegaId
    ) ?? null;
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    throw error; // Mejor re-lanzar el error para manejo superior
  }
};

export const crearInventario = async (
  productoId: number, 
  bodegaId: number, 
  cantidad: number
) => {
  try {
    validateId(productoId);
    validateId(bodegaId);
    validateNumber(cantidad, 'Cantidad');

    const payload = {
      cantidad_actual: cantidad,
      fechaUltimaActualizacion: new Date().toISOString(),
      producto: { id: productoId },
      bodega: { id: bodegaId }
    };

    const response = await fetch(`${API_BASE_URL}/inventario`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al crear inventario:", error);
    throw error;
  }
};

export const actualizarInventario = async (
  inventarioId: number, 
  nuevaCantidad: number,
  productoId: number,
  bodegaId: number
) => {
  try {
    validateId(inventarioId);
    validateId(productoId);
    validateId(bodegaId);
    validateNumber(nuevaCantidad, 'Nueva cantidad');

    const payload: UpdateInventarioDto = {
      cantidad_actual: nuevaCantidad,
      fecha_ultima_actualizacion: new Date().toISOString(),
      producto_idproducto: productoId,
      bodega_idbodega: bodegaId
    };

    const url = new URL(`${API_BASE_URL}/inventario/${encodeURIComponent(inventarioId)}`);
    const response = await fetch(url.toString(), {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al actualizar inventario:", error);
    throw error;
  }
};