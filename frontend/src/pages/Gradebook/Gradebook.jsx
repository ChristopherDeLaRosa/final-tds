import { useState, useEffect } from 'react';
import { BookOpen, Save, RefreshCw, TrendingUp, Users, Award, Download } from 'lucide-react';
import styled from 'styled-components';
import { theme } from '../../styles';
import { MySwal, Toast } from '../../utils/alerts';
import calificacionService from '../../services/calificacionService';
import grupoCursoService from '../../services/grupoCursoService';
import periodoService from '../../services/periodoService';
import GradebookTable from './GradebookTable';
import GradebookFilters from './GradebookFilters';
import GradebookStats from './GradebookStats';

const PageContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  color: ${theme.colors.text};
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 ${theme.spacing.sm} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  
  svg {
    color: ${theme.colors.accent};
  }
`;

const Subtitle = styled.p`
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSize.md};
  margin: 0;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  flex-wrap: wrap;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${props => {
    if (props.$variant === 'primary') return theme.colors.accent;
    if (props.$variant === 'success') return theme.colors.success;
    return theme.colors.white;
  }};
  color: ${props => 
    props.$variant === 'primary' || props.$variant === 'success' 
      ? theme.colors.white 
      : theme.colors.accent
  };
  border: ${props => 
    props.$variant === 'primary' || props.$variant === 'success'
      ? 'none' 
      : `2px solid ${theme.colors.accent}`
  };
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props => {
      if (props.$variant === 'primary') return '0 4px 12px rgba(37, 99, 235, 0.35)';
      if (props.$variant === 'success') return '0 4px 12px rgba(16, 185, 129, 0.35)';
      return '0 4px 12px rgba(37, 99, 235, 0.2)';
    }};
    background: ${props => {
      if (props.$variant === 'primary') return theme.colors.accentHover;
      if (props.$variant === 'success') return '#059669';
      return `${theme.colors.accent}08`;
    }};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xxxl};
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid ${theme.colors.border};
  gap: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.lg};
  
  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid ${theme.colors.borderLight};
    border-top-color: ${theme.colors.accent};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxxl};
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  border: 2px dashed ${theme.colors.border};
  
  svg {
    margin: 0 auto ${theme.spacing.lg};
    color: ${theme.colors.textMuted};
  }
  
  h3 {
    color: ${theme.colors.text};
    font-size: ${theme.fontSize.xl};
    margin: 0 0 ${theme.spacing.sm} 0;
  }
  
  p {
    color: ${theme.colors.textMuted};
    font-size: ${theme.fontSize.md};
    margin: 0;
  }
`;

const UnsavedChangesAlert = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.warningLight};
  border: 1px solid ${theme.colors.warning};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.warning};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  margin-bottom: ${theme.spacing.lg};
  
  svg {
    flex-shrink: 0;
  }
`;

