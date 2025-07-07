// src/components/Sidebar/Sidebar.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import Sidebar from './Sidebar';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { theme } from '../../styles/theme'; // Importamos el tema real

// Mocks
jest.mock('../../assets/logo-fabriaseo.png', () => 'logo-fabriaseo.png');
jest.mock('../Sidebar/Tooltip', () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
}));

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

describe('Sidebar', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedUsedNavigate.mockClear();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider theme={theme}> {/* Usamos el tema real aquí */}
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </ThemeProvider>
    );
  };

  it('renderiza correctamente los ítems del menú', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByLabelText('Abrir menú')).toBeInTheDocument();
    expect(screen.getByLabelText('Ir al dashboard')).toBeInTheDocument();

    const menuItems = ['Dashboard', 'Insumos', 'Inventario', 'Movimientos', 'Reportes', 'Gestión'];
    menuItems.forEach((text) => {
      expect(screen.getByLabelText(text)).toBeInTheDocument();
    });
  });

  it('abre y cierra el sidebar en vista móvil', async () => {
    renderWithProviders(<Sidebar />);

    const openButton = screen.getByLabelText('Abrir menú');
    await userEvent.click(openButton);

    const overlay = screen.getByTestId('sidebar-overlay');
    expect(overlay).toBeVisible();

    fireEvent.click(overlay);
  });

  it('ejecuta logout correctamente', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Mile' }));

    renderWithProviders(<Sidebar />);

    const logoutButton = screen.getByLabelText('Cerrar sesión');
    await userEvent.click(logoutButton);

    expect(localStorage.getItem('token')).toBeNull();
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/login');
  });

  it('ejecuta logout con tecla Enter', () => {
    renderWithProviders(<Sidebar />);

    const logoutButton = screen.getByLabelText('Cerrar sesión');
    fireEvent.keyDown(logoutButton, { key: 'Enter', code: 'Enter' });

    expect(mockedUsedNavigate).toHaveBeenCalledWith('/login');
  });
});