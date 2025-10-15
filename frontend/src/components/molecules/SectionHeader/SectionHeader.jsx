import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const SectionHeaderWrapper = styled.div`
  padding: 16px 12px 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SectionHeader = ({ children, collapsed }) => 
  !collapsed ? <SectionHeaderWrapper>{children}</SectionHeaderWrapper> : null;

export default SectionHeader;