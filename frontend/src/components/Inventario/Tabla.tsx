import React, { useState, useEffect } from 'react';
import DataTable from '../ui/DataTable';
import SearchBar from '../ui/Searchbar';
import Modal from '../ui/Modal';
import { fetchInventario, fetchBodegas, updateInventarioItem, deleteInventarioItem } from '../Inventario/api/Invenarioapi';
import { InventarioItemAPI, InventarioItem, Bodega } from '../Inventario/types/inventarioTypes';
import Swal from 'sweetalert2';
import EditModal from '../Inventario/components/IdictModal';
import ExportToExcel from '../ui/ExportToExcel';

// Tipos de producto disponibles para filtrar
export type TipoProductoFiltro = 'TODOS' | 'MATERIA_PRIMA' | 'MATERIAL_DE_ENVASE' | 'ETIQUETAS';

// Función para transformar los datos del API a la estructura InventarioItem
const transformarDatosInventario = (apiData: InventarioItemAPI[]): InventarioItem[] => {
  return apiData.map(item => ({
    id: item.id,
    nombre: item.producto.nombre,
    tipo: item.producto.tipoProducto,
    presentacion: item.producto.presentacion.nombre,
    unidad_medida: item.producto.unidadMedida.nombre,
    cantidad_actual: item.cantidad_actual,
    estado: item.producto.estado,
    fechaUltimaActualizacion: item.fechaUltimaActualizacion,
    bodega: item.bodega.nombre,
    producto_id: item.producto.id,
    bodega_id: item.bodega.id
  }));
};

const columnas = [
  { header: 'ID', accessor: 'id', width: '70px' },
  { header: 'Nombre', accessor: 'nombre' },
  { header: 'Tipo', accessor: 'tipo' },
  { header: 'Presentación', accessor: 'presentacion' },
  { header: 'Unidad de Medida', accessor: 'unidad_medida' },
  { header: 'Cantidad Actual', accessor: 'cantidad_actual', width: '120px' },
  { header: 'Estado', accessor: 'estado', width: '100px' },
  { header: 'Última Actualización', accessor: 'fechaUltimaActualizacion', width: '180px' },
  { header: 'Bodega', accessor: 'bodega' },
];

