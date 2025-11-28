import axiosInstance from './axiosConfig';

const API_URL = '/Asistencias';

const paseListaService = {
  // Obtener estudiantes inscritos en un grupo para pasar lista
  getEstudiantesParaPaseLista: async (grupoCursoId) => {
    try {
      const response = await axiosInstance.get(
        `/Inscripciones/grupo/${grupoCursoId}/lista-estudiantes`
      );
      
      console.log('Response completa de estudiantes:', response);
      console.log('Response.data:', response.data);
      console.log('Tipo de response.data:', typeof response.data);
      console.log('Es array?', Array.isArray(response.data));
      
      // Validar que sea un array
      const data = response.data;
      
      if (Array.isArray(data)) {
        return data;
      }
      
      // Si viene en una propiedad 'data'
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      
      // Si viene en una propiedad 'estudiantes'
      if (data && Array.isArray(data.estudiantes)) {
        return data.estudiantes;
      }
      
      // Si viene en una propiedad 'items'
      if (data && Array.isArray(data.items)) {
        return data.items;
      }
      
      console.error('El endpoint no retornó un array válido:', data);
      return [];
      
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  },

  // Registrar asistencia grupal (pase de lista completo)
  registrarPaseListaCompleto: async (data) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/grupo`, data);
      return response.data;
    } catch (error) {
      console.error('Error al registrar pase de lista:', error);
      throw error;
    }
  },

  // Obtener asistencias ya registradas de una sesión
  getAsistenciasSesion: async (sesionId) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/sesion/${sesionId}`);
      
      const data = response.data;
      
      // Validar que sea un array
      if (Array.isArray(data)) {
        return data;
      }
      
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      
      if (data && Array.isArray(data.asistencias)) {
        return data.asistencias;
      }
      
      console.warn('getAsistenciasSesion no retornó un array:', data);
      return [];
      
    } catch (error) {
      console.error('Error al obtener asistencias:', error);
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  // Verificar si ya se pasó lista en una sesión
  verificarListaRegistrada: async (sesionId) => {
    try {
      const asistencias = await paseListaService.getAsistenciasSesion(sesionId);
      return Array.isArray(asistencias) && asistencias.length > 0;
    } catch (error) {
      return false;
    }
  },
};

export default paseListaService;
