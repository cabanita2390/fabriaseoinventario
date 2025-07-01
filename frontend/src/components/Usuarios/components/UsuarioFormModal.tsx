import React from 'react';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import { ModalFooter } from '../../../styles/ui/Modal.css';
import { Usuario, Rol } from '../types/UsuariosTypes';

interface UsuarioFormModalProps {
  showModal: boolean;
  isLoading: boolean;
  isEditMode: boolean;
  form: Usuario;
  roles: Rol[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

export const UsuarioFormModal: React.FC<UsuarioFormModalProps> = ({
  showModal,
  isLoading,
  isEditMode,
  form,
  roles,
  onChange,
  onSelect,
  onSave,
  onClose
}) => {
  if (!showModal) return null;

  return (
    <Modal onClose={onClose}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        {isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
      </h2>

      <Input 
        label="Username *" 
        name="username" 
        value={form.username} 
        onChange={onChange} 
        disabled={isLoading}
        placeholder="Ingrese el username"
      />
      
      <Input 
        label="Nombre *" 
        name="nombre" 
        value={form.nombre} 
        onChange={onChange} 
        disabled={isLoading}
        placeholder="Ingrese el nombre completo"
      />
      
      <Input 
        label="Email *" 
        name="email" 
        type="email"
        value={form.email} 
        onChange={onChange} 
        disabled={isLoading}
        placeholder="ejemplo@correo.com"
      />
      
      <Input 
        label={isEditMode ? "Nueva Contraseña (opcional)" : "Contraseña *"} 
        name="password" 
        value={form.password || ''} 
        onChange={onChange} 
        type="password"
        disabled={isLoading}
        placeholder={isEditMode ? "Dejar vacío para mantener actual" : "Ingrese contraseña"}
      />

      {roles.length > 0 && (
        <Select 
          label="Rol" 
          name="rol" 
          value={form.rol?.nombre || ''} 
          onChange={onSelect} 
          options={roles.map(r => r.nombre)}
          disabled={isLoading}
          placeholder="Seleccione un rol"
        />
      )}

      <ModalFooter>
        <Button onClick={onSave} disabled={isLoading}>
          {isLoading ? (isEditMode ? 'Actualizando...' : 'Creando...') : (isEditMode ? 'Actualizar' : 'Crear')}
        </Button>
        <Button 
          onClick={onClose} 
          disabled={isLoading}
          style={{ backgroundColor: '#6c757d' }}
        >
          Cancelar
        </Button>
      </ModalFooter>
    </Modal>
  );
};