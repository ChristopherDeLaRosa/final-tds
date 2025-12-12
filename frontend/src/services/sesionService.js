import axiosInstance from './axiosConfig';

const API_URL = '/Sesiones';

const sesionService = {
  // Obtener todas las sesiones (necesario para useCrud)
  getAll: async () => {
    try {
      // Obtener sesiones entre 2020 y 2030
      const fechaInicio = '2020-08-01'; 
      const fechaFin = '2030-07-31';
      
      const response = await axiosInstance.get(
        `${API_URL}/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener sesiones:', error);
      // Si falla, intenta obtener por grupo
      return [];
    }
  },

  // Resto del código igual...
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  getDetalle: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}/detalle`);
    return response.data;
  },

  getByGrupoCurso: async (grupoCursoId) => {
    const response = await axiosInstance.get(`${API_URL}/grupo/${grupoCursoId}`);
    return response.data;
  },

  getByGrupoCursoFechas: async (grupoCursoId, fechaInicio, fechaFin) => {
    const response = await axiosInstance.get(
      `${API_URL}/grupo/${grupoCursoId}/fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return response.data;
  },

  getByFecha: async (fecha) => {
    const fechaFormato = typeof fecha === 'string' ? fecha : fecha.toISOString().split('T')[0];
    const response = await axiosInstance.get(`${API_URL}/fecha/${fechaFormato}`);
    return response.data;
  },

  getByRangoFechas: async (fechaInicio, fechaFin) => {
    const response = await axiosInstance.get(
      `${API_URL}/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return response.data;
  },

  // getByDocente: async (docenteId, fecha = null) => {
  //   const url = fecha
  //     ? `${API_URL}/docente/${docenteId}?fecha=${fecha}`
  //     : `${API_URL}/docente/${docenteId}`;
  //   const response = await axiosInstance.get(url);
  //   return response.data;
  // },
  getByDocente: async (docenteId, fecha = null) => {
  const params = fecha ? { fecha } : {};
  const response = await axiosInstance.get(`${API_URL}/docente/${docenteId}`, { params });
  return response.data;
},
  create: async (sesionData) => {
    const response = await axiosInstance.post(API_URL, sesionData);
    return response.data;
  },

  createRecurrentes: async (recurrenteData) => {
    const response = await axiosInstance.post(`${API_URL}/recurrentes`, recurrenteData);
    return response.data;
  },

  update: async (id, sesionData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, sesionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  marcarRealizada: async (id) => {
    const response = await axiosInstance.patch(`${API_URL}/${id}/marcar-realizada`);
    return response.data;
  },

  getHorarioSemanal: async (grupoCursoId, fecha = new Date()) => {
    const fechaISO = fecha instanceof Date ? fecha.toISOString().split('T')[0] : fecha;
    const response = await axiosInstance.get(
      `${API_URL}/grupo/${grupoCursoId}/horario-semanal?fecha=${fechaISO}`
    );
    return response.data;
  },

  getCalendarioMensual: async (grado, seccion, anio, mes) => {
    const response = await axiosInstance.get(
      `${API_URL}/calendario/grado/${grado}/seccion/${seccion}?anio=${anio}&mes=${mes}`
    );
    return response.data;
  },

  getEstadisticas: async (grupoCursoId, periodo = null) => {
    const url = periodo
      ? `${API_URL}/grupo/${grupoCursoId}/estadisticas?periodo=${periodo}`
      : `${API_URL}/grupo/${grupoCursoId}/estadisticas`;
    const response = await axiosInstance.get(url);
    return response.data;
  },
};

export default sesionService;