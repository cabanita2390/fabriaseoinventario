import React, { useState } from 'react';
import Home from '../../components/Home';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header } from '../../styles/Insumos.css';
import Swal from 'sweetalert2';

const initialForm = {
  codigo: '',
  nombre: '',
};

const BodegasPage = () => {
  const [form, setForm] = useState(initialForm);
  const [data, setData] = useState([
    { codigo: '0012', nombre: 'Bodega 1' },
    { codigo: '0024', nombre: 'Bodega 2' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const columns = [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre', accessor: 'nombre' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!form.nombre.trim()) {
      Swal.fire('Campo obligatorio', 'El nombre de la bodega es requerido', 'warning');
      return;
    }

    try {
      if (isEditMode) {
        setData(data.map((item) => (item.codigo === form.codigo ? form : item)));
      } else {
        const newCodigo = `${data.length + 1}`.padStart(4, '0');
        setData([...data, { ...form, codigo: newCodigo }]);
      }
      setForm(initialForm);
      setShowModal(false);
      setIsEditMode(false);
      Swal.fire('¡Guardado!', 'La bodega fue registrada correctamente', 'success');
    } catch (error) {
      Swal.fire('¡Error!', 'Ocurrió un error al guardar.', 'error');
    }
  };

  const handleEdit = (row: any) => {
    setForm(row);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (row: any) => {
    Swal.fire({
      title: '¿Eliminar bodega?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setData(data.filter((item) => item.codigo !== row.codigo));
        Swal.fire('Eliminado', 'La bodega ha sido eliminada.', 'success');
      }
    });
  };

  return (
    <Home>
      <Header>
        <div />
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

      <DataTable columns={columns} data={data} onEdit={handleEdit} onDelete={handleDelete} />

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {isEditMode ? 'Editar Bodega' : 'Agregar Bodega'}
          </h2>

          <Input label="Código" name="codigo" value={form.codigo} onChange={handleChange} disabled />
          <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} />

          <ModalFooter>
            <Button onClick={handleSave}>Guardar</Button>
            <Button onClick={() => setShowModal(false)}>Cerrar</Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default BodegasPage;
