import { useState, useEffect } from 'react';
import { theme } from '../../styles';
import sesionService from '../../services/sesionService';
import seccionService from '../../services/seccionService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  sessionsColumns,
  sessionsSearchFields,
  getSessionsFormFields,
  sessionsValidationRules,
  getInitialSessionFormData,
  formatSessionForForm,
  formatSessionDataForAPI,
} from './sessionsConfig';

export default function Sessions() {
  // Custom Hooks
  const { 
    data: sessions, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    fetchAll,
  } = useCrud(sesionService);

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(sessionsValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedSession, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  // Estados adicionales
  const [secciones, setSecciones] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Estados del formulario
  const [formData, setFormData] = useState(getInitialSessionFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar secciones al montar
  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const seccionesData = await seccionService.getAll();
      setSecciones(seccionesData.filter(s => s.activo));
    } catch (err) {
      console.error('Error loading options:', err);
      Toast.fire({
        icon: 'error',
        title: 'Error al cargar secciones'
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  // Calcular estadísticas
  const totalSessions = sessions.length;
  const realizadas = sessions.filter(s => s.realizada).length;
  const pendientes = sessions.filter(s => !s.realizada).length;
  
  // Sesiones de hoy
  const hoy = new Date().toISOString().split('T')[0];
  const sesionesHoy = sessions.filter(s => {
    const fechaSesion = new Date(s.fecha).toISOString().split('T')[0];
    return fechaSesion === hoy;
  }).length;

  const stats = [
    {
      label: 'Total Sesiones',
      value: totalSessions,
      color: theme.colors.accent,
    },
    {
      label: 'Realizadas',
      value: realizadas,
      color: '#10b981',
    },
    {
      label: 'Pendientes',
      value: pendientes,
      color: '#f59e0b',
    },
    {
      label: 'Sesiones Hoy',
      value: sesionesHoy,
      color: '#8b5cf6',
    },
  ];

  // Handler para abrir modal de crear
  const handleAddSession = () => {
    if (secciones.length === 0) {
      MySwal.fire({
        icon: 'warning',
        title: 'Sin secciones',
        text: 'Necesitas tener secciones activas antes de crear una sesión.',
      });
      return;
    }
    setFormData(getInitialSessionFormData());
    clearAllErrors();
    openModal(null);
  };

  // Handler para abrir modal de editar
  const handleEditSession = (session) => {
    setFormData(formatSessionForForm(session));
    clearAllErrors();
    openModal(session);
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

  // Handler para guardar sesión
  const handleSaveSession = async () => {
    if (!validate(formData)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = formatSessionDataForAPI(formData);

      if (selectedSession) {
        await update(selectedSession.id, dataToSend);
      } else {
        await create(dataToSend);
      }
      
      closeModal();
      setFormData(getInitialSessionFormData());
    } catch (err) {
      console.error('Error saving session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para eliminar sesión
  const handleDeleteSession = async (session) => {
    const info = `${session?.codigoSeccion} - ${session?.tema}` || 'esta sesión';
    await remove(session.id, info);
  };

  // Handler para marcar como realizada
  const handleMarcarRealizada = async (session) => {
    if (session.realizada) {
      Toast.fire({
        icon: 'info',
        title: 'Esta sesión ya está marcada como realizada'
      });
      return;
    }

    const { isConfirmed } = await MySwal.fire({
      title: '¿Marcar como realizada?',
      html: `
        <p><strong>Sección:</strong> ${session.codigoSeccion}</p>
        <p><strong>Tema:</strong> ${session.tema}</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, marcar',
      cancelButtonText: 'Cancelar',
    });

    if (!isConfirmed) return;

    try {
      MySwal.fire({
        title: 'Actualizando...',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
      });

      await sesionService.marcarRealizada(session.id);
      await fetchAll();

      MySwal.close();
      Toast.fire({
        icon: 'success',
        title: 'Sesión marcada como realizada'
      });
    } catch (err) {
      MySwal.close();
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo marcar la sesión como realizada'
      });
      console.error('Error marking session:', err);
    }
  };

  // Handler para cerrar modal
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialSessionFormData());
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
      title="Gestión de Sesiones"
      subtitle="Administración del calendario de clases - EduCore"
      addButtonText="Agregar Sesión"
      emptyMessage="No hay sesiones registradas. ¡Agrega la primera!"
      loadingMessage="Cargando sesiones..."
      
      // Datos
      data={sessions}
      loading={loading || loadingOptions}
      error={error}
      stats={stats}
      
      // Tabla
      columns={sessionsColumns}
      searchFields={sessionsSearchFields}
      
      // Modal
      isModalOpen={isModalOpen}
      modalTitle={selectedSession ? 'Editar Sesión' : 'Nueva Sesión'}
      formFields={getSessionsFormFields(!!selectedSession, secciones)}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting}
      
      // Handlers
      onAdd={handleAddSession}
      onEdit={handleEditSession}
      onDelete={handleDeleteSession}
      onSave={handleSaveSession}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
      
      // Acción personalizada para marcar como realizada
      customActions={(row) => !row.realizada && (
        <button
          onClick={() => handleMarcarRealizada(row)}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '8px',
          }}
          title="Marcar como realizada"
        >
          ✓ Realizada
        </button>
      )}
    />
  );
}
