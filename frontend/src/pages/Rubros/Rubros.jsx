import { useState, useEffect } from 'react';
import { theme } from '../../styles';
import rubroService from '../../services/rubroService';
import grupoCursoService from '../../services/grupoCursoService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  rubrosColumns,
  rubrosSearchFields,
  getRubrosFormFields,
  rubrosValidationRules,
  getInitialRubroFormData,
  formatRubroForForm,
  formatRubroDataForAPI,
} from './rubrosConfig';

export default function Rubros() {
  const { 
    data: rubros, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    fetchAll,
  } = useCrud(rubroService);

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(rubrosValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedRubro, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  const [formData, setFormData] = useState(getInitialRubroFormData());
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

  const rubrosEnriquecidos = rubros.map(r => {
    const grupo = gruposCursos.find(g => g.id === r.grupoCursoId);
    return {
      ...r,
      nombreCurso: grupo ? grupo.nombreCurso : 'Sin curso',
      grado: grupo ? grupo.grado : 0,
      seccion: grupo ? grupo.seccion : '',
    };
  });

  const totalRubros = rubrosEnriquecidos.length;
  const rubrosActivos = rubrosEnriquecidos.filter(r => r.activo).length;
  const porcentajeTotal = rubrosEnriquecidos
    .filter(r => r.activo)
    .reduce((sum, r) => sum + (r.porcentaje || 0), 0);
  
  const rubrosPorGrupo = rubrosEnriquecidos.reduce((acc, r) => {
    if (!acc[r.grupoCursoId]) {
      acc[r.grupoCursoId] = [];
    }
    acc[r.grupoCursoId].push(r);
    return acc;
  }, {});
  
  const gruposCompletos = Object.values(rubrosPorGrupo).filter(rubrosGrupo => {
    const totalPorcentaje = rubrosGrupo
      .filter(r => r.activo)
      .reduce((sum, r) => sum + (r.porcentaje || 0), 0);
    return Math.abs(totalPorcentaje - 100) < 0.01;
  }).length;

  const stats = [
    {
      label: 'Total Rubros',
      value: totalRubros,
      color: theme.colors.accent,
    },
    {
      label: 'Rubros Activos',
      value: rubrosActivos,
      color: '#10b981',
    },
    {
      label: 'Grupos Completos (100%)',
      value: gruposCompletos,
      color: '#3b82f6',
    },
    {
      label: 'Grupos-Cursos',
      value: gruposCursos.length,
      color: '#8b5cf6',
    },
  ];

  const handleAddRubro = () => {
    if (loadingRelated) {
      Toast.fire({
        icon: 'warning',
        title: 'Cargando grupos-cursos...',
      });
      return;
    }
    
    if (gruposCursos.length === 0) {
      Toast.fire({
        icon: 'warning',
        title: 'No hay grupos-cursos disponibles',
        text: 'Primero debes crear grupos-cursos',
      });
      return;
    }
    
    setFormData(getInitialRubroFormData());
    clearAllErrors();
    openModal(null);
  };

  const handleEditRubro = (rubro) => {
    if (loadingRelated) {
      Toast.fire({
        icon: 'warning',
        title: 'Cargando grupos-cursos...',
      });
      return;
    }
    setFormData(formatRubroForForm(rubro));
    clearAllErrors();
    openModal(rubro);
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

  const handleSaveRubro = async () => {
    if (!validate(formData)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = formatRubroDataForAPI(formData);

      const rubrosDelGrupo = rubrosEnriquecidos.filter(
        r => r.grupoCursoId === dataToSend.grupoCursoId && 
             r.activo && 
             (!selectedRubro || r.id !== selectedRubro.id)
      );
      
      const totalPorcentaje = rubrosDelGrupo.reduce((sum, r) => sum + (r.porcentaje || 0), 0);
      const nuevoTotal = totalPorcentaje + dataToSend.porcentaje;
      
      if (nuevoTotal > 100) {
        Toast.fire({
          icon: 'error',
          title: 'El total de porcentajes excede 100%',
          text: `Total actual: ${totalPorcentaje.toFixed(2)}% + Nuevo: ${dataToSend.porcentaje}% = ${nuevoTotal.toFixed(2)}%`,
        });
        setIsSubmitting(false);
        return;
      }

      if (selectedRubro) {
        await update(selectedRubro.id, dataToSend);
      } else {
        await create(dataToSend);
      }
      
      if (Math.abs(nuevoTotal - 100) > 0.01) {
        Toast.fire({
          icon: 'warning',
          title: 'Rubro guardado',
          text: `Total de porcentajes: ${nuevoTotal.toFixed(2)}% (falta ${(100 - nuevoTotal).toFixed(2)}%)`,
        });
      }
      
      closeModal();
      setFormData(getInitialRubroFormData());
    } catch (err) {
      console.error('Error saving rubro:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRubro = async (rubro) => {
    const nombre = `${rubro.nombre} - ${rubro.nombreCurso}`;
    await remove(rubro.id, nombre);
  };

  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialRubroFormData());
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
      title="Gestión de Rubros"
      subtitle="Componentes de evaluación - EduCore"
      addButtonText="Agregar Rubro"
      emptyMessage="No hay rubros registrados. ¡Agrega el primero!"
      loadingMessage="Cargando rubros..."
      data={rubrosEnriquecidos}
      loading={loading}
      error={error}
      stats={stats}
      columns={rubrosColumns}
      searchFields={rubrosSearchFields}
      isModalOpen={isModalOpen}
      modalTitle={selectedRubro ? 'Editar Rubro' : 'Nuevo Rubro'}
      formFields={getRubrosFormFields(!!selectedRubro, gruposCursos)}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting || loadingRelated}
      onAdd={handleAddRubro}
      onEdit={handleEditRubro}
      onDelete={handleDeleteRubro}
      onSave={handleSaveRubro}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}

