import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const StyledSelect = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  outline: none;
  background: ${theme.colors.white};
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;