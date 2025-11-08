import axiosInstance from '../services/axiosConfig';

const STORAGE = {
  setToken(token, remember) {
    const s = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    s.setItem('token', token);
    other.removeItem('token');
  },
  setUser(user, remember) {
    const s = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    s.setItem('user', JSON.stringify(user));
    other.removeItem('user');
  },
  clear() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },
  getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  },
  getUser() {
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }
};

class AuthService {
  /**
   * Login de usuario
   * @param {{ nombreUsuario: string, password: string, remember?: boolean }} params
   * @returns {Promise<{ token:string, nombreUsuario:string, email:string, rol:string, expiracion:string }>}
   */
  async login({ nombreUsuario, password, remember = false }) {
    try {
      // Tu backend espera LoginDto { NombreUsuario, Password }
      const payload = { nombreUsuario, password };
      const { data } = await axiosInstance.post('/Auth/login', payload);

      if (data?.token) {
        STORAGE.setToken(data.token, remember);
        STORAGE.setUser(
          {
            nombreUsuario: data.nombreUsuario,
            email: data.email,
            rol: data.rol,
            expiracion: data.expiracion
          },
          remember
        );
      }
      return data;
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        (error?.response?.status === 401 ? 'Credenciales inválidas' : 'Error al iniciar sesión');
      throw msg;
    }
  }

  /**
   * Registro (rol Admin)
   */
  async register(userData) {
    try {
      const { data } = await axiosInstance.post('/Auth/register', userData);
      if (data?.token) {
        // por si quieres mantener la sesión tras registro
        STORAGE.setToken(data.token, true);
        STORAGE.setUser(
          {
            nombreUsuario: data.nombreUsuario,
            email: data.email,
            rol: data.rol,
            expiracion: data.expiracion
          },
          true
        );
      }
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || 'Error al registrar usuario';
      throw msg;
    }
  }

  async logout() {
    try {
      // opcional: tu backend soporta /Auth/logout (Authorize) pero manejas logout en cliente
      await axiosInstance.post('/Auth/logout');
    } catch {
      /* noop */
    } finally {
      STORAGE.clear();
    }
  }

  async verifyToken() {
    const { data } = await axiosInstance.get('/Auth/verify');
    return data; // { userId, userName, userEmail, userRole, message }
  }

  async checkUsername(nombreUsuario) {
    const { data } = await axiosInstance.get(`/Auth/check-username/${encodeURIComponent(nombreUsuario)}`);
    return !!data?.exists;
  }

  async checkEmail(email) {
    const { data } = await axiosInstance.get(`/Auth/check-email/${encodeURIComponent(email)}`);
    return !!data?.exists;
  }

  getToken() {
    return STORAGE.getToken();
  }

  getCurrentUser() {
    return STORAGE.getUser();
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  hasRole(role) {
    return this.getCurrentUser()?.rol === role;
  }

  isAdmin() { return this.hasRole('Admin'); }
  isDocente() { return this.hasRole('Docente'); }
  isEstudiante() { return this.hasRole('Estudiante'); }
}

const authService = new AuthService();
export default authService;
