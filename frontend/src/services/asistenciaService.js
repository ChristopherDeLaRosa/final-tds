import axiosInstance from './axiosConfig';

const API_URL = '/Asistencias';

const asistenciaService = {
  // Obtener asistencia por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener asistencias de una sesión
  getBySesion: async (sesionId) => {
    const response = await axiosInstance.get(`${API_URL}/sesion/${sesionId}`);
    return response.data;
  },

  // Obtener asistencias de un estudiante
  getByEstudiante: async (estudianteId, fechaInicio = null, fechaFin = null) => {
    let url = `${API_URL}/estudiante/${estudianteId}`;
    if (fechaInicio && fechaFin) {
      url += `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Obtener asistencias por grupo-curso
  getByGrupoCurso: async (grupoCursoId, fechaInicio = null, fechaFin = null) => {
    let url = `${API_URL}/grupo/${grupoCursoId}`;
    if (fechaInicio && fechaFin) {
      url += `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Registrar asistencia individual
  create: async (asistenciaData) => {
    const response = await axiosInstance.post(API_URL, asistenciaData);
    return response.data;
  },

  // Registrar asistencia de múltiples estudiantes en una sesión
  createMultiple: async (asistenciasData) => {
    const response = await axiosInstance.post(`${API_URL}/multiple`, asistenciasData);
    return response.data;
  },

  // Actualizar asistencia
  update: async (id, asistenciaData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, asistenciaData);
    return response.data;
  },

  // Eliminar asistencia
  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener reporte de asistencia de un estudiante
  getReporteEstudiante: async (estudianteId, fechaInicio, fechaFin) => {
    const response = await axiosInstance.get(
      `${API_URL}/reporte/estudiante/${estudianteId}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return response.data;
  },

  // Obtener reporte de asistencia por grupo-curso
  getReporteGrupo: async (grupoCursoId, fechaInicio, fechaFin) => {
    const response = await axiosInstance.get(
      `${API_URL}/reporte/grupo/${grupoCursoId}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return response.data;
  },

  // Obtener estudiantes ausentes en una fecha específica
  getAusentes: async (fecha) => {
    const response = await axiosInstance.get(`${API_URL}/ausentes?fecha=${fecha}`);
    return response.data;
  },

  // Enviar notificación a tutores sobre ausencias
  notificarAusencias: async (sesionId) => {
    const response = await axiosInstance.post(`${API_URL}/notificar-ausencias/${sesionId}`);
    return response.data;
  },
};

export default asistenciaService;
