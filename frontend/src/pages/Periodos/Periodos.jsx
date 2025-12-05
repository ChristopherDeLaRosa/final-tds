import { useState } from 'react';
import { theme } from '../../styles';
import periodoService from '../../services/periodoService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  getPeriodosColumns,
  periodosSearchFields,
  getPeriodosFormFields,
  periodosValidationRules,
  getInitialPeriodoFormData,
  formatPeriodoForForm,
  formatPeriodoDataForAPI,
} from './periodosConfig';

import { Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function Periodos() {
  const { 
    data: periodos, 
    loading, 
    error, 
    create, 
    update,
    fetchAll,
  } = useCrud(periodoService);

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(periodosValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedPeriodo, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  const [formData, setFormData] = useState(getInitialPeriodoFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estadísticas
  const totalPeriodos = periodos.length;
  const periodosActivos = periodos.filter(p => p.activo).length;
  const periodoActual = periodos.find(p => p.esActual);
  const proximosPeriodos = periodos.filter(p => {
    const fechaInicio = new Date(p.fechaInicio);
    return fechaInicio > new Date() && p.activo;
  }).length;

  const stats = [
    {
      label: 'Total Períodos',
      value: totalPeriodos,
      color: theme.colors.accent,
      icon: <Calendar size={28} />
    },
    {
      label: 'Activos',
      value: periodosActivos,
      color: theme.colors.success,
      icon: <CheckCircle size={28} />
    },
    {
      label: 'Período Actual',
      value: periodoActual ? `${periodoActual.trimestre}` : 'Ninguno',
      color: theme.colors.info,
      icon: <Clock size={28} />
    },
    {
      label: 'Próximos',
      value: proximosPeriodos,
      color: theme.colors.warning,
      icon: <AlertTriangle size={28} />
    },
  ];

  // Establecer como actual
  const handleSetActual = async (periodo) => {
    if (periodo.esActual) {
      Toast.fire({ 
        icon: 'info', 
        title: 'Este período ya es el actual' 
      });
      return;
    }

    const result = await MySwal.fire({
      title: '¿Establecer como período actual?',
      html: `
        <p>Se marcará <strong>${periodo.nombre} - ${periodo.trimestre}</strong> como el período actual.</p>
        <p style="color: #f59e0b; margin-top: 10px;">
          <strong>Nota:</strong> Solo puede haber un período actual a la vez.
        </p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, establecer',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#6B7280',
    });

    if (!result.isConfirmed) return;

    try {
      MySwal.fire({
        title: 'Actualizando...',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
      });

      await periodoService.setActual(periodo.id);
      
      MySwal.close();
      Toast.fire({ 
        icon: 'success', 
        title: 'Período actual actualizado' 
      });
      
      fetchAll();
    } catch (error) {
      MySwal.close();
      MySwal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: error.response?.data?.message || 'No se pudo establecer el período actual'
      });
    }
  };

  // Crear
  const handleAddPeriodo = () => {
    setFormData(getInitialPeriodoFormData());
    clearAllErrors();
    openModal(null);
  };

  // Editar
  const handleEditPeriodo = (periodo) => {
    setFormData(formatPeriodoForForm(periodo));
    clearAllErrors();
    openModal(periodo);
  };

  // Cambios en inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (formErrors[name]) clearError(name);
  };

  // Guardar
  const handleSavePeriodo = async () => {
    if (!validate(formData)) return;

    setIsSubmitting(true);

    try {
      const data = formatPeriodoDataForAPI(formData);

      if (selectedPeriodo) {
        await update(selectedPeriodo.id, data);
      } else {
        await create(data);
      }

      closeModal();
      setFormData(getInitialPeriodoFormData());
      fetchAll();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar (soft delete)
  const handleDeletePeriodo = async (periodo) => {
    const result = await MySwal.fire({
      title: '¿Eliminar este período?',
      html: `
        <p>Se eliminará <strong>${periodo.nombre} - ${periodo.trimestre}</strong>.</p>
        <p style="color: #ef4444; margin-top: 10px;">
          <strong>Advertencia:</strong> Esta acción puede afectar a grupos, aulas e inscripciones asociadas.
        </p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6B7280',
    });

    if (!result.isConfirmed) return;

    try {
      MySwal.fire({
        title: 'Eliminando...',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
      });

      await periodoService.delete(periodo.id);
      
      MySwal.close();
      Toast.fire({ 
        icon: 'success', 
        title: 'Período eliminado' 
      });
      
      fetchAll();
    } catch (error) {
      MySwal.close();
      MySwal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: error.response?.data?.message || 'No se pudo eliminar el período'
      });
    }
  };

  // Cancelar modal
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialPeriodoFormData());
      clearAllErrors();
    }
  };

  // Reintento
  const handleRetry = async () => {
    try {
      MySwal.fire({
        title: 'Recargando...',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
      });

      await fetchAll();
      MySwal.close();
      Toast.fire({ icon: 'success', title: 'Lista actualizada' });

    } catch {
      MySwal.close();
      MySwal.fire({ icon: 'error', title: 'No se pudo recargar' });
    }
  };

  // Columnas con acciones inyectadas
  const columnasConAcciones = getPeriodosColumns(handleSetActual);

  return (
    <CrudPage
      title="Gestión de Períodos Académicos"
      subtitle="Configuración de trimestres y años escolares - EduCore"
      addButtonText="Agregar Período"
      emptyMessage="No hay períodos registrados"
      loadingMessage="Cargando períodos..."

      data={periodos}
      loading={loading}
      error={error}
      stats={stats}

      columns={columnasConAcciones}
      searchFields={periodosSearchFields}

      isModalOpen={isModalOpen}
      modalTitle={selectedPeriodo ? 'Editar Período' : 'Nuevo Período'}
      formFields={getPeriodosFormFields(!!selectedPeriodo)}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting}

      onAdd={handleAddPeriodo}
      onEdit={handleEditPeriodo}
      onDelete={handleDeletePeriodo}
      onSave={handleSavePeriodo}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}
