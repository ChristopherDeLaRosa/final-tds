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

const MatriculaBadge = styled.span`
  display: inline-block;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(79, 140, 255, 0.1);
  color: ${theme.colors.accent};
  border: 1px solid rgba(79, 140, 255, 0.3);
  font-size: 12px;
`;

// Columnas de la tabla
export const studentsColumns = [
  { key: 'id', title: 'ID', width: '60px' },
  { 
    key: 'matricula', 
    title: 'Matrícula',
    width: '120px',
    render: (value) => <MatriculaBadge>{value}</MatriculaBadge>
  },
  { key: 'nombreCompleto', title: 'Nombre Completo' },
  { key: 'email', title: 'Correo Electrónico' },
  { key: 'telefono', title: 'Teléfono', width: '130px' },
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
export const studentsSearchFields = [
  'nombreCompleto', 
  'nombres', 
  'apellidos', 
  'email', 
  'matricula', 
  'telefono'
];

// Campos del formulario
export const getStudentsFormFields = (isEditing) => [
  {
    name: 'matricula',
    label: `Matrícula ${isEditing ? '(No editable)' : ''}`,
    type: 'text',
    placeholder: 'Ej: 2024001',
    required: true,
    disabled: isEditing,
  },
  [
    {
      name: 'nombres',
      label: 'Nombres',
      type: 'text',
      placeholder: 'Ej: Juan Carlos',
      required: true,
    },
    {
      name: 'apellidos',
      label: 'Apellidos',
      type: 'text',
      placeholder: 'Ej: Pérez López',
      required: true,
    },
  ],
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'estudiante@colegio.edu',
    required: true,
  },
  [
    {
      name: 'telefono',
      label: 'Teléfono',
      type: 'tel',
      placeholder: '809-555-1234',
    },
    {
      name: 'fechaNacimiento',
      label: 'Fecha de Nacimiento',
      type: 'date',
      required: true,
    },
  ],
  {
    name: 'direccion',
    label: 'Dirección',
    type: 'text',
    placeholder: 'Dirección completa',
  },
  ...(!isEditing ? [{
    name: 'fechaIngreso',
    label: 'Fecha de Ingreso',
    type: 'date',
  }] : []),
];

// Reglas de validación
export const studentsValidationRules = {
  matricula: {
    required: { message: 'La matrícula es requerida' },
  },
  nombres: {
    required: { message: 'Los nombres son requeridos' },
    minLength: { value: 2, message: 'Los nombres deben tener al menos 2 caracteres' },
  },
  apellidos: {
    required: { message: 'Los apellidos son requeridos' },
    minLength: { value: 2, message: 'Los apellidos deben tener al menos 2 caracteres' },
  },
  email: {
    required: { message: 'El email es requerido' },
    pattern: { 
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
      message: 'El email no es válido' 
    },
  },
  fechaNacimiento: {
    required: { message: 'La fecha de nacimiento es requerida' },
  },
};

// Datos iniciales del formulario
export const getInitialStudentFormData = () => ({
  matricula: '',
  nombres: '',
  apellidos: '',
  email: '',
  telefono: '',
  direccion: '',
  fechaNacimiento: '',
  fechaIngreso: new Date().toISOString().split('T')[0],
  activo: true,
});

// Formatear fecha para el formulario
export const formatDateForForm = (fecha) => {
  if (!fecha) return '';
  return String(fecha).split('T')[0];
};

// Formatear datos para enviar a la API
export const formatStudentDataForAPI = (formData) => ({
  ...formData,
  fechaNacimiento: formData.fechaNacimiento ? `${formData.fechaNacimiento}T00:00:00` : null,
  fechaIngreso: formData.fechaIngreso ? `${formData.fechaIngreso}T00:00:00` : null,
});

// Formatear estudiante para el formulario
export const formatStudentForForm = (estudiante) => ({
  matricula: estudiante.matricula || '',
  nombres: estudiante.nombres || '',
  apellidos: estudiante.apellidos || '',
  email: estudiante.email || '',
  telefono: estudiante.telefono || '',
  direccion: estudiante.direccion || '',
  fechaNacimiento: formatDateForForm(estudiante.fechaNacimiento),
  fechaIngreso: formatDateForForm(estudiante.fechaIngreso),
  activo: estudiante.activo ?? true,
});