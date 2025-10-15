import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const IconButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.text};
  padding: 8px;
  border-radius: ${theme.radius};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${theme.transition};

  &:hover {
    background: ${theme.colors.bgHover};
  }
`;

export default IconButton;