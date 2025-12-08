import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const NavItemWrapper = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: ${theme.borderRadius.md};
  color: #c0bfbf;
  text-decoration: none;
  transition: ${theme.transition.normal};
  position: relative;
  border-left: 3px solid transparent;
  margin: 2px 0;

  /* ICONO (normal) */
  svg {
    color: ${theme.colors.textSecondary};
    transition: ${theme.transition.normal};
  }

  /* HOVER */
  &:hover {
    background: ${theme.colors.secondaryLight};
    color: ${theme.colors.text};

    svg {
      color: ${theme.colors.accent};
    }
  }

  /* ACTIVO */
  &.active {
    background: ${theme.colors.accentLight};
    border-left-color: ${theme.colors.accent};
    color: ${theme.colors.accent};

    svg {
      color: ${theme.colors.accent};
    }

    font-weight: ${theme.fontWeight.semibold};
  }

  /* COLAPSADO */
  ${props => props.$collapsed && `
    justify-content: center;
    padding: 12px;

    span {
      display: none;
    }
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