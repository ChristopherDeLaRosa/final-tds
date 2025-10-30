import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Moon, Sun } from 'lucide-react';
import * as S from './Login.styles';

export default function Login({ isDarkMode, toggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones básicas
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setLoading(true);

    // Simulación de login
    setTimeout(() => {
      setLoading(false);
      setSuccess('¡Inicio de sesión exitoso!');
      console.log('Login data:', { email, password, remember });
      
      // Aquí iría tu lógica de autenticación real
      // Por ejemplo: llamada a API, redirección, etc.
    }, 1500);
  };

  return (
    <S.Container>
      <S.ThemeToggleButton onClick={toggleTheme} title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </S.ThemeToggleButton>

      <S.LoginCard>
        <S.Logo>
          <Lock size={28} color="#ffffff" />
        </S.Logo>
        
        <S.Title>Bienvenido</S.Title>
        <S.Subtitle>Ingresa tus credenciales para continuar</S.Subtitle>

        {error && <S.ErrorMessage>{error}</S.ErrorMessage>}
        {success && <S.SuccessMessage>{success}</S.SuccessMessage>}

        <S.Form>
          <S.InputGroup>
            <S.Label>Email</S.Label>
            <S.InputWrapper>
              <S.IconWrapper>
                <Mail size={18} />
              </S.IconWrapper>
              <S.Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </S.InputWrapper>
          </S.InputGroup>

          <S.InputGroup>
            <S.Label>Contraseña</S.Label>
            <S.InputWrapper>
              <S.IconWrapper>
                <Lock size={18} />
              </S.IconWrapper>
              <S.Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <S.TogglePassword
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </S.TogglePassword>
            </S.InputWrapper>
          </S.InputGroup>

          <S.RememberForgot>
            <S.CheckboxLabel>
              <S.Checkbox
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Recordarme
            </S.CheckboxLabel>
            <S.ForgotLink onClick={() => alert('Funcionalidad de recuperación de contraseña')}>
              ¿Olvidaste tu contraseña?
            </S.ForgotLink>
          </S.RememberForgot>

          <S.Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            <LogIn size={20} />
          </S.Button>
        </S.Form>
      </S.LoginCard>
    </S.Container>
  );
}
