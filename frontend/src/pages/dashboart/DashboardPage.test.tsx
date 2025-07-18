import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from './DashboardPage';
import { MemoryRouter } from 'react-router-dom';
import { useAuthFetch } from '../../components/ui/useAuthFetch';

// Mocks
jest.mock('../../components/ui/useAuthFetch');

// Mock del componente Home
jest.mock('../../components/Home', () => ({ children }: { children: React.ReactNode }) => (
  <div data-testid="home-component">{children}</div>
));

// Mock del componente Labelstack
jest.mock('../../components/dashboart/LabelStack/Labelstack', () => () => (
  <div data-testid="labelstack-component">
    <div data-testid="stock-total">Stock Total: 1000</div>
    <div data-testid="productos-bajo-stock">Productos Bajo Stock: 5</div>
    <div data-testid="movimientos-hoy">Movimientos Hoy: 25</div>
    <div data-testid="valor-inventario">Valor Inventario: $50,000</div>
  </div>
));

// Mock del componente MovimientoList
jest.mock('../../components/dashboart/Entradalist/EntradaList', () => () => (
  <div data-testid="movimiento-list">
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Producto</th>
          <th>Tipo</th>
          <th>Cantidad</th>
        </tr>
      </thead>
      <tbody>
        <tr data-testid="movimiento-item">
          <td>2025-01-15</td>
          <td>Producto Test</td>
          <td>Entrada</td>
          <td>10</td>
        </tr>
      </tbody>
    </table>
  </div>
));

// Mock del componente Gstockbajo
jest.mock('../../components/dashboart/graficas/Gstockbajo', () => () => (
  <div data-testid="grafico-stock-bajo">
    <h3>Productos con Stock Bajo</h3>
    <div data-testid="chart-container">
      <div data-testid="chart-bar" style={{ height: '50px', backgroundColor: '#ff6b6b' }}>
        Producto A: 2 unidades
      </div>
      <div data-testid="chart-bar" style={{ height: '30px', backgroundColor: '#ffa726' }}>
        Producto B: 3 unidades
      </div>
    </div>
  </div>
));

// Mock del CSS
jest.mock('../../styles/home.css', () => ({}));

describe('DashboardPage', () => {
  const mockAuthFetch = jest.fn();

  beforeEach(() => {
    (useAuthFetch as jest.Mock).mockReturnValue({
      authFetch: mockAuthFetch,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar correctamente todos los componentes principales', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      );
    });

    // Verificar que el componente Home se renderiza
    expect(screen.getByTestId('home-component')).toBeInTheDocument();

    // Verificar que el componente Labelstack se renderiza
    expect(screen.getByTestId('labelstack-component')).toBeInTheDocument();

    // Verificar que el componente MovimientoList se renderiza
    expect(screen.getByTestId('movimiento-list')).toBeInTheDocument();

    // Verificar que el componente Gstockbajo se renderiza
    expect(screen.getByTestId('grafico-stock-bajo')).toBeInTheDocument();
  });

  it('debería mostrar los títulos de las secciones correctamente', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      );
    });

    // Verificar títulos de las secciones
    expect(screen.getByText('Gráficas')).toBeInTheDocument();
    expect(screen.getByText('Entrada de productos')).toBeInTheDocument();
  });

  it('debería renderizar las estadísticas del Labelstack', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      );
    });

    // Verificar que se muestran las estadísticas
    expect(screen.getByTestId('stock-total')).toHaveTextContent('Stock Total: 1000');
    expect(screen.getByTestId('productos-bajo-stock')).toHaveTextContent('Productos Bajo Stock: 5');
    expect(screen.getByTestId('movimientos-hoy')).toHaveTextContent('Movimientos Hoy: 25');
    expect(screen.getByTestId('valor-inventario')).toHaveTextContent('Valor Inventario: $50,000');
  });

  it('debería mostrar la lista de movimientos', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      );
    });

    // Verificar que se muestra la tabla de movimientos
    expect(screen.getByText('Fecha')).toBeInTheDocument();
    expect(screen.getByText('Producto')).toBeInTheDocument();
    expect(screen.getByText('Tipo')).toBeInTheDocument();
    expect(screen.getByText('Cantidad')).toBeInTheDocument();

    // Verificar que se muestra al menos un movimiento
    expect(screen.getByTestId('movimiento-item')).toBeInTheDocument();
    expect(screen.getByText('Producto Test')).toBeInTheDocument();
    expect(screen.getByText('Entrada')).toBeInTheDocument();
  });

  it('debería mostrar el gráfico de stock bajo', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      );
    });

    // Verificar que se muestra el gráfico
    expect(screen.getByText('Productos con Stock Bajo')).toBeInTheDocument();
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    
    // Verificar que se muestran las barras del gráfico
    const chartBars = screen.getAllByTestId('chart-bar');
    expect(chartBars).toHaveLength(2);
    expect(chartBars[0]).toHaveTextContent('Producto A: 2 unidades');
    expect(chartBars[1]).toHaveTextContent('Producto B: 3 unidades');
  });

  it('debería tener la estructura CSS correcta', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      );
    });

    // Verificar que existen las clases CSS esperadas
    expect(document.querySelector('.label-div')).toBeInTheDocument();
    expect(document.querySelector('.grafico-div')).toBeInTheDocument();
    expect(document.querySelector('.lista-div')).toBeInTheDocument();
  });

  it('debería renderizar sin errores cuando no hay datos', async () => {
    // Mock para simular componentes sin datos
    jest.doMock('../../components/dashboart/LabelStack/Labelstack', () => () => (
      <div data-testid="labelstack-component">
        <div data-testid="no-data">No hay datos disponibles</div>
      </div>
    ));

    jest.doMock('../../components/dashboart/Entradalist/EntradaList', () => () => (
      <div data-testid="movimiento-list">
        <div data-testid="no-movimientos">No hay movimientos recientes</div>
      </div>
    ));

    await act(async () => {
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      );
    });

    // Verificar que los componentes se renderizan aunque no haya datos
    expect(screen.getByTestId('labelstack-component')).toBeInTheDocument();
    expect(screen.getByTestId('movimiento-list')).toBeInTheDocument();
    expect(screen.getByTestId('grafico-stock-bajo')).toBeInTheDocument();
  });

  it('debería mantener la estructura del layout responsive', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      );
    });

    // Verificar que los contenedores principales existen
    const labelDiv = document.querySelector('.label-div');
    const graficoDiv = document.querySelector('.grafico-div');
    const listaDiv = document.querySelector('.lista-div');

    expect(labelDiv).toBeInTheDocument();
    expect(graficoDiv).toBeInTheDocument();
    expect(listaDiv).toBeInTheDocument();

    // Verificar que los componentes están dentro de sus contenedores
    expect(labelDiv).toContainElement(screen.getByTestId('labelstack-component'));
    expect(graficoDiv).toContainElement(screen.getByTestId('grafico-stock-bajo'));
    expect(listaDiv).toContainElement(screen.getByTestId('movimiento-list'));
  });

  it('debería renderizar todos los elementos en el orden correcto', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      );
    });

    const container = screen.getByTestId('home-component');
    const children = Array.from(container.children);

    // Verificar el orden de los elementos
    expect(children[0]).toHaveClass('label-div');
    expect(children[1]).toHaveClass('grafico-div');
    expect(children[2]).toHaveClass('lista-div');
  });
});