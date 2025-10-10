import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const StyledButton = styled.button`
  padding: ${theme.spacing.sm};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.active ? theme.colors.primary : theme.colors.white};
  color: ${props => props.active ? theme.colors.white : theme.colors.text};
  cursor: pointer;
  font-size: ${theme.fontSize.sm};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? theme.colors.primaryHover : theme.colors.light};
    border-color: ${props => props.active ? theme.colors.primaryHover : theme.colors.primary};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    display: block;
  }
`;
