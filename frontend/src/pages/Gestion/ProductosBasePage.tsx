import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from '../../components/Home';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Select from '../../components/ui/Select';
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header, BackButton } from '../../styles/Gestion/Gestion.css';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import SearchBar from '../../components/ui/Searchbar';
import { useAuthFetch, ApiError } from '../../components/ui/useAuthFetch';

// Types
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

type ProductoForm = {
  id?: number;
  nombre: string;
  tipoProducto: string;
  subtipoInsumo: string | null;
  estado: string;
  presentacion_id: number | null;
  unidadmedida_id: number | null;
  proveedor_id: number | null;
};

// Constants
const API_BASE = 'http://localhost:3000';
const INITIAL_FORM: ProductoForm = {
  nombre: '',
  tipoProducto: 'MATERIA_PRIMA',
  subtipoInsumo: null,
  estado: 'ACTIVO',
  presentacion_id: null,
  unidadmedida_id: null,
  proveedor_id: null
};

const COLUMNS = [
  { header: 'ID', accessor: 'id' },
  { header: 'Nombre', accessor: 'nombre' },
  { header: 'Presentación', accessor: 'presentacionNombre' },
  { header: 'Unidad', accessor: 'unidadMedidaNombre' },
  { header: 'Tipo', accessor: 'tipoProducto' }
];

