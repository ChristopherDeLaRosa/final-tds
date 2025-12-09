import { useState } from "react";
import authService from "../../services/authService";
import { Toast, MySwal } from "../../utils/alerts";
import styled from "styled-components";
import { theme } from '../../styles';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';

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
`;

const InputWrapper = styled.div`
  position: relative;
`;

const FormInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  padding-right: ${props => props.$hasButton ? '48px' : theme.spacing.md};
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

const TogglePassword = styled.button`
  position: absolute;
  right: ${theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${theme.colors.textMuted};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${theme.colors.text};
    background: ${theme.colors.border};
  }
`;

const ValidationMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.fontSize.xs};
  margin-top: ${theme.spacing.xs};
  color: ${props => props.$valid ? theme.colors.success : theme.colors.error};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const RequirementsList = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border};
`;

const RequirementItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xs};
  color: ${props => props.$met ? theme.colors.success : theme.colors.textMuted};
  font-size: ${theme.fontSize.xs};

  &:last-child {
    margin-bottom: 0;
  }

  svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
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

export default function CambiarPassword() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validaciones para la nueva contraseña
  const passwordRequirements = [
    { 
      label: "Mínimo 8 caracteres", 
      met: form.newPassword.length >= 8 
    },
    { 
      label: "Al menos una mayúscula", 
      met: /[A-Z]/.test(form.newPassword) 
    },
    { 
      label: "Al menos un número", 
      met: /[0-9]/.test(form.newPassword) 
    },
    { 
      label: "Al menos un carácter especial", 
      met: /[!@#$%^&*(),.?":{}|<>]/.test(form.newPassword) 
    },
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const passwordsMatch = form.newPassword === form.confirmPassword;
  const canSubmit = allRequirementsMet && passwordsMatch && form.oldPassword && !loading;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordsMatch) {
      return MySwal.fire("Error", "Las contraseñas no coinciden", "error");
    }

    setLoading(true);

    try {
      await authService.changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });

      Toast.fire({ 
        icon: "success", 
        title: "Contraseña actualizada con éxito" 
      });

      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      MySwal.fire(
        "Error",
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo cambiar la contraseña",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Lock size={24} />
          Cambiar Contraseña
        </CardTitle>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit}>
          {/* Contraseña actual */}
          <FormGroup>
            <FormLabel>Contraseña Actual</FormLabel>
            <InputWrapper>
              <FormInput
                name="oldPassword"
                type={showOldPassword ? "text" : "password"}
                value={form.oldPassword}
                onChange={handleChange}
                disabled={loading}
                placeholder="Ingresa tu contraseña actual"
                $hasButton
              />
              <TogglePassword
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </TogglePassword>
            </InputWrapper>
          </FormGroup>

          {/* Nueva contraseña */}
          <FormGroup>
            <FormLabel>Nueva Contraseña</FormLabel>
            <InputWrapper>
              <FormInput
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={form.newPassword}
                onChange={handleChange}
                disabled={loading}
                placeholder="Crea una nueva contraseña"
                $hasButton
              />
              <TogglePassword
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </TogglePassword>
            </InputWrapper>
            
            {/* Indicadores de validación */}
            {form.newPassword && (
              <RequirementsList>
                {passwordRequirements.map((req, index) => (
                  <RequirementItem key={index} $met={req.met}>
                    {req.met ? (
                      <CheckCircle size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                    {req.label}
                  </RequirementItem>
                ))}
              </RequirementsList>
            )}
          </FormGroup>

          {/* Confirmar nueva contraseña */}
          <FormGroup>
            <FormLabel>Confirmar Nueva Contraseña</FormLabel>
            <InputWrapper>
              <FormInput
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                placeholder="Confirma tu nueva contraseña"
                $error={form.confirmPassword && !passwordsMatch}
                $hasButton
              />
              <TogglePassword
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </TogglePassword>
            </InputWrapper>
            
            {/* Validación de coincidencia */}
            {form.confirmPassword && (
              <ValidationMessage $valid={passwordsMatch}>
                {passwordsMatch ? (
                  <>
                    <CheckCircle size={14} />
                    Las contraseñas coinciden
                  </>
                ) : (
                  <>
                    <XCircle size={14} />
                    Las contraseñas no coinciden
                  </>
                )}
              </ValidationMessage>
            )}
          </FormGroup>

          <SubmitButton 
            type="submit" 
            disabled={!canSubmit}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spin" />
                Actualizando...
              </>
            ) : (
              "Cambiar Contraseña"
            )}
          </SubmitButton>
        </form>
      </CardBody>
    </Card>
  );
}