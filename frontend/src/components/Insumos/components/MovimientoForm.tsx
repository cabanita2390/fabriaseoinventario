import React, { useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { ModalFooter } from '../../../styles/ui/Modal.css';
import { StyledButton } from '../../../styles/Insumos.css';
import { FormState, Tipo, ProductoAgrupado } from '../types/InsumosTipe';

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
  disabled?: boolean;
  bodegasError?: string;
  error?: string;
}

const MovimientoForm: React.FC<MovimientoFormProps> = ({
  bodegasError, tipoActual, isEditMode, form, productosDisponibles, 
  bodegasDisponibles, onChange, onSave, onClose, disabled = false, error
}) => {


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

  const getSafeValue = (value: string | undefined | null, fallback = EMPTY_STRING) => 
    value ?? fallback;

  const renderError = (message: string | undefined, isBodegaError = false) => {
    if (!message) return null;
    
    return (
      <div style={{ 
        padding: '1rem',
        marginBottom: '1rem',
        backgroundColor: '#ffeeee',
        color: '#ff4444',
        borderRadius: '4px',
        border: '1px solid #ff4444'
      }}>
        {message}
        {isBodegaError && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Contacta al administrador para solicitar acceso
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal onClose={onClose} aria-labelledby="movimiento-form-title">
      <h2 
        id="movimiento-form-title"
        style={{ textAlign: "center", marginBottom: "1rem" }}
      >
        {isEditMode ? `Editar ${tipoActual}` : `Registrar ${tipoActual}`}
      </h2>

      {/* Mostrar errores */}
      {renderError(error)}
      {renderError(bodegasError, true)}

      <Select
        label="Producto"
        name="producto"
        value={getSafeValue(form.producto?.nombre, DEFAULT_OPTION)}
        onChange={onChange}
        options={productoOptions}
        disabled={disabled || !!error}
        searchable={true}
        aria-required="true"
      />

      <Select
        label="Presentación"
        name="presentacion"
        value={getSafeValue(form.presentacionSeleccionada?.nombre, DEFAULT_OPTION)}
        onChange={onChange}
        options={presentacionOptions}
        disabled={disabled || !form.producto || !!error}
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
        disabled={disabled || !!error}
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
        disabled={disabled || !!error}
      />

      <div className="form-field">
        <label>Bodega</label>
        <Select
          label=""
          name="bodega"
          value={getSafeValue(form.bodega, DEFAULT_OPTION)}
          onChange={onChange}
          options={bodegaOptions}
          disabled={disabled || !!bodegasError || !!error}
          aria-required="true"
          searchable={true}
        />
      </div>

      <ModalFooter>
        <StyledButton 
          onClick={onClose}
          style={{ marginRight: '1rem', backgroundColor: '#6c757d' }}
        >
          Cerrar
        </StyledButton>
        <StyledButton 
          onClick={onSave} 
          disabled={disabled || !!error || !!bodegasError}
          aria-busy={disabled}
        >
          {disabled ? "Guardando..." : "Guardar"}
        </StyledButton>
      </ModalFooter>
    </Modal>
  );
};

export default MovimientoForm;