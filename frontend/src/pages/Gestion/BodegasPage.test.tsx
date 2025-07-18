import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import BodegasPage from './BodegasPage';
import { MemoryRouter } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuthFetch } from '../../components/ui/useAuthFetch';

// Mocks
jest.mock('../../components/ui/useAuthFetch');

// Mock mejorado de sweetalert2
jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../components/Home', () => ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
));

jest.mock('../../components/ui/DataTable', () => ({ 
  data, onEdit, onDelete 
}: { 
  data: any[], 
  onEdit: (row: any) => void, 
  onDelete: (row: any) => void 
}) => (
  <div>
    {data.map((item) => (
      <div key={item.id} data-testid="bodega-item">
        <span>{item.nombre}</span>
        <button onClick={() => onEdit(item)}>Editar</button>
        <button onClick={() => onDelete(item)}>Eliminar</button>
      </div>
    ))}
  </div>
));

jest.mock('../../components/ui/Searchbar', () => ({ 
  onSearch 
}: { 
  onSearch: (value: string) => void 
}) => (
  <input 
    data-testid="search-bar" 
    onChange={(e) => onSearch(e.target.value)} 
  />
));

jest.mock('../../components/ui/Input', () => ({ 
  label, name, value, onChange 
}: { 
  label: string, 
  name: string, 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void 
}) => (
  <div>
    <label>{label}</label>
    <input 
      data-testid={`input-${name}`}
      name={name}
      value={value}
      onChange={onChange}
    />
  </div>
));

jest.mock('../../components/ui/Button', () => ({ 
  children, onClick, disabled 
}: { 
  children: React.ReactNode, 
  onClick: () => void, 
  disabled?: boolean 
}) => (
  <button 
    data-testid="button" 
    onClick={onClick} 
    disabled={disabled}
  >
    {children}
  </button>
));

jest.mock('../../components/ui/Modal', () => ({ 
  children, onClose 
}: { 
  children: React.ReactNode, 
  onClose: () => void 
}) => (
  <div data-testid="modal">
    <button onClick={onClose}>Cerrar Modal</button>
    {children}
  </div>
));

describe('BodegasPage', () => {
  const mockAuthFetch = jest.fn();
  const mockSwal = Swal.fire as jest.Mock;

  beforeEach(() => {
    (useAuthFetch as jest.Mock).mockReturnValue({
      authFetch: mockAuthFetch,
    });
    
    // Mock por defecto para casos simples
    mockSwal.mockResolvedValue({ 
      isConfirmed: true, 
      isDenied: false, 
      isDismissed: false 
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockBodegas = [
    { id: 1, nombre: 'Bodega Principal', ubicacion: 'Piso 1' },
    { id: 2, nombre: 'Bodega Secundaria', ubicacion: 'Piso 2' },
  ];

  it('debería cargar y mostrar las bodegas correctamente', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockBodegas),
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <BodegasPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Bodega Principal')).toBeInTheDocument();
      expect(screen.getByText('Bodega Secundaria')).toBeInTheDocument();
    });
  });

  it('debería manejar errores al cargar bodegas', async () => {
    mockAuthFetch.mockRejectedValueOnce(new Error('Error de prueba'));

    await act(async () => {
      render(
        <MemoryRouter>
          <BodegasPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith('Error', 'Error al cargar bodegas', 'error');
    });
  });

  it('debería filtrar bodegas al buscar', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockBodegas),
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <BodegasPage />
        </MemoryRouter>
      );
    });

    const searchInput = screen.getByTestId('search-bar');
    fireEvent.change(searchInput, { target: { value: 'Principal' } });

    await waitFor(() => {
      expect(screen.getByText('Bodega Principal')).toBeInTheDocument();
      expect(screen.queryByText('Bodega Secundaria')).not.toBeInTheDocument();
    });
  });

  it('debería abrir el modal para agregar nueva bodega', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockBodegas),
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <BodegasPage />
        </MemoryRouter>
      );
    });

    const addButton = screen.getByText('Agregar Bodega');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Nueva Bodega')).toBeInTheDocument();
    });
  });

  it('debería abrir el modal para editar bodega', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockBodegas),
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <BodegasPage />
        </MemoryRouter>
      );
    });

    const editButtons = await screen.findAllByText('Editar');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(`Editar Bodega #1`)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bodega Principal')).toBeInTheDocument();
    });
  });

  it('debería guardar una nueva bodega correctamente', async () => {
    const nuevaBodega = { id: 3, nombre: 'Nueva Bodega', ubicacion: 'Piso 3' };
    
    mockAuthFetch
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockBodegas),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(nuevaBodega),
      });

    await act(async () => {
      render(
        <MemoryRouter>
          <BodegasPage />
        </MemoryRouter>
      );
    });

    const addButton = screen.getByText('Agregar Bodega');
    fireEvent.click(addButton);

    const nombreInput = screen.getByTestId('input-nombre');
    fireEvent.change(nombreInput, { target: { value: 'Nueva Bodega' } });

    const ubicacionInput = screen.getByTestId('input-ubicacion');
    fireEvent.change(ubicacionInput, { target: { value: 'Piso 3' } });

    const saveButton = screen.getByText('Guardar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Bodega creada correctamente', 'success');
      expect(mockAuthFetch).toHaveBeenCalledWith('http://localhost:3000/bodega', {
        method: 'POST',
        body: JSON.stringify({
          nombre: 'Nueva Bodega',
          ubicacion: 'Piso 3'
        })
      });
    });
  });

  it('debería mostrar error si no se completa el nombre al guardar', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockBodegas),
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <BodegasPage />
        </MemoryRouter>
      );
    });

    const addButton = screen.getByText('Agregar Bodega');
    fireEvent.click(addButton);

    const saveButton = screen.getByText('Guardar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith('Error', 'El nombre es obligatorio', 'warning');
    });
  });

  it('debería eliminar una bodega con confirmación', async () => {
    // Configurar mocks para cargar datos y eliminar
    mockAuthFetch
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockBodegas),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({}),
      });

    // Configurar mock específico para la confirmación de eliminación
    mockSwal.mockResolvedValueOnce({
      isConfirmed: true,
      isDenied: false,
      isDismissed: false
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <BodegasPage />
        </MemoryRouter>
      );
    });

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText('Bodega Principal')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Eliminar');
    fireEvent.click(deleteButtons[0]);

    // Verificar que se llamó el modal de confirmación
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        title: '¿Eliminar bodega?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });
    });

    // Verificar que se llamó la API de eliminación
    await waitFor(() => {
      expect(mockAuthFetch).toHaveBeenCalledWith(
        'http://localhost:3000/bodega/1',
        {
          method: 'DELETE'
        }
      );
    });
  });

  it('debería cancelar la eliminación si el usuario no confirma', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockBodegas),
    });

    // Configurar mock para que el usuario cancele
    mockSwal.mockResolvedValueOnce({
      isConfirmed: false,
      isDenied: false,
      isDismissed: true
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <BodegasPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Bodega Principal')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Eliminar');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        title: '¿Eliminar bodega?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });
    });

    // Verificar que NO se llamó la API de eliminación
    expect(mockAuthFetch).toHaveBeenCalledTimes(1); // Solo la carga inicial
  });
});