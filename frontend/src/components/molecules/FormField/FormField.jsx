import styled from 'styled-components';
import { theme } from '../../../styles';

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
  font-weight: 500;
  
  ${props => props.$required && `
    &::after {
      content: ' *';
      color: #ef4444;
    }
  `}
`;

const Input = styled.input`
  padding: ${theme.spacing.md};
  background: ${theme.colors.bg};
  border: 1px solid ${props => props.$error ? '#ef4444' : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
  transition: ${theme.transition};
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#ef4444' : theme.colors.accent};
    box-shadow: 0 0 0 3px ${props => props.$error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 140, 255, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${theme.colors.bgDark};
  }
  
  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const Select = styled.select`
  padding: ${theme.spacing.md};
  background: ${theme.colors.bg};
  border: 1px solid ${props => props.$error ? '#ef4444' : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
  transition: ${theme.transition};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#ef4444' : theme.colors.accent};
    box-shadow: 0 0 0 3px ${props => props.$error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 140, 255, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${theme.colors.bgDark};
  }
`;

const Textarea = styled.textarea`
  padding: ${theme.spacing.md};
  background: ${theme.colors.bg};
  border: 1px solid ${props => props.$error ? '#ef4444' : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
  transition: ${theme.transition};
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#ef4444' : theme.colors.accent};
    box-shadow: 0 0 0 3px ${props => props.$error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 140, 255, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${theme.colors.bgDark};
  }
  
  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: ${theme.fontSize.xs};
  margin-top: -${theme.spacing.xs};
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${theme.colors.accent};
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CheckboxLabel = styled.label`
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
  cursor: pointer;
  user-select: none;
  
  ${props => props.$disabled && `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`;

export default function FormField({
  type = 'text',
  name,
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  placeholder,
  options = [], // Para select
  rows = 4, // Para textarea
  helperText,
  autoComplete = 'off',
  ...rest
}) {
  const handleChange = (e) => {
    const { type, checked, value } = e.target;
    onChange({
      ...e,
      target: {
        ...e.target,
        name,
        value: type === 'checkbox' ? checked : value,
        type,
        checked,
      }
    });
  };

  // Checkbox
  if (type === 'checkbox') {
    return (
      <FormGroup>
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            id={name}
            name={name}
            checked={value || false}
            onChange={handleChange}
            disabled={disabled}
            {...rest}
          />
          <CheckboxLabel htmlFor={name} $disabled={disabled}>
            {label}
            {required && <span style={{ color: '#ef4444' }}> *</span>}
          </CheckboxLabel>
        </CheckboxContainer>
        {error && <ErrorText>{error}</ErrorText>}
        {helperText && !error && (
          <span style={{ fontSize: theme.fontSize.xs, color: theme.colors.textMuted }}>
            {helperText}
          </span>
        )}
      </FormGroup>
    );
  }

  // Select
  if (type === 'select') {
    return (
      <FormGroup>
        <Label htmlFor={name} $required={required}>
          {label}
        </Label>
        <Select
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          $error={error}
          {...rest}
        >
          <option value="">Seleccionar...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        {error && <ErrorText>{error}</ErrorText>}
        {helperText && !error && (
          <span style={{ fontSize: theme.fontSize.xs, color: theme.colors.textMuted }}>
            {helperText}
          </span>
        )}
      </FormGroup>
    );
  }

  // Textarea
  if (type === 'textarea') {
    return (
      <FormGroup>
        <Label htmlFor={name} $required={required}>
          {label}
        </Label>
        <Textarea
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          $error={error}
          {...rest}
        />
        {error && <ErrorText>{error}</ErrorText>}
        {helperText && !error && (
          <span style={{ fontSize: theme.fontSize.xs, color: theme.colors.textMuted }}>
            {helperText}
          </span>
        )}
      </FormGroup>
    );
  }

  // Input (default)
  return (
    <FormGroup>
      <Label htmlFor={name} $required={required}>
        {label}
      </Label>
      <Input
        type={type}
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        $error={error}
        {...rest}
      />
      {error && <ErrorText>{error}</ErrorText>}
      {helperText && !error && (
        <span style={{ fontSize: theme.fontSize.xs, color: theme.colors.textMuted }}>
          {helperText}
        </span>
      )}
    </FormGroup>
  );
}