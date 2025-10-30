// src/services/apiService.js

const API_BASE_URL = 'https://localhost:7185/api';

class ApiService {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Obtener el token del localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Configurar headers por defecto
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Método genérico para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: this.getHeaders(options.headers)
    };

    try {
      const response = await fetch(url, config);

      // Si el token expiró o no es válido (401)
      if (response.status === 401) {
        // Limpiar token y redirigir al login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Ajusta según tu ruta
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
      }

      // Si hay error en la respuesta
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
      }

      // Si la respuesta es exitosa pero no tiene contenido (204)
      if (response.status === 204) {
        return null;
      }

      // Retornar datos en JSON
      return await response.json();
      
    } catch (error) {
      console.error('Error en la petición:', error);
      throw error;
    }
  }

  // Métodos HTTP principales

  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET'
    });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE'
    });
  }

  // Método especial para subir archivos (FormData)
  async uploadFile(endpoint, formData, options = {}) {
    const token = this.getToken();
    const headers = {
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // NO establecer Content-Type para FormData, el browser lo hace automáticamente

    return this.request(endpoint, {
      ...options,
      method: 'POST',
      headers,
      body: formData
    });
  }
}

// Exportar una instancia única (singleton)
const apiService = new ApiService();
export default apiService;