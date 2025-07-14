import Filtro from '../Movimientos/Filtro';
import GraficoProductos from './GraficoProductos';
import { FieldConfig } from '../types/FieldConfig';
import { useState, useEffect } from 'react';
import { authFetch } from '../../components/ui/useAuthFetch';

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

// Definición de los filtros con valores predeterminados
const filtros: FieldConfig[] = [
  { 
    tipo: 'date', 
    id: 'fechaInicio', 
    label: 'Fecha de inicio',
    max: getTodayDate(),
    defaultValue: getOneWeekAgoDate() // Establecemos el valor predeterminado a hace 7 días
  },
  { 
    tipo: 'date', 
    id: 'fechaFin', 
    label: 'Fecha fin',
    max: getTodayDate(),
    defaultValue: getTodayDate() // Establecemos el valor predeterminado a hoy
  },
];

type Movimiento = {
  fecha: string;
  nombre: string;
  cantidad: number;
  tipo: 'ENTRADA' | 'SALIDA';
};

const Graficos = () => {
  const [data, setData] = useState<Movimiento[]>([]);
  const [allData, setAllData] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeDate = (dateString: string): string | null => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await authFetch('http://localhost:3000/movimiento');
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        
        const json = await res.json();
        const movimientos: Movimiento[] = json.map((mov: any) => ({
          fecha: normalizeDate(mov.fechaMovimiento) || mov.fechaMovimiento,
          nombre: mov.producto?.nombre || 'Sin nombre',
          cantidad: mov.cantidad || 0,
        }));

        setAllData(movimientos);
        
        // Filtrar automáticamente por el rango predeterminado (última semana)
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
        setError('Error al cargar datos. Por favor intente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBuscar = (filtros: Record<string, string>) => {
    const { fechaInicio, fechaFin } = filtros;
    const inicio = normalizeDate(fechaInicio);
    const fin = normalizeDate(fechaFin);

    const filtrado = allData.filter(mov => {
      const fechaMov = normalizeDate(mov.fecha);
      if (!fechaMov) return false;
      if (inicio && fechaMov < inicio) return false;
      if (fin && fechaMov > fin) return false;
      return true;
    });
    
    setData(filtrado);
  };

  return (
    <div className="p-4">
      <div className="mb-6">
      </div>

      <Filtro 
        fields={filtros} 
        onSearch={handleBuscar} 
        onReset={() => setData(allData)}
        showSearchBar={false}
      />
      
      {loading ? (
        <div className="text-center p-8">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"
            data-testid="loading-spinner" // Añade este atributo
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
          <GraficoProductos datos={data} />
        </>
      )}
    </div>
  );
};

export default Graficos;