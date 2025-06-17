import React, { useState, useEffect } from 'react';
import Home from '../../components/Home';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header } from '../../styles/Gestion/Gestion.css';
import Swal from 'sweetalert2';

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
  const [form, setForm] = useState<Bodega>(initialForm);
  const [data, setData] = useState<Bodega[]>([]);
   const [fullData, setFullData] = useState<Bodega[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const columns = [
    { header: 'ID', accessor: 'id' },          
    { header: 'Nombre', accessor: 'nombre' },  
    { header: 'Ubicación', accessor: 'ubicacion' } 
  ];


  // Carga los datos desde mock.json
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
      [e.target.name]: e.target.value || null, // Convierte "" (vacío) → null
    });
  };

  const handleSave = () => {
    if (!form.nombre.trim()) {
      Swal.fire('Error', 'El nombre es obligatorio', 'warning');
      return;
    }

    try {
      const newData = isEditMode
        ? data.map(item => (item.id === form.id ? form : item))
        : [...data, { ...form, id: Date.now() }]; 
      
      setData(newData);
      setFullData(newData);
      Swal.fire('Éxito', 'Bodega guardada correctamente', 'success');
      setShowModal(false);
      setForm(initialForm);
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar', 'error');
    }
  };

  const handleEdit = (row: Bodega) => {
    setForm(row);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (row: Bodega) => {
    Swal.fire({
      title: '¿Eliminar bodega?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setData(data.filter(item => item.id !== row.id));
        Swal.fire('Eliminada', 'La bodega ha sido eliminada', 'success');
      }
    });
  };

  return (
    <Home>
      <Header>
        <Button 
          onClick={() => {
            setForm(initialForm);
            setIsEditMode(false);
            setShowModal(true);
          }}
        >
          Agregar Bodega
        </Button>
      </Header>

     <DataTable<Bodega>
        columns={columns}
        data={data}          
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