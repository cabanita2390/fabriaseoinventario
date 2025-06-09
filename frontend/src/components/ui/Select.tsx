import React, { SelectHTMLAttributes } from 'react';
import { SelectContainer } from '../../styles/ui/Select.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

const Select = ({ label, options = [], ...props }: SelectProps) => (
  <SelectContainer>
    <label>{label}</label>
    <select {...props}>
      {options.map((opt, idx) => (
        <option key={idx} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </SelectContainer>
);

export default Select;
