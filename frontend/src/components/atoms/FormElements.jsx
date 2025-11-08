import styled from 'styled-components';
import { theme } from '../../styles';

// Form Container
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

// Form Group
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

// Form Row (para campos lado a lado)
export const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || 'repeat(auto-fit, minmax(150px, 1fr))'};
  gap: ${theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Label
export const Label = styled.label`
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  ${props => props.required && `
    &::after {
      content: '*';
      color: #ef4444;
      font-weight: 600;
    }
  `}
`;

// Input
export const Input = styled.input`
  padding: ${theme.spacing.md};
  background: ${theme.colors.bg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
  transition: ${theme.transition};
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${theme.colors.bgHover};
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }

  ${props => props.error && `
    border-color: #ef4444;
    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}
`;

// Textarea
export const Textarea = styled.textarea`
  padding: ${theme.spacing.md};
  background: ${theme.colors.bg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
  transition: ${theme.transition};
  font-family: inherit;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${theme.colors.bgHover};
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }

  ${props => props.error && `
    border-color: #ef4444;
    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}
`;

// Select
export const Select = styled.select`
  padding: ${theme.spacing.md};
  background: ${theme.colors.bg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
  transition: ${theme.transition};
  cursor: pointer;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${theme.colors.bgHover};
  }

  option {
    background: ${theme.colors.bgDark};
    color: ${theme.colors.text};
  }

  ${props => props.error && `
    border-color: #ef4444;
    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}
`;

// Checkbox Container
export const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  user-select: none;
`;

// Checkbox
export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${theme.colors.accent};
`;

// Radio Container
export const RadioContainer = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  user-select: none;
`;

// Radio
export const Radio = styled.input.attrs({ type: 'radio' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${theme.colors.accent};
`;

// Error Text
export const ErrorText = styled.span`
  color: #ef4444;
  font-size: ${theme.fontSize.xs};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  &::before {
    content: '⚠';
  }
`;

// Help Text
export const HelpText = styled.span`
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSize.xs};
  font-style: italic;
`;

// Button Base
const ButtonBase = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: ${theme.transition};
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  font-family: inherit;
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

// Primary Button
export const Button = styled(ButtonBase)`
  background: ${theme.colors.accent};
  color: ${theme.colors.text};
  box-shadow: 0 2px 8px rgba(79, 140, 255, 0.3);

  &:hover:not(:disabled) {
    background: ${theme.colors.accentHover};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 140, 255, 0.4);
  }
`;

// Secondary Button
export const SecondaryButton = styled(ButtonBase)`
  background: transparent;
  color: ${theme.colors.textMuted};
  border: 1px solid ${theme.colors.border};

  &:hover:not(:disabled) {
    background: ${theme.colors.bgHover};
    color: ${theme.colors.text};
    border-color: ${theme.colors.accent};
  }
`;

// Danger Button
export const DangerButton = styled(ButtonBase)`
  background: #ef4444;
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);

  &:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }
`;

// Success Button
export const SuccessButton = styled(ButtonBase)`
  background: #10b981;
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);

  &:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
`;

// File Input Container
export const FileInputContainer = styled.div`
  position: relative;
`;

export const FileInput = styled.input.attrs({ type: 'file' })`
  opacity: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

export const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.md};
  background: ${theme.colors.bg};
  border: 2px dashed ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSize.sm};
  cursor: pointer;
  transition: ${theme.transition};

  &:hover {
    border-color: ${theme.colors.accent};
    color: ${theme.colors.accent};
  }
`;