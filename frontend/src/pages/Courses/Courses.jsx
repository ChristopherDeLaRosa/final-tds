import { useState } from 'react';
import { theme } from '../../styles';
import cursoService from '../../services/cursoService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  coursesColumns,
  coursesSearchFields,
  getCoursesFormFields,
  coursesValidationRules,
  getInitialCourseFormData,
  formatCourseForForm,
  formatCourseDataForAPI,
} from './coursesConfig';

export default function Courses() {
  // Custom Hooks
  const { 
    data: courses, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    fetchAll,
  } = useCrud(cursoService);

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(coursesValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedCourse, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  // Estados del formulario
  const [formData, setFormData] = useState(getInitialCourseFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcular estadísticas
  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => c.activo).length;
  const inactiveCourses = courses.filter(c => !c.activo).length;
  
  // Total de créditos y horas
  const totalCreditos = courses
    .filter(c => c.activo)
    .reduce((sum, c) => sum + c.creditos, 0);
  
  const totalHoras = courses
    .filter(c => c.activo)
    .reduce((sum, c) => sum + c.horasSemana, 0);

  const stats = [
    {
      label: 'Total Cursos',
      value: totalCourses,
      color: theme.colors.accent,
    },
    {
      label: 'Cursos Activos',
      value: activeCourses,
      color: '#10b981',
    },
    {
      label: 'Total Créditos',
      value: totalCreditos,
      color: '#f59e0b',
    },
    {
      label: 'Total Horas/Semana',
      value: totalHoras,
      color: '#8b5cf6',
    },
  ];

  // Handler para abrir modal de crear
  const handleAddCourse = () => {
    setFormData(getInitialCourseFormData());
    clearAllErrors();
    openModal(null);
  };

  // Handler para abrir modal de editar
  const handleEditCourse = (course) => {
    setFormData(formatCourseForForm(course));
    clearAllErrors();
    openModal(course);
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

  // Handler para guardar curso
  const handleSaveCourse = async () => {
    if (!validate(formData)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = formatCourseDataForAPI(formData);

      if (selectedCourse) {
        await update(selectedCourse.id, dataToSend);
      } else {
        // Verificar si el código ya existe antes de crear
        const codigoExists = await cursoService.codigoExists(dataToSend.codigo);
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
      setFormData(getInitialCourseFormData());
    } catch (err) {
      console.error('Error saving course:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para eliminar curso
  const handleDeleteCourse = async (course) => {
    const nombre = course?.nombre || 'este curso';
    await remove(course.id, nombre);
  };

  // Handler para cerrar modal
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialCourseFormData());
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
      title="Gestión de Cursos | Materias"
      subtitle="Catálogo de materias y asignaturas - EduCore"
      addButtonText="Agregar Curso"
      emptyMessage="No hay cursos registrados. ¡Agrega el primero!"
      loadingMessage="Cargando cursos..."
      
      // Datos
      data={courses}
      loading={loading}
      error={error}
      stats={stats}
      
      // Tabla
      columns={coursesColumns}
      searchFields={coursesSearchFields}
      
      // Modal
      isModalOpen={isModalOpen}
      modalTitle={selectedCourse ? 'Editar Curso' : 'Nuevo Curso'}
      formFields={getCoursesFormFields(!!selectedCourse)}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting}
      
      // Handlers
      onAdd={handleAddCourse}
      onEdit={handleEditCourse}
      onDelete={handleDeleteCourse}
      onSave={handleSaveCourse}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}
