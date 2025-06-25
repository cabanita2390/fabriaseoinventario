import React from 'react';
import { ButtonGroup, ButtonContainer, ButtonWrapper, StyledButton } from '../../../styles/Insumos.css';
import { SECCIONES, Tipo } from '../types/InsumosTipe';

interface SeccionBotonesProps {
  onButtonClick: (tipo: Tipo) => void;
}

const SeccionBotones: React.FC<SeccionBotonesProps> = ({ onButtonClick }) => {
  return (
    <ButtonGroup>
      {SECCIONES.map(({ titulo, acciones }) => (
        <ButtonContainer key={titulo}>
          <h3>{titulo}</h3>
          <ButtonWrapper>
            {acciones.map((accion) => (
              <StyledButton
                key={accion}
                onClick={() => onButtonClick(accion as Tipo)}
              >
                {accion.split(' ')[0]}
              </StyledButton>
            ))}
          </ButtonWrapper>
        </ButtonContainer>
      ))}
    </ButtonGroup>
  );
};

export default SeccionBotones;