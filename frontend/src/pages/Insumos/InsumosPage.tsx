import React, { useState, useCallback, useEffect } from 'react';
import Home from '../../components/Home';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Tabla from "../../components/Movimientos/Tabla";
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header, ButtonGroup, ButtonContainer, ButtonWrapper, StyledButton } from '../../styles/Insumos.css';
import Swal from 'sweetalert2';

interface Presentacion {
  id: number;
  nombre: string;
}

interface ProductoAgrupado {
  id: number;
  nombre: string;
  tipoProducto: string;
  estado: string;
  unidadMedida?: { id: number; nombre: string };
  proveedor?: { id: number; nombre: string } | null;
  presentaciones: Presentacion[];
}

interface FormState {
  tipo: string;
  producto: ProductoAgrupado | null;
  presentacionSeleccionada: Presentacion | null;
  cantidad: number | "";
  fecha: string;
  descripcion: string;
  bodega: string;
}

interface InventarioItem {
  id: number;
  cantidad_actual: number;
  fechaUltimaActualizacion: string;
  producto: {
    id: number;
  };
  bodega: {
    id: number;
  };
}

// Interfaz para el payload de actualización
interface UpdateInventarioDto {
  cantidad_actual: number;
  fecha_ultima_actualizacion: string;
  producto_idproducto: number;
  bodega_idbodega: number;
}

const SECCIONES = [
  {
    titulo: 'Materia Prima',
    acciones: ['Ingreso de materia prima', 'Salida de materia prima'],
  },
  {
    titulo: 'Envases',
    acciones: ['Ingreso de Envase', 'Salida de Envase'],
  },
  {
    titulo: 'Etiquetas',
    acciones: ['Ingreso de Etiqueta', 'Salida de Etiqueta'],
  },
] as const;

type Tipo =
  | 'Ingreso de materia prima'
  | 'Salida de materia prima'
  | 'Ingreso de Envase'
  | 'Salida de Envase'
  | 'Ingreso de Etiqueta'
  | 'Salida de Etiqueta';

const INIT_FORM: FormState = {
  tipo: "Ingreso",
  producto: null,
  presentacionSeleccionada: null,
  cantidad: "",
  fecha: new Date().toISOString().slice(0, 10),
  descripcion: "",
  bodega: "",
};

const extraerTipoProducto = (texto: string): string => {
  const lower = texto.toLowerCase();
  if (lower.includes("materia prima")) return "MATERIA_PRIMA";
  if (lower.includes("envase")) return "MATERIAL_DE_ENVASE";
  if (lower.includes("etiqueta")) return "ETIQUETAS";
  return "";
};

