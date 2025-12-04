// src/pages/Periodos/periodosConfig.js
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

const ActionButton = styled.button`
  padding: 6px 12px;
  font-size: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: ${props => props.$bg};
  color: ${props => props.$color};
  font-weight: 600;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-DO', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Calcular días restantes
const calcularDiasRestantes = (fechaFin) => {
  if (!fechaFin) return 0;
  const hoy = new Date();
  const fin = new Date(fechaFin);
  const diff = fin - hoy;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Columnas de la tabla (ahora es una función para inyectar acciones)
export const getPeriodosColumns = (handleSetActual) => [
  { 
    key: 'nombre', 
    title: 'Año Escolar',
    width: '140px',
    render: (value) => (
      <Badge
        $bgColor="rgba(59, 130, 246, 0.15)"
        $textColor="#3b82f6"
        $borderColor="rgba(59, 130, 246, 0.3)"
      >
        {value}
      </Badge>
    )
  },
  { 
    key: 'trimestre', 
    title: 'Trimestre',
    width: '120px',
    render: (value) => {
      const colors = {
        'Primero': { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
        'Segundo': { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
        'Tercero': { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' }
      };
      const color = colors[value] || colors['Primero'];
      
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
    key: 'fechaInicio', 
    title: 'Fecha Inicio',
    width: '130px',
    render: (value) => formatDate(value)
  },
  { 
    key: 'fechaFin', 
    title: 'Fecha Fin',
    width: '130px',
    render: (value) => formatDate(value)
  },
  { 
    key: 'diasRestantes', 
    title: 'Días Restantes',
    width: '130px',
    render: (_, row) => {
      const dias = calcularDiasRestantes(row.fechaFin);
      if (dias < 0) return <span style={{ color: '#9ca3af' }}>Finalizado</span>;
      if (dias === 0) return <span style={{ color: '#f59e0b' }}>Hoy finaliza</span>;
      return <span style={{ color: dias <= 30 ? '#ef4444' : '#10b981' }}>{dias} días</span>;
    }
  },
  {
    key: 'esActual',
    title: 'Estado',
    width: '120px',
    render: (value, row) => {
      // 1. Si es el período actual
      if (value) {
        return (
          <Badge
            $bgColor="rgba(16, 185, 129, 0.15)"
            $textColor="#10b981"
            $borderColor="rgba(16, 185, 129, 0.3)"
          >
            Actual
          </Badge>
        );
      }
      
      // 2. Si NO está activo (Activo = false)
      if (!row.activo) {
        return (
          <Badge
            $bgColor="rgba(239, 68, 68, 0.15)"
            $textColor="#ef4444"
            $borderColor="rgba(239, 68, 68, 0.3)"
          >
            Cerrado
          </Badge>
        );
      }

      // 3. Si está activo, verificar fechas
      const fechaInicio = new Date(row.fechaInicio);
      const fechaFin = new Date(row.fechaFin);
      const hoy = new Date();
      
      // Si la fecha de fin ya pasó
      if (fechaFin < hoy) {
        return (
          <Badge
            $bgColor="rgba(156, 163, 175, 0.15)"
            $textColor="#6b7280"
            $borderColor="rgba(156, 163, 175, 0.3)"
          >
            Finalizado
          </Badge>
        );
      }

      // Si aún no ha comenzado
      if (fechaInicio > hoy) {
        return (
          <Badge
            $bgColor="rgba(59, 130, 246, 0.15)"
            $textColor="#3b82f6"
            $borderColor="rgba(59, 130, 246, 0.3)"
          >
            Próximo
          </Badge>
        );
      }

      // Si está en curso pero NO es el actual
      return (
        <Badge
          $bgColor="rgba(16, 185, 129, 0.15)"
          $textColor="#10b981"
          $borderColor="rgba(16, 185, 129, 0.3)"
        >
          Activo
        </Badge>
      );
    }
  },
  {
    key: 'accionesRapidas',
    title: 'Acción',
    width: '150px',
    render: (_, row) => {
      return (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {!row.esActual && row.activo && (
            <ActionButton
              onClick={() => handleSetActual(row)}
              $bg="rgba(59, 130, 246, 0.15)"
              $color="#3b82f6"
              title="Establecer como actual"
            >
              Establecer Actual
            </ActionButton>
          )}
          
          {row.esActual && (
            <span style={{ 
              padding: '6px 12px',
              fontSize: '12px',
              color: '#10b981',
              fontWeight: '600'
            }}>
              Es actual
            </span>
          )}
        </div>
      );
    }
  }
];

// Campos de búsqueda
export const periodosSearchFields = [
  'nombre',
  'trimestre',
  'observaciones'
];

// Campos del formulario
export const getPeriodosFormFields = (isEditing) => [
  {
    name: 'nombre',
    label: 'Año Escolar',
    type: 'text',
    placeholder: 'Ej: 2024-2025',
    required: true,
    maxLength: 20,
  },
  {
    name: 'trimestre',
    label: 'Trimestre',
    type: 'select',
    required: true,
    options: [
      { value: '', label: 'Selecciona un trimestre' },
      { value: 'Primero', label: 'Primer Trimestre' },
      { value: 'Segundo', label: 'Segundo Trimestre' },
      { value: 'Tercero', label: 'Tercer Trimestre' }
    ]
  },
  {
    name: 'fechaInicio',
    label: 'Fecha de Inicio',
    type: 'date',
    required: true,
  },
  {
    name: 'fechaFin',
    label: 'Fecha de Fin',
    type: 'date',
    required: true,
  },
  {
    name: 'observaciones',
    label: 'Observaciones',
    type: 'textarea',
    placeholder: 'Notas adicionales sobre este período',
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
export const periodosValidationRules = {
  nombre: {
    required: { message: 'El año escolar es requerido' },
    maxLength: { value: 20, message: 'Máximo 20 caracteres' },
    pattern: {
      value: /^\d{4}-\d{4}$/,
      message: 'Formato inválido. Usa: YYYY-YYYY (ej: 2024-2025)'
    }
  },
  trimestre: {
    required: { message: 'El trimestre es requerido' },
    validate: (value) => {
      const validos = ['Primero', 'Segundo', 'Tercero'];
      if (!validos.includes(value)) {
        return 'Selecciona un trimestre válido';
      }
      return true;
    }
  },
  fechaInicio: {
    required: { message: 'La fecha de inicio es requerida' },
    validate: (value) => {
      const inicio = new Date(value);
      if (isNaN(inicio.getTime())) {
        return 'Fecha de inicio inválida';
      }
      return true;
    }
  },
  fechaFin: {
    required: { message: 'La fecha de fin es requerida' },
    validate: (value, formData) => {
      const fin = new Date(value);
      if (isNaN(fin.getTime())) {
        return 'Fecha de fin inválida';
      }
      
      if (formData.fechaInicio) {
        const inicio = new Date(formData.fechaInicio);
        if (fin <= inicio) {
          return 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
      }
      
      return true;
    }
  },
  observaciones: {
    maxLength: { value: 500, message: 'Máximo 500 caracteres' }
  }
};

// Datos iniciales del formulario
export const getInitialPeriodoFormData = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const nextYear = currentYear + 1;
  
  return {
    nombre: `${currentYear}-${nextYear}`,
    trimestre: '',
    fechaInicio: '',
    fechaFin: '',
    observaciones: '',
    activo: true,
    esActual: false
  };
};

// Formatear período para el formulario
export const formatPeriodoForForm = (periodo) => {
  const fechaInicio = periodo.fechaInicio ? periodo.fechaInicio.split('T')[0] : '';
  const fechaFin = periodo.fechaFin ? periodo.fechaFin.split('T')[0] : '';

  return {
    nombre: periodo.nombre || '',
    trimestre: periodo.trimestre || '',
    fechaInicio: fechaInicio,
    fechaFin: fechaFin,
    observaciones: periodo.observaciones || '',
    activo: periodo.activo ?? true,
    esActual: periodo.esActual ?? false
  };
};

// Formatear datos para enviar a la API
export const formatPeriodoDataForAPI = (formData) => {
  return {
    nombre: formData.nombre.trim(),
    trimestre: formData.trimestre,
    fechaInicio: formData.fechaInicio,
    fechaFin: formData.fechaFin,
    observaciones: formData.observaciones?.trim() || null,
    activo: formData.activo,
    esActual: formData.esActual ?? false
  };
};