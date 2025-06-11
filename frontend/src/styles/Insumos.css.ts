import styled from 'styled-components';
import Button from '../components/ui/Button';
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; 
  margin-bottom: 1rem;

  h2 {
    margin: 1rem 0;
  }

`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 0.75rem;
    border: 1px solid #ccc;
    text-align: left;
  }
`;


export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between; /* Los coloca en los extremos */
  gap: 20px; /* Mayor separación entre los grupos */
  width: 100%;
  padding: 10px ;
`;


export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column; /* Mantiene el h3 arriba */
  align-items: center;
  padding: 15px ;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  width: 30%;
  h3 {
    margin-bottom: 10px;
    text-align: center;
  }
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap; /* Mantiene los botones en fila y ajusta en pantallas pequeñas */
`;



export const StyledButton = styled(Button)`
  
  padding: 10px ;
  font-size: 16px;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  border: none;
  background-color: #33c1ff;  
  
`;




