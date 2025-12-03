import { useState } from 'react';
import docenteService from '../../services/docenteService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
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
  // Custom Hooks
  const { 
    data: docentes, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    fetchAll,
  } = useCrud(docenteService);

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(docentesValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedDocente, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  // Estados del formulario
  const [formData, setFormData] = useState(getInitialDocenteFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcular estadísticas con iconos
  const stats = getDocentesStats(docentes);

  // Handler para abrir modal de crear
  const handleAddDocente = () => {
    setFormData(getInitialDocenteFormData());
    clearAllErrors();
    openModal(null);
  };

  // Handler para abrir modal de editar
  const handleEditDocente = (docente) => {
    setFormData(formatDocenteForForm(docente));
    clearAllErrors();
    openModal(docente);
  };

  // Handler para cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (formErrors[name]) {
      clearError(name);
    }
  };

  // Handler para guardar docente
  const handleSaveDocente = async () => {
    if (!validate(formData)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = formatDocenteDataForAPI(formData);

      if (selectedDocente) {
        await update(selectedDocente.id, dataToSend);
      } else {
        // Verificar si el código ya existe
        const codigoExists = await docenteService.codigoExists(dataToSend.codigo);
        if (codigoExists) {
          Toast.fire({
            icon: 'error',
            title: 'El código ya existe',
          });
          setIsSubmitting(false);
          return;
        }
        await create(dataToSend);
      }
      
      closeModal();
      setFormData(getInitialDocenteFormData());
    } catch (err) {
      console.error('Error saving docente:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para desactivar/activar docente
  const handleToggleStatus = async (docente) => {
    const action = docente.activo ? 'desactivar' : 'activar';
    const actionPast = docente.activo ? 'desactivado' : 'activado';
    
    // Mostrar confirmación con MySwal
    const result = await MySwal.fire({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} docente?`,
      text: `¿Está seguro de ${action} a ${docente.nombreCompleto}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#6B7280',
    });

    if (!result.isConfirmed) return;

    try {
      // Actualizar el campo 'activo', NO eliminar
      const updatedData = {
        nombres: docente.nombres,
        apellidos: docente.apellidos,
        email: docente.email,
        telefono: docente.telefono,
        especialidad: docente.especialidad,
        fechaContratacion: docente.fechaContratacion,
        activo: !docente.activo  // Solo cambiar el estado
      };

      await docenteService.update(docente.id, updatedData);
      
      // Mostrar éxito
      Toast.fire({
        icon: 'success',
        title: `Docente ${actionPast} exitosamente`,
      });
      
      fetchAll(); // Recargar datos
    } catch (error) {
      // Mostrar error
      Toast.fire({
        icon: 'error',
        title: error.message || `Error al ${action} docente`,
      });
    }
  };

  // Handler para cerrar modal
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialDocenteFormData());
      clearAllErrors();
    }
  };

  // Handler para reintentar cargar datos
  const handleRetry = async () => {
    try {
      MySwal.fire({
        title: 'Recargando...',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
        allowEscapeKey: false,
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

  return (
    <CrudPage
      // Títulos y mensajes
      title="Gestión de Docentes"
      subtitle="Personal docente del colegio - EduCore"
      addButtonText="Agregar Docente"
      emptyMessage="No hay docentes registrados. ¡Agrega el primero!"
      loadingMessage="Cargando docentes..."
      
      // Datos
      data={docentes}
      loading={loading}
      error={error}
      stats={stats}
      
      // Tabla
      columns={docentesColumns}
      searchFields={docentesSearchFields}
      
      // Modal
      isModalOpen={isModalOpen}
      modalTitle={selectedDocente ? 'Editar Docente' : 'Nuevo Docente'}
      formFields={getDocentesFormFields(!!selectedDocente)}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting}
      
      // Handlers
      onAdd={handleAddDocente}
      onEdit={handleEditDocente}
      onDelete={handleToggleStatus}
      onSave={handleSaveDocente}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}

