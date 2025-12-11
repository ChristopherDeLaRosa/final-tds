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
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
  font-size: 12px;
`;

// Columnas de la tabla
export const cursosColumns = [
  { 
    key: 'codigo', 
    title: 'Código',
    width: '100px',
    render: (value) => <CodigoBadge>{value}</CodigoBadge>
  },
  { key: 'nombre', title: 'Nombre de la asignatura' },
  { 
    key: 'nivel', 
    title: 'Nivel',
    width: '120px',
    render: (value) => (
      <Badge
        $bgColor={value === 'Primaria' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 92, 246, 0.15)'}
        $textColor={value === 'Primaria' ? '#3b82f6' : '#8b5cf6'}
        $borderColor={value === 'Primaria' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'}
      >
        {value}
      </Badge>
    )
  },
  { key: 'areaConocimiento', title: 'Área' },
  { 
    key: 'nivelGrado', 
    title: 'Grado',
    width: '80px',
    render: (value) => `${value}°`
  },
  { 
    key: 'horasSemana', 
    title: 'Horas',
    width: '80px',
    render: (value) => `${value}h`
  },
  { 
    key: 'esObligatoria', 
    title: 'Obligatoria', 
    width: '100px',
    render: (value) => (
      <Badge
        $bgColor={value ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}
        $textColor={value ? '#10b981' : '#f59e0b'}
        $borderColor={value ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}
      >
        {value ? 'Sí' : 'No'}
      </Badge>
    ),
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
export const cursosSearchFields = ['codigo', 'nombre', 'nivel', 'areaConocimiento'];

// Campos del formulario
export const getCursosFormFields = (isEditing) => [
  {
    name: 'codigo',
    label: `Código del Curso ${isEditing ? '(No editable)' : ''}`,
    type: 'text',
    placeholder: 'Ej: MAT-1',
    required: true,
    disabled: isEditing,
    maxLength: 20,
  },
  {
    name: 'nombre',
    label: 'Nombre del Curso',
    type: 'text',
    placeholder: 'Ej: Matemáticas I',
    required: true,
    maxLength: 150,
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    type: 'textarea',
    placeholder: 'Descripción del curso...',
    maxLength: 500,
    rows: 3,
  },
  [
    {
      name: 'nivel',
      label: 'Nivel Educativo',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Selecciona un nivel' },
        { value: 'Primaria', label: 'Primaria' },
        { value: 'Secundaria', label: 'Secundaria' },
      ],
    },
    {
      name: 'nivelGrado',
      label: 'Nivel de Grado',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Selecciona grado' },
        { value: 1, label: '1°' },
        { value: 2, label: '2°' },
        { value: 3, label: '3°' },
        { value: 4, label: '4°' },
        { value: 5, label: '5°' },
        { value: 6, label: '6°' },
        { value: 7, label: '7°' },
        { value: 8, label: '8°' },
        { value: 9, label: '9°' },
        { value: 10, label: '10°' },
        { value: 11, label: '11°' },
        { value: 12, label: '12°' },
      ],
    },
  ],
  {
    name: 'areaConocimiento',
    label: 'Área de Conocimiento',
    type: 'select',
    required: true,
    options: [
      { value: '', label: 'Selecciona un área' },
      { value: 'Matemáticas', label: 'Matemáticas' },
      { value: 'Ciencias Naturales', label: 'Ciencias Naturales' },
      { value: 'Ciencias Sociales', label: 'Ciencias Sociales' },
      { value: 'Lengua y Literatura', label: 'Lengua y Literatura' },
      { value: 'Lengua Extranjera', label: 'Lengua Extranjera' },
      { value: 'Educación Física', label: 'Educación Física' },
      { value: 'Educación Artística', label: 'Educación Artística' },
      { value: 'Tecnología', label: 'Tecnología' },
      { value: 'Formación Integral', label: 'Formación Integral' },
    ],
  },
  [
    {
      name: 'horasSemana',
      label: 'Horas por Semana',
      type: 'number',
      placeholder: 'Ej: 4',
      required: true,
      min: 1,
      max: 40,
    },
    {
      name: 'orden',
      label: 'Orden de Presentación',
      type: 'number',
      placeholder: 'Ej: 1',
      min: 0,
      max: 100,
    },
  ],
  [
    {
      name: 'esObligatoria',
      label: 'Curso Obligatorio',
      type: 'checkbox',
    },
    {
      name: 'activo',
      label: 'Activo',
      type: 'checkbox',
    },
  ],
];

// Reglas de validación
export const cursosValidationRules = {
  codigo: {
    required: { message: 'El código es requerido' },
    maxLength: { value: 20, message: 'Máximo 20 caracteres' },
    pattern: {
      value: /^[A-Z0-9-]+$/,
      message: 'Solo letras mayúsculas, números y guiones',
    },
  },
  nombre: {
    required: { message: 'El nombre es requerido' },
    maxLength: { value: 150, message: 'Máximo 150 caracteres' },
  },
  descripcion: {
    maxLength: { value: 500, message: 'Máximo 500 caracteres' },
  },
  nivel: {
    required: { message: 'El nivel es requerido' },
  },
  areaConocimiento: {
    required: { message: 'El área de conocimiento es requerida' },
  },
  nivelGrado: {
    required: { message: 'El nivel de grado es requerido' },
    validate: (value) => {
      const grado = parseInt(value);
      if (grado < 1 || grado > 12) {
        return 'El grado debe estar entre 1 y 12';
      }
      return true;
    },
  },
  horasSemana: {
    required: { message: 'Las horas por semana son requeridas' },
    validate: (value) => {
      const horas = parseInt(value);
      if (horas < 1 || horas > 40) {
        return 'Debe estar entre 1 y 40 horas';
      }
      return true;
    },
  },
  orden: {
    validate: (value) => {
      if (value === '' || value === null || value === undefined) return true;
      const orden = parseInt(value);
      if (orden < 0 || orden > 100) {
        return 'Debe estar entre 0 y 100';
      }
      return true;
    },
  },
};

// Datos iniciales del formulario
export const getInitialCursoFormData = () => ({
  codigo: '',
  nombre: '',
  descripcion: '',
  nivel: '',
  areaConocimiento: '',
  nivelGrado: '',
  horasSemana: 3,
  orden: 0,
  esObligatoria: true,
  activo: true,
});

// Formatear curso para el formulario
export const formatCursoForForm = (curso) => ({
  codigo: curso.codigo || '',
  nombre: curso.nombre || '',
  descripcion: curso.descripcion || '',
  nivel: curso.nivel || '',
  areaConocimiento: curso.areaConocimiento || '',
  nivelGrado: curso.nivelGrado || '',
  horasSemana: curso.horasSemana || 3,
  orden: curso.orden || 0,
  esObligatoria: curso.esObligatoria ?? true,
  activo: curso.activo ?? true,
});

// Formatear datos para enviar a la API
export const formatCursoDataForAPI = (formData) => ({
  codigo: formData.codigo.trim().toUpperCase(),
  nombre: formData.nombre.trim(),
  descripcion: formData.descripcion?.trim() || null,
  nivel: formData.nivel,
  areaConocimiento: formData.areaConocimiento,
  nivelGrado: parseInt(formData.nivelGrado, 10),
  horasSemana: parseInt(formData.horasSemana, 10),
  orden: parseInt(formData.orden, 10) || 0,
  esObligatoria: formData.esObligatoria,
  activo: formData.activo,
});
