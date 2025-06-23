import React, { useState, useEffect, useMemo } from 'react';
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
import SearchBar from '../../components/ui/Searchbar';

type Opcion = { id: number; nombre: string };

type Producto = {
  id: number;
  nombre: string;
  tipoProducto: string;
  subtipoInsumo: string | null;
  estado: string;
  presentacion: Opcion;
  unidadMedida: Opcion;
  proveedor: string | null;
};

type ProductoRow = Omit<Producto, 'presentacion' | 'unidadMedida'> & {
  presentacion: string;
  unidadMedida: string;
};

type ProductoForm = {
  id?: number;
  nombre: string;
  tipoProducto: string;
  subtipoInsumo: string | null;
  estado: string;
  presentacion_id: number | '';
  unidadmedida_id: number | '';
  proveedor_id: number | '' | null;
};

const API_BASE = 'http://localhost:3000';

const initialForm: ProductoForm = {
  nombre: '',
  tipoProducto: 'MATERIA_PRIMA',
  subtipoInsumo: null,
  estado: 'ACTIVO',
  presentacion_id: '',
  unidadmedida_id: '',
  proveedor_id: ''
};

const columns = [
  { header: 'ID', accessor: 'id' },
  { header: 'Nombre', accessor: 'nombre' },
  { header: 'Presentación', accessor: 'presentacion' },
  { header: 'Unidad', accessor: 'unidadMedida' },
  { header: 'Tipo', accessor: 'tipoProducto' }
];

