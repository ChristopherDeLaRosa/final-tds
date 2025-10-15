import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const StyledText = styled.span`
  font-size: ${props => props.size || theme.fontSize.sm};
  color: ${props => props.color || theme.colors.text};
  font-weight: ${props => props.weight || 'normal'};
  line-height: 1.4;
`;
