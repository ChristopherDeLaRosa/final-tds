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

export default function Students() {
  // Custom Hooks
  const { 
    data: estudiantes, 
    loading, 
    error, 
    create, 
    update, 
    remove,
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

  // Estados del formulario
  const [formData, setFormData] = useState(getInitialStudentFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para aulas disponibles
  const [aulas, setAulas] = useState([]);
  const [aulasLoading, setAulasLoading] = useState(false);

  // Cargar aulas disponibles al montar el componente
  useEffect(() => {
    const loadAulas = async () => {
      try {
        setAulasLoading(true);
        const aulasData = await aulaService.getAll();
        setAulas(aulasData);
      } catch (error) {
        console.error('Error al cargar aulas:', error);
        Toast.fire({
          icon: 'warning',
          title: 'No se pudieron cargar las aulas disponibles',
        });
      } finally {
        setAulasLoading(false);
      }
    };
    loadAulas();
  }, []);

  // Calcular estadísticas
  const totalEstudiantes = estudiantes.length;
  const estudiantesActivos = estudiantes.filter(e => e.activo).length;
  const estudiantesInactivos = estudiantes.filter(e => !e.activo).length;
  
  // Agrupar por grado
  const porGrado = estudiantes.reduce((acc, est) => {
    const grado = est.gradoActual;
    acc[grado] = (acc[grado] || 0) + 1;
    return acc;
  }, {});
  
  const gradoConMasEstudiantes = Object.entries(porGrado)
    .sort((a, b) => b[1] - a[1])[0];

  const stats = [
    {
      label: 'Total Estudiantes',
      value: totalEstudiantes,
      color: theme.colors.accent,
    },
    {
      label: 'Estudiantes Activos',
      value: estudiantesActivos,
      color: '#10b981',
    },
    {
      label: 'Estudiantes Inactivos',
      value: estudiantesInactivos,
      color: '#ef4444',
    },
    {
      label: gradoConMasEstudiantes ? `Grado ${gradoConMasEstudiantes[0]}°` : 'Sin datos',
      value: gradoConMasEstudiantes ? gradoConMasEstudiantes[1] : 0,
      color: '#8b5cf6',
    },
  ];

  // Filtrar aulas según grado y sección seleccionados
  const getAulasOptions = () => {
    const baseOption = { value: '', label: 'Sin asignar - Asignar después' };
    
    if (!formData.gradoActual || !formData.seccionActual) {
      return [baseOption];
    }

    const aulasCompatibles = aulas
      .filter(a => 
        a.grado === parseInt(formData.gradoActual) &&
        a.seccion === formData.seccionActual &&
        a.activo
      )
      .map(a => ({
        value: a.id,
        label: `${a.periodo} (${a.anio}) - ${a.cuposDisponibles || 0} cupos disponibles`
      }));

    if (aulasCompatibles.length === 0) {
      return [
        baseOption,
        { 
          value: '', 
          label: `No hay aulas disponibles para ${formData.gradoActual}° ${formData.seccionActual}`,
          disabled: true 
        }
      ];
    }

    return [baseOption, ...aulasCompatibles];
  };

  // Actualizar formFields dinámicamente con las aulas
  const formFieldsWithAulas = getStudentsFormFields(!!selectedEstudiante).map(field => {
    if (Array.isArray(field)) {
      return field.map(f => {
        if (f.name === 'aulaId') {
          return { 
            ...f, 
            options: getAulasOptions(),
            disabled: aulasLoading || (!formData.gradoActual || !formData.seccionActual)
          };
        }
        return f;
      });
    }
    
    if (field.name === 'aulaId') {
      return { 
        ...field, 
        options: getAulasOptions(),
        disabled: aulasLoading || (!formData.gradoActual || !formData.seccionActual)
      };
    }
    
    return field;
  });

  // Handler para abrir modal de crear
  const handleAddStudent = () => {
    setFormData(getInitialStudentFormData());
    clearAllErrors();
    openModal(null);
  };

  // Handler para abrir modal de editar
  const handleEditStudent = (estudiante) => {
    setFormData(formatStudentForForm(estudiante));
    clearAllErrors();
    openModal(estudiante);
  };

  // Handler para cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // Si cambia el grado o sección, resetear el aulaId
      if (name === 'gradoActual' || name === 'seccionActual') {
        newData.aulaId = '';
      }

      return newData;
    });
    
    // Limpiar error del campo cuando el usuario escribe
    if (formErrors[name]) {
      clearError(name);
    }
  };

  // Handler para guardar estudiante
  const handleSaveStudent = async () => {
    if (!validate(formData)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = formatStudentDataForAPI(formData);

      if (selectedEstudiante) {
        // Actualizar estudiante existente
        await update(selectedEstudiante.id, dataToSend);
      } else {
        // Verificar si la matrícula ya existe
        const matriculaExists = await estudianteService.matriculaExists(dataToSend.matricula);
        if (matriculaExists) {
          Toast.fire({
            icon: 'error',
            title: 'La matrícula ya existe',
          });
          setIsSubmitting(false);
          return;
        }

        // Crear nuevo estudiante
        const nuevoEstudiante = await create(dataToSend);

        // Si se seleccionó un aula, asignar el estudiante
        if (formData.aulaId && nuevoEstudiante?.id) {
          try {
            await aulaService.asignarEstudiante(formData.aulaId, nuevoEstudiante.id);
            Toast.fire({
              icon: 'success',
              title: 'Estudiante creado y asignado al aula',
            });
          } catch (err) {
            console.error('Error al asignar a aula:', err);
            Toast.fire({
              icon: 'warning',
              title: 'Estudiante creado pero no se pudo asignar al aula',
            });
          }
        }
      }
      
      closeModal();
      setFormData(getInitialStudentFormData());
      await fetchAll(); // Recargar lista
      
    } catch (err) {
      console.error('Error saving estudiante:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para eliminar estudiante
  const handleDeleteStudent = async (estudiante) => {
    const nombre = estudiante?.nombreCompleto || 
                   `${estudiante?.nombres} ${estudiante?.apellidos}` || 
                   'este estudiante';
    
    await remove(estudiante.id, nombre);
  };

  // Handler para cerrar modal
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialStudentFormData());
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
      title="Gestión de Estudiantes"
      subtitle="Sistema de registro escolar - EduCore"
      addButtonText="Agregar Estudiante"
      emptyMessage="No hay estudiantes registrados. ¡Agrega el primero!"
      loadingMessage="Cargando estudiantes..."
      
      // Datos
      data={estudiantes}
      loading={loading}
      error={error}
      stats={stats}
      
      // Tabla
      columns={studentsColumns}
      searchFields={studentsSearchFields}
      
      // Modal
      isModalOpen={isModalOpen}
      modalTitle={selectedEstudiante ? 'Editar Estudiante' : 'Nuevo Estudiante'}
      formFields={formFieldsWithAulas}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting}
      
      // Handlers
      onAdd={handleAddStudent}
      onEdit={handleEditStudent}
      onDelete={handleDeleteStudent}
      onSave={handleSaveStudent}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}