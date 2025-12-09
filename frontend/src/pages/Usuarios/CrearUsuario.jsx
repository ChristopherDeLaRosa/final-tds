import { useState, useEffect } from "react";
import usuariosService from "../../services/usuariosService";
import { MySwal, Toast } from "../../utils/alerts";
import styled from "styled-components";
import { theme } from '../../styles';
import { UserPlus, Mail, User, Shield, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

// Componentes styled (algunos diferentes a CambiarPassword)
const Card = styled.div`
  background: ${theme.colors.cardBg};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadows.md};
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: ${theme.spacing.lg} ${theme.spacing.lg} 0;
  margin-bottom: ${theme.spacing.lg};
`;

const CardTitle = styled.h2`
  font-size: ${theme.fontSize.xl};
  font-weight: 600;
  color: ${theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  svg {
    color: ${theme.colors.accent};
  }
`;

const CardBody = styled.div`
  padding: 0 ${theme.spacing.lg} ${theme.spacing.lg};
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.xs};
  font-weight: 500;
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const FormInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1.5px solid ${props => props.$error ? theme.colors.error : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.inputBg};
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.base};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$error ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.$error 
      ? theme.colors.error + '20' 
      : theme.colors.primary + '20'};
  }

  &:disabled {
    background: ${theme.colors.inputBgDisabled};
    cursor: not-allowed;
  }
`;

const RoleBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.spacing.xl};
  font-size: ${theme.fontSize.xs};
  font-weight: 500;
  background: ${props => {
    switch(props.$role) {
      case 'Admin': return theme.colors.accent + '15';
      case 'Docente': return theme.colors.info + '15';
      case 'Estudiante': return theme.colors.success + '15';
      default: return theme.colors.border;
    }
  }};
  color: ${props => {
    switch(props.$role) {
      case 'Admin': return theme.colors.accent;
      case 'Docente': return theme.colors.info;
      case 'Estudiante': return theme.colors.success;
      default: return theme.colors.text;
    }
  }};
  border: 1px solid ${props => {
    switch(props.$role) {
      case 'Admin': return theme.colors.accent + '30';
      case 'Docente': return theme.colors.info + '30';
      case 'Estudiante': return theme.colors.success + '30';
      default: return theme.colors.border;
    }
  }};
`;

const RoleOption = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  cursor: pointer;
  border-radius: ${theme.borderRadius.md};
  transition: all 0.2s ease;
  border: 1.5px solid transparent;

  &:hover {
    background: ${theme.colors.surface};
  }

  &.selected {
    background: ${theme.colors.primary + '10'};
    border-color: ${theme.colors.primary};
  }
`;

