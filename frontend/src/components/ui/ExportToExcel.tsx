import React from 'react';
import * as XLSX from 'xlsx';
import { RowData } from '../Movimientos/types/Typesmovimientos'; // Ajusta la ruta

interface ExportToExcelProps {
  data: RowData[]; // Usamos el tipo específico
  filename?: string;
  buttonText?: string;
  className?: string;
}

const ExportToExcel: React.FC<ExportToExcelProps> = ({
  data,
  filename = "exported_data",
  buttonText = "Exportar a Excel",
  className = ""
}) => {
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Datos");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  return (
    <button 
      onClick={exportToExcel}
      className={`export-excel-button ${className}`}
    >
      {buttonText}
    </button>
  );
};

export default ExportToExcel;