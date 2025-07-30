import React from 'react';
import { ButtonGroup, ButtonContainer, ButtonWrapper, StyledButton } from '../../../styles/Insumos.css';
import { SECCIONES, Tipo, RolUsuario, PERMISOS_POR_ROL } from '../types/InsumosTipe';

interface SeccionBotonesProps {
  onButtonClick: (tipo: Tipo) => void;
}

const decodeToken = (token: string): { rol?: RolUsuario } | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
};

const getButtonText = (accion: Tipo): string => accion.split(' ')[0] || accion;

const SeccionBotones: React.FC<SeccionBotonesProps> = ({ onButtonClick }) => {
  const token = localStorage.getItem('authToken');
  const decodedToken = token ? decodeToken(token) : null;
  const userRole = decodedToken?.rol || 'USUARIO';

  const filteredSecciones = SECCIONES.map(seccion => {
    // Convertir a array mutable y tipar explícitamente
    const accionesArray: Tipo[] = [...seccion.acciones];
    
    const accionesPermitidas = accionesArray.filter((accion: Tipo) => 
      PERMISOS_POR_ROL[userRole as RolUsuario]?.includes(accion)
    );

    return {
      ...seccion,
      acciones: accionesPermitidas
    };
  }).filter(seccion => seccion.acciones.length > 0);

  return (
    <ButtonGroup role="group" aria-label="Secciones de insumos">
      {SECCIONES.map(({ titulo, acciones }) => {
        const seccionFiltrada = filteredSecciones.find(s => s.titulo === titulo);
        
        return (
          <ButtonContainer key={titulo}>
            <h3>{titulo}</h3>
            <ButtonWrapper>
              {acciones.map((accion: Tipo) => {
                const estaPermitido = PERMISOS_POR_ROL[userRole as RolUsuario]?.includes(accion);
                return (
                  <StyledButton
                    key={accion}
                    onClick={() => estaPermitido && onButtonClick(accion)}
                    aria-label={accion}
                    $noAutorizado={!estaPermitido}
                    disabled={!estaPermitido}
                  >
                    {getButtonText(accion)}
                    {!estaPermitido && (
                      <span className="tooltip">
                        No tienes permiso para esta acción
                      </span>
                    )}
                  </StyledButton>
                );
              })}
            </ButtonWrapper>
          </ButtonContainer>
        );
      })}
    </ButtonGroup>
  );
};

export default SeccionBotones;