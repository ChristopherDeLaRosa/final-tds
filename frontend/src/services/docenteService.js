import axiosInstance from "./axiosConfig";

const ENDPOINT = "/Docentes";

const docenteService = {
  // Generar cod automaticamente
  generarCodigo: async () => {
    const response = await axiosInstance.get(`${ENDPOINT}/generar-codigo`);
    return response.data.codigo;
  },
  // Obtener todos los docentes
  getAll: async () => {
    const response = await axiosInstance.get(ENDPOINT);
    return response.data;
  },

  // Obtener solo docentes activos
  getAllActivos: async () => {
    const response = await axiosInstance.get(`${ENDPOINT}/activos`);
    return response.data;
  },

  // Obtener docente por ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Crear nuevo docente
  create: async (docente) => {
    const response = await axiosInstance.post(ENDPOINT, docente);
    return response.data;
  },

  // Actualizar docente
  update: async (id, docente) => {
    const response = await axiosInstance.put(`${ENDPOINT}/${id}`, docente);
    return response.data;
  },

  // Eliminar docente
  delete: async (id) => {
    const response = await axiosInstance.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Verificar si un código ya existe
  codigoExists: async (codigo) => {
    try {
      const response = await axiosInstance.get(
        `${ENDPOINT}/codigo/${codigo}/exists`
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  },

  // Obtener grupos del docente
  getGrupos: async (id) => {
    const response = await axiosInstance.get(`${ENDPOINT}/${id}/grupos`);
    return response.data;
  },

  // CARGA MASIVA DE DOCENTES
bulkCreate: async (docentes) => {
  const results = {
    exitosos: [],
    fallidos: [],
    total: docentes.length,
    tipo: 'docentes'
  };

  for (let i = 0; i < docentes.length; i++) {
    const fila = i + 2;

    try {
      const codigo = await docenteService.generarCodigo();

      const docenteData = {
        codigo,
        nombres: docentes[i].nombres,
        apellidos: docentes[i].apellidos,
        email: docentes[i].email,
        telefono: docentes[i].telefono || null,
        especialidad: docentes[i].especialidad || null,
        fechaContratacion: docentes[i].fechaContratacion
          ? new Date(docentes[i].fechaContratacion).toISOString()
          : null,
      };

      const creado = await docenteService.create(docenteData);

      results.exitosos.push({
        fila,
        codigo: creado.codigo,
        nombres: creado.nombres,
        apellidos: creado.apellidos
      });

    } catch (error) {
      results.fallidos.push({
        fila,
        datos: docentes[i],
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Error desconocido",
      });
    }
  }

  return results;
}



};

export default docenteService;
