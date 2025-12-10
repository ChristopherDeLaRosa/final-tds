import { Filter } from 'lucide-react';
import { Label } from '../../atoms';
import { 
  FilterSelectContainer, 
  SelectWithIcon, 
  IconWrapper, 
  StyledSelect 
} from './FilterSelect.styles';

const FilterSelect = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = "Todos", 
  ...props 
}) => {
  // Si options no es un array, retornar null
  if (!Array.isArray(options)) {
    console.warn('FilterSelect: options debe ser un array');
    return null;
  }

  return (
    <FilterSelectContainer>
      {label && <Label>{label}</Label>}
      <SelectWithIcon>
        <IconWrapper>
          <Filter size={16} />
        </IconWrapper>
        <StyledSelect 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          {...props}
        >
          {options.map((option, index) => (
            <option key={option.value || index} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledSelect>
      </SelectWithIcon>
    </FilterSelectContainer>
  );
};

export default FilterSelect;

