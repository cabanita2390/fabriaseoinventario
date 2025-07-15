import React, { useState, useCallback, useEffect } from 'react';
import Home from '../../components/Home';
import Tabla from "../../components/Movimientos/Tabla";
import { Header } from '../../styles/Insumos.css';
import SeccionBotones from '../../components/Insumos/components/SeccionBotones';
import MovimientoForm from '../../components/Insumos/components/MovimientoForm';
import { useProductos } from '../../components/Insumos/hooks/useProductos';
import { useBodegas } from '../../components/Insumos/hooks/useBodegas';
import { crearMovimientoMateriaPrima } from '../../components/Insumos/api/MovimientosService';
import { obtenerInventarioExistente } from '../../components/Insumos/api/InventarioService';
import { INIT_FORM, Tipo } from '../../components/Insumos/types/InsumosTipe';
import Swal from 'sweetalert2';

function InsumosPage() {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tipoActual, setTipoActual] = useState<Tipo>('Ingreso de materia prima');
  const [form, setForm] = useState(INIT_FORM);
  const [reloadTable, setReloadTable] = useState(0); // Nuevo estado para recargar la tabla
  
  const { productosDisponibles, productosOriginales, cargarProductos } = useProductos(tipoActual);
  const { bodegasDisponibles, cargarBodegas } = useBodegas();

  const handleOpenModal = useCallback((tipo: Tipo, edit = false) => {
    setTipoActual(tipo);
    setIsEditMode(edit);
    setForm({
      ...INIT_FORM,
      tipo,
      fecha: new Date().toISOString().slice(0, 10),
    });
    setShowModal(true);
  }, []);

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

      const tipoMovimiento = tipoActual.toLowerCase().includes('ingreso') ? 'INGRESO' : 'EGRESO';

      if (tipoMovimiento === 'EGRESO' && Number(form.cantidad) <= 0) {
        Swal.fire({ icon: "error", title: "Cantidad inválida", text: "La cantidad para salida debe ser mayor a 0." });
        return;
      }

      if (tipoMovimiento === 'EGRESO') {
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
        tipo: tipoMovimiento,
        cantidad: Number(form.cantidad),
        descripcion: form.descripcion,
        producto_idproducto: productoEspecifico.id,
        bodega_idbodega: bodegaSeleccionada.id
      };

      await crearMovimientoMateriaPrima(payload);

      Swal.fire({ icon: "success", title: "¡Éxito!", text: "El movimiento ha sido guardado correctamente." });
      setShowModal(false);
      setForm(INIT_FORM);
      setReloadTable(prev => prev + 1); // Incrementamos para forzar recarga de la tabla
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un problema al procesar la operación. Por favor, inténtalo nuevamente.",
      });
      console.error("Error al guardar:", error);
    }
  };

  useEffect(() => {
    if (showModal) cargarProductos();
  }, [showModal, cargarProductos]);

  useEffect(() => {
    cargarBodegas();
  }, [cargarBodegas]);

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
          bodegasDisponibles={bodegasDisponibles}
          onChange={handleChange}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setForm(INIT_FORM);
          }}
        />
      )}

      <section>
        <h1 style={{ marginBottom: '20px' }}>Movimientos</h1>
        <Tabla 
          mostrarFiltro={false} 
          mostrarExportar={false} 
          reloadTrigger={reloadTable} // Pasamos la prop
        />
      </section>
    </Home>
  );
}

export default InsumosPage;