import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import BodegasPage from './BodegasPage';
import { useAuthFetch } from '../../components/ui/useAuthFetch';
import Swal from 'sweetalert2';

// Mock de useAuthFetch
jest.mock('../../components/ui/useAuthFetch');

// Mock de sweetalert2
jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

// Mock del navegador
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock de componentes
jest.mock('../../components/Home', () => ({ children }: { children: React.ReactNode }) => (
  <div data-testid="home">{children}</div>
));

jest.mock('../../components/ui/DataTable', () => ({ 
  data, onEdit, onDelete, columns 
}: { 
  data: any[], 
  onEdit: (row: any) => void, 
  onDelete: (row: any) => void,
  columns: any[]
}) => (
  <div data-testid="data-table">
    <div data-testid="table-headers">
      {columns.map((col, index) => (
        <span key={index} data-testid={`header-${col.accessor}`}>{col.header}</span>
      ))}
    </div>
    <div data-testid="table-body">
      {data.map((item) => (
        <div key={item.id} data-testid={`bodega-row-${item.id}`}>
          <span data-testid={`bodega-name-${item.id}`}>{item.nombre}</span>
          <span data-testid={`bodega-location-${item.id}`}>{item.ubicacion}</span>
          <button 
            data-testid={`edit-btn-${item.id}`} 
            onClick={() => onEdit(item)}
          >
            Editar
          </button>
          <button 
            data-testid={`delete-btn-${item.id}`} 
            onClick={() => onDelete(item)}
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
  </div>
));

jest.mock('../../components/ui/Searchbar', () => ({ 
  onSearch, placeholder 
}: { 
  onSearch: (value: string) => void,
  placeholder: string 
}) => (
  <input 
    data-testid="search-input" 
    placeholder={placeholder}
    onChange={(e) => onSearch(e.target.value)} 
  />
));

jest.mock('../../components/ui/Input', () => ({ 
  label, name, value, onChange, required 
}: { 
  label: string, 
  name: string, 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  required?: boolean 
}) => (
  <div data-testid={`input-container-${name}`}>
    <label data-testid={`label-${name}`}>{label}</label>
    <input 
      data-testid={`input-${name}`}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
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
    <button data-testid="modal-close" onClick={onClose}>×</button>
    {children}
  </div>
));

describe('BodegasPage - Pruebas de Integración', () => {
  const mockAuthFetch = jest.fn();
  const mockSwal = Swal.fire as jest.Mock;

  beforeEach(() => {
    (useAuthFetch as jest.Mock).mockReturnValue({
      authFetch: mockAuthFetch,
    });
    
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
    { id: 3, nombre: 'Almacén Central', ubicacion: null },
  ];

  describe('Flujo completo de carga inicial', () => {
    it('debería cargar y renderizar todos los componentes correctamente', async () => {
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

      // Verificar que se cargaron todos los componentes principales
      expect(screen.getByTestId('home')).toBeInTheDocument();
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByText('Agregar Bodega')).toBeInTheDocument();
      expect(screen.getByText('Volver a Gestión')).toBeInTheDocument();

      // Verificar headers de la tabla
      expect(screen.getByTestId('header-id')).toHaveTextContent('ID');
      expect(screen.getByTestId('header-nombre')).toHaveTextContent('Nombre');
      expect(screen.getByTestId('header-ubicacion')).toHaveTextContent('Ubicación');

      // Verificar que se cargaron los datos
      await waitFor(() => {
        expect(screen.getByTestId('bodega-row-1')).toBeInTheDocument();
        expect(screen.getByTestId('bodega-row-2')).toBeInTheDocument();
        expect(screen.getByTestId('bodega-row-3')).toBeInTheDocument();
      });

      // Verificar llamada a la API
      expect(mockAuthFetch).toHaveBeenCalledWith('http://localhost:3000/bodega');
    });
  });

  describe('Flujo de búsqueda y filtrado', () => {
    it('debería filtrar bodegas por nombre en tiempo real', async () => {
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
        expect(screen.getByTestId('bodega-row-1')).toBeInTheDocument();
      });

      // Buscar por "Principal"
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Principal' } });

      await waitFor(() => {
        expect(screen.getByTestId('bodega-row-1')).toBeInTheDocument();
        expect(screen.queryByTestId('bodega-row-2')).not.toBeInTheDocument();
        expect(screen.queryByTestId('bodega-row-3')).not.toBeInTheDocument();
      });
    });

    it('debería filtrar bodegas por ubicación', async () => {
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
        expect(screen.getByTestId('bodega-row-1')).toBeInTheDocument();
      });

      // Buscar por "Piso 2"
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Piso 2' } });

      await waitFor(() => {
        expect(screen.queryByTestId('bodega-row-1')).not.toBeInTheDocument();
        expect(screen.getByTestId('bodega-row-2')).toBeInTheDocument();
        expect(screen.queryByTestId('bodega-row-3')).not.toBeInTheDocument();
      });
    });

    it('debería mostrar mensaje cuando no hay resultados', async () => {
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
        expect(screen.getByTestId('bodega-row-1')).toBeInTheDocument();
      });

      // Buscar algo que no existe
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'NoExiste' } });

      await waitFor(() => {
        expect(screen.queryByTestId('bodega-row-1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('bodega-row-2')).not.toBeInTheDocument();
        expect(screen.queryByTestId('bodega-row-3')).not.toBeInTheDocument();
      });
    });
  });

  describe('Flujo completo de creación de bodega', () => {
    it('debería completar el flujo de creación exitosamente', async () => {
      const nuevaBodega = { id: 4, nombre: 'Nueva Bodega', ubicacion: 'Piso 3' };
      
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

      // Paso 1: Hacer clic en "Agregar Bodega"
      const addButton = screen.getByText('Agregar Bodega');
      fireEvent.click(addButton);

      // Paso 2: Verificar que se abrió el modal
      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByText('Nueva Bodega')).toBeInTheDocument();
      });

      // Paso 3: Llenar el formulario
      const nombreInput = screen.getByTestId('input-nombre');
      const ubicacionInput = screen.getByTestId('input-ubicacion');
      
      fireEvent.change(nombreInput, { target: { value: 'Nueva Bodega' } });
      fireEvent.change(ubicacionInput, { target: { value: 'Piso 3' } });

      // Paso 4: Guardar
      const saveButton = screen.getByText('Guardar');
      fireEvent.click(saveButton);

      // Paso 5: Verificar llamada a la API
      await waitFor(() => {
        expect(mockAuthFetch).toHaveBeenCalledWith('http://localhost:3000/bodega', {
          method: 'POST',
          body: JSON.stringify({
            nombre: 'Nueva Bodega',
            ubicacion: 'Piso 3'
          })
        });
      });

      // Paso 6: Verificar mensaje de éxito
      await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Bodega creada correctamente', 'success');
      });
    });

    it('debería manejar errores durante la creación', async () => {
      mockAuthFetch
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockBodegas),
        })
        .mockRejectedValueOnce(new Error('Error de servidor'));

      await act(async () => {
        render(
          <MemoryRouter>
            <BodegasPage />
          </MemoryRouter>
        );
      });

      // Abrir modal y llenar formulario
      const addButton = screen.getByText('Agregar Bodega');
      fireEvent.click(addButton);

      const nombreInput = screen.getByTestId('input-nombre');
      fireEvent.change(nombreInput, { target: { value: 'Test Bodega' } });

      // Intentar guardar
      const saveButton = screen.getByText('Guardar');
      fireEvent.click(saveButton);

      // Verificar mensaje de error
      await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalledWith('Error', 'No se pudo guardar la bodega', 'error');
      });
    });
  });

  describe('Flujo completo de edición de bodega', () => {
    it('debería completar el flujo de edición exitosamente', async () => {
      const bodegaActualizada = { id: 1, nombre: 'Bodega Actualizada', ubicacion: 'Piso Nuevo' };
      
      mockAuthFetch
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockBodegas),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(bodegaActualizada),
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
        expect(screen.getByTestId('bodega-row-1')).toBeInTheDocument();
      });

      // Paso 1: Hacer clic en editar
      const editButton = screen.getByTestId('edit-btn-1');
      fireEvent.click(editButton);

      // Paso 2: Verificar que se abrió el modal con datos pre-cargados
      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByText('Editar Bodega #1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Bodega Principal')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Piso 1')).toBeInTheDocument();
      });

      // Paso 3: Modificar los datos
      const nombreInput = screen.getByTestId('input-nombre');
      const ubicacionInput = screen.getByTestId('input-ubicacion');
      
      fireEvent.change(nombreInput, { target: { value: 'Bodega Actualizada' } });
      fireEvent.change(ubicacionInput, { target: { value: 'Piso Nuevo' } });

      // Paso 4: Guardar cambios
      const saveButton = screen.getByText('Guardar');
      fireEvent.click(saveButton);

      // Paso 5: Verificar llamada a la API
      await waitFor(() => {
        expect(mockAuthFetch).toHaveBeenCalledWith('http://localhost:3000/bodega/1', {
          method: 'PATCH',
          body: JSON.stringify({
            nombre: 'Bodega Actualizada',
            ubicacion: 'Piso Nuevo'
          })
        });
      });

      // Paso 6: Verificar mensaje de éxito
      await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Bodega actualizada correctamente', 'success');
      });
    });
  });

  describe('Flujo completo de eliminación de bodega', () => {
    it('debería completar el flujo de eliminación exitosamente', async () => {
      mockAuthFetch
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockBodegas),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({}),
        });

      // Mock específico para confirmación de eliminación
      mockSwal
        .mockResolvedValueOnce({
          isConfirmed: true,
          isDenied: false,
          isDismissed: false
        })
        .mockResolvedValueOnce({
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
        expect(screen.getByTestId('bodega-row-1')).toBeInTheDocument();
      });

      // Paso 1: Hacer clic en eliminar
      const deleteButton = screen.getByTestId('delete-btn-1');
      fireEvent.click(deleteButton);

      // Paso 2: Verificar modal de confirmación
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

      // Paso 3: Verificar llamada a la API
      await waitFor(() => {
        expect(mockAuthFetch).toHaveBeenCalledWith(
          'http://localhost:3000/bodega/1',
          { method: 'DELETE' }
        );
      });

      // Paso 4: Verificar mensaje de éxito
      await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Bodega eliminada', 'success');
      });
    });

    it('debería cancelar la eliminación cuando el usuario rechaza', async () => {
      mockAuthFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockBodegas),
      });

      // Mock para cancelar eliminación
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
        expect(screen.getByTestId('bodega-row-1')).toBeInTheDocument();
      });

      // Hacer clic en eliminar
      const deleteButton = screen.getByTestId('delete-btn-1');
      fireEvent.click(deleteButton);

      // Verificar que se mostró el modal de confirmación
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

  describe('Flujo de navegación', () => {
    it('debería navegar de vuelta a gestión al hacer clic en "Volver a Gestión"', async () => {
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

      const backButton = screen.getByText('Volver a Gestión');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/gestion');
    });
  });

  describe('Flujo de validación de formulario', () => {
    it('debería validar que el nombre sea obligatorio', async () => {
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

      // Abrir modal
      const addButton = screen.getByText('Agregar Bodega');
      fireEvent.click(addButton);

      // Intentar guardar sin nombre
      const saveButton = screen.getByText('Guardar');
      fireEvent.click(saveButton);

      // Verificar mensaje de validación
      await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalledWith('Error', 'El nombre es obligatorio', 'warning');
      });

      // Verificar que NO se llamó la API
      expect(mockAuthFetch).toHaveBeenCalledTimes(1); // Solo la carga inicial
    });

    it('debería permitir crear bodega solo con nombre (ubicación opcional)', async () => {
      const nuevaBodega = { id: 4, nombre: 'Solo Nombre', ubicacion: null };
      
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

      // Abrir modal y llenar solo el nombre
      const addButton = screen.getByText('Agregar Bodega');
      fireEvent.click(addButton);

      const nombreInput = screen.getByTestId('input-nombre');
      fireEvent.change(nombreInput, { target: { value: 'Solo Nombre' } });

      // Guardar
      const saveButton = screen.getByText('Guardar');
      fireEvent.click(saveButton);

      // Verificar que se guardó correctamente
      await waitFor(() => {
        expect(mockAuthFetch).toHaveBeenCalledWith('http://localhost:3000/bodega', {
          method: 'POST',
          body: JSON.stringify({
            nombre: 'Solo Nombre',
            ubicacion: null
          })
        });
      });
    });
  });

  describe('Flujo de manejo de errores de sesión', () => {
    it('debería manejar errores de sesión expirada sin mostrar alerta', async () => {
      const sessionError = new Error('Sesión expirada');
      sessionError.name = 'SessionError';
      
      mockAuthFetch.mockRejectedValueOnce(sessionError);

      await act(async () => {
        render(
          <MemoryRouter>
            <BodegasPage />
          </MemoryRouter>
        );
      });

      // Verificar que NO se mostró alerta de error
      await waitFor(() => {
        expect(Swal.fire).not.toHaveBeenCalledWith('Error', 'Error al cargar bodegas', 'error');
      });
    });
  });
});
