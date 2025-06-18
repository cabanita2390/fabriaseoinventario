import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import SearchBar from '../../components/ui/Searchbar';
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header, BackButton } from '../../styles/Gestion/Gestion.css';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import Home from '../../components/Home';
import { useNavigate } from 'react-router-dom';

type Bodega = {
  id: number;
  nombre: string;
  ubicacion: string | null;
};

const initialForm: Bodega = {
  id: 0,
  nombre: '',
  ubicacion: null
};

const BodegasPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<Bodega>(initialForm);
  const [data, setData] = useState<Bodega[]>([]);
  const [fullData, setFullData] = useState<Bodega[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filtro, setFiltro] = useState('');

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Ubicación', accessor: 'ubicacion' }
  ];

  const datosFiltrados = fullData.filter(bodega =>
    bodega.nombre.toLowerCase().includes(filtro) ||
    (bodega.ubicacion?.toLowerCase().includes(filtro) ?? false)
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/bodega');
        const bodegas = await response.json();
        setData(bodegas);
        setFullData(bodegas);
      } catch (error) {
        console.error("Error al cargar las bodegas:", error);
        Swal.fire('Error', 'No se pudieron cargar las bodegas', 'error');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value || null
    });
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      Swal.fire('Error', 'El nombre es obligatorio', 'warning');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/bodega', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          ubicacion: form.ubicacion || null
        })
      });

      if (!response.ok) throw new Error('Error en el servidor');
      const nuevaBodega = await response.json();

      setData(prev => [...prev, nuevaBodega]);
      setFullData(prev => [...prev, nuevaBodega]);

      Swal.fire('Éxito', 'Bodega registrada correctamente', 'success');
      setShowModal(false);
      setForm(initialForm);
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire('Error', 'No se pudo guardar la bodega', 'error');
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
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await fetch(`http://localhost:3000/bodega/${row.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar');

      setData(prev => prev.filter(item => item.id !== row.id));
      setFullData(prev => prev.filter(item => item.id !== row.id));

      Swal.fire('Eliminada', 'La bodega ha sido eliminada', 'success');
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire('Error', 'No se pudo eliminar la bodega', 'error');
    }
  };

  return (
    <Home>
      <Header>
        <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
           <SearchBar onSearch={setFiltro} placeholder="Buscar por nombre o ubicación..." className="search-bar-container"/>
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
            {isEditMode ? 'Editar Bodega' : 'Nueva Bodega'}
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
            <Button onClick={handleSave}>Guardar</Button>
            <Button onClick={() => setShowModal(false)}>Cancelar</Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default BodegasPage;
