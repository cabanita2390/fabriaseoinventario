import React, { useState } from 'react';
import Home from '../components/Home';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import DataTable from '../components/ui/DataTable';
import { ModalFooter } from '../styles/ui/Modal.css';
import { Header } from '../styles/Productos.css';
import Swal from 'sweetalert2';

const initialForm = {
  codigo: '',
  nombre: '',
  tipo: '',
  subtipo: '',
  estado: '',
  presentacion: '',
  unidad: '',
  proveedor: '',
};

const ProductosPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [data, setData] = useState<any[]>([
    {
      codigo: '01',
      nombre: 'Producto A',
      tipo: 'Entrada',
      subtipo: '5',
      estado: 'Activo',
      presentacion: 'Administrador',
      unidad: '5',
      proveedor: 'Proveedor A',
    },
    {
      codigo: '02',
      nombre: 'Producto B',
      tipo: 'Salida',
      subtipo: '15',
      estado: 'Inactivo',
      presentacion: 'Administrador',
      unidad: '10',
      proveedor: 'Proveedor B',
    },
  ]);

  const [isEditMode, setIsEditMode] = useState(false);

  const columns = [
    { header: 'Código', accessor: 'codigo' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Tipo', accessor: 'tipo' },
    { header: 'Sub-Tipo', accessor: 'subtipo' },
    { header: 'Estado', accessor: 'estado' },
    { header: 'Presentación', accessor: 'presentacion' },
    { header: 'Unidad de Medida', accessor: 'unidad' },
    { header: 'Proveedor', accessor: 'proveedor' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (row: any) => {
    setForm(row);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (row: any) => {
    Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setData(data.filter((item) => item.codigo !== row.codigo));
        Swal.fire('¡Eliminado!', 'El producto fue eliminado correctamente.', 'success');
      }
    });
  };

  const handleSave = () => {
    try {
      if (isEditMode) {
        setData(data.map((item) => (item.codigo === form.codigo ? form : item)));
      } else {
        const newItem = { ...form, codigo: `${data.length + 1}`.padStart(2, '0') };
        setData([...data, newItem]);
      }
      setShowModal(false);
      setForm(initialForm);
      setIsEditMode(false);
      Swal.fire('¡Operación exitosa!', 'El registro se ha guardado correctamente.', 'success');
    } catch (error) {
      Swal.fire('¡Error!', 'No se pudo guardar el registro. Intenta de nuevo.', 'error');
    }
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
          Agregar producto
        </Button>
      </Header>

      <DataTable columns={columns} data={data} onEdit={handleEdit} onDelete={handleDelete} />

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {isEditMode ? 'Editar Producto' : 'Agregar Producto'}
          </h2>

          <Input label="Código" name="codigo" value={form.codigo} onChange={handleChange} disabled />
          <Input label="Nombre del producto" name="nombre" value={form.nombre} onChange={handleChange} />
          <Select label="Tipo" name="tipo" value={form.tipo} onChange={handleChange} options={['Materia Prima', 'Insumo']} />
          <Select label="Sub-Tipo" name="subtipo" value={form.subtipo} onChange={handleChange} options={['Envase', 'Etiqueta']} />
          <Select label="Estado" name="estado" value={form.estado} onChange={handleChange} options={['Activo', 'Inactivo']} />
          <Input label="Presentación" name="presentacion" value={form.presentacion} onChange={handleChange} />
          <Input label="Unidad de Medida" name="unidad" value={form.unidad} onChange={handleChange} />
          <Input label="Proveedor" name="proveedor" value={form.proveedor} onChange={handleChange} />

          <ModalFooter>
            <Button onClick={handleSave}>Guardar</Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default ProductosPage;