function InsumosPage() {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tipoActual, setTipoActual] = useState<Tipo>('Ingreso de materia prima');
  const [form, setForm] = useState<FormState>(INIT_FORM);
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoAgrupado[]>([]);
  const [bodegasDisponibles, setBodegasDisponibles] = useState<{ id: number; nombre: string }[]>([]);
  const [productosOriginales, setProductosOriginales] = useState<any[]>([]);
  
  
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

  // Función para obtener inventario existente
  const obtenerInventarioExistente = async (productoId: number, bodegaId: number): Promise<InventarioItem | null> => {
    try {
      const response = await fetch("http://localhost:3000/inventario");
      if (!response.ok) {
        throw new Error("Error al obtener inventario");
      }

      const inventario: InventarioItem[] = await response.json();
      return inventario.find(item => 
        item.producto.id === productoId && 
        item.bodega.id === bodegaId
      ) || null;
    } catch (error) {
      console.error("Error al obtener inventario:", error);
      return null;
    }
  };

  // Función para crear nuevo item de inventario
  const crearInventario = async (productoId: number, bodegaId: number, cantidad: number) => {
    try {
      const payload = {
        cantidad_actual: cantidad,
        fechaUltimaActualizacion: new Date().toISOString(),
        producto: { id: productoId },
        bodega: { id: bodegaId }
      };

      const response = await fetch("http://localhost:3000/inventario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Error al crear inventario");
      }

      return await response.json();
    } catch (error) {
      console.error("Error al crear inventario:", error);
      throw error;
    }
  };

  // Función para actualizar inventario existente (CORREGIDA)
  const actualizarInventario = async (
    inventarioId: number, 
    nuevaCantidad: number,
    productoId: number,
    bodegaId: number
  ) => {
    try {
      const payload: UpdateInventarioDto = {
        cantidad_actual: nuevaCantidad,
        fecha_ultima_actualizacion: new Date().toISOString(),
        producto_idproducto: productoId,
        bodega_idbodega: bodegaId
      };

      const response = await fetch(`http://localhost:3000/inventario/${inventarioId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error al actualizar inventario:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (
      !form.producto ||
      !form.presentacionSeleccionada ||
      !form.cantidad ||
      !form.bodega ||
      form.bodega === "seleccione una opcion"
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, selecciona Producto, Presentación, Cantidad y Bodega antes de guardar.",
      });
      return;
    }

    try {
      // Encontrar el producto original específico basado en nombre y presentación
      const productoEspecifico = productosOriginales.find(p => 
        p.nombre === form.producto?.nombre && 
        p.presentacion.id === form.presentacionSeleccionada?.id
      );

      if (!productoEspecifico) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo encontrar el producto específico.",
        });
        return;
      }

      // Encontrar la bodega seleccionada
      const bodegaSeleccionada = bodegasDisponibles.find(b => b.nombre === form.bodega);

      if (!bodegaSeleccionada) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo encontrar la bodega seleccionada.",
        });
        return;
      }

      // Determinar el tipo de movimiento
      const tipoMovimiento = tipoActual.toLowerCase().includes('ingreso') ? 'INGRESO' : 'EGRESO';

      // Validar cantidad para salidas
      if (tipoMovimiento === 'EGRESO' && Number(form.cantidad) <= 0) {
        Swal.fire({
          icon: "error",
          title: "Cantidad inválida",
          text: "La cantidad para salida debe ser mayor a 0.",
        });
        return;
      }

      // VALIDACIÓN CRÍTICA: Verificar inventario antes de salidas
      if (tipoMovimiento === 'EGRESO') {
        const inventarioExistente = await obtenerInventarioExistente(
          productoEspecifico.id, 
          bodegaSeleccionada.id
        );
        
        if (!inventarioExistente) {
          Swal.fire({
            icon: "error",
            title: "Sin inventario",
            text: "No se puede realizar una salida de un producto que no existe en inventario.",
          });
          return;
        }

        if (inventarioExistente.cantidad_actual < Number(form.cantidad)) {
          Swal.fire({
            icon: "error",
            title: "Stock insuficiente",
            text: `No hay suficiente stock. Stock actual: ${inventarioExistente.cantidad_actual}, cantidad solicitada: ${form.cantidad}`,
          });
          return;
        }
      }

      // Mostrar loading
      Swal.fire({
        title: 'Procesando...',
        text: 'Guardando movimiento y actualizando inventario',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // **SOLUCIÓN PRINCIPAL: Solo crear el movimiento**
      // El backend debería manejar la actualización del inventario automáticamente
      const payload = {
        tipo: tipoMovimiento,
        cantidad: Number(form.cantidad),
        descripcion: form.descripcion,
        producto_idproducto: productoEspecifico.id,
        bodega_idbodega: bodegaSeleccionada.id
      };

      console.log('Payload enviado:', payload);

      const responseMovimiento = await fetch("http://localhost:3000/movimiento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!responseMovimiento.ok) {
        throw new Error("Error al crear el movimiento");
      }

      // **COMENTADO: La actualización manual del inventario**
      // Si el backend ya actualiza el inventario automáticamente cuando se crea un movimiento,
      // no necesitas hacer esto manualmente. Descomenta solo si el backend NO lo hace automáticamente.
      
      /*
      // 2. Actualizar el inventario manualmente
      const inventarioExistente = await obtenerInventarioExistente(
        productoEspecifico.id, 
        bodegaSeleccionada.id
      );

      if (inventarioExistente) {
        // Calcular nueva cantidad
        let nuevaCantidad: number;
        if (tipoMovimiento === 'INGRESO') {
          nuevaCantidad = inventarioExistente.cantidad_actual + Number(form.cantidad);
        } else { // EGRESO
          nuevaCantidad = inventarioExistente.cantidad_actual - Number(form.cantidad);
        }

        await actualizarInventario(
          inventarioExistente.id,
          nuevaCantidad,
          productoEspecifico.id,
          bodegaSeleccionada.id
        );
      } else {
        // Crear nuevo inventario solo para ingresos
        if (tipoMovimiento === 'INGRESO') {
          await crearInventario(productoEspecifico.id, bodegaSeleccionada.id, Number(form.cantidad));
        }
      }
      */

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "El movimiento ha sido guardado correctamente.",
      });

      setShowModal(false);
      setForm(INIT_FORM);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un problema al procesar la operación. Por favor, inténtalo nuevamente.",
      });
      console.error("Error al guardar:", error);
    }
  };

  const cargarProductos = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/producto');
      const data = await res.json();

      // Guardar productos originales para obtener los IDs específicos
      setProductosOriginales(data);

      const agrupados: ProductoAgrupado[] = [];

      for (const producto of data) {
        const existente = agrupados.find(p => p.nombre === producto.nombre);
        if (existente) {
          if (!existente.presentaciones.some(pr => pr.id === producto.presentacion.id)) {
            existente.presentaciones.push(producto.presentacion);
          }
        } else {
          agrupados.push({
            ...producto,
            presentaciones: [producto.presentacion],
          });
        }
      }

      const tipoProducto = extraerTipoProducto(tipoActual);
      const filtrados = agrupados.filter(p => p.tipoProducto === tipoProducto);
      setProductosDisponibles(filtrados);
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  }, [tipoActual]);

  useEffect(() => {
    if (showModal) cargarProductos();
  }, [showModal, cargarProductos]);

  const cargarBodegas = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/bodega');
      const data = await res.json();
      setBodegasDisponibles(data);
    } catch (err) {
      console.error("Error cargando bodegas:", err);
    }
  }, []);

  useEffect(() => {
    cargarBodegas();
  }, [cargarBodegas]);

  return (
    <Home>
      <Header>
        <ButtonGroup>
          {SECCIONES.map(({ titulo, acciones }) => (
            <ButtonContainer key={titulo}>
              <h3>{titulo}</h3>
              <ButtonWrapper>
                {acciones.map((accion) => (
                  <StyledButton
                    key={accion}
                    onClick={() => handleOpenModal(accion as Tipo)}
                  >
                    {accion.split(' ')[0]}
                  </StyledButton>
                ))}
              </ButtonWrapper>
            </ButtonContainer>
          ))}
        </ButtonGroup>
      </Header>

      {showModal && (
        <Modal onClose={() => {
          setShowModal(false);
          setForm(INIT_FORM);
        }}>
          <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
            {isEditMode ? `Editar ${tipoActual}` : `Registrar ${tipoActual}`}
          </h2>

          <Select
            label="Producto"
            name="producto"
            value={form.producto?.nombre || "seleccione una opcion"}
            onChange={handleChange}
            options={["seleccione una opcion", ...productosDisponibles.map((p) => p.nombre)]}
          />

          <Select
            label="Presentación"
            name="presentacion"
            value={form.presentacionSeleccionada?.nombre || "seleccione una opcion"}
            onChange={handleChange}
            options={
              form.producto?.presentaciones.length
                ? ["seleccione una opcion", ...form.producto.presentaciones.map(p => p.nombre)]
                : ["seleccione una opcion"]
            }
          />

          <Input label="Unidad de Medida" value={form.producto?.unidadMedida?.nombre || ""} disabled />
          <Input label="Proveedor (opcional)" value={form.producto?.proveedor?.nombre || ""} disabled />
          <Input label="Cantidad" name="cantidad" value={form.cantidad} onChange={handleChange} type="number" />
          <Input label="" name="fecha" type="hidden" value={form.fecha} disabled />
          <Input label="Descripción" name="descripcion" value={form.descripcion} onChange={handleChange} />

          <Select
            label="Bodega"
            name="bodega"
            value={form.bodega}
            onChange={handleChange}
            options={["seleccione una opcion", ...bodegasDisponibles.map((b) => b.nombre)]}
          />

          <ModalFooter>
            <StyledButton onClick={handleSave}>Guardar</StyledButton>
          </ModalFooter>
        </Modal>
      )}

      <section>
        <h1 style={{ marginBottom: '20px' }}>Movimientos</h1>
        <Tabla mostrarFiltro={false} mostrarExportar={false} />
      </section>
    </Home>
  );
}

export default InsumosPage;