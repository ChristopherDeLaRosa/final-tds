import axiosInstance from './axiosConfig';

const API_URL = '/Sesiones';

const sesionService = {
  // Obtener sesión por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener detalle completo de sesión con asistencias
  getDetalle: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}/detalle`);
    return response.data;
  },

  // Obtener sesiones por grupo-curso
  getByGrupoCurso: async (grupoCursoId) => {
    const response = await axiosInstance.get(`${API_URL}/grupo/${grupoCursoId}`);
    return response.data;
  },

  // Obtener sesiones por grupo-curso y rango de fechas
  getByGrupoCursoFechas: async (grupoCursoId, fechaInicio, fechaFin) => {
    const response = await axiosInstance.get(
      `${API_URL}/grupo/${grupoCursoId}/fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return response.data;
  },

  // Obtener sesiones por fecha específica
  getByFecha: async (fecha) => {
    const response = await axiosInstance.get(`${API_URL}/fecha/${fecha}`);
    return response.data;
  },

  // Obtener sesiones en rango de fechas
  getByRangoFechas: async (fechaInicio, fechaFin) => {
    const response = await axiosInstance.get(
      `${API_URL}/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return response.data;
  },

  // Obtener sesiones de un docente
  getByDocente: async (docenteId, fecha = null) => {
    const url = fecha
      ? `${API_URL}/docente/${docenteId}?fecha=${fecha}`
      : `${API_URL}/docente/${docenteId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Crear nueva sesión
  create: async (sesionData) => {
    const response = await axiosInstance.post(API_URL, sesionData);
    return response.data;
  },

  // Crear sesiones recurrentes (múltiples sesiones automáticamente)
  createRecurrentes: async (recurrenteData) => {
    const response = await axiosInstance.post(`${API_URL}/recurrentes`, recurrenteData);
    return response.data;
  },

  // Actualizar sesión
  update: async (id, sesionData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, sesionData);
    return response.data;
  },

  // Eliminar sesión
  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Marcar sesión como realizada
  marcarRealizada: async (id) => {
    const response = await axiosInstance.patch(`${API_URL}/${id}/marcar-realizada`);
    return response.data;
  },

  // Obtener horario semanal de un grupo
  getHorarioSemanal: async (grupoCursoId, fecha = new Date()) => {
    const fechaISO = fecha.toISOString().split('T')[0];
    const response = await axiosInstance.get(
      `${API_URL}/grupo/${grupoCursoId}/horario-semanal?fecha=${fechaISO}`
    );
    return response.data;
  },

  // Obtener calendario mensual por grado y sección
  getCalendarioMensual: async (grado, seccion, anio, mes) => {
    const response = await axiosInstance.get(
      `${API_URL}/calendario/grado/${grado}/seccion/${seccion}?anio=${anio}&mes=${mes}`
    );
    return response.data;
  },

  // Obtener estadísticas de sesiones de un grupo
  getEstadisticas: async (grupoCursoId, periodo = null) => {
    const url = periodo
      ? `${API_URL}/grupo/${grupoCursoId}/estadisticas?periodo=${periodo}`
      : `${API_URL}/grupo/${grupoCursoId}/estadisticas`;
    const response = await axiosInstance.get(url);
    return response.data;
  },
};

export default sesionService;
