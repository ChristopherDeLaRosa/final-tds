import { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle, UserX, TimerReset } from 'lucide-react';
import { theme } from '../../styles';
import asistenciaService from '../../services/asistenciaService';
import estudianteService from '../../services/estudianteService';
import sesionService from '../../services/sesionService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  asistenciasColumns,
  asistenciasSearchFields,
  getAsistenciasFormFields,
  asistenciasValidationRules,
  getInitialAsistenciaFormData,
  formatAsistenciaForForm,
  formatAsistenciaDataForAPI,
} from './asistenciasConfig';

export default function Asistencias() {
  const { 
    data: asistencias, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    fetchAll,
  } = useCrud(asistenciaService);

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(asistenciasValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedAsistencia, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  const [formData, setFormData] = useState(getInitialAsistenciaFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [estudiantes, setEstudiantes] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // ===========================
  //   FETCH RELATED DATA
  // ===========================
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        setLoadingRelated(true);

        const hoy = new Date().toISOString().split('T')[0];
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + 30);
        const fechaFinStr = fechaFin.toISOString().split('T')[0];

        const [estudiantesData, sesionesData] = await Promise.all([
          estudianteService.getAll(),
          sesionService.getByRangoFechas(hoy, fechaFinStr),
        ]);

        setEstudiantes(estudiantesData.filter(e => e.activo));
        setSesiones(sesionesData);
      } catch (err) {
        console.error('Error al cargar datos relacionados:', err);
        Toast.fire({
          icon: 'error',
          title: 'Error al cargar estudiantes y sesiones',
        });
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedData();
  }, []);

  // ===========================
  //         STATISTICS
  // ===========================
  const totalAsistencias = asistencias.length;
  const presentes = asistencias.filter(a => a.estado === 'Presente').length;
  const ausentes = asistencias.filter(a => a.estado === 'Ausente').length;
  const tardanzas = asistencias.filter(a => a.estado === 'Tardanza').length;

  const porcentajeAsistencia = totalAsistencias > 0
    ? Math.round((presentes / totalAsistencias) * 100)
    : 0;

  const stats = [
    {
      label: 'Total Registros',
      value: totalAsistencias,
      color: theme.colors.accent,
      icon: <ClipboardList size={28} />,
    },
    {
      label: 'Presentes',
      value: presentes,
      color: theme.colors.success,
      icon: <CheckCircle size={28} />,
    },
    {
      label: 'Ausentes',
      value: ausentes,
      color: theme.colors.error,
      icon: <UserX size={28} />,
    },
    {
      label: 'Tardanzas',
      value: tardanzas,
      color: theme.colors.warning,
      icon: <TimerReset size={28} />,
    },
    {
      label: 'Asistencia',
      value: `${porcentajeAsistencia}%`,
      color: theme.colors.info,
      icon: <CheckCircle size={28} />,
    },
  ];

  // ===========================
  //         HANDLERS
  // ===========================
  const handleAddAsistencia = () => {
    if (loadingRelated) {
      Toast.fire({
        icon: 'warning',
        title: 'Cargando estudiantes y sesiones...',
      });
      return;
    }
    setFormData(getInitialAsistenciaFormData());
    clearAllErrors();
    openModal(null);
  };

  const handleEditAsistencia = (asistencia) => {
    if (loadingRelated) {
      Toast.fire({
        icon: 'warning',
        title: 'Cargando estudiantes y sesiones...',
      });
      return;
    }
    setFormData(formatAsistenciaForForm(asistencia));
    clearAllErrors();
    openModal(asistencia);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (formErrors[name]) clearError(name);
  };

  const handleSaveAsistencia = async () => {
    if (!validate(formData)) return;

    setIsSubmitting(true);

    try {
      const dataToSend = formatAsistenciaDataForAPI(formData);

      if (selectedAsistencia) {
        await update(selectedAsistencia.id, dataToSend);
      } else {
        await create(dataToSend);
      }

      closeModal();
      setFormData(getInitialAsistenciaFormData());
    } catch (err) {
      console.error('Error saving asistencia:', err);

      if (err.response?.data?.message?.includes('ya existe')) {
        Toast.fire({
          icon: 'error',
          title: 'Ya existe un registro de asistencia para este estudiante en esta sesión',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAsistencia = async (asistencia) => {
    const nombre = `${asistencia.nombreEstudiante} - ${new Date(asistencia.fechaSesion).toLocaleDateString('es-DO')}`;
    await remove(asistencia.id, nombre);
  };

  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialAsistenciaFormData());
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

  // ===========================
  //         RENDER
  // ===========================
  return (
    <CrudPage
      title="Gestión de Asistencias"
      subtitle="Control de asistencia de estudiantes - EduCore"
      addButtonText="Registrar Asistencia"
      emptyMessage="No hay asistencias registradas. ¡Registra la primera!"
      loadingMessage="Cargando asistencias..."

      data={asistencias}
      loading={loading}
      error={error}
      stats={stats}

      columns={asistenciasColumns}
      searchFields={asistenciasSearchFields}

      isModalOpen={isModalOpen}
      modalTitle={selectedAsistencia ? 'Editar Asistencia' : 'Nueva Asistencia'}
      formFields={getAsistenciasFormFields(
        !!selectedAsistencia,
        estudiantes,
        sesiones
      )}

      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting || loadingRelated}

      onAdd={handleAddAsistencia}
      onEdit={handleEditAsistencia}
      onDelete={handleDeleteAsistencia}
      onSave={handleSaveAsistencia}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}

