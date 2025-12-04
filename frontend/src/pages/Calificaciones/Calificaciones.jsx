import { useState, useEffect } from 'react';
import { ClipboardList, Award, TrendingUp, TrendingDown } from 'lucide-react';
import { theme } from '../../styles';
import calificacionService from '../../services/calificacionService';
import estudianteService from '../../services/estudianteService';
import rubroService from '../../services/rubroService';
import grupoCursoService from '../../services/grupoCursoService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  calificacionesColumns,
  calificacionesSearchFields,
  getCalificacionesFormFields,
  calificacionesValidationRules,
  getInitialCalificacionFormData,
  formatCalificacionForForm,
  formatCalificacionDataForAPI,
} from './calificacionesConfig';

export default function Calificaciones() {
  const { 
    data: calificaciones, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    fetchAll,
  } = useCrud(calificacionService);

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(calificacionesValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedCalificacion, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  const [formData, setFormData] = useState(getInitialCalificacionFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [estudiantes, setEstudiantes] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // ============================================
  //      LOAD RELATED DATA
  // ============================================
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        setLoadingRelated(true);

        const gruposData = await grupoCursoService.getAll();
        const gruposActivos = gruposData.filter(g => g.activo);

        // Rubros por grupo
        const rubrosPromises = gruposActivos.map(g =>
          rubroService.getByGrupoCurso(g.id).catch(() => [])
        );
        const rubrosArrays = await Promise.all(rubrosPromises);
        const todosRubros = rubrosArrays.flat();

        const rubrosEnriquecidos = todosRubros.map(r => {
          const grupo = gruposActivos.find(g => g.id === r.grupoCursoId);
          return {
            ...r,
            nombreCurso: grupo ? grupo.nombreCurso : 'Sin curso',
            grado: grupo ? grupo.grado : 0,
            seccion: grupo ? grupo.seccion : '',
          };
        });

        const estudiantesData = await estudianteService.getAll();

        setEstudiantes(estudiantesData.filter(e => e.activo));
        setRubros(rubrosEnriquecidos.filter(r => r.activo));
      } catch (err) {
        console.error('Error al cargar datos relacionados:', err);
        Toast.fire({
          icon: 'error',
          title: 'Error al cargar estudiantes y rubros',
        });
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedData();
  }, []);

  // ============================================
  //                 STATS
  // ============================================
  const totalCalificaciones = calificaciones.length;

  const notasConValor = calificaciones.filter(
    c => c.nota !== null && c.nota !== undefined
  );

  const promedioGeneral = notasConValor.length > 0
    ? Math.round(
        (notasConValor.reduce((sum, c) => sum + c.nota, 0) / notasConValor.length) * 100
      ) / 100
    : 0;

  const aprobados = notasConValor.filter(c => c.nota >= 70).length;
  const reprobados = notasConValor.filter(c => c.nota < 70).length;

  const stats = [
    {
      label: 'Total Calificaciones',
      value: totalCalificaciones,
      color: theme.colors.accent,
      icon: <ClipboardList size={28} />,
    },
    {
      label: 'Promedio General',
      value: promedioGeneral.toFixed(2),
      color: theme.colors.info,
      icon: <Award size={28} />,
    },
    {
      label: 'Aprobados',
      value: aprobados,
      color: theme.colors.success,
      icon: <TrendingUp size={28} />,
    },
    {
      label: 'Reprobados',
      value: reprobados,
      color: theme.colors.error,
      icon: <TrendingDown size={28} />,
    },
  ];

  // ============================================
  //                 HANDLERS
  // ============================================
  const handleAddCalificacion = () => {
    if (loadingRelated) {
      Toast.fire({
        icon: 'warning',
        title: 'Cargando estudiantes y rubros...',
      });
      return;
    }

    if (rubros.length === 0) {
      Toast.fire({
        icon: 'warning',
        title: 'No hay rubros disponibles',
        text: 'Primero debes crear rubros en los grupos-cursos',
      });
      return;
    }

    setFormData(getInitialCalificacionFormData());
    clearAllErrors();
    openModal(null);
  };

  const handleEditCalificacion = (calificacion) => {
    if (loadingRelated) {
      Toast.fire({
        icon: 'warning',
        title: 'Cargando estudiantes y rubros...',
      });
      return;
    }
    setFormData(formatCalificacionForForm(calificacion));
    clearAllErrors();
    openModal(calificacion);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (formErrors[name]) clearError(name);
  };

  const handleSaveCalificacion = async () => {
    if (!validate(formData)) return;

    setIsSubmitting(true);

    try {
      const dataToSend = formatCalificacionDataForAPI(formData);

      if (selectedCalificacion) {
        await update(selectedCalificacion.id, dataToSend);
      } else {
        await create(dataToSend);
      }

      closeModal();
      setFormData(getInitialCalificacionFormData());
    } catch (err) {
      console.error('Error saving calificación:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCalificacion = async (calificacion) => {
    const nombre = `${calificacion.nombreEstudiante} - ${calificacion.nombreRubro}`;
    await remove(calificacion.id, nombre);
  };

  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialCalificacionFormData());
      clearAllErrors();
    }
  };

  const handleRetry = async () => {
    try {
      MySwal.fire({
        title: 'Recargando...',
        didOpen: () => MySwal.showLoading(),
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

  // ============================================
  //                 RENDER
  // ============================================
  return (
    <CrudPage
      title="Gestión de Calificaciones"
      subtitle="Registro de notas y evaluaciones - EduCore"
      addButtonText="Registrar Calificación"
      emptyMessage="No hay calificaciones registradas. ¡Registra la primera!"
      loadingMessage="Cargando calificaciones..."

      data={calificaciones}
      loading={loading}
      error={error}
      stats={stats}

      columns={calificacionesColumns}
      searchFields={calificacionesSearchFields}

      isModalOpen={isModalOpen}
      modalTitle={selectedCalificacion ? 'Editar Calificación' : 'Nueva Calificación'}
      formFields={getCalificacionesFormFields(
        !!selectedCalificacion,
        estudiantes,
        rubros
      )}

      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting || loadingRelated}

      onAdd={handleAddCalificacion}
      onEdit={handleEditCalificacion}
      onDelete={handleDeleteCalificacion}
      onSave={handleSaveCalificacion}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}

