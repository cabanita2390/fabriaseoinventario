import React, { useEffect, useState } from 'react';
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
    title: { display: true, text: 'Productos con bajo stock (Simulado)' },
  },
};

const allProducts = [
  'Manzanas', 'Naranjas', 'Leche', 'Huevos', 'Queso',
  'Pan', 'Arroz', 'Fideos', 'Aceite', 'Azúcar',
  'Café', 'Té', 'Harina', 'Yogur', 'Galletas',
];

const barColors = [
  'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
  'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
  'rgba(100, 255, 218, 0.6)', 'rgba(240, 128, 128, 0.6)', 'rgba(0, 206, 209, 0.6)',
  'rgba(60, 179, 113, 0.6)',
];

function getRandomProductNames(count: number) {
  const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Gstockbajo() {
  const [data, setData] = useState<ChartData<'bar'>>({
    labels: ['Stock'],
    datasets: [],
  });

  const updateData = () => {
    const selectedProducts = getRandomProductNames(6);
    const updatedDatasets = selectedProducts.map((product, index) => ({
      label: product,
      data: [randomIntFromInterval(0, 50)],
      backgroundColor: barColors[index % barColors.length],
    }));

    setData({
      labels: ['Stock'],
      datasets: updatedDatasets,
    });
  };

  useEffect(() => {
    updateData();
    const interval = setInterval(updateData, 60000); // 60 segundos

    return () => clearInterval(interval);
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