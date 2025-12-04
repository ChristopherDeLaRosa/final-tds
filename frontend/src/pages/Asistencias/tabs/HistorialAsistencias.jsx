import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  Search,
  Filter,
  Calendar as CalendarIcon,
  FileText,
  Eye
} from 'lucide-react';
import { theme } from '../../../styles';
import asistenciaService from '../../../services/asistenciaService';
import estudianteService from '../../../services/estudianteService';
import sesionService from '../../../services/sesionService';
import { Toast, MySwal } from '../../../utils/alerts';
import Button from '../../../components/atoms/Button/Button';
import Select from '../../../components/atoms/Select/Select';
import Input from '../../../components/atoms/Input/Input';

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

const FiltersCard = styled(Card)`
  margin-bottom: ${theme.spacing.xl};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const Label = styled.label`
  font-weight: 600;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textPrimary};
`;

const FilterActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.md};
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const StatCard = styled.div`
  background: ${props => props.$bgColor || theme.colors.backgroundAlt};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${props => props.$borderColor || theme.colors.border};
`;

const StatLabel = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xs};
`;

const StatValue = styled.div`
  font-size: ${theme.fontSize['2xl']};
  font-weight: 700;
  color: ${props => props.$color || theme.colors.text};
`;

const TableCard = styled(Card)`
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 2px solid ${theme.colors.border};
`;

const TableTitle = styled.h2`
  font-size: ${theme.fontSize.xl};
  font-weight: 600;
  color: ${theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.backgroundAlt};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 4px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: ${theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${theme.colors.border};
  }

  th {
    background: ${theme.colors.backgroundAlt};
    font-weight: 600;
    color: ${theme.colors.textPrimary};
    font-size: ${theme.fontSize.sm};
    position: sticky;
    top: 0;
    z-index: 10;
  }

  tbody tr:hover {
    background: ${theme.colors.backgroundAlt};
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSize.xs};
  font-weight: 600;
  background: ${props => props.$bgColor};
  color: ${props => props.$textColor};
  white-space: nowrap;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: transparent;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.backgroundAlt};
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${theme.colors.textSecondary};
  
  svg {
    margin-bottom: ${theme.spacing.md};
  }
`;

