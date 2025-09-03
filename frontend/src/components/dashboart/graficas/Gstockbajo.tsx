import React, { useEffect, useState } from 'react';
import { useAuthFetch , ApiError } from '../../ui/useAuthFetch';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: 'Productos con bajo stock' },
  },
};

const barColors = [
  'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
  'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
  'rgba(100, 255, 218, 0.6)', 'rgba(240, 128, 128, 0.6)', 'rgba(0, 206, 209, 0.6)',
  'rgba(60, 179, 113, 0.6)',
];

interface Producto {
  nombre: string;
  totalStock: number;
}

function Gstockbajo() {
  const [data, setData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: [],
  });
  const { authFetch } = useAuthFetch(); 

  useEffect(() => {
      authFetch('https://fabriaseo-inventario-backend.onrender.com/dashboard')
    .then((res) => res.json())
    .then((mockData) => {
      const productos: Producto[] = mockData.top5ProductosMasBajoStock;

      const updatedDataset = [
        {
          label: 'Stock',
          data: productos.map((p) => p.totalStock),
          backgroundColor: productos.map(
            (_, index) => barColors[index % barColors.length]
          ),
        },
      ];

      setData({
        labels: productos.map((p) => p.nombre),
        datasets: updatedDataset,
      });
    })
    .catch((err) => {
      console.error('Error al cargar mock.json:', err);
    });
}, []);

  return (
    <div
      style={{
        maxWidth: '600px',
        maxHeight: '400px',
        margin: '0 auto',
        padding: '10px',
      }}
    >
      <div style={{ height: '300px' }}>
        <Bar options={options} data={data} />
      </div>
    </div>
  );
}

export default Gstockbajo;