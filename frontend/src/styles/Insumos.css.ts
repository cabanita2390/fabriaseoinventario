import styled from 'styled-components';

export const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 1.5rem;
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