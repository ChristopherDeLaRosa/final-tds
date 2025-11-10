import React from 'react';
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
  background: rgba(79, 140, 255, 0.1);
  color: ${theme.colors.accent};
  border: 1px solid rgba(79, 140, 255, 0.3);
  font-size: 12px;
  font-family: 'Courier New', monospace;
`;

const PeriodoBadge = styled.span`
  display: inline-block;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.3);
  font-size: 11px;
`;

const CapacidadBadge = styled.span`
  display: inline-block;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${props => props.$percentage >= 90 
    ? 'rgba(239, 68, 68, 0.1)' 
    : props.$percentage >= 70 
    ? 'rgba(245, 158, 11, 0.1)' 
    : 'rgba(16, 185, 129, 0.1)'};
  color: ${props => props.$percentage >= 90 
    ? '#ef4444' 
    : props.$percentage >= 70 
    ? '#f59e0b' 
    : '#10b981'};
  border: 1px solid ${props => props.$percentage >= 90 
    ? 'rgba(239, 68, 68, 0.3)' 
    : props.$percentage >= 70 
    ? 'rgba(245, 158, 11, 0.3)' 
    : 'rgba(16, 185, 129, 0.3)'};
  font-size: 11px;
`;

export const sectionsColumns = [
  { key: 'id', title: 'ID', width: '60px' },
  { 
    key: 'codigo', 
    title: 'Código',
    width: '130px',
    render: (value) => <CodigoBadge>{value}</CodigoBadge>
  },
  { 
    key: 'nombreCurso',
    title: 'Curso',
    render: (value, row) => (
      <div>
        <div style={{ fontWeight: 600 }}>{value}</div>
        <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>
          {row.codigoCurso}
        </div>
      </div>
    )
  },
  { 
    key: 'nombreDocente',
    title: 'Docente',
    render: (value) => value || 'Sin asignar'
  },
  {
    key: 'periodo',
    title: 'Período',
    width: '120px',
    render: (value) => <PeriodoBadge>{value}</PeriodoBadge>
  },
  { 
    key: 'aula', 
    title: 'Aula',
    width: '100px',
  },
  { 
    key: 'horario', 
    title: 'Horario',
    width: '180px',
    render: (value) => (
      <span style={{ fontSize: '12px' }}>
        {value}
      </span>
    )
  },
  {
    key: 'capacidad',
    title: 'Ocupación',
    width: '110px',
    render: (value, row) => {
      const percentage = row.capacidad > 0 ? (row.inscritos / row.capacidad) * 100 : 0;
      return (
        <CapacidadBadge $percentage={percentage}>
          {row.inscritos}/{value}
        </CapacidadBadge>
      );
    }
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
        {value ? 'Activa' : 'Inactiva'}
      </Badge>
    )
  },
];

export const sectionsSearchFields = [
  'codigo',
  'nombreCurso',
  'codigoCurso',
  'nombreDocente',
  'codigoDocente',
  'periodo',
  'aula',
  'horario',
];

export const periodos = [
  { value: '2024-1', label: '2024-1 (Enero-Mayo)' },
  { value: '2024-2', label: '2024-2 (Junio-Agosto)' },
  { value: '2024-3', label: '2024-3 (Septiembre-Diciembre)' },
  { value: '2025-1', label: '2025-1 (Enero-Mayo)' },
  { value: '2025-2', label: '2025-2 (Junio-Agosto)' },
  { value: '2025-3', label: '2025-3 (Septiembre-Diciembre)' },
];

export const horariosComunes = [
  { value: 'Lun-Mie-Vie 8:00-10:00', label: 'Lun-Mie-Vie 8:00-10:00' },
  { value: 'Lun-Mie-Vie 10:00-12:00', label: 'Lun-Mie-Vie 10:00-12:00' },
  { value: 'Lun-Mie-Vie 14:00-16:00', label: 'Lun-Mie-Vie 14:00-16:00' },
  { value: 'Lun-Mie-Vie 16:00-18:00', label: 'Lun-Mie-Vie 16:00-18:00' },
  { value: 'Mar-Jue 8:00-10:00', label: 'Mar-Jue 8:00-10:00' },
  { value: 'Mar-Jue 10:00-12:00', label: 'Mar-Jue 10:00-12:00' },
  { value: 'Mar-Jue 14:00-16:00', label: 'Mar-Jue 14:00-16:00' },
  { value: 'Mar-Jue 16:00-18:00', label: 'Mar-Jue 16:00-18:00' },
  { value: 'Sábado 8:00-12:00', label: 'Sábado 8:00-12:00' },
  { value: 'Sábado 14:00-18:00', label: 'Sábado 14:00-18:00' },
];

export const getSectionsFormFields = (isEditing, cursos = [], docentes = []) => [
  {
    name: 'codigo',
    label: `Código ${isEditing ? '(No editable)' : ''}`,
    type: 'text',
    placeholder: 'Ej: MAT-101-A, ESP-201-B',
    required: true,
    disabled: isEditing,
    helperText: 'Código único de la sección',
  },
  [
    {
      name: 'cursoId',
      label: 'Curso',
      type: 'select',
      options: cursos.map(c => ({
        value: c.id,
        label: `${c.codigo} - ${c.nombre}`
      })),
      required: true,
      disabled: isEditing,
    },
    {
      name: 'docenteId',
      label: 'Docente',
      type: 'select',
      options: docentes.map(d => ({
        value: d.id,
        label: `${d.nombres} ${d.apellidos}`
      })),
      required: true,
    },
  ],
  [
    {
      name: 'periodo',
      label: 'Período Académico',
      type: 'select',
      options: periodos,
      required: true,
    },
    {
      name: 'aula',
      label: 'Aula',
      type: 'text',
      placeholder: 'Ej: 101, Lab-A, Auditorio',
      required: true,
    },
  ],
  {
    name: 'horario',
    label: 'Horario',
    type: 'select',
    options: horariosComunes,
    required: true,
    helperText: 'Selecciona el horario de clases',
  },
  [
    {
      name: 'capacidad',
      label: 'Capacidad',
      type: 'number',
      placeholder: '30',
      required: true,
      min: 1,
      max: 100,
      helperText: 'Cupos disponibles',
    },
    {
      name: 'inscritos',
      label: 'Inscritos',
      type: 'number',
      placeholder: '0',
      required: false,
      min: 0,
      disabled: !isEditing,
      helperText: 'Estudiantes inscritos actualmente',
    },
  ],
  ...(isEditing ? [
    {
      name: 'activo',
      label: 'Sección activa',
      type: 'checkbox',
      helperText: 'Marcar si la sección está disponible para inscripción',
    }
  ] : []),
];

export const sectionsValidationRules = {
  codigo: {
    required: { message: 'El código es requerido' },
    minLength: { value: 5, message: 'El código debe tener al menos 5 caracteres' },
    pattern: {
      value: /^[A-Z]{3}-\d{3}-[A-Z]$/,
      message: 'Formato: AAA-999-A (ej: MAT-101-A)'
    },
  },
  cursoId: {
    required: { message: 'Debe seleccionar un curso' },
  },
  docenteId: {
    required: { message: 'Debe seleccionar un docente' },
  },
  periodo: {
    required: { message: 'El período es requerido' },
  },
  aula: {
    required: { message: 'El aula es requerida' },
    minLength: { value: 1, message: 'El aula debe tener al menos 1 carácter' },
  },
  horario: {
    required: { message: 'El horario es requerido' },
  },
  capacidad: {
    required: { message: 'La capacidad es requerida' },
    custom: (value) => {
      const num = Number(value);
      if (isNaN(num) || num < 1 || num > 100) {
        return 'La capacidad debe estar entre 1 y 100';
      }
      return null;
    },
  },
  inscritos: {
    custom: (value, formData) => {
      if (value === '' || value === null || value === undefined) return null;
      const num = Number(value);
      const capacidad = Number(formData.capacidad);
      if (isNaN(num) || num < 0) {
        return 'Los inscritos no pueden ser negativos';
      }
      if (num > capacidad) {
        return 'Los inscritos no pueden exceder la capacidad';
      }
      return null;
    },
  },
};

export const getInitialSectionFormData = () => ({
  codigo: '',
  cursoId: '',
  docenteId: '',
  periodo: '',
  aula: '',
  horario: '',
  capacidad: 30,
  inscritos: 0,
  activo: true,
});

export const formatSectionDataForAPI = (formData) => ({
  codigo: formData.codigo?.trim().toUpperCase(),
  cursoId: Number(formData.cursoId),
  docenteId: Number(formData.docenteId),
  periodo: formData.periodo,
  aula: formData.aula?.trim(),
  horario: formData.horario,
  capacidad: Number(formData.capacidad),
  inscritos: Number(formData.inscritos) || 0,
  activo: formData.activo ?? true,
});

export const formatSectionForForm = (section) => ({
  codigo: section.codigo || '',
  cursoId: section.cursoId || '',
  docenteId: section.docenteId || '',
  periodo: section.periodo || '',
  aula: section.aula || '',
  horario: section.horario || '',
  capacidad: section.capacidad || 30,
  inscritos: section.inscritos || 0,
  activo: section.activo ?? true,
});

