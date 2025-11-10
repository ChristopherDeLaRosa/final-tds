import axiosInstance from './axiosConfig';

const API_URL = '/Docentes';

const docenteService = {
  // Obtener todos los docentes
  getAll: async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },

  // Obtener docente por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener docente por código
  getByCodigo: async (codigo) => {
    const response = await axiosInstance.get(`${API_URL}/codigo/${codigo}`);
    return response.data;
  },

  // Crear nuevo docente
  create: async (docenteData) => {
    const response = await axiosInstance.post(API_URL, docenteData);
    return response.data;
  },

  // Actualizar docente
  update: async (id, docenteData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, docenteData);
    return response.data;
  },

  // Eliminar docente (soft delete)
  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener carga académica del docente
  getCargaAcademica: async (id, periodo = null) => {
    const url = periodo 
      ? `${API_URL}/${id}/carga-academica?periodo=${periodo}`
      : `${API_URL}/${id}/carga-academica`;
    const response = await axiosInstance.get(url);
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

export default docenteService;