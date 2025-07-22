import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Labelstack from '../LabelStack/Labelstack';

// Crear un mock real de authFetch
const mockAuthFetch = jest.fn();

// Mock del hook useAuthFetch
jest.mock('../../ui/useAuthFetch', () => ({
  useAuthFetch: () => ({
    authFetch: mockAuthFetch,
  }),
}));

// Mock de los estilos CSS
jest.mock('../../../styles/Dashboartdpage/Labelstack.css', () => ({}));

describe('Labelstack Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders component with initial zero values', () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: async () => ({
        totalMovimientosHoy: 0,
        productosBajoStock: [],
      }),
    });

    render(<Labelstack />);

    expect(screen.getByText('Movimientos de hoy:')).toBeInTheDocument();
    expect(screen.getByText('Productos en stock bajo:')).toBeInTheDocument();
  });

  test('displays correct data when API returns valid values', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: async () => ({
        totalMovimientosHoy: 15,
        productosBajoStock: [1, 2, 3, 4, 5],
      }),
    });

    render(<Labelstack />);

    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  test('handles null values gracefully', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: async () => ({
        totalMovimientosHoy: null,
        productosBajoStock: null,
      }),
    });

    render(<Labelstack />);

    await waitFor(() => {
      const spans = screen.getAllByText('0');
      expect(spans.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('handles undefined values gracefully', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: async () => ({
        totalMovimientosHoy: undefined,
        productosBajoStock: undefined,
      }),
    });

    render(<Labelstack />);

    await waitFor(() => {
      const spans = screen.getAllByText('0');
      expect(spans.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('handles API error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockAuthFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Labelstack />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error al cargar los datos del mock:',
        expect.any(Error)
      );
      const spans = screen.getAllByText('0');
      expect(spans.length).toBeGreaterThanOrEqual(2);
    });

    consoleSpy.mockRestore();
  });

  test('calls authFetch with correct URL', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: async () => ({
        totalMovimientosHoy: 0,
        productosBajoStock: [],
      }),
    });

    render(<Labelstack />);

    await waitFor(() => {
      expect(mockAuthFetch).toHaveBeenCalledWith('http://localhost:3000/dashboard');
    });
  });

  test('renders with correct CSS classes', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: async () => ({
        totalMovimientosHoy: 5,
        productosBajoStock: [1, 2],
      }),
    });

    const { container } = render(<Labelstack />);

    await waitFor(() => {
      expect(container.firstChild).toHaveClass('labelstack-container');
      expect(screen.getByText('Movimientos de hoy:').closest('label')).toHaveClass('label-Movimientos');
      expect(screen.getByText('Productos en stock bajo:').closest('label')).toHaveClass('label-stock-bajo');
    });
  });

  test('data spans have correct CSS class', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: async () => ({
        totalMovimientosHoy: 10,
        productosBajoStock: [1, 2, 3],
      }),
    });

    render(<Labelstack />);

    await waitFor(() => {
      expect(screen.getByText('10')).toHaveClass('datos');
      expect(screen.getByText('3')).toHaveClass('datos');
    });
  });

  test('correctly calculates stock bajo from array length', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: async () => ({
        totalMovimientosHoy: 8,
        productosBajoStock: [{ id: 1 }, { id: 2 }, { id: 3 }],
      }),
    });

    render(<Labelstack />);

    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  test('handles empty productosBajoStock array', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: async () => ({
        totalMovimientosHoy: 12,
        productosBajoStock: [],
      }),
    });

    render(<Labelstack />);

    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  test('handles zero totalMovimientosHoy', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: async () => ({
        totalMovimientosHoy: 0,
        productosBajoStock: [1, 2],
      }),
    });

    render(<Labelstack />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});
