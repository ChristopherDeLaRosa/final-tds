import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../services/authService';
import styles from './Login.module.css';

export default function Login({ isDarkMode, toggleTheme }) {
  const navigate = useNavigate();

  // ← tu backend usa NombreUsuario, aquí lo llamamos username para el input
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await authService.login({
        nombreUsuario: username,
        password,                 
        remember,                  // para decidir localStorage vs sessionStorage
      });

      setSuccess('¡Inicio de sesión exitoso!');
      navigate('/dashboard');
    } catch (err) {
      // authService lanza string amigable
      setError(typeof err === 'string' ? err : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : styles.light}`}>

      <div className={styles.card}>
        <div className={styles.logo}>
          <Lock size={28} color="#fff" />
        </div>

        <h1 className={styles.title}>Bienvenido</h1>
        <p className={styles.subtitle}>Ingresa tus credenciales para continuar</p>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Usuario
            <div className={styles.inputWrapper}>
              <Mail className={styles.icon} size={18} />
              <input
                type="text"
                className={styles.input}
                placeholder="tu_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </label>

          <label className={styles.label}>
            Contraseña
            <div className={styles.inputWrapper}>
              <Lock className={styles.icon} size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <div className={styles.rememberForgot}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
              />
              Recordar por 30 días
            </label>

            <button
              type="button"
              className={styles.link}
              onClick={() => alert('Contacta al administrador para recuperar tu contraseña')}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            <LogIn size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
