import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  ArrowLeft,
  Calendar,
  Users,
  BookOpen,
  Clock,
  Plus,
  Trash2,
  Save,
  Zap,
  Settings,
  AlertCircle,
  Grid3x3,
  List,
  Edit,
  Lock,
} from 'lucide-react';
import { theme } from '../../styles';
import aulaService from '../../services/aulaService';
import cursoService from '../../services/cursoService';
import docenteService from '../../services/docenteService';
import { MySwal, Toast } from '../../utils/alerts';
import Button from '../../components/atoms/Button/Button';
import Select from '../../components/atoms/Select/Select';
import Input from '../../components/atoms/Input/Input';

// Styled Components
const Container = styled.div`
  padding: ${theme.spacing.xl};
  max-width: 1600px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
`;

const BackButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.text};
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${theme.colors.textMuted};
  margin: 8px 0 0 0;
`;

const Card = styled.div`
  background: ${theme.colors.bg || '#ffffff'};
  border: 1px solid ${theme.colors.border || '#e5e7eb'};
  border-radius: ${theme.borderRadius?.md || '8px'};
  padding: ${theme.spacing?.lg || '1.5rem'};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: ${theme.spacing.lg};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const StatCard = styled.div`
  background: ${props => props.$bgColor || theme.colors.bg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${theme.colors.textMuted};
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const ViewToggle = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  background: ${theme.colors.bgSecondary};
  padding: 4px;
  border-radius: ${theme.borderRadius.md};
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${props => props.$active ? theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : theme.colors.text};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? theme.colors.primary : 'rgba(0,0,0,0.05)'};
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: 80px repeat(5, 1fr);
  gap: 2px;
  background: ${theme.colors.border};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
`;

const TimeSlot = styled.div`
  background: ${theme.colors.bgSecondary};
  padding: ${theme.spacing.sm};
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DayHeader = styled.div`
  background: ${theme.colors.primary}10;
  padding: ${theme.spacing.md};
  text-align: center;
  font-weight: 600;
  color: ${theme.colors.primary};
  font-size: 14px;
`;

const ClassSlot = styled.div`
  background: ${props => {
    if (props.$isOccupied) return '#f1f5f9';
    return props.$hasClass ? props.$color || theme.colors.primary + '20' : theme.colors.bg;
  }};
  padding: ${theme.spacing.sm};
  min-height: 80px;
  cursor: ${props => {
    if (props.$isOccupied) return 'not-allowed';
    return props.$hasClass ? 'pointer' : 'pointer';
  }};
  position: relative;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: ${props => props.$isOccupied ? 0.6 : 1};

  &:hover {
    ${props => props.$hasClass && !props.$isOccupied && `
      transform: scale(1.02);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1;
    `}
  }

  ${props => !props.$hasClass && !props.$isOccupied && `
    border: 2px dashed transparent;
    &:hover {
      border-color: ${theme.colors.border};
      background: ${theme.colors.bgSecondary};
    }
  `}

  ${props => props.$isOccupied && `
    border: 2px solid ${theme.colors.border};
    &:hover {
      opacity: 0.7;
    }
  `}
`;

const ClassInfo = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${theme.colors.text};
  line-height: 1.3;
`;

const ClassTime = styled.div`
  font-size: 10px;
  color: ${theme.colors.textMuted};
  font-family: monospace;
`;

const ClassTeacher = styled.div`
  font-size: 10px;
  color: ${theme.colors.textSecondary};
  margin-top: 2px;
`;

const EditButton = styled.button`
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;

  ${ClassSlot}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(37, 99, 235, 1);
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;

  ${ClassSlot}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(220, 38, 38, 1);
  }
`;

const QuickAddModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${theme.colors.bgSecondary};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${theme.colors.text};
  
  &:hover {
    background: ${theme.colors.border};
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: ${theme.spacing.md};
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const TemplateCard = styled.div`
  border: 2px solid ${props => props.$selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$selected ? theme.colors.primary + '10' : 'transparent'};

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const TemplateName = styled.div`
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: 4px;
`;

const TemplateDesc = styled.div`
  font-size: 12px;
  color: ${theme.colors.textMuted};
`;

const ActionsBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;

const AlertBox = styled.div`
  background: ${props => props.$type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  border: 1px solid ${props => props.$type === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'};
  color: ${props => props.$type === 'warning' ? '#f59e0b' : '#3b82f6'};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid ${theme.colors.border};
  border-top: 3px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const NewBadge = styled.div`
  position: absolute;
  top: 4px;
  right: 28px;
  background: #10b981;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ConflictBadge = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  background: #ef4444;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
`;

const OccupiedBadge = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: ${theme.colors.textMuted};
  pointer-events: none;
`;

// Datos
const DIAS_SEMANA = [
  { value: 1, label: 'Lunes', short: 'L' },
  { value: 2, label: 'Martes', short: 'M' },
  { value: 3, label: 'Miércoles', short: 'X' },
  { value: 4, label: 'Jueves', short: 'J' },
  { value: 5, label: 'Viernes', short: 'V' },
];

const HORAS_DIA = [
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
];

const PLANTILLAS_HORARIO = [
  {
    id: 'basico',
    nombre: 'Horario Básico',
    descripcion: '8am-12pm, Lunes a Viernes',
    horaInicio: '08:00',
    horaFin: '12:00',
  },
  {
    id: 'completo',
    nombre: 'Jornada Completa',
    descripcion: '8am-3pm, Lunes a Viernes',
    horaInicio: '08:00',
    horaFin: '15:00',
  },
  {
    id: 'tarde',
    nombre: 'Jornada Tarde',
    descripcion: '1pm-5pm, Lunes a Viernes',
    horaInicio: '13:00',
    horaFin: '17:00',
  },
  {
    id: 'personalizado',
    nombre: 'Personalizado',
    descripcion: 'Define tu propio horario',
    horaInicio: '08:00',
    horaFin: '12:00',
  },
];

const COLORES_CURSOS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
  '#10b981', '#06b6d4', '#6366f1', '#84cc16'
];

// Componente Principal
export default function ConfigurarAula() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [aula, setAula] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('calendar');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [conflictos, setConflictos] = useState([]);

  const [quickAdd, setQuickAdd] = useState({
    cursoId: '',
    docenteId: '',
    plantilla: 'basico',
    horaInicio: '08:00',
    horaFin: '09:00',
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHorario, setEditingHorario] = useState(null);
  const [editFormData, setEditFormData] = useState({
    docenteId: '',
    horaInicio: '',
    horaFin: '',
    orden: 0,
    activo: true,
  });

  // Memoizar cálculos que se usan en múltiples lugares
  const horariosNuevos = useMemo(() => {
    return horarios.filter(h => String(h.id).startsWith('temp-'));
  }, [horarios]);

  const horariosExistentes = useMemo(() => {
    return horarios.filter(h => !String(h.id).startsWith('temp-'));
  }, [horarios]);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    detectarConflictos();
  }, [horarios]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [aulaData, cursosData, docentesData] = await Promise.all([
        aulaService.getDetalle(id),
        cursoService.getAll(),
        docenteService.getAllActivos(),
      ]);

      setAula(aulaData.aula);
      setHorarios(aulaData.horarios || []);
      
      const cursosFiltrados = cursosData.filter(c => c.nivelGrado === aulaData.aula.grado);
      setCursos(cursosFiltrados);
      setDocentes(docentesData);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      Toast.fire({
        icon: 'error',
        title: 'Error al cargar la información del aula',
      });
      navigate('/aulas');
    } finally {
      setLoading(false);
    }
  };

  const detectarConflictos = () => {
    const nuevosConflictos = [];
    
    horarios.forEach((h1, i) => {
      horarios.slice(i + 1).forEach(h2 => {
        if (h1.diaSemana === h2.diaSemana) {
          const inicio1 = h1.horaInicio;
          const fin1 = h1.horaFin;
          const inicio2 = h2.horaInicio;
          const fin2 = h2.horaFin;

          if ((inicio1 < fin2 && fin1 > inicio2)) {
            nuevosConflictos.push({
              horario1: h1.id,
              horario2: h2.id,
              tipo: 'tiempo',
            });
          }
        }

        if (h1.docenteId === h2.docenteId && h1.diaSemana === h2.diaSemana) {
          const inicio1 = h1.horaInicio;
          const fin1 = h1.horaFin;
          const inicio2 = h2.horaInicio;
          const fin2 = h2.horaFin;

          if ((inicio1 < fin2 && fin1 > inicio2)) {
            nuevosConflictos.push({
              horario1: h1.id,
              horario2: h2.id,
              tipo: 'docente',
            });
          }
        }
      });
    });

    setConflictos(nuevosConflictos);
  };

  // Función para verificar si un slot está ocupado por un horario guardado (no temporal)
  const isSlotOccupied = (dia, hora) => {
    return horarios.some(h => {
      const esHorarioGuardado = !String(h.id).startsWith('temp-');
      const mismoDia = h.diaSemana === dia;
      const mismaHora = h.horaInicio.substring(0, 5) === hora;
      
      return esHorarioGuardado && mismoDia && mismaHora;
    });
  };

  const handleOpenQuickAdd = (dia, hora) => {
    // Verificar si el slot ya está ocupado por un horario guardado
    if (isSlotOccupied(dia, hora)) {
      Toast.fire({
        icon: 'info',
        title: 'Este horario ya está configurado',
        text: 'Si deseas modificarlo, usa el botón de editar o elimínalo primero',
      });
      return;
    }

    setSelectedSlot({ dia, hora });
    setShowQuickAdd(true);
  };

  const handleQuickAddSubmit = () => {
    if (!quickAdd.cursoId || !quickAdd.docenteId) {
      Toast.fire({
        icon: 'warning',
        title: 'Selecciona curso y docente',
      });
      return;
    }

    // Verificar si el curso ya tiene un horario (existente o temporal)
    const cursoYaExiste = horarios.some(h => h.cursoId === parseInt(quickAdd.cursoId));
    
    if (cursoYaExiste) {
      const curso = cursos.find(c => c.id === parseInt(quickAdd.cursoId));
      Toast.fire({
        icon: 'warning',
        title: 'Curso ya tiene horario',
        text: `${curso?.nombre} ya tiene un horario configurado en esta aula. Elimina el existente si deseas cambiarlo.`,
      });
      return;
    }

    const plantilla = PLANTILLAS_HORARIO.find(p => p.id === quickAdd.plantilla);
    
    if (quickAdd.plantilla === 'personalizado' && selectedSlot) {
      // Verificar si el slot está ocupado
      if (isSlotOccupied(selectedSlot.dia, quickAdd.horaInicio)) {
        Toast.fire({
          icon: 'warning',
          title: 'Este horario ya está ocupado',
          text: 'Por favor selecciona otro horario',
        });
        return;
      }

      const horarioNuevo = crearHorario(
        selectedSlot.dia,
        quickAdd.horaInicio,
        quickAdd.horaFin,
        quickAdd.cursoId,
        quickAdd.docenteId
      );
      setHorarios([...horarios, horarioNuevo]);
    } else {
      const nuevosHorarios = [];
      let slotsOcupados = 0;

      DIAS_SEMANA.forEach(dia => {
        // Verificar si el slot está ocupado
        if (isSlotOccupied(dia.value, plantilla.horaInicio)) {
          slotsOcupados++;
          return;
        }

        const horarioNuevo = crearHorario(
          dia.value,
          plantilla.horaInicio,
          plantilla.horaFin,
          quickAdd.cursoId,
          quickAdd.docenteId
        );
        nuevosHorarios.push(horarioNuevo);
      });

      if (slotsOcupados > 0) {
        Toast.fire({
          icon: 'info',
          title: `${slotsOcupados} horario(s) ya ocupado(s)`,
          text: 'Se agregaron solo los horarios disponibles',
        });
      }

      if (nuevosHorarios.length > 0) {
        setHorarios([...horarios, ...nuevosHorarios]);
      } else {
        Toast.fire({
          icon: 'warning',
          title: 'Todos los horarios ya están ocupados',
        });
        return;
      }
    }

    setShowQuickAdd(false);
    setQuickAdd({
      cursoId: '',
      docenteId: '',
      plantilla: 'basico',
      horaInicio: '08:00',
      horaFin: '09:00',
    });

    Toast.fire({
      icon: 'success',
      title: 'Horario(s) agregado(s)',
    });
  };

  const formatearHora = (hora) => {
    if (!hora) return '08:00:00';
    if (hora.includes(':00:00')) return hora;
    if (hora.length === 5) return `${hora}:00`;
    return `${hora}:00`;
  };

  const crearHorario = (dia, horaInicio, horaFin, cursoId, docenteId) => {
    const curso = cursos.find(c => c.id === parseInt(cursoId));
    const docente = docentes.find(d => d.id === parseInt(docenteId));
    
    return {
      id: `temp-${Date.now()}-${Math.random()}`,
      aulaId: parseInt(id),
      diaSemana: dia,
      diaSemanaTexto: DIAS_SEMANA.find(d => d.value === dia)?.label,
      horaInicio: formatearHora(horaInicio),
      horaFin: formatearHora(horaFin),
      cursoId: parseInt(cursoId),
      docenteId: parseInt(docenteId),
      nombreCurso: curso?.nombre,
      nombreDocente: docente?.nombreCompleto,
      color: COLORES_CURSOS[Math.floor(Math.random() * COLORES_CURSOS.length)],
      esNuevo: true,
    };
  };

  const handleOpenEditModal = (horario) => {
    setEditingHorario(horario);
    setEditFormData({
      docenteId: horario.docenteId,
      horaInicio: horario.horaInicio.substring(0, 5),
      horaFin: horario.horaFin.substring(0, 5),
      orden: horario.orden || 0,
      activo: horario.activo !== false,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editFormData.docenteId) {
      Toast.fire({
        icon: 'warning',
        title: 'Selecciona un docente',
      });
      return;
    }

    if (editFormData.horaFin <= editFormData.horaInicio) {
      Toast.fire({
        icon: 'warning',
        title: 'La hora de fin debe ser posterior a la hora de inicio',
      });
      return;
    }

    const { isConfirmed } = await MySwal.fire({
      title: 'Actualizar Horario',
      html: `
        <div style="text-align: left;">
          <p>Esta acción actualizará:</p>
          <ul>
            <li>El horario seleccionado</li>
            <li>El grupo-curso asociado (si existe)</li>
            <li>Todas las sesiones futuras no realizadas</li>
          </ul>
          <p style="color: #3b82f6; font-weight: 600; margin-top: 1rem;">
            Las sesiones pasadas no se modificarán
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
    });

    if (!isConfirmed) return;

    try {
      MySwal.fire({
        title: 'Actualizando...',
        html: 'Actualizando horario y datos relacionados',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
      });

      const updateData = {
        docenteId: parseInt(editFormData.docenteId),
        horaInicio: formatearHora(editFormData.horaInicio),
        horaFin: formatearHora(editFormData.horaFin),
        orden: editFormData.orden,
        activo: editFormData.activo,
      };

      const resultado = await aulaService.updateHorarioCascada(editingHorario.id, updateData);

      MySwal.close();

      if (resultado.exitoso) {
        setHorarios(horarios.map(h => 
          h.id === editingHorario.id ? {
            ...h,
            docenteId: updateData.docenteId,
            horaInicio: updateData.horaInicio,
            horaFin: updateData.horaFin,
            orden: updateData.orden,
            activo: updateData.activo,
            nombreDocente: docentes.find(d => d.id === updateData.docenteId)?.nombreCompleto,
          } : h
        ));

        setShowEditModal(false);
        setEditingHorario(null);

        await MySwal.fire({
          icon: 'success',
          title: 'Actualizado Correctamente',
          html: `
            <div style="text-align: left;">
              <p><strong>${resultado.mensaje}</strong></p>
              <br>
              <p>Elementos actualizados:</p>
              <ul style="font-size: 14px;">
                <li>Grupos-cursos: ${resultado.gruposCursosActualizados}</li>
                <li>Sesiones futuras: ${resultado.sesionesFuturasActualizadas}</li>
              </ul>
            </div>
          `,
        });
      }
    } catch (error) {
      MySwal.close();
      console.error('Error al actualizar horario:', error);
      
      MySwal.fire({
        icon: 'error',
        title: 'Error al Actualizar',
        text: error.response?.data?.message || 'No se pudo actualizar el horario',
      });
    }
  };

  const handleEliminarHorario = async (horarioId) => {
    if (String(horarioId).startsWith('temp-')) {
      setHorarios(horarios.filter(h => h.id !== horarioId));
      Toast.fire({
        icon: 'info',
        title: 'Horario eliminado',
      });
      return;
    }

    const { isConfirmed } = await MySwal.fire({
      title: 'Eliminar Horario',
      html: `
        <div style="text-align: left;">
          <p>Esta acción eliminará:</p>
          <ul>
            <li>El horario seleccionado</li>
            <li>El grupo-curso asociado (si existe)</li>
            <li>Todas las sesiones generadas</li>
            <li>Todas las inscripciones de estudiantes</li>
          </ul>
          <p style="color: #ef4444; font-weight: 600; margin-top: 1rem;">
            Esta acción NO se puede deshacer
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar todo',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    });

    if (!isConfirmed) return;

    try {
      MySwal.fire({
        title: 'Eliminando...',
        html: 'Eliminando horario y datos relacionados',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
      });

      const resultado = await aulaService.deleteHorarioCascada(horarioId);

      MySwal.close();

      if (resultado.exitoso) {
        setHorarios(horarios.filter(h => h.id !== horarioId));

        await MySwal.fire({
          icon: 'success',
          title: 'Eliminado Correctamente',
          html: `
            <div style="text-align: left;">
              <p><strong>${resultado.mensaje}</strong></p>
              <br>
              <p>Elementos eliminados:</p>
              <ul style="font-size: 14px;">
                <li>Grupos-cursos: ${resultado.gruposCursosEliminados}</li>
                <li>Sesiones: ${resultado.sesionesEliminadas}</li>
                <li>Inscripciones: ${resultado.inscripcionesEliminadas}</li>
              </ul>
            </div>
          `,
        });
      }
    } catch (error) {
      MySwal.close();
      console.error('Error al eliminar horario:', error);
      
      MySwal.fire({
        icon: 'error',
        title: 'Error al Eliminar',
        text: error.response?.data?.message || 'No se pudo eliminar el horario',
      });
    }
  };

  const handleGuardarConfiguracion = async () => {
    // Usar el valor memoizado
    if (horariosNuevos.length === 0) {
      Toast.fire({
        icon: 'info',
        title: 'No hay horarios nuevos para guardar',
        text: 'Todos los horarios ya están guardados en la base de datos',
      });
      return;
    }

    // Verificar si algún horario nuevo tiene el mismo curso que uno existente
    const cursosExistentes = horariosExistentes.map(h => h.cursoId);
    const cursosNuevos = horariosNuevos.map(h => h.cursoId);
    const cursosDuplicados = cursosNuevos.filter(cursoId => cursosExistentes.includes(cursoId));

    if (cursosDuplicados.length > 0) {
      const cursosConflicto = cursosDuplicados
        .map(cursoId => cursos.find(c => c.id === cursoId)?.nombre)
        .filter(Boolean);

      const { isConfirmed } = await MySwal.fire({
        icon: 'warning',
        title: 'Cursos Duplicados Detectados',
        html: `
          <div style="text-align: left;">
            <p style="margin-bottom: 1rem;">
              Estás intentando agregar horarios para cursos que ya tienen horarios configurados en esta aula.
            </p>
            
            <p style="font-weight: 600; color: #ef4444; margin-bottom: 0.5rem;">
              Cursos con horarios existentes:
            </p>
            <ul style="font-size: 14px; color: #64748b;">
              ${cursosConflicto.map(curso => `<li>${curso}</li>`).join('')}
            </ul>
            
            <br>
            <p style="font-size: 13px; color: #64748b;">
              <strong>Nota:</strong> Un curso solo puede tener un grupo-curso por aula. 
              Si deseas cambiar el horario, elimina el horario existente primero.
            </p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Entendido',
        cancelButtonText: 'Cancelar',
        showConfirmButton: true,
        confirmButtonColor: '#3b82f6',
      });

      return; // No continuar con el guardado
    }

    const horariosInvalidos = horariosNuevos.filter(h => {
      return !h.horaInicio.includes(':00:00') || !h.horaFin.includes(':00:00');
    });

    if (horariosInvalidos.length > 0) {
      console.error('Horarios con formato inválido:', horariosInvalidos);
      Toast.fire({
        icon: 'error',
        title: 'Error en formato de horas',
      });
      return;
    }

    // Solo verificar conflictos en los horarios nuevos
    const conflictosEnNuevos = conflictos.filter(c => {
      const horario1EsNuevo = String(c.horario1).startsWith('temp-');
      const horario2EsNuevo = String(c.horario2).startsWith('temp-');
      return horario1EsNuevo || horario2EsNuevo;
    });

    if (conflictosEnNuevos.length > 0) {
      const { isConfirmed } = await MySwal.fire({
        title: 'Atención',
        html: `Hay ${conflictosEnNuevos.length} conflicto(s) detectado(s) en los nuevos horarios. ¿Deseas continuar de todos modos?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Revisar',
      });

      if (!isConfirmed) return;
    }

    const { isConfirmed, value: opciones } = await MySwal.fire({
      title: 'Configurar Nuevos Horarios',
      html: `
        <div style="text-align: left;">
          <p><strong>Se crearán ${horariosNuevos.length} horario(s) nuevo(s)</strong></p>
          <p style="color: #64748b; font-size: 14px; margin-top: 8px;">
            Los ${horariosExistentes.length} horario(s) existente(s) no se modificarán
          </p>
          <br>
          <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <input type="checkbox" id="generarGrupos" checked>
            <span>Generar grupos-cursos automáticamente</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="generarSesiones" checked>
            <span>Generar sesiones para todo el periodo</span>
          </label>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, configurar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        return {
          generarGrupos: document.getElementById('generarGrupos').checked,
          generarSesiones: document.getElementById('generarSesiones').checked,
        };
      },
    });

    if (!isConfirmed) return;

    try {
      setSaving(true);

      MySwal.fire({
        title: 'Configurando horarios nuevos...',
        html: 'Esto puede tomar unos momentos',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
      });

      // Solo enviar los horarios nuevos (temporales)
      const horariosParaEnviar = horariosNuevos.map(h => ({
        aulaId: parseInt(id),
        cursoId: parseInt(h.cursoId),
        docenteId: parseInt(h.docenteId),
        diaSemana: parseInt(h.diaSemana),
        horaInicio: formatearHora(h.horaInicio),
        horaFin: formatearHora(h.horaFin),
        orden: h.orden || 0,
      }));

      const configDto = {
        aulaId: parseInt(id),
        horarios: horariosParaEnviar,
        generarGruposAutomaticamente: opciones.generarGrupos,
        generarSesionesAutomaticamente: opciones.generarSesiones,
      };

      const resultado = await aulaService.configurarHorarioCompleto(id, configDto);

      MySwal.close();

      if (resultado.exitoso) {
        await MySwal.fire({
          icon: 'success',
          title: 'Configuración Completada',
          html: `
            <div style="text-align: left; padding: 1rem;">
              <p style="font-size: 16px; margin-bottom: 1rem;">
                <strong>${resultado.mensaje}</strong>
              </p>
              <hr style="margin: 1rem 0; border: none; border-top: 1px solid #e5e7eb;">
              <div style="display: grid; gap: 0.5rem; font-size: 14px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Horarios creados:</span>
                  <strong>${resultado.horariosCreados}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Grupos-cursos generados:</span>
                  <strong>${resultado.gruposCursosCreados}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Sesiones programadas:</span>
                  <strong>${resultado.sesionesGeneradas}</strong>
                </div>
              </div>
            </div>
          `,
        });

        navigate('/aulas');
      }

    } catch (error) {
      MySwal.close();
      console.error('Error al configurar:', error);

      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          // Verificar si el error es por grupos existentes
          const mensajeError = data.message || '';
          const erroresArray = data.errores || [];
          const esErrorGruposExistentes = mensajeError.toLowerCase().includes('ya existe') || 
                                          erroresArray.some(e => e.toLowerCase().includes('ya existe'));
          
          if (esErrorGruposExistentes) {
            await MySwal.fire({
              icon: 'info',
              title: 'Grupos Ya Existentes',
              html: `
                <div style="text-align: left;">
                  
                  ${erroresArray.length > 0 ? `
                    <p style="font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Grupos Actuales:</p>
                    <ul style="font-size: 13px; color: #035a11; margin-bottom: 1rem;">
                      ${erroresArray.map(e => `<li>${e}</li>`).join('')}
                    </ul>
                  ` : ''}
                  
                  <p style="font-size: 13px; color: #3b82f6; font-weight: 600;">
                    Recomendación: Recarga la página para ver el estado actual de los horarios
                  </p>
                </div>
              `,
              confirmButtonText: 'Recargar Página',
              confirmButtonColor: '#3b82f6',
            });

            // Recargar automáticamente
            window.location.reload();
          } else {
            // Error de validación genérico
            MySwal.fire({
              icon: 'error',
              title: 'Error de Validación',
              html: `
                <div style="text-align: left;">
                  <p>${data.message || 'Los datos enviados no son válidos'}</p>
                  ${erroresArray.length > 0 ? `
                    <br>
                    <p style="font-weight: 600; color: #64748b;">Detalles:</p>
                    <ul style="font-size: 13px; color: #64748b;">
                      ${erroresArray.map(e => `<li>${e}</li>`).join('')}
                    </ul>
                  ` : ''}
                </div>
              `,
            });
          }
        } else {
          MySwal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message || 'No se pudo completar la configuración',
          });
        }
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: 'No se pudo conectar con el servidor',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const renderCalendarView = () => {
    return (
      <CalendarGrid>
        <TimeSlot>Hora</TimeSlot>
        {DIAS_SEMANA.map(dia => (
          <DayHeader key={dia.value}>{dia.label}</DayHeader>
        ))}

        {HORAS_DIA.map(hora => (
          <React.Fragment key={`row-${hora.value}`}>
            <TimeSlot>{hora.label}</TimeSlot>
            {DIAS_SEMANA.map(dia => {
              const horariosEnSlot = horarios.filter(
                h => h.diaSemana === dia.value && h.horaInicio.substring(0, 5) === hora.value
              );

              const tieneConflicto = horariosEnSlot.some(h => 
                conflictos.some(c => c.horario1 === h.id || c.horario2 === h.id)
              );

              // Verificar si hay un horario guardado (no temporal) en este slot
              const horarioGuardado = horariosEnSlot.find(h => !String(h.id).startsWith('temp-'));
              const slotOcupado = !!horarioGuardado;

              if (horariosEnSlot.length > 0) {
                const horario = horariosEnSlot[0];
                const esHorarioTemporal = String(horario.id).startsWith('temp-');
                
                return (
                  <ClassSlot
                    key={`slot-${dia.value}-${hora.value}`}
                    $hasClass={true}
                    $color={horario.color}
                    $isOccupied={false}
                  >
                    {tieneConflicto && <ConflictBadge>!</ConflictBadge>}
                    
                    {/* Badge para horarios nuevos */}
                    {esHorarioTemporal && <NewBadge>NEW</NewBadge>}
                    
                    {/* Solo mostrar botón de editar si es un horario guardado */}
                    {!esHorarioTemporal && (
                      <EditButton onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(horario);
                      }}>
                        <Edit size={12} />
                      </EditButton>
                    )}
                    
                    <DeleteButton onClick={(e) => {
                      e.stopPropagation();
                      handleEliminarHorario(horario.id);
                    }}>
                      <Trash2 size={12} />
                    </DeleteButton>
                    
                    <ClassInfo>{horario.nombreCurso}</ClassInfo>
                    <ClassTime>
                      {horario.horaInicio.substring(0, 5)} - {horario.horaFin.substring(0, 5)}
                    </ClassTime>
                    <ClassTeacher>{horario.nombreDocente}</ClassTeacher>
                  </ClassSlot>
                );
              }

              // Si el slot está ocupado por un horario guardado, mostrar indicador
              if (slotOcupado) {
                return (
                  <ClassSlot
                    key={`slot-${dia.value}-${hora.value}`}
                    $hasClass={false}
                    $isOccupied={true}
                    onClick={() => handleOpenQuickAdd(dia.value, hora.value)}
                  >
                    <OccupiedBadge>
                      <Lock size={16} />
                      <span style={{ fontSize: '10px' }}>Ocupado</span>
                    </OccupiedBadge>
                  </ClassSlot>
                );
              }

              // Slot vacío y disponible
              return (
                <ClassSlot
                  key={`slot-${dia.value}-${hora.value}`}
                  $hasClass={false}
                  $isOccupied={false}
                  onClick={() => handleOpenQuickAdd(dia.value, hora.value)}
                />
              );
            })}
          </React.Fragment>
        ))}
      </CalendarGrid>
    );
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <LoadingSpinner />
            <p style={{ marginTop: '1rem', color: theme.colors.textMuted }}>
              Cargando información del aula...
            </p>
          </div>
        </Card>
      </Container>
    );
  }

  if (!aula) return null;

  const horasPorSemana = horarios.reduce((total, h) => {
    const inicio = h.horaInicio.split(':');
    const fin = h.horaFin.split(':');
    const horas = (parseInt(fin[0]) - parseInt(inicio[0])) + ((parseInt(fin[1]) - parseInt(inicio[1])) / 60);
    return total + horas;
  }, 0);

  const materiasProgramadas = [...new Set(horarios.map(h => h.cursoId))].length;
  const docentesAsignados = [...new Set(horarios.map(h => h.docenteId))].length;

  return (
    <Container>
      <Header>
        <HeaderTop>
          <BackButton variant="outline" onClick={() => navigate('/aulas')}>
            <ArrowLeft size={18} />
            Volver
          </BackButton>
          <div style={{ flex: 1 }}>
            <Title>
              <Settings size={28} style={{ marginRight: '8px' }} />
              Configurar Horario de Aula: {aula.grado}° {aula.seccion}
            </Title>
            <Subtitle>Periodo {aula.periodo} - {aula.aulaFisica || 'Sin aula física asignada'}</Subtitle>
          </div>
        </HeaderTop>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon $color="#8b5cf6">
            <Calendar size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Total Horarios</StatLabel>
            <StatValue>{horarios.length}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#10b981">
            <Plus size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Nuevos (sin guardar)</StatLabel>
            <StatValue style={{ color: '#10b981' }}>
              {horariosNuevos.length}
            </StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#3b82f6">
            <BookOpen size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Materias</StatLabel>
            <StatValue>{materiasProgramadas}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon $color="#f59e0b">
            <Clock size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Horas/Semana</StatLabel>
            <StatValue>{horasPorSemana.toFixed(1)}</StatValue>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {conflictos.length > 0 && (
        <AlertBox $type="warning">
          <AlertCircle size={20} />
          Se detectaron {conflictos.length} conflicto(s) de horario.
        </AlertBox>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            <Calendar size={20} />
            Horario Semanal ({horarios.length} clases)
          </CardTitle>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Button onClick={() => setShowQuickAdd(true)}>
              <Plus size={18} />
              Agregar Clase
            </Button>
            <ViewToggle>
              <ViewButton
                $active={viewMode === 'calendar'}
                onClick={() => setViewMode('calendar')}
              >
                <Grid3x3 size={16} />
                Calendario
              </ViewButton>
              <ViewButton
                $active={viewMode === 'list'}
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
                Lista
              </ViewButton>
            </ViewToggle>
          </div>
        </CardHeader>

        {viewMode === 'calendar' ? renderCalendarView() : (
          <div>
            <p style={{ textAlign: 'center', padding: '2rem', color: theme.colors.textMuted }}>
              Vista de lista disponible
            </p>
          </div>
        )}
      </Card>

      <Card>
        <AlertBox $type="info">
          <Zap size={20} />
          {horariosNuevos.length > 0 
            ? `Al guardar se crearán ${horariosNuevos.length} nuevo(s) horario(s) con sus grupos-cursos y sesiones correspondientes.`
            : 'Agrega nuevos horarios para guardarlos. Los horarios existentes ya están configurados.'}
        </AlertBox>

        <ActionsBar>
          <Button variant="outline" onClick={() => navigate('/aulas')} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardarConfiguracion}
            disabled={saving || horariosNuevos.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {saving ? (
              <>
                <LoadingSpinner style={{ width: '16px', height: '16px' }} />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar Nuevos ({horariosNuevos.length} horarios)
              </>
            )}
          </Button>
        </ActionsBar>
      </Card>

      {showQuickAdd && (
        <QuickAddModal onClick={() => setShowQuickAdd(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Agregar Clase</ModalTitle>
              <CloseButton onClick={() => setShowQuickAdd(false)}>×</CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label>Selecciona una Plantilla</Label>
              <TemplateGrid>
                {PLANTILLAS_HORARIO.map(plantilla => (
                  <TemplateCard
                    key={plantilla.id}
                    $selected={quickAdd.plantilla === plantilla.id}
                    onClick={() => setQuickAdd({ ...quickAdd, plantilla: plantilla.id })}
                  >
                    <TemplateName>{plantilla.nombre}</TemplateName>
                    <TemplateDesc>{plantilla.descripcion}</TemplateDesc>
                  </TemplateCard>
                ))}
              </TemplateGrid>
            </FormGroup>

            <FormGroup>
              <Label>Curso / Materia</Label>
              <Select
                value={quickAdd.cursoId}
                onChange={(e) => setQuickAdd({ ...quickAdd, cursoId: e.target.value })}
              >
                <option value="">Seleccionar curso</option>
                {cursos.map(curso => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nombre}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Docente</Label>
              <Select
                value={quickAdd.docenteId}
                onChange={(e) => setQuickAdd({ ...quickAdd, docenteId: e.target.value })}
              >
                <option value="">Seleccionar docente</option>
                {docentes.map(docente => (
                  <option key={docente.id} value={docente.id}>
                    {docente.nombreCompleto}
                  </option>
                ))}
              </Select>
            </FormGroup>

            {quickAdd.plantilla === 'personalizado' && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <FormGroup style={{ flex: 1 }}>
                  <Label>Hora Inicio</Label>
                  <Select
                    value={quickAdd.horaInicio}
                    onChange={(e) => setQuickAdd({ ...quickAdd, horaInicio: e.target.value })}
                  >
                    {HORAS_DIA.map(hora => (
                      <option key={hora.value} value={hora.value}>
                        {hora.label}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                <FormGroup style={{ flex: 1 }}>
                  <Label>Hora Fin</Label>
                  <Select
                    value={quickAdd.horaFin}
                    onChange={(e) => setQuickAdd({ ...quickAdd, horaFin: e.target.value })}
                  >
                    {HORAS_DIA.map(hora => (
                      <option key={hora.value} value={hora.value}>
                        {hora.label}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </div>
            )}

            <ActionsBar style={{ marginTop: '1.5rem', paddingTop: '1.5rem' }}>
              <Button variant="outline" onClick={() => setShowQuickAdd(false)}>
                Cancelar
              </Button>
              <Button onClick={handleQuickAddSubmit}>
                <Plus size={18} />
                Agregar
              </Button>
            </ActionsBar>
          </ModalContent>
        </QuickAddModal>
      )}

      {showEditModal && (
        <QuickAddModal onClick={() => setShowEditModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Editar Horario</ModalTitle>
              <CloseButton onClick={() => setShowEditModal(false)}>×</CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label>Curso</Label>
              <Input
                value={editingHorario?.nombreCurso || ''}
                disabled
                style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
              />
            </FormGroup>

            <FormGroup>
              <Label>Docente</Label>
              <Select
                value={editFormData.docenteId}
                onChange={(e) => setEditFormData({ ...editFormData, docenteId: e.target.value })}
              >
                <option value="">Seleccionar docente</option>
                {docentes.map(docente => (
                  <option key={docente.id} value={docente.id}>
                    {docente.nombreCompleto}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <FormGroup style={{ flex: 1 }}>
                <Label>Hora Inicio</Label>
                <Select
                  value={editFormData.horaInicio}
                  onChange={(e) => setEditFormData({ ...editFormData, horaInicio: e.target.value })}
                >
                  {HORAS_DIA.map(hora => (
                    <option key={hora.value} value={hora.value}>
                      {hora.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup style={{ flex: 1 }}>
                <Label>Hora Fin</Label>
                <Select
                  value={editFormData.horaFin}
                  onChange={(e) => setEditFormData({ ...editFormData, horaFin: e.target.value })}
                >
                  {HORAS_DIA.map(hora => (
                    <option key={hora.value} value={hora.value}>
                      {hora.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </div>

            <ActionsBar style={{ marginTop: '1.5rem', paddingTop: '1.5rem' }}>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save size={18} />
                Guardar Cambios
              </Button>
            </ActionsBar>
          </ModalContent>
        </QuickAddModal>
      )}
    </Container>
  );
}