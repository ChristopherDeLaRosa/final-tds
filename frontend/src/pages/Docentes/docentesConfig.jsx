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
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.3);
  font-size: 12px;
`;

// Columnas de la tabla
export const docentesColumns = [
  { key: 'id', title: 'ID', width: '60px' },
  { 
    key: 'codigo', 
    title: 'Código',
    width: '120px',
    render: (value) => <CodigoBadge>{value}</CodigoBadge>
  },
  { key: 'nombreCompleto', title: 'Nombre Completo' },
  { key: 'especialidad', title: 'Especialidad' },
  { key: 'email', title: 'Correo Electrónico' },
  { key: 'telefono', title: 'Teléfono', width: '130px' },
  { 
    key: 'cantidadGrupos', 
    title: 'Grupos', 
    width: '80px',
    render: (value) => (
      <Badge
        $bgColor="rgba(59, 130, 246, 0.15)"
        $textColor="#3b82f6"
        $borderColor="rgba(59, 130, 246, 0.3)"
      >
        {value || 0}
      </Badge>
    )
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
export const docentesSearchFields = [
  'nombreCompleto',
  'codigo', 
  'nombres', 
  'apellidos', 
  'email', 
  'especialidad',
  'telefono'
];

// Campos del formulario
export const getDocentesFormFields = (isEditing) => [
  {
    name: 'codigo',
    label: `Código ${isEditing ? '(No editable)' : ''}`,
    type: 'text',
    placeholder: 'Ej: DOC-001',
    required: true,
    disabled: isEditing,
    maxLength: 20,
  },
  [
    {
      name: 'nombres',
      label: 'Nombres',
      type: 'text',
      placeholder: 'Ej: Juan Carlos',
      required: true,
      maxLength: 100,
    },
    {
      name: 'apellidos',
      label: 'Apellidos',
      type: 'text',
      placeholder: 'Ej: Pérez López',
      required: true,
      maxLength: 100,
    },
  ],
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'docente@colegio.edu',
    required: true,
    maxLength: 150,
  },
  [
    {
      name: 'telefono',
      label: 'Teléfono',
      type: 'tel',
      placeholder: '809-555-1234',
      maxLength: 20,
    },
    {
      name: 'especialidad',
      label: 'Especialidad',
      type: 'text',
      placeholder: 'Ej: Matemáticas',
      maxLength: 100,
    },
  ],
  ...(!isEditing ? [{
    name: 'fechaContratacion',
    label: 'Fecha de Contratación',
    type: 'date',
  }] : []),
  {
    name: 'activo',
    label: 'Activo',
    type: 'checkbox',
  },
];

// Reglas de validación
export const docentesValidationRules = {
  codigo: {
    required: { message: 'El código es requerido' },
    maxLength: { value: 20, message: 'Máximo 20 caracteres' },
  },
  nombres: {
    required: { message: 'Los nombres son requeridos' },
    minLength: { value: 2, message: 'Mínimo 2 caracteres' },
    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
  },
  apellidos: {
    required: { message: 'Los apellidos son requeridos' },
    minLength: { value: 2, message: 'Mínimo 2 caracteres' },
    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
  },
  email: {
    required: { message: 'El email es requerido' },
    pattern: { 
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
      message: 'Email inválido' 
    },
    maxLength: { value: 150, message: 'Máximo 150 caracteres' },
  },
  telefono: {
    maxLength: { value: 20, message: 'Máximo 20 caracteres' },
  },
  especialidad: {
    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
  },
};

// Datos iniciales del formulario
export const getInitialDocenteFormData = () => ({
  codigo: '',
  nombres: '',
  apellidos: '',
  email: '',
  telefono: '',
  especialidad: '',
  fechaContratacion: new Date().toISOString().split('T')[0],
  activo: true,
});

// Formatear fecha para el formulario
export const formatDateForForm = (fecha) => {
  if (!fecha) return '';
  return String(fecha).split('T')[0];
};

// Formatear docente para el formulario
export const formatDocenteForForm = (docente) => ({
  codigo: docente.codigo || '',
  nombres: docente.nombres || '',
  apellidos: docente.apellidos || '',
  email: docente.email || '',
  telefono: docente.telefono || '',
  especialidad: docente.especialidad || '',
  fechaContratacion: formatDateForForm(docente.fechaContratacion),
  activo: docente.activo ?? true,
});

// Formatear datos para enviar a la API
export const formatDocenteDataForAPI = (formData) => ({
  codigo: formData.codigo.trim().toUpperCase(),
  nombres: formData.nombres.trim(),
  apellidos: formData.apellidos.trim(),
  email: formData.email.trim().toLowerCase(),
  telefono: formData.telefono?.trim() || null,
  especialidad: formData.especialidad?.trim() || null,
  fechaContratacion: formData.fechaContratacion ? `${formData.fechaContratacion}T00:00:00` : null,
  activo: formData.activo,
});
