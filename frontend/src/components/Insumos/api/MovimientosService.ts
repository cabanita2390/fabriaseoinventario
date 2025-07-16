import { authFetch } from '../../ui/useAuthFetch';
import Swal from 'sweetalert2';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Tipos de roles (puedes mover esto a un archivo de tipos si lo necesitas en varios lugares)
export type AppRole =
  | 'ADMIN'
  | 'LIDER_PRODUCCION'
  | 'RECEPTOR_MP'
  | 'RECEPTOR_ENVASE'
  | 'RECEPTOR_ETIQUETAS'
  | 'OPERARIO_PRODUCCION'
  | 'USUARIO';

// Mapeo de roles a endpoints permitidos
const roleToEndpointMap: Record<AppRole, string[]> = {
  'ADMIN': ['/movimiento/materia-prima'],
  'LIDER_PRODUCCION': ['/movimiento/materia-prima'],
  'RECEPTOR_MP': ['/movimiento/materia-prima'],
  'RECEPTOR_ENVASE': ['/movimiento/material-envase'],
  'RECEPTOR_ETIQUETAS': [],
  'OPERARIO_PRODUCCION': [],
  'USUARIO': []
};

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

// Función para verificar permisos del endpoint
const checkEndpointPermission = async (endpoint: string): Promise<boolean> => {
  try {
    const response = await authFetch(`${API_BASE_URL}${endpoint}`, {
      method: 'HEAD'
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Función principal para crear movimientos de materia prima
export const crearMovimiento = async (payload: {
  tipo?: string;
  cantidad: number;
  descripcion: string;
  producto_idproducto: number;
  bodega_idbodega: number;
}) => {
  const userRole = getUserRoleFromToken();

  if (!userRole) {
    throw new Error('No se pudo determinar el rol del usuario. Token inválido o ausente.');
  }

  const endpointsPermitidos = roleToEndpointMap[userRole];

  if (endpointsPermitidos.length === 0) {
    throw new Error(`Tu rol (${userRole}) no tiene permiso para crear movimientos de materia prima.`);
  }

  // Verificar permisos para el endpoint específico
  const tienePermiso = await checkEndpointPermission('/movimiento/materia-prima');
  if (!tienePermiso) {
    throw new Error('No tienes permiso para acceder a este recurso.');
  }

  try {
    // Asegurar que el tipo tenga un valor por defecto si no se proporciona
    const payloadCompleto = {
      tipo: 'INGRESO', // Valor por defecto
      ...payload
    };

    const response = await authFetch(`${API_BASE_URL}/movimiento/materia-prima`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadCompleto),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al crear el movimiento de materia prima`);
    }

    // Mostrar notificación de éxito
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Movimiento de materia prima creado correctamente',
      timer: 3000
    });

    return await response.json();
  } catch (error) {
    console.error("Error al crear movimiento de materia prima:", error);

    // Mostrar notificación de error
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error instanceof Error ? error.message : 'Error desconocido al crear movimiento',
      timer: 4000
    });

    throw error;
  }
};

// Función para obtener movimientos de materia prima (similar a tu fetchMovimientos original)
export const obtenerMovimientosMateriaPrima = async (): Promise<any[]> => {
  const userRole = getUserRoleFromToken();

  if (!userRole) {
    throw new Error('No se pudo determinar el rol del usuario.');
  }

  const endpointsPermitidos = roleToEndpointMap[userRole];

  if (!endpointsPermitidos.includes('/movimiento/materia-prima')) {
    throw new Error(`Tu rol (${userRole}) no tiene permiso para ver movimientos de materia prima.`);
  }

  try {
    const response = await authFetch(`${API_BASE_URL}/movimiento/materia-prima`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener movimientos:", error);
    throw error;
  }
};