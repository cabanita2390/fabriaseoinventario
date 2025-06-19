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
  | ''
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
  if (
    !form.producto ||
    !form.cantidad ||
    !form.bodega ||
    form.bodega === "seleccione una opcion"
  ) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Por favor, selecciona Producto, Cantidad y Bodega antes de guardar.",
    });
    return;
  }

  try {
    const payload = {
      tipo: form.tipo,
      producto: form.producto.nombre,
      presentacion: form.presentacionSeleccionada?.nombre || "",
      unidad: form.producto.unidadMedida?.nombre || "",
      proveedor: form.producto.proveedor?.nombre || "",
      cantidad: form.cantidad,
      fecha: form.fecha,
      descripcion: form.descripcion,
      bodega: form.bodega,
    };

    const response = await fetch("http://localhost:3000/movimientos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Error en el servidor");
    }

    Swal.fire({
      icon: "success",
      title: "Guardado",
      text: "El movimiento ha sido guardado exitosamente.",
    });

    setShowModal(false);
    setForm(INIT_FORM);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Hubo un problema al guardar. Por favor, inténtalo nuevamente.",
    });
    console.error("Error al guardar:", error);
  }
};


  const cargarProductos = useCallback(async () => {
  try {
    const res = await fetch('http://localhost:3000/producto');
    const data = await res.json();

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

// 2. cargarBodegas también con useCallback (opcional pero consistente)
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


  useEffect(() => {
    const cargarBodegas = async () => {
      try {
        const res = await fetch('http://localhost:3000/bodega');
        const data = await res.json();
        setBodegasDisponibles(data);
      } catch (err) {
        console.error("Error cargando bodegas:", err);
      }
    };

    cargarBodegas();
  }, []);

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