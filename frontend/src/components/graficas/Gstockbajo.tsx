import React, { useEffect, useState } from 'react';
import './Gstockbajo'; 

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const options = {
  responsive: true,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: 'Stock de productos (Simulado)' },
  },
};

const productNames = [
  'Producto A',
  'Producto B',
  'Producto C',
  'Producto D',
  'Producto E',
  'Producto F',
  'Producto G',
];

function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Gstockbajo() {
  const [data, setData] = useState({
    labels: productNames,
    datasets: [
      {
        label: 'Stock disponible',
        data: productNames.map(() => randomIntFromInterval(0, 100)),
        backgroundColor: 'rgba(149, 240, 215, 0.6)',
      },
    ],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData({
        labels: productNames,
        datasets: [
          {
            label: 'Stock disponible',
            data: productNames.map(() => randomIntFromInterval(0, 100)),
            backgroundColor: 'rgba(235, 120, 53, 0.6)',
          },
        ],
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="gstockbajo-container">
      <Bar options={options} data={data} />
    </div>
  );
}

export default Gstockbajo;