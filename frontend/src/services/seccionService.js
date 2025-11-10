import axiosInstance from './axiosConfig';

const API_URL = '/Secciones';

const seccionService = {
  // Obtener todas las secciones
  getAll: async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },

  // Obtener sección por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener sección por código
  getByCodigo: async (codigo) => {
    const response = await axiosInstance.get(`${API_URL}/codigo/${codigo}`);
    return response.data;
  },

  // Obtener secciones por curso
  getByCurso: async (cursoId) => {
    const response = await axiosInstance.get(`${API_URL}/curso/${cursoId}`);
    return response.data;
  },

  // Obtener secciones por docente
  getByDocente: async (docenteId) => {
    const response = await axiosInstance.get(`${API_URL}/docente/${docenteId}`);
    return response.data;
  },

  // Obtener secciones por período
  getByPeriodo: async (periodo) => {
    const response = await axiosInstance.get(`${API_URL}/periodo/${periodo}`);
    return response.data;
  },

  // Crear nueva sección
  create: async (seccionData) => {
    const response = await axiosInstance.post(API_URL, seccionData);
    return response.data;
  },

  // Actualizar sección
  update: async (id, seccionData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, seccionData);
    return response.data;
  },

  // Eliminar sección (soft delete)
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

  // Obtener lista de estudiantes inscritos en una sección
  getEstudiantes: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}/estudiantes`);
    return response.data;
  },

  // Inscribir estudiante en sección
  inscribirEstudiante: async (seccionId, estudianteId) => {
    const response = await axiosInstance.post(
      `${API_URL}/${seccionId}/estudiantes/${estudianteId}`
    );
    return response.data;
  },

  // Desinscribir estudiante de sección
  desinscribirEstudiante: async (seccionId, estudianteId) => {
    const response = await axiosInstance.delete(
      `${API_URL}/${seccionId}/estudiantes/${estudianteId}`
    );
    return response.data;
  },
};

export default seccionService;
