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

type Presentacion = {
  id: number;
  nombre: string;
};

const initialForm: Presentacion = {
  id: 0,
  nombre: '',
};

const PresentacionPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<Presentacion>(initialForm);
  const [data, setData] = useState<Presentacion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
  ];

  // Cargar datos desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/presentacion');
        const presentaciones = await response.json();
        setData(presentaciones);
      } catch (error) {
        console.error("Error cargando presentaciones:", error);
        Swal.fire('Error', 'No se pudieron cargar las presentaciones', 'error');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!form.nombre.trim()) {
      Swal.fire('Campo obligatorio', 'El nombre es requerido', 'warning');
      return;
    }

    try {
      if (isEditMode) {
        // Actualizar presentación existente
        setData(data.map((item) => (item.id === form.id ? form : item)));
      } else {
        // Crear nueva presentación
        const newPresentacion = {
          ...form,
          id: Date.now() // ID temporal hasta que se guarde en el backend
        };
        setData([...data, newPresentacion]);
      }
      
      setForm(initialForm);
      setShowModal(false);
      setIsEditMode(false);
      Swal.fire('¡Guardado!', 'La presentación fue registrada correctamente', 'success');
    } catch {
      Swal.fire('¡Error!', 'Ocurrió un error al guardar.', 'error');
    }
  };

  const handleEdit = (row: Presentacion) => {
    setForm(row);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (row: Presentacion) => {
    Swal.fire({
      title: '¿Eliminar presentación?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setData(data.filter((item) => item.id !== row.id));
        Swal.fire('Eliminado', 'La presentación ha sido eliminada.', 'success');
      }
    });
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
          >
            Agregar Presentación
          </Button>
        </div>
      </Header>

      <DataTable 
        columns={columns} 
        data={data} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {isEditMode ? 'Editar Presentación' : 'Agregar Presentación'}
          </h2>

          <Input 
            label="Nombre *" 
            name="nombre" 
            value={form.nombre} 
            onChange={handleChange} 
            required
          />

          <ModalFooter>
            <Button onClick={handleSave}>Guardar</Button>
            <Button onClick={() => setShowModal(false)}>Cerrar</Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default PresentacionPage;