export default function Gradebook() {
  // Estados principales
  const [periodos, setPeriodos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  
  // Datos del gradebook
  const [gradebookData, setGradebookData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(true);
  
  // Cambios sin guardar
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [modifiedCells, setModifiedCells] = useState({});

  // ============================================
  //      CARGAR DATOS INICIALES
  // ============================================
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingFilters(true);
      
      // Cargar períodos
      const periodosData = await periodoService.getAll();
      setPeriodos(periodosData.filter(p => p.activo));
      
      // Seleccionar período actual por defecto
      const periodoActual = periodosData.find(p => p.esActual);
      if (periodoActual) {
        setSelectedPeriodo(periodoActual.id);
        
        // Cargar grupos del período actual
        const gruposData = await grupoCursoService.getByPeriodo(periodoActual.nombre);
        setGrupos(gruposData.filter(g => g.activo));
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      Toast.fire({
        icon: 'error',
        title: 'Error al cargar períodos y grupos',
      });
    } finally {
      setLoadingFilters(false);
    }
  };

  // ============================================
  //      CAMBIO DE PERÍODO
  // ============================================
  useEffect(() => {
    if (selectedPeriodo) {
      loadGruposByPeriodo(selectedPeriodo);
    }
  }, [selectedPeriodo]);

  const loadGruposByPeriodo = async (periodoId) => {
    try {
      const periodo = periodos.find(p => p.id === periodoId);
      if (!periodo) return;
      
      const gruposData = await grupoCursoService.getByPeriodo(periodo.nombre);
      setGrupos(gruposData.filter(g => g.activo));
      
      // Limpiar selección de grupo si no existe en el nuevo período
      if (selectedGrupo && !gruposData.find(g => g.id === selectedGrupo)) {
        setSelectedGrupo(null);
        setGradebookData(null);
      }
    } catch (error) {
      console.error('Error cargando grupos:', error);
      Toast.fire({
        icon: 'error',
        title: 'Error al cargar grupos del período',
      });
    }
  };

  // ============================================
  //      CARGAR GRADEBOOK
  // ============================================
  const loadGradebook = async (skipUnsavedCheck = false) => {
    if (!selectedGrupo) {
      Toast.fire({
        icon: 'warning',
        title: 'Selecciona un grupo-curso',
      });
      return;
    }

    // Verificar cambios sin guardar
    if (hasUnsavedChanges && !skipUnsavedCheck) {
      const { isConfirmed } = await MySwal.fire({
        title: '¿Cambiar de grupo?',
        text: 'Tienes cambios sin guardar. Se perderán si continúas.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      });
      
      if (!isConfirmed) return;
    }

    try {
      setLoading(true);
      
      const data = await calificacionService.getCalificacionesGrupoCurso(selectedGrupo);
      setGradebookData(data);
      setHasUnsavedChanges(false);
      setModifiedCells({});
      
      Toast.fire({
        icon: 'success',
        title: 'Libro de calificaciones cargado',
      });
    } catch (error) {
      console.error('Error cargando gradebook:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error al cargar',
        text: 'No se pudo cargar el libro de calificaciones. Intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  //      MANEJAR CAMBIOS EN CELDAS
  // ============================================
  const handleCellChange = (estudianteId, rubroId, newValue) => {
    // Actualizar datos localmente
    setGradebookData(prev => {
      const newData = { ...prev };
      const estudianteIndex = newData.estudiantes.findIndex(
        e => e.estudianteId === estudianteId
      );
      
      if (estudianteIndex !== -1) {
        newData.estudiantes[estudianteIndex].notasPorRubro = {
          ...newData.estudiantes[estudianteIndex].notasPorRubro,
          [rubroId]: newValue === '' ? null : parseFloat(newValue),
        };
        
        // Recalcular promedio
        const estudiante = newData.estudiantes[estudianteIndex];
        
        let sumaPonderada = 0;
        let sumaPorcentajes = 0;
        
        newData.rubros.forEach(r => {
          const nota = estudiante.notasPorRubro[r.rubroId];
          if (nota !== null && nota !== undefined) {
            sumaPonderada += nota * (r.porcentaje / 100);
            sumaPorcentajes += r.porcentaje;
          }
        });
        
        newData.estudiantes[estudianteIndex].promedioFinal = 
          sumaPorcentajes > 0 ? Math.round(sumaPonderada * 100) / 100 : null;
      }
      
      return newData;
    });

    // Marcar celda como modificada
    const cellKey = `${estudianteId}-${rubroId}`;
    setModifiedCells(prev => ({
      ...prev,
      [cellKey]: { estudianteId, rubroId, nota: newValue === '' ? null : parseFloat(newValue) },
    }));
    
    setHasUnsavedChanges(true);
  };

  // ============================================
  //      GUARDAR CALIFICACIONES
  // ============================================
  const handleSaveGrades = async () => {
    if (!hasUnsavedChanges || Object.keys(modifiedCells).length === 0) {
      Toast.fire({
        icon: 'info',
        title: 'No hay cambios para guardar',
      });
      return;
    }

    try {
      MySwal.fire({
        title: 'Guardando calificaciones...',
        text: `${Object.keys(modifiedCells).length} calificaciones`,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => MySwal.showLoading(),
      });

      // Agrupar por rubro para guardar masivamente
      const calificacionesPorRubro = {};
      
      Object.values(modifiedCells).forEach(({ estudianteId, rubroId, nota }) => {
        if (!calificacionesPorRubro[rubroId]) {
          calificacionesPorRubro[rubroId] = [];
        }
        
        calificacionesPorRubro[rubroId].push({
          estudianteId,
          nota: nota === null ? 0 : nota,
          observaciones: null,
        });
      });

      // Guardar cada grupo de calificaciones
      const promises = Object.entries(calificacionesPorRubro).map(
        ([rubroId, calificaciones]) => 
          calificacionService.registrarGrupo({
            rubroId: parseInt(rubroId),
            calificaciones,
          })
      );

      await Promise.all(promises);

      MySwal.close();
      Toast.fire({
        icon: 'success',
        title: 'Calificaciones guardadas exitosamente',
      });

      setHasUnsavedChanges(false);
      setModifiedCells({});
      
      // Recargar datos sin verificar cambios sin guardar
      await loadGradebook(true);
    } catch (error) {
      MySwal.close();
      console.error('Error guardando calificaciones:', error);
      
      const errorMsg = error.response?.data?.message || 'Error al guardar las calificaciones';
      
      MySwal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: errorMsg,
        confirmButtonText: 'Entendido',
      });
    }
  };

  // ============================================
  //      DESCARTAR CAMBIOS
  // ============================================
  const handleDiscardChanges = async () => {
    if (!hasUnsavedChanges) return;

    const { isConfirmed } = await MySwal.fire({
      title: '¿Descartar cambios?',
      text: 'Se perderán todas las modificaciones no guardadas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, descartar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (isConfirmed) {
      await loadGradebook(true);
    }
  };

  // ============================================
  //      RENDER
  // ============================================
  if (loadingFilters) {
    return (
      <PageContainer>
        <LoadingOverlay>
          <div className="spinner" />
          <div>Cargando períodos y grupos...</div>
        </LoadingOverlay>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <Header>
        <Title>
          <BookOpen size={32} />
          Libro de Calificaciones
        </Title>
        <Subtitle>
          Registro masivo de notas y evaluaciones - Zirak Gradebook
        </Subtitle>
      </Header>

      {/* Filtros */}
      <GradebookFilters
        periodos={periodos}
        grupos={grupos}
        selectedPeriodo={selectedPeriodo}
        selectedGrupo={selectedGrupo}
        onPeriodoChange={setSelectedPeriodo}
        onGrupoChange={setSelectedGrupo}
        onLoadGradebook={loadGradebook}
        loading={loading}
      />

      {/* Alerta de cambios sin guardar */}
      {hasUnsavedChanges && (
        <UnsavedChangesAlert>
          <Award size={20} />
          <span>
            Tienes {Object.keys(modifiedCells).length} calificaciones sin guardar
          </span>
        </UnsavedChangesAlert>
      )}

      {/* Barra de acciones */}
      {gradebookData && (
        <ActionBar>
          <GradebookStats 
            data={gradebookData}
            compact
          />
          
          <ActionButtons>
            <Button
              onClick={handleDiscardChanges}
              disabled={!hasUnsavedChanges || loading}
            >
              <RefreshCw size={18} />
              Descartar
            </Button>
            
            <Button
              $variant="success"
              onClick={handleSaveGrades}
              disabled={!hasUnsavedChanges || loading}
            >
              <Save size={18} />
              Guardar ({Object.keys(modifiedCells).length})
            </Button>
          </ActionButtons>
        </ActionBar>
      )}

      {/* Contenido principal */}
      {loading ? (
        <LoadingOverlay>
          <div className="spinner" />
          <div>Cargando libro de calificaciones...</div>
        </LoadingOverlay>
      ) : gradebookData ? (
        <GradebookTable
          data={gradebookData}
          onCellChange={handleCellChange}
          modifiedCells={modifiedCells}
        />
      ) : (
        <EmptyState>
          <BookOpen size={64} />
          <h3>Selecciona un grupo-curso</h3>
          <p>
            Usa los filtros de arriba para seleccionar el período y grupo-curso
            que deseas calificar.
          </p>
        </EmptyState>
      )}
    </PageContainer>
  );
}

