import axiosInstance from './axiosConfig';

const API_URL = '/Rubros';

const rubroService = {
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

  // Crear nuevo rubro
  create: async (rubroData) => {
    const response = await axiosInstance.post(API_URL, rubroData);
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

  // Validar porcentajes de rubros (deben sumar 100%)
  validarPorcentajes: async (grupoCursoId) => {
    const response = await axiosInstance.get(`${API_URL}/validar-porcentajes/${grupoCursoId}`);
    return response.data;
  },
};

export default rubroService;
