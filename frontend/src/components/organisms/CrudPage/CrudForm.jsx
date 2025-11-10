import styled from 'styled-components';
import { theme } from '../../../styles';
import FormField from '../../molecules/FormField/FormField';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$columns || '1fr'};
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export default function CrudForm({ 
  fields = [], 
  formData = {}, 
  errors = {}, 
  onChange, 
  disabled = false 
}) {
  return (
    <Form>
      {fields.map((field, index) => {
        // Si es un array de campos (para crear filas)
        if (Array.isArray(field)) {
          return (
            <FormRow key={index} $columns={`repeat(${field.length}, 1fr)`}>
              {field.map((subField) => (
                <FormField
                  key={subField.name}
                  {...subField}
                  value={formData[subField.name]}
                  error={errors[subField.name]}
                  onChange={onChange}
                  disabled={disabled}
                />
              ))}
            </FormRow>
          );
        }

        // Campo individual
        return (
          <FormField
            key={field.name}
            {...field}
            value={formData[field.name]}
            error={errors[field.name]}
            onChange={onChange}
            disabled={disabled}
          />
        );
      })}
    </Form>
  );
}