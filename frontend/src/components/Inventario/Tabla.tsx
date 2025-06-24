import React, { useState, useEffect } from 'react';
import DataTable from '../ui/DataTable';
import SearchBar from '../ui/Searchbar';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Swal from 'sweetalert2';
import styled from 'styled-components';
import Modal from '../ui/Modal';

// Definir interfaces según la estructura real de la API
interface UnidadMedida {
  id: number;
  nombre: string;
}

interface Presentacion {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  tipoProducto: string;
  estado: string;
  presentacion: Presentacion;
  unidadMedida: UnidadMedida;
}

interface Bodega {
  id: number;
  nombre: string;
  ubicacion: string;
}

interface InventarioItemAPI {
  id: number;
  cantidad_actual: number;
  fechaUltimaActualizacion: string;
  producto: Producto;
  bodega: Bodega;
}

// Interfaz para los datos transformados que necesita la tabla
interface InventarioItem {
  id: number;
  nombre: string;
  tipo: string;
  presentacion: string;
  unidad_medida: string;
  cantidad_actual: number;
  estado: string;
  fechaUltimaActualizacion: string;
  bodega: string;
  producto_id?: number;
  bodega_id?: number;
}

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

function Tabla() {
  const [filtro, setFiltro] = useState('');
  const [datos, setDatos] = useState<InventarioItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<InventarioItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [bodegasDisponibles, setBodegasDisponibles] = useState<Bodega[]>([]);
  const ModalContainer = styled.div`
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  min-width: 500px;
`;

const ModalTitle = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1B293D;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  gap: 0.75rem;
`;

const CancelButton = styled.button`
  padding: 0.5rem 1.25rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #d32f2f;
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }
`;

const SaveButton = styled.button`
  padding: 0.5rem 1.25rem;
  background-color:rgb(6, 77, 170);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: rgb(49, 64, 84);
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }
`;

  
  // Función para formatear la fecha
  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true);
        setError(null);
        
        const [inventarioRes, bodegasRes] = await Promise.all([
          fetch('http://localhost:3000/inventario'),
          fetch('http://localhost:3000/bodega')
        ]);
        
        if (!inventarioRes.ok || !bodegasRes.ok) {
          throw new Error('Error al cargar los datos');
        }
        
        const datosApi: InventarioItemAPI[] = await inventarioRes.json();
        const bodegasData: Bodega[] = await bodegasRes.json();
        
        setBodegasDisponibles(bodegasData);
        
        // Transformar los datos de la API al formato que necesita la tabla
        const datosTransformados: InventarioItem[] = datosApi.map(item => ({
          id: item.id,
          nombre: item.producto.nombre,
          tipo: item.producto.tipoProducto,
          presentacion: item.producto.presentacion.nombre,
          unidad_medida: item.producto.unidadMedida.nombre,
          cantidad_actual: item.cantidad_actual,
          estado: item.producto.estado,
          fechaUltimaActualizacion: formatFecha(item.fechaUltimaActualizacion),
          bodega: item.bodega.nombre,
          producto_id: item.producto.id,
          bodega_id: item.bodega.id
        }));
        
        setDatos(datosTransformados);
        
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        console.error('Error fetching data:', error);
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar datos basados en la búsqueda
  const datosFiltrados = datos.filter(item => {
    if (!filtro.trim()) return true;
    
    const textoBusqueda = filtro.toLowerCase();
    return (
      item.id.toString().includes(textoBusqueda) ||
      item.nombre.toLowerCase().includes(textoBusqueda) ||
      item.tipo.toLowerCase().includes(textoBusqueda) ||
      item.presentacion.toLowerCase().includes(textoBusqueda) ||
      item.unidad_medida.toLowerCase().includes(textoBusqueda) ||
      item.estado.toLowerCase().includes(textoBusqueda) ||
      item.bodega.toLowerCase().includes(textoBusqueda) ||
      item.cantidad_actual.toString().includes(textoBusqueda)
    );
  });

  const handleEdit = (item: InventarioItem) => {
    setEditando(item);
    setShowEditModal(true);
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
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const payload = {
        cantidad_actual: editando.cantidad_actual,
        producto_idproducto: editando.producto_id,
        bodega_idbodega: editando.bodega_id
      };

      const response = await fetch(`http://localhost:3000/inventario/${editando.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el inventario');
      }

      const updatedData = datos.map(item => 
        item.id === editando.id ? editando : item
      );
      
      setDatos(updatedData);
      
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "El inventario ha sido actualizado correctamente.",
      });

      setShowEditModal(false);
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

  const closeModal = () => {
    setShowEditModal(false);
    setEditando(null);
  };

  return (
    <div>
      <div
        className="d-flex justify-content-between align-items-center mb-5"
        style={{ marginTop: '20px' }}
      >
        <div style={{ width: '300px' }}>
          <SearchBar
            onSearch={setFiltro}
            placeholder="Buscar productos..."
          />
        </div>
      </div>

      {datosFiltrados.length === 0 ? (
        <div className="alert alert-info">
          {filtro 
            ? 'No se encontraron productos con ese criterio de búsqueda' 
            : 'No hay productos en el inventario'}
        </div>
      ) : (
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

      {showEditModal && editando && (
  <Modal onClose={closeModal}>
    <ModalContainer>
      <ModalTitle>Editar Inventario</ModalTitle>
      
      <Input 
        label="Nombre"
        value={editando.nombre}
        onChange={() => {}}
        disabled={true}
      />
      
      <Input 
        label="Tipo"
        value={editando.tipo}
        onChange={() => {}}
        disabled={true}
      />
      
      <Input 
        label="Presentación"
        value={editando.presentacion}
        onChange={() => {}}
        disabled={true}
      />
      
      <Input 
        label="Unidad de Medida"
        value={editando.unidad_medida}
        onChange={() => {}}
        disabled={true}
      />
      
      <Input 
        label="Cantidad Actual"
        type="number"
        name="cantidad_actual"
        value={editando.cantidad_actual}
        onChange={handleChange}
      />
      
      <Select
        label="Bodega"
        name="bodega"
        value={editando.bodega || "seleccione una opcion"}
        onChange={handleChange}
        options={["seleccione una opcion", ...bodegasDisponibles.map((b) => b.nombre)]}
      />
      
      <Input 
        label="Última Actualización"
        value={editando.fechaUltimaActualizacion}
        onChange={() => {}}
        disabled={true}
      />
      
      <ButtonContainer>
        <CancelButton onClick={closeModal}>
          Cancelar
        </CancelButton>
        <SaveButton onClick={handleUpdate}>
          Guardar Cambios
        </SaveButton>
      </ButtonContainer>
    </ModalContainer>
  </Modal>
)}
    </div>
  );
}

export default Tabla;