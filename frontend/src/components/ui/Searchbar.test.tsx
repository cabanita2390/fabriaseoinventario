import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from './Searchbar';

describe('SearchBar component', () => {
  test('renderiza el input con el placeholder por defecto', () => {
    render(<SearchBar onSearch={() => {}} />);
    const input = screen.getByPlaceholderText('Buscar...');
    expect(input).toBeInTheDocument();
  });

  test('llama a onSearch después de escribir con debounce', async () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(input, { target: { value: '  FABRI ' } });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('fabri');
    });
  });

  test('actualiza el valor del input al escribir', () => {
    render(<SearchBar onSearch={() => {}} />);
    const input = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(input, { target: { value: 'hola' } });
    expect(input).toHaveValue('hola');
  });
});
