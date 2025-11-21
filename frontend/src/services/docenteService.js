import axiosInstance from './axiosConfig';

const API_URL = '/Docentes';

const docenteService = {
  // Obtener todos los docentes
  getAll: async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },

  // Obtener solo docentes activos
  getAllActivos: async () => {
    const response = await axiosInstance.get(`${API_URL}/activos`);
    return response.data;
  },

  // Obtener docente por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener detalle completo del docente
  getDetalle: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}/detalle`);
    return response.data;
  },

  // Obtener docente por código
  getByCodigo: async (codigo) => {
    const response = await axiosInstance.get(`${API_URL}/codigo/${codigo}`);
    return response.data;
  },

  // Buscar docentes con filtros
  search: async (filtros) => {
    const response = await axiosInstance.post(`${API_URL}/buscar`, filtros);
    return response.data;
  },

  // Obtener docentes por especialidad
  getByEspecialidad: async (especialidad) => {
    const response = await axiosInstance.get(`${API_URL}/especialidad/${especialidad}`);
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

  // Eliminar docente
  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener horario semanal del docente
  getHorarioSemanal: async (id, fecha = new Date()) => {
    const fechaISO = fecha.toISOString().split('T')[0];
    const response = await axiosInstance.get(`${API_URL}/${id}/horario-semanal?fecha=${fechaISO}`);
    return response.data;
  },

  // Obtener sesiones del docente
  getSesiones: async (id, fecha = null) => {
    const url = fecha 
      ? `${API_URL}/${id}/sesiones?fecha=${fecha}`
      : `${API_URL}/${id}/sesiones`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Obtener grupos asignados
  getGruposAsignados: async (id, periodo = null) => {
    const url = periodo 
      ? `${API_URL}/${id}/grupos?periodo=${periodo}`
      : `${API_URL}/${id}/grupos`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Obtener carga académica del docente
  getCargaAcademica: async (id, periodo) => {
    const response = await axiosInstance.get(`${API_URL}/${id}/carga-academica?periodo=${periodo}`);
    return response.data;
  },

  // Obtener estadísticas del docente
  getEstadisticas: async (id, periodo) => {
    const response = await axiosInstance.get(`${API_URL}/${id}/estadisticas?periodo=${periodo}`);
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