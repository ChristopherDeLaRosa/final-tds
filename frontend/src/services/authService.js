import apiService from './apiService';

class AuthService {
  
  /**
   * Login de usuario
   * @param {Object} credentials - { nombreUsuario: string, contraseña: string }
   * @returns {Promise<Object>} - { token, userId, nombreUsuario, email, rol }
   */
  async login(credentials) {
    try {
      const response = await apiService.post('/auth/login', {
        nombreUsuario: credentials.nombreUsuario,
        contraseña: credentials.contraseña
      });

      // Guardar token y datos del usuario
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          userId: response.userId,
          nombreUsuario: response.nombreUsuario,
          email: response.email,
          rol: response.rol
        }));
      }

      return response;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Registro de nuevo usuario (requiere rol Admin)
   * @param {Object} userData - Datos del nuevo usuario
   * @returns {Promise<Object>}
   */
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData);

      // Opcionalmente guardar token si el registro devuelve uno
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          userId: response.userId,
          nombreUsuario: response.nombreUsuario,
          email: response.email,
          rol: response.rol
        }));
      }

      return response;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * Logout del usuario
   */
  async logout() {
    try {
      // Llamar al endpoint de logout (opcional)
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Error al hacer logout en el servidor:', error);
    } finally {
      // Siempre limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Verificar si el token es válido
   * @returns {Promise<Object>} - Datos del usuario autenticado
   */
  async verifyToken() {
    try {
      return await apiService.get('/auth/verify');
    } catch (error) {
      console.error('Error al verificar token:', error);
      throw error;
    }
  }

  /**
   * Verificar si un nombre de usuario existe
   * @param {string} nombreUsuario
   * @returns {Promise<boolean>}
   */
  async checkUsername(nombreUsuario) {
    try {
      const response = await apiService.get(`/auth/check-username/${nombreUsuario}`);
      return response.exists;
    } catch (error) {
      console.error('Error al verificar nombre de usuario:', error);
      throw error;
    }
  }

  /**
   * Verificar si un email existe
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async checkEmail(email) {
    try {
      const response = await apiService.get(`/auth/check-email/${email}`);
      return response.exists;
    } catch (error) {
      console.error('Error al verificar email:', error);
      throw error;
    }
  }

  /**
   * Obtener el token actual
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Obtener datos del usuario actual
   * @returns {Object|null}
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Verificar si el usuario tiene un rol específico
   * @param {string} role - Rol a verificar
   * @returns {boolean}
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.rol === role;
  }

  /**
   * Verificar si el usuario es Admin
   * @returns {boolean}
   */
  isAdmin() {
    return this.hasRole('Admin');
  }

  /**
   * Verificar si el usuario es Docente
   * @returns {boolean}
   */
  isDocente() {
    return this.hasRole('Docente');
  }

  /**
   * Verificar si el usuario es Estudiante
   * @returns {boolean}
   */
  isEstudiante() {
    return this.hasRole('Estudiante');
  }
}

// Exportar una instancia única (singleton)
const authService = new AuthService();
export default authService;