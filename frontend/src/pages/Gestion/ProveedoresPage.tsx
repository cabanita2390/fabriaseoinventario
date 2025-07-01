import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from '../../components/Home';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import SearchBar from '../../components/ui/Searchbar';
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header, BackButton } from '../../styles/Gestion/Gestion.css';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useAuthFetch, ApiError } from '../../components/ui/useAuthFetch';

type Proveedor = {
  id?: number;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
};

const initialForm: Proveedor = {
  nombre: '',
  telefono: '',
  email: '',
  direccion: ''
};

const ProveedoresPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<Proveedor>(initialForm);
  const [data, setData] = useState<Proveedor[]>([]);
  const [fullData, setFullData] = useState<Proveedor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filtro, setFiltro] = useState('');
  const { authFetch } = useAuthFetch(); 
  
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Teléfono', accessor: 'telefono' },
    { header: 'Email', accessor: 'email' },
    { header: 'Dirección', accessor: 'direccion' }
  ];

  const datosFiltrados = fullData.filter(proveedor =>
    Object.values(proveedor).some(
      value => value && value.toString().toLowerCase().includes(filtro.toLowerCase())
    )
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await authFetch('http://localhost:3000/proveedor');
        if (!response.ok) throw new Error('Error al cargar proveedores');
        const proveedores = await response.json();
        setData(proveedores);
        setFullData(proveedores);
      } catch (error) {
        console.error("Error:", error);
        let errorMessage = 'No se pudieron cargar los proveedores';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.nombre || !form.telefono || !form.email || !form.direccion) {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditMode && !form.id) {
        throw new Error('ID del proveedor no especificado');
      }

      const method = isEditMode ? 'PATCH' : 'POST';
      const url = isEditMode 
        ? `http://localhost:3000/proveedor/${form.id}`
        : 'http://localhost:3000/proveedor';

      const requestBody = {
        nombre: form.nombre,
        telefono: form.telefono,
        email: form.email,
        direccion: form.direccion
      };

      const response = await authFetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error en la solicitud');
      }

      const result = await response.json();
      
      if (isEditMode) {
        setData(prev => prev.map(p => p.id === form.id ? result : p));
        setFullData(prev => prev.map(p => p.id === form.id ? result : p));
      } else {
        setData(prev => [...prev, result]);
        setFullData(prev => [...prev, result]);
      }

      Swal.fire('Éxito', `Proveedor ${isEditMode ? 'actualizado' : 'creado'} correctamente`, 'success');
      setShowModal(false);
      setForm(initialForm);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error completo:', error);
      let errorMessage = 'Error al guardar el proveedor';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (row: Proveedor) => {
    if (!row.id) {
      console.error('El proveedor a editar no tiene ID:', row);
      Swal.fire('Error', 'El proveedor seleccionado no tiene ID válido', 'error');
      return;
    }

    setForm({
      id: row.id,
      nombre: row.nombre,
      telefono: row.telefono,
      email: row.email,
      direccion: row.direccion
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (row: Proveedor) => {
    if (!row.id) return;
    
    const result = await Swal.fire({
      title: '¿Eliminar proveedor?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const response = await authFetch(`http://localhost:3000/proveedor/${row.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar');
        
        setData(prev => prev.filter(p => p.id !== row.id));
        setFullData(prev => prev.filter(p => p.id !== row.id));
        
        Swal.fire('Eliminado', 'El proveedor ha sido eliminado.', 'success');
      } catch (error) {
        console.error('Error:', error);
        let errorMessage = 'No se pudo eliminar el proveedor';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Home>
      <Header>
        <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
          <SearchBar 
            onSearch={setFiltro} 
            placeholder="Buscar proveedores..." 
          />
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
            Agregar Proveedor
          </Button>
        </div>
      </Header>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>
      ) : (
        <DataTable 
          columns={columns} 
          data={datosFiltrados} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      {showModal && (
        <Modal onClose={() => !isLoading && setShowModal(false)}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {isEditMode ? 'Editar Proveedor' : 'Agregar Proveedor'}
          </h2>

          <Input 
            label="Nombre *" 
            name="nombre" 
            value={form.nombre} 
            onChange={handleChange} 
            disabled={isLoading}
          />
          <Input 
            label="Teléfono *" 
            name="telefono" 
            value={form.telefono} 
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
            label="Dirección *" 
            name="direccion" 
            value={form.direccion} 
            onChange={handleChange} 
            disabled={isLoading}
          />

          <ModalFooter>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button 
              onClick={() => !isLoading && setShowModal(false)} 
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default ProveedoresPage;