import styled from 'styled-components';
import { theme } from '../../../styles';

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
  border-left: 4px solid ${props => props.$accentColor || theme.colors.accent};
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

const StatIcon = styled.div`
  font-size: 24px;
  margin-bottom: ${theme.spacing.sm};
`;

export default function CrudStats({ stats = [] }) {
  if (!stats || stats.length === 0) return null;

  return (
    <StatsGrid>
      {stats.map((stat, index) => (
        <StatCard key={index} $accentColor={stat.color}>
          {stat.icon && <StatIcon>{stat.icon}</StatIcon>}
          <StatLabel>{stat.label}</StatLabel>
          <StatValue>{stat.value}</StatValue>
        </StatCard>
      ))}
    </StatsGrid>
  );
}