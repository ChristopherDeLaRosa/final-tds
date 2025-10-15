import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const StyledButton = styled.button`
  padding: ${theme.spacing.sm};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  border: 1px solid ${props => props.active ? theme.colors.accent : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.active ? theme.colors.accent : theme.colors.bgDark};
  color: ${theme.colors.text};
  cursor: pointer;
  font-size: ${theme.fontSize.sm};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? theme.colors.accentHover : theme.colors.bgHover};
    border-color: ${props => props.active ? theme.colors.accentHover : theme.colors.accent};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(79, 140, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    display: block;
  }
`;
