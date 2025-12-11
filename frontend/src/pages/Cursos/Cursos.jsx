import { useState, useRef } from 'react';
import { theme } from '../../styles';
import cursoService from '../../services/cursoService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useExcelUpload } from '../../hooks/useExcelUpload';
import BulkUploadResultModal from '../../components/molecules/BulkUploadResultModal/BulkUploadResultModal';
import {
  cursosColumns,
  cursosSearchFields,
  getCursosFormFields,
  cursosValidationRules,
  getInitialCursoFormData,
  formatCursoForForm,
  formatCursoDataForAPI,
  getCursosFilterOptions,
} from './cursosConfig';

import { BookOpen, CheckCircle, Layers, GraduationCap } from 'lucide-react';

export default function Cursos() {
  const { 
    data: cursos, 
    loading, 
    error, 
    create, 
    update,
    fetchAll,
  } = useCrud(cursoService);

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(cursosValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedCurso, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  const [formData, setFormData] = useState(getInitialCursoFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para carga masiva
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const fileInputRef = useRef(null);

  const {
    isProcessing,
    setIsProcessing,
    readExcelFile,
    validateAndTransformCursos,
    generateCursoTemplate,
  } = useExcelUpload();

  // Estadísticas
  const totalCursos = cursos.length;
  const cursosActivos = cursos.filter(c => c.activo).length;
  const totalPrimaria = cursos.filter(c => c.nivel === 'Primaria').length;
  const totalSecundaria = cursos.filter(c => c.nivel === 'Secundaria').length;

  const stats = [
    {
      label: 'Total Asignaturas',
      value: totalCursos,
      color: theme.colors.accent,
      icon: <BookOpen size={28} />,
    },
    {
      label: 'Activas',
      value: cursosActivos,
      color: theme.colors.success,
      icon: <CheckCircle size={28} />,
    },
    {
      label: 'Primaria',
      value: totalPrimaria,
      color: theme.colors.info,
      icon: <Layers size={28} />,
    },
    {
      label: 'Secundaria',
      value: totalSecundaria,
      color: '#8b5cf6',
      icon: <GraduationCap size={28} />,
    },
  ];

  // Opciones de filtro
  const filterOptions = getCursosFilterOptions(cursos);

  // Crear
  const handleAddCurso = () => {
    setFormData(getInitialCursoFormData());
    clearAllErrors();
    openModal(null);
  };

  // Editar
  const handleEditCurso = (curso) => {
    setFormData(formatCursoForForm(curso));
    clearAllErrors();
    openModal(curso);
  };

  // Cambios en inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (formErrors[name]) clearError(name);
  };

  // Guardar
  const handleSaveCurso = async () => {
    if (!validate(formData)) return;

    setIsSubmitting(true);

    try {
      const dataToSend = formatCursoDataForAPI(formData);

      if (selectedCurso) {
        await update(selectedCurso.id, dataToSend);
      } else {
        const exists = await cursoService.codigoExists(dataToSend.codigo);
        if (exists) {
          Toast.fire({ icon: 'error', title: 'El código ya existe' });
          setIsSubmitting(false);
          return;
        }
        await create(dataToSend);
      }

      closeModal();
      setFormData(getInitialCursoFormData());
      fetchAll();

    } finally {
      setIsSubmitting(false);
    }
  };

  // Activar / Desactivar
  const handleToggleStatus = async (curso) => {
    const action = curso.activo ? 'desactivar' : 'activar';
    const actionPast = curso.activo ? 'desactivado' : 'activado';

    const result = await MySwal.fire({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} curso?`,
      text: `¿Confirmas que deseas ${action} "${curso.nombre}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#6B7280',
    });

    if (!result.isConfirmed) return;

    try {
      const updatedData = { ...curso, activo: !curso.activo };

      await cursoService.update(curso.id, updatedData);

      Toast.fire({
        icon: 'success',
        title: `Curso ${actionPast} correctamente`,
      });

      fetchAll();

    } catch {
      Toast.fire({
        icon: 'error',
        title: `Error al ${action} curso`,
      });
    }
  };

  // Cancelar modal
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialCursoFormData());
      clearAllErrors();
    }
  };

  // Reintento
  const handleRetry = async () => {
    try {
      MySwal.fire({
        title: 'Recargando...',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
      });

      await fetchAll();
      MySwal.close();
      Toast.fire({ icon: 'success', title: 'Lista actualizada' });

    } catch {
      MySwal.close();
      MySwal.fire({ icon: 'error', title: 'No se pudo recargar' });
    }
  };

  // ============================================================
  // CARGA MASIVA - HANDLERS
  // ============================================================

  const handleDownloadTemplate = () => {
    generateCursoTemplate();
    Toast.fire({
      icon: 'success',
      title: 'Plantilla descargada exitosamente',
    });
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      Toast.fire({
        icon: 'error',
        title: 'Por favor selecciona un archivo Excel válido (.xlsx o .xls)',
      });
      return;
    }

    try {
      MySwal.fire({
        title: 'Procesando archivo...',
        text: 'Por favor espera mientras procesamos el archivo Excel',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
      });

      const jsonData = await readExcelFile(file);

      if (jsonData.length === 0) {
        MySwal.close();
        Toast.fire({
          icon: 'error',
          title: 'El archivo está vacío',
        });
        return;
      }

      const { validData, errors } = validateAndTransformCursos(jsonData);

      if (errors.length > 0) {
        MySwal.close();

        const result = await MySwal.fire({
          title: 'Errores de Validación',
          html: `
            <div style="text-align: left;">
              <p>Se encontraron <strong>${errors.length}</strong> filas con errores:</p>
              <ul style="max-height: 200px; overflow-y: auto; text-align: left;">
                ${errors
                  .slice(0, 5)
                  .map(
                    (err) =>
                      `<li>Fila ${err.fila}: ${err.errores.join(', ')}</li>`
                  )
                  .join('')}
                ${
                  errors.length > 5
                    ? `<li>... y ${errors.length - 5} errores más</li>`
                    : ''
                }
              </ul>
              <p>¿Deseas continuar con las <strong>${validData.length}</strong> filas válidas?</p>
            </div>
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, continuar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#2563EB',
          cancelButtonColor: '#6B7280',
        });

        if (!result.isConfirmed) {
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
      }

      if (validData.length === 0) {
        MySwal.close();
        Toast.fire({
          icon: 'error',
          title: 'No hay datos válidos para procesar',
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      MySwal.update({
        title: 'Creando cursos...',
        text: `Procesando ${validData.length} asignaturas. Esto puede tomar unos momentos.`,
      });

      setIsProcessing(true);
      const results = await cursoService.bulkCreate(validData);

      MySwal.close();
      setUploadResults(results);
      setShowResultsModal(true);

      if (results.exitosos.length > 0) {
        await fetchAll();
      }
    } catch (error) {
      console.error('Error procesando archivo:', error);
      MySwal.close();
      Toast.fire({
        icon: 'error',
        title: 'Error al procesar el archivo',
        text: error.message || 'Ocurrió un error inesperado',
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBulkUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <CrudPage
        title="Gestión de Asignaturas"
        subtitle="Catálogo de materias - Zirak"
        addButtonText="Agregar Asignatura"
        emptyMessage="No hay asignaturas registradas. Agrega una nueva."
        loadingMessage="Cargando asignaturas..."

        data={cursos}
        loading={loading}
        error={error}
        stats={stats}

        columns={cursosColumns}
        searchFields={cursosSearchFields}
        filterOptions={filterOptions}

        isModalOpen={isModalOpen}
        modalTitle={selectedCurso ? 'Editar Curso' : 'Nuevo Curso'}
        formFields={getCursosFormFields(!!selectedCurso)}
        formData={formData}
        formErrors={formErrors}
        isSubmitting={isSubmitting}

        onAdd={handleAddCurso}
        onEdit={handleEditCurso}
        onDelete={handleToggleStatus}
        onSave={handleSaveCurso}
        onCancel={handleCancelModal}
        onInputChange={handleInputChange}
        onRetry={handleRetry}

        additionalActions={[
          {
            label: 'Descargar Plantilla',
            icon: <FileSpreadsheet size={20} />,
            onClick: handleDownloadTemplate,
          },
          {
            label: isProcessing ? 'Procesando...' : 'Carga Masiva',
            icon: <Upload size={20} />,
            onClick: handleBulkUpload,
            disabled: isProcessing,
          },
        ]}
      />

      {showResultsModal && uploadResults && (
        <BulkUploadResultModal
          results={uploadResults}
          onClose={() => setShowResultsModal(false)}
        />
      )}
    </>
  );
}