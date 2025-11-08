import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.bgDark} 0%, ${props => props.theme.colors.bg} 100%);
  padding: ${props => props.theme.spacing.xl};
  position: relative;
  overflow: hidden;
  transition: ${props => props.theme.transition};

  &::before {
    content: '';
    position: absolute;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, ${props => props.theme.colors.accent}15 0%, transparent 70%);
    top: -250px;
    right: -250px;
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, ${props => props.theme.colors.accent}10 0%, transparent 70%);
    bottom: -200px;
    left: -200px;
    border-radius: 50%;
  }
`;

export const LoginCard = styled.div`
  background: ${props => props.theme.colors.bg};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius};
  padding: ${props => props.theme.spacing.xxxl};
  width: 100%;
  max-width: 420px;
  box-shadow: ${props => props.theme.shadow};
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  transition: ${props => props.theme.transition};

  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.xxl};
    max-width: 100%;
  }
`;

export const Logo = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, ${props => props.theme.colors.accent} 0%, ${props => props.theme.colors.accentHover} 100%);
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${props => props.theme.spacing.xl};
  box-shadow: 0 4px 12px ${props => props.theme.colors.accent}40;
  transition: ${props => props.theme.transition};
`;

export const Title = styled.h1`
  font-size: ${props => props.theme.fontSize.xxl};
  color: ${props => props.theme.colors.text};
  text-align: center;
  margin: 0 0 ${props => props.theme.spacing.sm};
  font-weight: 600;
  transition: ${props => props.theme.transition};
`;

export const Subtitle = styled.p`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textMuted};
  text-align: center;
  margin: 0 0 ${props => props.theme.spacing.xxl};
  transition: ${props => props.theme.transition};
`;

export const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

export const Label = styled.label`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  transition: ${props => props.theme.transition};
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const IconWrapper = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.textMuted};
  display: flex;
  align-items: center;
  pointer-events: none;
  transition: ${props => props.theme.transition};
`;

export const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg} ${props => props.theme.spacing.md} ${props => props.theme.spacing.xxxl};
  background: ${props => props.theme.colors.bgDark};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.md};
  transition: ${props => props.theme.transition};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.accent};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.accent}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

export const TogglePassword = styled.button`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  background: none;
  border: none;
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.xs};
  transition: ${props => props.theme.transition};

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

export const RememberForgot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: ${props => props.theme.spacing.sm} 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
    align-items: flex-start;
  }
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  user-select: none;
  transition: ${props => props.theme.transition};
`;

export const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: ${props => props.theme.colors.accent};
`;

export const ForgotLink = styled.a`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.accent};
  text-decoration: none;
  transition: ${props => props.theme.transition};
  cursor: pointer;

  &:hover {
    color: ${props => props.theme.colors.accentHover};
    text-decoration: underline;
  }
`;

export const Button = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.lg};
  background: linear-gradient(135deg, ${props => props.theme.colors.accent} 0%, ${props => props.theme.colors.accentHover} 100%);
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.fontSize.md};
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transition};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.lg};
  box-shadow: 0 4px 12px ${props => props.theme.colors.accent}40;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${props => props.theme.colors.accent}50;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const ErrorMessage = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.danger}15;
  border: 1px solid ${props => props.theme.colors.danger}40;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.danger};
  font-size: ${props => props.theme.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  transition: ${props => props.theme.transition};
`;

export const SuccessMessage = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.success}15;
  border: 1px solid ${props => props.theme.colors.success}40;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.success};
  font-size: ${props => props.theme.fontSize.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  transition: ${props => props.theme.transition};
`;

// NUEVOS ESTILOS PARA EL THEME TOGGLE
export const ThemeToggleButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.xl};
  right: ${props => props.theme.spacing.xl};
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.theme.colors.bg};
  border: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${props => props.theme.transition};
  box-shadow: ${props => props.theme.shadow};
  z-index: 10;
  color: ${props => props.theme.colors.text};

  &:hover {
    transform: scale(1.1) rotate(15deg);
    box-shadow: 0 4px 12px ${props => props.theme.colors.accent}30;
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    top: ${props => props.theme.spacing.lg};
    right: ${props => props.theme.spacing.lg};
    width: 45px;
    height: 45px;
  }
`;
