import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import PresentacionPage from './PresentacionPage';
import { useAuthFetch } from '../../components/ui/useAuthFetch';
import Swal from 'sweetalert2';

// Mocks
jest.mock('../../components/ui/useAuthFetch');
jest.mock('sweetalert2');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock de componentes
jest.mock('../../components/Home', () => {
  return function MockHome({ children }: { children: React.ReactNode }) {
    return <div data-testid="home">{children}</div>;
  };
});

jest.mock('../../components/ui/DataTable', () => {
  return function MockDataTable({ columns, data, onEdit, onDelete }: any) {
    return (
      <div data-testid="data-table">
        <table>
          <thead>
            <tr>
              {columns.map((col: any) => (
                <th key={col.accessor}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item: any, index: number) => (
              <tr key={`${item.id}-${index}`}>
                <td>{item.id}</td>
                <td>{item.nombre}</td>
                <td>
                  <button onClick={() => onEdit(item)}>Editar</button>
                  <button onClick={() => onDelete(item)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
});

jest.mock('../../components/ui/Searchbar', () => {
  return function MockSearchBar({ onSearch, placeholder }: any) {
    return (
      <input
        data-testid="search-bar"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
      />
    );
  };
});

jest.mock('../../components/ui/Modal', () => {
  return function MockModal({ children, onClose }: any) {
    return (
      <div data-testid="modal">
        <button onClick={onClose} data-testid="close-modal">X</button>
        {children}
      </div>
    );
  };
});

jest.mock('../../components/ui/Input', () => {
  return function MockInput({ label, name, value, onChange, disabled }: any) {
    return (
      <div>
        <label>{label}</label>
        <input
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          data-testid={`input-${name}`}
        />
      </div>
    );
  };
});

jest.mock('../../components/ui/Button', () => {
  return function MockButton({ children, onClick, disabled, ...props }: any) {
    return (
      <button onClick={onClick} disabled={disabled} {...props}>
        {children}
      </button>
    );
  };
});

const mockAuthFetch = useAuthFetch as jest.MockedFunction<typeof useAuthFetch>;
const mockSwal = Swal as jest.Mocked<typeof Swal>;

const mockPresentaciones = [
  { id: 1, nombre: 'Tableta' },
  { id: 2, nombre: 'Cápsula' },
  { id: 3, nombre: 'Jarabe' },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PresentacionPage - Pruebas de Integración', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    mockAuthFetch.mockReturnValue({ authFetch: mockFetch });
    mockSwal.fire = jest.fn().mockResolvedValue({ isConfirmed: false });
    jest.clearAllMocks();
  });

  describe('Carga inicial de datos', () => {
    it('debe cargar y mostrar las presentaciones al inicializar', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresentaciones,
      });

      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });

      expect(screen.getByText('Tableta')).toBeInTheDocument();
      expect(screen.getByText('Cápsula')).toBeInTheDocument();
      expect(screen.getByText('Jarabe')).toBeInTheDocument();
    });

    it('debe mostrar error cuando falla la carga de datos', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Error de red'));

      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });

      await waitFor(() => {
        expect(mockSwal.fire).toHaveBeenCalledWith('Error', 'Error de red', 'error');
      });
    });
  });

  describe('Funcionalidad de búsqueda', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresentaciones,
      });
      
      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });
    });

    it('debe filtrar presentaciones por nombre', async () => {
      const searchBar = screen.getByTestId('search-bar');
      fireEvent.change(searchBar, { target: { value: 'Tableta' } });

      await waitFor(() => {
        expect(screen.getByText('Tableta')).toBeInTheDocument();
        expect(screen.queryByText('Cápsula')).not.toBeInTheDocument();
        expect(screen.queryByText('Jarabe')).not.toBeInTheDocument();
      });
    });

    it('debe mostrar todas las presentaciones cuando la búsqueda está vacía', async () => {
      const searchBar = screen.getByTestId('search-bar');
      fireEvent.change(searchBar, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText('Tableta')).toBeInTheDocument();
        expect(screen.getByText('Cápsula')).toBeInTheDocument();
        expect(screen.getByText('Jarabe')).toBeInTheDocument();
      });
    });
  });

  describe('Crear nueva presentación', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresentaciones,
      });
      
      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });
    });

    it('debe abrir modal al hacer clic en Agregar Presentación', async () => {
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Agregar Presentación' })).toBeInTheDocument();
      });
    });

    it('debe crear nueva presentación correctamente', async () => {
      const nuevaPresentacion = { id: 4, nombre: 'Ampolla' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => nuevaPresentacion,
      });

      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const nameInput = screen.getByTestId('input-nombre');
      fireEvent.change(nameInput, { target: { value: 'Ampolla' } });

      const saveButton = screen.getByText('Guardar');
      await act(async () => {
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/presentacion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ nombre: 'Ampolla' })
        });
        expect(mockSwal.fire).toHaveBeenCalledWith('Éxito', 'Presentación creada correctamente', 'success');
      });
    });

    it('debe mostrar error cuando el nombre está vacío', async () => {
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Guardar');
      await act(async () => {
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(mockSwal.fire).toHaveBeenCalledWith('Error', 'El nombre es obligatorio', 'warning');
      });
    });

    it('debe manejar errores al crear presentación', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Error del servidor'));

      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const nameInput = screen.getByTestId('input-nombre');
      fireEvent.change(nameInput, { target: { value: 'Ampolla' } });

      const saveButton = screen.getByText('Guardar');
      await act(async () => {
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(mockSwal.fire).toHaveBeenCalledWith('Error', 'Error del servidor', 'error');
      });
    });
  });

  describe('Editar presentación', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresentaciones,
      });
      
      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });
    });

    it('debe abrir modal con datos de la presentación a editar', async () => {
      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByText('Editar Presentación')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Tableta')).toBeInTheDocument();
      });
    });

    it('debe actualizar presentación correctamente', async () => {
      const presentacionActualizada = { id: 1, nombre: 'Tableta Recubierta' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => presentacionActualizada,
      });

      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const nameInput = screen.getByTestId('input-nombre');
      fireEvent.change(nameInput, { target: { value: 'Tableta Recubierta' } });

      const saveButton = screen.getByText('Guardar');
      await act(async () => {
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/presentacion/1', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ nombre: 'Tableta Recubierta' })
        });
        expect(mockSwal.fire).toHaveBeenCalledWith('Éxito', 'Presentación actualizada correctamente', 'success');
      });
    });

    it('debe manejar errores al editar presentación', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Error al actualizar'));

      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const nameInput = screen.getByTestId('input-nombre');
      fireEvent.change(nameInput, { target: { value: 'Tableta Modificada' } });

      const saveButton = screen.getByText('Guardar');
      await act(async () => {
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(mockSwal.fire).toHaveBeenCalledWith('Error', 'Error al actualizar', 'error');
      });
    });
  });

  describe('Eliminar presentación', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresentaciones,
      });
      
      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });
    });

    it('debe mostrar confirmación antes de eliminar', async () => {
      (mockSwal.fire as jest.Mock).mockResolvedValueOnce({ isConfirmed: false });

      const deleteButtons = screen.getAllByText('Eliminar');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockSwal.fire).toHaveBeenCalledWith({
          title: '¿Eliminar presentación?',
          text: 'Esta acción no se puede deshacer.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Eliminar',
          cancelButtonText: 'Cancelar',
        });
      });
    });

    it('debe eliminar presentación cuando se confirma', async () => {
      (mockSwal.fire as jest.Mock)
        .mockResolvedValueOnce({ isConfirmed: true })
        .mockResolvedValueOnce({});
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const deleteButtons = screen.getAllByText('Eliminar');
      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/presentacion/1', {
          method: 'DELETE'
        });
        expect(mockSwal.fire).toHaveBeenCalledWith('Eliminado', 'La presentación ha sido eliminada.', 'success');
      });
    });

    it('debe manejar errores al eliminar presentación', async () => {
      (mockSwal.fire as jest.Mock)
        .mockResolvedValueOnce({ isConfirmed: true })
        .mockResolvedValueOnce({});
      
      mockFetch.mockRejectedValueOnce(new Error('Error al eliminar'));

      const deleteButtons = screen.getAllByText('Eliminar');
      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(mockSwal.fire).toHaveBeenCalledWith('Error', 'Error al eliminar', 'error');
      });
    });
  });

  describe('Funcionalidad del modal', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresentaciones,
      });
      
      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });
    });

    it('debe cerrar modal al hacer clic en cancelar', async () => {
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      });
    });

    it('debe deshabilitar controles durante el guardado', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValueOnce(promise);

      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const nameInput = screen.getByTestId('input-nombre');
      fireEvent.change(nameInput, { target: { value: 'Nueva Presentación' } });

      const saveButton = screen.getByText('Guardar');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Guardando...')).toBeInTheDocument();
        expect(screen.getByTestId('input-nombre')).toBeDisabled();
      });

      resolvePromise!({
        ok: true,
        json: async () => ({ id: 4, nombre: 'Nueva Presentación' })
      });
    });
  });

  describe('Estados de carga', () => {
    it('debe mostrar indicador de carga durante operaciones', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValueOnce(promise);

      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();

      resolvePromise!({
        ok: true,
        json: async () => mockPresentaciones
      });
    });
  });
}); 