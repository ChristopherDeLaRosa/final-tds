import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Award, DollarSign, Search } from 'lucide-react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${theme.colors.bg};
`;

const Wrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xxl};
`;

const TopBar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.sm};
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 28rem;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  padding-left: 2.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  background: ${theme.colors.bgDark};
  color: ${theme.colors.text};
  outline: none;
  transition: ${theme.transition};
  
  &:focus {
    border-color: ${theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.1);
  }
  
  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.textMuted};
  width: 1.25rem;
  height: 1.25rem;
`;

const Title = styled.h1`
  font-size: ${theme.fontSize.xxl};
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSize.md};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xxl};
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  background-color: ${theme.colors.bgDark};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  border: 1px solid ${theme.colors.border};
  transition: ${theme.transition};
  
  &:hover {
    background-color: ${theme.colors.bgHover};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const StatCardContent = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatTitle = styled.p`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textMuted};
  margin-bottom: ${theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`;

const StatValue = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.sm};
`;

const StatChange = styled.p`
  font-size: ${theme.fontSize.sm};
  color: #22c55e;
  font-weight: 500;
`;

const IconWrapper = styled.div`
  background-color: ${props => props.bg || 'rgba(79, 140, 255, 0.15)'};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.lg};
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ChartCard = styled.div`
  background-color: ${theme.colors.bgDark};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadows.md};
`;

const ChartTitle = styled.h2`
  font-size: ${theme.fontSize.lg};
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xl};
`;

const Dashboard = () => {
  const attendanceData = [
    { month: 'Ene', value: 92 },
    { month: 'Feb', value: 95 },
    { month: 'Mar', value: 93 },
    { month: 'Abr', value: 94 },
    { month: 'May', value: 96 },
    { month: 'Jun', value: 92 },
    { month: 'Jul', value: 90 },
    { month: 'Ago', value: 95 },
    { month: 'Sep', value: 97 },
    { month: 'Oct', value: 94 }
  ];

  const gradesData = [
    { curso: '1ro', promedio: 88 },
    { curso: '2do', promedio: 92 },
    { curso: '3ro', promedio: 90 },
    { curso: '4to', promedio: 87 },
    { curso: '5to', promedio: 85 },
    { curso: '6to', promedio: 83 },
    { curso: 'Bach 1ro', promedio: 91 },
    { curso: 'Bach 2ro', promedio: 89 },
    { curso: 'Bach 3ro', promedio: 93 }
  ];

  const StatCardComponent = ({ title, value, change, icon: Icon, iconBg }) => (
    <StatCard>
      <StatCardContent>
        <StatInfo>
          <StatTitle>{title}</StatTitle>
          <StatValue>{value}</StatValue>
          <StatChange>{change}</StatChange>
        </StatInfo>
        <IconWrapper bg={iconBg}>
          <Icon style={{ width: '1.5rem', height: '1.5rem', color: theme.colors.accent }} />
        </IconWrapper>
      </StatCardContent>
    </StatCard>
  );

  return (
    <Container>
      <Wrapper>
        <Header>
          <TopBar>
            <TitleSection>
              <Title>Dashboard</Title>
            </TitleSection>
            <SearchWrapper>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Buscar estudiantes, docentes..."
              />
            </SearchWrapper>
          </TopBar>
          
          <Subtitle>Bienvenido al sistema de gestión escolar Zirak ERP</Subtitle>
        </Header>

        <StatsGrid>
          <StatCardComponent
            title="Total Estudiantes"
            value="8"
            change="+12% vs mes anterior"
            icon={Users}
            iconBg="rgba(79, 140, 255, 0.15)"
          />
          <StatCardComponent
            title="Asistencia del Mes"
            value="94%"
            change="+2.5% vs mes anterior"
            icon={TrendingUp}
            iconBg="rgba(79, 140, 255, 0.15)"
          />
          <StatCardComponent
            title="Promedio General"
            value="90"
            change="+1.2 puntos"
            icon={Award}
            iconBg="rgba(79, 140, 255, 0.15)"
          />
          <StatCardComponent
            title="Pagos Pendientes"
            value="1"
            change="-5 vs semana anterior"
            icon={DollarSign}
            iconBg="rgba(79, 140, 255, 0.15)"
          />
        </StatsGrid>

        <ChartsGrid>
          <ChartCard>
            <ChartTitle>Tendencia de Asistencia</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
                <XAxis 
                  dataKey="month" 
                  stroke={theme.colors.textMuted} 
                  style={{ fontSize: '0.75rem' }} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke={theme.colors.textMuted} 
                  style={{ fontSize: '0.75rem' }} 
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.colors.bgDark,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.md,
                    color: theme.colors.text
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={theme.colors.accent} 
                  strokeWidth={2} 
                  dot={{ fill: theme.colors.accent, r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard>
            <ChartTitle>Promedio de Calificaciones por Curso</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradesData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
                <XAxis 
                  dataKey="curso" 
                  stroke={theme.colors.textMuted} 
                  style={{ fontSize: '0.75rem' }} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke={theme.colors.textMuted} 
                  style={{ fontSize: '0.75rem' }} 
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.colors.bgDark,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.md,
                    color: theme.colors.text
                  }}
                />
                <Bar 
                  dataKey="promedio" 
                  fill="#22c55e" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </ChartsGrid>
      </Wrapper>
    </Container>
  );
};

export default Dashboard;
