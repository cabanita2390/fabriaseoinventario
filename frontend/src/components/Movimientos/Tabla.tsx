import React, { useState } from 'react';
import '../../styles/Movimientos/movimientos.css';
import Filtro from './Filtro';
import DataTable from '../ui/DataTable';
import { FieldConfig } from '../types/FieldConfig';// 💡 Aquí importamos el tipo

// Tipado de fila de datos
interface RowData {
  id: number;
  nombre: string;
  tipo: string;
  estado: string;
  presentacion: string;
  unidad_medida: string;
  proveedor: string;
  inventario: number;
  fecha: string; // Formato "YYYY-MM-DD"
}

// Columnas de la tabla
const columns = [
  { header: 'ID', accessor: 'id' },
  { header: 'Nombre', accessor: 'nombre' },
  { header: 'Tipo', accessor: 'tipo' },
  { header: 'Estado', accessor: 'estado' },
  { header: 'Presentación', accessor: 'presentacion' },
  { header: 'UM', accessor: 'unidad_medida' },
  { header: 'Proveedor', accessor: 'proveedor' },
  { header: 'Inventario', accessor: 'inventario' },
];

// Datos de ejemplo
const sampleData: RowData[] = [
  {
    id: 1,
    nombre: 'Producto A',
    tipo: 'Insumo',
    estado: 'Activo',
    presentacion: 'Caja',
    unidad_medida: 'Unidad',
    proveedor: 'Proveedor X',
    inventario: 25,
    fecha: '2025-06-01',
  },
  {
    id: 2,
    nombre: 'Producto B',
    tipo: 'Insumo',
    estado: 'Inactivo',
    presentacion: 'Bolsa',
    unidad_medida: 'Kg',
    proveedor: 'Proveedor Y',
    inventario: 15,
    fecha: '2025-06-05',
  },
  {
    id: 3,
    nombre: 'Producto C',
    tipo: 'Insumo',
    estado: 'Activo',
    presentacion: 'Caja',
    unidad_medida: 'Unidad',
    proveedor: 'Proveedor Z',
    inventario: 10,
    fecha: '2025-06-10',
  },
];

// Filtros de búsqueda
const filtros: FieldConfig[] = [
  { tipo: 'date', id: 'fechaInicio', label: 'Fecha de inicio' },
  { tipo: 'date', id: 'fechaFin', label: 'Fecha fin' },
];

function Tabla({ mostrarFiltro = true,mostrarExportar = true  }: { mostrarFiltro?: boolean, mostrarExportar?: boolean  }) {
  const [data, setData] = useState(sampleData);


  // Filtra por fecha de inicio y fin
  const handleBuscar = (values: Record<string, string>) => {
    const { fechaInicio, fechaFin } = values;
    const filtrado = sampleData.filter(({ fecha }) => {
      const itemFecha = new Date(fecha);
      if (fechaInicio && itemFecha < new Date(fechaInicio)) return false;
      if (fechaFin && itemFecha > new Date(fechaFin)) return false;
      return true;
    });
    setData(filtrado);
  };

  

  // Exporta los datos a CSV
 const exportToCSV = () => {
    const headers = columns.map(c => c.header).join(',');
    const rows = data.map(row =>
      columns.map(c => `"${row[c.accessor as keyof RowData]}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'productos.csv');
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


      {/* Filtro opcional */}
      {mostrarFiltro && <Filtro fields={filtros} onSearch={handleBuscar ?? (() => {})} />}

      {/* Tabla de datos */}
      <DataTable columns={columns} data={data} />
    </div>
  );
}

export default Tabla;
