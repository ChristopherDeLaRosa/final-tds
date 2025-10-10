import React from 'react';
import { Input, Label } from '../../atoms';
import { SearchFieldContainer } from './SearchField.styles';

const SearchField = ({ label, placeholder, value, onChange, ...props }) => (
  <SearchFieldContainer>
    {label && <Label>{label}</Label>}
    <Input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  </SearchFieldContainer>
);

export default SearchField;