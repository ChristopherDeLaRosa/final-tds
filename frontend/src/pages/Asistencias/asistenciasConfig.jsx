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
export const asistenciasColumns = [
  { key: 'id', title: 'ID', width: '60px' },
  { 
    key: 'fechaSesion', 
    title: 'Fecha',
    width: '120px',
    render: (value) => new Date(value).toLocaleDateString('es-DO')
  },
  { key: 'nombreEstudiante', title: 'Estudiante' },
  { key: 'matriculaEstudiante', title: 'Matrícula', width: '120px' },
  { key: 'temaSesion', title: 'Tema de la Clase' },
  {
    key: 'estado',
    title: 'Estado',
    width: '120px',
    render: (value) => {
      const colors = {
        'Presente': { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
        'Ausente': { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
        'Tardanza': { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
        'Justificado': { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
      };
      const color = colors[value] || colors['Presente'];
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
  { 
    key: 'notificacionEnviada', 
    title: 'Notificación',
    width: '120px',
    render: (value) => (
      <Badge
        $bgColor={value ? 'rgba(16, 185, 129, 0.15)' : 'rgba(156, 163, 175, 0.15)'}
        $textColor={value ? '#10b981' : '#6b7280'}
        $borderColor={value ? 'rgba(16, 185, 129, 0.3)' : 'rgba(156, 163, 175, 0.3)'}
      >
        {value ? 'Enviada' : 'Pendiente'}
      </Badge>
    )
  },
];

// Campos de búsqueda
export const asistenciasSearchFields = [
  'nombreEstudiante',
  'matriculaEstudiante',
  'temaSesion',
  'estado'
];

// Campos del formulario para asistencia individual
export const getAsistenciasFormFields = (isEditing, estudiantes = [], sesiones = []) => [
  {
    name: 'sesionId',
    label: 'Sesión',
    type: 'select',
    required: true,
    disabled: isEditing,
    options: [
      { value: '', label: 'Selecciona una sesión' },
      ...sesiones.map(s => {
        const fecha = new Date(s.fecha).toLocaleDateString('es-DO');
        return {
          value: s.id,
          label: `${s.nombreCurso} - ${s.grado}° ${s.seccion} - ${fecha} ${s.horaInicio?.substring(0,5)}`
        };
      })
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
    name: 'estado',
    label: 'Estado de Asistencia',
    type: 'select',
    required: true,
    options: [
      { value: '', label: 'Selecciona el estado' },
      { value: 'Presente', label: 'Presente' },
      { value: 'Ausente', label: 'Ausente' },
      { value: 'Tardanza', label: 'Tardanza' },
      { value: 'Justificado', label: 'Justificado' },
    ],
  },
  {
    name: 'observaciones',
    label: 'Observaciones',
    type: 'textarea',
    placeholder: 'Observaciones sobre la asistencia...',
    maxLength: 300,
    rows: 3,
  },
];

// Reglas de validación
export const asistenciasValidationRules = {
  sesionId: {
    required: { message: 'La sesión es requerida' },
    validate: (value) => {
      if (!value || value === '') {
        return 'Debes seleccionar una sesión';
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
  estado: {
    required: { message: 'El estado es requerido' },
  },
  observaciones: {
    maxLength: { value: 300, message: 'Máximo 300 caracteres' },
  },
};

// Datos iniciales del formulario
export const getInitialAsistenciaFormData = () => ({
  sesionId: '',
  estudianteId: '',
  estado: '',
  observaciones: '',
});

// Formatear asistencia para el formulario
export const formatAsistenciaForForm = (asistencia) => ({
  sesionId: asistencia.sesionId || '',
  estudianteId: asistencia.estudianteId || '',
  estado: asistencia.estado || '',
  observaciones: asistencia.observaciones || '',
});

// Formatear datos para enviar a la API
export const formatAsistenciaDataForAPI = (formData) => ({
  sesionId: parseInt(formData.sesionId, 10),
  estudianteId: parseInt(formData.estudianteId, 10),
  estado: formData.estado,
  observaciones: formData.observaciones?.trim() || null,
});