const ProductosBasePage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductoForm>(initialForm);
  const [data, setData] = useState<Producto[]>([]);
  const [opciones, setOpciones] = useState<{
    presentaciones: Opcion[];
    unidades: Opcion[];
    proveedores: Opcion[];
  }>({ presentaciones: [], unidades: [], proveedores: [] });
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filtro, setFiltro] = useState('');

  // Datos filtrados memoizados para mejor performance
  const filteredData: ProductoRow[] = useMemo(() => {
    if (!filtro) {
      return data.map((item: Producto): ProductoRow => ({
        ...item,
        presentacion: item.presentacion.nombre,
        unidadMedida: item.unidadMedida.nombre
      }));
    }

    const texto = filtro.toLowerCase();
    return data
      .filter((item: Producto) => {
        return (
          item.nombre.toLowerCase().includes(texto) ||
          item.tipoProducto.toLowerCase().includes(texto) ||
          item.presentacion.nombre.toLowerCase().includes(texto) ||
          item.unidadMedida.nombre.toLowerCase().includes(texto)
        );
      })
      .map((item: Producto): ProductoRow => ({
        ...item,
        presentacion: item.presentacion.nombre,
        unidadMedida: item.unidadMedida.nombre
      }));
  }, [data, filtro]);

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(`${API_BASE}/producto`);
        if (!response.ok) throw new Error('Error al cargar productos');
        const productos = await response.json();
        setData(productos);
      } catch {
        Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
      }
    };

    fetchProductos();
  }, []);

  // Cargar opciones cuando se abre el modal
  useEffect(() => {
    if (!showModal) return;

    const fetchOpciones = async () => {
      try {
        const [presentaciones, unidades, proveedores] = await Promise.all([
          fetch(`${API_BASE}/presentacion`).then(r => r.json()),
          fetch(`${API_BASE}/unidadmedida`).then(r => r.json()),
          fetch(`${API_BASE}/proveedor`).then(r => r.json())
        ]);
        
        setOpciones({ presentaciones, unidades, proveedores });
      } catch {
        Swal.fire('Error', 'No se pudieron cargar las opciones', 'error');
      }
    };

    fetchOpciones();
  }, [showModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name.includes('_id') ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setIsEditMode(false);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    const { nombre, presentacion_id, unidadmedida_id } = form;
    
    if (!nombre || !presentacion_id || !unidadmedida_id) {
      return Swal.fire('Error', 'Completa todos los campos obligatorios', 'warning');
    }

    const payload = {
      nombre: form.nombre,
      tipoProducto: form.tipoProducto,
      subtipoInsumo: form.subtipoInsumo,
      estado: form.estado,
      presentacion_idpresentacion: form.presentacion_id,
      unidadmedida_idunidadmedida: form.unidadmedida_id,
      proveedor_idproveedor: form.proveedor_id || null
    };

    try {
      const response = await fetch(
        isEditMode ? `${API_BASE}/producto/${form.id}` : `${API_BASE}/producto`,
        {
          method: isEditMode ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error('Error en el servidor');

      const result = await response.json();
      const productoCompleto: Producto = {
        id: isEditMode ? form.id! : result.id,
        nombre: form.nombre,
        tipoProducto: form.tipoProducto,
        subtipoInsumo: form.subtipoInsumo,
        estado: form.estado,
        presentacion: opciones.presentaciones.find(p => p.id === form.presentacion_id) || 
                     { id: Number(form.presentacion_id), nombre: 'Desconocido' },
        unidadMedida: opciones.unidades.find(u => u.id === form.unidadmedida_id) || 
                     { id: Number(form.unidadmedida_id), nombre: 'Desconocido' },
        proveedor: form.proveedor_id 
          ? opciones.proveedores.find(p => p.id === form.proveedor_id)?.nombre || null 
          : null
      };

      setData(prev => 
        isEditMode 
          ? prev.map(item => item.id === form.id ? productoCompleto : item)
          : [...prev, productoCompleto]
      );

      Swal.fire('¡Éxito!', `Producto ${isEditMode ? 'actualizado' : 'creado'} correctamente`, 'success');
      closeModal();
    } catch {
      Swal.fire('Error', 'No se pudo guardar el producto', 'error');
    }
  };

  const handleDelete = async (row: ProductoRow) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de eliminar "${row.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_BASE}/producto/${row.id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar');
        
        setData(prev => prev.filter(item => item.id !== row.id));
        Swal.fire('Eliminado', 'Producto eliminado correctamente', 'success');
      } catch {
        Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
      }
    }
  };

  const handleEdit = (row: ProductoRow) => {
    const original = data.find(p => p.id === row.id);
    if (!original) return;

    const proveedorId = original.proveedor 
      ? opciones.proveedores.find(p => p.nombre === original.proveedor)?.id || ''
      : '';

    setForm({
      id: original.id,
      nombre: original.nombre,
      tipoProducto: original.tipoProducto,
      subtipoInsumo: original.subtipoInsumo,
      estado: original.estado,
      presentacion_id: original.presentacion.id,
      unidadmedida_id: original.unidadMedida.id,
      proveedor_id: proveedorId
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  // Componente para campos select reutilizable
  const SelectField: React.FC<{
    name: keyof ProductoForm;
    label: string;
    options: Opcion[];
    required?: boolean;
  }> = ({ name, label, options, required = false }) => (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        {label} {required && '*'}
      </label>
      <select
        id={name}
        name={name}
        value={form[name] || ''}
        onChange={handleChange}
        required={required}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '1rem',
          backgroundColor: 'white'
        }}
      >
        <option value="">{`Seleccione ${label.toLowerCase()}`}</option>
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.nombre}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <Home>
      <Header>
        <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
          <SearchBar onSearch={setFiltro} placeholder="Buscar productos..." />
          <BackButton onClick={() => navigate('/gestion')}>
            <FaArrowLeft style={{ marginRight: '8px' }} />
            Volver
          </BackButton>
          <Button onClick={() => setShowModal(true)}>
            Agregar Producto
          </Button>
        </div>
      </Header>

      <DataTable<ProductoRow>
        columns={columns}
        data={filteredData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        defaultItemsPerPage={10}
      />

      {showModal && (
        <Modal onClose={closeModal}>
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
            label="Subtipo de Insumo"
            name="subtipoInsumo"
            value={form.subtipoInsumo || ''}
            onChange={handleChange}
          />

          <SelectField
            name="presentacion_id"
            label="Presentación"
            options={opciones.presentaciones}
            required
          />

          <SelectField
            name="unidadmedida_id"
            label="Unidad de Medida"
            options={opciones.unidades}
            required
          />

          <SelectField
            name="proveedor_id"
            label="Proveedor"
            options={opciones.proveedores}
          />

          {isEditMode && (
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="estado" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                value={form.estado}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          )}

          <ModalFooter>
            <Button onClick={handleSave}>
              {isEditMode ? 'Actualizar' : 'Guardar'}
            </Button>
            <Button onClick={closeModal}>
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default ProductosBasePage;