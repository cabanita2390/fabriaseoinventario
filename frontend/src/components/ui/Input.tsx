import React, { InputHTMLAttributes } from 'react';
import { InputContainer } from '../../styles/ui/Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = ({ label, ...props }: InputProps) => (
  <InputContainer>
    <label>{label}</label>
    <input {...props} />
  </InputContainer>
);

export default Input;
