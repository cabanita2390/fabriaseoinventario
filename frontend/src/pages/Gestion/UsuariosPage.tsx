import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from '../../components/Home';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import { Header, BackButton } from '../../styles/Gestion/Gestion.css';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Usuario, initialForm,Rol,  UpdateUsuarioDto } from '../../components/Usuarios/types/UsuariosTypes';
import { useUsuarioService } from '../../components/Usuarios/api/UsuariosApi';
import { UsuarioFormModal } from '../../components/Usuarios/components/UsuarioFormModal';

const UsuariosPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<Usuario>(initialForm);
  const [data, setData] = useState<Usuario[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Rol[]>([]);
  
  const {
    fetchUsuarios,
    fetchRoles,
    createUsuario,
    updateUsuario,
    deleteUsuario
  } = useUsuarioService();

  // Procesar datos para DataTable
  const processedData = data.map(usuario => ({
    ...usuario,
    rol_nombre: usuario.rol?.nombre || 'Sin rol'
  }));

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Username', accessor: 'username' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Email', accessor: 'email' },
    { header: 'Rol', accessor: 'rol_nombre' },
    { header: 'Estado', accessor: 'estado' },
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [usuarios, rolesData] = await Promise.all([
          fetchUsuarios(),
          fetchRoles()
        ]);
        setData(usuarios);
        setRoles(rolesData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRol = roles.find(r => r.nombre === e.target.value);
    if (selectedRol) {
      setForm({ ...form, rol: selectedRol });
    }
  };

  const handleSave = async () => {
    if (isEditMode) {
      await handleUpdate();
    } else {
      await handleCreate();
    }
  };

  const handleCreate = async () => {
    const { username, nombre, email, password } = form;

    if (!username || !nombre || !email || !password) {
      Swal.fire('Campos obligatorios', 'Completa todos los campos requeridos', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const nuevoUsuario = await createUsuario({
        username,
        nombre,
        email,
        password
      });
      
      setData(prev => [...prev, nuevoUsuario]);
      Swal.fire('¡Creado!', 'Usuario creado correctamente', 'success');
      setForm(initialForm);
      setShowModal(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear usuario';
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    const { id, username, nombre, email, password } = form;

    if (!username || !nombre || !email) {
      Swal.fire('Campos obligatorios', 'Completa los campos requeridos', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const updateData: UpdateUsuarioDto = { username, nombre, email };
      if (password && password.trim() !== '') {
        updateData.password = password;
      }

      const updatedUser = await updateUsuario(id, updateData);
      
      setData(prev => 
        prev.map(u => u.id === id ? updatedUser : u)
      );
      Swal.fire('¡Actualizado!', 'Usuario actualizado correctamente', 'success');
      setForm(initialForm);
      setShowModal(false);
      setIsEditMode(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar usuario';
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (row: Usuario) => {
    setForm({
      ...row,
      password: '' // No mostrar contraseña actual
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (row: Usuario) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: `¿Estás seguro de eliminar a ${row.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Eliminar'
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        await deleteUsuario(row.id);
        setData(prev => prev.filter(u => u.id !== row.id));
        Swal.fire('Eliminado!', 'Usuario eliminado correctamente', 'success');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Error al eliminar usuario';
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCloseModal = () => {
    if (!isLoading) {
      setForm(initialForm);
      setShowModal(false);
      setIsEditMode(false);
    }
  };

  const handleOpenCreateModal = () => {
    setForm(initialForm);
    setShowModal(true);
  };

  return (
    <Home>
      <Header>
            <BackButton onClick={() => navigate('/gestion')}>
              <FaArrowLeft /> Volver 
            </BackButton>
            <Button onClick={handleOpenCreateModal} disabled={isLoading}>Agregar Usuario</Button>
      </Header>

      {isLoading ? (
        <div className="loading-container">
          <div>Cargando...</div>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={processedData} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      <UsuarioFormModal
        showModal={showModal}
        isLoading={isLoading}
        isEditMode={isEditMode}
        form={form}
        roles={roles}
        onChange={handleChange}
        onSelect={handleSelect}
        onSave={handleSave}
        onClose={handleCloseModal}
      />
    </Home>
  );
};

export default UsuariosPage;