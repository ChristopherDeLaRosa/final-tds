import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Save,
  Users
} from 'lucide-react';
import { theme } from '../../styles';
import sesionService from '../../services/sesionService';
import paseListaService from '../../services/paseListaService';
import { MySwal, Toast } from '../../utils/alerts';
import Button from '../../components/atoms/Button/Button';
import Select from '../../components/atoms/Select/Select';
import PaseListaTable from '../../components/organisms/PaseListaTable/PaseListaTable';

// Card component
const Card = styled.div`
  background: ${theme.colors.bg || '#ffffff'};
  border: 1px solid ${theme.colors.border || '#e5e7eb'};
  border-radius: ${theme.borderRadius?.md || '8px'};
  padding: ${theme.spacing?.lg || '1.5rem'};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
`;

// Spinner animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: ${props => props.$size === 'large' ? '48px' : '32px'};
  height: ${props => props.$size === 'large' ? '48px' : '32px'};
  border: 3px solid ${theme.colors.border};
  border-top: 3px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const Container = styled.div`
  padding: ${theme.spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeaderWrapper = styled.div`
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

const HeaderContent = styled.div`
  flex: 1;
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

const SelectionCard = styled(Card)`
  margin-bottom: ${theme.spacing.xl};
  padding: ${theme.spacing.xl};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  font-size: ${theme.fontSize.sm};
`;

const InfoBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${props => props.$variant === 'warning' 
    ? 'rgba(245, 158, 11, 0.1)' 
    : 'rgba(59, 130, 246, 0.1)'};
  color: ${props => props.$variant === 'warning' 
    ? '#f59e0b' 
    : '#3b82f6'};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  font-weight: 500;
`;

const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

const LoadingContainer = styled.div`
  padding: 3rem;
  text-align: center;
  
  p {
    margin-top: 1rem;
    color: ${theme.colors.textSecondary};
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${theme.colors.textSecondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  
  p {
    margin: 0;
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
  }
`;

const SaveButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export default function PaseLista() {
  const navigate = useNavigate();
  
  const [sesiones, setSesiones] = useState([]);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [listaYaRegistrada, setListaYaRegistrada] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarSesionesDelDia();
  }, []);

  const cargarSesionesDelDia = async () => {
    try {
      setLoading(true);
      
      // Obtener fecha actual en República Dominicana (UTC-4)
      const hoy = new Date();
      
      // IMPORTANTE: Formatear la fecha correctamente para el backend
      // El backend espera formato ISO: YYYY-MM-DD
      const year = hoy.getFullYear();
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const day = String(hoy.getDate()).padStart(2, '0');
      const fechaHoy = `${year}-${month}-${day}`;
      
      console.log('🔍 DEBUG - Fecha de hoy:', fechaHoy);
      console.log('🔍 DEBUG - Fecha objeto:', hoy);
      
      // Llamar al servicio con la misma fecha para inicio y fin
      const sesionesData = await sesionService.getByRangoFechas(fechaHoy, fechaHoy);
      
      console.log('📚 Sesiones recibidas del backend:', sesionesData);
      console.log('📊 Total sesiones recibidas:', sesionesData?.length || 0);
      
      // El backend ya debería filtrar por fecha, pero validamos por seguridad
      const sesionesFiltradas = sesionesData.filter(s => {
        // Convertir la fecha de la sesión a formato comparable
        const fechaSesion = new Date(s.fecha);
        const fechaSesionStr = fechaSesion.toISOString().split('T')[0];
        
        console.log('🔍 Comparando:', {
          fechaSesion: fechaSesionStr,
          fechaBuscada: fechaHoy,
          coincide: fechaSesionStr === fechaHoy
        });
        
        return fechaSesionStr === fechaHoy;
      });
      
      console.log('✅ Sesiones después del filtro:', sesionesFiltradas);
      console.log('📈 Total para mostrar:', sesionesFiltradas.length);
      
      setSesiones(sesionesFiltradas);
      
      if (sesionesFiltradas.length === 0) {
        console.log('⚠️ No se encontraron sesiones para hoy');
        Toast.fire({
          icon: 'info',
          title: 'No hay sesiones programadas para hoy',
        });
      } else {
        console.log(`✅ ${sesionesFiltradas.length} sesiones encontradas para hoy`);
      }
      
    } catch (error) {
      console.error('❌ Error completo al cargar sesiones:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      Toast.fire({
        icon: 'error',
        title: 'Error al cargar las sesiones del día',
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarSesion = async (sesionId) => {
    if (!sesionId) {
      setSesionSeleccionada(null);
      setEstudiantes([]);
      setAsistencias({});
      setListaYaRegistrada(false);
      return;
    }

    try {
      setLoadingEstudiantes(true);
      
      const sesion = sesiones.find(s => s.id === parseInt(sesionId));
      console.log('📝 Sesión seleccionada:', sesion);
      setSesionSeleccionada(sesion);

      const yaRegistrada = await paseListaService.verificarListaRegistrada(sesionId);
      console.log('✅ Lista ya registrada:', yaRegistrada);
      setListaYaRegistrada(yaRegistrada);

      if (yaRegistrada) {
        const asistenciasExistentes = await paseListaService.getAsistenciasSesion(sesionId);
        console.log('📋 Asistencias existentes:', asistenciasExistentes);
        
        const asistenciasMap = {};
        asistenciasExistentes.forEach(a => {
          asistenciasMap[a.estudianteId] = {
            estado: a.estado,
            observaciones: a.observaciones || '',
          };
        });
        setAsistencias(asistenciasMap);
      } else {
        setAsistencias({});
      }

      const estudiantesData = await paseListaService.getEstudiantesParaPaseLista(
        sesion.grupoCursoId
      );
      console.log('👥 Estudiantes obtenidos:', estudiantesData);
      console.log('📊 Total estudiantes:', estudiantesData.length);
      
      setEstudiantes(estudiantesData);

      if (!yaRegistrada) {
        const asistenciasIniciales = {};
        estudiantesData.forEach(est => {
          asistenciasIniciales[est.estudianteId] = {
            estado: 'Presente',
            observaciones: '',
          };
        });
        setAsistencias(asistenciasIniciales);
      }

      Toast.fire({
        icon: 'success',
        title: `${estudiantesData.length} estudiantes cargados`,
      });

    } catch (error) {
      console.error('❌ Error al cargar estudiantes:', error);
      Toast.fire({
        icon: 'error',
        title: 'Error al cargar la lista de estudiantes',
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  const handleCambiarEstado = (estudianteId, nuevoEstado) => {
    setAsistencias(prev => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        estado: nuevoEstado,
      }
    }));
  };

  const handleCambiarObservaciones = (estudianteId, observaciones) => {
    setAsistencias(prev => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        observaciones,
      }
    }));
  };

  const handleMarcarTodos = (estado) => {
    const nuevasAsistencias = {};
    estudiantes.forEach(est => {
      nuevasAsistencias[est.estudianteId] = {
        estado,
        observaciones: asistencias[est.estudianteId]?.observaciones || '',
      };
    });
    setAsistencias(nuevasAsistencias);
    
    Toast.fire({
      icon: 'success',
      title: `Todos marcados como ${estado}`,
    });
  };

  const validarAsistencias = () => {
    const estudiantesSinRegistro = estudiantes.filter(
      est => !asistencias[est.estudianteId]
    );

    if (estudiantesSinRegistro.length > 0) {
      Toast.fire({
        icon: 'warning',
        title: 'Todos los estudiantes deben tener un estado de asistencia',
      });
      return false;
    }

    return true;
  };

  const handleGuardarPaseLista = async () => {
    if (!sesionSeleccionada) {
      Toast.fire({
        icon: 'warning',
        title: 'Debes seleccionar una sesión',
      });
      return;
    }

    if (!validarAsistencias()) {
      return;
    }

    const result = await MySwal.fire({
      title: '¿Confirmar pase de lista?',
      html: `
        <div style="text-align: left; margin-top: 1rem;">
          <p><strong>Sesión:</strong> ${sesionSeleccionada.nombreCurso}</p>
          <p><strong>Grupo:</strong> ${sesionSeleccionada.grado}° ${sesionSeleccionada.seccion}</p>
          <p><strong>Fecha:</strong> ${new Date(sesionSeleccionada.fecha).toLocaleDateString('es-DO')}</p>
          <p><strong>Total estudiantes:</strong> ${estudiantes.length}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: theme.colors.primary,
    });

    if (!result.isConfirmed) return;

    try {
      setGuardando(true);

      MySwal.fire({
        title: 'Guardando pase de lista...',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      const asistenciasArray = estudiantes.map(est => ({
        estudianteId: est.estudianteId,
        estado: asistencias[est.estudianteId]?.estado || 'Presente',
        observaciones: asistencias[est.estudianteId]?.observaciones || null,
      }));

      const data = {
        sesionId: sesionSeleccionada.id,
        asistencias: asistenciasArray,
      };

      console.log('💾 Guardando asistencias:', data);

      await paseListaService.registrarPaseListaCompleto(data);

      MySwal.fire({
        icon: 'success',
        title: '¡Pase de lista guardado!',
        text: `Se registró la asistencia de ${estudiantes.length} estudiantes`,
        timer: 3000,
        showConfirmButton: false,
      });

      setSesionSeleccionada(null);
      setEstudiantes([]);
      setAsistencias({});
      await cargarSesionesDelDia();

    } catch (error) {
      console.error('❌ Error al guardar pase de lista:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: error.response?.data?.message || 'No se pudo guardar el pase de lista',
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setSesionSeleccionada(null);
    setEstudiantes([]);
    setAsistencias({});
    setListaYaRegistrada(false);
  };

  if (loading) {
    return (
      <Container>
        <PageHeaderWrapper>
          <Title>Pase de Lista</Title>
          <Subtitle>Control de asistencia diaria</Subtitle>
        </PageHeaderWrapper>
        <Card>
          <LoadingContainer>
            <LoadingSpinner $size="large" />
            <p>Cargando sesiones del día...</p>
          </LoadingContainer>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeaderWrapper>
        <HeaderTop>
          <BackButton 
            variant="outline" 
            onClick={() => navigate('/asistencias')}
          >
            <ArrowLeft size={18} />
            Volver
          </BackButton>
          <HeaderContent>
            <Title>Pase de Lista</Title>
            <Subtitle>Control de asistencia diaria - Selecciona una sesión para comenzar</Subtitle>
          </HeaderContent>
        </HeaderTop>
      </PageHeaderWrapper>

      <SelectionCard>
        <FormGrid>
          <FormGroup>
            <Label>Seleccionar Sesión *</Label>
            <Select
              value={sesionSeleccionada?.id || ''}
              onChange={(e) => handleSeleccionarSesion(e.target.value)}
              disabled={guardando}
            >
              <option value="">-- Selecciona una sesión --</option>
              {sesiones.map(sesion => {
                const fecha = new Date(sesion.fecha).toLocaleDateString('es-DO');
                const horaInicio = sesion.horaInicio?.toString().substring(0, 5) || '';
                const horaFin = sesion.horaFin?.toString().substring(0, 5) || '';
                
                return (
                  <option key={sesion.id} value={sesion.id}>
                    {sesion.nombreCurso} - {sesion.grado}° {sesion.seccion} | {fecha} {horaInicio}-{horaFin}
                    {sesion.tema ? ` - ${sesion.tema}` : ''}
                  </option>
                );
              })}
            </Select>
          </FormGroup>

          {sesionSeleccionada && (
            <FormGroup>
              <Label>Estado de la Sesión</Label>
              {listaYaRegistrada ? (
                <InfoBadge $variant="warning">
                  <AlertCircle size={16} />
                  Lista ya registrada (modo edición)
                </InfoBadge>
              ) : (
                <InfoBadge>
                  <CheckCircle2 size={16} />
                  Lista nueva - {estudiantes.length} estudiantes
                </InfoBadge>
              )}
            </FormGroup>
          )}
        </FormGrid>

        {sesiones.length === 0 && !loading && (
          <EmptyMessage>
            <p>
              <Calendar size={20} />
              No hay sesiones programadas para hoy
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/sesiones')}
            >
              Ir a Sesiones
            </Button>
          </EmptyMessage>
        )}
      </SelectionCard>

      {loadingEstudiantes && (
        <Card>
          <LoadingContainer>
            <LoadingSpinner />
            <p>Cargando estudiantes...</p>
          </LoadingContainer>
        </Card>
      )}

      {sesionSeleccionada && estudiantes.length > 0 && !loadingEstudiantes && (
        <>
          <PaseListaTable
            estudiantes={estudiantes}
            asistencias={asistencias}
            onCambiarEstado={handleCambiarEstado}
            onCambiarObservaciones={handleCambiarObservaciones}
            onMarcarTodos={handleMarcarTodos}
            disabled={guardando}
          />

          <Card>
            <ActionsBar>
              <div style={{ 
                color: theme.colors.textSecondary, 
                fontSize: theme.fontSize.sm,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm
              }}>
                <Users size={18} />
                Total estudiantes: <strong>{estudiantes.length}</strong>
              </div>
              
              <ButtonGroup>
                <Button
                  variant="outline"
                  onClick={handleCancelar}
                  disabled={guardando}
                >
                  Cancelar
                </Button>
                <SaveButton
                  variant="primary"
                  onClick={handleGuardarPaseLista}
                  disabled={guardando}
                >
                  <Save size={18} />
                  {guardando ? 'Guardando...' : 'Guardar Pase de Lista'}
                </SaveButton>
              </ButtonGroup>
            </ActionsBar>
          </Card>
        </>
      )}
    </Container>
  );
}

