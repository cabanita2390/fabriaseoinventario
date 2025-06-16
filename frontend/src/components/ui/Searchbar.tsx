import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  data: string[];
  onSearch?: (results: string[]) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ data, onSearch, placeholder = 'Buscar...', className }) => {
  const [query, setQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState<string[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const results = data.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredResults(results);
      onSearch?.(results); // ✅ Retorna los resultados al padre
    }, 300); // Debounce de 300ms

    return () => clearTimeout(handler);
  }, [query, data, onSearch]);

  return (
    <div className={className}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: '8px', width: '200px' }}
      />
      <ul>
        {filteredResults.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};


export default SearchBar;
