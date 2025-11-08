import { useState, useEffect } from 'react';
import { DataTable } from '../../components';
import { theme } from '../../styles';
import styled from 'styled-components';
import StudentModal from '../../components/organisms/StudentModal';
import estudianteService from '../../services/authService';

const PageContainer = styled.div`
  padding: ${theme.spacing.xl};
  background: ${theme.colors.bg};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  color: ${theme.colors.text};
  font-Size: ${theme.fontSize.xxl};
  font-weight: 600;
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const Subtitle = styled.p`
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSize.sm};
  margin: 0;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.accent};
  color: ${theme.colors.text};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: ${theme.transition};
  box-shadow: 0 2px 8px rgba(79, 140, 255, 0.3);
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.accentHover};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 140, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const StatCard = styled.div`
  background: ${theme.colors.bgDark};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
  border-left: 4px solid ${props => props.accentColor || theme.colors.accent};
  transition: ${theme.transition};
  
  &:hover {
    background: ${theme.colors.bgHover};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const StatLabel = styled.p`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`;

const StatValue = styled.p`
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: ${theme.colors.text};
`;

const TableCard = styled.div`
  background: ${theme.colors.bgDark};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
`;

const Badge = styled.span`
  display: inline-block;
  font-weight: 600;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.xs};
  background-color: ${props => props.bgColor};
  color: ${props => props.textColor};
  border: 1px solid ${props => props.borderColor};
  white-space: nowrap;
`;

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSize.lg};
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-left: 4px solid #ef4444;
  color: #ef4444;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  
  &::before {
    content: '⚠';
    font-size: 24px;
  }
`;

const MatriculaBadge = styled.span`
  display: inline-block;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(79, 140, 255, 0.1);
  color: ${theme.colors.accent};
  border: 1px solid rgba(79, 140, 255, 0.3);
  font-size: 12px;
`;

export default function Students() {
  // Estados
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);

  // Cargar estudiantes al montar el componente
  useEffect(() => {
    fetchEstudiantes();
  }, []);

  // Función para obtener estudiantes de la API
  const fetchEstudiantes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await estudianteService.getAll();
      console.log('Estudiantes cargados:', data);
      setEstudiantes(data);
    } catch (err) {
      setError('Error al cargar los estudiantes. Por favor, verifica tu conexión e intenta de nuevo.');
      console.error('Error fetching estudiantes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-DO', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Definición de columnas para la tabla (usando campos reales de la API)
  const columns = [
    { 
      key: 'id', 
      title: 'ID', 
      width: '60px' 
    },
    { 
      key: 'matricula', 
      title: 'Matrícula',
      width: '120px',
      render: (value) => <MatriculaBadge>{value}</MatriculaBadge>
    },
    { 
      key: 'nombreCompleto', 
      title: 'Nombre Completo'
    },
    { 
      key: 'email', 
      title: 'Correo Electrónico' 
    },
    { 
      key: 'telefono', 
      title: 'Teléfono',
      width: '130px' 
    },
    {
      key: 'activo',
      title: 'Estado',
      width: '100px',
      render: (value) => (
        <Badge
          bgColor={value ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
          textColor={value ? '#10b981' : '#ef4444'}
          borderColor={value ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
        >
          {value ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
  ];

  // Handler para editar estudiante
  const handleEdit = (estudiante) => {
    console.log('Editar estudiante:', estudiante);
    setSelectedEstudiante(estudiante);
    setIsModalOpen(true);
  };

  // Handler para eliminar estudiante
  const handleDelete = async (estudiante) => {
    const nombreCompleto = estudiante.nombreCompleto || `${estudiante.nombres} ${estudiante.apellidos}`;
    
    if (window.confirm(`¿Estás seguro de eliminar al estudiante ${nombreCompleto}?\n\nEsta acción no se puede deshacer.`)) {
      try {
        await estudianteService.delete(estudiante.id);
        
        // Actualizar lista local eliminando el estudiante
        setEstudiantes(estudiantes.filter(est => est.id !== estudiante.id));
        
        alert(`✓ Estudiante ${nombreCompleto} eliminado exitosamente`);
      } catch (err) {
        alert('✗ Error al eliminar el estudiante. Por favor, intenta de nuevo.');
        console.error('Error deleting estudiante:', err);
      }
    }
  };

  // Handler para abrir modal de crear estudiante
  const handleAddStudent = () => {
    setSelectedEstudiante(null);
    setIsModalOpen(true);
  };

  // Handler para cerrar modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEstudiante(null);
  };

  // Handler para cuando se guarda exitosamente (crear o editar)
  const handleModalSuccess = () => {
    fetchEstudiantes(); // Recargar la lista de estudiantes
  };

  // Calcular estadísticas
  const totalEstudiantes = estudiantes.length;
  const estudiantesActivos = estudiantes.filter(e => e.activo).length;
  const estudiantesInactivos = estudiantes.filter(e => !e.activo).length;

  // Mostrar loading mientras carga
  if (loading) {
    return (
      <PageContainer>
        <LoadingOverlay>
          <div>Cargando estudiantes...</div>
        </LoadingOverlay>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Mensaje de error si existe */}
      {error && (
        <ErrorMessage>
          <div>
            <strong>Error:</strong> {error}
            <div style={{ marginTop: '8px' }}>
              <button 
                onClick={fetchEstudiantes}
                style={{
                  background: 'transparent',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Reintentar
              </button>
            </div>
          </div>
        </ErrorMessage>
      )}

      {/* Header */}
      <Header>
        <HeaderContent>
          <Title>Gestión de Estudiantes</Title>
          <Subtitle>Sistema de registro escolar - EduCore</Subtitle>
        </HeaderContent>
        
        <AddButton onClick={handleAddStudent} disabled={loading}>
          <span style={{ fontSize: '18px' }}>+</span>
          Agregar Estudiante
        </AddButton>
      </Header>

      {/* Tarjetas de estadísticas */}
      <StatsGrid>
        <StatCard accentColor={theme.colors.accent}>
          <StatLabel>Total Estudiantes</StatLabel>
          <StatValue>{totalEstudiantes}</StatValue>
        </StatCard>

        <StatCard accentColor="#10b981">
          <StatLabel>Estudiantes Activos</StatLabel>
          <StatValue>{estudiantesActivos}</StatValue>
        </StatCard>

        <StatCard accentColor="#ef4444">
          <StatLabel>Estudiantes Inactivos</StatLabel>
          <StatValue>{estudiantesInactivos}</StatValue>
        </StatCard>
      </StatsGrid>

      {/* Tabla de estudiantes */}
      <TableCard>
        <DataTable
          data={estudiantes}
          columns={columns}
          searchFields={['nombreCompleto', 'nombres', 'apellidos', 'email', 'matricula', 'telefono']}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          emptyMessage="No hay estudiantes registrados. ¡Agrega el primero!"
          loadingMessage="Cargando estudiantes..."
        />
      </TableCard>

      {/* Modal de crear/editar estudiante */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        estudiante={selectedEstudiante}
        onSuccess={handleModalSuccess}
      />
    </PageContainer>
  );
}
