import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  BookMarked,
  Building2,
  Notebook,
  Search,
  Lock,
} from "lucide-react";
import styled from "styled-components";
import { storage } from "../../../utils/storage";
import { IconButton } from "../../atoms/IconButton/IconButton";
import { SearchInput } from "../../molecules/SearchInput/SearchInput";
import { NavItem } from "../../molecules/NavItem/NavItem";
import { SectionHeader } from "../../molecules/SectionHeader/SectionHeader";
import { theme } from "../../../styles/theme";
import authService from "../../../services/authService";
// SweetAlert utils
import { MySwal, Toast } from "../../../utils/alerts";

const SidebarWrapper = styled.aside`
  background: linear-gradient(135deg, #1a1d2e 0%, #16192b 100%);
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${(props) => (props.$collapsed ? "72px" : `${props.$width}px`)};
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.1);
`;

const SidebarHeader = styled.div`
  padding: 24px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  background: rgba(37, 99, 235, 0.03);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #2563eb, transparent);
    opacity: 0.5;
  }
`;

const AppTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
`;

const AppName = styled.span`
  font-weight: 800;
  font-size: 20px;
  color: #ffffff;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #ffffff 0%, #93c5fd 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 13px;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.span`
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 8px #10b981;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const CollapseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.2);
  color: #93c5fd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(37, 99, 235, 0.2);
    border-color: rgba(37, 99, 235, 0.4);
    color: #ffffff;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SearchSection = styled.div`
  padding: 16px;
  background: rgba(37, 99, 235, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const SearchInputStyled = styled.input`
  width: 100%;
  padding: 10px 12px 10px 40px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;

  &::placeholder {
    color: #64748b;
  }

  &:focus {
    outline: none;
    background: rgba(15, 23, 42, 0.6);
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
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
  padding: 16px 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const SectionDivider = styled.div`
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.08),
    transparent
  );
  margin: 20px 0;
`;

const FooterSection = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 16px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  color: #e2e8f0;
  text-decoration: none;
  transition: all 0.2s ease;
  background: transparent;
  border: 1px solid transparent;
  width: 100%;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.1),
      rgba(220, 38, 38, 0.1)
    );
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
    transform: translateY(-1px);

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  ${(props) =>
    props.$collapsed &&
    `
    justify-content: center;
    padding: 12px;
  `}

  svg {
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

const Resizer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  background: transparent;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: rgba(37, 99, 235, 0.3);
  }

  &:active {
    background: #2563eb;
  }
`;

const menuSections = [
  {
    title: "Principal",
    items: [{ path: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Gestión Académica",
    items: [
      { path: "/estudiantes", label: "Estudiantes", icon: Users },
      { path: "/docentes", label: "Docentes", icon: UserCheck },
      { path: "/periodos", label: "Períodos", icon: Calendar },
      { path: "/aulas", label: "Aulas", icon: Building2 },
      { path: "/cursos", label: "Asignaturas", icon: BookOpen },
      { path: "/grupos-cursos", label: "Secciones Académicas", icon: Layers },
      { path: "/inscripciones", label: "Inscripciones", icon: UserPlus },
      { path: "/rubros", label: "Rubros", icon: BookMarked },
    ],
  },
  {
    title: "Gestión de Clases",
    items: [
      { path: "/sesiones", label: "Sesiones", icon: Calendar },
      { path: "/asistencias", label: "Asistencias", icon: CalendarCheck },
      { path: "/gradebook", label: "Libro de Calificaciones", icon: Notebook },
    ],
  },
  {
    title: "Gestión del Sistema",
    items: [
      {
        path: "/mi-perfil/cambiar-password",
        label: "Cambiar Contraseña",
        icon: Lock,
      },
      {
        path: "/admin/usuarios/crear",
        label: "Crear Usuario",
        icon: UserPlus,
        role: "Admin",
      },
    ],
  },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() =>
    storage.get("sidebarCollapsed", false)
  );
  const [width, setWidth] = useState(() => storage.get("sidebarWidth", 280));
  const [searchQuery, setSearchQuery] = useState("");
  const [isResizing, setIsResizing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const sidebarRef = useRef(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    storage.set("sidebarCollapsed", collapsed);
  }, [collapsed]);

  useEffect(() => {
    storage.set("sidebarWidth", width);
  }, [width]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleLogout = async () => {
    const result = await MySwal.fire({
      title: "¿Cerrar sesión?",
      text: "Se cerrará tu sesión actual en Zirak.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    setIsLoggingOut(true);

    try {
      MySwal.fire({
        title: "Cerrando sesión...",
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      await authService.logout();

      MySwal.close();
      Toast.fire({ icon: "success", title: "Sesión cerrada" });
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);

      MySwal.close();
      await MySwal.fire({
        icon: "error",
        title: "No se pudo cerrar sesión correctamente",
        text: "Se forzará el cierre de sesión.",
        confirmButtonText: "Continuar",
      });

      navigate("/login", { replace: true });
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
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const getFilteredSections = () => {
    if (!searchQuery) return menuSections;

    return menuSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((section) => section.items.length > 0);
  };

  const filteredSections = getFilteredSections();

  const getRoleLabel = (role) => {
    const roleMap = {
      Admin: "Administrador",
      Docente: "Docente",
      Estudiante: "Estudiante",
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
            <AppName>Zirak</AppName>
            <UserInfo>
              <UserName>{user?.nombreUsuario || "Usuario"}</UserName>
              <UserRole>{getRoleLabel(user?.rol)}</UserRole>
            </UserInfo>
          </AppTitle>
        ) : (
          <AppName>ZK</AppName>
        )}
        <CollapseButton
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir sidebar" : "Contraer sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </CollapseButton>
      </SidebarHeader>

      {/* SEARCH */}
      {!collapsed && (
        <SearchSection>
          <SearchWrapper>
            <SearchIcon>
              <Search size={16} />
            </SearchIcon>
            <SearchInputStyled
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el menú..."
            />
          </SearchWrapper>
        </SearchSection>
      )}

      <SidebarContent>
        <NavigationSection>
          {filteredSections.map((section, index) => (
            <div key={section.title}>
              {!collapsed && index > 0 && <SectionDivider />}
              <SectionHeader collapsed={collapsed}>
                {section.title}
              </SectionHeader>
              {section.items
                .filter((item) => !item.role || item.role === user?.rol) // FILTRO POR ROL
                .map((item) => (
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
            {!collapsed && (
              <span>{isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}</span>
            )}
          </LogoutButton>
        </FooterSection>
      </SidebarContent>

      {!collapsed && <Resizer onMouseDown={handleMouseDown} />}
    </SidebarWrapper>
  );
};

export default Sidebar;
