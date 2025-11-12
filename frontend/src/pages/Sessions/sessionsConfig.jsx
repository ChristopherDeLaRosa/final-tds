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

const SeccionBadge = styled.span`
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

const FechaBadge = styled.span`
  display: inline-block;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.3);
  font-size: 11px;
`;

const HorarioBadge = styled.span`
  display: inline-block;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  background: rgba(14, 165, 233, 0.1);
  color: #0ea5e9;
  border: 1px solid rgba(14, 165, 233, 0.3);
  font-size: 11px;
`;

// Función helper para formatear fecha
const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  return new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

// Función helper para formatear hora
const formatearHora = (hora) => {
  if (!hora) return '';
  return hora.substring(0, 5); // Obtener HH:MM
};

// Columnas de la tabla
export const sessionsColumns = [
  { key: 'id', title: 'ID', width: '60px' },
  { 
    key: 'codigoSeccion', 
    title: 'Sección',
    width: '130px',
    render: (value) => <SeccionBadge>{value}</SeccionBadge>
  },
  { 
    key: 'nombreCurso', 
    title: 'Curso',
  },
  {
    key: 'fecha',
    title: 'Fecha',
    width: '130px',
    render: (value) => <FechaBadge>{formatearFecha(value)}</FechaBadge>
  },
  {
    key: 'horaInicio',
    title: 'Horario',
    width: '130px',
    render: (value, row) => (
      <HorarioBadge>
        {formatearHora(value)} - {formatearHora(row.horaFin)}
      </HorarioBadge>
    )
  },
  { 
    key: 'tema', 
    title: 'Tema',
    render: (value) => (
      <span style={{ 
        display: 'block',
        maxWidth: '250px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {value || 'Sin tema definido'}
      </span>
    )
  },
  {
    key: 'realizada',
    title: 'Estado',
    width: '100px',
    render: (value) => (
      <Badge
        $bgColor={value ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}
        $textColor={value ? '#10b981' : '#f59e0b'}
        $borderColor={value ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}
      >
        {value ? 'Realizada' : 'Pendiente'}
      </Badge>
    )
  },
];

// Campos de búsqueda
export const sessionsSearchFields = [
  'codigoSeccion',
  'nombreCurso',
  'tema',
];

// Campos del formulario
export const getSessionsFormFields = (isEditing, secciones = []) => [
  {
    name: 'seccionId',
    label: 'Sección',
    type: 'select',
    options: secciones.map(s => ({
      value: s.id,
      label: `${s.codigo} - ${s.nombreCurso}`
    })),
    required: true,
    disabled: isEditing, // No permitir cambiar sección al editar
  },
  {
    name: 'fecha',
    label: 'Fecha',
    type: 'date',
    required: true,
  },
  [
    {
      name: 'horaInicio',
      label: 'Hora de Inicio',
      type: 'time',
      placeholder: '08:00',
      required: true,
    },
    {
      name: 'horaFin',
      label: 'Hora de Fin',
      type: 'time',
      placeholder: '10:00',
      required: true,
    },
  ],
  {
    name: 'tema',
    label: 'Tema de la Sesión',
    type: 'text',
    placeholder: 'Ej: Introducción a las ecuaciones lineales',
    required: true,
  },
  {
    name: 'observaciones',
    label: 'Observaciones',
    type: 'textarea',
    placeholder: 'Notas adicionales sobre la sesión...',
    rows: 3,
    helperText: 'Información adicional o comentarios',
  },
  ...(isEditing ? [
    {
      name: 'realizada',
      label: 'Sesión realizada',
      type: 'checkbox',
      helperText: 'Marcar si la clase ya se impartió',
    }
  ] : []),
];

// Reglas de validación
export const sessionsValidationRules = {
  seccionId: {
    required: { message: 'Debe seleccionar una sección' },
  },
  fecha: {
    required: { message: 'La fecha es requerida' },
  },
  horaInicio: {
    required: { message: 'La hora de inicio es requerida' },
  },
  horaFin: {
    required: { message: 'La hora de fin es requerida' },
    custom: (value, formData) => {
      if (!value || !formData.horaInicio) return null;
      if (value <= formData.horaInicio) {
        return 'La hora de fin debe ser posterior a la hora de inicio';
      }
      return null;
    },
  },
  tema: {
    required: { message: 'El tema es requerido' },
    minLength: { value: 3, message: 'El tema debe tener al menos 3 caracteres' },
  },
};

// Datos iniciales del formulario
export const getInitialSessionFormData = () => ({
  seccionId: '',
  fecha: new Date().toISOString().split('T')[0],
  horaInicio: '08:00',
  horaFin: '10:00',
  tema: '',
  observaciones: '',
  realizada: false,
});

// Formatear sesión para enviar a la API
export const formatSessionDataForAPI = (formData) => ({
  seccionId: Number(formData.seccionId),
  fecha: `${formData.fecha}T00:00:00`,
  horaInicio: `${formData.horaInicio}:00`,
  horaFin: `${formData.horaFin}:00`,
  tema: formData.tema?.trim(),
  observaciones: formData.observaciones?.trim() || '',
  realizada: formData.realizada ?? false,
});

// Formatear sesión para el formulario
export const formatSessionForForm = (session) => ({
  seccionId: session.seccionId || '',
  fecha: session.fecha ? String(session.fecha).split('T')[0] : '',
  horaInicio: session.horaInicio ? session.horaInicio.substring(0, 5) : '08:00',
  horaFin: session.horaFin ? session.horaFin.substring(0, 5) : '10:00',
  tema: session.tema || '',
  observaciones: session.observaciones || '',
  realizada: session.realizada ?? false,
});

