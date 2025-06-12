import React, { useState, useCallback } from 'react';
import Home from '../../components/Home';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Tabla from "../../components/Movimientos/Tabla";
import { ModalFooter } from '../../styles/ui/Modal.css';
import { Header, ButtonGroup, ButtonContainer, ButtonWrapper, StyledButton } from '../../styles/Insumos.css';
import Swal from 'sweetalert2';
import '../../styles/Insumos/Insumos.css';

// Tipado del formulario
interface FormState {
  tipo: string;
  producto: string;
  cantidad: number | "";
  fecha: string;
  descripcion: string;
  unidad: string;
  proveedor?: string; // Opcional
  bodega: string;
}




// Secciones usadas en el header
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

const INIT_FORM: FormState = {
  tipo: "Ingreso",
  producto: "",
  cantidad: "",
  fecha: new Date().toISOString().slice(0, 10),
  descripcion: "",
  unidad: "", // Inicializado como vacío
  proveedor: "",
  bodega: "",
};






type Tipo =
  | 'Ingreso de materia prima'
  | 'Salida de materia prima'
  | 'Ingreso de Envase'
  | 'Salida de Envase'
  | 'Ingreso de Etiqueta'
  | 'Salida de Etiqueta';

function InsumosPage() {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tipoActual, setTipoActual] = useState<Tipo>('Ingreso de materia prima');
  const [form, setForm] = useState<FormState>(INIT_FORM);

  // Función para abrir el modal (nuevo registro o edición)
  const handleOpenModal = useCallback((tipo: Tipo, edit = false) => {
    setTipoActual(tipo);
    setIsEditMode(edit);
    setShowModal(true);

    // Actualizar el tipo y la fecha automáticamente
    setForm((prev) => ({
        ...prev,
        tipo,
        fecha: new Date().toISOString().slice(0, 10) // Captura la fecha actual
    }));
}, []);



  

  const handleChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Si el campo es "cantidad", convertir a número
    setForm((prev) => ({
      ...prev,
      [name]: name === "cantidad" ? Number(value) || "" : value,
    }));
  },
  []
);


  const handleSave = useCallback(() => {
    // Verificar que los campos obligatorios no estén vacíos
    if (!form.producto || form.producto === "seleccione una opcion" || 
        !form.unidad || form.unidad === "seleccione una opcion" ||
        !form.cantidad || 
        !form.bodega || form.bodega === "seleccione una opcion") {
        
        Swal.fire({
            icon: "warning",
            title: "Campos incompletos",
            text: "Por favor, selecciona Producto, Unidad de Medida, Cantidad y Bodega antes de guardar."
        });

        return; // Detener la ejecución si hay campos vacíos
    }

    try {
        // Convertir el formulario a JSON
        const jsonData = JSON.stringify(form, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "mock.json";
        a.click();

        // Alerta de éxito
        Swal.fire({
            icon: "success",
            title: "Guardado",
            text: "El movimiento ha sido guardado exitosamente.",
        });

        setShowModal(false);
        setForm(INIT_FORM);

    } catch (error) {
        // Alerta de error
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un problema al guardar. Por favor, inténtalo nuevamente.",
        });
    }
}, [form]);


  

  return (
    <Home>
      {/* BLOQUE DE BOTONES */}
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

      {/* MODAL */}
      {showModal && (
    <Modal onClose={() => setShowModal(false)}>
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
            {isEditMode ? `Editar ${tipoActual}` : `Registrar ${tipoActual}`}
        </h2>


        <Select
          label="Producto"
          name="producto"
          value={form.producto} // Vacío por defecto, debe seleccionarse manualmente
          onChange={handleChange}
          options={["seleccione una opcion","Producto A", "Producto B"]}
        />

        <Select
            label="Unidad de Medida"
            name="unidad"
            value={form.unidad}
            onChange={handleChange}
            options={["seleccione una opcion", "Litros", "Gramos", "Unidades"]}
        />
        <Input
            label="Cantidad"
            name="cantidad"
            value={form.cantidad}
            onChange={handleChange}
            type="number"
        />
        <Input
            label="Fecha"
            name="fecha"
            value={form.fecha}
            disabled // Se captura automáticamente
        />
        <Input
            label="Descripción"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
        />
        <Select
            label="Unidad de Medida"
            name="unidad"
            value={form.unidad} // Vacío por defecto
            onChange={handleChange}
            options={["seleccione una opcion","Litros", "Gramos", "Unidades"]}
        />

        <Select
            label="Proveedor (Opcional)"
            name="proveedor"
            value={form.proveedor}
            onChange={handleChange}
            options={["seleccione una opcion","Proveedor A", "Proveedor B"]}
        />
        <Select
            label="Bodega"
            name="bodega"
            value={form.bodega}
            onChange={handleChange}
            options={["seleccione una opcion","Bodega 1", "Bodega 2"]}
        />

        <ModalFooter>
            <StyledButton onClick={handleSave}>Guardar</StyledButton>
        </ModalFooter>
    </Modal>
)}

      {/* TABLA */}
      <section>
        <h1>Movimientos</h1>
        <Tabla mostrarFiltro={false} mostrarExportar={false} />
      </section>
    </Home>
  );
}

export default InsumosPage;