const ProductosBasePage: React.FC = () => {
  const navigate = useNavigate();
  const { authFetch } = useAuthFetch();
  
  // State
  const [form, setForm] = useState<ProductoForm>(INITIAL_FORM);
  const [data, setData] = useState<Producto[]>([]);
  const [opciones, setOpciones] = useState({
    presentaciones: [] as Opcion[],
    unidades: [] as Opcion[],
    proveedores: [] as Opcion[]
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filtro, setFiltro] = useState('');

  // Transformar datos para la tabla
  const transformedData = useMemo(() => {
    return data.map(producto => ({
      ...producto,
      presentacionNombre: producto.presentacion?.nombre || 'N/A',
      unidadMedidaNombre: producto.unidadMedida?.nombre || 'N/A'
    }));
  }, [data]);

  // Datos filtrados
  const filteredData = useMemo(() => {
    if (!filtro) return transformedData;
    const searchTerm = filtro.toLowerCase();
    return transformedData.filter(p => 
      p.nombre.toLowerCase().includes(searchTerm) ||
      p.tipoProducto.toLowerCase().includes(searchTerm) ||
      p.presentacionNombre.toLowerCase().includes(searchTerm) ||
      p.unidadMedidaNombre.toLowerCase().includes(searchTerm)
    );
  }, [transformedData, filtro]);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productos, presentaciones, unidades, proveedores] = await Promise.all([
          authFetch(`${API_BASE}/producto`).then(r => r.json()),
          authFetch(`${API_BASE}/presentacion`).then(r => r.json()),
          authFetch(`${API_BASE}/unidadmedida`).then(r => r.json()),
          authFetch(`${API_BASE}/proveedor`).then(r => r.json())
        ]);
        setData(productos);
        setOpciones({ presentaciones, unidades, proveedores });
      } catch (error) {
        handleError(error, 'Error al cargar datos');
      }
    };
    fetchData();
  }, []);

  // Handlers
  const handleError = (error: unknown, defaultMessage: string) => {
    console.error(error);
    const message = error instanceof Error ? error.message : defaultMessage;
    if (!['No autenticado', 'Sesión expirada'].includes(message)) {
      Swal.fire('Error', message, 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name.endsWith('_id') ? (value ? Number(value) : null) : value
    }));
  };

  const handleSubmit = async () => {
    const camposFaltantes: string[] = [];
    
    if (!form.nombre.trim()) camposFaltantes.push('Nombre');
    if (!form.tipoProducto.trim()) camposFaltantes.push('Tipo de Producto');
    if (!form.presentacion_id) camposFaltantes.push('Presentación');
    if (!form.unidadmedida_id) camposFaltantes.push('Unidad de Medida');
    if (isEditMode && !form.estado.trim()) camposFaltantes.push('Estado');

    if (camposFaltantes.length > 0) {
      return Swal.fire({
        title: 'Campos obligatorios faltantes',
        html: `Por favor complete los siguientes campos:<br><br>• ${camposFaltantes.join('<br>• ')}`,
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
    }

    try {
      const method = isEditMode ? 'PATCH' : 'POST';
      const url = isEditMode ? `${API_BASE}/producto/${form.id}` : `${API_BASE}/producto`;
      
      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          tipoProducto: form.tipoProducto,
          subtipoInsumo: form.subtipoInsumo,
          estado: form.estado,
          presentacion_idpresentacion: form.presentacion_id,
          unidadmedida_idunidadmedida: form.unidadmedida_id,
          proveedor_idproveedor: form.proveedor_id
        })
      });

      const result = await response.json();
      setData(prev => isEditMode
        ? prev.map(p => p.id === form.id ? result : p)
        : [...prev, result]
      );
      closeModal();
      Swal.fire('Éxito', `Producto ${isEditMode ? 'actualizado' : 'creado'} correctamente`, 'success');
    } catch (error) {
      handleError(error, 'Error al guardar el producto');
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    const { isConfirmed } = await Swal.fire({
      title: `¿Eliminar ${nombre}?`,
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!isConfirmed) return;

    try {
      await authFetch(`${API_BASE}/producto/${id}`, { method: 'DELETE' });
      setData(prev => prev.filter(p => p.id !== id));
      Swal.fire('Eliminado', 'Producto eliminado correctamente', 'success');
    } catch (error) {
      handleError(error, 'Error al eliminar el producto');
    }
  };

  const handleEdit = (id: number) => {
    const producto = data.find(p => p.id === id);
    if (!producto) return;

    setForm({
      id: producto.id,
      nombre: producto.nombre,
      tipoProducto: producto.tipoProducto,
      subtipoInsumo: producto.subtipoInsumo,
      estado: producto.estado,
      presentacion_id: producto.presentacion.id,
      unidadmedida_id: producto.unidadMedida.id,
      proveedor_id: producto.proveedor 
        ? opciones.proveedores.find(p => p.nombre === producto.proveedor)?.id || null
        : null
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(INITIAL_FORM);
    setIsEditMode(false);
  };

  return (
    <Home>
      <Header>
        <SearchBar onSearch={setFiltro} placeholder="Buscar productos..." />
        <BackButton onClick={() => navigate('/gestion')}>
          <FaArrowLeft /> Volver
        </BackButton>
        <Button onClick={() => setShowModal(true)}>Agregar Producto</Button>
      </Header>

      <DataTable
        columns={COLUMNS}
        data={filteredData}
        onEdit={row => handleEdit(row.id)}
        onDelete={row => handleDelete(row.id, row.nombre)}
      />

      {showModal && (
        <Modal onClose={closeModal}>
          <h2>{isEditMode ? 'Editar Producto' : 'Agregar Producto'}</h2>
          
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

          <Select
            label="Presentación *"
            name="presentacion_id"
            value={form.presentacion_id || ''}
            options={opciones.presentaciones}
            onChange={handleChange}
            placeholder="Elija una presentación"
            required
            searchable={true}
          />

          <Select
            label="Unidad de Medida *"
            name="unidadmedida_id"
            value={form.unidadmedida_id || ''}
            options={opciones.unidades}
            onChange={handleChange}
            placeholder="Elija una unidad"
            required
          />

          <Select
            label="Proveedor"
            name="proveedor_id"
            value={form.proveedor_id || ''}
            options={opciones.proveedores}
            onChange={handleChange}
            placeholder="Elija un proveedor"
            searchable={true}
          />

          {isEditMode && (
            <Select
              label="Estado *"
              name="estado"
              value={form.estado}
              options={[
                { id: 'ACTIVO', nombre: 'Activo' },
                { id: 'INACTIVO', nombre: 'Inactivo' }
              ]}
              onChange={handleChange}
              placeholder="Elija un estado"
              required
            />
          )}

          <ModalFooter>
            <Button onClick={handleSubmit}>
              {isEditMode ? 'Actualizar' : 'Guardar'}
            </Button>
            <Button onClick={closeModal}>Cancelar</Button>
          </ModalFooter>
        </Modal>
      )}
    </Home>
  );
};

export default ProductosBasePage;