import { useState, useEffect } from 'react';
import { theme } from '../../styles';
import grupoCursoService from '../../services/grupoCursoService';
import cursoService from '../../services/cursoService';
import docenteService from '../../services/docenteService';
import aulaService from '../../services/aulaService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
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
    if (loadingRelated) {
      Toast.fire({ title: 'Cargando datos...' });
      return;
    }
    setFormData(getInitialGrupoCursoFormData());
    setShowFormFields(false);
    setGradoSeleccionado(null);
    clearAllErrors();
    openModal(null);
  };

  // Editar
  const handleEditGrupoCurso = (grupoCurso) => {
    if (loadingRelated) {
      Toast.fire({ title: 'Cargando datos...' });
      return;
    }
    setFormData(formatGrupoCursoForForm(grupoCurso));
    setShowFormFields(true);
    setGradoSeleccionado(grupoCurso.grado);
    clearAllErrors();
    openModal(grupoCurso);
  };

  // Cambios en inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Selección de aula → auto-completar datos
    if (name === 'aulaId' && value) {
      const aulaSel = aulas.find(a => a.id === parseInt(value));
      if (aulaSel) {
        setFormData(prev => ({
          ...prev,
          aulaId: value,
          grado: aulaSel.grado,
          seccion: aulaSel.seccion,
          anio: aulaSel.anio,
          periodo: aulaSel.periodo,
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
        setFormData(prev => ({ ...prev, cursoId: value, codigo }));
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
    if (!validate(formData)) return;

    setIsSubmitting(true);

    try {
      const data = formatGrupoCursoDataForAPI(formData);

      if (selectedGrupoCurso) {
        await update(selectedGrupoCurso.id, data);
      } else {
        await create(data);
      }

      closeModal();
      setFormData(getInitialGrupoCursoFormData());
      fetchAll();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Activar/Desactivar (misma lógica del resto del sistema)
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
        showFormFields,
        gradoSeleccionado
      )}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting || loadingRelated}

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
