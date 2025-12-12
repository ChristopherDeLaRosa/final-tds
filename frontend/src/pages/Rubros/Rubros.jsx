import { useState, useEffect, useRef, useMemo } from 'react';
import { Layers, CheckCircle, Percent, ClipboardList, Upload, FileSpreadsheet } from 'lucide-react';
import { theme } from '../../styles';
import rubroService from '../../services/rubroService';
import grupoCursoService from '../../services/grupoCursoService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import { useExcelUpload } from '../../hooks/useExcelUpload';
import BulkUploadResultModal from '../../components/molecules/BulkUploadResultModal/BulkUploadResultModal';
import {
  rubrosColumns,
  rubrosSearchFields,
  getRubrosFormFields,
  rubrosValidationRules,
  getInitialRubroFormData,
  formatRubroForForm,
  formatRubroDataForAPI,
} from './rubrosConfig';

export default function Rubros() {
  const { 
    data: rubros, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    fetchAll,
  } = useCrud(rubroService);

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(rubrosValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedRubro, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  const [formData, setFormData] = useState(getInitialRubroFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [gruposCursos, setGruposCursos] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // Estados para carga masiva de Excel
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const fileInputRef = useRef(null);

  const {
    isProcessing,
    setIsProcessing,
    readExcelFile,
    validateAndTransformRubros,
    generateRubroTemplate,
  } = useExcelUpload();

  // ===========================
  //   FETCH RELATED DATA
  // ===========================
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        setLoadingRelated(true);

        const gruposData = await grupoCursoService.getAll();
        setGruposCursos(gruposData.filter(g => g.activo));
      } catch (err) {
        console.error('Error al cargar grupos-cursos:', err);
        Toast.fire({
          icon: 'error',
          title: 'Error al cargar grupos-cursos',
        });
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedData();
  }, []);

  // ===========================
  //    ENRIQUECER RUBROS
  // ===========================
  const rubrosEnriquecidos = rubros.map(r => {
    const grupo = gruposCursos.find(g => g.id === r.grupoCursoId);
    return {
      ...r,
      nombreCurso: grupo ? grupo.nombreCurso : 'Sin curso',
      grado: grupo ? grupo.grado : 0,
      seccion: grupo ? grupo.seccion : '',
    };
  });

  // ===========================
  //        STATS
  // ===========================
  const totalRubros = rubrosEnriquecidos.length;
  const rubrosActivos = rubrosEnriquecidos.filter(r => r.activo).length;

  // % total activos
  const porcentajeTotal = rubrosEnriquecidos
    .filter(r => r.activo)
    .reduce((sum, r) => sum + (r.porcentaje || 0), 0);

  // rubros agrupados por curso
  const rubrosPorGrupo = rubrosEnriquecidos.reduce((acc, r) => {
    if (!acc[r.grupoCursoId]) acc[r.grupoCursoId] = [];
    acc[r.grupoCursoId].push(r);
    return acc;
  }, {});

  // grupos donde suman 100%
  const gruposCompletos = Object.values(rubrosPorGrupo).filter(rubrosGrupo => {
    const totalPorcentaje = rubrosGrupo
      .filter(r => r.activo)
      .reduce((sum, r) => sum + (r.porcentaje || 0), 0);
    return Math.abs(totalPorcentaje - 100) < 0.01;
  }).length;

  const stats = [
    {
      label: 'Total Rubros',
      value: totalRubros,
      color: theme.colors.accent,
      icon: <Layers size={28} />,
    },
    {
      label: 'Rubros Activos',
      value: rubrosActivos,
      color: theme.colors.success,
      icon: <CheckCircle size={28} />,
    },
    {
      label: 'Grupos Completos (100%)',
      value: gruposCompletos,
      color: theme.colors.info,
      icon: <Percent size={28} />,
    },
    {
      label: 'Grupos-Cursos',
      value: gruposCursos.length,
      color: theme.colors.warning,
      icon: <ClipboardList size={28} />,
    },
  ];

  // ===========================
  //        HANDLERS
  // ===========================
  const handleAddRubro = () => {
    if (loadingRelated) {
      Toast.fire({
        icon: 'warning',
        title: 'Cargando grupos-cursos...',
      });
      return;
    }

    if (gruposCursos.length === 0) {
      Toast.fire({
        icon: 'warning',
        title: 'No hay grupos-cursos disponibles',
        text: 'Primero debes crear grupos-cursos',
      });
      return;
    }

    setFormData(getInitialRubroFormData());
    clearAllErrors();
    openModal(null);
  };

  const handleEditRubro = (rubro) => {
    if (loadingRelated) {
      Toast.fire({
        icon: 'warning',
        title: 'Cargando grupos-cursos...',
      });
      return;
    }

    setFormData(formatRubroForForm(rubro));
    clearAllErrors();
    openModal(rubro);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (formErrors[name]) clearError(name);
  };

  const handleSaveRubro = async () => {
    if (!validate(formData)) return;

    setIsSubmitting(true);

    try {
      const dataToSend = formatRubroDataForAPI(formData);

      // Validar % por curso
      const rubrosDelGrupo = rubrosEnriquecidos.filter(
        r => r.grupoCursoId === dataToSend.grupoCursoId &&
             r.activo &&
             (!selectedRubro || r.id !== selectedRubro.id)
      );

      const totalPorcentaje = rubrosDelGrupo.reduce((sum, r) => sum + (r.porcentaje || 0), 0);
      const nuevoTotal = totalPorcentaje + dataToSend.porcentaje;

      if (nuevoTotal > 100) {
        Toast.fire({
          icon: 'error',
          title: 'El total de porcentajes excede 100%',
          text: `Actual: ${totalPorcentaje.toFixed(2)}% + Nuevo: ${dataToSend.porcentaje}% = ${nuevoTotal.toFixed(2)}%`,
        });
        setIsSubmitting(false);
        return;
      }

      if (selectedRubro) {
        await update(selectedRubro.id, dataToSend);
      } else {
        await create(dataToSend);
      }

      if (Math.abs(nuevoTotal - 100) > 0.01) {
        Toast.fire({
          icon: 'warning',
          title: 'Rubro guardado',
          text: `Total de porcentajes: ${nuevoTotal.toFixed(2)}% (faltan ${(100 - nuevoTotal).toFixed(2)}%)`,
        });
      }

      closeModal();
      setFormData(getInitialRubroFormData());
    } catch (err) {
      console.error('Error saving rubro:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRubro = async (rubro) => {
    const nombre = `${rubro.nombre} - ${rubro.nombreCurso}`;
    await remove(rubro.id, nombre);
  };

  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialRubroFormData());
      clearAllErrors();
    }
  };

  const handleRetry = async () => {
    try {
      MySwal.fire({
        title: 'Recargando...',
        didOpen: () => MySwal.showLoading(),
      });
      await fetchAll();
      MySwal.close();
      Toast.fire({ icon: 'success', title: 'Lista actualizada' });
    } catch {
      MySwal.close();
      MySwal.fire({
        icon: 'error',
        title: 'No se pudo recargar',
        text: 'Verifica tu conexión.',
      });
    }
  };

  // ============================================================
  // CARGA MASIVA DESDE EXCEL - HANDLERS
  // ============================================================

  const handleDownloadTemplate = () => {
    generateRubroTemplate();
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

      const { validData, errors } = validateAndTransformRubros(jsonData);

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
        title: 'Creando rubros...',
        text: `Procesando ${validData.length} rubros. Esto puede tomar unos momentos.`,
      });

      setIsProcessing(true);
      const results = await rubroService.bulkCreate(validData);

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
    if (gruposCursos.length === 0) {
      Toast.fire({
        icon: 'warning',
        title: 'No hay grupos-cursos disponibles',
        text: 'Primero debes crear grupos-cursos antes de cargar rubros',
      });
      return;
    }

    fileInputRef.current?.click();
  };

  // ===========================
  //          RENDER
  // ===========================
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
        title="Gestión de Rubros"
        subtitle="Componentes de evaluación - Zirak"
        addButtonText="Agregar Rubro"
        emptyMessage="No hay rubros registrados. ¡Agrega el primero!"
        loadingMessage="Cargando rubros..."

        data={rubrosEnriquecidos}
        loading={loading}
        error={error}
        stats={stats}

        columns={rubrosColumns}
        searchFields={rubrosSearchFields}

        isModalOpen={isModalOpen}
        modalTitle={selectedRubro ? 'Editar Rubro' : 'Nuevo Rubro'}
        formFields={getRubrosFormFields(!!selectedRubro, gruposCursos)}
        formData={formData}
        formErrors={formErrors}
        isSubmitting={isSubmitting || loadingRelated}

        onAdd={handleAddRubro}
        onEdit={handleEditRubro}
        onDelete={handleDeleteRubro}
        onSave={handleSaveRubro}
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
            disabled: isProcessing || gruposCursos.length === 0,
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

