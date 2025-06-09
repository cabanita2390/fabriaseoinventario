import React from 'react';
import { StyledTable, TableWrapper } from '../../styles/ui/DataTable.css';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import styled from 'styled-components';

interface Column {
  header: string;
  accessor: string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  onEdit?: (row: Record<string, any>) => void;
  onDelete?: (row: Record<string, any>) => void;
}

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 0.3rem;
    border-radius: 4px;

    &:hover {
      opacity: 0.8;
    }

    &.edit {
      background-color: #0057d9;
      color: white;
    }

    &.delete {
      background-color: #d90000;
      color: white;
    }
  }
`;

const DataTable = ({ columns, data, onEdit, onDelete }: DataTableProps) => {
  return (
    <TableWrapper>
      <StyledTable>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.accessor}>{col.header}</th>
            ))}
            <th>Modificar / Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} style={{ textAlign: 'center' }}>
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col.accessor}>{row[col.accessor]}</td>
                ))}
                <td>
                  <ActionButtons>
                    <button className="edit" onClick={() => onEdit?.(row)}>
                      <FiEdit size={16} />
                    </button>
                    <button className="delete" onClick={() => onDelete?.(row)}>
                      <FiTrash2 size={16} />
                    </button>
                  </ActionButtons>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
};

export default DataTable;
