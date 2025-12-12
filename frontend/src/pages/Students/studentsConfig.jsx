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
  { 
    key: 'matricula', 
    title: 'Matrícula',
    width: '120px',
    render: (value) => <MatriculaBadge>{value}</MatriculaBadge>
  },
  { key: 'nombreCompleto', title: 'Nombre Completo' },
  { 
    key: 'gradoActual', 
    title: 'Grado',
    width: '80px',
    render: (value, row) => `${value}° ${row.seccionActual}`
  },
  {
    key: 'aulaId',
    title: 'Aula',
    width: '150px',
    render: (value, row) => {
      if (!value) {
        return (
          <Badge
            $bgColor="rgba(156, 163, 175, 0.15)"
            $textColor="#6B7280"
            $borderColor="rgba(156, 163, 175, 0.3)"
          >
            Sin asignar
          </Badge>
        );
      }
      return (
        <Badge
          $bgColor="rgba(59, 130, 246, 0.15)"
          $textColor="#3B82F6"
          $borderColor="rgba(59, 130, 246, 0.3)"
        >
          Aula #{value}
        </Badge>
      );
    }
  },
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
  'telefono',
  'seccionActual'
];

// Opciones de filtros dinámicos
export const getStudentsFilterOptions = (estudiantes = []) => {
  // Obtener grados únicos
  const gradosUnicos = [...new Set(estudiantes.map(e => e.gradoActual))]
    .filter(v => v != null)
    .map(v => Number(v))
    .sort((a, b) => a - b);

  // Obtener secciones únicas
  const seccionesUnicas = [...new Set(estudiantes.map(e => e.seccionActual))]
    .filter(Boolean)
    .sort();

  // Obtener estados de aula
  const estadosAula = [
    { value: 'conAula', label: 'Con aula asignada', count: estudiantes.filter(e => e.aulaId).length },
    { value: 'sinAula', label: 'Sin aula asignada', count: estudiantes.filter(e => !e.aulaId).length }
  ];

  return {
    gradoActual: {
      label: 'Grado',
      options: [
        { value: '', label: 'Todos los grados' },
        ...gradosUnicos.map(grado => ({
          value: grado,
          label: `${grado}°`
        }))
      ]
    },
    seccionActual: {
      label: 'Sección',
      options: [
        { value: '', label: 'Todas las secciones' },
        ...seccionesUnicas.map(seccion => ({
          value: seccion,
          label: `Sección ${seccion}`
        }))
      ]
    },
  };
};

// Campos del formulario
export const getStudentsFormFields = (isEditing) => [
  {
  name: 'matricula',
  label: 'Matrícula',
  type: 'text',
  disabled: true,
  required: false,
  placeholder: '',
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
    placeholder: 'estudiante@colegio.edu',
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
    maxLength: 200,
  },
  [
    {
      name: 'gradoActual',
      label: 'Grado Actual',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Selecciona un grado' },
        { value: 1, label: '1° Primaria' },
        { value: 2, label: '2° Primaria' },
        { value: 3, label: '3° Primaria' },
        { value: 4, label: '4° Primaria' },
        { value: 5, label: '5° Primaria' },
        { value: 6, label: '6° Primaria' },
        { value: 7, label: '1° Secundaria' },
        { value: 8, label: '2° Secundaria' },
        { value: 9, label: '3° Secundaria' },
        { value: 10, label: '4° Secundaria' },
        { value: 11, label: '5° Secundaria' },
        { value: 12, label: '6° Secundaria' },
      ],
    },
    {
      name: 'seccionActual',
      label: 'Sección Actual',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Selecciona una sección' },
        { value: 'A', label: 'Sección A' },
        { value: 'B', label: 'Sección B' },
        { value: 'C', label: 'Sección C' },
        { value: 'D', label: 'Sección D' },
      ],
    },
  ],
  {
    name: 'aulaId',
    label: 'Asignar a Aula (Opcional)',
    type: 'select',
    required: false,
    options: [{ value: '', label: 'Sin asignar - Asignar después' }],
    note: 'Selecciona primero el grado y sección. Las aulas compatibles se mostrarán automáticamente.',
    disabled: true, // Se habilita dinámicamente cuando se seleccione grado y sección
  },
  ...(!isEditing ? [{
    name: 'fechaIngreso',
    label: 'Fecha de Ingreso',
    type: 'date',
  }] : []),
  {
    name: 'nombreTutor',
    label: 'Nombre del Tutor',
    type: 'text',
    placeholder: 'Nombre completo del padre/madre/tutor',
    maxLength: 100,
  },
  [
    {
      name: 'telefonoTutor',
      label: 'Teléfono del Tutor',
      type: 'tel',
      placeholder: '809-555-1234',
      maxLength: 20,
    },
    {
      name: 'emailTutor',
      label: 'Email del Tutor',
      type: 'email',
      placeholder: 'tutor@email.com',
      maxLength: 150,
    },
  ],
  {
    name: 'observacionesMedicas',
    label: 'Observaciones Médicas',
    type: 'textarea',
    placeholder: 'Alergias, condiciones especiales, medicamentos...',
    maxLength: 500,
    rows: 3,
  },
  {
    name: 'activo',
    label: 'Activo',
    type: 'checkbox',
  },
];

