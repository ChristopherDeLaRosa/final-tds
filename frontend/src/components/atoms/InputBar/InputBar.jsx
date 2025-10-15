import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const InputBar = styled.input`
  background: ${theme.colors.bgDark};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};
  padding: 10px 12px;
  border-radius: ${theme.radius};
  font-size: 14px;
  width: 100%;
  transition: ${theme.transition};

  &::placeholder {
    color: ${theme.colors.textMuted};
  }

  &:focus {
    border-color: ${theme.colors.accent};
    outline: none;
  }
`;

export default InputBar;