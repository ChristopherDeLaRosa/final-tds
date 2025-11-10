import { useState, useEffect } from 'react';
import { theme } from '../../styles';
import seccionService from '../../services/seccionService';
import cursoService from '../../services/cursoService';
import docenteService from '../../services/docenteService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  sectionsColumns,
  sectionsSearchFields,
  getSectionsFormFields,
  sectionsValidationRules,
  getInitialSectionFormData,
  formatSectionForForm,
  formatSectionDataForAPI,
} from './sectionsConfig';

export default function Sections() {
  // Custom Hooks
  const { 
    data: sections, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    fetchAll,
  } = useCrud(seccionService);

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(sectionsValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedSection, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  // Estados adicionales
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Estados del formulario
  const [formData, setFormData] = useState(getInitialSectionFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar cursos y docentes al montar
  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const [cursosData, docentesData] = await Promise.all([
        cursoService.getAll(),
        docenteService.getAll(),
      ]);
      setCursos(cursosData.filter(c => c.activo));
      setDocentes(docentesData.filter(d => d.activo));
    } catch (err) {
      console.error('Error loading options:', err);
      Toast.fire({
        icon: 'error',
        title: 'Error al cargar cursos y docentes'
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  // Calcular estadísticas
  const totalSections = sections.length;
  const activeSections = sections.filter(s => s.activo).length;
  const totalInscritos = sections
    .filter(s => s.activo)
    .reduce((sum, s) => sum + (s.inscritos || 0), 0);
  const capacidadTotal = sections
    .filter(s => s.activo)
    .reduce((sum, s) => sum + s.capacidad, 0);
  const porcentajeOcupacion = capacidadTotal > 0 
    ? Math.round((totalInscritos / capacidadTotal) * 100) 
    : 0;

  const stats = [
    {
      label: 'Total Secciones',
      value: totalSections,
      color: theme.colors.accent,
    },
    {
      label: 'Secciones Activas',
      value: activeSections,
      color: '#10b981',
    },
    {
      label: 'Estudiantes Inscritos',
      value: totalInscritos,
      color: '#f59e0b',
    },
    {
      label: 'Ocupación Promedio',
      value: `${porcentajeOcupacion}%`,
      color: '#8b5cf6',
    },
  ];

  // Handler para abrir modal de crear
  const handleAddSection = () => {
    if (cursos.length === 0 || docentes.length === 0) {
      MySwal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Necesitas tener cursos y docentes activos antes de crear una sección.',
      });
      return;
    }
    setFormData(getInitialSectionFormData());
    clearAllErrors();
    openModal(null);
  };

  // Handler para abrir modal de editar
  const handleEditSection = (section) => {
    setFormData(formatSectionForForm(section));
    clearAllErrors();
    openModal(section);
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

  // Handler para guardar sección
  const handleSaveSection = async () => {
    if (!validate(formData)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = formatSectionDataForAPI(formData);

      if (selectedSection) {
        await update(selectedSection.id, dataToSend);
      } else {
        // Verificar si el código ya existe antes de crear
        const codigoExists = await seccionService.codigoExists(dataToSend.codigo);
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
      setFormData(getInitialSectionFormData());
    } catch (err) {
      console.error('Error saving section:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para eliminar sección
  const handleDeleteSection = async (section) => {
    const nombre = `${section?.codigo} - ${section?.cursoNombre}` || 'esta sección';
    
    // Advertencia si hay estudiantes inscritos
    if (section.inscritos > 0) {
      const { isConfirmed } = await MySwal.fire({
        title: '⚠️ Sección con estudiantes',
        html: `
          <p>Esta sección tiene <strong>${section.inscritos} estudiante(s)</strong> inscrito(s).</p>
          <p>¿Estás seguro de que deseas eliminarla?</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      });
      
      if (!isConfirmed) return;
    }
    
    await remove(section.id, nombre);
  };

  // Handler para cerrar modal
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialSectionFormData());
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
      await Promise.all([fetchAll(), loadOptions()]);
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
      title="Gestión de Secciones"
      subtitle="Administración de secciones por período académico - EduCore"
      addButtonText="Agregar Sección"
      emptyMessage="No hay secciones registradas. ¡Agrega la primera!"
      loadingMessage="Cargando secciones..."
      
      // Datos
      data={sections}
      loading={loading || loadingOptions}
      error={error}
      stats={stats}
      
      // Tabla
      columns={sectionsColumns}
      searchFields={sectionsSearchFields}
      
      // Modal
      isModalOpen={isModalOpen}
      modalTitle={selectedSection ? 'Editar Sección' : 'Nueva Sección'}
      formFields={getSectionsFormFields(!!selectedSection, cursos, docentes)}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting}
      
      // Handlers
      onAdd={handleAddSection}
      onEdit={handleEditSection}
      onDelete={handleDeleteSection}
      onSave={handleSaveSection}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}