import axiosInstance from './axiosConfig';

const ENDPOINT = '/Docentes';

const docenteService = {
  // Obtener todos los docentes
  getAll: async () => {
    const response = await axiosInstance.get(ENDPOINT);
    return response.data;
  },

  // Obtener solo docentes activos
  getAllActivos: async () => {
    const response = await axiosInstance.get(`${ENDPOINT}/activos`);
    return response.data;
  },

  // Obtener docente por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Crear nuevo docente
  create: async (docente) => {
    const response = await axiosInstance.post(ENDPOINT, docente);
    return response.data;
  },

  // Actualizar docente
  update: async (id, docente) => {
    const response = await axiosInstance.put(`${ENDPOINT}/${id}`, docente);
    return response.data;
  },

  // Eliminar docente
  delete: async (id) => {
    const response = await axiosInstance.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Verificar si un código ya existe
  codigoExists: async (codigo) => {
    try {
      const response = await axiosInstance.get(`${ENDPOINT}/codigo/${codigo}/exists`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  },

  // Obtener grupos del docente
  getGrupos: async (id) => {
    const response = await axiosInstance.get(`${ENDPOINT}/${id}/grupos`);
    return response.data;
  },
};

export default docenteService;