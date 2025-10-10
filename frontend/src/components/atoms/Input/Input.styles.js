import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const InputWrapper = styled.div`
  position: relative;
  width: 94%;
`;

export const StyledInput = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  padding-left: 2.5rem; /* espacio para el ícono */
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  outline: none;
  transition: all 0.2s ease;
  width: 100%;

  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

export const IconWrapper = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${theme.colors.textMuted}; /* mismo color que el placeholder */
  display: flex;
  align-items: center;
  justify-content: center;
`;
