import { useState, useMemo } from 'react';
import { useDebounce } from '../../../../hooks/useDebounce';
import { filterData } from '../../../../utils/tableHelpers';
import { DEBOUNCE_DELAY } from '../../../../constants/tableConstants';

export const useTableSearch = (data, searchFields) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY);

  const searchedData = useMemo(() => {
    return filterData(data, debouncedSearchTerm, searchFields);
  }, [data, debouncedSearchTerm, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    searchedData
  };
};