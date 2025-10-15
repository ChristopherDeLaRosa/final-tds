import { Search } from 'lucide-react';
import styled from 'styled-components';
import { InputBar } from '../../atoms/InputBar/InputBar';
import { theme } from '../../../styles/theme';

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.textMuted};
  pointer-events: none;
`;

const SearchInputStyled = styled(InputBar)`
  padding-left: 40px;
`;

export const SearchInput = ({ value, onChange, placeholder = "Search..." }) => (
  <SearchInputWrapper>
    <SearchIcon size={18} />
    <SearchInputStyled
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label="Search menu"
    />
  </SearchInputWrapper>
);

export default SearchInput;