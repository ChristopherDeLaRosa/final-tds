import axiosInstance from './axiosConfig';

const API_URL = '/Calificaciones';

const calificacionService = {
  // Obtener todas las calificaciones (necesario para useCrud)
  getAll: async () => {
    try {
      // Como no hay endpoint getAll, retornamos array vacío
      // Las calificaciones se obtienen por estudiante o por grupo
      return [];
    } catch (error) {
      console.error('Error al obtener calificaciones:', error);
      return [];
    }
  },

  // Obtener calificación por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener calificaciones de un estudiante
  getByEstudiante: async (estudianteId) => {
    const response = await axiosInstance.get(`${API_URL}/estudiante/${estudianteId}`);
    return response.data;
  },

  // Obtener calificaciones de un estudiante en un grupo específico
  getByEstudianteGrupoCurso: async (estudianteId, grupoCursoId) => {
    const response = await axiosInstance.get(
      `${API_URL}/estudiante/${estudianteId}/grupo/${grupoCursoId}`
    );
    return response.data;
  },

  // Obtener calificaciones por rubro
  getByRubro: async (rubroId) => {
    const response = await axiosInstance.get(`${API_URL}/rubro/${rubroId}`);
    return response.data;
  },

  // Obtener todas las calificaciones de un grupo-curso (libro de notas)
  getCalificacionesGrupoCurso: async (grupoCursoId) => {
    const response = await axiosInstance.get(`${API_URL}/grupo/${grupoCursoId}`);
    return response.data;
  },

  // Registrar calificación individual
  create: async (calificacionData) => {
    const response = await axiosInstance.post(API_URL, calificacionData);
    return response.data;
  },

  // Registrar calificaciones para todo un grupo (libro de notas masivo)
  registrarGrupo: async (registroGrupoData) => {
    const response = await axiosInstance.post(`${API_URL}/grupo`, registroGrupoData);
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

  // Obtener boletín de calificaciones de un estudiante (reporte completo)
  getBoletinEstudiante: async (estudianteId, periodo) => {
    if (!periodo) {
      throw new Error('El periodo es requerido');
    }
    const response = await axiosInstance.get(
      `${API_URL}/boletin/estudiante/${estudianteId}?periodo=${periodo}`
    );
    return response.data;
  },

  // Obtener estadísticas de calificaciones de un grupo-curso
  getEstadisticasGrupoCurso: async (grupoCursoId) => {
    const response = await axiosInstance.get(`${API_URL}/estadisticas/grupo/${grupoCursoId}`);
    return response.data;
  },

  // Calcular promedio de un estudiante en un grupo-curso específico
  getPromedioEstudianteGrupoCurso: async (estudianteId, grupoCursoId) => {
    const response = await axiosInstance.get(
      `${API_URL}/promedio/estudiante/${estudianteId}/grupo/${grupoCursoId}`
    );
    return response.data;
  },

  // Actualizar promedios de inscripción (recalcular después de cambios)
  actualizarPromedios: async (estudianteId, grupoCursoId) => {
    const response = await axiosInstance.post(
      `${API_URL}/actualizar-promedios/estudiante/${estudianteId}/grupo/${grupoCursoId}`
    );
    return response.data;
  },
};

export default calificacionService;