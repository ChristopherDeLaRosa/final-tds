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
export const sesionesColumns = [
  { 
    key: 'fecha', 
    title: 'Fecha',
    width: '120px',
    render: (value) => new Date(value).toLocaleDateString('es-DO')
  },
  { 
    key: 'horaInicio', 
    title: 'Hora Inicio',
    width: '110px',
    render: (value) => value.substring(0, 5)
  },
  { 
    key: 'horaFin', 
    title: 'Hora Fin',
    width: '100px',
    render: (value) => value.substring(0, 5)
  },
  { key: 'nombreCurso', title: 'Curso' },
  { 
    key: 'grado', 
    title: 'Grado',
    width: '100px',
    render: (value, row) => `${value}° ${row.seccion}`
  },
  { key: 'tema', title: 'Tema' },
  { 
    key: 'totalAsistencias', 
    title: 'Asistencias',
    width: '110px',
    render: (value, row) => {
      if (!value) return '-';
      return (
        <Badge
          $bgColor="rgba(59, 130, 246, 0.15)"
          $textColor="#3b82f6"
          $borderColor="rgba(59, 130, 246, 0.3)"
        >
          {row.presentes}/{value}
        </Badge>
      );
    }
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
export const sesionesSearchFields = [
  'nombreCurso',
  'tema',
  'codigoGrupo',
  'seccion'
];

// Opciones de filtros dinámicos con metadata
export const getSesionesFilterOptions = (sesiones = []) => {
  // Obtener cursos únicos
  const cursosUnicos = [...new Set(sesiones.map(s => s.nombreCurso))]
    .filter(Boolean)
    .sort();

  // Obtener fechas únicas (agrupadas por mes)
  const fechasUnicas = [...new Set(sesiones.map(s => {
    const fecha = new Date(s.fecha);
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  }))].sort().reverse();

  return {
    nombreCurso: {
      label: 'Curso',
      options: [
        { value: '', label: 'Todos los cursos' },
        ...cursosUnicos.map(curso => ({
          value: curso,
          label: curso
        }))
      ]
    },
    fechaMes: {
      label: 'Mes',
      options: [
        { value: '', label: 'Todos los meses' },
        ...fechasUnicas.map(fechaMes => {
          const [year, month] = fechaMes.split('-');
          const fecha = new Date(year, parseInt(month) - 1);
          const nombreMes = fecha.toLocaleDateString('es-DO', { 
            month: 'long', 
            year: 'numeric' 
          });
          return {
            value: fechaMes,
            label: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)
          };
        })
      ]
    }
  };
};

// Campos del formulario
export const getSesionesFormFields = (isEditing, gruposCursos = []) => [
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
        label: `${g.codigo} - ${g.nombreCurso} (${g.grado}° ${g.seccion})`
      }))
    ],
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
      required: true,
    },
    {
      name: 'horaFin',
      label: 'Hora de Fin',
      type: 'time',
      required: true,
    },
  ],
  {
    name: 'tema',
    label: 'Tema de la Clase',
    type: 'text',
    placeholder: 'Ej: Introducción al álgebra',
    maxLength: 100,
  },
  {
    name: 'observaciones',
    label: 'Observaciones',
    type: 'textarea',
    placeholder: 'Observaciones adicionales sobre la sesión...',
    maxLength: 500,
    rows: 3,
  },
  ...(isEditing ? [
    {
      name: 'realizada',
      label: 'Sesión Realizada',
      type: 'checkbox',
    },
  ] : []),
];

// Reglas de validación
export const sesionesValidationRules = {
  grupoCursoId: {
    required: { message: 'El grupo-curso es requerido' },
    validate: (value) => {
      if (!value || value === '') {
        return 'Debes seleccionar un grupo-curso';
      }
      return true;
    },
  },
  fecha: {
    required: { message: 'La fecha es requerida' },
  },
  horaInicio: {
    required: { message: 'La hora de inicio es requerida' },
  },
  horaFin: {
    required: { message: 'La hora de fin es requerida' },
    validate: (value, formData) => {
      if (!formData.horaInicio || !value) return true;
      
      const inicio = formData.horaInicio.split(':');
      const fin = value.split(':');
      
      const inicioMinutos = parseInt(inicio[0]) * 60 + parseInt(inicio[1]);
      const finMinutos = parseInt(fin[0]) * 60 + parseInt(fin[1]);
      
      if (finMinutos <= inicioMinutos) {
        return 'La hora de fin debe ser posterior a la hora de inicio';
      }
      return true;
    },
  },
  tema: {
    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
  },
  observaciones: {
    maxLength: { value: 500, message: 'Máximo 500 caracteres' },
  },
};

// Datos iniciales del formulario
export const getInitialSesionFormData = () => ({
  grupoCursoId: '',
  fecha: new Date().toISOString().split('T')[0],
  horaInicio: '08:00',
  horaFin: '09:30',
  tema: '',
  observaciones: '',
  realizada: false,
});

// Formatear fecha para el formulario
const formatDateForForm = (fecha) => {
  if (!fecha) return '';
  return String(fecha).split('T')[0];
};

// Formatear sesión para el formulario
export const formatSesionForForm = (sesion) => ({
  grupoCursoId: sesion.grupoCursoId || '',
  fecha: formatDateForForm(sesion.fecha),
  horaInicio: sesion.horaInicio?.substring(0, 5) || '08:00',
  horaFin: sesion.horaFin?.substring(0, 5) || '09:30',
  tema: sesion.tema || '',
  observaciones: sesion.observaciones || '',
  realizada: sesion.realizada ?? false,
});

// Formatear datos para enviar a la API
export const formatSesionDataForAPI = (formData) => ({
  grupoCursoId: parseInt(formData.grupoCursoId, 10),
  fecha: `${formData.fecha}T00:00:00`,
  horaInicio: `${formData.horaInicio}:00`,
  horaFin: `${formData.horaFin}:00`,
  tema: formData.tema?.trim() || null,
  observaciones: formData.observaciones?.trim() || null,
  realizada: formData.realizada,
});