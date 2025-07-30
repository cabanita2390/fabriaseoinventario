import React from 'react';
import { render, screen } from '@testing-library/react';
import GraficoProductos from './GraficoProductos';

// Mock de react-chartjs-2 simplificado
jest.mock('react-chartjs-2', () => ({
  Chart: () => <div data-testid="line-chart">Gráfico de Líneas Mock</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Gráfico de Dona Mock</div>,
}));

// Mock de chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  register: jest.fn(),
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  ArcElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Filler: jest.fn(),
  Legend: jest.fn(),
}));

const datosMock = [
  { fecha: '2025-07-01', nombre: 'Teclado', cantidad: 5 },
  { fecha: '2025-07-01', nombre: 'Mouse', cantidad: 3 },
  { fecha: '2025-07-02', nombre: 'Teclado', cantidad: 2 },
  { fecha: '2025-07-02', nombre: 'Monitor', cantidad: 1 },
  { fecha: '2025-07-03', nombre: 'Mouse', cantidad: 4 },
];

describe('Componente GraficoProductos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe renderizar los títulos principales', () => {
    render(<GraficoProductos datos={datosMock} />);
    
    expect(screen.getByText('Movimientos por Fecha')).toBeInTheDocument();
    expect(screen.getByText('Totales por Producto')).toBeInTheDocument();
  });

  test('debe mostrar los componentes de gráficos mockeados', () => {
    render(<GraficoProductos datos={datosMock} />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    expect(screen.getByText('Gráfico de Líneas Mock')).toBeInTheDocument();
    expect(screen.getByText('Gráfico de Dona Mock')).toBeInTheDocument();
  });

  test('debe manejar datos vacíos sin errores', () => {
    render(<GraficoProductos datos={[]} />);
    
    expect(screen.getByText('Movimientos por Fecha')).toBeInTheDocument();
    expect(screen.getByText('Totales por Producto')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
  });

  test('debe procesar correctamente datos con fechas duplicadas', () => {
    const datosConDuplicados = [
      { fecha: '2025-07-01', nombre: 'Teclado', cantidad: 3 },
      { fecha: '2025-07-01', nombre: 'Teclado', cantidad: 2 },
    ];

    render(<GraficoProductos datos={datosConDuplicados} />);
    
    expect(screen.getByText('Movimientos por Fecha')).toBeInTheDocument();
    expect(screen.getByText('Totales por Producto')).toBeInTheDocument();
  });
});