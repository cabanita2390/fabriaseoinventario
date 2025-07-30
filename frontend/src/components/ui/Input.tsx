import React, { InputHTMLAttributes } from 'react';
import { InputContainer } from '../../styles/ui/Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name?: string; // Hacer name opcional
}
const Input = ({ label, name, ...props }: InputProps) => {
  const inputId = `input-${name}`; // genera id único por campo

  return (
    <InputContainer>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} name={name} {...props} />
    </InputContainer>
  );
};

export default Input;
