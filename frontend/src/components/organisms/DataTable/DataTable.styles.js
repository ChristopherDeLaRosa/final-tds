import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const TableContainer = styled.div`
  width: 100%;
  background: ${theme.colors.bg};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
`;

export const TableToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.bgDark};
  border-bottom: 1px solid ${theme.colors.border};
  gap: ${theme.spacing.lg};
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.spacing.md};
  }
`;

export const FilterControls = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  flex-wrap: wrap;
  align-items: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.md};
  }
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

export const TableHead = styled.thead`
  background: ${theme.colors.bgDark};
  position: sticky;
  top: 0;
  z-index: 10;
`;

export const TableHeaderCell = styled.th`
  padding: ${theme.spacing.lg} ${theme.spacing.md};
  text-align: left;
  background: ${theme.colors.bgDark};
  border-bottom: 2px solid ${theme.colors.border};
  font-weight: 600;
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  
  &:first-child {
    padding-left: ${theme.spacing.xl};
  }
  
  &:last-child {
    padding-right: ${theme.spacing.xl};
  }
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  background: ${theme.colors.bg};
  transition: ${theme.transition};
  
  &:hover {
    background: ${theme.colors.bgHover};
    transform: scale(1.001);
  }
  
  &:not(:last-child) td {
    border-bottom: 1px solid ${theme.colors.border};
  }
`;

export const TableCell = styled.td`
  padding: ${theme.spacing.lg} ${theme.spacing.md};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.text};
  vertical-align: middle;
  
  &:first-child {
    padding-left: ${theme.spacing.xl};
    font-weight: 500;
  }
  
  &:last-child {
    padding-right: ${theme.spacing.xl};
  }
`;

export const TableFooter = styled.div`
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: ${theme.colors.bgDark};
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxxl} ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: ${theme.spacing.lg};
    opacity: 0.3;
  }
  
  h3 {
    font-size: ${theme.fontSize.lg};
    margin-bottom: ${theme.spacing.sm};
    color: ${theme.colors.text};
  }
  
  p {
    font-size: ${theme.fontSize.sm};
  }
`;

export const LoadingState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxxl} ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid ${theme.colors.border};
    border-top-color: ${theme.colors.accent};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto ${theme.spacing.lg};
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: center;
  align-items: center;
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.sm};
  min-width: 36px;
  min-height: 36px;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: ${theme.transition};
  background-color: ${props => 
    props.type === 'delete' 
      ? 'rgba(220, 38, 38, 0.1)' 
      : props.type === 'edit'
      ? 'rgba(79, 140, 255, 0.1)'
      : 'rgba(139, 146, 168, 0.1)'
  };
  color: ${props => 
    props.type === 'delete' 
      ? '#ef4444' 
      : props.type === 'edit'
      ? theme.colors.accent
      : theme.colors.textMuted
  };
  border: 1px solid ${props => 
    props.type === 'delete' 
      ? 'rgba(220, 38, 38, 0.2)' 
      : props.type === 'edit'
      ? 'rgba(79, 140, 255, 0.2)'
      : 'rgba(139, 146, 168, 0.2)'
  };

  &:hover:not(:disabled) {
    background-color: ${props => 
      props.type === 'delete' 
        ? 'rgba(220, 38, 38, 0.2)' 
        : props.type === 'edit'
        ? 'rgba(79, 140, 255, 0.2)'
        : 'rgba(139, 146, 168, 0.2)'
    };
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 2;
  }
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.xs};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch(props.variant) {
      case 'success':
        return `
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.2);
        `;
      case 'warning':
        return `
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.2);
        `;
      case 'danger':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        `;
      default:
        return `
          background: rgba(139, 146, 168, 0.1);
          color: ${theme.colors.textMuted};
          border: 1px solid rgba(139, 146, 168, 0.2);
        `;
    }
  }}
`;