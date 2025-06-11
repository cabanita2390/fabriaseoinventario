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
  presentacion: '',
  unidad: '',
  proveedor: '',
};

const ProductosBasePage = () => {
  const [form, setForm] = useState(initialForm);
  const [data, setData] = useState([
    {
      codigo: 'P001',
      nombre: 'FLOAT',
      presentacion: 'Garrafa 20L',
      unidad: 'KG',
      proveedor: 'Proveedor 1',
    },
    {
      codigo: 'P002',
      nombre: 'PLG',
      presentacion: 'Caja',
      unidad: 'KG',
      proveedor: 'Proveedor 2',
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const columns = [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Presentación', accessor: 'presentacion' },
    { header: 'Unidad', accessor: 'unidad' },
    { header: 'Proveedor', accessor: 'proveedor' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const { nombre, presentacion, unidad, proveedor } = form;

    if (!nombre || !presentacion || !unidad || !proveedor) {
      Swal.fire('Campos obligatorios', 'Completa todos los campos', 'warning');
      return;
    }

    try {
      if (isEditMode) {
        setData(data.map((item) => (item.codigo === form.codigo ? form : item)));
      } else {
        const newCodigo = `P${(data.length + 1).toString().padStart(3, '0')}`;
        setData([...data, { ...form, codigo: newCodigo }]);
      }

      setForm(initialForm);
      setShowModal(false);
      setIsEditMode(false);
      Swal.fire('¡Guardado!', 'El producto fue registrado correctamente', 'success');
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
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setData(data.filter((item) => item.codigo !== row.codigo));
        Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
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
          Agregar Producto
        </Button>
      </Header>

      <DataTable columns={columns} data={data} onEdit={handleEdit} onDelete={handleDelete} />

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {isEditMode ? 'Editar Producto' : 'Agregar Producto'}
          </h2>

          <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} />
          <Input label="Presentación" name="presentacion" value={form.presentacion} onChange={handleChange} />
          <Input label="Unidad" name="unidad" value={form.unidad} onChange={handleChange} />
          <Input label="Proveedor" name="proveedor" value={form.proveedor} onChange={handleChange} />

          <ModalFooter>
            <Button onClick={handleSave}>Guardar</Button>
            <Button onClick={() => setShowModal(false)}>Cerrar</Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default ProductosBasePage;
