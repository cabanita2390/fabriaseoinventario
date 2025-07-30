import { authFetch } from '../../ui/useAuthFetch';
import Swal from 'sweetalert2';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Tipos de roles
export type AppRole =
  | 'ADMIN'
  | 'LIDER_PRODUCCION'
  | 'RECEPTOR_MP'
  | 'RECEPTOR_ENVASE'
  | 'RECEPTOR_ETIQUETAS'
  | 'OPERARIO_PRODUCCION'
  | 'USUARIO';

// Tipo para los movimientos disponibles
export type TipoMovimiento = 'materia-prima' | 'material-envase' | 'etiquetas';

// Mapeo de roles a endpoints permitidos (actualizado)
const roleToEndpointMap: Record<AppRole, TipoMovimiento[]> = {
  'ADMIN': ['materia-prima', 'material-envase', 'etiquetas'], // Admin tiene acceso completo
  'LIDER_PRODUCCION': ['materia-prima', 'material-envase', 'etiquetas'], // Líder puede manejar todos los tipos
  'RECEPTOR_MP': ['materia-prima'],
  'RECEPTOR_ENVASE': ['material-envase'],
  'RECEPTOR_ETIQUETAS': ['etiquetas'],
  'OPERARIO_PRODUCCION': ['material-envase', 'etiquetas'], // Operario puede manejar envases y etiquetas
  'USUARIO': []
};

// Interfaz para el payload base
interface BaseMovimientoPayload {
  tipo?: string;
  cantidad: number;
  descripcion: string;
  producto_idproducto: number;
  bodega_idbodega: number;
}

// Función para extraer el rol del token JWT
const getUserRoleFromToken = (): AppRole | null => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.rol as AppRole;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
};

// Función principal para crear movimientos
export const crearMovimiento = async (
  tipo: TipoMovimiento,
  payload: BaseMovimientoPayload
) => {
  const userRole = getUserRoleFromToken();

  if (!userRole) {
    throw new Error('No se pudo determinar el rol del usuario. Token inválido o ausente.');
  }

  const movimientosPermitidos = roleToEndpointMap[userRole];

  if (!movimientosPermitidos.includes(tipo)) {
    const tiposPermitidos = movimientosPermitidos.join(', ') || 'ninguno';
    throw new Error(
      `Tu rol (${userRole}) no tiene permiso para crear movimientos de ${tipo}. ` +
      `Permitidos: ${tiposPermitidos}`
    );
  }

  try {
    // Asegurar que el tipo tenga un valor por defecto si no se proporciona
    const payloadCompleto = {
      tipo: 'INGRESO', // Valor por defecto
      ...payload
    };

    const endpoint = `/movimiento/${tipo}`;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(payloadCompleto),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al crear el movimiento de ${tipo}`);
    }

    // Mostrar notificación de éxito
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: `Movimiento de ${tipo} creado correctamente`,
      timer: 3000
    });

    return await response.json();
  } catch (error) {
    console.error(`Error al crear movimiento de ${tipo}:`, error);

    // Mostrar notificación de error
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error instanceof Error ? error.message : `Error desconocido al crear movimiento de ${tipo}`,
      timer: 4000
    });

    throw error;
  }
};
// Función para obtener movimientos
export const obtenerMovimientos = async (tipo: TipoMovimiento): Promise<any[]> => {
  const userRole = getUserRoleFromToken();

  if (!userRole) {
    throw new Error('No se pudo determinar el rol del usuario.');
  }

  const movimientosPermitidos = roleToEndpointMap[userRole];

  if (!movimientosPermitidos.includes(tipo)) {
    throw new Error(`Tu rol (${userRole}) no tiene permiso para ver movimientos de ${tipo}.`);
  }

  try {
    const endpoint = `/movimiento/${tipo}`;
    const response = await authFetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error al obtener movimientos de ${tipo}:`, error);
    throw error;
  }
};

// Función para obtener todos los tipos de movimiento permitidos para el usuario actual
export const obtenerMovimientosPermitidos = (): TipoMovimiento[] => {
  const userRole = getUserRoleFromToken();
  if (!userRole) return [];
  return roleToEndpointMap[userRole];
};