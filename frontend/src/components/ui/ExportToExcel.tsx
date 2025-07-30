import React from 'react';
import * as XLSX from 'xlsx';
import '../../styles/ui/Excelbutton.css';
interface ExportToExcelProps<T> {
  data: T[];
  filename?: string;
  buttonText?: string;
  className?: string;
}

const ExportToExcel = <T extends Record<string, any>>({
  data,
  filename = "exported_data",
  buttonText = "Exportar a Excel",
  className = ""
}: ExportToExcelProps<T>) => {
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