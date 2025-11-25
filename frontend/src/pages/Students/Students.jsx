import { useState } from 'react';
import { theme } from '../../styles';
import estudianteService from '../../services/estudianteService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  studentsColumns,
  studentsSearchFields,
  getStudentsFormFields,
  studentsValidationRules,
  getInitialStudentFormData,
  formatStudentForForm,
  formatStudentDataForAPI,
} from './studentsConfig';

export default function Students() {
  // Custom Hooks
  const { 
    data: estudiantes, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    fetchAll,
  } = useCrud(estudianteService);

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(studentsValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedEstudiante, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  // Estados del formulario
  const [formData, setFormData] = useState(getInitialStudentFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcular estadísticas
  const totalEstudiantes = estudiantes.length;
  const estudiantesActivos = estudiantes.filter(e => e.activo).length;
  const estudiantesInactivos = estudiantes.filter(e => !e.activo).length;
  
  // Agrupar por grado
  const porGrado = estudiantes.reduce((acc, est) => {
    const grado = est.gradoActual;
    acc[grado] = (acc[grado] || 0) + 1;
    return acc;
  }, {});
  
  const gradoConMasEstudiantes = Object.entries(porGrado)
    .sort((a, b) => b[1] - a[1])[0];

  const stats = [
    {
      label: 'Total Estudiantes',
      value: totalEstudiantes,
      color: theme.colors.accent,
    },
    {
      label: 'Estudiantes Activos',
      value: estudiantesActivos,
      color: '#10b981',
    },
    {
      label: 'Estudiantes Inactivos',
      value: estudiantesInactivos,
      color: '#ef4444',
    },
    {
      label: gradoConMasEstudiantes ? `Grado ${gradoConMasEstudiantes[0]}°` : 'Sin datos',
      value: gradoConMasEstudiantes ? gradoConMasEstudiantes[1] : 0,
      color: '#8b5cf6',
    },
  ];

  // Handler para abrir modal de crear
  const handleAddStudent = () => {
    setFormData(getInitialStudentFormData());
    clearAllErrors();
    openModal(null);
  };

  // Handler para abrir modal de editar
  const handleEditStudent = (estudiante) => {
    setFormData(formatStudentForForm(estudiante));
    clearAllErrors();
    openModal(estudiante);
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

  // Handler para guardar estudiante
  const handleSaveStudent = async () => {
    if (!validate(formData)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = formatStudentDataForAPI(formData);

      if (selectedEstudiante) {
        await update(selectedEstudiante.id, dataToSend);
      } else {
        // Verificar si la matrícula ya existe
        const matriculaExists = await estudianteService.matriculaExists(dataToSend.matricula);
        if (matriculaExists) {
          Toast.fire({
            icon: 'error',
            title: 'La matrícula ya existe',
          });
          setIsSubmitting(false);
          return;
        }
        await create(dataToSend);
      }
      
      closeModal();
      setFormData(getInitialStudentFormData());
    } catch (err) {
      console.error('Error saving estudiante:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para eliminar estudiante
  const handleDeleteStudent = async (estudiante) => {
    const nombre = estudiante?.nombreCompleto || 
                   `${estudiante?.nombres} ${estudiante?.apellidos}` || 
                   'este estudiante';
    
    await remove(estudiante.id, nombre);
  };

  // Handler para cerrar modal
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialStudentFormData());
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
      title="Gestión de Estudiantes"
      subtitle="Sistema de registro escolar - EduCore"
      addButtonText="Agregar Estudiante"
      emptyMessage="No hay estudiantes registrados. ¡Agrega el primero!"
      loadingMessage="Cargando estudiantes..."
      
      // Datos
      data={estudiantes}
      loading={loading}
      error={error}
      stats={stats}
      
      // Tabla
      columns={studentsColumns}
      searchFields={studentsSearchFields}
      
      // Modal
      isModalOpen={isModalOpen}
      modalTitle={selectedEstudiante ? 'Editar Estudiante' : 'Nuevo Estudiante'}
      formFields={getStudentsFormFields(!!selectedEstudiante)}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting}
      
      // Handlers
      onAdd={handleAddStudent}
      onEdit={handleEditStudent}
      onDelete={handleDeleteStudent}
      onSave={handleSaveStudent}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}
