import React, { useState, useEffect } from 'react';
import '../../styles/Movimientos/movimientos.css';
import Filtro from './Filtro';
import DataTable from '../ui/DataTable';
import { FieldConfig } from '../types/FieldConfig';

// Tipado de fila de datos
interface RowData {
  tipo: string;
  producto: string;
  cantidad: number;
  fecha: string;
  descripcion: string;
  unidad: string;
  proveedor: string;
  bodega: string;
}

// Columnas de la tabla
const columns = [
  { header: "Tipo", accessor: "tipo" },
  { header: "Producto", accessor: "producto" },
  { header: "Cantidad", accessor: "cantidad" },
  { header: "Unidad", accessor: "unidad" },
  { header: "Descripción", accessor: "descripcion" },
  { header: "Proveedor", accessor: "proveedor" },
  { header: "Bodega", accessor: "bodega" },
  { header: "Fecha", accessor: "fecha" },
];

// Filtros de búsqueda
const filtros: FieldConfig[] = [
  { tipo: 'date', id: 'fechaInicio', label: 'Fecha de inicio' },
  { tipo: 'date', id: 'fechaFin', label: 'Fecha fin' },
];

function Tabla({ mostrarFiltro = true, mostrarExportar = true }: { mostrarFiltro?: boolean; mostrarExportar?: boolean }) {
  const [data, setData] = useState<RowData[]>([]);
  const [fullData, setFullData] = useState<RowData[]>([]); // Para mantener todos los datos originales

  // Carga los datos desde mock.json
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/mock.json');
        const json = await response.json();
        setData(json.movimiento || []);
        setFullData(json.movimiento || []);
      } catch (error) {
        console.error("Error al cargar los movimientos:", error);
      }
    };
    fetchData();
  }, []);

  // Filtra por rango de fechas
  const handleBuscar = (values: Record<string, string>) => {
    const { fechaInicio, fechaFin } = values;

    const filtrado = fullData.filter(({ fecha }) => {
      const itemFecha = new Date(fecha);
      if (fechaInicio && itemFecha < new Date(fechaInicio)) return false;
      if (fechaFin && itemFecha > new Date(fechaFin)) return false;
      return true;
    });

    setData(filtrado);
  };

  // Exporta a CSV
  const exportToCSV = () => {
    const headers = columns.map(c => c.header).join(',');
    const rows = data.map(row =>
      columns.map(c => `"${row[c.accessor as keyof RowData] ?? ""}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'movimientos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Botón de exportación */}
      {mostrarExportar && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div></div>
          <button className="btn-exportar" onClick={exportToCSV}>Exportar CSV</button>
        </div>
      )}

      {/* Filtro */}
      {mostrarFiltro && <Filtro fields={filtros} onSearch={handleBuscar} />}

      {/* Tabla de datos */}
      <DataTable columns={columns} data={data} />
    </div>
  );
}

export default Tabla;
