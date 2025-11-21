import axiosInstance from './axiosConfig';

const API_URL = '/Calificaciones';

const calificacionService = {
  // Obtener calificación por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener calificaciones de un estudiante
  getByEstudiante: async (estudianteId, grupoCursoId = null) => {
    const url = grupoCursoId
      ? `${API_URL}/estudiante/${estudianteId}?grupoCursoId=${grupoCursoId}`
      : `${API_URL}/estudiante/${estudianteId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Obtener calificaciones por rubro
  getByRubro: async (rubroId) => {
    const response = await axiosInstance.get(`${API_URL}/rubro/${rubroId}`);
    return response.data;
  },

  // Obtener calificaciones por grupo-curso
  getByGrupoCurso: async (grupoCursoId) => {
    const response = await axiosInstance.get(`${API_URL}/grupo/${grupoCursoId}`);
    return response.data;
  },

  // Registrar calificación
  create: async (calificacionData) => {
    const response = await axiosInstance.post(API_URL, calificacionData);
    return response.data;
  },

  // Registrar múltiples calificaciones
  createMultiple: async (calificacionesData) => {
    const response = await axiosInstance.post(`${API_URL}/multiple`, calificacionesData);
    return response.data;
  },

  // Actualizar calificación
  update: async (id, calificacionData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, calificacionData);
    return response.data;
  },

  // Eliminar calificación
  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener boletín de calificaciones de un estudiante
  getBoletin: async (estudianteId, grupoCursoId) => {
    const response = await axiosInstance.get(
      `${API_URL}/boletin/estudiante/${estudianteId}/grupo/${grupoCursoId}`
    );
    return response.data;
  },

  // Obtener listado de calificaciones completo de un grupo
  getListadoGrupo: async (grupoCursoId) => {
    const response = await axiosInstance.get(`${API_URL}/listado/grupo/${grupoCursoId}`);
    return response.data;
  },

  // Calcular promedio final de un estudiante en un grupo
  calcularPromedioFinal: async (estudianteId, grupoCursoId) => {
    const response = await axiosInstance.get(
      `${API_URL}/promedio/estudiante/${estudianteId}/grupo/${grupoCursoId}`
    );
    return response.data;
  },

  // Obtener estadísticas de calificaciones de un grupo
  getEstadisticas: async (grupoCursoId) => {
    const response = await axiosInstance.get(`${API_URL}/estadisticas/grupo/${grupoCursoId}`);
    return response.data;
  },
};

export default calificacionService;
