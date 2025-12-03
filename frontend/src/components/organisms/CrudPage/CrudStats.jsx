import styled from 'styled-components';
import { theme } from '../../../styles';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xxl};
`;

const StatCard = styled.div`
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.md};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: ${theme.borderRadius.lg};
  flex-shrink: 0;
  background: ${props => props.$color ? `${props.$color}15` : theme.colors.accentLight};
  
  svg {
    color: ${props => props.$color || theme.colors.accent};
    width: 28px;
    height: 28px;
  }
`;

const StatContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.text};
  line-height: 1;
  margin-bottom: ${theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textMuted};
  font-weight: 500;
  line-height: 1.3;
`;

const CrudStats = ({ stats }) => {
  if (!stats || stats.length === 0) return null;

  return (
    <StatsGrid>
      {stats.map((stat, index) => (
        <StatCard key={index}>
          <StatIcon $color={stat.color}>
            {stat.icon}
          </StatIcon>
          <StatContent>
            <StatValue>{stat.value?.toLocaleString() || 0}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatContent>
        </StatCard>
      ))}
    </StatsGrid>
  );
};

export default CrudStats;
