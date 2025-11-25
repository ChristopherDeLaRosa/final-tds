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
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-size: 12px;
`;

// Columnas de la tabla
export const gruposCursosColumns = [
  { key: 'id', title: 'ID', width: '60px' },
  { 
    key: 'codigo', 
    title: 'Código',
    width: '120px',
    render: (value) => <CodigoBadge>{value}</CodigoBadge>
  },
  { key: 'nombreCurso', title: 'Curso' },
  { 
    key: 'grado', 
    title: 'Grado',
    width: '100px',
    render: (value, row) => `${value}° ${row.seccion}`
  },
  { key: 'nombreDocente', title: 'Docente' },
  { key: 'periodo', title: 'Período', width: '120px' },
  { key: 'aula', title: 'Aula', width: '80px' },
  { 
    key: 'cantidadEstudiantes', 
    title: 'Estudiantes',
    width: '110px',
    render: (value, row) => (
      <Badge
        $bgColor={value >= row.capacidadMaxima ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)'}
        $textColor={value >= row.capacidadMaxima ? '#ef4444' : '#3b82f6'}
        $borderColor={value >= row.capacidadMaxima ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}
      >
        {value}/{row.capacidadMaxima}
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
export const gruposCursosSearchFields = [
  'codigo',
  'nombreCurso',
  'nombreDocente',
  'seccion',
  'periodo',
  'aula'
];

// Campos del formulario (necesita cursos y docentes para los selects)
export const getGruposCursosFormFields = (isEditing, cursos = [], docentes = []) => [
  {
    name: 'codigo',
    label: `Código del Grupo ${isEditing ? '(No editable)' : ''}`,
    type: 'text',
    placeholder: 'Ej: 8A-MAT',
    required: true,
    disabled: isEditing,
    maxLength: 20,
  },
  {
    name: 'cursoId',
    label: 'Curso',
    type: 'select',
    required: true,
    options: [
      { value: '', label: 'Selecciona un curso' },
      ...cursos.map(c => ({
        value: c.id,
        label: `${c.codigo} - ${c.nombre} (${c.nivelGrado}°)`
      }))
    ],
  },
  {
    name: 'docenteId',
    label: 'Docente',
    type: 'select',
    required: true,
    options: [
      { value: '', label: 'Selecciona un docente' },
      ...docentes.map(d => ({
        value: d.id,
        label: `${d.codigo} - ${d.nombreCompleto || `${d.nombres} ${d.apellidos}`}`
      }))
    ],
  },
  [
    {
      name: 'grado',
      label: 'Grado',
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
    {
      name: 'seccion',
      label: 'Sección',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Selecciona sección' },
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' },
      ],
    },
  ],
  [
    {
      name: 'anio',
      label: 'Año',
      type: 'number',
      placeholder: '2024',
      required: true,
      min: 2020,
      max: 2030,
    },
    {
      name: 'periodo',
      label: 'Período',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Selecciona período' },
        { value: '2024-2025', label: '2024-2025' },
        { value: '2025-2026', label: '2025-2026' },
        { value: '2026-2027', label: '2026-2027' },
      ],
    },
  ],
  [
    {
      name: 'aula',
      label: 'Aula',
      type: 'text',
      placeholder: 'Ej: A-101',
      maxLength: 50,
    },
    {
      name: 'capacidadMaxima',
      label: 'Capacidad Máxima',
      type: 'number',
      placeholder: '30',
      required: true,
      min: 1,
      max: 50,
    },
  ],
  {
    name: 'horario',
    label: 'Horario',
    type: 'textarea',
    placeholder: 'Ej: Lunes 8:00-9:30, Miércoles 10:00-11:30',
    maxLength: 200,
    rows: 3,
  },
  {
    name: 'activo',
    label: 'Activo',
    type: 'checkbox',
  },
];

// Reglas de validación
export const gruposCursosValidationRules = {
  codigo: {
    required: { message: 'El código es requerido' },
    maxLength: { value: 20, message: 'Máximo 20 caracteres' },
    pattern: {
      value: /^[A-Z0-9-]+$/,
      message: 'Solo letras mayúsculas, números y guiones',
    },
  },
  cursoId: {
    required: { message: 'El curso es requerido' },
    validate: (value) => {
      if (!value || value === '') {
        return 'Debes seleccionar un curso';
      }
      return true;
    },
  },
  docenteId: {
    required: { message: 'El docente es requerido' },
    validate: (value) => {
      if (!value || value === '') {
        return 'Debes seleccionar un docente';
      }
      return true;
    },
  },
  grado: {
    required: { message: 'El grado es requerido' },
    validate: (value) => {
      const grado = parseInt(value);
      if (grado < 1 || grado > 12) {
        return 'El grado debe estar entre 1 y 12';
      }
      return true;
    },
  },
  seccion: {
    required: { message: 'La sección es requerida' },
  },
  anio: {
    required: { message: 'El año es requerido' },
    validate: (value) => {
      const anio = parseInt(value);
      if (anio < 2020 || anio > 2030) {
        return 'Año inválido';
      }
      return true;
    },
  },
  periodo: {
    required: { message: 'El período es requerido' },
  },
  aula: {
    maxLength: { value: 50, message: 'Máximo 50 caracteres' },
  },
  capacidadMaxima: {
    required: { message: 'La capacidad máxima es requerida' },
    validate: (value) => {
      const capacidad = parseInt(value);
      if (capacidad < 1 || capacidad > 50) {
        return 'Debe estar entre 1 y 50 estudiantes';
      }
      return true;
    },
  },
  horario: {
    maxLength: { value: 200, message: 'Máximo 200 caracteres' },
  },
};

// Datos iniciales del formulario
export const getInitialGrupoCursoFormData = () => ({
  codigo: '',
  cursoId: '',
  docenteId: '',
  grado: '',
  seccion: '',
  anio: new Date().getFullYear(),
  periodo: '2024-2025',
  aula: '',
  horario: '',
  capacidadMaxima: 30,
  activo: true,
});

// Formatear grupo-curso para el formulario
export const formatGrupoCursoForForm = (grupoCurso) => ({
  codigo: grupoCurso.codigo || '',
  cursoId: grupoCurso.cursoId || '',
  docenteId: grupoCurso.docenteId || '',
  grado: grupoCurso.grado || '',
  seccion: grupoCurso.seccion || '',
  anio: grupoCurso.anio || new Date().getFullYear(),
  periodo: grupoCurso.periodo || '',
  aula: grupoCurso.aula || '',
  horario: grupoCurso.horario || '',
  capacidadMaxima: grupoCurso.capacidadMaxima || 30,
  activo: grupoCurso.activo ?? true,
});

// Formatear datos para enviar a la API
export const formatGrupoCursoDataForAPI = (formData) => ({
  codigo: formData.codigo.trim().toUpperCase(),
  cursoId: parseInt(formData.cursoId, 10),
  docenteId: parseInt(formData.docenteId, 10),
  grado: parseInt(formData.grado, 10),
  seccion: formData.seccion.trim().toUpperCase(),
  anio: parseInt(formData.anio, 10),
  periodo: formData.periodo.trim(),
  aula: formData.aula?.trim() || null,
  horario: formData.horario?.trim() || null,
  capacidadMaxima: parseInt(formData.capacidadMaxima, 10),
  activo: formData.activo,
});
