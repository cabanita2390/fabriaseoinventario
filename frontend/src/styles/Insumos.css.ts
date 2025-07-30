import styled from 'styled-components';
import Button from '../components/ui/Button';

// Definir la interfaz para las props extendidas del botón
interface StyledButtonProps {
  $noAutorizado?: boolean;
}

export const Home = styled.main`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const Header = styled.header`
  margin-bottom: 2rem;
  width: 100%;
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
  margin-top: 10px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

export const ButtonContainer = styled.article`
  flex: 1 1 30%;
  min-width: 250px;
  background: #f9f9f9;
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  h3 {
    margin: 0;
    text-align: center;
  }
`;

export const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 10px;
  justify-content: center;
`;

export const StyledButton = styled(Button)<StyledButtonProps>`
  padding: 10px 16px;
  font-size: 0.95rem;
  border-radius: 5px;
  background: ${({ $noAutorizado }) => $noAutorizado ? '#ffcccc' : '#33c1ff'};
  color: ${({ $noAutorizado }) => $noAutorizado ? '#990000' : '#fff'};
  border: none;
  cursor: ${({ $noAutorizado }) => $noAutorizado ? 'not-allowed' : 'pointer'};
  transition: all 0.25s;
  width: auto;
  flex: 0 0 auto;
  position: relative;

  &:hover {
    background: ${({ $noAutorizado }) => $noAutorizado ? '#ffcccc' : '#25a4de'};
  }

  &:disabled {
    background: #b0dffc;
    cursor: not-allowed;
  }

  .tooltip {
    visibility: hidden;
    width: 120px;
    background-color: #555;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover .tooltip {
    visibility: ${({ $noAutorizado }) => $noAutorizado ? 'visible' : 'hidden'};
    opacity: ${({ $noAutorizado }) => $noAutorizado ? 1 : 0};
  }
`;