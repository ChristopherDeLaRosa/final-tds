import { useState, useEffect } from 'react';
import { theme } from '../../styles';
import inscripcionService from '../../services/inscripcionService';
import estudianteService from '../../services/estudianteService';
import grupoCursoService from '../../services/grupoCursoService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  inscripcionesColumns,
  inscripcionesSearchFields,
  getInscripcionesFormFields,
  inscripcionesValidationRules,
  getInitialInscripcionFormData,
  formatInscripcionForForm,
  formatInscripcionDataForAPI,
} from './inscripcionesConfig';

export default function Inscripciones() {
  // Custom Hooks - Deshabilitar fetch inicial automático
  const { 
    data: inscripciones, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    setData: setInscripciones,
    setLoading,
    setError,
  } = useCrud(inscripcionService, { initialFetch: false }); // ⬅️ DESACTIVAR FETCH INICIAL

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(inscripcionesValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedInscripcion, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  // Estados del formulario
  const [formData, setFormData] = useState(getInitialInscripcionFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para datos relacionados
  const [estudiantes, setEstudiantes] = useState([]);
  const [gruposCursos, setGruposCursos] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // ⬇️ NUEVO: Función para cargar inscripciones con filtros
  const fetchInscripciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Puedes ajustar estos filtros según necesites
      const filtros = {
        periodo: '2024-2025', // Ajusta según tu periodo actual
        // grado: null,
        // seccion: null,
        // estado: null,
      };
      
      const data = await inscripcionService.getAll(filtros);
      setInscripciones(data);
    } catch (err) {
      console.error('Error al cargar inscripciones:', err);
      setError('Error al cargar inscripciones');
      Toast.fire({
        title: 'Error al cargar inscripciones',
      });
    } finally {
      setLoading(false);
    }
  };

  // ⬇️ CARGAR INSCRIPCIONES AL MONTAR
  useEffect(() => {
    fetchInscripciones();
  }, []);

  // Cargar estudiantes y grupos al montar el componente
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        setLoadingRelated(true);
        const [estudiantesData, gruposData] = await Promise.all([
          estudianteService.getAll(),
          grupoCursoService.getAll(),
        ]);
        
        // Filtrar solo activos
        setEstudiantes(estudiantesData.filter(e => e.activo));
        setGruposCursos(gruposData.filter(g => g.activo));
      } catch (err) {
        console.error('Error al cargar datos relacionados:', err);
        Toast.fire({
          title: 'Error al cargar estudiantes y grupos',
        });
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedData();
  }, []);

  // Calcular estadísticas
  const totalInscripciones = inscripciones.length;
  const inscripcionesActivas = inscripciones.filter(i => i.activo && i.estado === 'Activo').length;
  const estudiantesRetirados = inscripciones.filter(i => i.estado === 'Retirado').length;
  const cursosCompletados = inscripciones.filter(i => i.estado === 'Completado').length;

  const stats = [
    {
      label: 'Total Inscripciones',
      value: totalInscripciones,
      color: theme.colors.accent,
    },
    {
      label: 'Inscripciones Activas',
      value: inscripcionesActivas,
      color: '#10b981',
    },
    {
      label: 'Estudiantes Retirados',
      value: estudiantesRetirados,
      color: '#ef4444',
    },
    {
      label: 'Cursos Completados',
      value: cursosCompletados,
      color: '#3b82f6',
    },
  ];

  // Handler para abrir modal de crear
  const handleAddInscripcion = () => {
    if (loadingRelated) {
      Toast.fire({
        title: 'Cargando estudiantes y grupos...',
      });
      return;
    }
    setFormData(getInitialInscripcionFormData());
    clearAllErrors();
    openModal(null);
  };

  // Handler para abrir modal de editar
  const handleEditInscripcion = (inscripcion) => {
    if (loadingRelated) {
      Toast.fire({
        title: 'Cargando estudiantes y grupos...',
      });
      return;
    }
    setFormData(formatInscripcionForForm(inscripcion));
    clearAllErrors();
    openModal(inscripcion);
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

  // Handler para guardar inscripción
  const handleSaveInscripcion = async () => {
    if (!validate(formData)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = formatInscripcionDataForAPI(formData);

      if (selectedInscripcion) {
        await update(selectedInscripcion.id, dataToSend);
      } else {
        await create(dataToSend);
      }
      
      // ⬇️ RECARGAR CON FILTROS
      await fetchInscripciones();
      
      closeModal();
      setFormData(getInitialInscripcionFormData());
    } catch (err) {
      console.error('Error saving inscripción:', err);
      
      // Manejar error específico de inscripción duplicada
      if (err.response?.data?.message?.includes('inscrito')) {
        Toast.fire({
          title: 'El estudiante ya está inscrito en este grupo',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para eliminar inscripción
  const handleDeleteInscripcion = async (inscripcion) => {
    const nombre = `${inscripcion.nombreEstudiante} - ${inscripcion.nombreCurso}`;
    const result = await remove(inscripcion.id, nombre);
    
    // ⬇️ RECARGAR DESPUÉS DE ELIMINAR
    if (result) {
      await fetchInscripciones();
    }
  };

  // Handler para cerrar modal
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialInscripcionFormData());
      clearAllErrors();
    }
  };

  // ⬇️ Handler para reintentar cargar datos
  const handleRetry = async () => {
    try {
      MySwal.fire({
        title: 'Recargando...',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      await fetchInscripciones();
      MySwal.close();
      Toast.fire({ title: 'Lista actualizada' });
    } catch {
      MySwal.close();
      MySwal.fire({
        title: 'No se pudo recargar',
        text: 'Verifica tu conexión.',
      });
    }
  };

  return (
    <CrudPage
      title="Gestión de Inscripciones"
      subtitle="Matrícula de estudiantes en grupos-cursos - EduCore"
      addButtonText="Agregar Inscripción"
      emptyMessage="No hay inscripciones registradas. ¡Agrega la primera!"
      loadingMessage="Cargando inscripciones..."
      data={inscripciones}
      loading={loading}
      error={error}
      stats={stats}
      columns={inscripcionesColumns}
      searchFields={inscripcionesSearchFields}
      isModalOpen={isModalOpen}
      modalTitle={selectedInscripcion ? 'Editar Inscripción' : 'Nueva Inscripción'}
      formFields={getInscripcionesFormFields(!!selectedInscripcion, estudiantes, gruposCursos)}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting || loadingRelated}
      onAdd={handleAddInscripcion}
      onEdit={handleEditInscripcion}
      onDelete={handleDeleteInscripcion}
      onSave={handleSaveInscripcion}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}