const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
`;

const AlertMessage = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  background: ${theme.colors.warning + '10'};
  border: 1px solid ${theme.colors.warning + '30'};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.text};

  svg {
    color: ${theme.colors.warning};
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.fontSize.xs};
  margin-top: ${theme.spacing.xs};
  color: ${props => {
    if (props.$checking) return theme.colors.info;
    if (props.$available) return theme.colors.success;
    return theme.colors.error;
  }};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${props => props.disabled ? theme.colors.primary + '80' : theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-weight: 600;
  font-size: ${theme.fontSize.base};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const rolesDisponibles = [
  { 
    value: "Admin", 
    label: "Administrador",
    description: "Acceso completo al sistema",
    icon: <Shield size={16} />
  },
  { 
    value: "Docente", 
    label: "Docente",
    description: "Gestión de grupos y estudiantes",
    icon: <User size={16} />
  },
  { 
    value: "Estudiante", 
    label: "Estudiante",
    description: "Acceso limitado a contenido",
    icon: <User size={16} />
  },
];

export default function CrearUsuario() {
  const [form, setForm] = useState({
    nombreUsuario: "",
    email: "",
    rol: "Docente",
  });

  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  // Verificar nombre de usuario
  useEffect(() => {
    const checkUser = async () => {
      if (!form.nombreUsuario) return;
      setCheckingUsername(true);
      const exists = await usuariosService.verificarUsuario(form.nombreUsuario);
      setUsernameExists(exists);
      setCheckingUsername(false);
    };

    const timer = setTimeout(checkUser, 400);
    return () => clearTimeout(timer);
  }, [form.nombreUsuario]);

  // Verificar email
  useEffect(() => {
    const checkEmail = async () => {
      if (!form.email) return;
      setCheckingEmail(true);
      const exists = await usuariosService.verificarEmail(form.email);
      setEmailExists(exists);
      setCheckingEmail(false);
    };

    const timer = setTimeout(checkEmail, 400);
    return () => clearTimeout(timer);
  }, [form.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRoleSelect = (role) => {
    setForm({ ...form, rol: role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (usernameExists)
      return MySwal.fire("Error", "El nombre de usuario ya existe", "error");

    if (emailExists)
      return MySwal.fire("Error", "El correo ya está en uso", "error");

    setLoading(true);

    try {
      await usuariosService.crearUsuario({
        nombreUsuario: form.nombreUsuario,
        email: form.email,
        rol: form.rol,
      });

      Toast.fire({
        icon: "success",
        title: "Usuario creado exitosamente",
        text: "Se ha enviado una contraseña temporal al correo electrónico.",
      });

      setForm({
        nombreUsuario: "",
        email: "",
        rol: "Docente",
      });
      setUsernameExists(false);
      setEmailExists(false);
    } catch (err) {
      MySwal.fire(
        "Error",
        err?.message || "Error al crear usuario",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.nombreUsuario && form.email && !usernameExists && !emailExists;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <UserPlus size={24} />
          Crear Nuevo Usuario
        </CardTitle>
      </CardHeader>

      <CardBody>
        <AlertMessage>
          <AlertCircle size={20} />
          <div>
            <strong>Información importante:</strong> Al crear un usuario, se generará una contraseña temporal que será enviada al correo electrónico proporcionado.
          </div>
        </AlertMessage>

        <form onSubmit={handleSubmit}>
          {/* Nombre de usuario */}
          <FormGroup>
            <FormLabel>
              <User size={16} />
              Nombre de Usuario
            </FormLabel>
            <FormInput
              name="nombreUsuario"
              value={form.nombreUsuario}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ingresa un nombre de usuario único"
            />
            {form.nombreUsuario && (
              <StatusIndicator 
                $checking={checkingUsername}
                $available={!usernameExists}
              >
                {checkingUsername ? (
                  <>
                    <Loader2 size={14} className="spin" />
                    Verificando disponibilidad...
                  </>
                ) : usernameExists ? (
                  <>
                    <XCircle size={14} />
                    Este nombre de usuario no está disponible
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    Nombre de usuario disponible
                  </>
                )}
              </StatusIndicator>
            )}
          </FormGroup>

          {/* Email */}
          <FormGroup>
            <FormLabel>
              <Mail size={16} />
              Correo Electrónico
            </FormLabel>
            <FormInput
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              placeholder="usuario@ejemplo.com"
            />
            {form.email && (
              <StatusIndicator 
                $checking={checkingEmail}
                $available={!emailExists}
              >
                {checkingEmail ? (
                  <>
                    <Loader2 size={14} className="spin" />
                    Verificando correo...
                  </>
                ) : emailExists ? (
                  <>
                    <XCircle size={14} />
                    Este correo ya está registrado
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    Correo electrónico disponible
                  </>
                )}
              </StatusIndicator>
            )}
          </FormGroup>

          {/* Rol */}
          <FormGroup>
            <FormLabel>Rol del Usuario</FormLabel>
            <RoleGrid>
              {rolesDisponibles.map((role) => (
                <RoleOption
                  key={role.value}
                  className={form.rol === role.value ? "selected" : ""}
                  onClick={() => handleRoleSelect(role.value)}
                >
                  {role.icon}
                  <div>
                    <div style={{ fontWeight: 600 }}>{role.label}</div>
                    <div style={{ 
                      fontSize: theme.fontSize.xs, 
                      color: theme.colors.textMuted,
                      marginTop: '2px'
                    }}>
                      {role.description}
                    </div>
                  </div>
                </RoleOption>
              ))}
            </RoleGrid>
            
            {/* Rol seleccionado */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: theme.spacing.sm,
              marginTop: theme.spacing.md 
            }}>
              <span style={{ 
                fontSize: theme.fontSize.sm, 
                color: theme.colors.textMuted 
              }}>
                Rol seleccionado:
              </span>
              <RoleBadge $role={form.rol}>
                {rolesDisponibles.find(r => r.value === form.rol)?.icon}
                {form.rol}
              </RoleBadge>
            </div>
          </FormGroup>

          <SubmitButton 
            type="submit" 
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spin" />
                Creando usuario...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Crear Usuario
              </>
            )}
          </SubmitButton>
        </form>
      </CardBody>
    </Card>
  );
}
