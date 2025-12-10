import { Users, TrendingUp, Award, BarChart3 } from 'lucide-react';
import styled from 'styled-components';
import { theme } from '../../styles';

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$compact ? 'repeat(auto-fit, minmax(140px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))'};
  gap: ${props => props.$compact ? theme.spacing.md : theme.spacing.lg};
  ${props => !props.$compact && `margin-bottom: ${theme.spacing.xl};`}
`;

const StatCard = styled.div`
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${props => props.$compact ? theme.spacing.md : theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

const IconWrapper = styled.div`
  width: ${props => props.$compact ? '40px' : '48px'};
  height: ${props => props.$compact ? '40px' : '48px'};
  background: ${props => props.$bgColor}15;
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
`;

const StatLabel = styled.div`
  font-size: ${props => props.$compact ? theme.fontSize.xs : theme.fontSize.sm};
  color: ${theme.colors.textMuted};
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatValue = styled.div`
  font-size: ${props => props.$compact ? theme.fontSize.lg : theme.fontSize.xl};
  font-weight: 700;
  color: ${theme.colors.text};
  line-height: 1;
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
      icon: <Users size={compact ? 20 : 24} />,
      color: theme.colors.accent,
    },
    {
      label: 'Promedio Grupo',
      value: promedioGrupo.toFixed(2),
      icon: <Award size={compact ? 20 : 24} />,
      color: theme.colors.info,
    },
    {
      label: 'Aprobados',
      value: aprobados,
      icon: <TrendingUp size={compact ? 20 : 24} />,
      color: theme.colors.success,
    },
    {
      label: '% Aprobación',
      value: `${porcentajeAprobacion}%`,
      icon: <BarChart3 size={compact ? 20 : 24} />,
      color: porcentajeAprobacion >= 70 ? theme.colors.success : theme.colors.warning,
    },
  ];

  return (
    <StatsContainer $compact={compact}>
      {stats.map((stat, index) => (
        <StatCard key={index} $compact={compact}>
          <IconWrapper $bgColor={stat.color} $compact={compact}>
            {stat.icon}
          </IconWrapper>
          <StatContent>
            <StatLabel $compact={compact}>{stat.label}</StatLabel>
            <StatValue $compact={compact}>{stat.value}</StatValue>
          </StatContent>
        </StatCard>
      ))}
    </StatsContainer>
  );
}

