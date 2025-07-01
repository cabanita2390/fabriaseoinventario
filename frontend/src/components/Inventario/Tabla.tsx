import React, { useState, useEffect } from 'react';
import DataTable from '../ui/DataTable';
import SearchBar from '../ui/Searchbar';
import Modal from '../ui/Modal';
import { fetchInventario, fetchBodegas, updateInventarioItem } from '../Inventario/api/Invenarioapi';
import { InventarioItemAPI, InventarioItem, Bodega } from '../Inventario/types/inventarioTypes';
import Swal from 'sweetalert2';
import EditModal from '../Inventario/components/IdictModal';

// Función para transformar los datos del API a tu estructura InventarioItem
const transformInventarioData = (apiData: InventarioItemAPI[]): InventarioItem[] => {
  return apiData.map(item => ({
    id: item.id,
    nombre: item.producto.nombre,
    tipo: item.producto.tipoProducto,
    presentacion: item.producto.presentacion.nombre,
    unidad_medida: item.producto.unidadMedida.nombre,
    cantidad_actual: item.cantidad_actual,
    estado: item.producto.estado,
    fechaUltimaActualizacion: item.fechaUltimaActualizacion, // <-- Se mantiene exactamente igual
    bodega: item.bodega.nombre,
    producto_id: item.producto.id,
    bodega_id: item.bodega.id
  }));
};

const columns = [
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
  const [datos, setDatos] = useState<InventarioItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<InventarioItem | null>(null);
  const [bodegasDisponibles, setBodegasDisponibles] = useState<Bodega[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError(null);
        
        const [inventarioData, bodegasData] = await Promise.all([
          fetchInventario(),
          fetchBodegas()
        ]);
        
        setBodegasDisponibles(bodegasData);
        setDatos(transformInventarioData(inventarioData));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-5" style={{ marginTop: '20px' }}>
        <div style={{ width: '300px' }}>
          <SearchBar
            onSearch={setFiltro}
            placeholder="Buscar productos..."
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {cargando && <div className="alert alert-info">Cargando...</div>}

      {!cargando && datosFiltrados.length === 0 && (
        <div className="alert alert-info">
          {filtro 
            ? 'No se encontraron productos con ese criterio de búsqueda' 
            : 'No hay productos en el inventario'}
        </div>
      )}

      {!cargando && !error && datosFiltrados.length > 0 && (
        <div style={{ marginTop: '20px' }} className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <DataTable 
              columns={columns} 
              data={datosFiltrados}
              onEdit={handleEdit}
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