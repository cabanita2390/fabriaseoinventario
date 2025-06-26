import React, { SelectHTMLAttributes } from 'react';
import { SelectContainer } from '../../styles/ui/Select.css';

// Definición de tipos
type OptionValue = string | number;

interface BasicOptionType {
  value: OptionValue;
  label: string;
}

interface IdNombreOptionType {
  id: OptionValue;
  nombre: string;
}

type OptionItem = BasicOptionType | IdNombreOptionType | string;

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: OptionItem[];
  placeholder?: string;
  value?: OptionValue;
}

const normalizeOption = (option: OptionItem): BasicOptionType => {
  if (typeof option === 'string') {
    return { value: option, label: option };
  }
  if ('nombre' in option && 'id' in option) {
    return { value: option.id, label: option.nombre };
  }
  return option;
};

const Select = ({ 
  label, 
  options = [], 
  placeholder = 'Elija una opción', 
  value,
  ...props 
}: SelectProps) => {
  const normalizedOptions = options.map(normalizeOption);
  
  return (
    <SelectContainer>
      <label>{label}</label>
      <select value={value} {...props}>
        <option value="">{placeholder}</option>
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </SelectContainer>
  );
};

export default Select;