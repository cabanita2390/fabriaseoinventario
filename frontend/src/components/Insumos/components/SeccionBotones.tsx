import React from 'react';
import { ButtonGroup, ButtonContainer, ButtonWrapper, StyledButton } from '../../../styles/Insumos.css';
import { SECCIONES, Tipo } from '../types/InsumosTipe';

interface SeccionBotonesProps {
  onButtonClick: (tipo: Tipo) => void;
}

const getButtonText = (accion: string): string => {
  const [firstWord] = accion.split(' ');
  return firstWord || accion; // Fallback por si accion está vacía
};

const SeccionBotones: React.FC<SeccionBotonesProps> = ({ onButtonClick }) => {
  return (
    <ButtonGroup role="group" aria-label="Secciones de insumos">
      {SECCIONES.map(({ titulo, acciones }) => (
        <ButtonContainer key={titulo}>
          <h3>{titulo}</h3>
          <ButtonWrapper>
            {acciones.map((accion) => (
              <StyledButton
                key={accion}
                onClick={() => onButtonClick(accion)}
                aria-label={accion}
              >
                {getButtonText(accion)}
              </StyledButton>
            ))}
          </ButtonWrapper>
        </ButtonContainer>
      ))}
    </ButtonGroup>
  );
};

export default SeccionBotones;