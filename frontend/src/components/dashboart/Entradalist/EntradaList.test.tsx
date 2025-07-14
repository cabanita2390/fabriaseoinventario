import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MovimientoList from './EntradaList';
import { useAuthFetch } from '../../ui/useAuthFetch';

// Mock de useAuthFetch
jest.mock('../../ui/useAuthFetch');

// Silenciar console.error y console.log durante las pruebas
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

const mockAuthFetch = jest.fn();

describe('MovimientoList Component', () => {
  beforeEach(() => {
    (useAuthFetch as jest.Mock).mockReturnValue({
      authFetch: mockAuthFetch,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería mostrar un mensaje de error cuando falla la carga de datos', async () => {
    mockAuthFetch.mockRejectedValue(new Error('Error de red'));

    render(<MovimientoList />);
    
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los movimientos.')).toBeInTheDocument();
    });
  });

  it('debería mostrar un mensaje de error cuando no hay movimientos', async () => {
    mockAuthFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ ultimosMovimientos: [] }),
    });

    render(<MovimientoList />);
    
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los movimientos.')).toBeInTheDocument();
    });
  });

  it('debería mostrar los movimientos correctamente cuando la carga es exitosa', async () => {
    const mockData = {
      ultimosMovimientos: [
        {
          fechaMovimiento: '2023-01-01T12:00:00Z',
          tipo: 'INGRESO',
          producto: { nombre: 'Producto 1' },
          cantidad: 10,
        },
        {
          fechaMovimiento: '2023-01-02T12:00:00Z',
          tipo: 'EGRESO',
          producto: { nombre: 'Producto 2' },
          cantidad: 5,
        },
      ],
    };

    mockAuthFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockData),
    });

    render(<MovimientoList />);
    
    await waitFor(() => {
      expect(screen.getByText('Movimientos recientes')).toBeInTheDocument();
      
      // Verificamos cada parte del texto por separado
      const item1 = screen.getByText('2023-01-01').closest('li');
      expect(item1).toHaveTextContent('Entrada');
      expect(item1).toHaveTextContent('Producto 1');
      expect(item1).toHaveTextContent('10');
      
      const item2 = screen.getByText('2023-01-02').closest('li');
      expect(item2).toHaveTextContent('Salida');
      expect(item2).toHaveTextContent('Producto 2');
      expect(item2).toHaveTextContent('5');
    });
  });

  it('debería manejar correctamente el formato de fecha', async () => {
    const mockData = {
      ultimosMovimientos: [
        {
          fechaMovimiento: '2023-05-15T08:30:00Z',
          tipo: 'INGRESO',
          producto: { nombre: 'Producto Test' },
          cantidad: 7,
        },
      ],
    };

    mockAuthFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockData),
    });

    render(<MovimientoList />);
    
    await waitFor(() => {
      const item = screen.getByText('2023-05-15').closest('li');
      expect(item).toHaveTextContent('Entrada');
      expect(item).toHaveTextContent('Producto Test');
      expect(item).toHaveTextContent('7');
      expect(screen.queryByText('T08:30:00Z')).not.toBeInTheDocument();
    });
  });

  it('debería mostrar la clase CSS correcta según el tipo de movimiento', async () => {
    const mockData = {
      ultimosMovimientos: [
        {
          fechaMovimiento: '2023-01-01T12:00:00Z',
          tipo: 'INGRESO',
          producto: { nombre: 'Producto Entrada' },
          cantidad: 10,
        },
        {
          fechaMovimiento: '2023-01-02T12:00:00Z',
          tipo: 'EGRESO',
          producto: { nombre: 'Producto Salida' },
          cantidad: 5,
        },
      ],
    };

    mockAuthFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockData),
    });

    render(<MovimientoList />);
    
    await waitFor(() => {
      const entradaItem = screen.getByText(/Producto Entrada/i).closest('li');
      const salidaItem = screen.getByText(/Producto Salida/i).closest('li');
      
      expect(entradaItem).toHaveClass('movimiento-item entrada');
      expect(salidaItem).toHaveClass('movimiento-item salida');
    });
  });
});