import { Button, Text, Select } from '../../atoms';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  PaginationContainer, 
  PaginationControls, 
  PaginationInfo,
  ItemsPerPageContainer 
} from './PaginationButtons.styles';
import { ITEMS_PER_PAGE_OPTIONS } from '../../../constants/tableConstants';


const PaginationButtons = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  startItem,
  endItem 
}) => (
  <PaginationContainer>
    <PaginationControls>
      <Button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        
      >
        {/* Anterior */}
        <ChevronLeft size={18} />
      </Button>
      
      <Text>
        Página {currentPage} de {totalPages}
      </Text>
      
      <Button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        
      >
        {/* Siguiente */}
        <ChevronRight size={18} />

      </Button>
    </PaginationControls>
    
    <ItemsPerPageContainer>
      <Select 
        value={itemsPerPage} 
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
      >
        {ITEMS_PER_PAGE_OPTIONS.map(option => (
          <option key={option} value={option}>
            {option} por página
          </option>
        ))}
      </Select>
    </ItemsPerPageContainer>
    
    <PaginationInfo>
      Mostrando {startItem}-{endItem} de {totalItems} elementos
    </PaginationInfo>
  </PaginationContainer>
);

export default PaginationButtons;