import axiosInstance from './axiosConfig';

const ESTUDIANTES_ENDPOINT = '/Estudiantes';

// Servicio de API para Estudiantes
const estudianteService = {
  /**
   * Obtener todos los estudiantes activos
   * @returns {Promise} Lista de estudiantes
   */
  getAll: async () => {
    try {
      const response = await axiosInstance.get(ESTUDIANTES_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      throw error;
    }
  },

  /**
   * Obtener estudiante por ID
   * @param {number} id - ID del estudiante
   * @returns {Promise} Datos del estudiante
   */
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`${ESTUDIANTES_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener estudiante ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener estudiante por matrícula
   * @param {string} matricula - Matrícula del estudiante
   * @returns {Promise} Datos del estudiante
   */
  getByMatricula: async (matricula) => {
    try {
      const response = await axiosInstance.get(`${ESTUDIANTES_ENDPOINT}/matricula/${matricula}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener estudiante con matrícula ${matricula}:`, error);
      throw error;
    }
  },

  /**
   * Crear nuevo estudiante
   * @param {Object} estudianteData - Datos del nuevo estudiante
   * @returns {Promise} Estudiante creado
   */
  create: async (estudianteData) => {
    try {
      const response = await axiosInstance.post(ESTUDIANTES_ENDPOINT, estudianteData);
      return response.data;
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      throw error;
    }
  },

  /**
   * Actualizar estudiante existente
   * @param {number} id - ID del estudiante
   * @param {Object} estudianteData - Datos actualizados
   * @returns {Promise} Estudiante actualizado
   */
  update: async (id, estudianteData) => {
    try {
      const response = await axiosInstance.put(`${ESTUDIANTES_ENDPOINT}/${id}`, estudianteData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar estudiante ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar estudiante (soft delete)
   * @param {number} id - ID del estudiante
   * @returns {Promise} Confirmación de eliminación
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`${ESTUDIANTES_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar estudiante ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener historial académico del estudiante
   * @param {number} id - ID del estudiante
   * @returns {Promise} Historial completo con cursos, notas y asistencia
   */
  getHistorial: async (id) => {
    try {
      const response = await axiosInstance.get(`${ESTUDIANTES_ENDPOINT}/${id}/historial`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener historial del estudiante ${id}:`, error);
      throw error;
    }
  },
};

export default estudianteService;