const LoadingContainer = styled.div`
  padding: 3rem;
  text-align: center;
  
  p {
    margin-top: 1rem;
    color: ${theme.colors.textSecondary};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing.lg};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;

const PaginationInfo = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSize.sm};
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

export default function HistorialAsistencias() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteFilter, setEstudianteFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [fechaInicioFilter, setFechaInicioFilter] = useState('');
  const [fechaFinFilter, setFechaFinFilter] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [asistencias, setAsistencias] = useState([]);
  const [asistenciasFiltradas, setAsistenciasFiltradas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 20;

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (asistencias.length > 0) {
      aplicarFiltros();
    } else {
      setAsistenciasFiltradas([]);
    }
  }, [asistencias, estudianteFilter, estadoFilter, fechaInicioFilter, fechaFinFilter, busqueda]);

  const cargarDatosIniciales = async () => {
    try {
      setLoadingData(true);
      const estudiantesData = await estudianteService.getAll();
      setEstudiantes(estudiantesData.filter(e => e.activo));
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Toast.fire({
        icon: 'error',
        title: 'Error al cargar datos iniciales',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...asistencias];

    if (estudianteFilter) {
      resultado = resultado.filter(a => a.estudianteId === parseInt(estudianteFilter));
    }

    if (estadoFilter) {
      resultado = resultado.filter(a => a.estado === estadoFilter);
    }

    if (busqueda && busqueda.trim() !== '') {
      const searchLower = busqueda.toLowerCase().trim();
      resultado = resultado.filter(a =>
        (a.nombreEstudiante?.toLowerCase() || '').includes(searchLower) ||
        (a.matriculaEstudiante?.toLowerCase() || '').includes(searchLower) ||
        (a.temaSesion?.toLowerCase() || '').includes(searchLower)
      );
    }

    setAsistenciasFiltradas(resultado);
    setPaginaActual(1);
  };

  const handleBuscar = async () => {
    if (!fechaInicioFilter || !fechaFinFilter) {
      Toast.fire({
        icon: 'warning',
        title: 'Selecciona un rango de fechas',
      });
      return;
    }

    try {
      setLoading(true);
      
      const sesionesData = await sesionService.getByRangoFechas(
        fechaInicioFilter,
        fechaFinFilter
      );

      if (sesionesData.length === 0) {
        setAsistencias([]);
        Toast.fire({
          icon: 'info',
          title: 'No hay sesiones en el rango seleccionado',
        });
        setLoading(false);
        return;
      }

      const asistenciasPromises = sesionesData.map(sesion =>
        asistenciaService.getBySesion(sesion.id).catch(err => {
          console.warn(`Error al obtener asistencias de sesión ${sesion.id}:`, err);
          return [];
        })
      );
      
      const asistenciasArrays = await Promise.all(asistenciasPromises);
      const todasAsistencias = asistenciasArrays.flat();
      
      const asistenciasEnriquecidas = todasAsistencias.map(asistencia => {
        const sesion = sesionesData.find(s => s.id === asistencia.sesionId);
        const estudiante = estudiantes.find(e => e.id === asistencia.estudianteId);
        
        return {
          ...asistencia,
          fechaSesion: sesion?.fecha || asistencia.fechaSesion,
          temaSesion: sesion?.tema || '',
          nombreEstudiante: estudiante ? `${estudiante.nombres} ${estudiante.apellidos}` : 'Desconocido',
          matriculaEstudiante: estudiante?.matricula || 'N/A'
        };
      });
      
      setAsistencias(asistenciasEnriquecidas);
      
      if (asistenciasEnriquecidas.length === 0) {
        Toast.fire({
          icon: 'info',
          title: 'No hay asistencias registradas en este período',
        });
      } else {
        Toast.fire({
          icon: 'success',
          title: `${asistenciasEnriquecidas.length} registros encontrados`,
        });
      }
    } catch (error) {
      console.error('Error al buscar asistencias:', error);
      Toast.fire({
        icon: 'error',
        title: 'Error al buscar asistencias',
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setEstudianteFilter('');
    setEstadoFilter('');
    setFechaInicioFilter('');
    setFechaFinFilter('');
    setBusqueda('');
    setAsistencias([]);
    setAsistenciasFiltradas([]);
    setPaginaActual(1);
  };

  const getEstadoBadge = (estado) => {
    const config = {
      'Presente': { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
      'Ausente': { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
      'Tardanza': { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
      'Justificado': { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
    };
    const c = config[estado] || config['Presente'];
    return <Badge $bgColor={c.bg} $textColor={c.text}>{estado}</Badge>;
  };

  const handleVerDetalle = async (asistencia) => {
    MySwal.fire({
      title: 'Detalle de Asistencia',
      html: `
        <div style="text-align: left; padding: 1rem;">
          <p><strong>Estudiante:</strong> ${asistencia.nombreEstudiante}</p>
          <p><strong>Matrícula:</strong> ${asistencia.matriculaEstudiante}</p>
          <p><strong>Fecha:</strong> ${new Date(asistencia.fechaSesion).toLocaleDateString('es-DO')}</p>
          <p><strong>Tema:</strong> ${asistencia.temaSesion || 'Sin tema'}</p>
          <p><strong>Estado:</strong> ${asistencia.estado}</p>
          <p><strong>Observaciones:</strong> ${asistencia.observaciones || 'Sin observaciones'}</p>
          <p><strong>Fecha de Registro:</strong> ${new Date(asistencia.fechaRegistro).toLocaleString('es-DO')}</p>
        </div>
      `,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: theme.colors.primary,
    });
  };

  const stats = {
    total: asistenciasFiltradas.length,
    presentes: asistenciasFiltradas.filter(a => a.estado === 'Presente').length,
    ausentes: asistenciasFiltradas.filter(a => a.estado === 'Ausente').length,
    tardanzas: asistenciasFiltradas.filter(a => a.estado === 'Tardanza').length,
  };

  const totalPaginas = Math.ceil(asistenciasFiltradas.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const asistenciasPaginadas = asistenciasFiltradas.slice(indiceInicio, indiceFin);

  if (loadingData) {
    return (
      <Card>
        <LoadingContainer>
          <LoadingSpinner $size="large" />
          <p>Cargando datos...</p>
        </LoadingContainer>
      </Card>
    );
  }

  return (
    <>
      <FiltersCard>
        <FiltersGrid>
          <FormGroup>
            <Label>Fecha Inicio *</Label>
            <Input
              type="date"
              value={fechaInicioFilter}
              onChange={(e) => setFechaInicioFilter(e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Fecha Fin *</Label>
            <Input
              type="date"
              value={fechaFinFilter}
              onChange={(e) => setFechaFinFilter(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Estudiante</Label>
            <Select
              value={estudianteFilter}
              onChange={(e) => setEstudianteFilter(e.target.value)}
            >
              <option value="">Todos los estudiantes</option>
              {estudiantes.map(est => (
                <option key={est.id} value={est.id}>
                  {est.matricula} - {est.nombres} {est.apellidos}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Estado</Label>
            <Select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Presente">Presente</option>
              <option value="Ausente">Ausente</option>
              <option value="Tardanza">Tardanza</option>
              <option value="Justificado">Justificado</option>
            </Select>
          </FormGroup>
        </FiltersGrid>

        <FormGroup>
          <Label>Búsqueda</Label>
          <Input
            type="text"
            placeholder="Buscar por estudiante, matrícula o tema..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </FormGroup>

        <FilterActions>
          <Button variant="outline" onClick={limpiarFiltros}>
            Limpiar
          </Button>
          <Button
            variant="primary"
            onClick={handleBuscar}
            disabled={loading}
          >
            <Search size={18} />
            {loading ? 'Buscando...' : 'Buscar Asistencias'}
          </Button>
        </FilterActions>
      </FiltersCard>

      {asistenciasFiltradas.length > 0 && (
        <StatsBar>
          <StatCard>
            <StatLabel>Total Registros</StatLabel>
            <StatValue>{stats.total}</StatValue>
          </StatCard>
          <StatCard $bgColor="rgba(16, 185, 129, 0.1)" $borderColor="rgba(16, 185, 129, 0.3)">
            <StatLabel>Presentes</StatLabel>
            <StatValue $color="#10b981">{stats.presentes}</StatValue>
          </StatCard>
          <StatCard $bgColor="rgba(239, 68, 68, 0.1)" $borderColor="rgba(239, 68, 68, 0.3)">
            <StatLabel>Ausentes</StatLabel>
            <StatValue $color="#ef4444">{stats.ausentes}</StatValue>
          </StatCard>
          <StatCard $bgColor="rgba(245, 158, 11, 0.1)" $borderColor="rgba(245, 158, 11, 0.3)">
            <StatLabel>Tardanzas</StatLabel>
            <StatValue $color="#f59e0b">{stats.tardanzas}</StatValue>
          </StatCard>
        </StatsBar>
      )}

      {asistenciasFiltradas.length > 0 && (
        <TableCard>
          <TableHeader>
            <TableTitle>
              <FileText size={24} />
              Registros de Asistencia ({asistenciasFiltradas.length})
            </TableTitle>
          </TableHeader>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Estudiante</th>
                  <th>Matrícula</th>
                  <th>Tema de Clase</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asistenciasPaginadas.map(asistencia => (
                  <tr key={asistencia.id}>
                    <td style={{ fontWeight: '600' }}>{asistencia.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CalendarIcon size={16} color={theme.colors.textMuted} />
                        {new Date(asistencia.fechaSesion).toLocaleDateString('es-DO')}
                      </div>
                    </td>
                    <td>{asistencia.nombreEstudiante}</td>
                    <td>
                      <Badge $bgColor={theme.colors.backgroundAlt} $textColor={theme.colors.textPrimary}>
                        {asistencia.matriculaEstudiante}
                      </Badge>
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {asistencia.temaSesion || <span style={{ color: theme.colors.textMuted }}>Sin tema</span>}
                    </td>
                    <td>{getEstadoBadge(asistencia.estado)}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {asistencia.observaciones || <span style={{ color: theme.colors.textMuted }}>-</span>}
                    </td>
                    <td>
                      <ActionButton onClick={() => handleVerDetalle(asistencia)}>
                        <Eye size={16} />
                        Ver
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>

          {totalPaginas > 1 && (
            <Pagination>
              <PaginationInfo>
                Mostrando {indiceInicio + 1} - {Math.min(indiceFin, asistenciasFiltradas.length)} de {asistenciasFiltradas.length}
              </PaginationInfo>
              <PaginationButtons>
                <Button
                  variant="outline"
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                >
                  Anterior
                </Button>
                <span style={{ 
                  padding: '0 1rem', 
                  display: 'flex', 
                  alignItems: 'center',
                  color: theme.colors.textSecondary 
                }}>
                  Página {paginaActual} de {totalPaginas}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente
                </Button>
              </PaginationButtons>
            </Pagination>
          )}
        </TableCard>
      )}

      {asistenciasFiltradas.length === 0 && asistencias.length === 0 && !loading && (
        <EmptyState>
          <Search size={48} color={theme.colors.textMuted} />
          <p>Selecciona un rango de fechas y haz clic en "Buscar Asistencias"</p>
        </EmptyState>
      )}

      {asistenciasFiltradas.length === 0 && asistencias.length > 0 && !loading && (
        <EmptyState>
          <Filter size={48} color={theme.colors.textMuted} />
          <p>No se encontraron resultados con los filtros aplicados</p>
          <Button variant="outline" onClick={limpiarFiltros} style={{ marginTop: '1rem' }}>
            Limpiar Filtros
          </Button>
        </EmptyState>
      )}
    </>
  );
}
