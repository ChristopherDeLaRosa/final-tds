import axiosInstance from './axiosConfig';

const API_URL = '/GruposCursos';

const grupoCursoService = {
  // Obtener todos los grupos-cursos
  getAll: async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },

  // Obtener solo grupos activos
  getAllActivos: async () => {
    const response = await axiosInstance.get(`${API_URL}/activos`);
    return response.data;
  },

  // Obtener grupo-curso por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener grupo-curso por código
  getByCodigo: async (codigo) => {
    const response = await axiosInstance.get(`${API_URL}/codigo/${codigo}`);
    return response.data;
  },

  // Obtener grupos por curso
  getByCurso: async (cursoId) => {
    const response = await axiosInstance.get(`${API_URL}/curso/${cursoId}`);
    return response.data;
  },

  // Obtener grupos por docente
  getByDocente: async (docenteId, periodo = null) => {
    const url = periodo 
      ? `${API_URL}/docente/${docenteId}?periodo=${periodo}`
      : `${API_URL}/docente/${docenteId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Obtener grupos por grado y sección
  getByGradoSeccion: async (grado, seccion, periodo = null) => {
    const url = periodo
      ? `${API_URL}/grado/${grado}/seccion/${seccion}?periodo=${periodo}`
      : `${API_URL}/grado/${grado}/seccion/${seccion}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Obtener grupos por período
  getByPeriodo: async (periodo) => {
    const response = await axiosInstance.get(`${API_URL}/periodo/${periodo}`);
    return response.data;
  },

  // Crear nuevo grupo-curso
  create: async (grupoCursoData) => {
    const response = await axiosInstance.post(API_URL, grupoCursoData);
    return response.data;
  },

  // Actualizar grupo-curso
  update: async (id, grupoCursoData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, grupoCursoData);
    return response.data;
  },

  // Eliminar grupo-curso (soft delete)
  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Verificar si el código existe
  codigoExists: async (codigo) => {
    try {
      await axiosInstance.get(`${API_URL}/codigo/${codigo}`);
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  },

  // Obtener horario semanal de un grupo
  getHorarioSemanal: async (id, fecha = new Date()) => {
    const fechaISO = fecha.toISOString().split('T')[0];
    const response = await axiosInstance.get(`${API_URL}/${id}/horario-semanal?fecha=${fechaISO}`);
    return response.data;
  },

  // Obtener estadísticas del grupo
  getEstadisticas: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}/estadisticas`);
    return response.data;
  },
};

export default grupoCursoService;
