import React from 'react';
import { StyledSelect } from './Select.styles';

const Select = ({ children, ...props }) => {
  return <StyledSelect {...props}>{children}</StyledSelect>;
};

export default Select;