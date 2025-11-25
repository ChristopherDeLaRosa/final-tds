import axiosInstance from './axiosConfig';

const API_URL = '/GruposCursos';

const grupoCursoService = {
  // Obtener todos los grupos
  getAll: async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },

  // Obtener grupo por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener detalle completo del grupo (incluye estudiantes)
  getDetalle: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}/detalle`);
    return response.data;
  },

  // Obtener grupos por periodo
  getByPeriodo: async (periodo) => {
    const response = await axiosInstance.get(`${API_URL}/periodo/${periodo}`);
    return response.data;
  },

  // Obtener grupos por grado y sección (periodo es REQUERIDO)
  getByGradoSeccion: async (grado, seccion, periodo) => {
    if (!periodo) {
      throw new Error('El periodo es requerido');
    }
    const response = await axiosInstance.get(
      `${API_URL}/grado/${grado}/seccion/${seccion}?periodo=${periodo}`
    );
    return response.data;
  },

  // Obtener grupos por curso
  getByCurso: async (cursoId) => {
    const response = await axiosInstance.get(`${API_URL}/curso/${cursoId}`);
    return response.data;
  },

  // Obtener grupos por docente
  getByDocente: async (docenteId) => {
    const response = await axiosInstance.get(`${API_URL}/docente/${docenteId}`);
    return response.data;
  },

  // Obtener horario por grado y sección (periodo es REQUERIDO)
  getHorario: async (grado, seccion, periodo) => {
    if (!periodo) {
      throw new Error('El periodo es requerido');
    }
    const response = await axiosInstance.get(
      `${API_URL}/horario/grado/${grado}/seccion/${seccion}?periodo=${periodo}`
    );
    return response.data;
  },

  // Crear nuevo grupo-curso
  create: async (grupoCursoData) => {
    const response = await axiosInstance.post(API_URL, grupoCursoData);
    return response.data;
  },

  // Actualizar grupo-curso
  update: async (id, grupoCursoData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, grupoCursoData);
    return response.data;
  },

  // Eliminar grupo-curso (soft delete)
  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },
};

export default grupoCursoService;