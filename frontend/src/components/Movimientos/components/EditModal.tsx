import React from 'react';
import styled from 'styled-components'; // Importar styled-components
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import { RowData } from '../types/Typesmovimientos';

interface EditModalProps {
  editando: RowData;
  productosDisponibles: any[];
  bodegasDisponibles: any[];
  onClose: () => void;
  onSave: (movimiento: RowData) => void;
}

// Componentes de botones estilizados
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

const EditModal: React.FC<EditModalProps> = ({ 
  editando, 
  productosDisponibles,
  bodegasDisponibles,
  onClose,
  onSave
}) => {
  const [movimientoEditado, setMovimientoEditado] = React.useState<RowData>(editando);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "producto") {
      const seleccionado = productosDisponibles.find(p => p.nombre === value);
      setMovimientoEditado(prev => ({
        ...prev,
        producto: value,
        unidad: seleccionado?.unidadMedida?.nombre || '',
        proveedor: seleccionado?.proveedor?.nombre || '',
      }));
      return;
    }

    if (name === "bodega") {
      setMovimientoEditado(prev => ({
        ...prev,
        bodega: value,
      }));
      return;
    }

    setMovimientoEditado(prev => ({
      ...prev,
      [name]: name === "cantidad" ? Number(value) : value,
    }));
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      minWidth: '500px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
    }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#1B293D" }}>
        Editar Movimiento
      </h2>
      
      <Select
        label="Tipo"
        name="tipo"
        value={movimientoEditado.tipo}
        onChange={handleChange}
        options={["Entrada", "Salida"]}
      />
      
      <Select 
        label="Producto"
        name="producto"
        value={movimientoEditado.producto || "seleccione una opcion"}
        onChange={handleChange}
        searchable={true}
        options={["seleccione una opcion", ...productosDisponibles.map((p) => p.nombre)]}
      />
      
      <Input 
        label="Cantidad"
        type="number"
        name="cantidad"
        value={movimientoEditado.cantidad.toString()}
        onChange={handleChange}
      />
      
      <Input 
        label="Unidad"
        value={movimientoEditado.unidad}
        disabled={true}
      />
      
      <Input 
        label="Proveedor"
        value={movimientoEditado.proveedor}
        disabled={true}
      />
      
      <Select
        label="Bodega"
        name="bodega"
        value={movimientoEditado.bodega || "seleccione una opcion"}
        onChange={handleChange}
        options={["seleccione una opcion", ...bodegasDisponibles.map((b) => b.nombre)]}
        searchable={true}
      />
      
      <Input 
        label="Fecha"
        type="date"
        name="fecha"
        value={movimientoEditado.fecha}
        onChange={handleChange}
        disabled={true}
      />
      
      <Input
        label="Descripción"
        name="descripcion"
        value={movimientoEditado.descripcion}
        onChange={handleChange}
      />
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <CancelButton onClick={onClose}>
          Cancelar
        </CancelButton>
        <SaveButton onClick={() => onSave(movimientoEditado)}>
          Guardar Cambios
        </SaveButton>
      </div>
    </div>
  );
};

export default EditModal;