import { useState } from 'react';
import { theme } from '../../styles';
import cursoService from '../../services/cursoService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  cursosColumns,
  cursosSearchFields,
  getCursosFormFields,
  cursosValidationRules,
  getInitialCursoFormData,
  formatCursoForForm,
  formatCursoDataForAPI,
} from './cursosConfig';

export default function Cursos() {
  // Custom Hooks
  const { 
    data: cursos, 
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
  } = useFormValidation(cursosValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedCurso, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  // Estados del formulario
  const [formData, setFormData] = useState(getInitialCursoFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcular estadísticas
  const totalCursos = cursos.length;
  const cursosActivos = cursos.filter(c => c.activo).length;
  const cursosPrimaria = cursos.filter(c => c.nivel === 'Primaria').length;
  const cursosSecundaria = cursos.filter(c => c.nivel === 'Secundaria').length;

  const stats = [
    {
      label: 'Total Cursos',
      value: totalCursos,
      color: theme.colors.accent,
    },
    {
      label: 'Cursos Activos',
      value: cursosActivos,
      color: '#10b981',
    },
    {
      label: 'Primaria',
      value: cursosPrimaria,
      color: '#3b82f6',
    },
    {
      label: 'Secundaria',
      value: cursosSecundaria,
      color: '#8b5cf6',
    },
  ];

  // Handler para abrir modal de crear
  const handleAddCurso = () => {
    setFormData(getInitialCursoFormData());
    clearAllErrors();
    openModal(null);
  };

  // Handler para abrir modal de editar
  const handleEditCurso = (curso) => {
    setFormData(formatCursoForForm(curso));
    clearAllErrors();
    openModal(curso);
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

  // Handler para guardar curso
  const handleSaveCurso = async () => {
    if (!validate(formData)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = formatCursoDataForAPI(formData);

      if (selectedCurso) {
        await update(selectedCurso.id, dataToSend);
      } else {
        // Verificar si el código ya existe
        const codigoExists = await cursoService.codigoExists(dataToSend.codigo);
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
      setFormData(getInitialCursoFormData());
    } catch (err) {
      console.error('Error saving curso:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para eliminar curso
  const handleDeleteCurso = async (curso) => {
    const nombre = curso?.nombre || 'este curso';
    await remove(curso.id, nombre);
  };

  // Handler para cerrar modal
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialCursoFormData());
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
      title="Gestión de Cursos"
      subtitle="Catálogo de materias - EduCore"
      addButtonText="Agregar Curso"
      emptyMessage="No hay cursos registrados. ¡Agrega el primero!"
      loadingMessage="Cargando cursos..."
      
      // Datos
      data={cursos}
      loading={loading}
      error={error}
      stats={stats}
      
      // Tabla
      columns={cursosColumns}
      searchFields={cursosSearchFields}
      
      // Modal
      isModalOpen={isModalOpen}
      modalTitle={selectedCurso ? 'Editar Curso' : 'Nuevo Curso'}
      formFields={getCursosFormFields(!!selectedCurso)}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting}
      
      // Handlers
      onAdd={handleAddCurso}
      onEdit={handleEditCurso}
      onDelete={handleDeleteCurso}
      onSave={handleSaveCurso}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}
