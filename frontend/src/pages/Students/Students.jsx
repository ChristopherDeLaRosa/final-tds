import { useState } from 'react';
import { DataTable } from '../../components';
import { theme } from '../../styles';
import styled from 'styled-components';

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

const GradeText = styled.span`
  font-weight: 600;
  color: ${theme.colors.text};
`;

const SectionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-weight: 700;
  border-radius: 50%;
  background: rgba(79, 140, 255, 0.15);
  color: ${theme.colors.accent};
  border: 2px solid rgba(79, 140, 255, 0.3);
`;

export default function Students() {
  const [estudiantes, setEstudiantes] = useState([
    { id: 1, nombre: 'Carlos Pérez', email: 'cperez@colegio.edu', nivel: 'Bachillerato', grado: '1ro', edad: 15, seccion: 'A' },
    { id: 2, nombre: 'María González', email: 'mgonzalez@colegio.edu', nivel: 'Básica', grado: '8vo', edad: 13, seccion: 'B' },
    { id: 3, nombre: 'Juan Martínez', email: 'jmartinez@colegio.edu', nivel: 'Bachillerato', grado: '2do', edad: 16, seccion: 'A' },
    { id: 4, nombre: 'Ana Rodríguez', email: 'arodriguez@colegio.edu', nivel: 'Básica', grado: '7mo', edad: 12, seccion: 'C' },
    { id: 5, nombre: 'Pedro Sánchez', email: 'psanchez@colegio.edu', nivel: 'Bachillerato', grado: '3ro', edad: 17, seccion: 'B' },
    { id: 6, nombre: 'Laura Fernández', email: 'lfernandez@colegio.edu', nivel: 'Básica', grado: '6to', edad: 11, seccion: 'A' },
    { id: 7, nombre: 'Diego López', email: 'dlopez@colegio.edu', nivel: 'Bachillerato', grado: '4to', edad: 18, seccion: 'A' },
    { id: 8, nombre: 'Sofía Ramírez', email: 'sramirez@colegio.edu', nivel: 'Básica', grado: '5to', edad: 10, seccion: 'B' },
    { id: 9, nombre: 'Miguel Torres', email: 'mtorres@colegio.edu', nivel: 'Bachillerato', grado: '2do', edad: 16, seccion: 'C' },
    { id: 10, nombre: 'Valentina Cruz', email: 'vcruz@colegio.edu', nivel: 'Básica', grado: '8vo', edad: 13, seccion: 'A' },
    { id: 11, nombre: 'Roberto Díaz', email: 'rdiaz@colegio.edu', nivel: 'Básica', grado: '7mo', edad: 12, seccion: 'B' },
    { id: 12, nombre: 'Isabella Mora', email: 'imora@colegio.edu', nivel: 'Bachillerato', grado: '1ro', edad: 15, seccion: 'B' },
  ]);

  const columns = [
    { key: 'id', title: 'ID', width: '60px' },
    { key: 'nombre', title: 'Nombre Completo' },
    { key: 'email', title: 'Correo Electrónico' },
    {
      key: 'nivel',
      title: 'Nivel',
      width: '130px',
      render: (value) => (
        <Badge
          bgColor={value === 'Bachillerato' ? 'rgba(79, 140, 255, 0.15)' : 'rgba(251, 191, 36, 0.15)'}
          textColor={value === 'Bachillerato' ? theme.colors.accent : '#fbbf24'}
          borderColor={value === 'Bachillerato' ? 'rgba(79, 140, 255, 0.3)' : 'rgba(251, 191, 36, 0.3)'}
        >
          {value}
        </Badge>
      )
    },
    { 
      key: 'grado', 
      title: 'Grado',
      width: '80px',
      render: (value) => <GradeText>{value}</GradeText>
    },
    { 
      key: 'seccion', 
      title: 'Sección',
      width: '90px',
      render: (value) => <SectionBadge>{value}</SectionBadge>
    },
    { key: 'edad', title: 'Edad', width: '70px' }
  ];

  const filterOptions = {
    nivel: [
      { value: 'Básica', label: 'Básica' },
      { value: 'Bachillerato', label: 'Bachillerato' }
    ],
    grado: [
      { value: '5to', label: '5to Grado' },
      { value: '6to', label: '6to Grado' },
      { value: '7mo', label: '7mo Grado' },
      { value: '8vo', label: '8vo Grado' },
      { value: '1ro', label: '1ro Bachillerato' },
      { value: '2do', label: '2do Bachillerato' },
      { value: '3ro', label: '3ro Bachillerato' },
      { value: '4to', label: '4to Bachillerato' }
    ],
    seccion: [
      { value: 'A', label: 'Sección A' },
      { value: 'B', label: 'Sección B' },
      { value: 'C', label: 'Sección C' }
    ]
  };

  const handleEdit = (estudiante) => {
    console.log('Editar estudiante:', estudiante);
    alert(`Editando: ${estudiante.nombre}\nGrado: ${estudiante.grado} - Sección: ${estudiante.seccion}\n\nEn una aplicación real, aquí abrirías un modal o formulario de edición.`);
  };

  const handleDelete = (estudiante) => {
    if (window.confirm(`¿Estás seguro de eliminar al estudiante ${estudiante.nombre}?\n\nGrado: ${estudiante.grado} - Sección: ${estudiante.seccion}`)) {
      setEstudiantes(estudiantes.filter(est => est.id !== estudiante.id));
      console.log('Estudiante eliminado:', estudiante);
      alert(`Estudiante ${estudiante.nombre} eliminado exitosamente`);
    }
  };

  const handleAddStudent = () => {
    const newId = Math.max(...estudiantes.map(e => e.id)) + 1;
    const newStudent = {
      id: newId,
      nombre: 'Nuevo Estudiante',
      email: `estudiante${newId}@colegio.edu`,
      nivel: 'Básica',
      grado: '5to',
      edad: 10,
      seccion: 'A'
    };
    setEstudiantes([...estudiantes, newStudent]);
    alert('Nuevo estudiante agregado. En una aplicación real, mostrarías un formulario.');
  };

  const totalBasica = estudiantes.filter(e => e.nivel === 'Básica').length;
  const totalBachillerato = estudiantes.filter(e => e.nivel === 'Bachillerato').length;

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <Title>Gestión de Estudiantes</Title>
          <Subtitle>Sistema de registro escolar - Básica y Bachillerato</Subtitle>
        </HeaderContent>
        
        <AddButton onClick={handleAddStudent}>
          <span style={{ fontSize: '18px' }}>+</span>
          Agregar Estudiante
        </AddButton>
      </Header>

      <StatsGrid>
        <StatCard accentColor={theme.colors.accent}>
          <StatLabel>Total Estudiantes</StatLabel>
          <StatValue>{estudiantes.length}</StatValue>
        </StatCard>

        <StatCard accentColor="#fbbf24">
          <StatLabel>Nivel Básica</StatLabel>
          <StatValue>{totalBasica}</StatValue>
        </StatCard>

        <StatCard accentColor="#06b6d4">
          <StatLabel>Bachillerato</StatLabel>
          <StatValue>{totalBachillerato}</StatValue>
        </StatCard>
      </StatsGrid>

      <TableCard>
        <DataTable
          data={estudiantes}
          columns={columns}
          searchFields={['nombre', 'email']}
          filterOptions={filterOptions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          emptyMessage="No hay estudiantes registrados"
          loadingMessage="Cargando estudiantes..."
        />
      </TableCard>
    </PageContainer>
  );
}
