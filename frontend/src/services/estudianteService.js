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

  // Carga masiva de estudiantes
  bulkCreate: async (estudiantes) => {
    const results = {
      exitosos: [],
      fallidos: [],
      total: estudiantes.length,
      tipo: 'estudiantes'
    };

    for (let i = 0; i < estudiantes.length; i++) {
      try {
        const matricula = await estudianteService.generarMatricula();
        const estudianteData = {
          ...estudiantes[i],
          matricula: matricula
        };
        
        const creado = await estudianteService.create(estudianteData);
        
        results.exitosos.push({
          fila: i + 2,
          matricula: creado.matricula,
          nombres: creado.nombres,
          apellidos: creado.apellidos,
          gradoActual: creado.gradoActual
        });
      } catch (error) {
        results.fallidos.push({
          fila: i + 2,
          datos: estudiantes[i],
          error: error.response?.data?.message || error.message || 'Error desconocido'
        });
      }
    }

    return results;
  },

  // ============================================================
  // ASIGNACIÓN MASIVA A AULA - NUEVO MÉTODO OPTIMIZADO
  // ============================================================
  bulkAssignToAula: async (aulaId, estudianteIds) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/bulk-assign-to-aula`, {
        aulaId,
        estudianteIds
      });
      
      // El backend devuelve ResultadoOperacionMasivaDto
      // Transformar al formato esperado por el frontend
      return {
        exitosos: response.data.exitosos.map(id => ({
          id,
          mensaje: 'Asignado exitosamente'
        })),
        fallidos: response.data.fallidos.map(error => ({
          id: error.id,
          error: error.error
        })),
        total: response.data.totalProcesados
      };
    } catch (error) {
      console.error('Error en asignación masiva:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al asignar estudiantes al aula'
      );
    }
  },

  // ============================================================
  // DESASIGNACIÓN MASIVA DE AULA - NUEVO MÉTODO OPTIMIZADO
  // ============================================================
  bulkUnassignFromAula: async (estudianteIds) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/bulk-unassign-from-aula`, 
        estudianteIds
      );
      
      // El backend devuelve ResultadoOperacionMasivaDto
      // Transformar al formato esperado por el frontend
      return {
        exitosos: response.data.exitosos.map(id => ({
          id,
          mensaje: 'Desasignado exitosamente'
        })),
        fallidos: response.data.fallidos.map(error => ({
          id: error.id,
          error: error.error
        })),
        total: response.data.totalProcesados
      };
    } catch (error) {
      console.error('Error en desasignación masiva:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al desasignar estudiantes del aula'
      );
    }
  }
};

export default estudianteService;
