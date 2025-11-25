import axiosInstance from './axiosConfig';

const API_URL = '/Cursos';

const cursoService = {
  // Obtener todos los cursos
  getAll: async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },

  // Obtener solo cursos activos
  getAllActivos: async () => {
    const response = await axiosInstance.get(`${API_URL}/activos`);
    return response.data;
  },

  // Obtener curso por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener curso por código
  getByCodigo: async (codigo) => {
    const response = await axiosInstance.get(`${API_URL}/codigo/${codigo}`);
    return response.data;
  },

  // Obtener cursos por nivel (Primaria/Secundaria)
  getByNivel: async (nivel) => {
    const response = await axiosInstance.get(`${API_URL}/nivel/${nivel}`);
    return response.data;
  },

  // Obtener cursos por grado
  getByGrado: async (grado) => {
    const response = await axiosInstance.get(`${API_URL}/grado/${grado}`);
    return response.data;
  },

  // Obtener catálogo completo de cursos con grupos
  getCatalogo: async (periodo = null) => {
    const url = periodo 
      ? `${API_URL}/catalogo?periodo=${periodo}`
      : `${API_URL}/catalogo`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Crear nuevo curso
  create: async (cursoData) => {
    const response = await axiosInstance.post(API_URL, cursoData);
    return response.data;
  },

  // Actualizar curso
  update: async (id, cursoData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, cursoData);
    return response.data;
  },

  // Eliminar curso (soft delete)
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
};

export default cursoService;