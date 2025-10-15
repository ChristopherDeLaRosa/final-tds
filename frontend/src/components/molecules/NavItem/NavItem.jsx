import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const NavItemWrapper = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: ${theme.radius};
  color: ${theme.colors.text};
  text-decoration: none;
  transition: ${theme.transition};
  position: relative;
  border-left: 2px solid transparent;
  margin: 2px 0;

  &:hover {
    background: ${theme.colors.bgHover};
  }

  &.active {
    background: ${theme.colors.bgHover};
    border-left-color: ${theme.colors.accent};
    color: ${theme.colors.text};
  }

  ${props => props.$collapsed && `
    justify-content: center;
    padding: 12px;
  `}
`;

const NavItemLabel = styled.span`
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

export const NavItem = ({ to, icon: Icon, label, collapsed }) => (
  <NavItemWrapper 
    to={to} 
    $collapsed={collapsed}
    title={collapsed ? label : ''}
    className={({ isActive }) => isActive ? 'active' : ''}
  >
    <Icon size={20} />
    {!collapsed && <NavItemLabel>{label}</NavItemLabel>}
  </NavItemWrapper>
);

export default NavItem;