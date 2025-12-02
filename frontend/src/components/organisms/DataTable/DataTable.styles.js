import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const TableContainer = styled.div`
  width: 100%;
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid ${theme.colors.border};
  overflow: hidden;
  box-shadow: ${theme.shadows.md};
`;

export const TableToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 1.25rem;
  background: ${theme.colors.card};
  border-bottom: 1px solid ${theme.colors.borderLight};
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
  border-collapse: collapse;
  font-size: 0.875rem;
`;

export const TableHead = styled.thead`
  background: ${theme.colors.card};
  border-bottom: 2px solid ${theme.colors.borderLight};
`;

export const TableHeaderCell = styled.th`
  padding: 0.875rem 1rem;
  text-align: left;
  background: ${theme.colors.card};
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  
  &:first-child {
    padding-left: ${theme.spacing.xl};
  }
  
  &:last-child {
    padding-right: ${theme.spacing.xl};
  }
`;

export const TableBody = styled.tbody`
  background-color: ${theme.colors.white};
`;

export const TableRow = styled.tr`
  background: ${theme.colors.white};
  transition: background-color 0.15s ease;
  border-bottom: 1px solid ${theme.colors.borderLight};
  
  &:hover {
    background: ${theme.colors.card};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

export const TableCell = styled.td`
  padding: 1rem;
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
  padding: 1rem 1.25rem;
  background: ${theme.colors.card};
  border-top: 1px solid ${theme.colors.borderLight};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${theme.colors.textMuted};
  font-size: 0.875rem;
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: ${theme.spacing.lg};
    opacity: 0.3;
    color: ${theme.colors.textLight};
  }
  
  h3 {
    font-size: ${theme.fontSize.lg};
    margin-bottom: ${theme.spacing.sm};
    color: ${theme.colors.text};
    font-weight: 600;
  }
  
  p {
    font-size: ${theme.fontSize.sm};
    color: ${theme.colors.textMuted};
  }
`;

export const LoadingState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${theme.colors.textMuted};
  
  .spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid ${theme.colors.borderLight};
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
  gap: 0.25rem;
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
  transition: all 0.15s ease;
  background-color: ${props => 
    props.type === 'delete' 
      ? 'rgba(239, 68, 68, 0.1)' 
      : props.type === 'edit'
      ? 'rgba(37, 99, 235, 0.1)'
      : 'rgba(139, 146, 168, 0.1)'
  };
  color: ${props => 
    props.type === 'delete' 
      ? theme.colors.danger
      : props.type === 'edit'
      ? theme.colors.accent
      : theme.colors.textMuted
  };
  border: 1px solid ${props => 
    props.type === 'delete' 
      ? 'rgba(239, 68, 68, 0.2)' 
      : props.type === 'edit'
      ? 'rgba(37, 99, 235, 0.2)'
      : 'rgba(139, 146, 168, 0.2)'
  };

  &:hover:not(:disabled) {
    background-color: ${props => 
      props.type === 'delete' 
        ? 'rgba(239, 68, 68, 0.15)' 
        : props.type === 'edit'
        ? 'rgba(37, 99, 235, 0.15)'
        : 'rgba(139, 146, 168, 0.15)'
    };
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  
  ${props => {
    switch(props.variant) {
      case 'success':
        return `
          background: rgba(16, 185, 129, 0.1);
          color: ${theme.colors.success};
          border: 1px solid rgba(16, 185, 129, 0.2);
        `;
      case 'warning':
        return `
          background: rgba(245, 158, 11, 0.1);
          color: ${theme.colors.warning};
          border: 1px solid rgba(245, 158, 11, 0.2);
        `;
      case 'danger':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: ${theme.colors.danger};
          border: 1px solid rgba(239, 68, 68, 0.2);
        `;
      case 'info':
        return `
          background: rgba(59, 130, 246, 0.1);
          color: ${theme.colors.info};
          border: 1px solid rgba(59, 130, 246, 0.2);
        `;
      default:
        return `
          background: rgba(100, 116, 139, 0.1);
          color: ${theme.colors.textMuted};
          border: 1px solid rgba(100, 116, 139, 0.2);
        `;
    }
  }}
`;

