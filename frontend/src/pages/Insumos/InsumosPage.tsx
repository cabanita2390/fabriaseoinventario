import React, { useState, useCallback, useEffect, useRef } from 'react';
import Home from '../../components/Home';
import Tabla from "../../components/Movimientos/Tabla";
import { Header } from '../../styles/Insumos.css';
import SeccionBotones from '../../components/Insumos/components/SeccionBotones';
import MovimientoForm from '../../components/Insumos/components/MovimientoForm';
import { useProductos } from '../../components/Insumos/hooks/useProductos';
import { useBodegas } from '../../components/Insumos/hooks/useBodegas';
import { crearMovimiento } from '../../components/Insumos/api/MovimientosService';
import { obtenerInventarioExistente } from '../../components/Insumos/api/InventarioService';
import { INIT_FORM, Tipo } from '../../components/Insumos/types/InsumosTipe';
import Swal from 'sweetalert2';

function InsumosPage() {
  // State declarations
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tipoActual, setTipoActual] = useState<Tipo>('Ingreso de materia prima');
  const [form, setForm] = useState(INIT_FORM);
  const [reloadTable, setReloadTable] = useState(0);
  
  // Refs
  const errorShownRef = useRef(false);
  const permissionErrorRef = useRef(false);

  // Custom hooks
  const { 
    productosDisponibles, 
    productosOriginales, 
    cargarProductos,
    loading: loadingProductos,
    error: errorProductos,
    hasPermission: hasProductPermission 
  } = useProductos(tipoActual);
  
  const {  
    bodegasDisponibles,  
    cargarBodegas, 
    loading: loadingBodegas,
    hasPermission: hasBodegaPermission,
    permissionDenied 
  } = useBodegas({maxRetries: 3, autoLoad: true});

  // Permission check
  const hasPermission = hasProductPermission && hasBodegaPermission;

  // Handlers
  const handleOpenModal = useCallback((tipo: Tipo, edit = false) => {
    if (tipo !== tipoActual) {
      setForm(prev => ({
        ...prev,
        producto: null,
        presentacionSeleccionada: null,
        bodega: ""
      }));
      setTipoActual(tipo);
      cargarProductos(); // Forzar recarga de productos
    }
    setIsEditMode(edit);
    setForm({
      ...INIT_FORM,
      tipo,
      fecha: new Date().toISOString().slice(0, 10),
    });
    setShowModal(true);
  }, [tipoActual, cargarProductos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "producto") {
      const seleccionado = productosDisponibles.find(p => p.nombre === value);
      setForm(prev => ({
        ...prev,
        producto: seleccionado || null,
        presentacionSeleccionada: seleccionado?.presentaciones[0] || null,
      }));
      return;
    }

    if (name === "presentacion") {
      const nueva = form.producto?.presentaciones.find(p => p.nombre === value);
      setForm(prev => ({
        ...prev,
        presentacionSeleccionada: nueva || null,
      }));
      return;
    }

    setForm(prev => ({
      ...prev,
      [name]: name === "cantidad" ? Number(value) || "" : value,
    }));
  };

  const handleSave = async () => {
    if (!form.producto || !form.presentacionSeleccionada || !form.cantidad || !form.bodega || form.bodega === "seleccione una opcion") {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, selecciona Producto, Presentación, Cantidad y Bodega antes de guardar.",
      });
      return;
    }

    try {
      const productoEspecifico = productosOriginales.find(p => 
        p.nombre === form.producto?.nombre && 
        p.presentacion.id === form.presentacionSeleccionada?.id
      );

      if (!productoEspecifico) {
        Swal.fire({ icon: "error", title: "Error", text: "No se pudo encontrar el producto específico." });
        return;
      }

      const bodegaSeleccionada = bodegasDisponibles.find(b => b.nombre === form.bodega);
      if (!bodegaSeleccionada) {
        Swal.fire({ icon: "error", title: "Error", text: "No se pudo encontrar la bodega seleccionada." });
        return;
      }

      // Determinar el tipo de movimiento para la API
      let tipoMovimientoAPI: 'materia-prima' | 'material-envase' | 'etiquetas';
      
      if (tipoActual.toLowerCase().includes('materia prima')) {
        tipoMovimientoAPI = 'materia-prima';
      } else if (tipoActual.toLowerCase().includes('envase')) {
        tipoMovimientoAPI = 'material-envase';
      } else if (tipoActual.toLowerCase().includes('etiqueta')) {
        tipoMovimientoAPI = 'etiquetas';
      } else {
        throw new Error('Tipo de movimiento no reconocido');
      }

      const tipoOperacion = tipoActual.toLowerCase().includes('ingreso') ? 'INGRESO' : 'EGRESO';

      if (tipoOperacion === 'EGRESO' && Number(form.cantidad) <= 0) {
        Swal.fire({ icon: "error", title: "Cantidad inválida", text: "La cantidad para salida debe ser mayor a 0." });
        return;
      }

      if (tipoOperacion === 'EGRESO') {
        const inventarioExistente = await obtenerInventarioExistente(
          productoEspecifico.id, 
          bodegaSeleccionada.id
        );
        
        if (!inventarioExistente) {
          Swal.fire({ icon: "error", title: "Sin inventario", text: "No se puede realizar una salida de un producto que no existe en inventario." });
          return;
        }

        if (inventarioExistente.cantidad_actual < Number(form.cantidad)) {
          Swal.fire({ 
            icon: "error", 
            title: "Stock insuficiente", 
            text: `No hay suficiente stock. Stock actual: ${inventarioExistente.cantidad_actual}, cantidad solicitada: ${form.cantidad}` 
          });
          return;
        }
      }

      Swal.fire({
        title: 'Procesando...',
        text: 'Guardando movimiento y actualizando inventario',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      const payload = {
        tipo: tipoOperacion,
        cantidad: Number(form.cantidad),
        descripcion: form.descripcion,
        producto_idproducto: productoEspecifico.id,
        bodega_idbodega: bodegaSeleccionada.id
      };

      await crearMovimiento(tipoMovimientoAPI, payload);

      Swal.fire({ icon: "success", title: "¡Éxito!", text: "El movimiento ha sido guardado correctamente." });
      setShowModal(false);
      setForm(INIT_FORM);
      setReloadTable(prev => prev + 1);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un problema al procesar la operación. Por favor, inténtalo nuevamente.",
      });
      console.error("Error al guardar:", error);
    }
  };

  // Effects
  useEffect(() => {
    const hasPermissionError = permissionDenied || 
                             (errorProductos && errorProductos.includes('No tienes permisos'));
    
    if (hasPermissionError && !permissionErrorRef.current) {
      permissionErrorRef.current = true;
      
      let errorMessage = permissionDenied
        ? 'No tienes permisos para acceder a las bodegas. Contacta al administrador.'
        : 'No tienes permisos para acceder a los productos. Contacta al administrador.';

      if (!errorShownRef.current) {
        errorShownRef.current = true;
        
        Swal.fire({
          icon: 'error',
          title: 'Permisos insuficientes',
          text: errorMessage,
          confirmButtonText: 'Entendido',
          allowOutsideClick: false
        }).then(() => {
          errorShownRef.current = false;
        });
      }
    } else if (!hasPermissionError) {
      permissionErrorRef.current = false;
    }
  }, [errorProductos, permissionDenied]);

  useEffect(() => {
    if (showModal && hasProductPermission) {
      cargarProductos();
    }
  }, [showModal, hasProductPermission, tipoActual, cargarProductos]);

  useEffect(() => {
    if (hasBodegaPermission && !bodegasDisponibles.length && !loadingBodegas) {
      const timer = setTimeout(() => cargarBodegas(), 200);
      return () => clearTimeout(timer);
    }
  }, [hasBodegaPermission, bodegasDisponibles.length, loadingBodegas, cargarBodegas]);

  return (
    <Home>
      <Header>
        <SeccionBotones onButtonClick={handleOpenModal} />
      </Header>

      {showModal && (
        <MovimientoForm
          tipoActual={tipoActual}
          isEditMode={isEditMode}
          form={form}
          productosDisponibles={productosDisponibles}
          bodegasDisponibles={hasBodegaPermission ? bodegasDisponibles : []}
          onChange={handleChange}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setForm(INIT_FORM);
          }}
          disabled={!hasPermission || loadingBodegas || loadingProductos}
          bodegasError={!hasBodegaPermission ? 
            "No tienes permisos para acceder a las bodegas" : 
            undefined
          }
          error={errorProductos ? errorProductos : undefined}
        />
      )}

      <section>
        <h1 style={{ marginBottom: '20px' }}>Movimientos</h1>
        <Tabla 
          mostrarFiltro={false} 
          mostrarExportar={false} 
          reloadTrigger={reloadTable}
        />
      </section>
    </Home>
  );
}

export default InsumosPage;