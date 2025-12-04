import axiosInstance from './axiosConfig';

const API_URL = '/Periodos';

const periodoService = {
  // Obtener todos los períodos
  getAll: async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },

  // Obtener período por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener el período actual
  getPeriodoActual: async () => {
    const response = await axiosInstance.get(`${API_URL}/actual`);
    return response.data;
  },

  // Obtener períodos por año escolar
  getByAnioEscolar: async (anioEscolar) => {
    const response = await axiosInstance.get(`${API_URL}/anio/${anioEscolar}`);
    return response.data;
  },

  // Obtener período por fecha
  getByFecha: async (fecha) => {
    const fechaISO = fecha instanceof Date ? fecha.toISOString() : fecha;
    const response = await axiosInstance.get(`${API_URL}/fecha?fecha=${fechaISO}`);
    return response.data;
  },

  // Crear nuevo período
  create: async (periodoData) => {
    const response = await axiosInstance.post(API_URL, periodoData);
    return response.data;
  },

  // Actualizar período
  update: async (id, periodoData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, periodoData);
    return response.data;
  },

  // Eliminar período (soft delete)
  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Establecer período como actual
  setActual: async (id) => {
    const response = await axiosInstance.post(`${API_URL}/${id}/establecer-actual`);
    return response.data;
  },

  // Cerrar período
  cerrar: async (id) => {
    const response = await axiosInstance.post(`${API_URL}/${id}/cerrar`);
    return response.data;
  },

  // Abrir período
  abrir: async (id) => {
    const response = await axiosInstance.post(`${API_URL}/${id}/abrir`);
    return response.data;
  },

  // Obtener resumen con estadísticas
  getResumen: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}/resumen`);
    return response.data;
  },

  // Obtener comparación entre trimestres
  getComparacionTrimestres: async (anioEscolar) => {
    const response = await axiosInstance.get(`${API_URL}/comparacion/${anioEscolar}`);
    return response.data;
  },

  // Verificar solapamiento de fechas
  verificarSolapamiento: async (fechaInicio, fechaFin, periodoIdExcluir = null) => {
    const params = new URLSearchParams({
      fechaInicio: fechaInicio instanceof Date ? fechaInicio.toISOString() : fechaInicio,
      fechaFin: fechaFin instanceof Date ? fechaFin.toISOString() : fechaFin,
    });
    
    if (periodoIdExcluir) {
      params.append('periodoIdExcluir', periodoIdExcluir);
    }

    const response = await axiosInstance.post(
      `${API_URL}/verificar-solapamiento?${params.toString()}`
    );
    return response.data;
  },
};

export default periodoService;
