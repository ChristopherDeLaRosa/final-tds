import axiosInstance from './axiosConfig';

const API_URL = '/Inscripciones';

const inscripcionService = {
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

  // Obtener horario completo del estudiante (todas sus materias)
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

  // Obtener lista de estudiantes inscritos en un grupo
  getListaEstudiantesGrupo: async (grupoCursoId) => {
    const response = await axiosInstance.get(`${API_URL}/grupo/${grupoCursoId}/lista-estudiantes`);
    return response.data;
  },

  // Crear inscripción individual
  create: async (inscripcionData) => {
    const response = await axiosInstance.post(API_URL, inscripcionData);
    return response.data;
  },

  // Inscribir estudiante en todos los grupos de su grado/sección
  inscribirEstudianteCompleto: async (estudianteId, periodo) => {
    const response = await axiosInstance.post(`${API_URL}/estudiante/completo`, {
      estudianteId,
      periodo,
    });
    return response.data;
  },

  // Inscribir múltiples estudiantes en un grupo
  inscribirGrupoCompleto: async (grupoCursoId, estudiantesIds) => {
    const response = await axiosInstance.post(`${API_URL}/grupo/masivo`, {
      grupoCursoId,
      estudiantesIds,
    });
    return response.data;
  },

  // Inscribir todo un grado/sección en todos sus grupos
  inscribirGradoSeccionCompleto: async (grado, seccion, periodo) => {
    const response = await axiosInstance.post(`${API_URL}/grado-seccion/masivo`, {
      grado,
      seccion,
      periodo,
    });
    return response.data;
  },

  // Actualizar inscripción
  update: async (id, updateData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, updateData);
    return response.data;
  },

  // Eliminar inscripción
  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Retirar estudiante de un grupo
  retirar: async (id, motivo) => {
    const response = await axiosInstance.patch(`${API_URL}/${id}/retirar`, motivo, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  // Obtener estadísticas de inscripciones por período
  getEstadisticas: async (periodo) => {
    const response = await axiosInstance.get(`${API_URL}/estadisticas?periodo=${periodo}`);
    return response.data;
  },
};

export default inscripcionService;
