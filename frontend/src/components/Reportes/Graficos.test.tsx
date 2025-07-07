import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Graficos from './Graficos';
import { MemoryRouter } from 'react-router-dom';

// Mock completo de SweetAlert2 para evitar problemas con CSS
jest.mock('sweetalert2', () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
  mixin: jest.fn(),
  close: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  getTimerLeft: jest.fn(),
  stopTimer: jest.fn(),
  resumeTimer: jest.fn(),
  toggleTimer: jest.fn(),
  isVisible: jest.fn(),
  update: jest.fn(),
  enableButtons: jest.fn(),
  disableButtons: jest.fn(),
  enableLoading: jest.fn(),
  disableLoading: jest.fn(),
  showValidationMessage: jest.fn(),
  resetValidationMessage: jest.fn(),
  getInput: jest.fn(),
  disableInput: jest.fn(),
  enableInput: jest.fn(),
}));

// Mock mejorado de authFetch
const mockAuthFetch = jest.fn();
jest.mock('../../components/ui/useAuthFetch', () => ({
  __esModule: true,
  default: () => mockAuthFetch,
}));

// Mocks de componentes hijos
jest.mock('../Movimientos/Filtro', () => ({
  __esModule: true,
  default: ({ onSearch, onReset }: any) => (
    <div data-testid="mock-filtro">
      <button 
        onClick={() => onSearch({ 
          fechaInicio: '2023-01-01', 
          fechaFin: '2023-01-31' 
        })}
        data-testid="mock-search-button"
      >
        Buscar
      </button>
      <button 
        onClick={() => onReset()}
        data-testid="mock-reset-button"
      >
        Reset
      </button>
    </div>
  )
}));

jest.mock('./GraficoProductos', () => ({
  __esModule: true,
  default: ({ datos }: any) => (
    <div data-testid="mock-grafico">
      {datos.map((d: any, i: number) => (
        <div key={i}>{d.nombre} - {d.cantidad}</div>
      ))}
    </div>
  )
}));

describe('Componente Graficos', () => {
  const mockMovimientos = [
    {
      fechaMovimiento: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Hace 3 días
      producto: { nombre: 'Producto A' },
      cantidad: 10,
      tipo: 'ENTRADA'
    },
    {
      fechaMovimiento: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Hace 1 día
      producto: { nombre: 'Producto B' },
      cantidad: 5,
      tipo: 'SALIDA'
    },
    {
      fechaMovimiento: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // En 2 días (fuera del rango)
      producto: { nombre: 'Producto C' },
      cantidad: 8,
      tipo: 'ENTRADA'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe mostrar el estado de carga inicial', () => {
    mockAuthFetch.mockImplementation(() => new Promise(() => {})); // Simular carga infinita

    render(
      <MemoryRouter>
        <Graficos />
      </MemoryRouter>
    );

    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
    // Verificar el spinner usando data-testid en lugar de role
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('debe manejar errores de carga', async () => {
    mockAuthFetch.mockRejectedValue(new Error('Error de red'));

    render(
      <MemoryRouter>
        <Graficos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error al cargar datos. Por favor intente más tarde.')).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje cuando no hay datos', async () => {
    mockAuthFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    });

    render(
      <MemoryRouter>
        <Graficos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No se encontraron movimientos en el sistema')).toBeInTheDocument();
    });
  });

  it('debe cargar y mostrar datos correctamente', async () => {
    mockAuthFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMovimientos)
    });

    render(
      <MemoryRouter>
        <Graficos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-grafico')).toBeInTheDocument();
      expect(screen.getByText('Producto A - 10')).toBeInTheDocument();
      expect(screen.getByText('Producto B - 5')).toBeInTheDocument();
      expect(screen.queryByText('Producto C - 8')).not.toBeInTheDocument();
    });
  });

  it('debe filtrar datos cuando se aplican filtros', async () => {
    mockAuthFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMovimientos)
    });

    render(
      <MemoryRouter>
        <Graficos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-filtro')).toBeInTheDocument();
    });

    // Simular búsqueda con filtros personalizados
    fireEvent.click(screen.getByTestId('mock-search-button'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-grafico')).toBeInTheDocument();
      expect(screen.getByText('Producto A - 10')).toBeInTheDocument();
      expect(screen.getByText('Producto B - 5')).toBeInTheDocument();
      expect(screen.queryByText('Producto C - 8')).not.toBeInTheDocument();
    });
  });

  it('debe resetear los filtros correctamente', async () => {
    mockAuthFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMovimientos)
    });

    render(
      <MemoryRouter>
        <Graficos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-filtro')).toBeInTheDocument();
    });

    // Primero aplicar filtro
    fireEvent.click(screen.getByTestId('mock-search-button'));
    await waitFor(() => {
      expect(screen.getByTestId('mock-grafico')).toBeInTheDocument();
    });

    // Luego resetear
    fireEvent.click(screen.getByTestId('mock-reset-button'));
    await waitFor(() => {
      expect(screen.getByTestId('mock-grafico')).toBeInTheDocument();
      expect(screen.getByText('Producto A - 10')).toBeInTheDocument();
      expect(screen.getByText('Producto B - 5')).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje cuando no hay datos que coincidan con los filtros', async () => {
    mockAuthFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMovimientos)
    });

    render(
      <MemoryRouter>
        <Graficos />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-filtro')).toBeInTheDocument();
    });

    // Simular búsqueda con filtros que no coinciden con ningún dato
    fireEvent.click(screen.getByTestId('mock-search-button'));

    await waitFor(() => {
      expect(screen.getByText('No hay movimientos que coincidan con los filtros aplicados')).toBeInTheDocument();
    });
  });
});