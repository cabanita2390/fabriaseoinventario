import { InventarioItem, UpdateInventarioDto } from '../types/InsumosTipe';

export const obtenerInventarioExistente = async (productoId: number, bodegaId: number): Promise<InventarioItem | null> => {
  try {
    const response = await fetch("http://localhost:3000/inventario");
    if (!response.ok) throw new Error("Error al obtener inventario");
    
    const inventario: InventarioItem[] = await response.json();
    return inventario.find(item => 
      item.producto.id === productoId && 
      item.bodega.id === bodegaId
    ) || null;
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    return null;
  }
};

export const crearInventario = async (productoId: number, bodegaId: number, cantidad: number) => {
  try {
    const payload = {
      cantidad_actual: cantidad,
      fechaUltimaActualizacion: new Date().toISOString(),
      producto: { id: productoId },
      bodega: { id: bodegaId }
    };

    const response = await fetch("http://localhost:3000/inventario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Error al crear inventario");
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
    const payload: UpdateInventarioDto = {
      cantidad_actual: nuevaCantidad,
      fecha_ultima_actualizacion: new Date().toISOString(),
      producto_idproducto: productoId,
      bodega_idbodega: bodegaId
    };

    const response = await fetch(`http://localhost:3000/inventario/${inventarioId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al actualizar inventario:", error);
    throw error;
  }
};