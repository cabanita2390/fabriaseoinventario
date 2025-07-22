import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';


jest.mock('./Sidebar/Sidebar', () => () => <div data-testid="sidebar">Sidebar</div>);

describe('Home component', () => {
  test('muestra el título de la ruta correctamente', () => {
    render(
      <MemoryRouter initialEntries={['/insumos']}>
        <Home>
          <p>Contenido</p>
        </Home>
      </MemoryRouter>
    );

    expect(screen.getByText('Gestión de Insumos')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  test('no muestra título para rutas no conocidas', () => {
    render(
      <MemoryRouter initialEntries={['/ruta-desconocida']}>
        <Home />
      </MemoryRouter>
    );

    // No debería haber título
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
