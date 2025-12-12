import axiosInstance from "./axiosConfig";

const API_URL = "/Rubros";

const rubroService = {
  // Obtener todos los rubros activos
  getAll: async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },

  // Obtener rubro por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener rubros por grupo-curso
  getByGrupoCurso: async (grupoCursoId) => {
    const response = await axiosInstance.get(
      `${API_URL}/grupo/${grupoCursoId}`
    );
    return response.data;
  },

  // Obtener rubros de un grupo con estadísticas detalladas
  getRubrosGrupoCursoDetalle: async (grupoCursoId) => {
    const response = await axiosInstance.get(
      `${API_URL}/grupo/${grupoCursoId}/detalle`
    );
    return response.data;
  },

  // Crear nuevo rubro
  create: async (rubroData) => {
    const response = await axiosInstance.post(API_URL, rubroData);
    return response.data;
  },

  // Crear múltiples rubros desde plantilla
  crearPlantilla: async (plantillaData) => {
    const response = await axiosInstance.post(
      `${API_URL}/plantilla`,
      plantillaData
    );
    return response.data;
  },

  // Actualizar rubro
  update: async (id, rubroData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, rubroData);
    return response.data;
  },

  // Eliminar rubro
  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Validar que los porcentajes de rubros de un grupo sumen 100%
  validarPorcentajes: async (grupoCursoId) => {
    const response = await axiosInstance.get(
      `${API_URL}/grupo/${grupoCursoId}/validar-porcentajes`
    );
    return response.data;
  },

  // Reordenar rubros de un grupo
  reordenarRubros: async (grupoCursoId, ordenamiento) => {
    const response = await axiosInstance.put(
      `${API_URL}/grupo/${grupoCursoId}/reordenar`,
      ordenamiento
    );
    return response.data;
  },

  // Carga masiva de rubros
  bulkCreate: async (rubros) => {
    const results = {
      exitosos: [],
      fallidos: [],
      total: rubros.length,
      tipo: "rubros",
    };

    // Agrupar rubros por grupoCursoId para validar porcentajes
    const rubrosPorGrupo = rubros.reduce((acc, rubro, index) => {
      if (!acc[rubro.grupoCursoId]) {
        acc[rubro.grupoCursoId] = [];
      }
      acc[rubro.grupoCursoId].push({ ...rubro, index });
      return acc;
    }, {});

    // Validar que cada grupo no exceda 100%
    const gruposConError = {};
    for (const [grupoCursoId, rubrosGrupo] of Object.entries(rubrosPorGrupo)) {
      const totalPorcentaje = rubrosGrupo.reduce(
        (sum, r) => sum + r.porcentaje,
        0
      );

      if (totalPorcentaje > 100) {
        gruposConError[grupoCursoId] = {
          total: totalPorcentaje,
          exceso: totalPorcentaje - 100,
        };
      }
    }

    // Si hay grupos con porcentajes excedidos, marcar todos los rubros de ese grupo como fallidos
    if (Object.keys(gruposConError).length > 0) {
      for (const [grupoCursoId, error] of Object.entries(gruposConError)) {
        const rubrosDelGrupo = rubrosPorGrupo[grupoCursoId];
        rubrosDelGrupo.forEach((rubro) => {
          results.fallidos.push({
            fila: rubro.index + 2,
            datos: rubro,
            error: `Total de porcentajes del grupo ${grupoCursoId}: ${error.total.toFixed(2)}% (excede por ${error.exceso.toFixed(2)}%)`,
          });
        });
      }

      // Remover estos rubros del proceso de creación
      rubros = rubros.filter((_, index) => {
        return !results.fallidos.some((f) => f.fila === index + 2);
      });
    }

    // Crear rubros válidos
    for (let i = 0; i < rubros.length; i++) {
      try {
        const rubroData = {
          grupoCursoId: rubros[i].grupoCursoId,
          nombre: rubros[i].nombre,
          descripcion: rubros[i].descripcion || null,
          porcentaje: rubros[i].porcentaje,
          activo: rubros[i].activo,
        };

        const creado = await rubroService.create(rubroData);

        results.exitosos.push({
          fila: i + 2,
          id: creado.id,
          nombre: creado.nombre,
          grupoCursoId: creado.grupoCursoId,
          porcentaje: creado.porcentaje,
        });
      } catch (error) {
        results.fallidos.push({
          fila: i + 2,
          datos: rubros[i],
          error:
            error.response?.data?.message ||
            error.message ||
            "Error desconocido",
        });
      }
    }

    return results;
  },
};

export default rubroService;
