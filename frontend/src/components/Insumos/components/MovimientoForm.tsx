import React from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { ModalFooter } from '../../../styles/ui/Modal.css';
import { StyledButton } from '../../../styles/Insumos.css';
import { FormState, Tipo, ProductoAgrupado } from '../types/InsumosTipe';

// Definir constantes para valores por defecto
const DEFAULT_OPTION = "seleccione una opción";
const EMPTY_STRING = "";

interface MovimientoFormProps {
  tipoActual: Tipo;
  isEditMode: boolean;
  form: FormState;
  productosDisponibles: ProductoAgrupado[];
  bodegasDisponibles: { id: number; nombre: string }[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSave: () => Promise<void>;
  onClose: () => void;
  disabled?: boolean; // Prop opcional añadida
}

const MovimientoForm: React.FC<MovimientoFormProps> = ({
  tipoActual, isEditMode, form, productosDisponibles, 
  bodegasDisponibles, onChange, onSave, onClose, disabled = false
}) => {
  // Memoizar opciones para mejor rendimiento
  const productoOptions = React.useMemo(
    () => [DEFAULT_OPTION, ...productosDisponibles.map((p) => p.nombre)],
    [productosDisponibles]
  );

  const bodegaOptions = React.useMemo(
    () => [DEFAULT_OPTION, ...bodegasDisponibles.map((b) => b.nombre)],
    [bodegasDisponibles]
  );

  const presentacionOptions = React.useMemo(() => {
    if (!form.producto?.presentaciones?.length) return [DEFAULT_OPTION];
    return [DEFAULT_OPTION, ...form.producto.presentaciones.map(p => p.nombre)];
  }, [form.producto]);

  // Manejo seguro de valores nulos/undefined
  const getSafeValue = (value: string | undefined | null, fallback = EMPTY_STRING) => 
    value ?? fallback;

  return (
    <Modal onClose={onClose} aria-labelledby="movimiento-form-title">
      <h2 
        id="movimiento-form-title"
        style={{ textAlign: "center", marginBottom: "1rem" }}
      >
        {isEditMode ? `Editar ${tipoActual}` : `Registrar ${tipoActual}`}
      </h2>

      <Select
        label="Producto"
        name="producto"
        value={getSafeValue(form.producto?.nombre, DEFAULT_OPTION)}
        onChange={onChange}
        options={productoOptions}
        disabled={disabled}
        searchable={true}
        aria-required="true"
      />

      <Select
        label="Presentación"
        name="presentacion"
        value={getSafeValue(form.presentacionSeleccionada?.nombre, DEFAULT_OPTION)}
        onChange={onChange}
        options={presentacionOptions}
        disabled={disabled || !form.producto}
        aria-required="true"
      />

      <Input 
        label="Unidad de Medida" 
        value={getSafeValue(form.producto?.unidadMedida?.nombre)} 
        disabled 
      />

      <Input 
        label="Proveedor (opcional)" 
        value={getSafeValue(form.producto?.proveedor?.nombre)} 
        disabled 
      />

      <Input 
        label="Cantidad" 
        name="cantidad" 
        value={form.cantidad} 
        onChange={onChange} 
        type="number" 
        min="0"
        step="0.01"
        disabled={disabled}
        aria-required="true"
      />

      <Input 
        label="" 
        name="fecha" 
        type="hidden" 
        value={form.fecha} 
        disabled 
      />

      <Input 
        label="Descripción" 
        name="descripcion" 
        value={getSafeValue(form.descripcion)} 
        onChange={onChange}
        disabled={disabled}
      />

      <Select
        label="Bodega"
        name="bodega"
        value={getSafeValue(form.bodega, DEFAULT_OPTION)}
        onChange={onChange}
        options={bodegaOptions}
        disabled={disabled}
        aria-required="true"
        searchable={true}
      />

      <ModalFooter>
        <StyledButton 
          onClick={onSave} 
          disabled={disabled}
          aria-busy={disabled}
        >
          {disabled ? "Guardando..." : "Guardar"}
        </StyledButton>
      </ModalFooter>
    </Modal>
  );
};

export default MovimientoForm;