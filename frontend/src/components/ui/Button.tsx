import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { StyledButton } from '../../styles/ui/Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const Button = ({ children, ...props }: ButtonProps) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};

export default Button;
