import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from '../../components/Home';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header, BackButton } from '../../styles/Gestion/Gestion.css';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';

type Proveedor = {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  estado?: string;
};

const initialForm: Proveedor = {
  id: 0,
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  estado: 'Activo'
};

const ProveedoresPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<Proveedor>(initialForm);
  const [data, setData] = useState<Proveedor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Teléfono', accessor: 'telefono' },
    { header: 'Email', accessor: 'email' },
    { header: 'Dirección', accessor: 'direccion' },
    { header: 'Estado', accessor: 'estado' },
  ];

  // Cargar datos iniciales (usando mock por ahora)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Usando datos mock por ahora (reemplazar con fetch al backend cuando esté listo)
        const response = await fetch('/Gestion.mock.json');
        const json = await response.json();
        setData(json.proveedores || []);
        
        // Cuando el backend esté listo, usar esto:
        // const response = await fetch('http://localhost:3000/proveedor');
        // const proveedores = await response.json();
        // setData(proveedores);
      } catch (error) {
        console.error("Error cargando proveedores:", error);
        Swal.fire('Error', 'No se pudieron cargar los proveedores', 'error');
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
    const { nombre, telefono, email, direccion } = form;

    if (!nombre || !telefono || !email || !direccion) {
      Swal.fire('Campos obligatorios', 'Completa todos los campos requeridos', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      // Usando mock por ahora (reemplazar con fetch al backend cuando esté listo)
      if (isEditMode) {
        setData(data.map(item => item.id === form.id ? form : item));
      } else {
        const newProveedor = {
          ...form,
          id: Math.max(...data.map(p => p.id), 0) + 1 // Generar nuevo ID temporal
        };
        setData([...data, newProveedor]);
      }
      
      // Cuando el backend esté listo, usar esto:
      /*
      let response;
      if (isEditMode) {
        response = await fetch(`http://localhost:3000/proveedor/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      } else {
        response = await fetch('http://localhost:3000/proveedor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      }
      
      if (!response.ok) throw new Error('Error al guardar');
      
      // Recargar datos del backend
      const updatedResponse = await fetch('http://localhost:3000/proveedor');
      const updatedData = await updatedResponse.json();
      setData(updatedData);
      */
      
      Swal.fire('¡Guardado!', 'El proveedor fue registrado correctamente', 'success');
      setForm(initialForm);
      setShowModal(false);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('¡Error!', 'Ocurrió un error al guardar el proveedor', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (row: Proveedor) => {
    setForm(row);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (row: Proveedor) => {
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
        // Usando mock por ahora (reemplazar con fetch al backend cuando esté listo)
        setData(data.filter(item => item.id !== row.id));
        
        // Cuando el backend esté listo, usar esto:
        /*
        const response = await fetch(`http://localhost:3000/proveedor/${row.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar');
        
        // Recargar datos del backend
        const updatedResponse = await fetch('http://localhost:3000/proveedor');
        const updatedData = await updatedResponse.json();
        setData(updatedData);
        */
        
        Swal.fire('Eliminado', 'El proveedor ha sido eliminado.', 'success');
      } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo eliminar el proveedor', 'error');
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
            Agregar Proveedor
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
            <Button onClick={() => !isLoading && setShowModal(false)} disabled={isLoading}>
              Cerrar
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default ProveedoresPage;