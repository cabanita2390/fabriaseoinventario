import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from '../../components/Home';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header, BackButton } from '../../styles/Gestion/Gestion.css';
import { FaArrowLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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
  nombre: '', tipoProducto: 'MATERIA_PRIMA', subtipoInsumo: null, estado: 'ACTIVO',
  presentacion_id: '', unidadmedida_id: '', proveedor_id: ''
};

const ProductosBasePage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductoForm>(initialForm);
  const [data, setData] = useState<Producto[]>([]);
  const [opciones, setOpciones] = useState<{presentaciones: Opcion[]; unidades: Opcion[]; proveedores: Opcion[]}>
    ({ presentaciones: [], unidades: [], proveedores: [] });
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filtro, setFiltro] = useState('');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Presentación', accessor: 'presentacion' },
    { header: 'Unidad', accessor: 'unidadMedida' },
    { header: 'Tipo', accessor: 'tipoProducto' }
  ];

  // Datos filtrados
  const filteredData: ProductoRow[] = data
    .filter((item: Producto) => {
      const texto = filtro.toLowerCase();
      return ['nombre', 'tipoProducto'].some(field => item[field as keyof Producto]?.toString().toLowerCase().includes(texto)) ||
             ['presentacion', 'unidadMedida'].some(field => (item[field as keyof Producto] as Opcion)?.nombre?.toLowerCase().includes(texto));
    })
    .map((item: Producto): ProductoRow => ({
      ...item, presentacion: item.presentacion.nombre, unidadMedida: item.unidadMedida.nombre
    }));

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Resetear página cuando se filtra
  useEffect(() => {
    setCurrentPage(1);
  }, [filtro]);

  useEffect(() => {
    fetch(`${API_BASE}/producto`).then(res => res.json()).then(setData)
      .catch(() => Swal.fire('Error', 'No se pudieron cargar los productos', 'error'));
  }, []);

  useEffect(() => {
    if (!showModal) return;
    Promise.all([
      fetch(`${API_BASE}/presentacion`).then(r => r.json()),
      fetch(`${API_BASE}/unidadmedida`).then(r => r.json()),
      fetch(`${API_BASE}/proveedor`).then(r => r.json())
    ]).then(([presentaciones, unidades, proveedores]) => setOpciones({ presentaciones, unidades, proveedores }))
      .catch(() => Swal.fire('Error', 'No se pudieron cargar las opciones', 'error'));
  }, [showModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name.includes('_id') ? (value === '' ? '' : Number(value)) : value }));
  };

  const handleSave = async () => {
    const { nombre, presentacion_id, unidadmedida_id } = form;
    if (!nombre || !presentacion_id || !unidadmedida_id) {
      return Swal.fire('Error', 'Completa todos los campos obligatorios', 'warning');
    }

    const payload = {
      nombre: form.nombre, tipoProducto: form.tipoProducto, subtipoInsumo: form.subtipoInsumo, estado: form.estado,
      presentacion_idpresentacion: form.presentacion_id, unidadmedida_idunidadmedida: form.unidadmedida_id,
      proveedor_idproveedor: form.proveedor_id || null
    };

    try {
      const response = await fetch(
        isEditMode ? `${API_BASE}/producto/${form.id}` : `${API_BASE}/producto`,
        { method: isEditMode ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );

      if (!response.ok) throw new Error('Error en el servidor');

      const result = await response.json();
      const productoCompleto: Producto = {
        id: isEditMode ? form.id! : result.id, nombre: form.nombre, tipoProducto: form.tipoProducto,
        subtipoInsumo: form.subtipoInsumo, estado: form.estado,
        presentacion: opciones.presentaciones.find((p: Opcion) => p.id === form.presentacion_id) || 
                     { id: Number(form.presentacion_id), nombre: 'Desconocido' },
        unidadMedida: opciones.unidades.find((u: Opcion) => u.id === form.unidadmedida_id) || 
                     { id: Number(form.unidadmedida_id), nombre: 'Desconocido' },
        proveedor: form.proveedor_id ? opciones.proveedores.find((p: Opcion) => p.id === form.proveedor_id)?.nombre || null : null
      };

      setData(prev => isEditMode ? prev.map(item => item.id === form.id ? productoCompleto : item) : [...prev, productoCompleto]);
      Swal.fire('¡Éxito!', `Producto ${isEditMode ? 'actualizado' : 'creado'} correctamente`, 'success');
      setShowModal(false); setForm(initialForm); setIsEditMode(false);
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar el producto', 'error');
    }
  };

  const handleDelete = async (row: ProductoRow) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?', text: `¿Eliminar "${row.nombre}"?`, icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_BASE}/producto/${row.id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar');
        setData(prev => prev.filter(item => item.id !== row.id));
        Swal.fire('Eliminado', 'Producto eliminado correctamente', 'success');
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
      }
    }
  };

  const handleEdit = (row: ProductoRow) => {
    const original = data.find(p => p.id === row.id);
    if (!original) return;
    const proveedorId = original.proveedor ? opciones.proveedores.find((p: Opcion) => p.nombre === original.proveedor)?.id || '' : '';
    setForm({
      id: original.id, nombre: original.nombre, tipoProducto: original.tipoProducto,
      subtipoInsumo: original.subtipoInsumo, estado: original.estado,
      presentacion_id: original.presentacion.id, unidadmedida_id: original.unidadMedida.id, proveedor_id: proveedorId
    });
    setIsEditMode(true); setShowModal(true);
  };

  const SelectField: React.FC<{
    name: keyof ProductoForm; label: string; options: Opcion[]; required?: boolean;
  }> = ({ name, label, options, required = false }) => {
    const fieldId = `${name}_field`;
    return (
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor={fieldId} style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          {label} {required && '*'}
        </label>
        <select 
          id={fieldId}
          name={name} 
          value={form[name] || ''} 
          onChange={handleChange} 
          required={required}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', backgroundColor: 'white' }}
        >
          <option value="">{`Seleccione ${label.toLowerCase()}`}</option>
          {options.map((option: Opcion) => (<option key={option.id} value={option.id}>{option.nombre}</option>))}
        </select>
      </div>
    );
  };

  const EstadoSelectField: React.FC = () => (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor="estado_field" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        Estado *
      </label>
      <select 
        id="estado_field"
        name="estado" 
        value={form.estado} 
        onChange={handleChange} 
        required
        style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', backgroundColor: 'white' }}
      >
        <option value="ACTIVO">Activo</option>
        <option value="INACTIVO">Inactivo</option>
      </select>
    </div>
  );

  const PaginationControls = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginTop: '1rem',
      padding: '1rem 0',
      borderTop: '1px solid #e0e0e0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label htmlFor="items-per-page">
          Mostrar:
          <select 
            id="items-per-page"
            name="itemsPerPage"
            value={itemsPerPage} 
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </label>
        <span style={{ fontSize: '0.9rem', color: '#666' }}>
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredData.length)} de {filteredData.length} productos
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{ 
            padding: '0.5rem', 
            minWidth: 'auto',
            opacity: currentPage === 1 ? 0.5 : 1,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          <FaChevronLeft />
        </Button>
        
        <span style={{ margin: '0 1rem', fontSize: '0.9rem' }}>
          Página {currentPage} de {totalPages}
        </span>
        
        <Button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={{ 
            padding: '0.5rem', 
            minWidth: 'auto',
            opacity: currentPage === totalPages ? 0.5 : 1,
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          <FaChevronRight />
        </Button>
      </div>
    </div>
  );

  return (
    <Home>
      <Header>
        <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
          <SearchBar onSearch={setFiltro} placeholder="Buscar productos..." />
          <BackButton onClick={() => navigate('/gestion')}>
            <FaArrowLeft style={{ marginRight: '8px' }} /> Volver
          </BackButton>
          <Button onClick={() => { setForm(initialForm); setIsEditMode(false); setShowModal(true); }}>
            Agregar Producto
          </Button>
        </div>
      </Header>

      <DataTable<ProductoRow> columns={columns} data={currentData} onEdit={handleEdit} onDelete={handleDelete} />
      
      {filteredData.length > 0 && <PaginationControls />}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {isEditMode ? 'Editar Producto' : 'Agregar Producto'}
          </h2>

          <Input label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} required />
          <Input label="Tipo de Producto *" name="tipoProducto" value={form.tipoProducto} onChange={handleChange} required />
          <Input label="Subtipo de Insumo" name="subtipoInsumo" value={form.subtipoInsumo || ''} onChange={handleChange} />
          <SelectField name="presentacion_id" label="Presentación" options={opciones.presentaciones} required />
          <SelectField name="unidadmedida_id" label="Unidad de Medida" options={opciones.unidades} required />
          <SelectField name="proveedor_id" label="Proveedor" options={opciones.proveedores} />
          {isEditMode && <EstadoSelectField />}

          <ModalFooter>
            <Button onClick={handleSave}>{isEditMode ? 'Actualizar' : 'Guardar'}</Button>
            <Button onClick={() => { setShowModal(false); setForm(initialForm); setIsEditMode(false); }}>
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default ProductosBasePage;