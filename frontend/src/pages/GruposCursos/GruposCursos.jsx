import { useState, useEffect } from 'react';
import { theme } from '../../styles';
import grupoCursoService from '../../services/grupoCursoService';
import cursoService from '../../services/cursoService';
import docenteService from '../../services/docenteService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  gruposCursosColumns,
  gruposCursosSearchFields,
  getGruposCursosFormFields,
  gruposCursosValidationRules,
  getInitialGrupoCursoFormData,
  formatGrupoCursoForForm,
  formatGrupoCursoDataForAPI,
} from './gruposCursosConfig';

export default function GruposCursos() {
  // Custom Hooks
  const { 
    data: gruposCursos, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    fetchAll,
  } = useCrud(grupoCursoService);

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(gruposCursosValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedGrupoCurso, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  // Estados del formulario
  const [formData, setFormData] = useState(getInitialGrupoCursoFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para datos relacionados
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // Cargar cursos y docentes al montar el componente
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        setLoadingRelated(true);
        const [cursosData, docentesData] = await Promise.all([
          cursoService.getAll(),
          docenteService.getAll(),
        ]);
        
        // Filtrar solo activos
        setCursos(cursosData.filter(c => c.activo));
        setDocentes(docentesData.filter(d => d.activo));
      } catch (err) {
        console.error('Error al cargar datos relacionados:', err);
        Toast.fire({
          icon: 'error',
          title: 'Error al cargar cursos y docentes',
        });
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedData();
  }, []);

  // Calcular estadísticas
  const totalGrupos = gruposCursos.length;
  const gruposActivos = gruposCursos.filter(g => g.activo).length;
  const totalEstudiantes = gruposCursos.reduce((sum, g) => sum + (g.cantidadEstudiantes || 0), 0);
  const gruposCompletos = gruposCursos.filter(g => g.cantidadEstudiantes >= g.capacidadMaxima).length;

  const stats = [
    {
      label: 'Total Grupos',
      value: totalGrupos,
      color: theme.colors.accent,
    },
    {
      label: 'Grupos Activos',
      value: gruposActivos,
      color: '#10b981',
    },
    {
      label: 'Total Estudiantes',
      value: totalEstudiantes,
      color: '#3b82f6',
    },
    {
      label: 'Grupos Llenos',
      value: gruposCompletos,
      color: '#ef4444',
    },
  ];

  // Handler para abrir modal de crear
  const handleAddGrupoCurso = () => {
    if (loadingRelated) {
      Toast.fire({
        icon: 'warning',
        title: 'Cargando cursos y docentes...',
      });
      return;
    }
    setFormData(getInitialGrupoCursoFormData());
    clearAllErrors();
    openModal(null);
  };

  // Handler para abrir modal de editar
  const handleEditGrupoCurso = (grupoCurso) => {
    if (loadingRelated) {
      Toast.fire({
        icon: 'warning',
        title: 'Cargando cursos y docentes...',
      });
      return;
    }
    setFormData(formatGrupoCursoForForm(grupoCurso));
    clearAllErrors();
    openModal(grupoCurso);
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

  // Handler para guardar grupo-curso
  const handleSaveGrupoCurso = async () => {
    if (!validate(formData)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = formatGrupoCursoDataForAPI(formData);

      if (selectedGrupoCurso) {
        await update(selectedGrupoCurso.id, dataToSend);
      } else {
        await create(dataToSend);
      }
      
      closeModal();
      setFormData(getInitialGrupoCursoFormData());
    } catch (err) {
      console.error('Error saving grupo-curso:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para eliminar grupo-curso
  const handleDeleteGrupoCurso = async (grupoCurso) => {
    const nombre = grupoCurso?.codigo || 'este grupo';
    await remove(grupoCurso.id, nombre);
  };

  // Handler para cerrar modal
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialGrupoCursoFormData());
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
      title="Gestión de Grupos-Cursos"
      subtitle="Asignación de cursos por grado y sección - EduCore"
      addButtonText="Agregar Grupo-Curso"
      emptyMessage="No hay grupos-cursos registrados. ¡Agrega el primero!"
      loadingMessage="Cargando grupos-cursos..."
      
      // Datos
      data={gruposCursos}
      loading={loading}
      error={error}
      stats={stats}
      
      // Tabla
      columns={gruposCursosColumns}
      searchFields={gruposCursosSearchFields}
      
      // Modal
      isModalOpen={isModalOpen}
      modalTitle={selectedGrupoCurso ? 'Editar Grupo-Curso' : 'Nuevo Grupo-Curso'}
      formFields={getGruposCursosFormFields(!!selectedGrupoCurso, cursos, docentes)}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting || loadingRelated}
      
      // Handlers
      onAdd={handleAddGrupoCurso}
      onEdit={handleEditGrupoCurso}
      onDelete={handleDeleteGrupoCurso}
      onSave={handleSaveGrupoCurso}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}