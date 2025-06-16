import React, { useState, useEffect } from 'react';
import Home from '../../components/Home';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header } from '../../styles/Gestion/Gestion.css';
import Swal from 'sweetalert2';

type UnidadMedida = {
  id: string;
  nombre: string;
};

const initialForm: UnidadMedida = {
  id: '',
  nombre: '',
};

const UnidadesPage = () => {
  const [form, setForm] = useState<UnidadMedida>(initialForm);
  const [data, setData] = useState<UnidadMedida[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
  ];

  // Cargar datos desde JSON
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/Gestion.mock.json');
        const json = await response.json();
        setData(json.unidadmedida || []);
      } catch (error) {
        console.error("Error cargando unidades:", error);
        Swal.fire('Error', 'No se pudieron cargar las unidades', 'error');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!form.nombre.trim()) {
      Swal.fire('Error', 'Nombre es obligatorio', 'warning');
      return;
    }

    try {
      const newData = isEditMode
        ? data.map(item => item.id === form.id ? form : item)
        : [...data, { ...form, id: `${Date.now()}`.slice(-4) }];
      
      setData(newData);
      Swal.fire('Éxito', 'Unidad guardada correctamente', 'success');
      setShowModal(false);
      setForm(initialForm);
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar', 'error');
    }
  };

  const handleEdit = (row: UnidadMedida) => {
    setForm(row);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (row: UnidadMedida) => {
    Swal.fire({
      title: '¿Eliminar unidad?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setData(data.filter(item => item.id !== row.id));
        Swal.fire('Eliminada', 'La unidad ha sido eliminada', 'success');
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
          Agregar Unidad
        </Button>
      </Header>

      <DataTable<UnidadMedida>
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {isEditMode ? 'Editar Unidad' : 'Agregar Unidad'}
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
            <Button onClick={() => setShowModal(false)}>Cancelar</Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default UnidadesPage;