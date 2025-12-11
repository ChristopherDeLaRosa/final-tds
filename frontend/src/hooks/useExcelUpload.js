import { useState } from 'react';
import * as XLSX from 'xlsx';

export const useExcelUpload = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // ============================================================
  // PLANTILLA PARA DOCENTES
  // ============================================================
  const generateDocenteTemplate = () => {
    const headers = [
      "Nombres",
      "Apellidos",
      "Email",
      "Telefono",
      "Especialidad",
      "FechaContratacion",
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Docentes");

    XLSX.writeFile(workbook, "plantilla_docentes.xlsx");
  };

  // ============================================================
  // VALIDACIÓN + TRANSFORMACIÓN DOCENTES
  // ============================================================
  const validateAndTransformDocentes = (rows) => {
    const validData = [];
    const errors = [];

    rows.forEach((row, index) => {
      const fila = index + 2;
      const filaErrores = [];

      const nombres = row["Nombres"]?.trim();
      const apellidos = row["Apellidos"]?.trim();
      const email = row["Email"]?.trim();
      const telefono = row["Telefono"]?.trim() || null;
      const especialidad = row["Especialidad"]?.trim() || null;
      const fechaRaw = row["FechaContratacion"];

      if (!nombres) filaErrores.push("Nombres requeridos");
      if (!apellidos) filaErrores.push("Apellidos requeridos");

      if (!email) filaErrores.push("Email requerido");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        filaErrores.push("Email inválido");

      // Validación de fecha
      let fechaContratacion = null;
      if (fechaRaw) {
        const parsed = new Date(fechaRaw);
        if (isNaN(parsed)) filaErrores.push("FechaContratacion inválida");
        else fechaContratacion = parsed.toISOString();
      }

      if (filaErrores.length > 0) {
        errors.push({
          fila,
          error: filaErrores.join(", "),
          datos: row
        });
        return;
      }

      validData.push({
        nombres,
        apellidos,
        email,
        telefono,
        especialidad,
        fechaContratacion
      });
    });

    return { validData, errors };
  };

  // ============================================================
  // PLANTILLA PARA CURSOS/ASIGNATURAS
  // ============================================================
  const generateCursoTemplate = () => {
    const templateData = [
      {
        Codigo: 'MAT-1',
        Nombre: 'Matemáticas I',
        Descripcion: 'Curso básico de matemáticas para primer grado',
        Nivel: 'Primaria',
        AreaConocimiento: 'Matemáticas',
        NivelGrado: 1,
        HorasSemana: 4,
        Orden: 1,
        EsObligatoria: 'SI',
        Activo: 'SI'
      },
      {
        Codigo: 'LEN-1',
        Nombre: 'Lengua Española I',
        Descripcion: 'Curso de lengua y literatura para primer grado',
        Nivel: 'Primaria',
        AreaConocimiento: 'Lengua y Literatura',
        NivelGrado: 1,
        HorasSemana: 5,
        Orden: 2,
        EsObligatoria: 'SI',
        Activo: 'SI'
      },
      {
        Codigo: 'CN-1',
        Nombre: 'Ciencias Naturales I',
        Descripcion: 'Introducción a las ciencias naturales',
        Nivel: 'Primaria',
        AreaConocimiento: 'Ciencias Naturales',
        NivelGrado: 1,
        HorasSemana: 3,
        Orden: 3,
        EsObligatoria: 'SI',
        Activo: 'SI'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Ajustar ancho de columnas
    worksheet["!cols"] = [
      { wch: 12 },  // Codigo
      { wch: 30 },  // Nombre
      { wch: 50 },  // Descripcion
      { wch: 15 },  // Nivel
      { wch: 25 },  // AreaConocimiento
      { wch: 12 },  // NivelGrado
      { wch: 12 },  // HorasSemana
      { wch: 10 },  // Orden
      { wch: 15 },  // EsObligatoria
      { wch: 10 }   // Activo
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cursos');

    XLSX.writeFile(workbook, 'plantilla_cursos.xlsx');
  };

  // ============================================================
  // VALIDACIÓN + TRANSFORMACIÓN CURSOS
  // ============================================================
  const validateAndTransformCursos = (rows) => {
    const validData = [];
    const errors = [];

    const nivelesValidos = ['Primaria', 'Secundaria'];
    const areasValidas = [
      'Matemáticas',
      'Ciencias Naturales',
      'Ciencias Sociales',
      'Lengua y Literatura',
      'Lengua Extranjera',
      'Educación Física',
      'Educación Artística',
      'Tecnología',
      'Formación Integral'
    ];

    rows.forEach((row, index) => {
      const fila = index + 2;
      const filaErrores = [];

      // Validar código
      const codigo = row["Codigo"]?.toString().trim().toUpperCase();
      if (!codigo) {
        filaErrores.push("Código es requerido");
      } else if (!/^[A-Z0-9-]+$/.test(codigo)) {
        filaErrores.push("Código solo debe contener letras mayúsculas, números y guiones");
      } else if (codigo.length > 20) {
        filaErrores.push("Código debe tener máximo 20 caracteres");
      }

      // Validar nombre
      const nombre = row["Nombre"]?.toString().trim();
      if (!nombre) {
        filaErrores.push("Nombre es requerido");
      } else if (nombre.length > 150) {
        filaErrores.push("Nombre debe tener máximo 150 caracteres");
      }

      // Validar descripción (opcional)
      const descripcion = row["Descripcion"]?.toString().trim() || null;
      if (descripcion && descripcion.length > 500) {
        filaErrores.push("Descripción debe tener máximo 500 caracteres");
      }

      // Validar nivel
      const nivel = row["Nivel"]?.toString().trim();
      if (!nivel) {
        filaErrores.push("Nivel es requerido");
      } else if (!nivelesValidos.includes(nivel)) {
        filaErrores.push(`Nivel debe ser: ${nivelesValidos.join(' o ')}`);
      }

      // Validar área de conocimiento
      const areaConocimiento = row["AreaConocimiento"]?.toString().trim();
      if (!areaConocimiento) {
        filaErrores.push("Área de Conocimiento es requerida");
      } else if (!areasValidas.includes(areaConocimiento)) {
        filaErrores.push(`Área debe ser una de: ${areasValidas.join(', ')}`);
      }

      // Validar nivel de grado
      const nivelGrado = parseInt(row["NivelGrado"]);
      if (!nivelGrado || isNaN(nivelGrado)) {
        filaErrores.push("Nivel de Grado es requerido");
      } else if (nivelGrado < 1 || nivelGrado > 12) {
        filaErrores.push("Nivel de Grado debe estar entre 1 y 12");
      }

      // Validar horas por semana
      const horasSemana = parseInt(row["HorasSemana"]);
      if (!horasSemana || isNaN(horasSemana)) {
        filaErrores.push("Horas por Semana es requerido");
      } else if (horasSemana < 1 || horasSemana > 40) {
        filaErrores.push("Horas por Semana debe estar entre 1 y 40");
      }

      // Validar orden (opcional)
      let orden = 0;
      if (row["Orden"]) {
        orden = parseInt(row["Orden"]);
        if (isNaN(orden) || orden < 0 || orden > 100) {
          filaErrores.push("Orden debe estar entre 0 y 100");
        }
      }

      // Validar es obligatoria
      const esObligatoriaRaw = row["EsObligatoria"]?.toString().trim().toUpperCase();
      let esObligatoria = true;
      if (esObligatoriaRaw) {
        if (!['SI', 'NO', 'SÍ'].includes(esObligatoriaRaw)) {
          filaErrores.push("EsObligatoria debe ser SI o NO");
        }
        esObligatoria = ['SI', 'SÍ'].includes(esObligatoriaRaw);
      }

      // Validar activo
      const activoRaw = row["Activo"]?.toString().trim().toUpperCase();
      let activo = true;
      if (activoRaw) {
        if (!['SI', 'NO', 'SÍ'].includes(activoRaw)) {
          filaErrores.push("Activo debe ser SI o NO");
        }
        activo = ['SI', 'SÍ'].includes(activoRaw);
      }

      if (filaErrores.length > 0) {
        errors.push({
          fila,
          errores: filaErrores,
          datos: row
        });
        return;
      }

      validData.push({
        codigo,
        nombre,
        descripcion,
        nivel,
        areaConocimiento,
        nivelGrado,
        horasSemana,
        orden,
        esObligatoria,
        activo
      });
    });

    return { validData, errors };
  };

  // ============================================================
  // ESTUDIANTES - VALIDACIÓN Y TRANSFORMACIÓN
  // ============================================================
  const validateAndTransformData = (jsonData) => {
    const errors = [];
    const validData = [];

    jsonData.forEach((row, index) => {
      const rowNumber = index + 2;
      const rowErrors = [];

      if (!row.nombres || row.nombres.toString().trim() === '') {
        rowErrors.push('Nombres es requerido');
      }

      if (!row.apellidos || row.apellidos.toString().trim() === '') {
        rowErrors.push('Apellidos es requerido');
      }

      if (!row.email || row.email.toString().trim() === '') {
        rowErrors.push('Email es requerido');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email.toString().trim())) {
          rowErrors.push('Email no es válido');
        }
      }

      if (!row.fechaNacimiento) {
        rowErrors.push('Fecha de nacimiento es requerida');
      }

      if (!row.gradoActual) {
        rowErrors.push('Grado actual es requerido');
      } else {
        const grado = parseInt(row.gradoActual);
        if (isNaN(grado) || grado < 1 || grado > 12) {
          rowErrors.push('Grado debe estar entre 1 y 12');
        }
      }

      if (!row.seccionActual || row.seccionActual.toString().trim() === '') {
        rowErrors.push('Sección actual es requerida');
      }

      if (rowErrors.length > 0) {
        errors.push({
          fila: rowNumber,
          errores: rowErrors,
          datos: row
        });
      } else {
        validData.push(transformRowToStudentData(row));
      }
    });

    return { validData, errors };
  };

  const transformRowToStudentData = (row) => {
    const fechaNacimiento = excelDateToJSDate(row.fechaNacimiento);
    const fechaIngreso = row.fechaIngreso 
      ? excelDateToJSDate(row.fechaIngreso)
      : new Date();

    return {
      nombres: row.nombres.toString().trim(),
      apellidos: row.apellidos.toString().trim(),
      email: row.email.toString().trim().toLowerCase(),
      telefono: row.telefono ? row.telefono.toString().trim() : null,
      direccion: row.direccion ? row.direccion.toString().trim() : null,
      fechaNacimiento: formatDateForAPI(fechaNacimiento),
      fechaIngreso: formatDateForAPI(fechaIngreso),
      gradoActual: parseInt(row.gradoActual),
      seccionActual: row.seccionActual.toString().trim().toUpperCase(),
      aulaId: row.aulaId ? parseInt(row.aulaId) : null,
      nombreTutor: row.nombreTutor ? row.nombreTutor.toString().trim() : null,
      telefonoTutor: row.telefonoTutor ? row.telefonoTutor.toString().trim() : null,
      emailTutor: row.emailTutor ? row.emailTutor.toString().trim().toLowerCase() : null,
      observacionesMedicas: row.observacionesMedicas ? row.observacionesMedicas.toString().trim() : null,
      activo: true
    };
  };

  const excelDateToJSDate = (excelDate) => {
    if (excelDate instanceof Date) return excelDate;
    if (typeof excelDate === 'string') return new Date(excelDate);
    if (typeof excelDate === 'number') {
      return new Date((excelDate - 25569) * 86400 * 1000);
    }
    return new Date();
  };

  const formatDateForAPI = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T00:00:00`;
  };

  const generateExcelTemplate = () => {
    const templateData = [
      {
        nombres: 'Juan Carlos',
        apellidos: 'Pérez López',
        email: 'juan.perez@ejemplo.com',
        telefono: '809-555-1234',
        direccion: 'Calle Principal #123, Santo Domingo',
        fechaNacimiento: '2010-05-15',
        fechaIngreso: '2024-08-20',
        gradoActual: 8,
        seccionActual: 'A',
        aulaId: '',
        nombreTutor: 'María López',
        telefonoTutor: '809-555-5678',
        emailTutor: 'maria.lopez@ejemplo.com',
        observacionesMedicas: 'Ninguna'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    worksheet["!cols"] = [
      { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 15 },
      { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
      { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 15 },
      { wch: 30 }, { wch: 30 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes');

    XLSX.writeFile(workbook, 'plantilla_estudiantes.xlsx');
  };

  return {
    isProcessing,
    setIsProcessing,

    // Bases
    readExcelFile,

    // Estudiantes
    validateAndTransformData,
    generateExcelTemplate,

    // Docentes
    generateDocenteTemplate,
    validateAndTransformDocentes,

    // Cursos
    generateCursoTemplate,
    validateAndTransformCursos
  };
};
