import styled from 'styled-components';
import { theme } from '../../../styles/theme';
import { Select } from '../../atoms'; 

export const FilterSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  min-width: 150px;
`;

export const SelectWithIcon = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const IconWrapper = styled.div`
  position: absolute;
  left: 10px;
  pointer-events: none;
  color: ${theme.colors.textMuted};
  margin-top: 5px;
`;

export const StyledSelect = styled(Select)`
  padding-left: 2rem; /* Espacio para el icono */
`;
