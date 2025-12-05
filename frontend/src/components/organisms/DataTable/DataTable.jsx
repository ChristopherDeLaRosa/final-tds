import { useEffect } from "react";
import { SearchField, FilterSelect, PaginationButtons } from "../../molecules";
import { Text } from "../../atoms";
import { Edit2, Power } from "lucide-react";
import {
  TableContainer,
  TableToolbar,
  FilterControls,
  StyledTable,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  EmptyState,
  LoadingState,
  ActionButtons,
  ActionButton,
} from "./DataTable.styles";
import { useTableSearch, useTableFilters, useTablePagination } from "./hooks";

const DataTable = ({
  data = [],
  columns = [],
  searchFields = [],
  filterOptions = {},
  initialItemsPerPage,
  loading = false,
  emptyMessage = "No se encontraron resultados",
  loadingMessage = "Cargando...",
  onEdit,
  onDelete,
  showActions = true,
  customActions,
}) => {
  const { searchTerm, setSearchTerm, searchedData } = useTableSearch(
    data,
    searchFields
  );
  const { filters, filteredData, handleFilterChange } =
    useTableFilters(searchedData);
  const {
    currentPage,
    itemsPerPage,
    paginatedData,
    paginationInfo,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
  } = useTablePagination(filteredData, initialItemsPerPage);

  useEffect(() => {
    resetPagination();
  }, [searchTerm, ...Object.values(filters)]);

  const tableColumns =
    showActions && (onEdit || onDelete || customActions)
      ? [
          ...columns,
          {
            key: "actions",
            title: "Acciones",
            width: "150px",
            render: (_, row) => (
              <ActionButtons>
                {onEdit && (
                  <ActionButton
                    onClick={() => onEdit(row)}
                    title="Editar"
                    type="edit"
                  >
                    <Edit2 size={18} />
                  </ActionButton>
                )}
                {onDelete && (
                  <ActionButton
                    onClick={() => onDelete(row)}
                    title="Desactivar"
                    type="delete"
                  >
                    <Power size={18} />
                  </ActionButton>
                )}
                {/*Renderizar acciones personalizadas */}
                {customActions && customActions(row)}
              </ActionButtons>
            ),
          },
        ]
      : columns;

  if (loading) {
    return (
      <TableContainer>
        <LoadingState>
          <Text size="16px" color="#666">
            {loadingMessage}
          </Text>
        </LoadingState>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      {/* Header con controles de búsqueda y filtros */}
      <TableToolbar>
        {searchFields.length > 0 && (
          <SearchField
            label="Buscar"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        )}

        {Object.keys(filterOptions).length > 0 && (
          <FilterControls>
            {Object.entries(filterOptions).map(([key, filterConfig]) => (
              <FilterSelect
                key={key}
                label={filterConfig.label || key}
                options={filterConfig.options}
                value={filters[key] || ""}
                onChange={(value) => handleFilterChange(key, value)}
              />
            ))}
          </FilterControls>
        )}
      </TableToolbar>

      {/* Contenido de la tabla */}
      {paginatedData.length === 0 ? (
        <EmptyState>
          <Text size="16px" color="#666">
            {emptyMessage}
          </Text>
        </EmptyState>
      ) : (
        <StyledTable>
          <TableHead>
            <TableRow>
              {tableColumns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  style={{ width: column.width }}
                >
                  {column.title}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id || index}>
                {tableColumns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render
                      ? column.render(row[column.key], row, index)
                      : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      )}

      {/* Footer con paginación */}
      {filteredData.length > 0 && (
        <TableFooter>
          <PaginationButtons
            currentPage={currentPage}
            totalPages={paginationInfo.totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalItems={paginationInfo.totalItems}
            startItem={paginationInfo.startItem}
            endItem={paginationInfo.endItem}
          />
        </TableFooter>
      )}
    </TableContainer>
  );
};

export default DataTable;
