import { useState, useMemo } from 'react';
import { paginateData, calculatePaginationInfo } from '../../../../utils/tableHelpers';
import { DEFAULT_ITEMS_PER_PAGE } from '../../../../constants/tableConstants';

export const useTablePagination = (data, initialItemsPerPage = DEFAULT_ITEMS_PER_PAGE) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const paginationInfo = useMemo(() => {
    return calculatePaginationInfo(data, currentPage, itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const paginatedData = useMemo(() => {
    return paginateData(data, currentPage, itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset a la primera página
  };

  // resetea la pagina cuando hay cambios
  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    itemsPerPage,
    paginatedData,
    paginationInfo,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination
  };
};