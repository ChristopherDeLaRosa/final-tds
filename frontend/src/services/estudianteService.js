import axiosInstance from './axiosConfig';

const API_URL = '/Estudiantes';

const estudianteService = {
  // Generar matrícula automáticamente
  generarMatricula: async () => {
    const response = await axiosInstance.get(`${API_URL}/generar-matricula`);
    return response.data.matricula;
  },

  // Obtener todos los estudiantes activos
  getAll: async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },

  // Obtener estudiante por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener estudiante por matrícula
  getByMatricula: async (matricula) => {
    const response = await axiosInstance.get(`${API_URL}/matricula/${matricula}`);
    return response.data;
  },

  // Obtener estudiantes por grado
  getByGrado: async (grado) => {
    const response = await axiosInstance.get(`${API_URL}/grado/${grado}`);
    return response.data;
  },

  // Obtener estudiantes por grado y sección
  getByGradoSeccion: async (grado, seccion) => {
    const response = await axiosInstance.get(`${API_URL}/grado/${grado}/seccion/${seccion}`);
    return response.data;
  },

  // Obtener lista de estudiantes por grado y sección
  getEstudiantesPorGradoSeccion: async (grado, seccion) => {
    const response = await axiosInstance.get(`${API_URL}/grado/${grado}/seccion/${seccion}/lista`);
    return response.data;
  },

  // Crear nuevo estudiante
  create: async (estudianteData) => {
    const response = await axiosInstance.post(API_URL, estudianteData);
    return response.data;
  },

  // Actualizar estudiante
  update: async (id, estudianteData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, estudianteData);
    return response.data;
  },

  // Eliminar estudiante (soft delete)
  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener historial académico completo
  getHistorial: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}/historial`);
    return response.data;
  },

  // Verificar si la matrícula existe
  matriculaExists: async (matricula) => {
    try {
      await axiosInstance.get(`${API_URL}/matricula/${matricula}`);
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  },
};

export default estudianteService;