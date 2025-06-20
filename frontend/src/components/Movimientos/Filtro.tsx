import React, { useState } from 'react';
import { FieldConfig } from '../types/FieldConfig';
import '../../styles/Movimientos/movimientos.css';

interface FiltroProps {
  fields: FieldConfig[];
  onSearch: (values: Record<string, string>) => void;
  onExport?: () => void;
  onTextoChange?: (texto: string) => void;
}

const Filtro: React.FC<FiltroProps> = ({ fields, onSearch, onExport, onTextoChange }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [busqueda, setBusqueda] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  };

  const handleBuscar = () => {
    onSearch(values);
  };

  const handleTextoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBusqueda(value);
    if (onTextoChange) {
      onTextoChange(value);
    }
  };

  return (
  <div className="filtro-container">
    <div className="filtro-header">
      {onExport && (
        <button className="btn-exportar" onClick={onExport}>Exportar CSV</button>
      )}
    </div>

    <div className="filtro-barra">
      {fields.map(({ tipo, id, label, options }) => (
        <div className="campo" key={id}>
          <label htmlFor={id}>{label}:</label>
          {tipo === 'select' && options ? (
            <select id={id} name={id} onChange={handleChange}>
              <option value="">--Seleccione--</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input type={tipo} id={id} name={id} onChange={handleChange} />
          )}
        </div>
      ))}

      <div className="campo campo-busqueda">
        <label htmlFor="busqueda">Buscar:</label>
        <input
          type="text"
          id="busqueda"
          placeholder="Producto, proveedor, etc..."
          value={busqueda}
          onChange={handleTextoChange}
        />
      </div>

      <div className="grupo-botones">
        <button type="button" className="btn-buscar" onClick={handleBuscar}>
          Buscar
        </button>
      </div>
    </div>
  </div>
);


};

export default Filtro;
