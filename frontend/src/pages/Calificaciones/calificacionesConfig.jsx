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

// Columnas de la tabla
export const calificacionesColumns = [
  { key: 'id', title: 'ID', width: '60px' },
  { key: 'nombreEstudiante', title: 'Estudiante' },
  { key: 'matriculaEstudiante', title: 'Matrícula', width: '120px' },
  { key: 'nombreCurso', title: 'Curso' },
  { key: 'nombreRubro', title: 'Rubro/Actividad' },
  { 
    key: 'porcentajeRubro', 
    title: '% Rubro',
    width: '100px',
    render: (value) => `${value}%`
  },
  { 
    key: 'nota', 
    title: 'Nota',
    width: '100px',
    render: (value) => {
      if (!value && value !== 0) return '-';
      const color = value >= 70 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';
      const bgColor = value >= 70 
        ? 'rgba(16, 185, 129, 0.15)' 
        : value >= 50 
        ? 'rgba(245, 158, 11, 0.15)' 
        : 'rgba(239, 68, 68, 0.15)';
      const borderColor = value >= 70 
        ? 'rgba(16, 185, 129, 0.3)' 
        : value >= 50 
        ? 'rgba(245, 158, 11, 0.3)' 
        : 'rgba(239, 68, 68, 0.3)';
      
      return (
        <Badge
          $bgColor={bgColor}
          $textColor={color}
          $borderColor={borderColor}
        >
          {value.toFixed(2)}
        </Badge>
      );
    }
  },
  { 
    key: 'fechaRegistro', 
    title: 'Fecha',
    width: '120px',
    render: (value) => new Date(value).toLocaleDateString('es-DO')
  },
];

// Campos de búsqueda
export const calificacionesSearchFields = [
  'nombreEstudiante',
  'matriculaEstudiante',
  'nombreCurso',
  'nombreRubro'
];

// Campos del formulario
export const getCalificacionesFormFields = (isEditing, estudiantes = [], rubros = []) => [
  {
    name: 'rubroId',
    label: 'Rubro/Actividad',
    type: 'select',
    required: true,
    disabled: isEditing,
    options: [
      { value: '', label: 'Selecciona un rubro' },
      ...rubros.map(r => ({
        value: r.id,
        label: `${r.nombreCurso} - ${r.nombre} (${r.porcentaje}%)`
      }))
    ],
  },
  {
    name: 'estudianteId',
    label: 'Estudiante',
    type: 'select',
    required: true,
    disabled: isEditing,
    options: [
      { value: '', label: 'Selecciona un estudiante' },
      ...estudiantes.map(e => ({
        value: e.id,
        label: `${e.matricula} - ${e.nombreCompleto || `${e.nombres} ${e.apellidos}`}`
      }))
    ],
  },
  {
    name: 'nota',
    label: 'Calificación (0-100)',
    type: 'number',
    placeholder: 'Ej: 85',
    required: true,
    min: 0,
    max: 100,
    step: 0.01,
  },
  {
    name: 'observaciones',
    label: 'Observaciones',
    type: 'textarea',
    placeholder: 'Observaciones sobre la calificación...',
    maxLength: 500,
    rows: 3,
  },
];

// Reglas de validación
export const calificacionesValidationRules = {
  rubroId: {
    required: { message: 'El rubro es requerido' },
    validate: (value) => {
      if (!value || value === '') {
        return 'Debes seleccionar un rubro';
      }
      return true;
    },
  },
  estudianteId: {
    required: { message: 'El estudiante es requerido' },
    validate: (value) => {
      if (!value || value === '') {
        return 'Debes seleccionar un estudiante';
      }
      return true;
    },
  },
  nota: {
    required: { message: 'La nota es requerida' },
    validate: (value) => {
      const nota = parseFloat(value);
      if (isNaN(nota)) {
        return 'Debe ser un número válido';
      }
      if (nota < 0 || nota > 100) {
        return 'La nota debe estar entre 0 y 100';
      }
      return true;
    },
  },
  observaciones: {
    maxLength: { value: 500, message: 'Máximo 500 caracteres' },
  },
};

// Datos iniciales del formulario
export const getInitialCalificacionFormData = () => ({
  rubroId: '',
  estudianteId: '',
  nota: '',
  observaciones: '',
});

// Formatear calificación para el formulario
export const formatCalificacionForForm = (calificacion) => ({
  rubroId: calificacion.rubroId || '',
  estudianteId: calificacion.estudianteId || '',
  nota: calificacion.nota?.toString() || '',
  observaciones: calificacion.observaciones || '',
});

// Formatear datos para enviar a la API
export const formatCalificacionDataForAPI = (formData) => ({
  rubroId: parseInt(formData.rubroId, 10),
  estudianteId: parseInt(formData.estudianteId, 10),
  nota: parseFloat(formData.nota),
  observaciones: formData.observaciones?.trim() || null,
});
