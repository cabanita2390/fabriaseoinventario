import React, { useState, useMemo } from 'react';
import { StyledTable, TableWrapper } from '../../styles/ui/DataTable.css';
import { FiEdit, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styled from 'styled-components';

interface Column {
  header: string;
  accessor: string;
}

interface DataTableProps<T extends object> {
  columns: Column[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
}

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;

  button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 0.4rem;
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

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  background-color: #0057d9;
  border: 1px solid #dee2e6;
  color:rgb(248, 248, 248);
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 35px;
  height: 35px;

  &:hover:not(:disabled) {
    background-color:rgb(64, 122, 208);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background-color: #0057d9;
    color: white;
    border-color: #0057d9;
  }
`;

const ItemsPerPageSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  label {
    font-size: 0.9rem;
    color: #495057;
  }

  select {
    padding: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #0057d9;
    }
  }
`;

const PaginationInfo = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
`;

const DataTable = <T extends object>({
  columns,
  data,
  onEdit,
  onDelete,
  itemsPerPageOptions = [5, 10, 25, 50],
  defaultItemsPerPage = 10
}: DataTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  // Calcular datos paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  // Calcular información de paginación
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startItem = data.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, data.length);



  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Manejar cambio de elementos por página
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Resetear a la primera página
  };

  return (
    <>
      <TableWrapper>
        <StyledTable>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.accessor}>{col.header}</th>
              ))}
              {(onEdit || onDelete) && <th className="action-header">Modificar / Eliminar</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} style={{ textAlign: 'center' }}>
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr key={index}>
                  {columns.map((col) => (
                    <td key={col.accessor}>{(row as any)[col.accessor]}</td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td>
                      <ActionButtons>
                        {onEdit && (
                          <button className="edit" onClick={() => onEdit(row)}>
                            <FiEdit size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button className="delete" onClick={() => onDelete(row)}>
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </ActionButtons>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </StyledTable>
      </TableWrapper>

      {/* Controles de paginación */}
      {data.length > 0 && (
        <PaginationWrapper>
          <ItemsPerPageSelector>
            <label>Mostrar:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span>elementos por página</span>
          </ItemsPerPageSelector>

          <PaginationInfo>
            Mostrando {startItem} a {endItem} de {data.length} elementos
          </PaginationInfo>

          <PaginationControls>
            <PaginationButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FiChevronLeft size={16} />
            </PaginationButton>

            <span style={{ padding: '0 1rem', fontSize: '0.9rem', color: '#495057' }}>
              Página {currentPage} de {totalPages}
            </span>

            <PaginationButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight size={16} />
            </PaginationButton>
          </PaginationControls>
        </PaginationWrapper>
      )}
    </>
  );
};

export default DataTable;