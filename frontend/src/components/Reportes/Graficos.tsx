import Filtro from '../Movimientos/Filtro';
import GraficoProductos from './GraficoProductos';
import { FieldConfig } from '../types/FieldConfig';
import { useState, useEffect } from 'react';
import { authFetch } from '../../components/ui/useAuthFetch';

const filtros: FieldConfig[] = [
  { tipo: 'date', id: 'fechaInicio', label: 'Fecha de inicio' },
  { tipo: 'date', id: 'fechaFin', label: 'Fecha fin' },
];

type Movimiento = {
  fecha: string;
  nombre: string;
  cantidad: number;
};

// Función universal para convertir cualquier formato de fecha a Date
const parseAnyDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  // Intentar con formato ISO (yyyy-MM-dd)
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return new Date(dateString);
  }
  
  // Intentar con formato dd/MM/yyyy HH:mm:ss
  if (dateString.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/)) {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
  
  // Intentar con formato dd/MM/yyyy
  if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
  
  console.error('Formato de fecha no reconocido:', dateString);
  return null;
};

const Graficos = () => {
  const [data, setData] = useState<Movimiento[]>([]);
  const [allData, setAllData] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await authFetch('http://localhost:3000/movimiento');
        
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        
        const json = await res.json();
        console.log('Datos recibidos del servidor:', json);

        const movimientos: Movimiento[] = json.map((mov: any) => ({
          fecha: mov.fechaMovimiento,
          nombre: mov.producto?.nombre || 'Sin nombre',
          cantidad: mov.cantidad || 0,
        }));

        console.log('Movimientos procesados:', movimientos);
        setAllData(movimientos);
        setData(movimientos);
      } catch (error) {
        console.error("Error cargando movimientos:", error);
        alert('Error al cargar datos. Por favor intente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBuscar = (filtros: Record<string, string>) => {
    console.log('Filtros aplicados:', filtros);
    
    const { fechaInicio, fechaFin } = filtros;
    
    // Convertir fechas de filtro a timestamps
    const inicio = parseAnyDate(fechaInicio)?.getTime();
    const fin = parseAnyDate(fechaFin)?.getTime();
    
    // Si no hay filtros válidos, mostrar todos los datos
    if (!inicio && !fin) {
      console.log('Sin filtros válidos - mostrando todos los datos');
      setData(allData);
      return;
    }

    const filtrado = allData.filter(mov => {
      const fechaMov = parseAnyDate(mov.fecha);
      if (!fechaMov) return false;
      
      const fechaMovTimestamp = fechaMov.getTime();
      
      // Aplicar filtro de fecha inicio
      if (inicio && fechaMovTimestamp < inicio) {
        return false;
      }
      
      // Aplicar filtro de fecha fin (agregar 1 día para incluir todo el día)
      if (fin) {
        const finPlusOneDay = fin + 86400000; // 1 día en milisegundos
        if (fechaMovTimestamp >= finPlusOneDay) {
          return false;
        }
      }
      
      return true;
    });
    
    console.log('Datos filtrados:', filtrado);
    setData(filtrado);
  };

  return (
    <div className="p-4">
      <Filtro fields={filtros} onSearch={handleBuscar} />
      
      {loading ? (
        <div className="text-center p-8">
          <p>Cargando datos...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center p-8">
          <h3 className="text-lg font-bold mb-2">No hay datos disponibles</h3>
          <p>Intenta con un rango de fechas diferente</p>
        </div>
      ) : (
        <GraficoProductos datos={data} />
      )}
    </div>
  );
};

export default Graficos;