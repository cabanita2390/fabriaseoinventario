import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Gstockbajo from '../graficas/Gstockbajo';

// Mock real para authFetch
const mockAuthFetch = jest.fn();

jest.mock('../../ui/useAuthFetch', () => ({
  useAuthFetch: () => ({
    authFetch: mockAuthFetch,
  }),
}));

// Mock de Chart.js (opcional si no lanza errores)
jest.mock('chart.js', () => ({
  Chart: { register: jest.fn() },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

// ✅ Mock funcional de Bar para que renderice en tests
jest.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: any) => (
    <div data-testid="bar-chart">
      <div data-testid="chart-title">{options.plugins.title.text}</div>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
    </div>
  ),
}));

describe('Gstockbajo Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders bar chart component', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: async () => ({
        top5ProductosMasBajoStock: [
          { nombre: 'Producto A', totalStock: 10 },
          { nombre: 'Producto B', totalStock: 5 },
        ],
      }),
    });

    render(<Gstockbajo />);

    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  test('displays correct chart title', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: async () => ({
        top5ProductosMasBajoStock: [],
      }),
    });

    render(<Gstockbajo />);

    await waitFor(() => {
      expect(screen.getByTestId('chart-title')).toHaveTextContent('Productos con bajo stock');
    });
  });

  test('processes data correctly for chart', async () => {
    const mockData = {
      top5ProductosMasBajoStock: [
        { nombre: 'Producto A', totalStock: 10 },
        { nombre: 'Producto B', totalStock: 5 },
        { nombre: 'Producto C', totalStock: 8 },
      ],
    };

    mockAuthFetch.mockResolvedValueOnce({
      json: async () => mockData,
    });

    render(<Gstockbajo />);

    await waitFor(() => {
      const chartData = screen.getByTestId('chart-data');
      const parsedData = JSON.parse(chartData.textContent || '{}');

      expect(parsedData.labels).toEqual(['Producto A', 'Producto B', 'Producto C']);
      expect(parsedData.datasets[0].data).toEqual([10, 5, 8]);
      expect(parsedData.datasets[0].label).toBe('Stock');
    });
  });

  test('assigns different colors to each bar', async () => {
    const mockData = {
      top5ProductosMasBajoStock: [
        { nombre: 'Producto A', totalStock: 10 },
        { nombre: 'Producto B', totalStock: 5 },
        { nombre: 'Producto C', totalStock: 8 },
      ],
    };

    mockAuthFetch.mockResolvedValueOnce({
      json: async () => mockData,
    });

    render(<Gstockbajo />);

    await waitFor(() => {
      const chartData = screen.getByTestId('chart-data');
      const parsedData = JSON.parse(chartData.textContent || '{}');

      const colors = parsedData.datasets[0].backgroundColor;
      expect(colors).toHaveLength(3);
      expect(colors[0]).toBe('rgba(255, 99, 132, 0.6)');
      expect(colors[1]).toBe('rgba(54, 162, 235, 0.6)');
      expect(colors[2]).toBe('rgba(255, 206, 86, 0.6)');
    });
  });

  test('handles empty data gracefully', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: async () => ({
        top5ProductosMasBajoStock: [],
      }),
    });

    render(<Gstockbajo />);

    await waitFor(() => {
      const chartData = screen.getByTestId('chart-data');
      const parsedData = JSON.parse(chartData.textContent || '{}');

      expect(parsedData.labels).toEqual([]);
      expect(parsedData.datasets[0].data).toEqual([]);
    });
  });

  test('handles API error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockAuthFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Gstockbajo />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error al cargar mock.json:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('calls authFetch with correct URL', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: async () => ({
        top5ProductosMasBajoStock: [],
      }),
    });

    render(<Gstockbajo />);

    await waitFor(() => {
      expect(mockAuthFetch).toHaveBeenCalledWith('http://localhost:3000/dashboard');
    });
  });

  test('handles color cycling for more than 10 products', async () => {
    const mockData = {
      top5ProductosMasBajoStock: Array.from({ length: 12 }, (_, i) => ({
        nombre: `Producto ${i + 1}`,
        totalStock: i + 1,
      })),
    };

    mockAuthFetch.mockResolvedValueOnce({
      json: async () => mockData,
    });

    render(<Gstockbajo />);

    await waitFor(() => {
      const chartData = screen.getByTestId('chart-data');
      const parsedData = JSON.parse(chartData.textContent || '{}');

      const colors = parsedData.datasets[0].backgroundColor;
      expect(colors).toHaveLength(12);
      expect(colors[10]).toBe(colors[0]); // ciclo
      expect(colors[11]).toBe(colors[1]);
    });
  });

  test('renders with correct container styles', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: async () => ({
        top5ProductosMasBajoStock: [],
      }),
    });

    const { container } = render(<Gstockbajo />);

    await waitFor(() => {
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv).toHaveStyle({
        maxWidth: '600px',
        maxHeight: '400px',
        margin: '0 auto',
        padding: '10px',
      });

      const innerDiv = outerDiv.firstChild as HTMLElement;
      expect(innerDiv).toHaveStyle({
        height: '300px',
      });
    });
  });
});
