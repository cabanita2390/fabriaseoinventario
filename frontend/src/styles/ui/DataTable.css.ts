import styled from 'styled-components';

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
`;

export const StyledTable = styled.table`
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(255, 255, 255, 0.05);

  th,
  td {
    padding: 1rem;
    border-bottom: 1px solid #e0e0e0;
    text-align: left;
    white-space: nowrap;
  }

  th {
    background-color: #1b293d;
    font-weight: 520;
    color: #fff;
  }

  tr:last-child td {
    border-bottom: none;
  }

  td:last-child {
    text-align: center;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
  }
`;
