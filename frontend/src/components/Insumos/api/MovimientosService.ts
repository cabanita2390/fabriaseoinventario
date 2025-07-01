import { authFetch } from '../../ui/useAuthFetch'; // ✅ Correcto

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
// const { authFetch } = useAuthFetch(); // ❌ ELIMINA esta línea - no puedes usar hooks en servicios

export const crearMovimiento = async (payload: {
  tipo: string;
  cantidad: number;
  descripcion: string;
  producto_idproducto: number;
  bodega_idbodega: number;
}) => {
  try {
    const response = await authFetch(`${API_BASE_URL}/movimiento`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al crear el movimiento`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error al crear movimiento:", error);
    throw error;
  }
};