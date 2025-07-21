import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import PresentacionPage from './PresentacionPage';
import { useAuthFetch } from '../../components/ui/useAuthFetch';
import Swal, { SweetAlertResult } from 'sweetalert2';

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
                  <button onClick={() => onEdit(item)} data-testid={`edit-${item.id || 'undefined'}`}>
                    Editar
                  </button>
                  <button onClick={() => onDelete(item)} data-testid={`delete-${item.id || 'undefined'}`}>
                    Eliminar
                  </button>
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

const createSweetAlertResult = (partial: Partial<SweetAlertResult>): SweetAlertResult => ({
  isConfirmed: false,
  isDenied: false,
  isDismissed: false,
  value: undefined,
  ...partial,
});

describe('PresentacionPage - Pruebas Unitarias', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    mockAuthFetch.mockReturnValue({ authFetch: mockFetch });
    mockSwal.fire = jest.fn().mockResolvedValue({ isConfirmed: false });
    jest.clearAllMocks();
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar el componente correctamente', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresentaciones,
      });

      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });

      expect(screen.getByTestId('home')).toBeInTheDocument();
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });
    });

    it('debe mostrar el botón de agregar presentación', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresentaciones,
      });

      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('add-button')).toHaveTextContent('Agregar Presentación');
      });
    });

    it('debe mostrar la barra de búsqueda', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresentaciones,
      });

      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      });
    });
  });

  describe('Carga de datos', () => {
    it('debe cargar datos correctamente en el montaje', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresentaciones,
      });

      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/presentacion');
        expect(screen.getByText('Tableta')).toBeInTheDocument();
        expect(screen.getByText('Cápsula')).toBeInTheDocument();
        expect(screen.getByText('Jarabe')).toBeInTheDocument();
      });
    });

    it('debe manejar errores en la carga de datos', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Error de red'));

      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });

      await waitFor(() => {
        expect(mockSwal.fire).toHaveBeenCalledWith('Error', 'Error de red', 'error');
      });
    });

    it('debe mostrar mensaje de error cuando la respuesta no es ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });

      await waitFor(() => {
        expect(mockSwal.fire).toHaveBeenCalledWith('Error', 'Error al cargar presentaciones', 'error');
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

    it('debe filtrar por nombre de presentación', async () => {
      const searchBar = screen.getByTestId('search-bar');
      fireEvent.change(searchBar, { target: { value: 'Tableta' } });

      await waitFor(() => {
        expect(screen.getByText('Tableta')).toBeInTheDocument();
        expect(screen.queryByText('Cápsula')).not.toBeInTheDocument();
      });
    });

    it('debe ser case-insensitive', async () => {
      const searchBar = screen.getByTestId('search-bar');
      fireEvent.change(searchBar, { target: { value: 'tableta' } });

      await waitFor(() => {
        expect(screen.getByText('Tableta')).toBeInTheDocument();
      });
    });

    it('debe mostrar todos los resultados cuando se limpia la búsqueda', async () => {
      const searchBar = screen.getByTestId('search-bar');
      fireEvent.change(searchBar, { target: { value: 'Tableta' } });
      fireEvent.change(searchBar, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText('Tableta')).toBeInTheDocument();
        expect(screen.getByText('Cápsula')).toBeInTheDocument();
        expect(screen.getByText('Jarabe')).toBeInTheDocument();
      });
    });
  });

  describe('Modal de presentación', () => {
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

    it('debe abrir modal para agregar presentación', async () => {
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Agregar Presentación' })).toBeInTheDocument();
      });
    });

    it('debe abrir modal para editar presentación', async () => {
      const editButton = screen.getByTestId('edit-1');
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Editar Presentación' })).toBeInTheDocument();
        expect(screen.getByDisplayValue('Tableta')).toBeInTheDocument();
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
  });

  describe('Crear presentación', () => {
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

    it('debe crear presentación exitosamente', async () => {
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

    it('debe validar nombre requerido', async () => {
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

    it('debe validar nombre con solo espacios', async () => {
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const nameInput = screen.getByTestId('input-nombre');
      fireEvent.change(nameInput, { target: { value: '   ' } });

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

    it('debe editar presentación exitosamente', async () => {
      const presentacionActualizada = { id: 1, nombre: 'Tableta Recubierta' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => presentacionActualizada,
      });

      const editButton = screen.getByTestId('edit-1');
      fireEvent.click(editButton);

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

    it('debe manejar presentación sin ID válido', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ nombre: 'Sin ID' }],
      });

      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });

      await waitFor(() => {
        const editButton = screen.getByTestId('edit-undefined');
        fireEvent.click(editButton);
      });

      await waitFor(() => {
        expect(mockSwal.fire).toHaveBeenCalledWith('Error', 'La presentación seleccionada no tiene ID válido', 'error');
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
      mockSwal.fire.mockResolvedValueOnce(createSweetAlertResult({ isConfirmed: false }));

      const deleteButton = screen.getByTestId('delete-1');
      fireEvent.click(deleteButton);

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
      mockSwal.fire
        .mockResolvedValueOnce(createSweetAlertResult({ isConfirmed: true }))
        .mockResolvedValueOnce(createSweetAlertResult({}));
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const deleteButton = screen.getByTestId('delete-1');
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/presentacion/1', {
          method: 'DELETE'
        });
        expect(mockSwal.fire).toHaveBeenCalledWith('Eliminado', 'La presentación ha sido eliminada.', 'success');
      });
    });

    it('debe manejar errores al eliminar', async () => {
      mockSwal.fire
        .mockResolvedValueOnce(createSweetAlertResult({ isConfirmed: true }))
        .mockResolvedValueOnce(createSweetAlertResult({}));
      
      mockFetch.mockRejectedValueOnce(new Error('Error al eliminar'));

      const deleteButton = screen.getByTestId('delete-1');
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(mockSwal.fire).toHaveBeenCalledWith('Error', 'Error al eliminar', 'error');
      });
    });

    it('no debe eliminar si no se confirma', async () => {
      mockSwal.fire.mockResolvedValueOnce(createSweetAlertResult({ isConfirmed: false }));

      const deleteButton = screen.getByTestId('delete-1');
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(mockSwal.fire).toHaveBeenCalledTimes(1);
      });
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Estados de carga', () => {
    it('debe mostrar estado de carga inicial', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValueOnce(promise);

      await act(async () => {
        renderWithRouter(<PresentacionPage />);
      });

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
      expect(screen.queryByTestId('data-table')).not.toBeInTheDocument();

      resolvePromise!({
        ok: true,
        json: async () => mockPresentaciones
      });
    });

    it('debe deshabilitar controles durante guardado', async () => {
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

  describe('Manejo de entrada del usuario', () => {
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

    it('debe actualizar el formulario al cambiar entrada', async () => {
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const nameInput = screen.getByTestId('input-nombre');
      fireEvent.change(nameInput, { target: { value: 'Nuevo Nombre' } });

      expect(nameInput).toHaveValue('Nuevo Nombre');
    });

    it('debe limpiar formulario al cerrar modal', async () => {
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const nameInput = screen.getByTestId('input-nombre');
      fireEvent.change(nameInput, { target: { value: 'Temporal' } });

      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const newNameInput = screen.getByTestId('input-nombre');
      expect(newNameInput).toHaveValue('');
    });
  });
});