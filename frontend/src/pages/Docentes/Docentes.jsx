import { useState, useRef } from 'react';
import docenteService from '../../services/docenteService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import { Upload, FileSpreadsheet } from "lucide-react";
import { useExcelUpload } from "../../hooks/useExcelUpload";
import BulkUploadResultModal from '../../components/molecules/BulkUploadResultModal/BulkUploadResultModal';


import {
  docentesColumns,
  docentesSearchFields,
  getDocentesFormFields,
  docentesValidationRules,
  getInitialDocenteFormData,
  formatDocenteForForm,
  formatDocenteDataForAPI,
  getDocentesStats,
} from './docentesConfig';

export default function Docentes() {

  // CRUD HOOK
  const { 
    data: docentes, 
    loading, 
    error, 
    create, 
    update, 
    fetchAll,
  } = useCrud(docenteService);

  // FORM VALIDATION
  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(docentesValidationRules);

  // MODAL
  const { 
    isOpen: isModalOpen, 
    modalData: selectedDocente, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  // FORM DATA
  const [formData, setFormData] = useState(getInitialDocenteFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // EXCEL UPLOAD
  const {
    isProcessing,
    setIsProcessing,
    readExcelFile,
    generateDocenteTemplate,
    validateAndTransformDocentes
  } = useExcelUpload();

  // RESULT MODAL
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);

  // FILE INPUT REF
  const fileInputRef = useRef(null);

  // STATS
  const stats = getDocentesStats(docentes);

  // -------------------------------
  // ADD DOCENTE
  // -------------------------------
  const handleAddDocente = async () => {
    const initialData = getInitialDocenteFormData();

    try {
      const codigoGenerado = await docenteService.generarCodigo();
      initialData.codigo = codigoGenerado;

      Toast.fire({
        icon: 'info',
        title: `Código generado: ${codigoGenerado}`,
        timer: 2000,
      });
    } catch {
      Toast.fire({ icon: "warning", title: "No se pudo generar código automático" });
    }

    setFormData(initialData);
    clearAllErrors();
    openModal(null);
  };

  // -------------------------------
  // EDIT DOCENTE
  // -------------------------------
  const handleEditDocente = (docente) => {
    setFormData(formatDocenteForForm(docente));
    clearAllErrors();
    openModal(docente);
  };

  // -------------------------------
  // INPUT CHANGE
  // -------------------------------
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'codigo') return;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (formErrors[name]) clearError(name);
  };

  // -------------------------------
  // SAVE DOCENTE
  // -------------------------------
  const handleSaveDocente = async () => {
    if (!validate(formData)) return;
    setIsSubmitting(true);

    try {
      const dataToSend = formatDocenteDataForAPI(formData);

      if (selectedDocente)
        await update(selectedDocente.id, dataToSend);
      else
        await create(dataToSend);

      closeModal();
      setFormData(getInitialDocenteFormData());
      await fetchAll();

    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------
  // TOGGLE STATUS
  // -------------------------------
  const handleToggleStatus = async (docente) => {
    const action = docente.activo ? "desactivar" : "activar";

    const result = await MySwal.fire({
      title: `¿${action} docente?`,
      text: `¿Seguro que deseas ${action} a ${docente.nombreCompleto}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const updatedData = {
        nombres: docente.nombres,
        apellidos: docente.apellidos,
        email: docente.email,
        telefono: docente.telefono,
        especialidad: docente.especialidad,
        fechaContratacion: docente.fechaContratacion,
        activo: !docente.activo
      };

      await docenteService.update(docente.id, updatedData);

      Toast.fire({ icon: "success", title: `Docente ${action} correctamente` });
      fetchAll();

    } catch (err) {
      Toast.fire({ icon: "error", title: "Error al actualizar docente" });
    }
  };

  // -------------------------------
  // CANCEL MODAL
  // -------------------------------
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialDocenteFormData());
      clearAllErrors();
    }
  };

  // -------------------------------
  // RETRY
  // -------------------------------
  const handleRetry = async () => {
    try {
      MySwal.fire({ title: "Cargando...", didOpen: () => MySwal.showLoading() });
      await fetchAll();
      MySwal.close();
      Toast.fire({ icon: "success", title: "Lista actualizada" });
    } catch {
      MySwal.close();
      Toast.fire({ icon: "error", title: "No se pudo recargar" });
    }
  };

  // -------------------------------
  // DOWNLOAD TEMPLATE
  // -------------------------------
  const handleDownloadTemplate = () => {
    generateDocenteTemplate();
    Toast.fire({
      icon: "success",
      title: "Plantilla descargada exitosamente"
    });
  };

  // -------------------------------
  // OPEN FILE SELECTOR
  // -------------------------------
  const handleBulkUpload = () => {
    fileInputRef.current?.click();
  };

  // -------------------------------
  // HANDLE FILE SELECT
  // -------------------------------
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      MySwal.fire({
        title: "Procesando archivo...",
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
      });

      const jsonData = await readExcelFile(file);

      const { validData, errors } = validateAndTransformDocentes(jsonData);

      if (errors.length > 0) {
        MySwal.close();

        await MySwal.fire({
          title: "Errores en el archivo",
          html: `
            <p>Se encontraron <strong>${errors.length}</strong> filas con errores.</p>
            <p>Solo se cargarán las filas válidas.</p>
          `,
          icon: "warning"
        });
      }

      if (validData.length === 0) {
        Toast.fire({ icon: "error", title: "No hay filas válidas para procesar" });
        return;
      }

      MySwal.update({
        title: "Creando docentes...",
        text: `Procesando ${validData.length} docentes`
      });

      setIsProcessing(true);

      const results = await docenteService.bulkCreate(validData);

      setUploadResults(results);
      setShowResultsModal(true);

      if (results.exitosos.length > 0) await fetchAll();

      MySwal.close();

    } catch (error) {
      MySwal.close();
      Toast.fire({
        icon: "error",
        title: "Error al procesar archivo",
        text: error.message
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // -------------------------------
  // RENDER
  // -------------------------------
  return (
    <>
      {/* FILE INPUT INVISIBLE */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <CrudPage
        title="Gestión de Docentes"
        subtitle="Personal docente del colegio - Zirak"
        addButtonText="Agregar Docente"
        emptyMessage="No hay docentes registrados."
        loadingMessage="Cargando docentes..."

        data={docentes}
        loading={loading}
        error={error}
        stats={stats}

        columns={docentesColumns}
        searchFields={docentesSearchFields}

        isModalOpen={isModalOpen}
        modalTitle={selectedDocente ? "Editar Docente" : "Nuevo Docente"}
        formFields={getDocentesFormFields(!!selectedDocente)}
        formData={formData}
        formErrors={formErrors}
        isSubmitting={isSubmitting}

        onAdd={handleAddDocente}
        onEdit={handleEditDocente}
        onDelete={handleToggleStatus}
        onSave={handleSaveDocente}
        onCancel={handleCancelModal}
        onInputChange={handleInputChange}
        onRetry={handleRetry}

        additionalActions={[
          {
            label: "Descargar Plantilla",
            icon: <FileSpreadsheet size={20} />,
            onClick: handleDownloadTemplate,
          },
          {
            label: isProcessing ? "Procesando..." : "Carga Masiva",
            icon: <Upload size={20} />,
            onClick: handleBulkUpload,
            disabled: isProcessing,
          }
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
