import React, { useState, useEffect } from 'react';
import { FieldConfig, FieldOption } from '../types/FieldConfig'; 
import '../../styles/Movimientos/movimientos.css';

interface FiltroProps {
  fields: FieldConfig[];
  onSearch: (values: Record<string, any>) => void;
  onExport?: () => void;
  onTextoChange?: (texto: string) => void;
  onReset?: () => void;
  initialValues?: Record<string, any>;
  showSearchBar?: boolean; // Nueva prop para controlar visibilidad
}

const Filtro: React.FC<FiltroProps> = ({ 
  fields, 
  onSearch, 
  onExport, 
  onTextoChange, 
  onReset,
  initialValues = {},
  showSearchBar = true // Valor por defecto: true
}) => {
  // Inicializar valores con valores por defecto o valores iniciales
  const initializeValues = () => {
    return fields.reduce((acc, field) => {
      acc[field.id] = initialValues[field.id] || '';
      return acc;
    }, {} as Record<string, any>);
  };
  
  const [values, setValues] = useState<Record<string, any>>(initializeValues());
  const [busqueda, setBusqueda] = useState('');

  // Reiniciar valores cuando cambien los fields
  useEffect(() => {
    setValues(initializeValues());
  }, [fields]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleBuscar = () => {
    // Validar fechas antes de enviar
    if (values.fechaInicio && values.fechaFin) {
      const fechaInicio = new Date(values.fechaInicio);
      const fechaFin = new Date(values.fechaFin);
      
      if (fechaInicio > fechaFin) {
        alert('La fecha de fin debe ser posterior a la fecha de inicio');
        return;
      }
    }
    
    // Convertir las fechas a formato Date para comparación directa
    const filtrosConvertidos = {
      ...values,
      fechaInicio: values.fechaInicio ? new Date(values.fechaInicio) : null,
      fechaFin: values.fechaFin ? new Date(values.fechaFin) : null
    };
    
    onSearch(filtrosConvertidos);
  };

  const handleReset = () => {
    setValues(initializeValues());
    setBusqueda('');
    if (onReset) onReset();
    if (onTextoChange) onTextoChange('');
  };

  const handleTextoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBusqueda(value);
    if (onTextoChange) onTextoChange(value);
  };

  const renderField = (field: FieldConfig) => {
    switch (field.tipo) {
      case 'select':
        return (
          <select 
            id={field.id} 
            name={field.id} 
            value={values[field.id] || ''} 
            onChange={handleChange}
            className="filtro-select"
          >
            <option value="">--Seleccione--</option>
            {field.options?.map((opt) => {
              // Manejar ambos tipos de opciones: string u objeto
              if (typeof opt === 'string') {
                return (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                );
              } else {
                return (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                );
              }
            })}
          </select>
        );
        
      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            name={field.id}
            value={values[field.id] || ''}
            onChange={handleChange}
            className="filtro-date"
          />
        );
        
      case 'custom-date':
        return (
          <input
            type="datetime-local"
            id={field.id}
            name={field.id}
            value={values[field.id] || ''}
            onChange={handleChange}
            className="filtro-date"
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            name={field.id}
            value={values[field.id] || ''}
            onChange={handleChange}
            className="filtro-number"
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );
      
      case 'text':
      default:
        return (
          <input
            type="text"
            id={field.id}
            name={field.id}
            value={values[field.id] || ''}
            onChange={handleChange}
            className="filtro-text"
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <div className="filtro-container">
      <div className="filtro-header">
        {onExport && (
          <button className="btn-exportar" onClick={onExport}>
            <i className="fas fa-file-export"></i> Exportar CSV
          </button>
        )}
      </div>

      <div className="filtro-barra">
        {fields.map((field) => (
          <div className="campo" key={field.id}>
            <label htmlFor={field.id}>{field.label}:</label>
            {renderField(field)}
          </div>
        ))}

        {/* Mostrar la barra de búsqueda solo si showSearchBar es true */}
        {showSearchBar && (
          <div className="campo campo-busqueda">
            <label htmlFor="busqueda">Buscar:</label>
            <input
              type="text"
              id="busqueda"
              placeholder="Producto, proveedor, etc..."
              value={busqueda}
              onChange={handleTextoChange}
              className="filtro-busqueda"
            />
          </div>
        )}

        <div className="grupo-botones">
          <button 
            type="button" 
            className="btn-buscar" 
            onClick={handleBuscar}
          >
            <i className="fas fa-search"></i> Buscar
          </button>
        
        </div>
      </div>
    </div>
  );
};

export default Filtro;