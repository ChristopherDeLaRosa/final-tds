import { useState } from 'react';
import { theme } from '../../styles';
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

  // Calcular estadísticas
  const totalDocentes = docentes.length;
  const docentesActivos = docentes.filter(d => d.activo).length;
  const docentesConGrupos = docentes.filter(d => d.cantidadGrupos > 0).length;
  const totalEstudiantes = docentes.reduce((sum, d) => sum + (d.cantidadEstudiantes || 0), 0);

  const stats = [
    {
      label: 'Total Docentes',
      value: totalDocentes,
      color: theme.colors.accent,
    },
    {
      label: 'Docentes Activos',
      value: docentesActivos,
      color: '#10b981',
    },
    {
      label: 'Con Grupos Asignados',
      value: docentesConGrupos,
      color: '#3b82f6',
    },
    {
      label: 'Total Estudiantes',
      value: totalEstudiantes,
      color: '#8b5cf6',
    },
  ];

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

  // Handler para eliminar docente
  const handleDeleteDocente = async (docente) => {
    const nombre = docente?.nombreCompleto || 
                   `${docente?.nombres} ${docente?.apellidos}` || 
                   'este docente';
    
    await remove(docente.id, nombre);
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
      onDelete={handleDeleteDocente}
      onSave={handleSaveDocente}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}