// Reglas de validación
export const studentsValidationRules = {
  matricula: {
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
      message: 'El email no es válido' 
    },
    maxLength: { value: 150, message: 'Máximo 150 caracteres' },
  },
  telefono: {
    maxLength: { value: 20, message: 'Máximo 20 caracteres' },
  },
  fechaNacimiento: {
    required: { message: 'La fecha de nacimiento es requerida' },
    validate: (value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 3 || age > 25) {
        return 'La edad debe estar entre 3 y 25 años';
      }
      return true;
    },
  },
  direccion: {
    maxLength: { value: 200, message: 'Máximo 200 caracteres' },
  },
  gradoActual: {
    required: { message: 'El grado es requerido' },
    validate: (value) => {
      const grado = parseInt(value);
      if (grado < 1 || grado > 12) {
        return 'El grado debe estar entre 1 y 12';
      }
      return true;
    },
  },
  seccionActual: {
    required: { message: 'La sección es requerida' },
  },
  nombreTutor: {
    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
  },
  telefonoTutor: {
    maxLength: { value: 20, message: 'Máximo 20 caracteres' },
  },
  emailTutor: {
    pattern: { 
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
      message: 'El email del tutor no es válido' 
    },
    maxLength: { value: 150, message: 'Máximo 150 caracteres' },
  },
  observacionesMedicas: {
    maxLength: { value: 500, message: 'Máximo 500 caracteres' },
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
  gradoActual: '',
  seccionActual: '',
  aulaId: '',
  nombreTutor: '',
  telefonoTutor: '',
  emailTutor: '',
  observacionesMedicas: '',
  activo: true,
});

// Formatear fecha para el formulario
export const formatDateForForm = (fecha) => {
  if (!fecha) return '';
  return String(fecha).split('T')[0];
};

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
  gradoActual: estudiante.gradoActual || '',
  seccionActual: estudiante.seccionActual || '',
  aulaId: estudiante.aulaId || '',
  nombreTutor: estudiante.nombreTutor || '',
  telefonoTutor: estudiante.telefonoTutor || '',
  emailTutor: estudiante.emailTutor || '',
  observacionesMedicas: estudiante.observacionesMedicas || '',
  activo: estudiante.activo ?? true,
});

// Formatear datos para enviar a la API
export const formatStudentDataForAPI = (formData) => ({
  matricula: formData.matricula?.trim().toUpperCase() || '',
  nombres: formData.nombres.trim(),
  apellidos: formData.apellidos.trim(),
  email: formData.email.trim().toLowerCase(),
  telefono: formData.telefono?.trim() || null,
  direccion: formData.direccion?.trim() || null,
  fechaNacimiento: formData.fechaNacimiento ? `${formData.fechaNacimiento}T00:00:00` : null,
  fechaIngreso: formData.fechaIngreso ? `${formData.fechaIngreso}T00:00:00` : null,
  gradoActual: parseInt(formData.gradoActual, 10),
  seccionActual: formData.seccionActual.trim().toUpperCase(),
  aulaId: formData.aulaId ? parseInt(formData.aulaId, 10) : null,
  nombreTutor: formData.nombreTutor?.trim() || null,
  telefonoTutor: formData.telefonoTutor?.trim() || null,
  emailTutor: formData.emailTutor?.trim().toLowerCase() || null,
  observacionesMedicas: formData.observacionesMedicas?.trim() || null,
  activo: formData.activo,
});

