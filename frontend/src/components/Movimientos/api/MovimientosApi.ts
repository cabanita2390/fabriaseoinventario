import Swal from 'sweetalert2';
import { 
  RowData, 
  ProductoAgrupado, 
  Bodega 
} from '../types/Typesmovimientos';

export type AppRole =
  | 'ADMIN'
  | 'LIDER_PRODUCCION'
  | 'RECEPTOR_MP'
  | 'RECEPTOR_ENVASE'
  | 'RECEPTOR_ETIQUETAS'
  | 'OPERARIO_PRODUCCION'
  | 'USUARIO';

const roleToEndpointMap: Record<AppRole, string[]> = {
  'ADMIN': ['/movimiento'],
  'LIDER_PRODUCCION': ['/movimiento'],
  'RECEPTOR_MP': ['/movimiento/materia-prima'],
  'RECEPTOR_ENVASE': ['/movimiento/material-envase'],
  'RECEPTOR_ETIQUETAS': ['/movimiento/etiquetas'],
  'OPERARIO_PRODUCCION': ['/movimiento/etiquetas', '/movimiento/material-envase'],
  'USUARIO': []
};

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

const transformMovimientoData = (json: any[]): RowData[] => {
  return json.map((mov: any) => ({
    id: mov.id,
    tipo: mov.tipo === 'INGRESO' ? 'Entrada' : 'Salida',
    producto: mov.producto?.nombre || '',
    tipoProducto: mov.producto?.tipoProducto || '',
    cantidad: mov.cantidad,
    fecha: mov.fechaMovimiento.split('T')[0],
    descripcion: mov.descripcion || '',
    unidad: mov.producto?.unidadMedida?.nombre || '',
    proveedor: mov.producto?.proveedor?.nombre || '',
    bodega: mov.bodega?.nombre || '',
    producto_id: mov.producto?.id,
    bodega_id: mov.bodega?.id,
  }));
};

export const fetchMovimientos = async (authFetch: any): Promise<RowData[]> => {
  const userRole = getUserRoleFromToken();

  if (!userRole) {
    throw new Error('No se pudo determinar el rol del usuario. Token inválido o ausente.');
  }

  const endpointsToTry = roleToEndpointMap[userRole];

  if (endpointsToTry.length === 0) {
    throw new Error(`Tu rol (${userRole}) no tiene acceso a ningún endpoint de movimientos.`);
  }

  let allMovimientos: RowData[] = [];
  let endpointsWithData = 0;
  let lastError: Error | null = null;

  for (const endpoint of endpointsToTry) {
    try {
      const response = await authFetch(`http://localhost:3000${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const json = await response.json();
      
      if (Array.isArray(json)) {
        if (json.length === 0) {
          // Mostrar alerta pero continuar con otros endpoints
          Swal.fire({
            icon: 'info',
            title: 'Sin datos',
            text: `El endpoint ${endpoint} no contiene movimientos registrados.`,
            timer: 3000,
            showConfirmButton: false
          });
        } else {
          const transformed = transformMovimientoData(json);
          allMovimientos = [...allMovimientos, ...transformed];
          endpointsWithData++;
        }
      } else {
        throw new Error(`La respuesta de ${endpoint} no es un array válido`);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          lastError = new Error("Hubo un problema al conectarse al servidor. Verifica tu conexión a internet.");
        } else {
          lastError = error;
        }
      }
    }
  }

  if (allMovimientos.length > 0) {
    return allMovimientos;
  }

  if (endpointsWithData === 0 && lastError) {
    throw lastError;
  }

  if (endpointsWithData === 0) {
    throw new Error(`No se encontraron movimientos en los endpoints para tu rol (${userRole}).`);
  }

  return [];
};

export const updateMovimiento = async (
  authFetch: any,
  id: number,
  payload: any
): Promise<Response> => {
  try {
    const response = await authFetch(`http://localhost:3000/movimiento/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error al actualizar el movimiento');
  }
};

export const fetchProductosAgrupados = async (authFetch: any): Promise<ProductoAgrupado[]> => {
  try {
    const res = await authFetch('http://localhost:3000/producto');
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    const agrupados: ProductoAgrupado[] = [];
    
    for (const producto of data) {
      const existente = agrupados.find(p => p.nombre === producto.nombre);
      if (existente) {
        // Corregido: Añadido tipo explícito al parámetro
        if (!existente.presentaciones.some((pr: { id: number }) => pr.id === producto.presentacion.id)) {
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
    throw new Error(err instanceof Error ? err.message : 'Error cargando productos');
  }
};

export const fetchBodegas = async (authFetch: any): Promise<Bodega[]> => {
  try {
    const res = await authFetch('http://localhost:3000/bodega');
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Error cargando bodegas');
  }
};