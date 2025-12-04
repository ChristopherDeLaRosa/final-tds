import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const Card = styled.div`
  background: ${theme.colors.bg || '#ffffff'};
  border: 1px solid ${theme.colors.border || '#e5e7eb'};
  border-radius: ${theme.borderRadius?.md || '8px'};
  padding: ${props => props.$padding || theme.spacing?.lg || '1.5rem'};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;

  ${props => props.$hoverable && `
    cursor: pointer;
    &:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transform: translateY(-2px);
    }
  `}

  ${props => props.$noPadding && `
    padding: 0;
  `}
`;

export default Card;