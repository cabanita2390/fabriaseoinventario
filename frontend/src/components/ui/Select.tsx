
import React, { SelectHTMLAttributes, useState, useRef, useEffect } from 'react';
import { SelectContainer } from '../../styles/ui/Select.css';

// Definición de tipos
type OptionValue = string | number;

interface BasicOptionType {
  value: OptionValue;
  label: string;
}

interface IdNombreOptionType {
  id: OptionValue;
  nombre: string;
}

type OptionItem = BasicOptionType | IdNombreOptionType | string;

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: OptionItem[];
  placeholder?: string;
  value?: OptionValue;
  searchable?: boolean; // Nueva prop opcional
}

const normalizeOption = (option: OptionItem): BasicOptionType => {
  if (typeof option === 'string') {
    return { value: option, label: option };
  }
  if ('nombre' in option && 'id' in option) {
    return { value: option.id, label: option.nombre };
  }
  return option;
};

const Select = ({ 
  label, 
  options = [], 
  placeholder = 'Elija una opción', 
  value,
  searchable = false, // Por defecto false para mantener compatibilidad
  onChange,
  ...props 
}: SelectProps) => {
  // Generar un ID único para asociar label con el control
  const selectId = useRef(`select-${Math.random().toString(36).substr(2, 9)}`);
  
  // Memoizar normalizedOptions para evitar recálculos innecesarios
  const normalizedOptions = React.useMemo(() => 
    options.map(normalizeOption), 
    [options]
  );
  
  // Estados para el modo búsqueda
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(normalizedOptions);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Encontrar la opción seleccionada para mostrar su label
  const selectedOption = normalizedOptions.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  // Filtrar opciones basado en el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredOptions(normalizedOptions);
    } else {
      const filtered = normalizedOptions.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, normalizedOptions]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionSelect = (optionValue: OptionValue) => {
    setIsOpen(false);
    setSearchTerm('');
    
    if (onChange) {
      // Crear un evento sintético que sea compatible con React.ChangeEvent
      const syntheticEvent = {
        target: {
          value: optionValue as string,
          name: props.name
        },
        currentTarget: {
          value: optionValue as string,
          name: props.name
        },
        nativeEvent: {} as Event,
        bubbles: false,
        cancelable: false,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        preventDefault: () => {},
        isDefaultPrevented: () => false,
        stopPropagation: () => {},
        isPropagationStopped: () => false,
        persist: () => {},
        timeStamp: Date.now(),
        type: 'change'
      } as React.ChangeEvent<HTMLSelectElement>;
      
      onChange(syntheticEvent);
    }
  };

  const handleInputFocus = () => {
    if (searchable) {
      setIsOpen(true);
      setSearchTerm('');
    }
  };

  // Si no es searchable, usar el select nativo original
  if (!searchable) {
    return (
      <SelectContainer>
        <label htmlFor={selectId.current}>{label}</label>
        <select 
          id={selectId.current}
          value={value || ''} 
          onChange={onChange || (() => {})} 
          {...props}
        >
          <option value="">{placeholder}</option>
          {normalizedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </SelectContainer>
    );
  }

  // Render del select con búsqueda
  return (
    <SelectContainer ref={containerRef} style={{ position: 'relative' }}>
      <label htmlFor={selectId.current}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          id={selectId.current}
          type="text"
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={displayValue || placeholder}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
          {...(props as any)} // Aplicar props restantes al input
        />
        
        {/* Dropdown con opciones */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {filteredOptions.length === 0 ? (
              <div style={{ 
                padding: '8px 12px', 
                color: '#666',
                fontStyle: 'italic' 
              }}>
                No se encontraron opciones
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: option.value === value ? '#f0f0f0' : 'transparent',
                    borderBottom: '1px solid #eee'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 
                      option.value === value ? '#f0f0f0' : 'transparent';
                  }}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Input hidden para mantener compatibilidad con formularios */}
      <input
        type="hidden"
        name={props.name}
        value={value || ''}
      />
    </SelectContainer>
  );
};

export default Select;