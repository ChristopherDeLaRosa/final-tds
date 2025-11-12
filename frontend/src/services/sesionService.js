import axiosInstance from './axiosConfig';

const API_URL = '/Sesiones';
// sesion = Cada clase específica en la agenda de una sección (día/hora/tema)
const sesionService = {
  // Obtener todas las sesiones
  getAll: async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },

  // Obtener sesión por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener sesiones por sección
  getBySeccion: async (seccionId) => {
    const response = await axiosInstance.get(`${API_URL}/seccion/${seccionId}`);
    return response.data;
  },

  // Obtener sesiones por sección y rango de fechas
  getBySeccionYFecha: async (seccionId, fechaInicio, fechaFin) => {
    const response = await axiosInstance.get(
      `${API_URL}/seccion/${seccionId}/rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return response.data;
  },

  // Crear nueva sesión
  create: async (sesionData) => {
    const response = await axiosInstance.post(API_URL, sesionData);
    return response.data;
  },

  // Actualizar sesión
  update: async (id, sesionData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, sesionData);
    return response.data;
  },

  // Eliminar sesión
  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Marcar sesión como realizada
  marcarRealizada: async (id) => {
    const response = await axiosInstance.patch(`${API_URL}/${id}/marcar-realizada`);
    return response.data;
  },
};

export default sesionService;