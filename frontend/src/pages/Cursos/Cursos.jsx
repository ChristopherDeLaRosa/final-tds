import { useState } from 'react';
import { theme } from '../../styles';
import cursoService from '../../services/cursoService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  cursosColumns,
  cursosSearchFields,
  getCursosFormFields,
  cursosValidationRules,
  getInitialCursoFormData,
  formatCursoForForm,
  formatCursoDataForAPI,
} from './cursosConfig';

import { BookOpen, CheckCircle, Layers, GraduationCap } from 'lucide-react';

export default function Cursos() {
  const { 
    data: cursos, 
    loading, 
    error, 
    create, 
    update,
    fetchAll,
  } = useCrud(cursoService);

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(cursosValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedCurso, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  const [formData, setFormData] = useState(getInitialCursoFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estadísticas
  const totalCursos = cursos.length;
  const cursosActivos = cursos.filter(c => c.activo).length;
  const totalPrimaria = cursos.filter(c => c.nivel === 'Primaria').length;
  const totalSecundaria = cursos.filter(c => c.nivel === 'Secundaria').length;

  const stats = [
    {
      label: 'Total Cursos',
      value: totalCursos,
      color: theme.colors.accent,
      icon: <BookOpen size={28} />,
    },
    {
      label: 'Activos',
      value: cursosActivos,
      color: theme.colors.success,
      icon: <CheckCircle size={28} />,
    },
    {
      label: 'Primaria',
      value: totalPrimaria,
      color: theme.colors.info,
      icon: <Layers size={28} />,
    },
    {
      label: 'Secundaria',
      value: totalSecundaria,
      color: '#8b5cf6',
      icon: <GraduationCap size={28} />,
    },
  ];

  // Crear
  const handleAddCurso = () => {
    setFormData(getInitialCursoFormData());
    clearAllErrors();
    openModal(null);
  };

  // Editar
  const handleEditCurso = (curso) => {
    setFormData(formatCursoForForm(curso));
    clearAllErrors();
    openModal(curso);
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
  const handleSaveCurso = async () => {
    if (!validate(formData)) return;

    setIsSubmitting(true);

    try {
      const dataToSend = formatCursoDataForAPI(formData);

      if (selectedCurso) {
        await update(selectedCurso.id, dataToSend);
      } else {
        const exists = await cursoService.codigoExists(dataToSend.codigo);
        if (exists) {
          Toast.fire({ icon: 'error', title: 'El código ya existe' });
          setIsSubmitting(false);
          return;
        }
        await create(dataToSend);
      }

      closeModal();
      setFormData(getInitialCursoFormData());
      fetchAll();

    } finally {
      setIsSubmitting(false);
    }
  };

  // Activar / Desactivar (misma lógica que Docentes y Students)
  const handleToggleStatus = async (curso) => {
    const action = curso.activo ? 'desactivar' : 'activar';
    const actionPast = curso.activo ? 'desactivado' : 'activado';

    const result = await MySwal.fire({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} curso?`,
      text: `¿Confirmas que deseas ${action} "${curso.nombre}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#6B7280',
    });

    if (!result.isConfirmed) return;

    try {
      const updatedData = { ...curso, activo: !curso.activo };

      await cursoService.update(curso.id, updatedData);

      Toast.fire({
        icon: 'success',
        title: `Curso ${actionPast} correctamente`,
      });

      fetchAll();

    } catch {
      Toast.fire({
        icon: 'error',
        title: `Error al ${action} curso`,
      });
    }
  };

  // Cancelar modal
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialCursoFormData());
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

  return (
    <CrudPage
      title="Gestión de Cursos"
      subtitle="Catálogo de materias - Zirak"
      addButtonText="Agregar Curso"
      emptyMessage="No hay cursos registrados. Agrega uno nuevo."
      loadingMessage="Cargando cursos..."

      data={cursos}
      loading={loading}
      error={error}
      stats={stats}

      columns={cursosColumns}
      searchFields={cursosSearchFields}

      isModalOpen={isModalOpen}
      modalTitle={selectedCurso ? 'Editar Curso' : 'Nuevo Curso'}
      formFields={getCursosFormFields(!!selectedCurso)}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting}

      onAdd={handleAddCurso}
      onEdit={handleEditCurso}
      onDelete={handleToggleStatus}
      onSave={handleSaveCurso}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}

