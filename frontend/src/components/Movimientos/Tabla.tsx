import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/Movimientos/movimientos.css';
import Filtro from './Filtro';
import DataTable from '../ui/DataTable';
import Modal from '../ui/Modal';
import { useAuthFetch } from '../ui/useAuthFetch';
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

interface TablaProps {
  mostrarFiltro?: boolean; 
  mostrarExportar?: boolean;
  reloadTrigger?: number;
}

function Tabla({ 
  mostrarFiltro = true, 
  mostrarExportar = true,
  reloadTrigger
}: TablaProps) {
  const [data, setData] = useState<RowData[]>([]);
  const [fullData, setFullData] = useState<RowData[]>([]);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtrosAplicados, setFiltrosAplicados] = useState<Record<string, any>>({});
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

  // Función para convertir fechas en formato dd/MM/yyyy HH:mm:ss a Date
  const parsearFecha = useCallback((fechaStr: string): Date | null => {
    if (!fechaStr) return null;
    
    const [datePart, timePart] = fechaStr.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours = 0, minutes = 0, seconds = 0] = timePart?.split(':').map(Number) || [];
    
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }, []);

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
  }, [cargarDatos, reloadTrigger]);

  // Función unificada para aplicar todos los filtros
  const aplicarFiltros = useCallback(() => {
    const { fechaInicio, fechaFin } = filtrosAplicados;
    const texto = filtroTexto.toLowerCase();

    const filtrado = fullData.filter((row) => {
      let pasaFiltro = true;
      
      // Aplicar filtro de fechas
      if (fechaInicio || fechaFin) {
        const itemFecha = parsearFecha(row.fecha);
        
        // Verificar si la fecha es válida
        if (!itemFecha || isNaN(itemFecha.getTime())) {
          return false;
        }

        const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : null;
        const fechaFinDate = fechaFin ? new Date(fechaFin) : null;
        
        // Ajustar fechaFin para que incluya todo el día
        if (fechaFinDate) {
          fechaFinDate.setHours(23, 59, 59, 999);
        }
        
        if (fechaInicioDate && itemFecha < fechaInicioDate) {
          pasaFiltro = false;
        }
        if (fechaFinDate && itemFecha > fechaFinDate) {
          pasaFiltro = false;
        }
      }

      // Aplicar filtro de texto solo si pasa el filtro de fecha
      if (pasaFiltro && texto) {
        const textoMatch = (
          row.producto.toLowerCase().includes(texto) ||
          row.descripcion.toLowerCase().includes(texto) ||
          row.proveedor.toLowerCase().includes(texto) ||
          row.bodega.toLowerCase().includes(texto) ||
          row.tipo.toLowerCase().includes(texto)
        );
        
        if (!textoMatch) {
          pasaFiltro = false;
        }
      }
      
      return pasaFiltro;
    });

    setData(filtrado);
  }, [fullData, filtrosAplicados, filtroTexto, parsearFecha]);

  // Aplicar filtros cuando cambien los datos o los filtros
  useEffect(() => {
    if (fullData.length > 0) {
      aplicarFiltros();
    }
  }, [fullData, filtrosAplicados, filtroTexto, aplicarFiltros]);

  const handleBuscar = useCallback((values: Record<string, any>) => {
    const fechaInicio = values.fechaInicio ? new Date(values.fechaInicio).toISOString() : null;
    const fechaFin = values.fechaFin ? new Date(values.fechaFin).toISOString() : null;
    
    setFiltrosAplicados({
      ...values,
      fechaInicio,
      fechaFin
    });
  }, []);

  const exportToCSV = useCallback(() => {
    const headers = columns.map(c => c.header).join(',');
    const rows = data.map(row =>
      columns.map(c => `"${row[c.accessor as keyof RowData] ?? ""}"`).join(',')
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

    // Validar campos requeridos
    if (!movimientoActualizado.producto || !movimientoActualizado.cantidad || 
        !movimientoActualizado.bodega || movimientoActualizado.bodega === "seleccione una opcion" ||
        movimientoActualizado.cantidad <= 0) {
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
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const productoSeleccionado = productosDisponibles.find(p => p.nombre === movimientoActualizado.producto);
      const bodegaSeleccionada = bodegasDisponibles.find(b => b.nombre === movimientoActualizado.bodega);
      
      if (!productoSeleccionado || !bodegaSeleccionada) {
        throw new Error(!productoSeleccionado ? 'Producto no encontrado' : 'Bodega no encontrada');
      }

      const payload = {
        tipo: movimientoActualizado.tipo === 'Entrada' ? 'INGRESO' : 'EGRESO',
        cantidad: movimientoActualizado.cantidad,
        descripcion: movimientoActualizado.descripcion,
        producto_idproducto: productoSeleccionado.id,
        bodega_idbodega: bodegaSeleccionada.id
      };

      await updateMovimiento(authFetch, movimientoActualizado.id, payload);

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