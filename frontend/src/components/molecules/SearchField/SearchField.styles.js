import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const SearchFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  min-width: 200px;
  flex: 1;
`;
