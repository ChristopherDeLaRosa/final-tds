import { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  GraduationCap,
  Users,
  LogOut
} from 'lucide-react';
import styled from 'styled-components';
import { storage } from '../../../utils/storage';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { SearchInput } from '../../molecules/SearchInput/SearchInput';
import { NavItem } from '../../molecules/NavItem/NavItem';
import { SectionHeader } from '../../molecules/SectionHeader/SectionHeader';
import { theme } from '../../../styles/theme';


const SidebarWrapper = styled.aside`
  background: ${theme.colors.bgDark};
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${theme.colors.border};
  position: relative;
  transition: width 0.3s ease;
  width: ${props => props.$collapsed ? '72px' : `${props.$width}px`};
`;

const SidebarHeader = styled.div`
  padding: 20px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${theme.colors.border};
  flex-shrink: 0;
`;

const AppTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AppName = styled.span`
  font-weight: 700;
  font-size: 18px;
  color: ${theme.colors.text};
`;

const UserInfo = styled.div`
  font-size: 12px;
  color: ${theme.colors.textMuted};
`;

const SidebarContent = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const NavigationSection = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 3px;
  }
`;

const FooterSection = styled.div`
  border-top: 1px solid ${theme.colors.border};
  padding: 12px;
  flex-shrink: 0;
  background: ${theme.colors.bgDark};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: ${theme.radius};
  color: ${theme.colors.text};
  text-decoration: none;
  transition: ${theme.transition};
  background: transparent;
  border: none;
  width: 100%;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: ${theme.colors.bgHover};
  }

  ${props => props.$collapsed && `
    justify-content: center;
    padding: 12px;
  `}
`;

const Resizer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  background: transparent;
  transition: background 0.2s;

  &:hover {
    background: ${theme.colors.accent};
  }

  &:active {
    background: ${theme.colors.accent};
  }
`;

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/attendance', label: 'Asistencia', icon: CalendarCheck },
  { path: '/courses', label: 'Cursos', icon: BookOpen },
  { path: '/grades', label: 'Calificaciones', icon: GraduationCap },
  // { path: '/payments', label: 'Payments', icon: CreditCard },
  { path: '/students', label: 'Estudiantes', icon: Users },
  // { path: '/login', label: 'Login', icon: LogIn }
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(() => storage.get('sidebarCollapsed', false));
  const [width, setWidth] = useState(() => storage.get('sidebarWidth', 280));
  const [searchQuery, setSearchQuery] = useState('');
  const [isResizing, setIsResizing] = useState(false);

  const sidebarRef = useRef(null);

  useEffect(() => {
    storage.set('sidebarCollapsed', collapsed);
  }, [collapsed]);

  useEffect(() => {
    storage.set('sidebarWidth', width);
  }, [width]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleLogout = () => {
    // Tu lógica de cierre de sesión aquí
    console.log('Cerrando sesión...');
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      const clampedWidth = Math.min(Math.max(newWidth, 220), 420);
      setWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const filteredItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarWrapper 
      ref={sidebarRef} 
      $collapsed={collapsed} 
      $width={width}
      aria-label="Primary navigation"
    >
      {/* HEADER CON NOMBRE DE LA APLICACIÓN */}
      <SidebarHeader>
        {!collapsed ? (
          <AppTitle>
            <AppName>EduCore</AppName>
            <UserInfo>Admin Usuario</UserInfo>
          </AppTitle>
        ) : (
          <AppName>EC</AppName>
        )}
        <IconButton 
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </IconButton>
      </SidebarHeader>

      {!collapsed && (
        <div style={{ padding: '16px 12px' }}>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu..."
          />
        </div>
      )}

      <SidebarContent>
        <NavigationSection>
          <SectionHeader collapsed={collapsed}>Main Menu</SectionHeader>
          {/* TUS ITEMS ORIGINALES SE MANTIENEN */}
          {filteredItems.map(item => (
            <NavItem
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              collapsed={collapsed}
            />
          ))}
        </NavigationSection>

        {/* BOTÓN DE CERRAR SESIÓN EN EL FOOTER */}
        <FooterSection>
          <LogoutButton 
            onClick={handleLogout}
            $collapsed={collapsed}
            title={collapsed ? "Logout" : ""}
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </LogoutButton>
        </FooterSection>
      </SidebarContent>

      {!collapsed && <Resizer onMouseDown={handleMouseDown} />}
    </SidebarWrapper>
  );
};

export default Sidebar;