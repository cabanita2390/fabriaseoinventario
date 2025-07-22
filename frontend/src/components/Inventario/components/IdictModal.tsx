import React from 'react';
import styled from 'styled-components';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import { InventarioItem, Bodega } from '../types/inventarioTypes';

interface EditModalProps {
  item: InventarioItem;
  bodegas: Bodega[];
  onClose: () => void;
  onSave: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ModalContainer = styled.div`
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  min-width: 500px;
`;

const ModalTitle = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1B293D;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  gap: 0.75rem;
`;

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

  &:hover {
    background-color: #d32f2f;
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
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
`;

const EditModal: React.FC<EditModalProps> = ({ item, bodegas, onClose, onSave, onChange }) => (
  <ModalContainer>
    <ModalTitle>Editar Inventario</ModalTitle>
    
    <Input 
      name='Nombre'
      label="Nombre"
      value={item.nombre}
      onChange={() => {}}
      disabled={true}
    />
    
    <Input 
      name='Tipo'
      label="Tipo"
      value={item.tipo}
      onChange={() => {}}
      disabled={true}
    />
    
    <Input 
      name='Presentación'
      label="Presentación"
      value={item.presentacion}
      onChange={() => {}}
      disabled={true}
    />
    
    <Input 
      name="unidad_medida"
      label="Unidad de Medida"
      value={item.unidad_medida}
      onChange={() => {}}
      disabled={true}
    />

    
    <Input 
      label="Cantidad Actual"
      type="number"
      name="cantidad_actual"
      value={item.cantidad_actual}
      onChange={onChange}
    />
    
    <Select
      label="Bodega"
      name="bodega"
      value={item.bodega || "seleccione una opcion"}
      onChange={onChange}
      options={["seleccione una opcion", ...bodegas.map((b) => b.nombre)]}
    />
    
    <Input 
      name="fechaUltimaActualizacion"
      label="Última Actualización"
      value={item.fechaUltimaActualizacion}
      onChange={() => {}}
      disabled={true}
    />
    
    <ButtonContainer>
      <CancelButton onClick={onClose}>
        Cancelar
      </CancelButton>
      <SaveButton onClick={onSave}>
        Guardar Cambios
      </SaveButton>
    </ButtonContainer>
  </ModalContainer>
);

export default EditModal;