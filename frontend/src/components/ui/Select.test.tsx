import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Select from './Select';

describe('Select component', () => {
  const baseProps = {
    label: 'Categoría',
    name: 'categoria',
    placeholder: 'Selecciona una categoría',
  };

  const options = [
    'Opción 1',
    { id: 2, nombre: 'Opción 2' },
    { value: 3, label: 'Opción 3' }
  ];

  test('muestra el label y el placeholder en modo no searchable', () => {
    render(<Select {...baseProps} options={options} searchable={false} />);
    expect(screen.getByText('Categoría')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una categoría')).toBeInTheDocument();
  });

  test('renderiza todas las opciones en modo no searchable', () => {
    render(<Select {...baseProps} options={options} searchable={false} />);
    expect(screen.getByText('Opción 1')).toBeInTheDocument();
    expect(screen.getByText('Opción 2')).toBeInTheDocument();
    expect(screen.getByText('Opción 3')).toBeInTheDocument();
  });

  test('dispara onChange al seleccionar en modo no searchable', () => {
    const handleChange = jest.fn();
    render(<Select {...baseProps} options={options} onChange={handleChange} searchable={false} />);

    const select = screen.getByLabelText('Categoría') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '2' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(select.value).toBe('2');
  });

  test('muestra valor seleccionado correctamente en modo no searchable', () => {
    render(<Select {...baseProps} options={options} value={3} searchable={false} />);
    const select = screen.getByLabelText('Categoría') as HTMLSelectElement;
    expect(select.value).toBe('3');
  });

  test('muestra y selecciona opciones correctamente en modo searchable', () => {
    const handleChange = jest.fn();
    render(<Select {...baseProps} options={options} searchable onChange={handleChange} value="" />);

    const input = screen.getByPlaceholderText('Selecciona una categoría');
    fireEvent.focus(input);

    // Escribir en el campo de búsqueda
    fireEvent.change(input, { target: { value: 'opción 2' } });

    // La opción filtrada debe aparecer
    expect(screen.getByText('Opción 2')).toBeInTheDocument();

    // Click en opción
    fireEvent.click(screen.getByText('Opción 2'));

    // El onChange debe ser llamado
    expect(handleChange).toHaveBeenCalled();
  });

  test('muestra "No se encontraron opciones" si no hay coincidencias', () => {
    render(<Select {...baseProps} options={options} searchable />);
    const input = screen.getByPlaceholderText('Selecciona una categoría');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'zzz' } });
    expect(screen.getByText('No se encontraron opciones')).toBeInTheDocument();
  });
});
