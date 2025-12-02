import axiosInstance from '../services/axiosConfig';

const aulaService = {
  // ==================== CRUD BÁSICO ====================

  async getAll() {
    const response = await axiosInstance.get('/aulas');
    return response.data;
  },

  async getById(id) {
    const response = await axiosInstance.get(`/aulas/${id}`);
    return response.data;
  },

  async getDetalle(id) {
    const response = await axiosInstance.get(`/aulas/${id}/detalle`);
    return response.data;
  },

  async getByPeriodo(periodo) {
    const response = await axiosInstance.get(`/aulas/periodo/${periodo}`);
    return response.data;
  },

  async getByGradoSeccion(grado, seccion, periodo) {
    const response = await axiosInstance.get(
      `/aulas/grado/${grado}/seccion/${seccion}`,
      { params: { periodo } }
    );
    return response.data;
  },

  async create(data) {
    const response = await axiosInstance.post('/aulas', data);
    return response.data;
  },

  async update(id, data) {
    const response = await axiosInstance.put(`/aulas/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await axiosInstance.delete(`/aulas/${id}`);
    return response.data;
  },

  async crearMasivas(data) {
  const response = await axiosInstance.post('/aulas/crear-masivas', data);
  return response.data;
},

  // ==================== HORARIOS ====================

  async getHorarios(aulaId) {
    const response = await axiosInstance.get(`/aulas/${aulaId}/horarios`);
    return response.data;
  },

  async createHorario(data) {
    const response = await axiosInstance.post('/aulas/horarios', data);
    return response.data;
  },

  async updateHorario(horarioId, data) {
    const response = await axiosInstance.put(`/aulas/horarios/${horarioId}`, data);
    return response.data;
  },

  async deleteHorario(horarioId) {
    const response = await axiosInstance.delete(`/aulas/horarios/${horarioId}`);
    return response.data;
  },

  async configurarHorarioCompleto(aulaId, data) {
    const response = await axiosInstance.post(
      `/aulas/${aulaId}/configurar-horario-completo`,
      data
    );
    return response.data;
  },

  // ==================== AUTO-GENERACIÓN ====================

  async generarGrupos(aulaId) {
    const response = await axiosInstance.post(`/aulas/${aulaId}/generar-grupos`);
    return response.data;
  },

  async generarSesiones(aulaId) {
    const response = await axiosInstance.post(`/aulas/${aulaId}/generar-sesiones`);
    return response.data;
  },

  // ==================== ESTUDIANTES ====================

  async asignarEstudiante(aulaId, estudianteId) {
    const response = await axiosInstance.post(
      `/aulas/${aulaId}/asignar-estudiante/${estudianteId}`
    );
    return response.data;
  },

  async removerEstudiante(estudianteId) {
    const response = await axiosInstance.delete(
      `/aulas/remover-estudiante/${estudianteId}`
    );
    return response.data;
  },

  async inscribirEstudiantes(aulaId, estudiantesIds) {
    const response = await axiosInstance.post(
      `/aulas/${aulaId}/inscribir-estudiantes`,
      { estudiantesIds }
    );
    return response.data;
  },

  // ==================== VALIDACIONES ====================

  async tieneCupo(aulaId) {
    const response = await axiosInstance.get(`/aulas/${aulaId}/tiene-cupo`);
    return response.data;
  },
};

export default aulaService;