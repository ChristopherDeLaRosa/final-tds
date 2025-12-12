import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Save,
  Users
} from 'lucide-react';
import { theme } from '../../../styles';
import sesionService from '../../../services/sesionService';
import paseListaService from '../../../services/paseListaService';
import { MySwal, Toast } from '../../../utils/alerts';
import Button from '../../../components/atoms/Button/Button';
import Select from '../../../components/atoms/Select/Select';
import PaseListaTable from '../../../components/organisms/PaseListaTable/PaseListaTable';

const Card = styled.div`
  background: ${theme.colors.bg || '#ffffff'};
  border: 1px solid ${theme.colors.border || '#e5e7eb'};
  border-radius: ${theme.borderRadius?.md || '8px'};
  padding: ${theme.spacing?.lg || '1.5rem'};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
`;

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
  const [sesiones, setSesiones] = useState([]);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [listaYaRegistrada, setListaYaRegistrada] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // NUEVO: Estado para almacenar info del usuario
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Cargar información del usuario al montar el componente
    const usuarioData = JSON.parse(localStorage.getItem('usuario'));
    setUsuario(usuarioData);
    cargarSesionesDelDia(usuarioData);
  }, []);

  // ACTUALIZADO: Función mejorada con filtro por docente
  const cargarSesionesDelDia = async (usuarioData = usuario) => {
    try {
      setLoading(true);
      
      const hoy = new Date();
      const year = hoy.getFullYear();
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const day = String(hoy.getDate()).padStart(2, '0');
      const fechaHoy = `${year}-${month}-${day}`;
      
      let sesionesData;
      
      // Verificar si el usuario es docente
      if (usuarioData?.rol === 'Docente' && usuarioData?.docenteId) {
        console.log('Cargando sesiones para docente:', usuarioData.docenteId);
        sesionesData = await sesionService.getByDocente(usuarioData.docenteId, fechaHoy);
      } else {
        console.log('Cargando todas las sesiones (Admin)');
        sesionesData = await sesionService.getByRangoFechas(fechaHoy, fechaHoy);
      }
      
      // Filtrar sesiones para asegurar que sean del día exacto
      const sesionesFiltradas = sesionesData.filter(s => {
        const fechaSesion = new Date(s.fecha);
        const fechaSesionStr = fechaSesion.toISOString().split('T')[0];
        return fechaSesionStr === fechaHoy;
      });
      
      setSesiones(sesionesFiltradas);
      
      if (sesionesFiltradas.length === 0) {
        const mensaje = usuarioData?.rol === 'Docente' 
          ? 'No tienes sesiones programadas para hoy'
          : 'No hay sesiones programadas para hoy';
        
        Toast.fire({
          icon: 'info',
          title: mensaje,
        });
      } else {
        Toast.fire({
          icon: 'success',
          title: `${sesionesFiltradas.length} sesión(es) encontrada(s)`,
          timer: 2000
        });
      }
      
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
      Toast.fire({
        icon: 'error',
        title: 'Error al cargar las sesiones del día',
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ... resto de funciones sin cambios (handleSeleccionarSesion, handleCambiarEstado, etc.) ...

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
      setSesionSeleccionada(sesion);

      const yaRegistrada = await paseListaService.verificarListaRegistrada(sesionId);
      setListaYaRegistrada(yaRegistrada);

      if (yaRegistrada) {
        const asistenciasExistentes = await paseListaService.getAsistenciasSesion(sesionId);
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
        timer: 2000
      });

    } catch (error) {
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
      timer: 1500
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
      <Card>
        <LoadingContainer>
          <LoadingSpinner $size="large" />
          <p>Cargando sesiones del día...</p>
        </LoadingContainer>
      </Card>
    );
  }

  return (
    <>
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
              {usuario?.rol === 'Docente' 
                ? 'No tienes sesiones programadas para hoy'
                : 'No hay sesiones programadas para hoy'}
            </p>
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
    </>
  );
}
