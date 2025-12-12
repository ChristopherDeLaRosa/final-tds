import { useState, useEffect } from 'react';
import { CheckCircle, Users, ArchiveRestore, Layers, UserPen, UserPlus, UserPlus2 } from 'lucide-react';
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
import InscripcionMasivaModal from './Inscripcionmasivamodal';

export default function Inscripciones() {
  const { 
    data: inscripciones, 
    loading, 
    error, 
    create, 
    update,
    setData: setInscripciones,
    setLoading,
    setError,
  } = useCrud(inscripcionService, { initialFetch: false });

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

  // Modal de inscripción masiva
  const [isInscripcionMasivaOpen, setIsInscripcionMasivaOpen] = useState(false);

  const [formData, setFormData] = useState(getInitialInscripcionFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [estudiantes, setEstudiantes] = useState([]);
  const [gruposCursos, setGruposCursos] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  const fetchInscripciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inscripcionService.getAll();
      setInscripciones(data);
    } catch {
      setError('Error al cargar inscripciones');
      Toast.fire({ icon: 'error', title: 'Error al cargar inscripciones' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInscripciones();
  }, []);

  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        setLoadingRelated(true);
        const [estudiantesData, gruposData] = await Promise.all([
          estudianteService.getAll(),
          grupoCursoService.getAll(),
        ]);
        
        setEstudiantes(estudiantesData.filter(e => e.activo));
        setGruposCursos(gruposData.filter(g => g.activo));
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedData();
  }, []);

  // Estadísticas
  const totalInscripciones = inscripciones.length;
  const inscripcionesActivas = inscripciones.filter(i => i.estado === 'Activo').length;
  const estudiantesRetirados = inscripciones.filter(i => i.estado === 'Retirado').length;
  const cursosCompletados = inscripciones.filter(i => i.estado === 'Completado').length;

  const stats = [
    {
      label: 'Total Inscripciones',
      value: totalInscripciones,
      color: theme.colors.accent,
      icon: <Layers size={28} />,
    },
    {
      label: 'Activas',
      value: inscripcionesActivas,
      color: theme.colors.success,
      icon: <CheckCircle size={28} />,
    },
    {
      label: 'Retirados',
      value: estudiantesRetirados,
      color: theme.colors.error,
      icon: <ArchiveRestore size={28} />,
    },
    {
      label: 'Completados',
      value: cursosCompletados,
      color: theme.colors.info,
      icon: <Users size={28} />,
    },
  ];

  // Crear
  const handleAddInscripcion = () => {
    if (loadingRelated) {
      Toast.fire({ icon: 'info', title: 'Cargando estudiantes y grupos...' });
      return;
    }
    setFormData(getInitialInscripcionFormData());
    clearAllErrors();
    openModal(null);
  };

  // Editar
  const handleEditInscripcion = (inscripcion) => {
    if (loadingRelated) {
      Toast.fire({ icon: 'info', title: 'Cargando estudiantes y grupos...' });
      return;
    }
    setFormData(formatInscripcionForForm(inscripcion));
    clearAllErrors();
    openModal(inscripcion);
  };

  // Input handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (formErrors[name]) clearError(name);
  };

  // Guardar
  const handleSaveInscripcion = async () => {
    if (!validate(formData)) return;
    
    setIsSubmitting(true);
    
    try {
      const payload = formatInscripcionDataForAPI(formData);

      if (selectedInscripcion) {
        await update(selectedInscripcion.id, payload);
      } else {
        await create(payload);
      }
      
      await fetchInscripciones();
      closeModal();
      setFormData(getInitialInscripcionFormData());
    } catch (err) {
      if (err.response?.data?.message?.includes('inscrito')) {
        Toast.fire({ icon: 'error', title: 'El estudiante ya está inscrito en este grupo' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Activar/Desactivar
  const handleToggleStatus = async (inscripcion) => {
    const action = inscripcion.activo ? 'desactivar' : 'activar';
    const past = inscripcion.activo ? 'desactivada' : 'activada';

    const result = await MySwal.fire({
      title: `¿Deseas ${action} esta inscripción?`,
      text: `${inscripcion.nombreEstudiante} - ${inscripcion.nombreCurso}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const updated = { ...inscripcion, activo: !inscripcion.activo };
      await inscripcionService.update(inscripcion.id, updated);

      Toast.fire({ icon: 'success', title: `Inscripción ${past}` });
      fetchInscripciones();
    } catch {
      Toast.fire({ icon: 'error', title: `Error al ${action}` });
    }
  };

  // Cancelar
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialInscripcionFormData());
      clearAllErrors();
    }
  };

  // Retry
  const handleRetry = async () => {
    try {
      MySwal.fire({
        title: 'Recargando...',
        didOpen: () => MySwal.showLoading(),
      });

      await fetchInscripciones();
      MySwal.close();
      Toast.fire({ icon: 'success', title: 'Lista actualizada' });

    } catch {
      MySwal.close();
      MySwal.fire({ icon: 'error', title: 'No se pudo recargar' });
    }
  };

  return (
    <>
      <CrudPage
        title="Gestión de Inscripciones"
        subtitle="Matrícula de estudiantes en secciones académicas - Zirak"
        addButtonText="Agregar Inscripción"
        emptyMessage="No hay inscripciones registradas"
        loadingMessage="Cargando inscripciones..."
        
        data={inscripciones}
        loading={loading}
        error={error}
        stats={stats}

        columns={inscripcionesColumns}
        searchFields={inscripcionesSearchFields}

        isModalOpen={isModalOpen}
        modalTitle={selectedInscripcion ? 'Editar Inscripción' : 'Nueva Inscripción'}
        formFields={getInscripcionesFormFields(
          !!selectedInscripcion, 
          estudiantes, 
          gruposCursos
        )}
        formData={formData}
        formErrors={formErrors}
        isSubmitting={isSubmitting || loadingRelated}

        onAdd={handleAddInscripcion}
        onEdit={handleEditInscripcion}
        onDelete={handleToggleStatus}
        onSave={handleSaveInscripcion}
        onCancel={handleCancelModal}
        onInputChange={handleInputChange}
        onRetry={handleRetry}

        // Botón adicional para inscripción masiva
        additionalActions={[
          {
            label: 'Inscripción Masiva',
            onClick: () => setIsInscripcionMasivaOpen(true),
            variant: 'secondary',
            icon: <UserPlus2 size={18} />
          }
        ]}
      />

      <InscripcionMasivaModal
        isOpen={isInscripcionMasivaOpen}
        onClose={() => setIsInscripcionMasivaOpen(false)}
        onSuccess={() => {
          fetchInscripciones();
          setIsInscripcionMasivaOpen(false);
        }}
      />
    </>
  );
}