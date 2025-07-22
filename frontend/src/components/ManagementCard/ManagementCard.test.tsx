import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManagementCard from './ManagementCard';

// Mock de los componentes estilizados con lógica condicional
jest.mock('../../styles/Management/ManagementPage.css', () => ({
  SectionCard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="section-card">{children}</div>
  ),
  SectionInfo: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="section-info">{children}</div>
  ),
  SectionTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="section-title">{children}</h3>
  ),
  SectionDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="section-description">{children}</p>
  ),
  RegisterButton: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
    if (!onClick) return null;
    return (
      <button data-testid="register-button" onClick={onClick}>
        {children}
      </button>
    );
  },
}));

describe('ManagementCard Component', () => {
  const mockProps = {
    title: 'Gestión de Productos',
    description: 'Administra los productos del inventario',
    onRegister: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar correctamente con todas las props', () => {
    render(<ManagementCard {...mockProps} />);

    expect(screen.getByTestId('section-card')).toBeInTheDocument();
    expect(screen.getByTestId('section-info')).toBeInTheDocument();
    expect(screen.getByTestId('section-title')).toHaveTextContent(mockProps.title);
    expect(screen.getByTestId('section-description')).toHaveTextContent(mockProps.description);
    expect(screen.getByTestId('register-button')).toHaveTextContent('Registrar');
  });

  it('debe renderizar sin el botón si onRegister no está definido', () => {
    const { queryByTestId } = render(
      <ManagementCard title={mockProps.title} description={mockProps.description} />
    );

    expect(queryByTestId('register-button')).not.toBeInTheDocument();
  });

  it('debe llamar a onRegister cuando se hace clic en el botón', () => {
    render(<ManagementCard {...mockProps} />);

    const registerButton = screen.getByTestId('register-button');
    fireEvent.click(registerButton);

    expect(mockProps.onRegister).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar el título y descripción correctamente', () => {
    const customProps = {
      title: 'Gestión de Usuarios',
      description: 'Administra los usuarios del sistema',
    };

    render(<ManagementCard {...customProps} />);

    expect(screen.getByTestId('section-title')).toHaveTextContent(customProps.title);
    expect(screen.getByTestId('section-description')).toHaveTextContent(customProps.description);
    expect(screen.queryByTestId('register-button')).not.toBeInTheDocument();
  });
});