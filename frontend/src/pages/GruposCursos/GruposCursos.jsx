import { useState, useEffect } from 'react';
import { theme } from '../../styles';
import grupoCursoService from '../../services/grupoCursoService';
import cursoService from '../../services/cursoService';
import docenteService from '../../services/docenteService';
import aulaService from '../../services/aulaService';
import periodoService from '../../services/periodoService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { usePeriodos } from '../../hooks/usePeriodos';
import { MySwal, Toast } from '../../utils/alerts';
import {
  gruposCursosColumns,
  gruposCursosSearchFields,
  getGruposCursosFormFields,
  gruposCursosValidationRules,
  getInitialGrupoCursoFormData,
  formatGrupoCursoForForm,
  formatGrupoCursoDataForAPI,
} from './gruposCursosConfig';

import { Layers, CheckCircle, Users, AlertTriangle } from 'lucide-react';

export default function GruposCursos() {
  const { 
    data: gruposCursos, 
    loading, 
    error, 
    create, 
    update,
    fetchAll,
  } = useCrud(grupoCursoService);

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(gruposCursosValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedGrupoCurso, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  const { periodos, periodoActual, loading: loadingPeriodos } = usePeriodos();

  const [formData, setFormData] = useState(getInitialGrupoCursoFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  const [showFormFields, setShowFormFields] = useState(false);
  const [gradoSeleccionado, setGradoSeleccionado] = useState(null);

  // Cargar listas relacionadas
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        setLoadingRelated(true);
        const [cursosData, docentesData, aulasData] = await Promise.all([
          cursoService.getAll(),
          docenteService.getAll(),
          aulaService.getAll(),
        ]);

        setCursos(cursosData.filter(c => c.activo));
        setDocentes(docentesData.filter(d => d.activo));
        setAulas(aulasData.filter(a => a.activo));
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedData();
  }, []);

  // Auto-seleccionar período actual cuando cargue
  useEffect(() => {
    if (periodoActual && !formData.periodoId && !selectedGrupoCurso) {
      setFormData(prev => ({ 
        ...prev, 
        periodoId: periodoActual.id,
        anio: new Date(periodoActual.fechaInicio).getFullYear()
      }));
    }
  }, [periodoActual, selectedGrupoCurso]);

  // Estadísticas
  const totalGrupos = gruposCursos.length;
  const gruposActivos = gruposCursos.filter(g => g.activo).length;
  const totalEstudiantes = gruposCursos.reduce((sum, g) => sum + (g.cantidadEstudiantes || 0), 0);
  const gruposCompletos = gruposCursos.filter(g => g.cantidadEstudiantes >= g.capacidadMaxima).length;

  const stats = [
    {
      label: 'Total Grupos',
      value: totalGrupos,
      color: theme.colors.accent,
      icon: <Layers size={28} />
    },
    {
      label: 'Activos',
      value: gruposActivos,
      color: theme.colors.success,
      icon: <CheckCircle size={28} />
    },
    {
      label: 'Total Estudiantes',
      value: totalEstudiantes,
      color: theme.colors.info,
      icon: <Users size={28} />
    },
    {
      label: 'Grupos Llenos',
      value: gruposCompletos,
      color: theme.colors.error,
      icon: <AlertTriangle size={28} />
    },
  ];

  // Crear
  const handleAddGrupoCurso = () => {
    if (loadingRelated || loadingPeriodos) {
      Toast.fire({ title: 'Cargando datos...' });
      return;
    }
    
    const initialData = getInitialGrupoCursoFormData();
    
    // Auto-seleccionar período actual
    if (periodoActual) {
      initialData.periodoId = periodoActual.id;
      initialData.anio = new Date(periodoActual.fechaInicio).getFullYear();
    }
    
    setFormData(initialData);
    setShowFormFields(false);
    setGradoSeleccionado(null);
    clearAllErrors();
    openModal(null);
  };

  // Editar
  const handleEditGrupoCurso = (grupoCurso) => {
    if (loadingRelated || loadingPeriodos) {
      Toast.fire({ title: 'Cargando datos...' });
      return;
    }
    
    const formattedData = formatGrupoCursoForForm(grupoCurso);
    
    // FIX: Si viene periodoId, usarlo; si no, buscarlo por nombre
    if (formattedData.periodoId) {
      // Ya tiene periodoId, usarlo directamente
      setFormData(formattedData);
    } else if (grupoCurso.periodo) {
      // Buscar periodoId por nombre usando el helper del hook
      const periodo = periodos.find(p => p.nombre === grupoCurso.periodo);
      if (periodo) {
        formattedData.periodoId = periodo.id;
        setFormData(formattedData);
      } else {
        console.warn(`No se encontró período con nombre: ${grupoCurso.periodo}`);
        setFormData(formattedData);
      }
    } else {
      setFormData(formattedData);
    }
    
    setShowFormFields(true);
    setGradoSeleccionado(grupoCurso.grado);
    clearAllErrors();
    openModal(grupoCurso);
  };

  // Cambios en inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Manejo del cambio de período
    if (name === 'periodoId' && value) {
      const periodoSel = periodos.find(p => p.id === parseInt(value));
      if (periodoSel) {
        setFormData(prev => ({
          ...prev,
          periodoId: parseInt(value),
          anio: new Date(periodoSel.fechaInicio).getFullYear()
        }));
        return;
      }
    }

    // ← FIX: Selección de aula → auto-completar datos CON periodoId correcto
    if (name === 'aulaId' && value) {
      const aulaSel = aulas.find(a => a.id === parseInt(value));
      if (aulaSel) {
        // Buscar el periodoId basado en el nombre del periodo del aula
        const periodo = periodos.find(p => p.nombre === aulaSel.periodo);
        const periodoId = periodo ? periodo.id : null;
        
        console.log('Aula seleccionada:', aulaSel);
        console.log('Periodo del aula:', aulaSel.periodo);
        console.log('PeriodoId encontrado:', periodoId);
        
        if (!periodoId) {
          Toast.fire({ 
            icon: 'warning', 
            title: `No se encontró el período "${aulaSel.periodo}"` 
          });
        }
        
        setFormData(prev => ({
          ...prev,
          aulaId: parseInt(value),
          grado: aulaSel.grado,
          seccion: aulaSel.seccion,
          anio: aulaSel.anio,
          periodoId: periodoId, // ← FIX: Ahora usa el periodoId correcto
          aula: aulaSel.aulaFisica || '',
          capacidadMaxima: aulaSel.capacidadMaxima || 30,
          cursoId: '',
          codigo: ''
        }));

        setGradoSeleccionado(aulaSel.grado);
        setShowFormFields(true);
        return;
      }
    }

    // Selección de curso → autogenerar código
    if (name === 'cursoId' && value) {
      const cursoSel = cursos.find(c => c.id === parseInt(value));
      const grado = formData.grado;
      const seccion = formData.seccion;

      if (cursoSel && grado && seccion) {
        const codigo = `${grado}${seccion.toUpperCase()}-${cursoSel.codigo}`;
        setFormData(prev => ({ ...prev, cursoId: parseInt(value), codigo }));
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (formErrors[name]) clearError(name);
  };

  // Guardar
  const handleSaveGrupoCurso = async () => {
    // FIX: Validación adicional del periodoId antes de guardar
    if (!formData.periodoId) {
      Toast.fire({ 
        icon: 'error', 
        title: 'Debes seleccionar un período' 
      });
      return;
    }
    
    if (!validate(formData)) return;

    setIsSubmitting(true);

    try {
      const data = formatGrupoCursoDataForAPI(formData);
      
      console.log('Datos a enviar:', data); // ← Para debug

      if (selectedGrupoCurso) {
        await update(selectedGrupoCurso.id, data);
      } else {
        await create(data);
      }

      closeModal();
      setFormData(getInitialGrupoCursoFormData());
      fetchAll();
    } catch (error) {
      console.error('Error al guardar:', error);
      Toast.fire({ 
        icon: 'error', 
        title: error.response?.data?.message || 'Error al guardar el grupo' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Activar/Desactivar
  const handleToggleStatus = async (grupo) => {
    const action = grupo.activo ? 'desactivar' : 'activar';
    const actionPast = grupo.activo ? 'desactivado' : 'activado';

    const result = await MySwal.fire({
      title: `¿Deseas ${action} este grupo?`,
      text: grupo.codigo,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#6B7280',
    });

    if (!result.isConfirmed) return;

    try {
      const updated = { ...grupo, activo: !grupo.activo };
      await grupoCursoService.update(grupo.id, updated);

      Toast.fire({ icon: 'success', title: `Grupo ${actionPast}` });
      fetchAll();
    } catch {
      Toast.fire({ icon: 'error', title: `Error al ${action} grupo` });
    }
  };

  // Cancelar modal
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialGrupoCursoFormData());
      setShowFormFields(false);
      setGradoSeleccionado(null);
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
      title="Gestión de Secciones Académicas"
      subtitle="Asignación de cursos por grado y sección - EduCore"
      addButtonText="Agregar Sección"
      emptyMessage="No hay grupos registrados"
      loadingMessage="Cargando grupos..."

      data={gruposCursos}
      loading={loading}
      error={error}
      stats={stats}

      columns={gruposCursosColumns}
      searchFields={gruposCursosSearchFields}

      isModalOpen={isModalOpen}
      modalTitle={selectedGrupoCurso ? 'Editar Grupo-Curso' : 'Nuevo Grupo-Curso'}
      formFields={getGruposCursosFormFields(
        !!selectedGrupoCurso,
        cursos,
        docentes,
        aulas,
        periodos,
        showFormFields,
        gradoSeleccionado
      )}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting || loadingRelated || loadingPeriodos}

      onAdd={handleAddGrupoCurso}
      onEdit={handleEditGrupoCurso}
      onDelete={handleToggleStatus}
      onSave={handleSaveGrupoCurso}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}
