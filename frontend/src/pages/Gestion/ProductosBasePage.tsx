import React, { useState, useEffect } from 'react';
import Home from '../../components/Home';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header } from '../../styles/Gestion/Gestion.css';
import Swal from 'sweetalert2';

type Producto = {
  id: string;
  nombre: string;
  presentacion: string;
  unidad: string;
  proveedor: string;
  tipoProducto?: string;
  estado?: string;
};

const initialForm: Producto = {
  id: '',
  nombre: '',
  presentacion: '',
  unidad: '',
  proveedor: '',
  tipoProducto: 'Insumo',
  estado: 'Activo'
};

const ProductosBasePage = () => {
  const [form, setForm] = useState<Producto>(initialForm);
  const [data, setData] = useState<Producto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Presentación', accessor: 'presentacion' },
    { header: 'Unidad', accessor: 'unidad' },
    { header: 'Proveedor', accessor: 'proveedor' },
    { header: 'Tipo', accessor: 'tipoProducto' },
    { header: 'Estado', accessor: 'estado' }
  ];

  // Cargar datos desde JSON
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/Gestion.mock.json');
        const json = await response.json();
        setData(json.productos || []);
      } catch (error) {
        console.error("Error cargando productos:", error);
        Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
      }
    };
    fetchData();
  }, []);

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
      const newData = isEditMode
        ? data.map(item => item.id === form.id ? form : item)
        : [...data, { 
            ...form, 
            id: `P${(data.length + 1).toString().padStart(3, '0')}`,
            estado: 'Activo'
          }];
      
      setData(newData);
      Swal.fire('¡Guardado!', 'Producto registrado correctamente', 'success');
      setShowModal(false);
      setForm(initialForm);
    } catch (error) {
      Swal.fire('¡Error!', 'Ocurrió un error al guardar', 'error');
    }
  };

  const handleEdit = (row: Producto) => {
    setForm(row);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (row: Producto) => {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setData(data.filter(item => item.id !== row.id));
        Swal.fire('Eliminado', 'El producto ha sido eliminado', 'success');
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
          Agregar Producto
        </Button>
      </Header>

      <DataTable<Producto>
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {isEditMode ? 'Editar Producto' : 'Agregar Producto'}
          </h2>

          <Input 
            label="Nombre *" 
            name="nombre" 
            value={form.nombre} 
            onChange={handleChange} 
            required 
          />
          <Input 
            label="Presentación *" 
            name="presentacion" 
            value={form.presentacion} 
            onChange={handleChange} 
            required 
          />
          <Input 
            label="Unidad *" 
            name="unidad" 
            value={form.unidad} 
            onChange={handleChange} 
            required 
          />
          <Input 
            label="Proveedor *" 
            name="proveedor" 
            value={form.proveedor} 
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

export default ProductosBasePage;