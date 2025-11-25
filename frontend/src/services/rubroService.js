import axiosInstance from './axiosConfig';

const API_URL = '/Rubros';

const rubroService = {
  // Obtener todos los rubros activos
  getAll: async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },

  // Obtener rubro por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener rubros por grupo-curso
  getByGrupoCurso: async (grupoCursoId) => {
    const response = await axiosInstance.get(`${API_URL}/grupo/${grupoCursoId}`);
    return response.data;
  },

  // Obtener rubros de un grupo con estadísticas detalladas
  getRubrosGrupoCursoDetalle: async (grupoCursoId) => {
    const response = await axiosInstance.get(`${API_URL}/grupo/${grupoCursoId}/detalle`);
    return response.data;
  },

  // Crear nuevo rubro
  create: async (rubroData) => {
    const response = await axiosInstance.post(API_URL, rubroData);
    return response.data;
  },

  // Crear múltiples rubros desde plantilla
  crearPlantilla: async (plantillaData) => {
    const response = await axiosInstance.post(`${API_URL}/plantilla`, plantillaData);
    return response.data;
  },

  // Actualizar rubro
  update: async (id, rubroData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, rubroData);
    return response.data;
  },

  // Eliminar rubro
  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Validar que los porcentajes de rubros de un grupo sumen 100%
  validarPorcentajes: async (grupoCursoId) => {
    const response = await axiosInstance.get(`${API_URL}/grupo/${grupoCursoId}/validar-porcentajes`);
    return response.data;
  },

  // Reordenar rubros de un grupo
  reordenarRubros: async (grupoCursoId, ordenamiento) => {
    const response = await axiosInstance.put(`${API_URL}/grupo/${grupoCursoId}/reordenar`, ordenamiento);
    return response.data;
  },
};

export default rubroService;


