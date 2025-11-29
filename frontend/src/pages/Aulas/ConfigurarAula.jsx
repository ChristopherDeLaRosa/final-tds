import { useState, useEffect } from 'react';
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
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { theme } from '../../styles';
import aulaService from '../../services/aulaService';
import cursoService from '../../services/cursoService';
import docenteService from '../../services/docenteService';
import { MySwal, Toast } from '../../utils/alerts';
import Button from '../../components/atoms/Button/Button';
import Select from '../../components/atoms/Select/Select';
import Input from '../../components/atoms/Input/Input';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  padding: ${theme.spacing.xl};
  max-width: 1400px;
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

const HorarioGrid = styled.div`
  display: grid;
  gap: ${theme.spacing.md};
`;

const HorarioItem = styled.div`
  background: ${theme.colors.bgSecondary || '#f9fafb'};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  display: grid;
  grid-template-columns: 120px 1fr 200px 150px 60px;
  gap: ${theme.spacing.md};
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HorarioLabel = styled.div`
  font-weight: 600;
  color: ${theme.colors.text};
  font-size: 14px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.textSecondary};
`;

const ActionsBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${theme.colors.textMuted};
  
  svg {
    margin: 0 auto ${theme.spacing.md};
    opacity: 0.5;
  }
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

// ==================== COMPONENTE PRINCIPAL ====================

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

export default function ConfigurarAula() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados
  const [loading, setLoading] = useState(true);
  const [aula, setAula] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [saving, setSaving] = useState(false);

  // Estado para nuevo horario
  const [nuevoHorario, setNuevoHorario] = useState({
    diaSemana: '',
    horaInicio: '08:00',
    horaFin: '09:00',
    cursoId: '',
    docenteId: '',
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [id]);

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
      
      // Filtrar cursos por grado del aula
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

  const handleAgregarHorario = () => {
    if (!nuevoHorario.diaSemana || !nuevoHorario.cursoId || !nuevoHorario.docenteId) {
      Toast.fire({
        icon: 'warning',
        title: 'Completa todos los campos del horario',
      });
      return;
    }

    const horarioTemporal = {
      id: `temp-${Date.now()}`,
      aulaId: parseInt(id),
      diaSemana: parseInt(nuevoHorario.diaSemana),
      diaSemanaTexto: DIAS_SEMANA.find(d => d.value === parseInt(nuevoHorario.diaSemana))?.label,
      horaInicio: nuevoHorario.horaInicio,
      horaFin: nuevoHorario.horaFin,
      cursoId: parseInt(nuevoHorario.cursoId),
      docenteId: parseInt(nuevoHorario.docenteId),
      nombreCurso: cursos.find(c => c.id === parseInt(nuevoHorario.cursoId))?.nombre,
      nombreDocente: docentes.find(d => d.id === parseInt(nuevoHorario.docenteId))?.nombreCompleto,
      esNuevo: true,
    };

    setHorarios([...horarios, horarioTemporal]);

    // Reset form
    setNuevoHorario({
      diaSemana: '',
      horaInicio: '08:00',
      horaFin: '09:00',
      cursoId: '',
      docenteId: '',
    });

    Toast.fire({
      icon: 'success',
      title: 'Horario agregado (pendiente de guardar)',
    });
  };

  const handleEliminarHorario = (horarioId) => {
    setHorarios(horarios.filter(h => h.id !== horarioId));
  };

  const handleGuardarConfiguracion = async () => {
    if (horarios.length === 0) {
      Toast.fire({
        icon: 'warning',
        title: 'Debes agregar al menos un horario',
      });
      return;
    }

    const { isConfirmed, value: opciones } = await MySwal.fire({
      title: 'Configurar Aula Completa',
      html: `
        <div style="text-align: left;">
          <p><strong>Se crearán ${horarios.length} horarios</strong></p>
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
        title: 'Configurando aula...',
        html: 'Esto puede tomar unos momentos',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
      });

      // Preparar horarios para enviar
      const horariosParaEnviar = horarios.map(h => ({
        aulaId: parseInt(id),
        cursoId: h.cursoId,
        docenteId: h.docenteId,
        diaSemana: h.diaSemana,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin,
        orden: 0,
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
          title: '¡Configuración Completada!',
          html: `
            <div style="text-align: left;">
              <p>✅ ${resultado.horariosCreados} horarios creados</p>
              <p>✅ ${resultado.gruposCursosCreados} grupos-cursos generados</p>
              <p>✅ ${resultado.sesionesGeneradas} sesiones programadas</p>
            </div>
          `,
        });

        navigate('/aulas');
      } else {
        MySwal.fire({
          icon: 'warning',
          title: 'Configuración con advertencias',
          html: `
            <p>${resultado.mensaje}</p>
            ${resultado.errores.length > 0 ? `<ul style="text-align: left;">${resultado.errores.map(e => `<li>${e}</li>`).join('')}</ul>` : ''}
          `,
        });
      }

    } catch (error) {
      MySwal.close();
      console.error('Error al configurar:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error al configurar',
        text: error.response?.data?.message || 'No se pudo completar la configuración',
      });
    } finally {
      setSaving(false);
    }
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

  if (!aula) {
    return (
      <Container>
        <Card>
          <EmptyState>
            <AlertCircle size={48} />
            <p>Aula no encontrada</p>
            <Button onClick={() => navigate('/aulas')}>Volver a Aulas</Button>
          </EmptyState>
        </Card>
      </Container>
    );
  }

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
              Configurar Aula: {aula.grado}° {aula.seccion}
            </Title>
            <Subtitle>Periodo {aula.periodo} - {aula.aulaFisica || 'Sin aula física asignada'}</Subtitle>
          </div>
        </HeaderTop>
      </Header>

      {/* Estadísticas */}
      <StatsGrid>
        <StatCard>
          <StatIcon $color="#8b5cf6">
            <Calendar size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Horarios Creados</StatLabel>
            <StatValue>{horarios.length}</StatValue>
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
          <StatIcon $color="#10b981">
            <Users size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Docentes</StatLabel>
            <StatValue>{docentesAsignados}</StatValue>
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

      {/* Formulario para agregar horario */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Plus size={20} />
            Agregar Horario
          </CardTitle>
        </CardHeader>

        <HorarioItem>
          <FormGroup>
            <Label>Día de la Semana *</Label>
            <Select
              value={nuevoHorario.diaSemana}
              onChange={(e) => setNuevoHorario({ ...nuevoHorario, diaSemana: e.target.value })}
            >
              <option value="">Seleccionar día</option>
              {DIAS_SEMANA.filter(d => d.value >= 1 && d.value <= 5).map(dia => (
                <option key={dia.value} value={dia.value}>
                  {dia.label}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Curso/Materia *</Label>
            <Select
              value={nuevoHorario.cursoId}
              onChange={(e) => setNuevoHorario({ ...nuevoHorario, cursoId: e.target.value })}
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
            <Label>Docente *</Label>
            <Select
              value={nuevoHorario.docenteId}
              onChange={(e) => setNuevoHorario({ ...nuevoHorario, docenteId: e.target.value })}
            >
              <option value="">Seleccionar docente</option>
              {docentes.map(docente => (
                <option key={docente.id} value={docente.id}>
                  {docente.nombreCompleto}
                </option>
              ))}
            </Select>
          </FormGroup>

          <div style={{ display: 'flex', gap: '8px' }}>
            <FormGroup style={{ flex: 1 }}>
              <Label>Inicio</Label>
              <Input
                type="time"
                value={nuevoHorario.horaInicio}
                onChange={(e) => setNuevoHorario({ ...nuevoHorario, horaInicio: e.target.value })}
              />
            </FormGroup>
            <FormGroup style={{ flex: 1 }}>
              <Label>Fin</Label>
              <Input
                type="time"
                value={nuevoHorario.horaFin}
                onChange={(e) => setNuevoHorario({ ...nuevoHorario, horaFin: e.target.value })}
              />
            </FormGroup>
          </div>

          <Button onClick={handleAgregarHorario} style={{ alignSelf: 'center' }}>
            <Plus size={18} />
          </Button>
        </HorarioItem>
      </Card>

      {/* Lista de horarios */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Calendar size={20} />
            Horarios Programados ({horarios.length})
          </CardTitle>
        </CardHeader>

        {horarios.length === 0 ? (
          <EmptyState>
            <Calendar size={48} />
            <p>No hay horarios programados</p>
            <p style={{ fontSize: '14px' }}>Agrega horarios usando el formulario de arriba</p>
          </EmptyState>
        ) : (
          <>
            <AlertBox $type="info">
              <AlertCircle size={20} />
              Estos horarios aún no se han guardado. Haz clic en "Guardar Configuración" para aplicar los cambios.
            </AlertBox>

            <HorarioGrid>
              {horarios.map((horario) => (
                <HorarioItem key={horario.id}>
                  <HorarioLabel>{horario.diaSemanaTexto}</HorarioLabel>
                  <div>
                    <strong>{horario.nombreCurso}</strong>
                    <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>
                      {horario.nombreDocente}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                    {horario.horaInicio} - {horario.horaFin}
                  </div>
                  <div />
                  <Button
                    variant="outline"
                    onClick={() => handleEliminarHorario(horario.id)}
                    style={{ padding: '4px 8px' }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </HorarioItem>
              ))}
            </HorarioGrid>
          </>
        )}
      </Card>

      {/* Acciones finales */}
      <Card>
        <AlertBox $type="warning">
          <Zap size={20} />
          Al guardar la configuración se crearán automáticamente los grupos-cursos y todas las sesiones del periodo escolar.
        </AlertBox>

        <ActionsBar>
          <Button variant="outline" onClick={() => navigate('/aulas')} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardarConfiguracion}
            disabled={saving || horarios.length === 0}
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
                Guardar Configuración
              </>
            )}
          </Button>
        </ActionsBar>
      </Card>
    </Container>
  );
}

