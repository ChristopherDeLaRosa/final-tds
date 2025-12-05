import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../services/authService';
import styles from './Login.module.css';
import zirakLogo from '../../../../assets/zirak-logo.png';

export default function Login({ isDarkMode, toggleTheme }) {
  const navigate = useNavigate();

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
        remember,
      });

      setSuccess('¡Inicio de sesión exitoso!');
      navigate('/dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : styles.light}`}>
      {/* Elementos decorativos de fondo */}
      <div className={styles.backgroundElements}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gridPattern}></div>
      </div>

      <div className={styles.contentWrapper}>
        {/* Panel Izquierdo - Branding */}
        <div className={styles.brandingPanel}>
          <div className={styles.brandingContent}>
            <h2 className={styles.brandTitle}>
              Gestión Educativa
              <span className={styles.titleAccent}>Inteligente</span>
            </h2>

            <p className={styles.brandDescription}>
              La plataforma más avanzada para administración académica. 
              Potencia tu institución con herramientas diseñadas para el éxito.
            </p>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Zap size={18} />
                </div>
                <div className={styles.featureText}>
                  <h4>Rápido y Eficiente</h4>
                  <p>Optimiza procesos en tiempo real</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Shield size={18} />
                </div>
                <div className={styles.featureText}>
                  <h4>Seguridad Total</h4>
                  <p>Protección de datos garantizada</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Sparkles size={18} />
                </div>
                <div className={styles.featureText}>
                  <h4>Experiencia Moderna</h4>
                  <p>Interfaz intuitiva y elegante</p>
                </div>
              </div>
            </div>

            <div className={styles.statsContainer}>
              <div className={styles.stat}>
                <div className={styles.statNumber}>99.9%</div>
                <div className={styles.statLabel}>Uptime</div>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>24/7</div>
                <div className={styles.statLabel}>Soporte</div>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>100+</div>
                <div className={styles.statLabel}>Instituciones</div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho - Formulario */}
        <div className={styles.formPanel}>
          <div className={styles.formContainer}>
            <div className={styles.formLogoSection}>
              <img 
                src={zirakLogo} 
                alt="Zirak" 
                className={styles.formLogo}
              />
            </div>

            {/* <div className={styles.formHeader}>
              <h1 className={styles.formTitle}>Bienvenido</h1>
              <p className={styles.formSubtitle}>
                Ingresa tus credenciales para continuar
              </p>
            </div> */}

            {error && (
              <div className={styles.alert} data-type="error">
                <span className={styles.alertIcon}>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className={styles.alert} data-type="success">
                <span className={styles.alertIcon}>✓</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Usuario</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={20} />
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Contraseña</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={styles.input}
                    placeholder="Ingresa tu contraseña"
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
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className={styles.formOptions}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className={styles.checkboxLabel}>Recordarme</span>
                </label>

                <button
                  type="button"
                  className={styles.forgotLink}
                  onClick={() => alert('Contacta al administrador para recuperar tu contraseña')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    <span>Ingresando...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className={styles.footer}>
              <p>© 2025 Zirak. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}