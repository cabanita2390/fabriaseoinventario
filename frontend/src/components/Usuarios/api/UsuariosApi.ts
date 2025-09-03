import { Usuario, CreateUsuarioDto, UpdateUsuarioDto, Rol } from '../../Usuarios/types/UsuariosTypes';
import { useAuthFetch } from '../../ui/useAuthFetch';
import Swal from 'sweetalert2';

const API_BASE_URL = 'https://fabriaseo-inventario-backend.onrender.com';

export const useUsuarioService = () => {
  const { authFetch } = useAuthFetch();

  const fetchUsuarios = async (): Promise<Usuario[]> => {
    try {
      const response = await authFetch(`${API_BASE_URL}/usuario`);
      return await response.json();
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
      throw error;
    }
  };

  const fetchRoles = async (): Promise<Rol[]> => {
    try {
      const response = await authFetch(`${API_BASE_URL}/rol`);
      return await response.json();
    } catch (error) {
      console.error('Error cargando roles:', error);
      return [
        { id: 1, nombre: 'ADMIN' },
        { id: 2, nombre: 'OPERARIO_PRODUCCION' }
      ];
    }
  };

  const createUsuario = async (dto: CreateUsuarioDto): Promise<Usuario> => {
    const response = await authFetch(`${API_BASE_URL}/usuario`, {
      method: 'POST',
      body: JSON.stringify(dto)
    });
    return await response.json();
  };

  const updateUsuario = async (id: number, dto: UpdateUsuarioDto): Promise<Usuario> => {
    const response = await authFetch(`${API_BASE_URL}/usuario/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto)
    });
    return await response.json();
  };

  const deleteUsuario = async (id: number): Promise<void> => {
    await authFetch(`${API_BASE_URL}/usuario/${id}`, {
      method: 'DELETE'
    });
  };

  return {
    fetchUsuarios,
    fetchRoles,
    createUsuario,
    updateUsuario,
    deleteUsuario
  };
};