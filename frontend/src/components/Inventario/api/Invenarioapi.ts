import { InventarioItemAPI, Bodega, InventarioItem } from '../types/inventarioTypes';
import { authFetch } from '../../ui/useAuthFetch';
import Swal from 'sweetalert2';

const API_BASE_URL = 'http://localhost:3000';

// Tipos de producto para filtrar
export type TipoProductoFiltro = 'MATERIA_PRIMA' | 'MATERIAL_DE_ENVASE' | 'ETIQUETAS';

// Definición de tipos para los roles (manteniendo nombres originales en inglés)
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
  'OPERARIO_PRODUCCION': ['/inventario/etiquetas', '/inventario/material-envase'],
  'USUARIO': []
};

// Función para extraer el rol del token JWT (manteniendo nombre original)
const getUserRoleFromToken = (): AppRole | null => {
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

// Función para construir la URL con query parameters - CORREGIDA para ser más específica
const buildInventarioURL = (endpoint: string, tipoProducto?: TipoProductoFiltro): string => {
  const baseURL = `${API_BASE_URL}${endpoint}`;
  
  if (!tipoProducto) {
    return baseURL;
  }
  
  // Agregar el query parameter especificando que es para el tipoProducto del PRODUCTO, no de la presentación
  const url = new URL(baseURL);
  url.searchParams.append('productoTipo', tipoProducto); // Cambiado de 'tipo' a 'productoTipo' para ser más específico
  
  return url.toString();
};

// Función auxiliar para filtrar en el frontend si el backend no maneja el filtro correctamente
const filterInventarioByProductType = (data: InventarioItemAPI[], tipoProducto?: TipoProductoFiltro): InventarioItemAPI[] => {
  if (!tipoProducto) return data;
  
  return data.filter(item => {
    // Filtrar específicamente por el tipoProducto del PRODUCTO, no de la presentación
    return item.producto.tipoProducto === tipoProducto;
  });
};

// Función principal para obtener inventario - ACTUALIZADA con filtrado mejorado
export const fetchInventario = async (tipoProducto?: TipoProductoFiltro): Promise<InventarioItemAPI[]> => {
  const userRole = getUserRoleFromToken();

  if (!userRole) {
    throw new Error('No se pudo determinar el rol del usuario. Token inválido o ausente.');
  }

  const endpointsToTry = roleToEndpointMap[userRole];

  if (endpointsToTry.length === 0) {
    throw new Error(`Tu rol (${userRole}) no tiene acceso a ningún endpoint de inventario.`);
  }

  let lastError: Error | null = null;
  let allData: InventarioItemAPI[] = [];

  for (const endpoint of endpointsToTry) {
    try {
      // Verificar permisos usando el endpoint base (sin query params)
      const hasPermission = await checkEndpointPermission(endpoint);
      if (!hasPermission) continue;

      // Primero intentar con el filtro en el backend
      let fullURL = buildInventarioURL(endpoint, tipoProducto);
      let response = await authFetch(fullURL);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      let json = await response.json();
      
      // Si el backend no devuelve datos filtrados correctamente o devuelve datos mixtos,
      // intentar obtener todos los datos y filtrar en el frontend
      if (tipoProducto && Array.isArray(json)) {
        // Verificar si los datos ya están correctamente filtrados
        const incorrectlyFiltered = json.some(item => item.producto.tipoProducto !== tipoProducto);
        
        if (incorrectlyFiltered || json.length === 0) {
          console.warn(`El backend no filtró correctamente por tipoProducto=${tipoProducto}, aplicando filtro en frontend`);
          
          // Obtener todos los datos sin filtro
          const baseURL = `${API_BASE_URL}${endpoint}`;
          response = await authFetch(baseURL);
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          json = await response.json();
          
          // Aplicar filtro en el frontend
          json = filterInventarioByProductType(json, tipoProducto);
        }
      }
      
      if (Array.isArray(json)) {
        allData = [...allData, ...json];
      }
      
      // Si encontramos datos, salir del loop
      if (allData.length > 0) {
        break;
      }
      
    } catch (error) {
      if (error instanceof Error) {
        lastError = error;
      }
      continue;
    }
  }

  // Eliminar duplicados basados en el ID
  const uniqueData = allData.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id)
  );

  if (uniqueData.length === 0) {
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
  }

  return uniqueData;
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