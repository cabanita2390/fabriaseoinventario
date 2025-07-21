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
import useFiltroMovimientos from '../Movimientos/components/useFiltroMovimientos';
import ExportToExcel from '../ui/ExportToExcel';


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
  const [editando, setEditando] = useState<RowData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productosDisponibles, setProductosDisponibles] = useState<any[]>([]);
  const [bodegasDisponibles, setBodegasDisponibles] = useState<any[]>([]);
  const { authFetch } = useAuthFetch();
 // Obtener el usuario del contexto
  
  // Usamos el hook personalizado para manejar filtros
  const { 
    filtroTexto, 
    setFiltroTexto, 
    handleBuscar, 
    dataFiltrada, 
    actualizarDatos,
    fullData
  } = useFiltroMovimientos([]);

  const columns = [
    { header: "Tipo", accessor: "tipo" },
    { header: "Producto", accessor: "producto" },
    { header: "Tipo", accessor: "tipoProducto" },
    { header: "Cantidad", accessor: "cantidad" },
    { header: "Unidad", accessor: "unidad" },
    { header: "Descripción", accessor: "descripcion" },
    { header: "Proveedor", accessor: "proveedor" },
    { header: "Bodega", accessor: "bodega" },
    { header: "Fecha", accessor: "fechaFormateada" },
  ];

  const formatearFecha = useCallback((fechaISO: string): string => {
    if (!fechaISO) return '';
    
    try {
      const fecha = new Date(fechaISO);
      
      if (isNaN(fecha.getTime())) {
        return '';
      }
      
      const opciones: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      
      return fecha.toLocaleDateString('es-ES', opciones);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  }, []);

const cargarDatos = useCallback(async () => {
  try {
    // 1. Primero cargamos movimientos
    const movimientos = await fetchMovimientos(authFetch)
      .catch(error => {
        throw new Error(`MOVIMIENTOS: ${error.message}`);
      });
    
    const movimientosFormateados = movimientos.map(mov => ({
      ...mov,
      fechaFormateada: formatearFecha(mov.fechaMovimiento || mov.fecha),
      fechaOriginal: mov.fechaMovimiento || mov.fecha
    }));
    
    actualizarDatos(movimientosFormateados);
    
    // 2. Luego cargamos productos y bodegas en paralelo
    const [productos, bodegas] = await Promise.all([
      fetchProductosAgrupados(authFetch)
        .catch(error => {
          throw new Error(`PRODUCTOS: ${error.message}`);
        }),
      fetchBodegas(authFetch)
        .catch(error => {
          throw new Error(`BODEGAS: ${error.message}`);
        })
    ]);
    
    setProductosDisponibles(productos);
    setBodegasDisponibles(bodegas);
    
  } catch (error) {
    let errorMessage = "No se pudieron cargar los datos. Por favor, inténtalo de nuevo.";
    let errorTitle = "Error";
    
    if (error instanceof Error) {
      // Extraemos el tipo de error (MOVIMIENTOS/PRODUCTOS/BODEGAS)
      const [errorType, ...messageParts] = error.message.split(': ');
      const detailedMessage = messageParts.join(': ');
      
      switch(errorType) {
        case 'MOVIMIENTOS':
          errorTitle = "Error en movimientos";
          if (detailedMessage.includes('No tienes autorización')) {
            errorMessage = "No tienes permiso para ver los movimientos. Contacta al administrador.";
          }
          break;
          
        case 'PRODUCTOS':
          errorTitle = "Error en productos";
          if (detailedMessage.includes('No tienes autorización')) {
            errorMessage = "No tienes permiso para ver los productos. Contacta al administrador.";
          }
          break;
          
        case 'BODEGAS':
          errorTitle = "Error en bodegas";
          if (detailedMessage.includes('No tienes autorización')) {
            errorMessage = "No tienes permiso para ver las bodegas. Contacta al administrador.";
          } else if (detailedMessage.includes('Failed to fetch')) {
            errorMessage = "Error al conectar con el servidor de bodegas. Verifica tu conexión.";
          }
          break;
          
        default:
          errorMessage = detailedMessage || error.message;
      }
    }
    
    Swal.fire({
      icon: "error",
      title: errorTitle,
      text: errorMessage,
      timer: 5000,
      showConfirmButton: true,
    });
  }
}, [authFetch, formatearFecha, actualizarDatos]);

  useEffect(() => {
    cargarDatos().catch(() => {}); // Evita warnings de promesas no capturadas
  }, [cargarDatos, reloadTrigger]);


  const handleEdit = useCallback((movimiento: RowData) => {
    setEditando(movimiento);
    setShowEditModal(true);
  }, []);

  const handleUpdate = useCallback(async (movimientoActualizado: RowData) => {
    if (!movimientoActualizado) return;

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

      const movimientoConFecha = {
        ...movimientoActualizado,
        fechaFormateada: formatearFecha(movimientoActualizado.fechaOriginal || movimientoActualizado.fecha)
      };

      const updatedData = fullData.map(item => 
        item.id === movimientoActualizado.id ? movimientoConFecha : item
      );
      
      // Actualizamos los datos usando el hook
      actualizarDatos(updatedData);
      
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
  }, [authFetch, fullData, productosDisponibles, bodegasDisponibles, formatearFecha, actualizarDatos]);

  const closeModal = useCallback(() => {
    setShowEditModal(false);
    setEditando(null);
  }, []);

  return (
    <div>

      <div>
        {mostrarExportar && (
        <div className="export-excel-container" >
          <ExportToExcel 
            data={dataFiltrada}
            filename="movimientos_inventario"
            buttonText="Exportar a Excel"
          />
        </div>
      )}

      </div>

      {mostrarFiltro && (
        <Filtro
          fields={filtrosConfig}
          onSearch={handleBuscar}
          onTextoChange={setFiltroTexto}
          
          

        />
      )}
      
      <DataTable 
        columns={columns} 
        data={dataFiltrada} 
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