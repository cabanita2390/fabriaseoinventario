import { authFetch } from '../../ui/useAuthFetch';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const crearMovimientoMateriaPrima = async (payload: {
  tipo?: string; // Hacer opcional si no siempre se envía
  cantidad: number;
  descripcion: string;
  producto_idproducto: number;  // Cambiar a producto_idproducto
  bodega_idbodega: number;      // Cambiar a bodega_idbodega
}) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/movimiento/materia-prima`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), // Enviar el payload directamente
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al crear el movimiento de materia prima`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error al crear movimiento de materia prima:", error);
    
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Error desconocido al crear movimiento de materia prima');
  }
};