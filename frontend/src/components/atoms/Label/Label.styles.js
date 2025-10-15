import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const StyledLabel = styled.label`
  font-size: ${theme.fontSize.sm};
  font-weight: 500;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
  display: block;
`;