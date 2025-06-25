import React from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { ModalFooter } from '../../../styles/ui/Modal.css';
import { StyledButton } from '../../../styles/Insumos.css';
import { FormState, Tipo, ProductoAgrupado } from '../types/InsumosTipe';

interface MovimientoFormProps {
  tipoActual: Tipo;
  isEditMode: boolean;
  form: FormState;
  productosDisponibles: ProductoAgrupado[];
  bodegasDisponibles: { id: number; nombre: string }[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSave: () => Promise<void>;
  onClose: () => void;
}

const MovimientoForm: React.FC<MovimientoFormProps> = ({
  tipoActual, isEditMode, form, productosDisponibles, 
  bodegasDisponibles, onChange, onSave, onClose
}) => {
  return (
    <Modal onClose={onClose}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        {isEditMode ? `Editar ${tipoActual}` : `Registrar ${tipoActual}`}
      </h2>

      <Select
        label="Producto"
        name="producto"
        value={form.producto?.nombre || "seleccione una opcion"}
        onChange={onChange}
        options={["seleccione una opcion", ...productosDisponibles.map((p) => p.nombre)]}
      />

      <Select
        label="Presentación"
        name="presentacion"
        value={form.presentacionSeleccionada?.nombre || "seleccione una opcion"}
        onChange={onChange}
        options={
          form.producto?.presentaciones.length
            ? ["seleccione una opcion", ...form.producto.presentaciones.map(p => p.nombre)]
            : ["seleccione una opcion"]
        }
      />

      <Input label="Unidad de Medida" value={form.producto?.unidadMedida?.nombre || ""} disabled />
      <Input label="Proveedor (opcional)" value={form.producto?.proveedor?.nombre || ""} disabled />
      <Input label="Cantidad" name="cantidad" value={form.cantidad} onChange={onChange} type="number" />
      <Input label="" name="fecha" type="hidden" value={form.fecha} disabled />
      <Input label="Descripción" name="descripcion" value={form.descripcion} onChange={onChange} />

      <Select
        label="Bodega"
        name="bodega"
        value={form.bodega}
        onChange={onChange}
        options={["seleccione una opcion", ...bodegasDisponibles.map((b) => b.nombre)]}
      />

      <ModalFooter>
        <StyledButton onClick={onSave}>Guardar</StyledButton>
      </ModalFooter>
    </Modal>
  );
};

export default MovimientoForm;