const Tabla: React.FC = () => {
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoProductoFiltro>('TODOS');
  const [datos, setDatos] = useState<InventarioItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<InventarioItem | null>(null);
  const [bodegasDisponibles, setBodegasDisponibles] = useState<Bodega[]>([]);

  useEffect(() => {
    cargarDatos();
  }, [filtroTipo]); // Recargar datos cuando cambie el filtro de tipo

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const [datosInventario, datosBodegas] = await Promise.all([
        fetchInventario(filtroTipo !== 'TODOS' ? filtroTipo : undefined),
        fetchBodegas()
      ]);
      
      setBodegasDisponibles(datosBodegas);
      setDatos(transformarDatosInventario(datosInventario));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  const datosFiltrados = datos.filter(item => {
    if (!filtro.trim()) return true;
    
    const textoBusqueda = filtro.toLowerCase();
    return Object.values(item).some(
      value => value?.toString().toLowerCase().includes(textoBusqueda)
    );
  });

  const handleEdit = (item: InventarioItem) => {
    setEditando(item);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (!editando) return;

    if (name === "bodega") {
      const bodegaSeleccionada = bodegasDisponibles.find(b => b.nombre === value);
      setEditando(prev => ({
        ...prev!,
        bodega: value,
        bodega_id: bodegaSeleccionada?.id || prev?.bodega_id,
      }));
      return;
    }

    setEditando(prev => ({
      ...prev!,
      [name]: name === "cantidad_actual" ? Number(value) : value,
    }));
  };

  const handleUpdate = async () => {
    if (!editando) return;

    if (
      editando.cantidad_actual < 0 ||
      !editando.bodega ||
      editando.bodega === "seleccione una opcion"
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos requeridos y asegúrate que la cantidad sea válida.",
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Procesando...',
        text: 'Actualizando inventario',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      await updateInventarioItem(editando.id, {
        cantidad_actual: editando.cantidad_actual,
        producto_idproducto: editando.producto_id,
        bodega_idbodega: editando.bodega_id
      });

      setDatos(datos.map(item => 
        item.id === editando.id ? editando : item
      ));
      
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "El inventario ha sido actualizado correctamente.",
      });

      setEditando(null);
    } catch (error) {
      console.error("Error al actualizar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al actualizar el inventario. Por favor, inténtalo de nuevo.",
      });
    }
  };

  const handleDelete = async (item: InventarioItem) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar item del inventario?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Procesando...',
        text: 'Eliminando item del inventario',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      await deleteInventarioItem(item.id);

      setDatos(prev => prev.filter(i => i.id !== item.id));
      
      Swal.fire('Éxito', 'Item eliminado del inventario', 'success');
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : 'No se pudo eliminar el item del inventario',
      });
    }
  };

  const obtenerTextoBadge = (tipo: TipoProductoFiltro) => {
    switch (tipo) {
      case 'MATERIA_PRIMA':
        return 'Materia Prima';
      case 'MATERIAL_DE_ENVASE':
        return 'Material de Envase';
      case 'ETIQUETAS':
        return 'Etiquetas';
      default:
        return 'Todos';
    }
  };

  const obtenerColorBadge = (tipo: TipoProductoFiltro) => {
    switch (tipo) {
      case 'MATERIA_PRIMA':
        return '#28a745';
      case 'MATERIAL_DE_ENVASE':
        return '#007bff';
      case 'ETIQUETAS':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  return (
    <div>
      {/* SECCIÓN 1: FILTROS Y EXPORT */}
      <div className="mb-4" style={{ marginTop: '20px' }}>
        {/* Contenedor con Export y Filtros */}
        <div className="d-flex align-items-center gap-3 mb-3">
          <ExportToExcel 
            data={datosFiltrados}
            filename="movimientos_inventario"
            buttonText="Exportar a Excel"
          />
          
          {/* Filtros por tipo de producto */}
          <div className="d-flex gap-2">
            {(['TODOS', 'MATERIA_PRIMA', 'MATERIAL_DE_ENVASE', 'ETIQUETAS'] as TipoProductoFiltro[]).map((tipo) => (
              <button
                key={tipo}
                className={`btn ${filtroTipo === tipo ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFiltroTipo(tipo)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '20px',
                  border: filtroTipo === tipo ? 'none' : '1px solid #dee2e6',
                  backgroundColor: filtroTipo === tipo ? obtenerColorBadge(tipo) : 'transparent',
                  color: filtroTipo === tipo ? 'white' : '#6c757d',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                {obtenerTextoBadge(tipo)}
              </button>
            ))}
          </div>
        </div>

        {/* Badge indicador del filtro activo */}
        {filtroTipo !== 'TODOS' && (
          <div>
            <span 
              className="badge"
              style={{
                backgroundColor: obtenerColorBadge(filtroTipo),
                color: 'white',
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '15px'
              }}
            >
              Filtrando por: {obtenerTextoBadge(filtroTipo)}
            </span>
          </div>
        )}
      </div>

      {/* LÍNEA DIVISORIA */}
      <hr style={{
        border: 'none',
        height: '1px',
        backgroundColor: '#e9ecef',
        margin: '24px 0',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
      }} />

      {/* SECCIÓN 2: BÚSQUEDA */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="text-muted mb-0" style={{ fontSize: '14px', fontWeight: '600' }}>
            Búsqueda
          </h6>
          <div style={{ width: '300px' }}>
            <SearchBar
              onSearch={setFiltro}
              placeholder="Buscar productos..."
            />
          </div>
        </div>
      </div>

      {/* MENSAJES DE ERROR Y CARGA */}
      {error && <div className="alert alert-danger">{error}</div>}
      {cargando && <div className="alert alert-info">Cargando...</div>}

      {!cargando && datosFiltrados.length === 0 && (
        <div className="alert alert-info">
          {filtro 
            ? 'No se encontraron productos con ese criterio de búsqueda' 
            : filtroTipo !== 'TODOS' 
              ? `No hay productos del tipo ${obtenerTextoBadge(filtroTipo)} en el inventario`
              : 'No hay productos en el inventario'}
        </div>
      )}

      {/* TABLA DE DATOS */}
      {!cargando && !error && datosFiltrados.length > 0 && (
        <div style={{ marginTop: '20px' }} className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <DataTable 
              columns={columnas} 
              data={datosFiltrados}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      {editando && (
        <Modal onClose={() => setEditando(null)}>
          <EditModal
            item={editando}
            bodegas={bodegasDisponibles}
            onClose={() => setEditando(null)}
            onSave={handleUpdate}
            onChange={handleChange}
          />
        </Modal>
      )}
    </div>
  );
};

export default Tabla;