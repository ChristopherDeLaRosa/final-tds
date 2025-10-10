export const filterData = (data, searchTerm, searchFields) => {
  if (!searchTerm || !searchFields.length) return data;
  
  return data.filter(item =>
    searchFields.some(field =>
      item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
};

export const paginateData = (data, currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return data.slice(startIndex, startIndex + itemsPerPage);
};

export const calculatePaginationInfo = (data, currentPage, itemsPerPage) => {
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return {
    totalItems,
    totalPages,
    startItem,
    endItem
  };
};
