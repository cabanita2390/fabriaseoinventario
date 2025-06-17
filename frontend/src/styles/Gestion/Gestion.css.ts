import styled from 'styled-components';
import Button from '../../components/ui/Button';

export const Header = styled.header`
  display: flex;
  justify-content: flex-end; /* Alinea todo a la derecha */
  align-items: center;
  width: 100%;
  margin-bottom: 1rem;
  gap: 1rem; /* Espacio entre botones */
`;

export const BackButton = styled(Button)`
  background-color: #1B293D;
  display: flex;
  align-items: center;
  &:hover {
    background-color: #33c1ff;
  }
`;