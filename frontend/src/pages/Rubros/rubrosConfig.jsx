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
export const rubrosColumns = [
  { key: 'id', title: 'ID', width: '60px' },
  { key: 'nombre', title: 'Nombre del Rubro' },
  { key: 'nombreCurso', title: 'Curso' },
  { 
    key: 'grado', 
    title: 'Grado',
    width: '100px',
    render: (value, row) => `${value}° ${row.seccion}`
  },
  { 
    key: 'porcentaje', 
    title: 'Porcentaje',
    width: '120px',
    render: (value) => (
      <Badge
        $bgColor="rgba(59, 130, 246, 0.15)"
        $textColor="#3b82f6"
        $borderColor="rgba(59, 130, 246, 0.3)"
      >
        {value}%
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
export const rubrosSearchFields = [
  'nombre',
  'nombreCurso',
  'descripcion'
];

// Campos del formulario
export const getRubrosFormFields = (isEditing, gruposCursos = []) => [
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
    name: 'nombre',
    label: 'Nombre del Rubro',
    type: 'text',
    placeholder: 'Ej: Examen Parcial 1',
    required: true,
    maxLength: 100,
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    type: 'textarea',
    placeholder: 'Descripción del rubro...',
    maxLength: 300,
    rows: 3,
  },
  {
    name: 'porcentaje',
    label: 'Porcentaje (%)',
    type: 'number',
    placeholder: 'Ej: 20',
    required: true,
    min: 0,
    max: 100,
    step: 0.01,
  },
  {
    name: 'activo',
    label: 'Activo',
    type: 'checkbox',
  },
];

// Reglas de validación
export const rubrosValidationRules = {
  grupoCursoId: {
    required: { message: 'El grupo-curso es requerido' },
    validate: (value) => {
      if (!value || value === '') {
        return 'Debes seleccionar un grupo-curso';
      }
      return true;
    },
  },
  nombre: {
    required: { message: 'El nombre es requerido' },
    maxLength: { value: 100, message: 'Máximo 100 caracteres' },
  },
  descripcion: {
    maxLength: { value: 300, message: 'Máximo 300 caracteres' },
  },
  porcentaje: {
    required: { message: 'El porcentaje es requerido' },
    validate: (value) => {
      const porcentaje = parseFloat(value);
      if (isNaN(porcentaje)) {
        return 'Debe ser un número válido';
      }
      if (porcentaje <= 0 || porcentaje > 100) {
        return 'El porcentaje debe estar entre 0.01 y 100';
      }
      return true;
    },
  },
};

// Datos iniciales del formulario
export const getInitialRubroFormData = () => ({
  grupoCursoId: '',
  nombre: '',
  descripcion: '',
  porcentaje: '',
  activo: true,
});

// Formatear rubro para el formulario
export const formatRubroForForm = (rubro) => ({
  grupoCursoId: rubro.grupoCursoId || '',
  nombre: rubro.nombre || '',
  descripcion: rubro.descripcion || '',
  porcentaje: rubro.porcentaje?.toString() || '',
  activo: rubro.activo ?? true,
});

// Formatear datos para enviar a la API
export const formatRubroDataForAPI = (formData) => ({
  grupoCursoId: parseInt(formData.grupoCursoId, 10),
  nombre: formData.nombre.trim(),
  descripcion: formData.descripcion?.trim() || null,
  porcentaje: parseFloat(formData.porcentaje),
  activo: formData.activo,
});

