
import Filtro from '../Movimientos/Filtro';
import GraficoProductos from './GraficoProductos';
import { FieldConfig } from '../types/FieldConfig';
import { useState , useEffect } from 'react';

const filtros: FieldConfig[] = [
  { tipo: 'date', id: 'fechaInicio', label: 'Fecha de inicio' },
  { tipo: 'date', id: 'fechaFin', label: 'Fecha fin' },
];

type Movimiento = {
  fecha: string;
  nombre: string;
  cantidad: number;
};

const Graficos = () => {
  const [data, setData] = useState<Movimiento[]>([]);
  const [allData, setAllData] = useState<Movimiento[]>([]); // Conserva los datos completos

  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch('/mock.json');
      const json = await res.json();
      setAllData(json.movimientosPorProducto);
      setData(json.movimientosPorProducto);
    } catch (error) {
      console.error("Error cargando movimientos:", error);
    }
  };

  fetchData();
}, []);


  const handleBuscar = ({ fechaInicio, fechaFin }: Record<string, string>) => {
    const filtrado = allData.filter(({ fecha }) => {
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
