// src/components/Sidebar/Tooltip.tsx
import React from 'react';
import styled from 'styled-components';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  disabled?: boolean;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const TooltipText = styled.span<{ position?: string }>`
  visibility: hidden;
  width: max-content;
  background-color: ${({ theme }) => theme.colors.primaryDark};
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  border-radius: 6px;
  padding: 5px 10px;
  position: absolute;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
  
  ${({ position }) => {
    switch(position) {
      case 'top':
        return `
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'right':
        return `
          left: 125%;
          top: 50%;
          transform: translateY(-50%);
        `;
      case 'bottom':
        return `
          top: 125%;
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'left':
        return `
          right: 125%;
          top: 50%;
          transform: translateY(-50%);
        `;
      default:
        return `
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
        `;
    }
  }}

  ${TooltipContainer}:hover & {
    visibility: visible;
    opacity: 1;
  }
`;

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  disabled = false, 
  position = 'right' 
}) => {
  if (disabled) return <>{children}</>;

  return (
    <TooltipContainer>
      {children}
      <TooltipText position={position}>
        {content}
      </TooltipText>
    </TooltipContainer>
  );
};