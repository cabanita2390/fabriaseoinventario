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
import { useAuthFetch , ApiError } from '../../components/ui/useAuthFetch';
type Bodega = {
  id: number;
  nombre: string;
  ubicacion: string | null;
};

const initialForm: Bodega = {
  id: 0,
  nombre: '',
  ubicacion: null,
};



const BodegasPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<Bodega>(initialForm);
  const [data, setData] = useState<Bodega[]>([]);
  const [fullData, setFullData] = useState<Bodega[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authFetch } = useAuthFetch();

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Ubicación', accessor: 'ubicacion' },
  ];

  const datosFiltrados = fullData.filter((bodega) =>
    bodega.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (bodega.ubicacion?.toLowerCase().includes(filtro.toLowerCase()) ?? false)
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await authFetch('http://localhost:3000/bodega');
        const bodegas = await response.json();
        setData(bodegas);
        setFullData(bodegas);
      } catch (error) {
        const err = error as ApiError;
        if (err.message !== 'Sesión expirada') {
          Swal.fire('Error', 'Error al cargar bodegas', 'error');
        }
      }
    };

    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ 
      ...form, 
      [e.target.name]: e.target.value || null 
    });
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!form.nombre.trim()) {
      Swal.fire('Error', 'El nombre es obligatorio', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditMode 
        ? `http://localhost:3000/bodega/${form.id}`
        : 'http://localhost:3000/bodega';

      const response = await authFetch(url, {
        method: isEditMode ? 'PATCH' : 'POST',
        body: JSON.stringify({
          nombre: form.nombre,
          ubicacion: form.ubicacion
        })
      });

      const updatedBodega = await response.json();

      setFullData(prev => 
        isEditMode
          ? prev.map(b => b.id === updatedBodega.id ? updatedBodega : b)
          : [...prev, updatedBodega]
      );

      Swal.fire(
        'Éxito',
        `Bodega ${isEditMode ? 'actualizada' : 'creada'} correctamente`,
        'success'
      );

      setShowModal(false);
      setForm(initialForm);
    } catch (error) {
      const err = error as ApiError;
      if (err.message !== 'Sesión expirada') {
        Swal.fire('Error', 'No se pudo guardar la bodega', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (row: Bodega) => {
    setForm(row);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (row: Bodega) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar bodega?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    try {
      await authFetch(`http://localhost:3000/bodega/${row.id}`, {
        method: 'DELETE'
      });

      setFullData(prev => prev.filter(b => b.id !== row.id));
      Swal.fire('Éxito', 'Bodega eliminada', 'success');
    } catch (error) {
      const err = error as ApiError;
      if (err.message !== 'Sesión expirada') {
        Swal.fire('Error', 'No se pudo eliminar', 'error');
      }
    }
  };

  return (
    <Home>
      <Header>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginLeft: 'auto' }}>
          <SearchBar
            onSearch={setFiltro}
            placeholder="Buscar por nombre o ubicación..."
            className="search-bar-container"
          />
          
          <BackButton onClick={() => navigate('/gestion')}>
            <FaArrowLeft style={{ marginRight: '8px' }} /> Volver a Gestión
          </BackButton>
          
          <Button onClick={() => {
            setForm(initialForm);
            setIsEditMode(false);
            setShowModal(true);
          }}>
            Agregar Bodega
          </Button>
        </div>
      </Header>

      <DataTable<Bodega>
        columns={columns}
        data={datosFiltrados}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 style={{ textAlign: 'center' }}>
            {isEditMode ? `Editar Bodega #${form.id}` : 'Nueva Bodega'}
          </h2>

          <Input
            label="Nombre *"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Ubicación"
            name="ubicacion"
            value={form.ubicacion || ''}
            onChange={handleChange}
          />

          <ModalFooter>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
            
            <Button 
              onClick={() => setShowModal(false)} 
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default BodegasPage;