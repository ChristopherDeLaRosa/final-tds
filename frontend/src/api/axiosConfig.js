import axios from 'axios';

// Configuración base de Axios
const axiosInstance = axios.create({
  baseURL: 'https://localhost:7185/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de solicitud - agregar token si existe
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta - manejo de errores global
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Errores del servidor
      switch (error.response.status) {
        case 401:
          console.error('No autorizado - Token inválido o expirado');
          // Opcional: redirigir al login
          // window.location.href = '/login';
          break;
        case 403:
          console.error('Acceso prohibido');
          break;
        case 404:
          console.error('Recurso no encontrado');
          break;
        case 500:
          console.error('Error interno del servidor');
          break;
        default:
          console.error('Error en la solicitud:', error.response.data);
      }
    } else if (error.request) {
      // Error de red
      console.error('Error de red - No se recibió respuesta del servidor');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;