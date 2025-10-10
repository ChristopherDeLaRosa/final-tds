import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const TableContainer = styled.div`
  width: 100%;
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  overflow: hidden;
`;

export const TableToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.light};
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
  border-collapse: collapse;
`;

export const TableHead = styled.thead`
  background: ${theme.colors.light};
`;

export const TableHeaderCell = styled.th`
  padding: ${theme.spacing.md};
  text-align: left;
  background: ${theme.colors.light};
  border-bottom: 2px solid ${theme.colors.border};
  font-weight: 600;
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  &:hover {
    background: ${theme.colors.light};
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.borderLight};
  }
`;

export const TableCell = styled.td`
  padding: ${theme.spacing.md};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.text};
`;

export const TableFooter = styled.div`
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: ${theme.colors.light};
  border-top: 1px solid ${theme.colors.border};
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxxl} ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
`;

export const LoadingState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxxl} ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => 
    props.type === 'delete' ? '#fee2e2' : '#dbeafe'
  };
  color: ${props => 
    props.type === 'delete' ? '#dc2626' : '#2563eb'
  };

  &:hover {
    background-color: ${props => 
      props.type === 'delete' ? '#fecaca' : '#bfdbfe'
    };
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    stroke-width: 2;
  }
`;