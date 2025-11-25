import axiosInstance from './axiosConfig';

const API_URL = '/Inscripciones';

const inscripcionService = {
  // Obtener todas las inscripciones con filtros opcionales
  getAll: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Asegurarse de que el periodo esté presente si es requerido por el backend
      if (filtros.periodo) params.append('periodo', filtros.periodo);
      if (filtros.grado) params.append('grado', filtros.grado);
      if (filtros.seccion) params.append('seccion', filtros.seccion);
      if (filtros.estado) params.append('estado', filtros.estado);
      
      const response = await axiosInstance.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener inscripciones:', error);
      throw error;
    }
  },

  // Obtener inscripción por ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener inscripción ${id}:`, error);
      throw error;
    }
  },

  // Obtener detalle completo de inscripción
  getDetalle: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/${id}/detalle`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener detalle de inscripción ${id}:`, error);
      throw error;
    }
  },

  // Obtener inscripciones de un estudiante
  getByEstudiante: async (estudianteId) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/estudiante/${estudianteId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener inscripciones del estudiante ${estudianteId}:`, error);
      throw error;
    }
  },

  // Obtener horario de un estudiante
  getHorarioEstudiante: async (estudianteId, periodo) => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/estudiante/${estudianteId}/horario`,
        { params: { periodo } }
      );
      return response.data;
    } catch (error) {
      console.error(`Error al obtener horario del estudiante ${estudianteId}:`, error);
      throw error;
    }
  },

  // Obtener inscripciones de un grupo-curso
  getByGrupoCurso: async (grupoCursoId) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/grupo/${grupoCursoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener inscripciones del grupo ${grupoCursoId}:`, error);
      throw error;
    }
  },

  // Obtener lista de estudiantes de un grupo
  getListaEstudiantesGrupo: async (grupoCursoId) => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/grupo/${grupoCursoId}/lista-estudiantes`
      );
      return response.data;
    } catch (error) {
      console.error(`Error al obtener lista de estudiantes del grupo ${grupoCursoId}:`, error);
      throw error;
    }
  },

  // Crear inscripción individual
  create: async (inscripcionData) => {
    try {
      const response = await axiosInstance.post(API_URL, inscripcionData);
      return response.data;
    } catch (error) {
      console.error('Error al crear inscripción:', error);
      throw error;
    }
  },

  // Inscribir estudiante en todos sus grupos
  inscribirEstudianteCompleto: async (data) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/estudiante/completo`, data);
      return response.data;
    } catch (error) {
      console.error('Error al inscribir estudiante completo:', error);
      throw error;
    }
  },

  // Inscribir múltiples estudiantes en un grupo
  inscribirGrupoCompleto: async (data) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/grupo/masivo`, data);
      return response.data;
    } catch (error) {
      console.error('Error al inscribir grupo completo:', error);
      throw error;
    }
  },

  // Inscribir todo un grado/sección
  inscribirGradoSeccionCompleto: async (data) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/grado-seccion/masivo`, data);
      return response.data;
    } catch (error) {
      console.error('Error al inscribir grado/sección completo:', error);
      throw error;
    }
  },

  // Actualizar inscripción
  update: async (id, inscripcionData) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/${id}`, inscripcionData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar inscripción ${id}:`, error);
      throw error;
    }
  },

  // Eliminar inscripción
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar inscripción ${id}:`, error);
      throw error;
    }
  },

  // Retirar estudiante de un grupo
  retirarEstudiante: async (id, motivo) => {
    try {
      // El backend espera solo el string del motivo en el body
      const response = await axiosInstance.patch(
        `${API_URL}/${id}/retirar`, 
        `"${motivo}"`, // Enviar como string JSON escapado
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error al retirar estudiante de inscripción ${id}:`, error);
      throw error;
    }
  },

  // Obtener estadísticas
  getEstadisticas: async (periodo) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/estadisticas`, {
        params: { periodo }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },
};

export default inscripcionService;