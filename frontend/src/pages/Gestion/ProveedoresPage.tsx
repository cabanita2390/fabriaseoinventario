// src/pages/ProveedoresPage.tsx

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
  telefono: '',
  email: '',
  direccion: '',
};

const ProveedoresPage = () => {
  const [form, setForm] = useState(initialForm);
  const [data, setData] = useState([
    {
      codigo: '0001',
      nombre: 'Grupo Nutresa',
      telefono: '3014567809',
      email: 'nutresa@gmail.com',
      direccion: 'Calle 34 #25-45',
    },
    {
      codigo: '0002',
      nombre: 'Bavaria',
      telefono: '3101234567',
      email: 'bavaria@gmail.com',
      direccion: 'Cra 10 #45-76',
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const columns = [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Teléfono', accessor: 'telefono' },
    { header: 'Email', accessor: 'email' },
    { header: 'Dirección', accessor: 'direccion' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const { nombre, telefono, email, direccion } = form;

    if (!nombre || !telefono || !email || !direccion) {
      Swal.fire('Campos obligatorios', 'Completa todos los campos', 'warning');
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
      Swal.fire('¡Guardado!', 'El proveedor fue registrado correctamente', 'success');
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
      title: '¿Eliminar proveedor?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setData(data.filter((item) => item.codigo !== row.codigo));
        Swal.fire('Eliminado', 'El proveedor ha sido eliminado.', 'success');
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
          Agregar Proveedor
        </Button>
      </Header>

      <DataTable columns={columns} data={data} onEdit={handleEdit} onDelete={handleDelete} />

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {isEditMode ? 'Editar Proveedor' : 'Agregar Proveedor'}
          </h2>

          <Input label="Código" name="codigo" value={form.codigo} onChange={handleChange} disabled />
          <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} />
          <Input label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
          <Input label="Email" name="email" value={form.email} onChange={handleChange} />
          <Input label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} />

          <ModalFooter>
            <Button onClick={handleSave}>Guardar</Button>
            <Button onClick={() => setShowModal(false)}>Cerrar</Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default ProveedoresPage;
