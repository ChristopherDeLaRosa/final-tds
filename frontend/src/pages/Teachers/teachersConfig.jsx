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
`;

const EspecialidadBadge = styled.span`
  display: inline-block;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.3);
  font-size: 11px;
`;

// Columnas de la tabla
export const teachersColumns = [
  { key: 'id', title: 'ID', width: '60px' },
  { 
    key: 'codigo', 
    title: 'Código',
    width: '110px',
    render: (value) => <CodigoBadge>{value}</CodigoBadge>
  },
  { 
    key: 'nombreCompleto', 
    title: 'Nombre Completo',
    render: (value, row) => `${row.nombres} ${row.apellidos}`
  },
  { key: 'email', title: 'Correo Electrónico' },
  { key: 'telefono', title: 'Teléfono', width: '130px' },
  {
    key: 'especialidad',
    title: 'Especialidad',
    width: '150px',
    render: (value) => <EspecialidadBadge>{value}</EspecialidadBadge>
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
export const teachersSearchFields = [
  'nombres',
  'apellidos',
  'email',
  'telefono',
  'codigo',
  'especialidad'
];

// Opciones de especialidades
export const especialidades = [
  { value: 'Matemáticas', label: 'Matemáticas' },
  { value: 'Español', label: 'Español' },
  { value: 'Inglés', label: 'Inglés' },
  { value: 'Ciencias Naturales', label: 'Ciencias Naturales' },
  { value: 'Ciencias Sociales', label: 'Ciencias Sociales' },
  { value: 'Educación Física', label: 'Educación Física' },
  { value: 'Arte', label: 'Arte' },
  { value: 'Música', label: 'Música' },
  { value: 'Informática', label: 'Informática' },
  { value: 'Francés', label: 'Francés' },
  { value: 'Religión', label: 'Religión' },
  { value: 'Formación Humana', label: 'Formación Humana' },
];

// Campos del formulario
export const getTeachersFormFields = (isEditing) => [
  {
    name: 'codigo',
    label: `Código ${isEditing ? '(No editable)' : ''}`,
    type: 'text',
    placeholder: 'Ej: DOC-2024-001',
    required: true,
    disabled: isEditing,
    helperText: 'Código único del docente',
  },
  [
    {
      name: 'nombres',
      label: 'Nombres',
      type: 'text',
      placeholder: 'Ej: María José',
      required: true,
    },
    {
      name: 'apellidos',
      label: 'Apellidos',
      type: 'text',
      placeholder: 'Ej: García Pérez',
      required: true,
    },
  ],
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'docente@colegio.edu',
    required: true,
  },
  [
    {
      name: 'telefono',
      label: 'Teléfono',
      type: 'tel',
      placeholder: '809-555-1234',
      required: true,
    },
    {
      name: 'especialidad',
      label: 'Especialidad',
      type: 'select',
      options: especialidades,
      required: true,
    },
  ],
  ...(isEditing ? [
    {
      name: 'activo',
      label: 'Docente activo',
      type: 'checkbox',
      helperText: 'Marcar si el docente está actualmente activo',
    }
  ] : []),
];

// Reglas de validación
export const teachersValidationRules = {
  codigo: {
    required: { message: 'El código es requerido' },
    minLength: { value: 3, message: 'El código debe tener al menos 3 caracteres' },
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
  telefono: {
    required: { message: 'El teléfono es requerido' },
    pattern: {
      value: /^(\+1)?[\s.-]?\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
      message: 'Formato de teléfono inválido'
    },
  },
  especialidad: {
    required: { message: 'La especialidad es requerida' },
  },
};

// Datos iniciales del formulario
export const getInitialTeacherFormData = () => ({
  codigo: '',
  nombres: '',
  apellidos: '',
  email: '',
  telefono: '',
  especialidad: '',
  activo: true,
});

// Formatear docente para enviar a la API
export const formatTeacherDataForAPI = (formData) => ({
  codigo: formData.codigo?.trim(),
  nombres: formData.nombres?.trim(),
  apellidos: formData.apellidos?.trim(),
  email: formData.email?.trim()?.toLowerCase(),
  telefono: formData.telefono?.trim(),
  especialidad: formData.especialidad,
  activo: formData.activo ?? true,
});

// Formatear docente para el formulario
export const formatTeacherForForm = (teacher) => ({
  codigo: teacher.codigo || '',
  nombres: teacher.nombres || '',
  apellidos: teacher.apellidos || '',
  email: teacher.email || '',
  telefono: teacher.telefono || '',
  especialidad: teacher.especialidad || '',
  activo: teacher.activo ?? true,
});
