import { useState } from 'react';
import { theme } from '../../styles';
import docenteService from '../../services/docenteService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  teachersColumns,
  teachersSearchFields,
  getTeachersFormFields,
  teachersValidationRules,
  getInitialTeacherFormData,
  formatTeacherForForm,
  formatTeacherDataForAPI,
} from './teachersConfig';

export default function Teachers() {
  // Custom Hooks
  const { 
    data: teachers, 
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
  } = useFormValidation(teachersValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedTeacher, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  // Estados del formulario
  const [formData, setFormData] = useState(getInitialTeacherFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcular estadísticas
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(t => t.activo).length;
  const inactiveTeachers = teachers.filter(t => !t.activo).length;

  const stats = [
    {
      label: 'Total Docentes',
      value: totalTeachers,
      color: theme.colors.accent,
    },
    {
      label: 'Docentes Activos',
      value: activeTeachers,
      color: '#10b981',
    },
    {
      label: 'Docentes Inactivos',
      value: inactiveTeachers,
      color: '#ef4444',
    },
  ];

  // Handler para abrir modal de crear
  const handleAddTeacher = () => {
    setFormData(getInitialTeacherFormData());
    clearAllErrors();
    openModal(null);
  };

  // Handler para abrir modal de editar
  const handleEditTeacher = (teacher) => {
    setFormData(formatTeacherForForm(teacher));
    clearAllErrors();
    openModal(teacher);
  };

  // Handler para cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando el usuario escribe
    if (formErrors[name]) {
      clearError(name);
    }
  };

  // Handler para guardar docente
  const handleSaveTeacher = async () => {
    if (!validate(formData)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = formatTeacherDataForAPI(formData);

      if (selectedTeacher) {
        await update(selectedTeacher.id, dataToSend);
      } else {
        // Verificar si el código ya existe antes de crear
        const codigoExists = await docenteService.codigoExists(dataToSend.codigo);
        if (codigoExists) {
          MySwal.fire({
            icon: 'error',
            title: 'Código duplicado',
            text: 'El código ya está registrado. Por favor, usa uno diferente.',
          });
          setIsSubmitting(false);
          return;
        }
        
        await create(dataToSend);
      }
      
      closeModal();
      setFormData(getInitialTeacherFormData());
    } catch (err) {
      console.error('Error saving teacher:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para eliminar docente
  const handleDeleteTeacher = async (teacher) => {
    const nombre = `${teacher?.nombres} ${teacher?.apellidos}` || 'este docente';
    await remove(teacher.id, nombre);
  };

  // Handler para cerrar modal
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialTeacherFormData());
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
      subtitle="Sistema de gestión del personal docente - EduCore"
      addButtonText="Agregar Docente"
      emptyMessage="No hay docentes registrados. ¡Agrega el primero!"
      loadingMessage="Cargando docentes..."
      
      // Datos
      data={teachers}
      loading={loading}
      error={error}
      stats={stats}
      
      // Tabla
      columns={teachersColumns}
      searchFields={teachersSearchFields}
      
      // Modal
      isModalOpen={isModalOpen}
      modalTitle={selectedTeacher ? 'Editar Docente' : 'Nuevo Docente'}
      formFields={getTeachersFormFields(!!selectedTeacher)}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting}
      
      // Handlers
      onAdd={handleAddTeacher}
      onEdit={handleEditTeacher}
      onDelete={handleDeleteTeacher}
      onSave={handleSaveTeacher}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}