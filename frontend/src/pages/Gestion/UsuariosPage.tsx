// src/pages/UsuariosPage.tsx

import React, { useState } from 'react';
import Home from '../../components/Home';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header } from '../../styles/Insumos.css';
import Swal from 'sweetalert2';

const initialForm = {
  codigo: '',
  nombre: '',
  email: '',
  contraseña: '',
  rol: '',
};

const UsuariosPage = () => {
  const [form, setForm] = useState(initialForm);
  const [data, setData] = useState([
    {
      codigo: '0001',
      nombre: 'María Perez',
      email: 'discordoba@gmail.com',
      contraseña: '*****',
      rol: 'Administrador',
    },
    {
      codigo: '0002',
      nombre: 'Pepito Perez',
      email: 'envasar@gmail.com',
      contraseña: '*****',
      rol: 'Administrador',
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const columns = [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Email', accessor: 'email' },
    { header: 'Contraseña', accessor: 'contraseña' },
    { header: 'Rol', accessor: 'rol' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, rol: e.target.value });
  };

  const handleSave = () => {
    const { nombre, email, contraseña, rol } = form;

    if (!nombre || !email || !contraseña || !rol) {
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
      Swal.fire('¡Guardado!', 'El usuario fue registrado correctamente', 'success');
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
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setData(data.filter((item) => item.codigo !== row.codigo));
        Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
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
          Agregar Usuario
        </Button>
      </Header>

      <DataTable columns={columns} data={data} onEdit={handleEdit} onDelete={handleDelete} />

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {isEditMode ? 'Editar Usuario' : 'Agregar Usuario'}
          </h2>

          <Input label="Código" name="codigo" value={form.codigo} onChange={handleChange} disabled />
          <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} />
          <Input label="Email" name="email" value={form.email} onChange={handleChange} />
          <Input label="Contraseña" name="contraseña" value={form.contraseña} onChange={handleChange} type="password" />
          <Select label="Rol" name="rol" value={form.rol} onChange={handleSelect} options={['Administrador', 'Operario']} />

          <ModalFooter>
            <Button onClick={handleSave}>Guardar</Button>
            <Button onClick={() => setShowModal(false)}>Cerrar</Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default UsuariosPage;
