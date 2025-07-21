import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';

describe('Input component', () => {
  test('muestra el label correctamente', () => {
    render(<Input label="Nombre" />);
    expect(screen.getByText('Nombre')).toBeInTheDocument();
  });

  test('renderiza el input con placeholder y tipo correctamente', () => {
    render(<Input label="Correo" type="email" placeholder="Ej: ejemplo@correo.com" />);
    const input = screen.getByPlaceholderText('Ej: ejemplo@correo.com');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  test('actualiza el valor del input al escribir', () => {
    render(<Input label="Usuario" placeholder="Escribe tu nombre" />);
    const input = screen.getByPlaceholderText('Escribe tu nombre');
    fireEvent.change(input, { target: { value: 'mile' } });
    expect(input).toHaveValue('mile');
  });
});
