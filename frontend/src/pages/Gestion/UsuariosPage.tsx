import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from '../../components/Home';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header, BackButton } from '../../styles/Gestion/Gestion.css';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';

type Rol = {
  id: number;
  nombre: string;
};

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  contraseña: string;
  fechaCreacion?: string;
  id_rol: number;
  estado?: string;
  rol?: Rol;
};

const initialForm: Usuario = {
  id: 0,
  nombre: '',
  email: '',
  contraseña: '',
  id_rol: 0,
  estado: 'Activo'
};

const UsuariosPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<Usuario>(initialForm);
  const [data, setData] = useState<Usuario[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Rol[]>([
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Operario' }
  ]);

  // Convertir roles a array de strings para el Select
  const rolesOptions = roles.map(r => r.nombre);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Email', accessor: 'email' },
    { header: 'Rol', accessor: 'id_rol', cell: (row: Usuario) => roles.find(r => r.id === row.id_rol)?.nombre || row.id_rol },
    { header: 'Estado', accessor: 'estado' },
  ];

  // Cargar datos mock
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/Gestion.mock.json');
        const json = await response.json();
        setData(json.usuarios || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
        Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRol = roles.find(r => r.nombre === e.target.value);
    if (selectedRol) {
      setForm({ ...form, id_rol: selectedRol.id });
    }
  };

  const handleSave = async () => {
    const { nombre, email, contraseña, id_rol } = form;

    if (!nombre || !email || !contraseña || !id_rol) {
      Swal.fire('Campos obligatorios', 'Completa todos los campos requeridos', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditMode) {
        setData(data.map(item => item.id === form.id ? form : item));
      } else {
        const newId = Math.max(...data.map(u => u.id), 0) + 1;
        setData([...data, { ...form, id: newId }]);
      }
      
      Swal.fire('¡Guardado!', 'El usuario fue registrado correctamente', 'success');
      setForm(initialForm);
      setShowModal(false);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('¡Error!', 'Ocurrió un error al guardar el usuario', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (row: Usuario) => {
    setForm({
      id: row.id,
      nombre: row.nombre,
      email: row.email,
      contraseña: row.contraseña,
      id_rol: row.id_rol,
      estado: row.estado || 'Activo'
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (row: Usuario) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        setData(data.filter(item => item.id !== row.id));
        Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
      } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Home>
      <Header>
        <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
          <BackButton onClick={() => navigate('/gestion')}>
            <FaArrowLeft style={{ marginRight: '8px' }} /> Volver a Gestión
          </BackButton>
          <Button
            onClick={() => {
              setForm(initialForm);
              setIsEditMode(false);
              setShowModal(true);
            }}
            disabled={isLoading}
          >
            Agregar Usuario
          </Button>
        </div>
      </Header>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>
      ) : (
        <DataTable 
          columns={columns} 
          data={data} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      {showModal && (
        <Modal onClose={() => !isLoading && setShowModal(false)}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {isEditMode ? 'Editar Usuario' : 'Agregar Usuario'}
          </h2>

          <Input 
            label="Nombre *" 
            name="nombre" 
            value={form.nombre} 
            onChange={handleChange} 
            disabled={isLoading}
          />
          <Input 
            label="Email *" 
            name="email" 
            value={form.email} 
            onChange={handleChange} 
            disabled={isLoading}
          />
          <Input 
            label="Contraseña *" 
            name="contraseña" 
            value={form.contraseña} 
            onChange={handleChange} 
            type="password"
            disabled={isLoading}
          />
          <Select 
            label="Rol *" 
            name="id_rol" 
            value={roles.find(r => r.id === form.id_rol)?.nombre || ''} 
            onChange={handleSelect} 
            options={rolesOptions}
            disabled={isLoading}
          />

          <ModalFooter>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button onClick={() => !isLoading && setShowModal(false)} disabled={isLoading}>
              Cerrar
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default UsuariosPage;