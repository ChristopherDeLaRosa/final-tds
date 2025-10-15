import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
  }
`;

export const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const PaginationInfo = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textMuted};
  white-space: nowrap;
`;

export const ItemsPerPageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  
  select {
    min-width: 130px;
  }
`;