import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  DoughnutController
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

// Registrar componentes REQUERIDOS para Chart.js v4, incluyendo los controladores
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  DoughnutController
);

type Movimiento = {
  fecha: string;
  nombre: string;
  cantidad: number;
};

const GraficoProductos: React.FC<{ datos: Movimiento[] }> = ({ datos }) => {
  const chartRef = useRef<any>(null);
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [] as any[]
  });
  const [isReady, setIsReady] = useState(false);

  const fechas = useMemo(() => 
    Array.from(new Set(datos.map((d) => d.fecha))).sort(), 
    [datos]
  );

  const productos = useMemo(() => {
    return datos.reduce<Record<string, number[]>>((acc, { fecha, nombre, cantidad }) => {
      acc[nombre] = acc[nombre] || Array(fechas.length).fill(0);
      acc[nombre][fechas.indexOf(fecha)] += cantidad;
      return acc;
    }, {});
  }, [datos, fechas]);

  const nombresProductos = useMemo(() => Object.keys(productos), [productos]);

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
    if (nombresProductos.length === 0 || fechas.length === 0) {
      setIsReady(false);
      return;
    }

    setChartData({
      labels: fechas,
      datasets: nombresProductos.map((nombre) => ({
        label: nombre,
        data: productos[nombre],
        borderColor: colorMap[nombre],
        backgroundColor: colorMap[nombre],
        pointBackgroundColor: colorMap[nombre],
        fill: false,
        tension: 0.4,
      })),
    });
    
    setIsReady(true);
  }, [datos, colorMap, fechas, nombresProductos, productos]);

  const doughnutData = useMemo(() => ({
    labels: nombresProductos,
    datasets: [
      {
        label: 'Cantidad total',
        data: nombresProductos.map((nombre) => 
          datos.reduce((sum, d) => (d.nombre === nombre ? sum + d.cantidad : sum), 0)
        ),
        backgroundColor: nombresProductos.map((nombre) => colorMap[nombre]),
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  }), [datos, colorMap, nombresProductos]);

   if (!isReady) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      <div className="max-w-4xl mx-auto p-8 border border-gray-200 rounded-lg shadow-sm bg-white">
        <h2 className="text-center font-bold mb-4">Movimientos por Fecha</h2>
        <div className="w-full h-80">
          <Chart
            ref={chartRef}
            type="line"
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                }
              }
            }}
          />
        </div>
      </div>

      {/* Gráfico Doughnut */}
      <div className="max-w-4xl mx-auto p-8 border border-gray-200 rounded-lg shadow-sm bg-white">
        <h2 className="text-center font-bold mb-4">Totales por Producto</h2>
        <div className="w-full h-80">
          <Chart
            type="doughnut"
            data={doughnutData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GraficoProductos;