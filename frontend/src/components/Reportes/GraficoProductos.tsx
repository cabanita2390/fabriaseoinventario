import React, { useRef, useEffect, useState, useMemo } from 'react';
import type { ChartData } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Chart, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Filler, Legend);

type Movimiento = {
  fecha: string;
  nombre: string;
  cantidad: number;
};

const GraficoProductos: React.FC<{ datos: Movimiento[] }> = ({ datos }) => {
  const chartRef = useRef<ChartJS<'line'> | null>(null);
  const [chartData, setChartData] = useState<ChartData<'line'>>({ datasets: [] });

  const fechas = useMemo(() => Array.from(new Set(datos.map((d) => d.fecha))).sort(), [datos]);

  const productos = useMemo(() => {
    return datos.reduce<Record<string, number[]>>((acc, { fecha, nombre, cantidad }) => {
      acc[nombre] = acc[nombre] || Array(fechas.length).fill(0);
      acc[nombre][fechas.indexOf(fecha)] += cantidad;
      return acc;
    }, {});
  }, [datos, fechas]);

  const nombresProductos = useMemo(() => Object.keys(productos), [productos]);

  const colorPalette = [

  'rgba(255, 99, 132, 0.6)',   
  'rgba(54, 162, 235, 0.6)',   // Azul
  'rgba(255, 206, 86, 0.6)',   // Amarillo
  'rgba(75, 192, 192, 0.6)',   // Turquesa
  'rgba(153, 102, 255, 0.6)',  // Morado
  'rgba(255, 159, 64, 0.6)',   // Naranja
  'rgba(100, 255, 218, 0.6)',  // Verde agua
  'rgba(240, 128, 128, 0.6)',  // Salmón
  'rgba(0, 206, 209, 0.6)',    // Azul verdoso
  'rgba(60, 179, 113, 0.6)',   // Verde bosque
  'rgba(233, 30, 99, 0.6)',    // Fucsia
  'rgba(121, 85, 72, 0.6)',    // Café
  'rgba(255, 87, 34, 0.6)',    // Naranja intenso
  'rgba(63, 81, 181, 0.6)',    // Azul profundo
  'rgba(0, 150, 136, 0.6)',    // Verde jade
     
     


  ];

  const colorMap = useMemo(() => {
  const localColorPalette = [
    'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
    'rgba(100, 255, 218, 0.6)', 'rgba(240, 128, 128, 0.6)', 'rgba(0, 206, 209, 0.6)',
    'rgba(60, 179, 113, 0.6)', 'rgba(233, 30, 99, 0.6)', 'rgba(121, 85, 72, 0.6)',
    'rgba(255, 87, 34, 0.6)', 'rgba(63, 81, 181, 0.6)', 'rgba(0, 150, 136, 0.6)'
  ];

  return nombresProductos.reduce<Record<string, string>>((acc, nombre, i) => {
    acc[nombre] = localColorPalette[i % localColorPalette.length];
    return acc;
  }, {});
}, [nombresProductos]);


  useEffect(() => {
  if (!chartRef.current) return;

  setChartData({
    labels: fechas,
    datasets: nombresProductos.map((nombre) => ({
      label: nombre,
      data: productos[nombre],
      borderColor: colorMap[nombre],
      pointBackgroundColor: colorMap[nombre],
      fill: false,
      tension: 0.4,
    })),
  });
   }, [datos, colorMap, fechas, nombresProductos, productos]);// Ahora solo depende de `datos`

  const doughnutData = useMemo(() => ({
    labels: nombresProductos,
    datasets: [
      {
        label: 'Cantidad total',
        data: nombresProductos.map((nombre) => datos.reduce((sum, d) => (d.nombre === nombre ? sum + d.cantidad : sum), 0)),
        backgroundColor: nombresProductos.map((nombre) => colorMap[nombre]),
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  }), [datos, colorMap, nombresProductos]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      <div
        style={{
          maxWidth: '800px',
          maxHeight: '900px',
          margin: '0 auto',
          padding: '32px',
          border: '1px solid #ccc',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBlock: '8px',
        }}
      >
        <h2 className="text-center font-bold mb-4">Movimientos por Fecha</h2>
        <div style={{ width: '80%', height: '80%' }}>
          <Chart ref={chartRef} type="line" data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
      </div>

      <div
        style={{
          maxWidth: '800px',
          maxHeight: '900px',
          margin: '0 auto',
          padding: '32px',
          border: '1px solid #ccc',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBlock: '8px',
        }}
      >
        <h2 className="text-center font-bold mb-4">Totales por Producto</h2>
        <div style={{ width: '60%', height: '60%' }}>
          <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
      </div>
    </div>
  );
};

export default GraficoProductos;