import { useState, useEffect } from 'react';
import { theme } from '../../styles';
import estudianteService from '../../services/estudianteService';
import aulaService from '../../services/aulaService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  studentsColumns,
  studentsSearchFields,
  getStudentsFormFields,
  studentsValidationRules,
  getInitialStudentFormData,
  formatStudentForForm,
  formatStudentDataForAPI,
} from './studentsConfig';

import { Users, UserCheck, UserX, GraduationCap } from 'lucide-react';

export default function Students() {
  const { 
    data: estudiantes, 
    loading, 
    error, 
    create, 
    update,
    fetchAll,
  } = useCrud(estudianteService);

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(studentsValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedEstudiante, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  const [formData, setFormData] = useState(getInitialStudentFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [aulas, setAulas] = useState([]);
  const [aulasLoading, setAulasLoading] = useState(false);

  useEffect(() => {
    const loadAulas = async () => {
      try {
        setAulasLoading(true);
        const aulasData = await aulaService.getAll();
        setAulas(aulasData);
      } finally {
        setAulasLoading(false);
      }
    };
    loadAulas();
  }, []);

  const totalEstudiantes = estudiantes.length;
  const estudiantesActivos = estudiantes.filter(e => e.activo).length;
  const estudiantesInactivos = totalEstudiantes - estudiantesActivos;
  const totalTutores = estudiantes.filter(e => !!e.nombreTutor).length;

  const stats = [
    {
      label: 'Total Estudiantes',
      value: totalEstudiantes,
      color: theme.colors.accent,
      icon: <Users size={28} />,
    },
    {
      label: 'Activos',
      value: estudiantesActivos,
      color: theme.colors.success,
      icon: <UserCheck size={28} />,
    },
    {
      label: 'Inactivos',
      value: estudiantesInactivos,
      color: theme.colors.error,
      icon: <UserX size={28} />,
    },
    {
      label: 'Con Tutor Registrado',
      value: totalTutores,
      color: '#8b5cf6',
      icon: <GraduationCap size={28} />,
    },
  ];

  const getAulasOptions = () => {
    const base = [{ value: '', label: 'Sin asignar - Asignar después' }];
    if (!formData.gradoActual || !formData.seccionActual) return base;

    const compatibles = aulas
      .filter(a =>
        a.grado === parseInt(formData.gradoActual) &&
        a.seccion === formData.seccionActual &&
        a.activo
      )
      .map(a => ({
        value: a.id,
        label: `${a.periodo} (${a.anio}) - ${a.cuposDisponibles} cupos`
      }));

    return compatibles.length ? [...base, ...compatibles] : [
      base[0],
      { value: '', label: 'No hay aulas disponibles', disabled: true }
    ];
  };

  const formFieldsWithAulas = getStudentsFormFields(!!selectedEstudiante).map(field => {
    if (Array.isArray(field)) {
      return field.map(inner =>
        inner.name === 'aulaId'
          ? { ...inner, options: getAulasOptions(), disabled: aulasLoading }
          : inner
      );
    }
    if (field.name === 'aulaId') {
      return { ...field, options: getAulasOptions(), disabled: aulasLoading };
    }
    return field;
  });

  const handleAddStudent = () => {
    setFormData(getInitialStudentFormData());
    clearAllErrors();
    openModal(null);
  };

  const handleEditStudent = (estudiante) => {
    setFormData(formatStudentForForm(estudiante));
    clearAllErrors();
    openModal(estudiante);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'gradoActual' || name === 'seccionActual') {
      setFormData(prev => ({ ...prev, aulaId: '' }));
    }

    if (formErrors[name]) clearError(name);
  };

  const handleSaveStudent = async () => {
    if (!validate(formData)) return;
    setIsSubmitting(true);

    try {
      const dataToSend = formatStudentDataForAPI(formData);

      if (selectedEstudiante) {
        await update(selectedEstudiante.id, dataToSend);
      } else {
        const exists = await estudianteService.matriculaExists(dataToSend.matricula);
        if (exists) {
          Toast.fire({ icon: 'error', title: 'La matrícula ya existe' });
          setIsSubmitting(false);
          return;
        }

        const nuevo = await create(dataToSend);

        if (formData.aulaId && nuevo?.id) {
          try {
            await aulaService.asignarEstudiante(formData.aulaId, nuevo.id);
          } catch {
            Toast.fire({
              icon: 'warning',
              title: 'Estudiante creado pero no se pudo asignar al aula',
            });
          }
        }
      }

      closeModal();
      setFormData(getInitialStudentFormData());
      await fetchAll();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (estudiante) => {
    const action = estudiante.activo ? 'desactivar' : 'activar';
    const actionPast = estudiante.activo ? 'desactivado' : 'activado';

    const result = await MySwal.fire({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} estudiante?`,
      text: `¿Está seguro de ${action} a ${estudiante.nombreCompleto}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#6B7280',
    });

    if (!result.isConfirmed) return;

    try {
      const updatedData = {
        ...estudiante,
        activo: !estudiante.activo,
      };

      await estudianteService.update(estudiante.id, updatedData);

      Toast.fire({
        icon: 'success',
        title: `Estudiante ${actionPast} exitosamente`,
      });

      fetchAll();
    } catch {
      Toast.fire({
        icon: 'error',
        title: `Error al ${action} estudiante`,
      });
    }
  };

  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialStudentFormData());
      clearAllErrors();
    }
  };

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
      MySwal.fire({
        icon: 'error',
        title: 'No se pudo recargar',
      });
    }
  };

  return (
    <CrudPage
      title="Gestión de Estudiantes"
      subtitle="Sistema de registro escolar - EduCore"
      addButtonText="Agregar Estudiante"
      emptyMessage="No hay estudiantes registrados. ¡Agrega el primero!"
      loadingMessage="Cargando estudiantes..."

      data={estudiantes}
      loading={loading}
      error={error}
      stats={stats}

      columns={studentsColumns}
      searchFields={studentsSearchFields}

      isModalOpen={isModalOpen}
      modalTitle={selectedEstudiante ? 'Editar Estudiante' : 'Nuevo Estudiante'}
      formFields={formFieldsWithAulas}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting}

      onAdd={handleAddStudent}
      onEdit={handleEditStudent}
      onDelete={handleToggleStatus}
      onSave={handleSaveStudent}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}

