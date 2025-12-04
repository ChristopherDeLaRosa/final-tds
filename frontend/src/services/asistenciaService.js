import axiosInstance from './axiosConfig';

const API_URL = '/Inscripciones';

const inscripcionService = {
  // Obtener todas las inscripciones con filtros opcionales
  getAll: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filtros.periodo) params.append('periodo', filtros.periodo);
      if (filtros.grado) params.append('grado', filtros.grado);
      if (filtros.seccion) params.append('seccion', filtros.seccion);
      if (filtros.estado) params.append('estado', filtros.estado);
      
      const queryString = params.toString();
      const url = queryString ? `${API_URL}?${queryString}` : API_URL;
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener inscripciones:', error);
      throw error;
    }
  },

  // Obtener inscripción por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener detalle completo de inscripción
  getDetalle: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}/detalle`);
    return response.data;
  },

  // Obtener inscripciones de un estudiante
  getByEstudiante: async (estudianteId) => {
    const response = await axiosInstance.get(`${API_URL}/estudiante/${estudianteId}`);
    return response.data;
  },

  // Obtener horario de un estudiante
  getHorarioEstudiante: async (estudianteId, periodo) => {
    const response = await axiosInstance.get(
      `${API_URL}/estudiante/${estudianteId}/horario?periodo=${periodo}`
    );
    return response.data;
  },

  // Obtener inscripciones de un grupo-curso
  getByGrupoCurso: async (grupoCursoId) => {
    const response = await axiosInstance.get(`${API_URL}/grupo/${grupoCursoId}`);
    return response.data;
  },

  // Obtener lista de estudiantes de un grupo
  getListaEstudiantesGrupo: async (grupoCursoId) => {
    const response = await axiosInstance.get(
      `${API_URL}/grupo/${grupoCursoId}/lista-estudiantes`
    );
    return response.data;
  },

  // Crear inscripción individual
  create: async (inscripcionData) => {
    const response = await axiosInstance.post(API_URL, inscripcionData);
    return response.data;
  },

  // Inscribir estudiante en todos sus grupos
  inscribirEstudianteCompleto: async (data) => {
    const response = await axiosInstance.post(`${API_URL}/estudiante/completo`, data);
    return response.data;
  },

  // Inscribir múltiples estudiantes en un grupo
  inscribirGrupoCompleto: async (data) => {
    const response = await axiosInstance.post(`${API_URL}/grupo/masivo`, data);
    return response.data;
  },

  // Inscribir todo un grado/sección
  inscribirGradoSeccionCompleto: async (data) => {
    const response = await axiosInstance.post(`${API_URL}/grado-seccion/masivo`, data);
    return response.data;
  },

  // Actualizar inscripción
  update: async (id, inscripcionData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, inscripcionData);
    return response.data;
  },

  // Eliminar inscripción
  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Retirar estudiante de un grupo
  retirarEstudiante: async (id, motivo) => {
    const response = await axiosInstance.patch(`${API_URL}/${id}/retirar`, 
      JSON.stringify(motivo),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  // Obtener estadísticas
  getEstadisticas: async (periodo) => {
    const response = await axiosInstance.get(`${API_URL}/estadisticas?periodo=${periodo}`);
    return response.data;
  },

  getReporteEstudiante: async (estudianteId, grupoCursoId = null) => {
    try {
      const url = grupoCursoId 
        ? `/Asistencias/reporte/estudiante/${estudianteId}?grupoCursoId=${grupoCursoId}`
        : `/Asistencias/reporte/estudiante/${estudianteId}`;
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reporte de estudiante:', error);
      throw error;
    }
  },

  // Reporte de grupo-curso
  getReporteGrupoCurso: async (grupoCursoId, periodo = null) => {
    try {
      const url = periodo
        ? `/Asistencias/reporte/grupo/${grupoCursoId}?periodo=${periodo}`
        : `/Asistencias/reporte/grupo/${grupoCursoId}`;
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reporte de grupo:', error);
      throw error;
    }
  },

  // Obtener asistencias por sesión
  getBySesion: async (sesionId) => {
    try {
      const response = await axiosInstance.get(`/Asistencias/sesion/${sesionId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener asistencias por sesión:', error);
      throw error;
    }
  },
};

export default inscripcionService;
