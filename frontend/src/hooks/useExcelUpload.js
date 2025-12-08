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
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

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
    if (excelDate instanceof Date) {
      return excelDate;
    }

    if (typeof excelDate === 'string') {
      return new Date(excelDate);
    }

    if (typeof excelDate === 'number') {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date;
    }

    return new Date();
  };

  const formatDateForAPI = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00`;
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
    
    const columnWidths = [
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
      { wch: 30 },
      { wch: 30 }
    ];
    
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estudiantes');
    
    XLSX.writeFile(workbook, 'plantilla_estudiantes.xlsx');
  };

  return {
    isProcessing,
    setIsProcessing,
    readExcelFile,
    validateAndTransformData,
    generateExcelTemplate
  };
};