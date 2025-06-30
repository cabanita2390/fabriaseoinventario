import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/Movimientos/movimientos.css';
import Filtro from './Filtro';
import DataTable from '../ui/DataTable';
import Modal from '../ui/Modal';
import { useAuthFetch} from '../ui/useAuthFetch';
import { RowData, filtrosConfig } from '../Movimientos/types/Typesmovimientos';
import { 
  fetchMovimientos, 
  updateMovimiento,
  fetchProductosAgrupados,
  fetchBodegas
} from '../Movimientos/api/MovimientosApi';
import EditModal from '../Movimientos/components/EditModal';
import Swal from 'sweetalert2';
import styled from 'styled-components';

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
  margin-right: 10px;

  &:hover {
    background-color: #d32f2f;
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SaveButton = styled.button`
  padding: 0.5rem 1.25rem;
  background-color: rgb(6, 77, 170);
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

  &:active {
    transform: translateY(0);
  }
`;

function Tabla({ mostrarFiltro = true, mostrarExportar = true }: { 
  mostrarFiltro?: boolean; 
  mostrarExportar?: boolean 
}) {
  const [data, setData] = useState<RowData[]>([]);
  const [fullData, setFullData] = useState<RowData[]>([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [editando, setEditando] = useState<RowData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productosDisponibles, setProductosDisponibles] = useState<any[]>([]);
  const [bodegasDisponibles, setBodegasDisponibles] = useState<any[]>([]);
  const { authFetch } = useAuthFetch();

  const columns = [
    { header: "Tipo", accessor: "tipo" },
    { header: "Producto", accessor: "producto" },
    { header: "Cantidad", accessor: "cantidad" },
    { header: "Unidad", accessor: "unidad" },
    { header: "Descripción", accessor: "descripcion" },
    { header: "Proveedor", accessor: "proveedor" },
    { header: "Bodega", accessor: "bodega" },
    { header: "Fecha", accessor: "fecha" },
  ];

  const cargarDatos = useCallback(async () => {
    try {
      const movimientos = await fetchMovimientos(authFetch);
      setData(movimientos);
      setFullData(movimientos);
      
      const [productos, bodegas] = await Promise.all([
        fetchProductosAgrupados(authFetch),
        fetchBodegas(authFetch)
      ]);
      
      setProductosDisponibles(productos);
      setBodegasDisponibles(bodegas);
    } catch (error) {
      console.error("Error cargando datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los datos. Por favor, inténtalo de nuevo.",
      });
    }
  }, [authFetch]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleBuscar = useCallback((values: Record<string, string>) => {
    const { fechaInicio, fechaFin } = values;

    const filtrado = fullData.filter(({ fecha, producto, descripcion, proveedor, bodega, tipo }) => {
      const itemFecha = new Date(fecha);
      if (fechaInicio && itemFecha < new Date(fechaInicio)) return false;
      if (fechaFin && itemFecha > new Date(fechaFin)) return false;

      const texto = filtroTexto.toLowerCase();
      return (
        producto.toLowerCase().includes(texto) ||
        descripcion.toLowerCase().includes(texto) ||
        proveedor.toLowerCase().includes(texto) ||
        bodega.toLowerCase().includes(texto) ||
        tipo.toLowerCase().includes(texto)
      );
    });

    setData(filtrado);
  }, [filtroTexto, fullData]);

  useEffect(() => {
    handleBuscar({});
  }, [filtroTexto, handleBuscar]);

  const exportToCSV = useCallback(() => {
    const headers = columns
      .map(c => c.header)
      .join(',');
      
    const rows = data.map(row =>
      columns
        .map(c => `"${row[c.accessor as keyof RowData] ?? ""}"`)
        .join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'movimientos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data, columns]);

  const handleEdit = useCallback((movimiento: RowData) => {
    setEditando(movimiento);
    setShowEditModal(true);
  }, []);

  const handleUpdate = useCallback(async (movimientoActualizado: RowData) => {
    if (!movimientoActualizado) return;

    if (
      !movimientoActualizado.producto ||
      !movimientoActualizado.cantidad ||
      !movimientoActualizado.bodega ||
      movimientoActualizado.bodega === "seleccione una opcion" ||
      movimientoActualizado.cantidad <= 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos requeridos y asegúrate que la cantidad sea mayor a 0.",
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Procesando...',
        text: 'Actualizando movimiento',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Obtener el ID del producto seleccionado
      const productoSeleccionado = productosDisponibles.find(p => p.nombre === movimientoActualizado.producto);
      if (!productoSeleccionado) {
        throw new Error('Producto no encontrado');
      }

      // Encontrar la bodega seleccionada
      const bodegaSeleccionada = bodegasDisponibles.find(b => b.nombre === movimientoActualizado.bodega);
      if (!bodegaSeleccionada) {
        throw new Error('Bodega no encontrada');
      }

      // Construir payload para la API
      const payload = {
        tipo: movimientoActualizado.tipo === 'Entrada' ? 'INGRESO' : 'EGRESO',
        cantidad: movimientoActualizado.cantidad,
        descripcion: movimientoActualizado.descripcion,
        producto_idproducto: productoSeleccionado.id,
        bodega_idbodega: bodegaSeleccionada.id
      };

      await updateMovimiento(authFetch, movimientoActualizado.id, payload);

      // Actualizar el estado local
      const updatedData = data.map(item => 
        item.id === movimientoActualizado.id ? movimientoActualizado : item
      );
      
      setData(updatedData);
      setFullData(updatedData);
      
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "El movimiento ha sido actualizado correctamente.",
      });

      setShowEditModal(false);
      setEditando(null);
    } catch (error) {
      console.error("Error al actualizar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al actualizar el movimiento. Por favor, inténtalo de nuevo.",
      });
    }
  }, [authFetch, data, productosDisponibles, bodegasDisponibles]);

  const closeModal = useCallback(() => {
    setShowEditModal(false);
    setEditando(null);
  }, []);

  return (
    <div>
      {mostrarFiltro && (
        <Filtro
          fields={filtrosConfig}
          onSearch={handleBuscar}
          onTextoChange={setFiltroTexto}
          onExport={mostrarExportar ? exportToCSV : undefined}
        />
      )}
      
      <DataTable 
        columns={columns} 
        data={data} 
        onEdit={handleEdit}
      />
      
      {showEditModal && editando && (
        <Modal onClose={closeModal}>
          <EditModal
            editando={editando}
            productosDisponibles={productosDisponibles}
            bodegasDisponibles={bodegasDisponibles}
            onClose={closeModal}
            onSave={handleUpdate}
          />
        </Modal>
      )}
    </div>
  );
}

export default Tabla;