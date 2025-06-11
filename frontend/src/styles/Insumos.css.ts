import styled from 'styled-components';

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; 
  margin-bottom: 1rem;

  h2 {
    margin: 1rem 0;
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
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