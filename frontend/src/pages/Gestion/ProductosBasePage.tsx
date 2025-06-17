import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from '../../components/Home';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header, BackButton } from '../../styles/Gestion/Gestion.css';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';

type Presentacion = {
  id: number;
  nombre: string;
};

type UnidadMedida = {
  id: number;
  nombre: string;
};

type Producto = {
  id: number;
  nombre: string;
  tipoProducto: string;
  subtipoInsumo: string | null;
  estado: string;
  presentacion: Presentacion;
  unidadMedida: UnidadMedida;
  proveedor: string | null;
};

type ProductoForm = {
  id?: number;
  nombre: string;
  tipoProducto: string;
  subtipoInsumo: string | null;
  estado: string;
  presentacion: string;
  unidad: string;
  proveedor: string | null;
};

const initialForm: ProductoForm = {
  nombre: '',
  tipoProducto: 'MATERIA_PRIMA',
  subtipoInsumo: null,
  estado: 'ACTIVO',
  presentacion: '',
  unidad: '',
  proveedor: null
};

const ProductosBasePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductoForm>(initialForm);
  const [data, setData] = useState<Producto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Preparamos los datos para la tabla
  const tableData = data.map(item => ({
    ...item,
    presentacion: item.presentacion.nombre,
    unidadMedida: item.unidadMedida.nombre
  }));

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Presentación', accessor: 'presentacion' },
    { header: 'Unidad', accessor: 'unidadMedida' },
    { header: 'Tipo', accessor: 'tipoProducto' },
    { header: 'Estado', accessor: 'estado' }
  ];

  // Cargar datos desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/producto');
        const productos = await response.json();
        setData(productos);
      } catch (error) {
        console.error("Error cargando productos:", error);
        Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ 
      ...form, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSave = () => {
    const { nombre, presentacion, unidad } = form;

    if (!nombre || !presentacion || !unidad) {
      Swal.fire('Campos obligatorios', 'Completa todos los campos', 'warning');
      return;
    }

    try {
      const newProduct: Producto = {
        id: isEditMode && form.id ? form.id : Date.now(),
        nombre: form.nombre,
        tipoProducto: form.tipoProducto,
        subtipoInsumo: form.subtipoInsumo,
        estado: form.estado,
        presentacion: {
          id: 1,
          nombre: form.presentacion
        },
        unidadMedida: {
          id: 1,
          nombre: form.unidad
        },
        proveedor: form.proveedor
      };

      const newData = isEditMode && form.id
        ? data.map(item => item.id === form.id ? newProduct : item)
        : [...data, newProduct];
      
      setData(newData);
      Swal.fire('¡Guardado!', 'Producto registrado correctamente', 'success');
      setShowModal(false);
      setForm(initialForm);
    } catch (error) {
      Swal.fire('¡Error!', 'Ocurrió un error al guardar', 'error');
    }
  };

  const handleEdit = (row: any) => {
    const originalProduct = data.find(p => p.id === row.id);
    if (!originalProduct) return;

    setForm({
      id: originalProduct.id,
      nombre: originalProduct.nombre,
      tipoProducto: originalProduct.tipoProducto,
      subtipoInsumo: originalProduct.subtipoInsumo,
      estado: originalProduct.estado,
      presentacion: originalProduct.presentacion.nombre,
      unidad: originalProduct.unidadMedida.nombre,
      proveedor: originalProduct.proveedor
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (row: any) => {
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
        <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
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
            Agregar Producto
          </Button>
        </div>
      </Header>

      <DataTable
        columns={columns}
        data={tableData}
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
            label="Tipo de Producto *" 
            name="tipoProducto" 
            value={form.tipoProducto} 
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
            label="Unidad de Medida *" 
            name="unidad" 
            value={form.unidad} 
            onChange={handleChange} 
            required 
          />
          
          <Input 
            label="Proveedor" 
            name="proveedor" 
            value={form.proveedor || ''} 
            onChange={handleChange} 
          />
          
          <Input 
            label="Estado *" 
            name="estado" 
            value={form.estado} 
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