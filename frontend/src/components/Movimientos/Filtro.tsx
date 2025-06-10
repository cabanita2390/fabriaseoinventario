import React, { useState } from 'react';
import { FieldConfig } from '../types/FieldConfig';
import '../../styles/Movimientos/movimientos.css';

interface FiltroProps {
  fields: FieldConfig[];
  onSearch: (values: Record<string, string>) => void;
  onExport?: () => void;
}

const Filtro: React.FC<FiltroProps> = ({ fields, onSearch, onExport }) => {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = () => {
    onSearch(values);
  };

  return (
    <div>
      {onExport && (
        <div className="exportbotton">
          <button onClick={onExport}>Exportar</button>
        </div>
      )}

      <div className="filtrofechas">
        {fields.map(({ tipo, id, label, options }) => (
          <div key={id} style={{ marginBottom: '10px' }}>
            <label htmlFor={id}>{label}:</label>
            {tipo === 'select' && options ? (
              <select id={id} name={id} onChange={handleChange}>
                <option value="">--Seleccione--</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={tipo}
                id={id}
                name={id}
                onChange={handleChange}
              />
            )}
          </div>
        ))}

        <button type="button" onClick={handleSearch}>
          Buscar
        </button>
      </div>
    </div>
  );
};

export default Filtro;