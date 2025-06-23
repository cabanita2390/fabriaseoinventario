import React, { useState, useEffect } from 'react';
import DataTable from '../ui/DataTable';
import SearchBar from '../ui/Searchbar';

// Definir interfaces según la estructura real de la API
interface UnidadMedida {
  id: number;
  nombre: string;
}

interface Presentacion {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  tipoProducto: string;
  estado: string;
  presentacion: Presentacion;
  unidadMedida: UnidadMedida;
}

interface Bodega {
  id: number;
  nombre: string;
  ubicacion: string;
}

interface InventarioItemAPI {
  id: number;
  cantidad_actual: number;
  fechaUltimaActualizacion: string;
  producto: Producto;
  bodega: Bodega;
}

// Interfaz para los datos transformados que necesita la tabla
interface InventarioItem {
  id: number;
  nombre: string;
  tipo: string;
  presentacion: string;
  unidad_medida: string;
  cantidad_actual: number;
  estado: string;
  fechaUltimaActualizacion: string;
  bodega: string;
}

const columns = [
  { header: 'ID', accessor: 'id', width: '70px' },
  { header: 'Nombre', accessor: 'nombre' },
  { header: 'Tipo', accessor: 'tipo' },
  { header: 'Presentación', accessor: 'presentacion' },
  { header: 'Unidad de Medida', accessor: 'unidad_medida' },
  { header: 'Cantidad Actual', accessor: 'cantidad_actual', width: '120px' },
  { header: 'Estado', accessor: 'estado', width: '100px' },
  { header: 'Última Actualización', accessor: 'fechaUltimaActualizacion', width: '180px' },
  { header: 'Bodega', accessor: 'bodega' },
];

function Tabla() {
  const [filtro, setFiltro] = useState('');
  const [datos, setDatos] = useState<InventarioItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para formatear la fecha
  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true);
        setError(null);
        
        const respuesta = await fetch('http://localhost:3000/inventario', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!respuesta.ok) {
          throw new Error(`Error HTTP: ${respuesta.status} - ${respuesta.statusText}`);
        }
        
        const datosApi: InventarioItemAPI[] = await respuesta.json();
        
        // Validar que la respuesta sea un array
        if (!Array.isArray(datosApi)) {
          throw new Error('La respuesta de la API no es un array válido');
        }
        
        // Transformar los datos de la API al formato que necesita la tabla
        const datosTransformados: InventarioItem[] = datosApi.map(item => ({
          id: item.id,
          nombre: item.producto.nombre,
          tipo: item.producto.tipoProducto,
          presentacion: item.producto.presentacion.nombre,
          unidad_medida: item.producto.unidadMedida.nombre,
          cantidad_actual: item.cantidad_actual,
          estado: item.producto.estado,
          fechaUltimaActualizacion: formatFecha(item.fechaUltimaActualizacion),
          bodega: item.bodega.nombre
        }));
        
        setDatos(datosTransformados);
        
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        console.error('Error fetching data:', error);
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar datos basados en la búsqueda
  const datosFiltrados = datos.filter(item => {
    if (!filtro.trim()) return true;
    
    const textoBusqueda = filtro.toLowerCase();
    return (
      item.id.toString().includes(textoBusqueda) ||
      item.nombre.toLowerCase().includes(textoBusqueda) ||
      item.tipo.toLowerCase().includes(textoBusqueda) ||
      item.presentacion.toLowerCase().includes(textoBusqueda) ||
      item.unidad_medida.toLowerCase().includes(textoBusqueda) ||
      item.estado.toLowerCase().includes(textoBusqueda) ||
      item.bodega.toLowerCase().includes(textoBusqueda) ||
      item.cantidad_actual.toString().includes(textoBusqueda)
    );
  });

  // Manejar estados de carga y error
  

  return (
    <div>
      

      <div
  className="d-flex justify-content-between align-items-center mb-5"
  style={{ marginTop: '20px' }} // Ajusta el valor según lo que necesites
>
  <div style={{ width: '300px' }}>
    <SearchBar
      onSearch={setFiltro}
      placeholder="Buscar productos..."
    />
  </div>
</div>


      {datosFiltrados.length === 0 ? (
        <div className="alert alert-info">
          {filtro 
            ? 'No se encontraron productos con ese criterio de búsqueda' 
            : 'No hay productos en el inventario'}
        </div>
      ) : (
        <div style={{ marginTop: '20px' }} className="card border-0 shadow-sm">
  <div className="card-body p-0">
    <DataTable 
      columns={columns} 
      data={datosFiltrados} 
    />
  </div>
</div>

      )}
    </div>
  );
}

export default Tabla;