import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (texto: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = 'Buscar...', className }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query.trim().toLowerCase());
    }, 100); // Debounce para evitar llamadas excesivas

    return () => clearTimeout(handler);
  }, [query, onSearch]);

  return (
    <div className={className}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          padding: '8px',
          width: '100%',
          maxWidth: '300px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
    </div>
  );
};

export default SearchBar;
