import { InventarioItemAPI, Bodega, InventarioItem } from '../types/inventarioTypes';
import { authFetch } from '../../ui/useAuthFetch';
import Swal from 'sweetalert2';

const API_BASE_URL = 'https://fabriaseo-inventario-backend.onrender.com';

// Tipos de producto para filtrar
export type TipoProductoFiltro = 'MATERIA_PRIMA' | 'MATERIAL_DE_ENVASE' | 'ETIQUETAS';

export type AppRole =
  | 'ADMIN'
  | 'LIDER_PRODUCCION'
  | 'RECEPTOR_MP'
  | 'RECEPTOR_ENVASE'
  | 'RECEPTOR_ETIQUETAS'
  | 'OPERARIO_PRODUCCION'
  | 'USUARIO';

// Mapeo de roles a endpoints (nombres originales)
const roleToEndpointMap: Record<AppRole, string[]> = {  
  'ADMIN': ['/inventario'],
  'LIDER_PRODUCCION': ['/inventario'],
  'RECEPTOR_MP': ['/inventario/materia-prima'],
  'RECEPTOR_ENVASE': ['/inventario/material-envase'],
  'RECEPTOR_ETIQUETAS': ['/inventario/etiquetas'],
  'OPERARIO_PRODUCCION': ['/inventario/etiquetas','/inventario/material-envase'],
  'USUARIO': []
};

// Función para extraer el rol del token JWT (manteniendo nombre original)
export const getUserRoleFromToken = (): AppRole | null => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.rol as AppRole;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Función para verificar permisos (manteniendo nombre original)
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

// Función para construir la URL con query parameters - SIMPLIFICADA
const buildInventarioURL = (endpoint: string, tipoProducto?: TipoProductoFiltro): string => {
  const baseURL = `${API_BASE_URL}${endpoint}`;
  
  if (!tipoProducto) {
    return baseURL;
  }
  
  // Crear URL con query parameter específico
  const url = new URL(baseURL);
  url.searchParams.append('tipoProducto', tipoProducto);
  
  return url.toString();
};

// Función principal para obtener inventario - SIMPLIFICADA para usar solo backend
export const fetchInventario = async (tipoProducto?: TipoProductoFiltro): Promise<InventarioItemAPI[]> => {
  const userRole = getUserRoleFromToken();

  if (!userRole) {
    throw new Error('No se pudo determinar el rol del usuario. Token inválido o ausente.');
  }

  const endpointsToTry = roleToEndpointMap[userRole];

  if (endpointsToTry.length === 0) {
    throw new Error(`Tu rol (${userRole}) no tiene acceso a ningún endpoint de inventario.`);
  }

  let combinedResults: InventarioItemAPI[] = [];
  let lastError: Error | null = null;
  let successfulRequests = 0;

  for (const endpoint of endpointsToTry) {
    try {
      // Verificar permisos usando el endpoint base (sin query params)
      const hasPermission = await checkEndpointPermission(endpoint);
      if (!hasPermission) continue;

      // Construir URL con query parameters
      const fullURL = buildInventarioURL(endpoint, tipoProducto);
      
      console.log(`Fetching from: ${fullURL}`);
      
      const response = await authFetch(fullURL);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const json = await response.json();
      
      if (Array.isArray(json)) {
        console.log(`Received ${json.length} items from ${endpoint}`);
        combinedResults = [...combinedResults, ...json];
        successfulRequests++;
      }
      
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      if (error instanceof Error) {
        lastError = error;
      }
      continue;
    }
  }

  // Si obtuvimos datos de al menos un endpoint, devolverlos
  if (successfulRequests > 0) {
    return combinedResults;
  }

  // Si llegamos aquí, no pudimos obtener datos de ningún endpoint
  if (lastError) {
    throw lastError;
  }
  
  const tipoTexto = tipoProducto ? ` del tipo ${tipoProducto}` : '';
  
  // Mostrar mensaje informativo si no hay datos
  Swal.fire({
    icon: 'info',
    title: 'No hay datos',
    text: `No se encontraron items de inventario${tipoTexto} para tu rol (${userRole}).`,
    timer: 4000,
    showConfirmButton: true
  });

  return []; // Devolver array vacío si no hay datos
};
// Funciones originales del API (nombres en inglés)
export const fetchBodegas = async (): Promise<Bodega[]> => {
  const response = await authFetch(`${API_BASE_URL}/bodega`);
  if (!response.ok) throw new Error('Error al cargar las bodegas');
  return response.json();
};

export const updateInventarioItem = async (id: number, payload: {
  cantidad_actual: number;
  producto_idproducto?: number;
  bodega_idbodega?: number;
}) => {
  const response = await authFetch(`${API_BASE_URL}/inventario/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Error al actualizar el inventario');
  return response.json();
};

export const deleteInventarioItem = async (id: number): Promise<void> => {
  const response = await authFetch(`${API_BASE_URL}/inventario/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Error al eliminar el item del inventario');
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