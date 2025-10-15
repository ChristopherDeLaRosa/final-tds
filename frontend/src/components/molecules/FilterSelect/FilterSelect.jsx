import { Filter } from 'lucide-react';
import { Label } from '../../atoms';
import { 
  FilterSelectContainer, 
  SelectWithIcon, 
  IconWrapper, 
  StyledSelect 
} from './FilterSelect.styles';

const FilterSelect = ({ label, options, value, onChange, placeholder = "Todos", ...props }) => (
  <FilterSelectContainer>
    {label && <Label>{label}</Label>}
    <SelectWithIcon>
      <IconWrapper>
        <Filter size={16} />
      </IconWrapper>
      <StyledSelect value={value} onChange={(e) => onChange(e.target.value)} {...props}>
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </StyledSelect>
    </SelectWithIcon>
  </FilterSelectContainer>
);

export default FilterSelect;
