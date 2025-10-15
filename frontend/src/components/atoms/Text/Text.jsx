import React from 'react';
import { StyledText } from './Text.styles';

const Text = ({ children, size, color, weight, ...props }) => {
  return (
    <StyledText size={size} color={color} weight={weight} {...props}>
      {children}
    </StyledText>
  );
};

export default Text;