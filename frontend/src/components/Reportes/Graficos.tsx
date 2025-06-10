import React, { useState } from 'react';
import Filtro from '../Movimientos/Filtro';
import GraficoProductos from './GraficoProductos';
import { FieldConfig } from '../types/FieldConfig';

const filtros: FieldConfig[] = [
  { tipo: 'date', id: 'fechaInicio', label: 'Fecha de inicio' },
  { tipo: 'date', id: 'fechaFin', label: 'Fecha fin' },
];

type Movimiento = {
  fecha: string;
  nombre: string;
  cantidad: number;
};

const sampleData: Movimiento[] = [
    { fecha: '2025-06-01', nombre: 'Producto A', cantidad: 10 },
  { fecha: '2025-06-02', nombre: 'Producto B', cantidad: 5 },
  { fecha: '2025-06-03', nombre: 'Producto C', cantidad: 8 },
  { fecha: '2025-06-04', nombre: 'Producto A', cantidad: 12 },
  { fecha: '2025-06-05', nombre: 'Producto B', cantidad: 20 },
  { fecha: '2025-06-06', nombre: 'Producto D', cantidad: 7 },
  { fecha: '2025-06-07', nombre: 'Producto C', cantidad: 15 },
  { fecha: '2025-06-08', nombre: 'Producto A', cantidad: 30 },
  { fecha: '2025-06-09', nombre: 'Producto B', cantidad: 18 },
  { fecha: '2025-06-10', nombre: 'Producto E', cantidad: 6 },
  { fecha: '2025-06-11', nombre: 'Producto D', cantidad: 14 },
  { fecha: '2025-06-12', nombre: 'Producto A', cantidad: 5 },
  { fecha: '2025-06-13', nombre: 'Producto C', cantidad: 9 },
  { fecha: '2025-06-14', nombre: 'Producto E', cantidad: 11 },
  { fecha: '2025-06-15', nombre: 'Producto B', cantidad: 13 },
  { fecha: '2025-06-16', nombre: 'Producto D', cantidad: 10 },
  { fecha: '2025-06-17', nombre: 'Producto A', cantidad: 22 },
  { fecha: '2025-06-18', nombre: 'Producto C', cantidad: 17 },
  { fecha: '2025-06-19', nombre: 'Producto B', cantidad: 25 },
  { fecha: '2025-06-20', nombre: 'Producto E', cantidad: 100 },
];

const Graficos = () => {
  const [data, setData] = useState<Movimiento[]>(sampleData);

  const handleBuscar = ({ fechaInicio, fechaFin }: Record<string, string>) => {
    const filtrado = sampleData.filter(({ fecha }) => {
      const f = new Date(fecha);
      if (fechaInicio && f < new Date(fechaInicio)) return false;
      if (fechaFin && f > new Date(fechaFin)) return false;
      return true;
    });
    setData(filtrado);
  };

  return (
    <div className="p-4">
      <Filtro fields={filtros} onSearch={handleBuscar} />
      <GraficoProductos datos={data} />
    </div>
  );
};

export default Graficos;