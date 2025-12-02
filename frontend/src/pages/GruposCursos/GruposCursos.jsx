import { useState, useEffect } from 'react';
import { theme } from '../../styles';
import grupoCursoService from '../../services/grupoCursoService';
import cursoService from '../../services/cursoService';
import docenteService from '../../services/docenteService';
import aulaService from '../../services/aulaService';
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
  const [showFormFields, setShowFormFields] = useState(false); // Controla visibilidad de campos
  const [gradoSeleccionado, setGradoSeleccionado] = useState(null); // Grado del aula seleccionada

  // Estados para datos relacionados
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // Cargar cursos, docentes y aulas al montar el componente
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        setLoadingRelated(true);
        const [cursosData, docentesData, aulasData] = await Promise.all([
          cursoService.getAll(),
          docenteService.getAll(),
          aulaService.getAll(),
        ]);
        
        // Filtrar solo activos
        setCursos(cursosData.filter(c => c.activo));
        setDocentes(docentesData.filter(d => d.activo));
        setAulas(aulasData.filter(a => a.activo));
      } catch (err) {
        console.error('Error al cargar datos relacionados:', err);
        Toast.fire({
          icon: 'error',
          title: 'Error al cargar cursos, docentes y aulas',
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
        title: 'Cargando cursos, docentes y aulas...',
      });
      return;
    }
    setFormData(getInitialGrupoCursoFormData());
    setShowFormFields(false); // Ocultar campos hasta que se seleccione aula
    setGradoSeleccionado(null); // Resetear grado
    clearAllErrors();
    openModal(null);
  };

  // Handler para abrir modal de editar
  const handleEditGrupoCurso = (grupoCurso) => {
    if (loadingRelated) {
      Toast.fire({
        icon: 'warning',
        title: 'Cargando cursos, docentes y aulas...',
      });
      return;
    }
    setFormData(formatGrupoCursoForForm(grupoCurso));
    setShowFormFields(!!grupoCurso.aulaId); // Mostrar campos si tiene aula
    setGradoSeleccionado(grupoCurso.grado); // Establecer grado del aula
    clearAllErrors();
    openModal(grupoCurso);
  };

  // Handler para cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Si se selecciona un aula, auto-completar campos relacionados
    if (name === 'aulaId' && value) {
      const aulaSeleccionada = aulas.find(a => a.id === parseInt(value, 10));
      
      if (aulaSeleccionada) {
        setFormData(prev => ({
          ...prev,
          aulaId: value,
          grado: aulaSeleccionada.grado,
          seccion: aulaSeleccionada.seccion,
          anio: aulaSeleccionada.anio,
          periodo: aulaSeleccionada.periodo,
          aula: aulaSeleccionada.aulaFisica || '',
          capacidadMaxima: aulaSeleccionada.capacidadMaxima || 30,
          cursoId: '', // Limpiar curso seleccionado al cambiar de aula
        }));
        
        // Establecer grado para filtrar cursos
        setGradoSeleccionado(aulaSeleccionada.grado);
        
        // Mostrar el resto de campos
        setShowFormFields(true);
        
        // Contar cursos disponibles para este grado
        const cursosDisponibles = cursos.filter(c => c.nivelGrado === aulaSeleccionada.grado).length;
        
        Toast.fire({
          icon: 'success',
          title: 'Datos del aula cargados',
          text: `${aulaSeleccionada.grado}° ${aulaSeleccionada.seccion} - ${cursosDisponibles} cursos disponibles`,
          timer: 2500,
        });
        
        // Limpiar errores de campos auto-completados
        ['grado', 'seccion', 'anio', 'periodo', 'cursoId'].forEach(field => clearError(field));
        
        return;
      }
    }
    
    // Si se deselecciona el aula, ocultar campos
    if (name === 'aulaId' && !value) {
      setShowFormFields(false);
      setGradoSeleccionado(null);
      setFormData(getInitialGrupoCursoFormData());
      clearAllErrors();
      return;
    }
    
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
      setShowFormFields(false); // Resetear visibilidad
      setGradoSeleccionado(null); // Resetear grado
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
      formFields={getGruposCursosFormFields(!!selectedGrupoCurso, cursos, docentes, aulas, showFormFields, gradoSeleccionado)}
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
