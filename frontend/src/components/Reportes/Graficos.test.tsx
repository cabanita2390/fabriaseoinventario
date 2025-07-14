import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock del módulo useAuthFetch
jest.mock('../../components/ui/useAuthFetch', () => ({
  authFetch: jest.fn()
}));

// Mock de SweetAlert2
jest.mock('sweetalert2', () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
  // ... otros métodos mockeados
}));

// Mock de componentes hijos
jest.mock('../Movimientos/Filtro', () => ({
  __esModule: true,
  default: ({ onSearch, onReset }: any) => (
    <div data-testid="mock-filtro">
      <button 
        onClick={() => onSearch({ fechaInicio: '2023-01-01', fechaFin: '2023-01-31' })}
        data-testid="mock-search-button"
      >
        Buscar
      </button>
      <button onClick={() => onReset()} data-testid="mock-reset-button">
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

import Graficos from './Graficos';
import { authFetch } from '../../components/ui/useAuthFetch';

const mockAuthFetch = authFetch as jest.MockedFunction<typeof authFetch>;

// Implementación completa del mock de Response
class MockResponse implements Response {
  constructor(
    public body: ReadableStream<Uint8Array> | null = null,
    public bodyUsed: boolean = false,
    public headers: Headers = new Headers(),
    public ok: boolean = true,
    public redirected: boolean = false,
    public status: number = 200,
    public statusText: string = 'OK',
    public type: ResponseType = 'basic',
    public url: string = '',
    private _json: any = [],
    private _text: string = ''
  ) {}

  async arrayBuffer(): Promise<ArrayBuffer> {
    return new ArrayBuffer(0);
  }

  async blob(): Promise<Blob> {
    return new Blob();
  }

  async formData(): Promise<FormData> {
    return new FormData();
  }

  async json(): Promise<any> {
    return this._json;
  }

  async text(): Promise<string> {
    return this._text;
  }

  clone(): Response {
    return new MockResponse(
      this.body,
      this.bodyUsed,
      this.headers,
      this.ok,
      this.redirected,
      this.status,
      this.statusText,
      this.type,
      this.url,
      this._json,
      this._text
    );
  }

  get trailer(): Promise<Headers> {
    return Promise.resolve(new Headers());
  }

  get bodyLoaded(): Promise<void> {
    return Promise.resolve();
  }

  get bytes(): () => Promise<Uint8Array> {
    return () => Promise.resolve(new Uint8Array());
  }
}

describe('Componente Graficos', () => {
  const today = new Date('2025-07-07');
  const mockMovimientos = [
    {
      fechaMovimiento: new Date('2025-07-04').toISOString(),
      producto: { nombre: 'Producto A' },
      cantidad: 10,
      tipo: 'ENTRADA'
    },
    {
      fechaMovimiento: new Date('2025-07-06').toISOString(),
      producto: { nombre: 'Producto B' },
      cantidad: 5,
      tipo: 'SALIDA'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(today);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('debe mostrar el estado de carga inicial', () => {
    mockAuthFetch.mockImplementation(() => new Promise(() => {}));
    render(<Graficos />, { wrapper: MemoryRouter });
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('debe manejar errores de carga', async () => {
    mockAuthFetch.mockRejectedValue(new Error('Error de red'));
    render(<Graficos />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText('Error al cargar datos. Por favor intente más tarde.')).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje cuando no hay datos', async () => {
    mockAuthFetch.mockResolvedValue(new MockResponse(null, false, new Headers(), true, false, 200, 'OK', 'basic', '', []));
    render(<Graficos />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText('No se encontraron movimientos en el sistema')).toBeInTheDocument();
    });
  });

  it('debe cargar y mostrar datos correctamente', async () => {
    mockAuthFetch.mockResolvedValue(new MockResponse(null, false, new Headers(), true, false, 200, 'OK', 'basic', '', mockMovimientos));
    render(<Graficos />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByTestId('mock-grafico')).toBeInTheDocument();
      expect(screen.getByText('Producto A - 10')).toBeInTheDocument();
      expect(screen.getByText('Producto B - 5')).toBeInTheDocument();
    });
  });

  it('debe filtrar datos cuando se aplican filtros', async () => {
    mockAuthFetch.mockResolvedValue(new MockResponse(null, false, new Headers(), true, false, 200, 'OK', 'basic', '', mockMovimientos));
    render(<Graficos />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByTestId('mock-filtro')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('mock-search-button'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-grafico')).toBeInTheDocument();
    });
  });

  it('debe resetear los filtros correctamente', async () => {
    mockAuthFetch.mockResolvedValue(new MockResponse(null, false, new Headers(), true, false, 200, 'OK', 'basic', '', mockMovimientos));
    render(<Graficos />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByTestId('mock-filtro')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('mock-search-button'));
    await waitFor(() => {
      expect(screen.getByTestId('mock-grafico')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('mock-reset-button'));
    await waitFor(() => {
      expect(screen.getByTestId('mock-grafico')).toBeInTheDocument();
    });
  });

  it('debe manejar respuesta no exitosa del servidor', async () => {
    mockAuthFetch.mockResolvedValue(new MockResponse(null, false, new Headers(), false, false, 500, 'Internal Server Error', 'basic', '', []));
    render(<Graficos />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText('Error al cargar datos. Por favor intente más tarde.')).toBeInTheDocument();
    });
  });

  it('debe manejar datos con productos sin nombre', async () => {
    const movimientosSinNombre = [{
      fechaMovimiento: new Date('2025-07-01').toISOString(),
      producto: null,
      cantidad: 5,
      tipo: 'ENTRADA'
    }];

    mockAuthFetch.mockResolvedValue(new MockResponse(null, false, new Headers(), true, false, 200, 'OK', 'basic', '', movimientosSinNombre));
    render(<Graficos />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByTestId('mock-grafico')).toBeInTheDocument();
      expect(screen.getByText('Sin nombre - 5')).toBeInTheDocument();
    });
  });
});