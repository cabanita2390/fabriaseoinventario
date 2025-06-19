import React, { useState, useEffect } from 'react';
import '../../styles/Movimientos/movimientos.css';
import Filtro from './Filtro';
import DataTable from '../ui/DataTable';
import { FieldConfig } from '../types/FieldConfig';

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

const filtros: FieldConfig[] = [
  { tipo: 'date', id: 'fechaInicio', label: 'Fecha de inicio' },
  { tipo: 'date', id: 'fechaFin', label: 'Fecha fin' },
];

function Tabla({ mostrarFiltro = true, mostrarExportar = true }: { mostrarFiltro?: boolean; mostrarExportar?: boolean }) {
  const [data, setData] = useState<RowData[]>([]);
  const [fullData, setFullData] = useState<RowData[]>([]);
  const [filtroTexto, setFiltroTexto] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/movimiento');
        const json = await response.json();

        const movimientos: RowData[] = json.map((mov: any) => ({
          tipo: mov.tipo === 'INGRESO' ? 'Entrada' : 'Salida',
          producto: mov.producto?.nombre || '',
          cantidad: mov.cantidad,
          fecha: mov.fechaMovimiento.split('T')[0],
          descripcion: mov.descripcion || '',
          unidad: mov.producto?.unidadMedida?.nombre || '',
          proveedor: mov.producto?.proveedor?.nombre || '',
          bodega: mov.bodega?.nombre || '',
        }));

        setData(movimientos);
        setFullData(movimientos);
      } catch (error) {
        console.error("Error al cargar los movimientos:", error);
      }
    };
    fetchData();
  }, []);

  const handleBuscar = (values: Record<string, string>) => {
    const { fechaInicio, fechaFin } = values;

    const filtrado = fullData.filter(({ fecha, producto, descripcion, proveedor, bodega, tipo }) => {
      const itemFecha = new Date(fecha);
      if (fechaInicio && itemFecha < new Date(fechaInicio)) return false;
      if (fechaFin && itemFecha > new Date(fechaFin)) return false;

      const texto = filtroTexto.toLowerCase();
      return (
        producto.toLowerCase().includes(texto) ||
        descripcion.toLowerCase().includes(texto) ||
        proveedor.toLowerCase().includes(texto) ||
        bodega.toLowerCase().includes(texto) ||
        tipo.toLowerCase().includes(texto)
      );
    });

    setData(filtrado);
  };

  useEffect(() => {
    handleBuscar({});
  }, [filtroTexto]);

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
      {mostrarFiltro && (
        <Filtro
          fields={filtros}
          onSearch={handleBuscar}
          onTextoChange={setFiltroTexto}
          onExport={mostrarExportar ? exportToCSV : undefined}
        />
      )}
      <DataTable columns={columns} data={data} />
    </div>
  );
}

export default Tabla;
