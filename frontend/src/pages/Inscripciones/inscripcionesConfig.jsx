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
export const inscripcionesColumns = [
  { key: 'id', title: 'ID', width: '60px' },
  { key: 'matriculaEstudiante', title: 'Matrícula', width: '120px' },
  { key: 'nombreEstudiante', title: 'Estudiante' },
  { 
    key: 'gradoEstudiante', 
    title: 'Grado',
    width: '100px',
    render: (value, row) => `${value}° ${row.seccionEstudiante}`
  },
  { key: 'nombreCurso', title: 'Curso' },
  { key: 'docente', title: 'Docente' },
  { 
    key: 'promedioFinal', 
    title: 'Promedio',
    width: '100px',
    render: (value) => {
      if (!value) return '-';
      const color = value >= 70 ? '#10b981' : '#ef4444';
      return (
        <Badge
          $bgColor={value >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
          $textColor={color}
          $borderColor={value >= 70 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
        >
          {value.toFixed(2)}
        </Badge>
      );
    }
  },
  {
    key: 'estado',
    title: 'Estado',
    width: '120px',
    render: (value) => {
      const colors = {
        'Activo': { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
        'Retirado': { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
        'Completado': { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
      };
      const color = colors[value] || colors['Activo'];
      return (
        <Badge
          $bgColor={color.bg}
          $textColor={color.text}
          $borderColor={color.border}
        >
          {value}
        </Badge>
      );
    }
  },
];

// Campos de búsqueda
export const inscripcionesSearchFields = [
  'nombreEstudiante',
  'matriculaEstudiante',
  'nombreCurso',
  'docente',
  'seccionEstudiante'
];

// Campos del formulario
export const getInscripcionesFormFields = (isEditing, estudiantes = [], gruposCursos = []) => [
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
        label: `${e.matricula} - ${e.nombreCompleto || `${e.nombres} ${e.apellidos}`} (${e.gradoActual}° ${e.seccionActual})`
      }))
    ],
  },
  {
    name: 'grupoCursoId',
    label: 'Grupo-Curso',
    type: 'select',
    required: true,
    disabled: isEditing,
    options: [
      { value: '', label: 'Selecciona un grupo-curso' },
      ...gruposCursos.map(g => ({
        value: g.id,
        label: `${g.codigo} - ${g.nombreCurso} (${g.grado}° ${g.seccion}) - ${g.nombreDocente}`
      }))
    ],
  },
  ...(isEditing ? [
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { value: 'Activo', label: 'Activo' },
        { value: 'Retirado', label: 'Retirado' },
        { value: 'Completado', label: 'Completado' },
      ],
    },
    {
      name: 'activo',
      label: 'Activo',
      type: 'checkbox',
    },
  ] : []),
];

// Reglas de validación
export const inscripcionesValidationRules = {
  estudianteId: {
    required: { message: 'El estudiante es requerido' },
    validate: (value) => {
      if (!value || value === '') {
        return 'Debes seleccionar un estudiante';
      }
      return true;
    },
  },
  grupoCursoId: {
    required: { message: 'El grupo-curso es requerido' },
    validate: (value) => {
      if (!value || value === '') {
        return 'Debes seleccionar un grupo-curso';
      }
      return true;
    },
  },
  estado: {
    required: { message: 'El estado es requerido' },
  },
};

// Datos iniciales del formulario
export const getInitialInscripcionFormData = () => ({
  estudianteId: '',
  grupoCursoId: '',
  estado: 'Activo',
  activo: true,
});

// Formatear inscripción para el formulario
export const formatInscripcionForForm = (inscripcion) => ({
  estudianteId: inscripcion.estudianteId || '',
  grupoCursoId: inscripcion.grupoCursoId || '',
  estado: inscripcion.estado || 'Activo',
  activo: inscripcion.activo ?? true,
});

// Formatear datos para enviar a la API
export const formatInscripcionDataForAPI = (formData) => ({
  estudianteId: parseInt(formData.estudianteId, 10),
  grupoCursoId: parseInt(formData.grupoCursoId, 10),
  estado: formData.estado,
  activo: formData.activo,
});
