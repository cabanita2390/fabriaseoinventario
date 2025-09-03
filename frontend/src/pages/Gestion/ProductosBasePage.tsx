import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from '../../components/Home';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Select from '../../components/ui/Select';
import ExportToExcel from '../../components/ui/ExportToExcel';
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header, BackButton } from '../../styles/Gestion/Gestion.css';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import SearchBar from '../../components/ui/Searchbar';
import { useAuthFetch } from '../../components/ui/useAuthFetch';

// Types
type Opcion = { id: number; nombre: string };

type Proveedor = {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
};

type Producto = {
  id: number;
  nombre: string;
  tipoProducto: string;
  subtipoInsumo: string | null;
  estado: string;
  presentacion: Opcion;
  unidadMedida: Opcion;
  proveedor: Proveedor | null;
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
const API_BASE = 'https://fabriaseo-inventario-backend.onrender.com';
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
  { header: 'Tipo', accessor: 'tipoProducto' },
  { header: 'Proveedor', accessor: 'proveedorNombre' },
  { header: 'Estado', accessor: 'estadoFormateado' }
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
    return data.map((producto: Producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      tipoProducto: producto.tipoProducto,
      subtipoInsumo: producto.subtipoInsumo,
      estado: producto.estado,
      presentacion: producto.presentacion,
      unidadMedida: producto.unidadMedida,
      proveedor: producto.proveedor,
      presentacionNombre: producto.presentacion?.nombre || 'N/A',
      unidadMedidaNombre: producto.unidadMedida?.nombre || 'N/A',
      proveedorNombre: producto.proveedor?.nombre || 'N/A',
      estadoFormateado: producto.estado === 'ACTIVO' ? '✅ Activo' : '❌ Inactivo'
    }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (!filtro) return transformedData;
    const searchTerm = filtro.toLowerCase();
    return transformedData.filter(p =>
      p.nombre.toLowerCase().includes(searchTerm) ||
      p.tipoProducto.toLowerCase().includes(searchTerm) ||
      p.presentacionNombre.toLowerCase().includes(searchTerm) ||
      p.unidadMedidaNombre.toLowerCase().includes(searchTerm) ||
      p.proveedorNombre.toLowerCase().includes(searchTerm)
    );
  }, [transformedData, filtro]);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productosRes, presentacionesRes, unidadesRes, proveedoresRes] =
          await Promise.allSettled([
            authFetch(`${API_BASE}/producto`),
            authFetch(`${API_BASE}/presentacion`),
            authFetch(`${API_BASE}/unidadmedida`),
            authFetch(`${API_BASE}/proveedor`)
          ]);

        // Procesar cada respuesta individualmente
        const productos = productosRes.status === 'fulfilled'
          ? await productosRes.value.json()
          : [];

        const presentaciones = presentacionesRes.status === 'fulfilled'
          ? await presentacionesRes.value.json()
          : [];

        const unidades = unidadesRes.status === 'fulfilled'
          ? await unidadesRes.value.json()
          : [];

        const proveedores = proveedoresRes.status === 'fulfilled'
          ? await proveedoresRes.value.json()
          : [];

        setData(productos);
        setOpciones({ presentaciones, unidades, proveedores });
      } catch (error) {
        handleError(error, 'Error al cargar datos');
      }
    };
    fetchData();
  }, [authFetch]);

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

      // Función para enriquecer el producto con datos locales
      const enrichProduct = (product: any): Producto => ({
        id: product.id,
        nombre: product.nombre,
        tipoProducto: product.tipoProducto,
        subtipoInsumo: product.subtipoInsumo,
        estado: product.estado,
        presentacion: opciones.presentaciones.find(p => p.id === product.presentacion_idpresentacion) || { id: 0, nombre: 'N/A' },
        unidadMedida: opciones.unidades.find(u => u.id === product.unidadmedida_idunidadmedida) || { id: 0, nombre: 'N/A' },
        proveedor: form.proveedor_id ? {
          id: form.proveedor_id,
          nombre: opciones.proveedores.find(p => p.id === form.proveedor_id)?.nombre || '',
          telefono: '',
          email: '',
          direccion: ''
        } : null
      });

      const enrichedProduct = enrichProduct(result);

      setData(prev => isEditMode
        ? prev.map(p => p.id === form.id ? enrichedProduct : p)
        : [...prev, enrichedProduct]
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
      proveedor_id: producto.proveedor?.id || null
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
      <div className="export-excel-container">
        <ExportToExcel 
          data={filteredData}
          filename="listado_productos_base"
          buttonText="Exportar a Excel"
        />
      </div>
      
      <Header>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <SearchBar onSearch={setFiltro} placeholder="Buscar productos..." />
          
          <BackButton onClick={() => navigate('/gestion')}>
            <FaArrowLeft style={{ marginRight: '8px' }} /> Volver
          </BackButton>
          
          <Button onClick={() => setShowModal(true)}>Agregar Producto</Button>
        </div>
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

          <Select
            label="Tipo de Producto *"
            name="tipoProducto"
            value={form.tipoProducto}
            onChange={handleChange}
            required
            options={[
              { value: 'MATERIA_PRIMA', label: 'Materia Prima' },
              { value: 'MATERIAL_DE_ENVASE', label: 'Material de Envase' },
              { value: 'ETIQUETAS', label: 'Etiquetas' }
            ]}
          />
          <Input
            label="Subtipo de Producto"
            name="subtipoInsumo"
            value={form.subtipoInsumo || ''}
            onChange={handleChange}
            maxLength={45}
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