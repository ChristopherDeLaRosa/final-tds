import { theme } from '../../styles';
import styled from 'styled-components';

const Badge = styled.span`
  display: inline-block;
  font-weight: 600;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.xs};
  background-color: ${props => props.$bgColor};
  color: ${props => props.$textColor};
  border: 1px solid ${props => props.$borderColor};
  white-space: nowrap;
`;

const CodigoBadge = styled.span`
  display: inline-block;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(79, 140, 255, 0.1);
  color: ${theme.colors.accent};
  border: 1px solid rgba(79, 140, 255, 0.3);
  font-size: 12px;
  font-family: 'Courier New', monospace;
`;

const CreditosBadge = styled.span`
  display: inline-block;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
  font-size: 11px;
`;

const HorasBadge = styled.span`
  display: inline-block;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.3);
  font-size: 11px;
`;

// Columnas de la tabla
export const coursesColumns = [
  { key: 'id', title: 'ID', width: '60px' },
  { 
    key: 'codigo', 
    title: 'Código',
    width: '130px',
    render: (value) => <CodigoBadge>{value}</CodigoBadge>
  },
  { 
    key: 'nombre', 
    title: 'Nombre del Curso',
  },
  { 
    key: 'descripcion', 
    title: 'Descripción',
    render: (value) => (
      <span style={{ 
        display: 'block',
        maxWidth: '300px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {value || 'Sin descripción'}
      </span>
    )
  },
  {
    key: 'creditos',
    title: 'Créditos',
    width: '100px',
    render: (value) => <CreditosBadge>{value} CR</CreditosBadge>
  },
  {
    key: 'horasSemana',
    title: 'Horas/Semana',
    width: '130px',
    render: (value) => <HorasBadge>{value} hrs</HorasBadge>
  },
  {
    key: 'activo',
    title: 'Estado',
    width: '100px',
    render: (value) => (
      <Badge
        $bgColor={value ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
        $textColor={value ? '#10b981' : '#ef4444'}
        $borderColor={value ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
      >
        {value ? 'Activo' : 'Inactivo'}
      </Badge>
    )
  },
];

// Campos de búsqueda
export const coursesSearchFields = [
  'codigo',
  'nombre',
  'descripcion',
];

// Campos del formulario
export const getCoursesFormFields = (isEditing) => [
  {
    name: 'codigo',
    label: `Código ${isEditing ? '(No editable)' : ''}`,
    type: 'text',
    placeholder: 'Ej: MAT-101, ESP-201',
    required: true,
    disabled: isEditing,
    helperText: 'Código único del curso (ej: MAT-101, ESP-201)',
  },
  {
    name: 'nombre',
    label: 'Nombre del Curso',
    type: 'text',
    placeholder: 'Ej: Matemáticas I, Lengua Española',
    required: true,
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    type: 'textarea',
    placeholder: 'Descripción detallada del curso...',
    rows: 4,
    helperText: 'Descripción opcional del contenido del curso',
  },
  [
    {
      name: 'creditos',
      label: 'Créditos',
      type: 'number',
      placeholder: '3',
      required: true,
      min: 0,
      max: 10,
      helperText: 'Valor en créditos académicos',
    },
    {
      name: 'horasSemana',
      label: 'Horas por Semana',
      type: 'number',
      placeholder: '4',
      required: true,
      min: 1,
      max: 40,
      helperText: 'Horas semanales de clase',
    },
  ],
  ...(isEditing ? [
    {
      name: 'activo',
      label: 'Curso activo',
      type: 'checkbox',
      helperText: 'Marcar si el curso está disponible en el catálogo',
    }
  ] : []),
];

// Reglas de validación
export const coursesValidationRules = {
  codigo: {
    required: { message: 'El código es requerido' },
    minLength: { value: 3, message: 'El código debe tener al menos 3 caracteres' },
    pattern: {
      value: /^[A-Z]{3}-\d{3}$/,
      message: 'Formato: AAA-999 (ej: MAT-101, ESP-201)'
    },
  },
  nombre: {
    required: { message: 'El nombre del curso es requerido' },
    minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
  },
  creditos: {
    required: { message: 'Los créditos son requeridos' },
    custom: (value) => {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 10) {
        return 'Los créditos deben estar entre 0 y 10';
      }
      return null;
    },
  },
  horasSemana: {
    required: { message: 'Las horas por semana son requeridas' },
    custom: (value) => {
      const num = Number(value);
      if (isNaN(num) || num < 1 || num > 40) {
        return 'Las horas deben estar entre 1 y 40';
      }
      return null;
    },
  },
};

// Datos iniciales del formulario
export const getInitialCourseFormData = () => ({
  codigo: '',
  nombre: '',
  descripcion: '',
  creditos: 3,
  horasSemana: 4,
  activo: true,
});

// Formatear curso para enviar a la API
export const formatCourseDataForAPI = (formData) => ({
  codigo: formData.codigo?.trim().toUpperCase(),
  nombre: formData.nombre?.trim(),
  descripcion: formData.descripcion?.trim() || '',
  creditos: Number(formData.creditos),
  horasSemana: Number(formData.horasSemana),
  activo: formData.activo ?? true,
});

// Formatear curso para el formulario
export const formatCourseForForm = (course) => ({
  codigo: course.codigo || '',
  nombre: course.nombre || '',
  descripcion: course.descripcion || '',
  creditos: course.creditos || 3,
  horasSemana: course.horasSemana || 4,
  activo: course.activo ?? true,
});
