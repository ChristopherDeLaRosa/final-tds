import { useState, useMemo } from 'react';

export const useTableFilters = (data) => {
  const [filters, setFilters] = useState({});

  const filteredData = useMemo(() => {
    let filtered = data;
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        filtered = filtered.filter(item => {
          const itemValue = item[key];
          // Manejar valores booleanos
          if (typeof value === 'boolean') {
            return itemValue === value;
          }
          // Manejar otros tipos
          return itemValue === value;
        });
      }
    });

    return filtered;
  }, [data, filters]);

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value === '' ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    filters,
    filteredData,
    handleFilterChange,
    clearFilters
  };
};
