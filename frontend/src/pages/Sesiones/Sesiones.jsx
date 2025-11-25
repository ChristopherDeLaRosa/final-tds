import { useState, useEffect } from 'react';
import { theme } from '../../styles';
import sesionService from '../../services/sesionService';
import grupoCursoService from '../../services/grupoCursoService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  sesionesColumns,
  sesionesSearchFields,
  getSesionesFormFields,
  sesionesValidationRules,
  getInitialSesionFormData,
  formatSesionForForm,
  formatSesionDataForAPI,
} from './sesionesConfig';

export default function Sesiones() {
  const { 
    data: sesiones, 
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
  } = useFormValidation(sesionesValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedSesion, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  const [formData, setFormData] = useState(getInitialSesionFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [gruposCursos, setGruposCursos] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        setLoadingRelated(true);
        const gruposData = await grupoCursoService.getAll();
        
        setGruposCursos(gruposData.filter(g => g.activo));
      } catch (err) {
        console.error('Error al cargar grupos-cursos:', err);
        Toast.fire({
          icon: 'error',
          title: 'Error al cargar grupos-cursos',
        });
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedData();
  }, []);

  const totalSesiones = sesiones.length;
  const sesionesRealizadas = sesiones.filter(s => s.realizada).length;
  const sesionesPendientes = totalSesiones - sesionesRealizadas;
  const porcentajeAvance = totalSesiones > 0 
    ? Math.round((sesionesRealizadas / totalSesiones) * 100) 
    : 0;

  const stats = [
    {
      label: 'Total Sesiones',
      value: totalSesiones,
      color: theme.colors.accent,
    },
    {
      label: 'Realizadas',
      value: sesionesRealizadas,
      color: '#10b981',
    },
    {
      label: 'Pendientes',
      value: sesionesPendientes,
      color: '#f59e0b',
    },
    {
      label: 'Avance',
      value: `${porcentajeAvance}%`,
      color: '#3b82f6',
    },
  ];

  const handleAddSesion = () => {
    if (loadingRelated) {
      Toast.fire({
        icon: 'warning',
        title: 'Cargando grupos-cursos...',
      });
      return;
    }
    setFormData(getInitialSesionFormData());
    clearAllErrors();
    openModal(null);
  };

  const handleEditSesion = (sesion) => {
    if (loadingRelated) {
      Toast.fire({
        icon: 'warning',
        title: 'Cargando grupos-cursos...',
      });
      return;
    }
    setFormData(formatSesionForForm(sesion));
    clearAllErrors();
    openModal(sesion);
  };

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

  const handleSaveSesion = async () => {
    if (!validate(formData)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = formatSesionDataForAPI(formData);

      if (selectedSesion) {
        await update(selectedSesion.id, dataToSend);
      } else {
        await create(dataToSend);
      }
      
      closeModal();
      setFormData(getInitialSesionFormData());
    } catch (err) {
      console.error('Error saving sesión:', err);
      
      if (err.response?.data?.message?.includes('horario')) {
        Toast.fire({
          icon: 'error',
          title: 'Ya existe una sesión en ese horario',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSesion = async (sesion) => {
    const fecha = new Date(sesion.fecha).toLocaleDateString('es-DO');
    const nombre = `${sesion.nombreCurso} - ${fecha}`;
    await remove(sesion.id, nombre);
  };

  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialSesionFormData());
      clearAllErrors();
    }
  };

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
      title="Gestión de Sesiones"
      subtitle="Programación de clases - EduCore"
      addButtonText="Agregar Sesión"
      emptyMessage="No hay sesiones registradas. ¡Agrega la primera!"
      loadingMessage="Cargando sesiones..."
      data={sesiones}
      loading={loading}
      error={error}
      stats={stats}
      columns={sesionesColumns}
      searchFields={sesionesSearchFields}
      isModalOpen={isModalOpen}
      modalTitle={selectedSesion ? 'Editar Sesión' : 'Nueva Sesión'}
      formFields={getSesionesFormFields(!!selectedSesion, gruposCursos)}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting || loadingRelated}
      onAdd={handleAddSesion}
      onEdit={handleEditSesion}
      onDelete={handleDeleteSesion}
      onSave={handleSaveSesion}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}
