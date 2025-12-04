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

  // Obtener grupos por periodo (nombre del periodo como string)
  // Ejemplo: getByPeriodo("2024-2025")
  getByPeriodo: async (periodo) => {
    const response = await axiosInstance.get(`${API_URL}/periodo/${periodo}`);
    return response.data;
  },

  // Obtener grupos por grado y sección (periodo es REQUERIDO como string)
  // Ejemplo: getByGradoSeccion(5, "A", "2024-2025")
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

  // Obtener horario por grado y sección (periodo es REQUERIDO como string)
  getHorario: async (grado, seccion, periodo) => {
    if (!periodo) {
      throw new Error('El periodo es requerido');
    }
    const response = await axiosInstance.get(
      `${API_URL}/horario/grado/${grado}/seccion/${seccion}?periodo=${periodo}`
    );
    return response.data;
  },


  create: async (grupoCursoData) => {
    // Validación adicional para ayudar a detectar errores
    if (!grupoCursoData.periodoId && grupoCursoData.periodo) {
      console.error(
        'Estás usando "periodo" (string) pero el backend requiere "periodoId" (number).',
        'Por favor actualiza tu código para usar periodoId.'
      );
      throw new Error(
        'El campo "periodoId" es requerido. Ya no se acepta "periodo" como string.'
      );
    }

    if (!grupoCursoData.periodoId) {
      throw new Error('El campo "periodoId" es requerido');
    }

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