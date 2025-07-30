import { useState, useEffect, useCallback } from 'react';
import { RowData } from '../types/Typesmovimientos';

const useFiltroMovimientos = (initialData: RowData[]) => {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtrosAplicados, setFiltrosAplicados] = useState<Record<string, any>>({});
  const [dataFiltrada, setDataFiltrada] = useState<RowData[]>(initialData);
  const [fullData, setFullData] = useState<RowData[]>(initialData);

  const aplicarFiltros = useCallback(() => {
    const { fechaInicio, fechaFin } = filtrosAplicados;
    const texto = filtroTexto.toLowerCase();

    const filtrado = fullData.filter((row) => {
      let pasaFiltro = true;
      
      if (fechaInicio || fechaFin) {
        const fechaOriginal = row.fechaOriginal || row.fecha;
        const itemFecha = new Date(fechaOriginal);
        
        if (!itemFecha || isNaN(itemFecha.getTime())) {
          return false;
        }

        const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : null;
        const fechaFinDate = fechaFin ? new Date(fechaFin) : null;
        
        if (fechaFinDate) {
          fechaFinDate.setHours(23, 59, 59, 999);
        }
        
        if (fechaInicioDate && itemFecha < fechaInicioDate) {
          pasaFiltro = false;
        }
        if (fechaFinDate && itemFecha > fechaFinDate) {
          pasaFiltro = false;
        }
      }

      if (pasaFiltro && texto) {
        const textoMatch = (
          (row.producto?.toLowerCase() || '').includes(texto) ||
          (row.descripcion?.toLowerCase() || '').includes(texto) ||
          (row.proveedor?.toLowerCase() || '').includes(texto) ||
          (row.bodega?.toLowerCase() || '').includes(texto) ||
          (row.tipo?.toLowerCase() || '').includes(texto) 
        );
        if (!textoMatch) {
          pasaFiltro = false;
        }
      }
      
      return pasaFiltro;
    });

    setDataFiltrada(filtrado);
  }, [fullData, filtrosAplicados, filtroTexto]);

  useEffect(() => {
    if (fullData.length > 0) {
      aplicarFiltros();
    }
  }, [fullData, aplicarFiltros]);

  const handleBuscar = useCallback((values: Record<string, any>) => {
    setFiltrosAplicados(values);
  }, []);

  const actualizarDatos = useCallback((nuevosDatos: RowData[]) => {
    setFullData(nuevosDatos);
  }, []);

  return {
    filtroTexto,
    setFiltroTexto,
    filtrosAplicados,
    handleBuscar,
    dataFiltrada,
    actualizarDatos,
    fullData
  };
};

export default useFiltroMovimientos;