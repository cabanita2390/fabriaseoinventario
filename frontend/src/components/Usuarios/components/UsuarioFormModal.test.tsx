import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UsuarioFormModal } from './UsuarioFormModal';
import { Usuario, Rol } from '../types/UsuariosTypes';

const mockForm: Usuario = {
  id: 123, 
  username: 'mileuser',
  nombre: 'Mile Usuario',
  email: 'mile@test.com',
  password: '',
  rol: { id: 1, nombre: 'Admin' },
};

const roles: Rol[] = [
  { id: 1, nombre: 'Admin' },
  { id: 2, nombre: 'Usuario' },
];

const baseProps = {
  showModal: true,
  isLoading: false,
  isEditMode: false,
  form: mockForm,
  roles,
  onChange: jest.fn(),
  onSelect: jest.fn(),
  onSave: jest.fn(),
  onClose: jest.fn(),
};

describe('UsuarioFormModal', () => {

  test('renderiza correctamente el formulario en modo creación', () => {
    render(<UsuarioFormModal {...baseProps} />);

    expect(screen.getByText('Crear Nuevo Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toHaveValue('mileuser');
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Mile Usuario');
    expect(screen.getByLabelText(/email/i)).toHaveValue('mile@test.com');
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/rol/i)).not.toBeInTheDocument(); // no debe aparecer el select
  });

  test('renderiza correctamente el formulario en modo edición con roles', () => {
    const editProps = {
      ...baseProps,
      isEditMode: true,
    };

    render(<UsuarioFormModal {...editProps} />);

    expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText(/rol/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rol/i)).toHaveValue('Admin');
  });

  test('dispara eventos al interactuar con el formulario', () => {
    render(<UsuarioFormModal {...baseProps} />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'nuevo-user' },
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'nuevo@correo.com' },
    });

    fireEvent.click(screen.getByText('Crear'));

    expect(baseProps.onChange).toHaveBeenCalled();
    expect(baseProps.onSave).toHaveBeenCalled();
  });

  test('no renderiza si showModal es false', () => {
    const hiddenProps = {
      ...baseProps,
      showModal: false,
    };

    const { container } = render(<UsuarioFormModal {...hiddenProps} />);
    expect(container).toBeEmptyDOMElement();
  });

});
