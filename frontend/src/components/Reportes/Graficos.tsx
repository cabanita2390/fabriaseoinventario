import React, { useState, useEffect } from 'react';
import Filtro from '../Movimientos/Filtro';
import GraficoProductos from './GraficoProductos';
import { FieldConfig } from '../types/FieldConfig';
import { authFetch } from '../../components/ui/useAuthFetch';
import Swal from 'sweetalert2';

// Definición de tipos y roles
type AppRole =
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

type Movimiento = {
  fecha: string;
  nombre: string;
  cantidad: number;
  tipo: 'ENTRADA' | 'SALIDA';
};

// Función para obtener la fecha de hace 7 días
const getOneWeekAgoDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
};

// Función para obtener la fecha de hoy
const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const Graficos: React.FC = () => {
  const [data, setData] = useState<Movimiento[]>([]);
  const [allData, setAllData] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FieldConfig[]>([
    { 
      tipo: 'date', 
      id: 'fechaInicio', 
      label: 'Fecha de inicio',
      max: getTodayDate(),
      defaultValue: getOneWeekAgoDate()
    },
    { 
      tipo: 'date', 
      id: 'fechaFin', 
      label: 'Fecha fin',
      max: getTodayDate(),
      defaultValue: getTodayDate()
    },
    {
      tipo: 'select',
      id: 'producto',
      label: 'Producto',
      options: [],
      defaultValue: ''
    }
  ]);

  const normalizeDate = (dateString: string): string | null => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : null;
    } catch {
      return null;
    }
  };

  // Función para extraer productos únicos de los movimientos
  const updateProductOptions = (movimientos: Movimiento[]) => {
    const productosUnicos = Array.from(
      new Set(movimientos.map(mov => mov.nombre))
    ).filter(nombre => nombre && nombre !== 'Sin nombre');

    setFiltros(prev => prev.map(filtro => 
      filtro.id === 'producto' 
        ? { 
            ...filtro, 
            options: [
              { value: '', label: 'Todos los productos' },
              ...productosUnicos.map(nombre => ({ value: nombre, label: nombre }))
            ]
          }
        : filtro
    ));
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

  const checkEndpointPermission = async (endpoint: string): Promise<boolean> => {
    try {
      const response = await authFetch(`http://localhost:3000${endpoint}`, {
        method: 'HEAD'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const fetchMovimientosPorRol = async (): Promise<Movimiento[]> => {
    const userRole = getUserRoleFromToken();

    if (!userRole) {
      throw new Error('No se pudo determinar el rol del usuario. Token inválido o ausente.');
    }

    const endpointsToTry = roleToEndpointMap[userRole];

    if (endpointsToTry.length === 0) {
      throw new Error(`Tu rol (${userRole}) no tiene acceso a ningún endpoint de movimientos.`);
    }

    let lastError: Error | null = null;
    let movimientosAcumulados: Movimiento[] = [];

    for (const endpoint of endpointsToTry) {
      try {
        const hasPermission = await checkEndpointPermission(endpoint);
        if (!hasPermission) {
          console.log(`Sin permiso para el endpoint: ${endpoint}`);
          continue;
        }

        const response = await authFetch(`http://localhost:3000${endpoint}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const json = await response.json();
        const movimientos: Movimiento[] = json.map((mov: any) => ({
          fecha: normalizeDate(mov.fechaMovimiento) || mov.fechaMovimiento,
          nombre: mov.producto?.nombre || 'Sin nombre',
          cantidad: mov.cantidad || 0,
          tipo: mov.tipo === 'INGRESO' ? 'ENTRADA' : 'SALIDA'
        }));

        movimientosAcumulados = [...movimientosAcumulados, ...movimientos];
      } catch (error) {
        if (error instanceof Error) {
          lastError = error;
          console.error(`Error con endpoint ${endpoint}:`, error);
        }
        continue;
      }
    }

    if (movimientosAcumulados.length > 0) {
      return movimientosAcumulados;
    }

    if (lastError) {
      throw lastError;
    }

    throw new Error(`No tienes acceso a los endpoints de movimientos para tu rol (${userRole}).`);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const movimientos = await fetchMovimientosPorRol();
        setAllData(movimientos);
        updateProductOptions(movimientos);
        
        const inicio = getOneWeekAgoDate();
        const fin = getTodayDate();
        const filtrado = movimientos.filter(mov => {
          const fechaMov = normalizeDate(mov.fecha);
          if (!fechaMov) return false;
          if (fechaMov < inicio) return false;
          if (fechaMov > fin) return false;
          return true;
        });
        
        setData(filtrado);
      } catch (error) {
        console.error("Error cargando movimientos:", error);
        const errorMessage = error instanceof Error ? 
          error.message : 'Error desconocido al cargar datos';
        
        setError(errorMessage);
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          timer: 4000
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBuscar = (filtros: Record<string, string>) => {
    const { fechaInicio, fechaFin, producto } = filtros;
    const inicio = normalizeDate(fechaInicio);
    const fin = normalizeDate(fechaFin);

    const filtrado = allData.filter(mov => {
      const fechaMov = normalizeDate(mov.fecha);
      
      if (!fechaMov) return false;
      if (inicio && fechaMov < inicio) return false;
      if (fin && fechaMov > fin) return false;
      
      if (producto && producto !== '') {
        if (mov.nombre !== producto) {
          return false;
        }
      }
      
      return true;
    });
    
    setData(filtrado);
  };

  const handleReset = () => {
    const inicio = getOneWeekAgoDate();
    const fin = getTodayDate();
    const filtrado = allData.filter(mov => {
      const fechaMov = normalizeDate(mov.fecha);
      if (!fechaMov) return false;
      if (fechaMov < inicio) return false;
      if (fechaMov > fin) return false;
      return true;
    });
    setData(filtrado);
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Gráficos de Movimientos</h2>
        <p className="text-gray-600">Visualiza los movimientos de productos por fecha y filtro específico</p>
      </div>

      <Filtro 
        fields={filtros} 
        onSearch={handleBuscar} 
        onReset={handleReset}
        showSearchBar={false}
      />
      
      {loading ? (
        <div className="text-center p-8">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"
            data-testid="loading-spinner"
          ></div>
          <p>Cargando datos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center p-8 bg-yellow-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-medium text-yellow-800 mt-4">No hay datos disponibles</h3>
          <p className="mt-2 text-sm text-yellow-700">
            {allData.length === 0 
              ? "No se encontraron movimientos en el sistema" 
              : "No hay movimientos que coincidan con los filtros aplicados"}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Mostrando {data.length} movimiento{data.length !== 1 ? 's' : ''} 
            {data.length > 0 && data.length < allData.length && ` de ${allData.length} total`}
          </div>
          <GraficoProductos datos={data} />
        </>
      )}
    </div>
  );
};

export default Graficos;