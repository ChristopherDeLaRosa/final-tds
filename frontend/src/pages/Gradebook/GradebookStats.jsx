import { Users, TrendingUp, Award, BarChart3 } from 'lucide-react';
import styled from 'styled-components';
import { theme } from '../../styles';

const StatsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  flex-wrap: wrap;
  ${props => !props.$compact && `margin-bottom: ${theme.spacing.xl};`}
  
  @media (max-width: 1024px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  flex: 1;
  min-width: 180px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  /* Borde de color en la parte superior */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.$accentColor};
    opacity: 0.8;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
    border-color: ${props => props.$accentColor}40;
    
    &::before {
      opacity: 1;
    }
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.$bgColor}12;
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    color: ${props => props.$bgColor};
  }
`;

const StatContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StatLabel = styled.div`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.textMuted};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatValue = styled.div`
  font-size: ${theme.fontSize.xxl};
  font-weight: 700;
  color: ${theme.colors.text};
  line-height: 1.1;
`;

export default function GradebookStats({ data, compact = false }) {
  if (!data) return null;

  const totalEstudiantes = data.estudiantes?.length || 0;
  const promedioGrupo = data.promedioGrupo || 0;
  
  // Calcular estadísticas
  const estudiantesConPromedios = data.estudiantes?.filter(e => e.promedioFinal !== null) || [];
  const aprobados = estudiantesConPromedios.filter(e => e.promedioFinal >= 70).length;
  const porcentajeAprobacion = estudiantesConPromedios.length > 0
    ? Math.round((aprobados / estudiantesConPromedios.length) * 100)
    : 0;

  const stats = [
    {
      label: 'Estudiantes',
      value: totalEstudiantes,
      icon: <Users size={24} />,
      color: theme.colors.accent,
    },
    {
      label: 'Promedio Grupo',
      value: promedioGrupo.toFixed(1),
      icon: <Award size={24} />,
      color: theme.colors.info,
    },
    {
      label: 'Aprobados',
      value: aprobados,
      icon: <TrendingUp size={24} />,
      color: theme.colors.success,
    },
    {
      label: 'Tasa Aprobación',
      value: `${porcentajeAprobacion}%`,
      icon: <BarChart3 size={24} />,
      color: porcentajeAprobacion >= 70 ? theme.colors.success : theme.colors.warning,
    },
  ];

  return (
    <StatsContainer $compact={compact}>
      {stats.map((stat, index) => (
        <StatCard key={index} $accentColor={stat.color}>
          <IconWrapper $bgColor={stat.color}>
            {stat.icon}
          </IconWrapper>
          <StatContent>
            <StatLabel>{stat.label}</StatLabel>
            <StatValue>{stat.value}</StatValue>
          </StatContent>
        </StatCard>
      ))}
    </StatsContainer>
  );
}