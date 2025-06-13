import styled from 'styled-components';
import Button from '../components/ui/Button';
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

/* --- Agrupadores de botones --- */
export const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px; /* separación entre cada Card */
  justify-content: space-between;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

export const ButtonContainer = styled.article`
  flex: 1 1 30%;       /* crece, encoge, base 30% */
  min-width: 250px;    /* evita que se encoja demasiado */
  background: #f9f9f9;
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;       /* Usa flex para organizar el contenido */
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  h3 {
    margin: 0;
    text-align: center;
  }
`;

/* Contenedor específico para los botones */
export const ButtonWrapper = styled.div`
  display: flex;             /* define un contenedor flexible */
  flex-direction: row;       /* alinea los elementos en fila horizontal */
  flex-wrap: nowrap;         /* con ellos en la misma línea */
  gap: 10px;                 /* espacio entre botones */
  justify-content: center;   /* centra el grupo en el contenedor */
`;


export const StyledButton = styled(Button)`
  padding: 10px 16px;
  font-size: 0.95rem;
  border-radius: 5px;
  background: #33c1ff;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background 0.25s;

  /* Evita que el botón se expanda */
  width: auto;
  flex: 0 0 auto;

  &:hover {
    background: #25a4de;
  }
  &:disabled {
    background: #b0dffc;
    cursor: not-allowed;
  }
`;
