import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  GraduationCap,
  Users,
  UserCheck, 
  LogOut,
  Layers,
  Calendar,
  UserPlus,
  ClipboardList,
  FileText,
  BookMarked,
  BarChart3,
  History,
  Building2
} from 'lucide-react';
import styled from 'styled-components';
import { storage } from '../../../utils/storage';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { SearchInput } from '../../molecules/SearchInput/SearchInput';
import { NavItem } from '../../molecules/NavItem/NavItem';
import { SectionHeader } from '../../molecules/SectionHeader/SectionHeader';
import { theme } from '../../../styles/theme';
import authService from '../../../services/authService';
// SweetAlert utils
import { MySwal, Toast } from '../../../utils/alerts';

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
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserName = styled.span`
  font-weight: 500;
  color: ${theme.colors.text};
`;

const UserRole = styled.span`
  font-size: 11px;
  color: ${theme.colors.textMuted};
  text-transform: capitalize;
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
    color: #ef4444;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

const menuSections = [
  {
    title: 'Principal',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Gestión Académica',
    items: [
      { path: '/estudiantes', label: 'Estudiantes', icon: Users },
      { path: '/docentes', label: 'Docentes', icon: UserCheck },
      { path: '/cursos', label: 'Asignaturas', icon: BookOpen },
      { path: '/aulas', label: 'Aulas', icon: Building2 },
      { path: '/grupos-cursos', label: 'Grupos Académicos', icon: Layers },
      { path: '/inscripciones', label: 'Inscripciones', icon: UserPlus },
      { path: '/rubros', label: 'Rubros', icon: BookMarked },
    ]
  },
  {
    title: 'Gestión de Clases',
    items: [
      { path: '/sesiones', label: 'Sesiones', icon: Calendar },
      { path: '/pase-lista', label: 'Pase de Lista', icon: ClipboardList },
      { path: '/asistencias', label: 'Asistencias', icon: CalendarCheck },
      { path: '/historial-asistencias', label: 'Historial', icon: History },
      { path: '/reportes-asistencia', label: 'Reportes', icon: BarChart3 },
      { path: '/calificaciones', label: 'Calificaciones', icon: GraduationCap },
    ]
  }
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => storage.get('sidebarCollapsed', false));
  const [width, setWidth] = useState(() => storage.get('sidebarWidth', 280));
  const [searchQuery, setSearchQuery] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const sidebarRef = useRef(null);
  const user = authService.getCurrentUser();

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

  const handleLogout = async () => {
    // Confirmación con SweetAlert
    const result = await MySwal.fire({
      title: '¿Cerrar sesión?',
      text: 'Se cerrará tu sesión actual en EduCore.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    setIsLoggingOut(true);

    try {
      // Loader mientras se cierra sesión
      MySwal.fire({
        title: 'Cerrando sesión...',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      await authService.logout();

      MySwal.close();
      Toast.fire({ icon: 'success', title: 'Sesión cerrada' });
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);

      MySwal.close();
      await MySwal.fire({
        icon: 'error',
        title: 'No se pudo cerrar sesión correctamente',
        text: 'Se forzará el cierre de sesión.',
        confirmButtonText: 'Continuar',
      });

      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
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

  // Filtrar items por búsqueda
  const getFilteredSections = () => {
    if (!searchQuery) return menuSections;

    return menuSections.map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(section => section.items.length > 0);
  };

  const filteredSections = getFilteredSections();

  // Rol en español
  const getRoleLabel = (role) => {
    const roleMap = {
      'Admin': 'Administrador',
      'Docente': 'Docente',
      'Estudiante': 'Estudiante'
    };
    return roleMap[role] || role;
  };

  return (
    <SidebarWrapper 
      ref={sidebarRef} 
      $collapsed={collapsed} 
      $width={width}
      aria-label="Primary navigation"
    >
      {/* HEADER */}
      <SidebarHeader>
        {!collapsed ? (
          <AppTitle>
            <AppName>EduCore</AppName>
            <UserInfo>
              <UserName>{user?.nombreUsuario || 'Usuario'}</UserName>
              <UserRole>{getRoleLabel(user?.rol)}</UserRole>
            </UserInfo>
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
            placeholder="Buscar..."
          />
        </div>
      )}

      <SidebarContent>
        <NavigationSection>
          {filteredSections.map((section, index) => (
            <div key={section.title}>
              {!collapsed && index > 0 && (
                <div style={{ margin: '16px 0' }} />
              )}
              <SectionHeader collapsed={collapsed}>
                {section.title}
              </SectionHeader>
              {section.items.map(item => (
                <NavItem
                  key={item.path}
                  to={item.path}
                  icon={item.icon}
                  label={item.label}
                  collapsed={collapsed}
                />
              ))}
            </div>
          ))}
        </NavigationSection>

        {/* FOOTER: Cerrar sesión */}
        <FooterSection>
          <LogoutButton 
            onClick={handleLogout}
            $collapsed={collapsed}
            disabled={isLoggingOut}
            title={collapsed ? "Cerrar Sesión" : ""}
          >
            <LogOut size={20} />
            {!collapsed && <span>{isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}</span>}
          </LogoutButton>
        </FooterSection>
      </SidebarContent>

      {!collapsed && <Resizer onMouseDown={handleMouseDown} />}
    </SidebarWrapper>
  );
};

export default Sidebar;
