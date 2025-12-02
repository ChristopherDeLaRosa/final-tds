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

export default function GruposCursos() {
  const { 
    data: gruposCursos, 
    loading, 
    error, 
    create, 
    update, 
    remove,
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
  const [showFormFields, setShowFormFields] = useState(false);
  const [gradoSeleccionado, setGradoSeleccionado] = useState(null);

  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // -----------------------------------------------------------------------------
  // Cargar cursos, docentes y aulas
  // -----------------------------------------------------------------------------
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
      } catch (err) {
        console.error('Error al cargar datos relacionados:', err);
        Toast.fire({
          title: 'Error al cargar cursos, docentes y aulas',
        });
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedData();
  }, []);

  // -----------------------------------------------------------------------------
  // Estadísticas dashboard
  // -----------------------------------------------------------------------------
  const totalGrupos = gruposCursos.length;
  const gruposActivos = gruposCursos.filter(g => g.activo).length;
  const totalEstudiantes = gruposCursos.reduce((sum, g) => sum + (g.cantidadEstudiantes || 0), 0);
  const gruposCompletos = gruposCursos.filter(g => g.cantidadEstudiantes >= g.capacidadMaxima).length;

  const stats = [
    { label: 'Total Grupos', value: totalGrupos, color: theme.colors.accent },
    { label: 'Grupos Activos', value: gruposActivos, color: '#10b981' },
    { label: 'Total Estudiantes', value: totalEstudiantes, color: '#3b82f6' },
    { label: 'Grupos Llenos', value: gruposCompletos, color: '#ef4444' },
  ];

  // -----------------------------------------------------------------------------
  // Abrir modal crear
  // -----------------------------------------------------------------------------
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

  // -----------------------------------------------------------------------------
  // Abrir modal editar
  // -----------------------------------------------------------------------------
  const handleEditGrupoCurso = (grupoCurso) => {
    if (loadingRelated) {
      Toast.fire({ title: 'Cargando datos...' });
      return;
    }
    setFormData(formatGrupoCursoForForm(grupoCurso));
    setShowFormFields(!!grupoCurso.aulaId);
    setGradoSeleccionado(grupoCurso.grado);
    clearAllErrors();
    openModal(grupoCurso);
  };

  // -----------------------------------------------------------------------------
  // AUTOGENERAR CÓDIGO (lógica completa)
  // -----------------------------------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // --- Cuando cambia el AULA ---
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
          codigo: '' // resetear código
        }));

        setGradoSeleccionado(aulaSel.grado);
        setShowFormFields(true);
        return;
      }
    }

    // ---AUTOGENERAR CÓDIGO CUANDO SE ELIGE CURSO ---
    if (name === 'cursoId' && value) {
      const cursoSel = cursos.find(c => c.id === parseInt(value));
      const grado = formData.grado;
      const seccion = formData.seccion;

      if (cursoSel && grado && seccion) {
        const codigoGenerado = `${grado}${seccion.toUpperCase()}-${cursoSel.codigo}`;

        setFormData(prev => ({
          ...prev,
          cursoId: value,
          codigo: codigoGenerado
        }));

        return;
      }
    }

    // Default handler
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (formErrors[name]) {
      clearError(name);
    }
  };

  // -----------------------------------------------------------------------------
  // Guardar (crear / editar)
  // -----------------------------------------------------------------------------
  const handleSaveGrupoCurso = async () => {
    if (!validate(formData)) return;

    setIsSubmitting(true);

    try {
      const dataToSend = formatGrupoCursoDataForAPI(formData);

      if (selectedGrupoCurso) {
        await update(selectedGrupoCurso.id, dataToSend);
      } else {
        await create(dataToSend);
      }

      closeModal();
      setFormData(getInitialGrupoCursoFormData());
    } catch (err) {
      console.error('Error saving grupo-curso:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------------------------------------------------------------
  // Eliminar
  // -----------------------------------------------------------------------------
  const handleDeleteGrupoCurso = async (grupoCurso) => {
    await remove(grupoCurso.id, grupoCurso.codigo || 'este grupo');
  };

  // -----------------------------------------------------------------------------
  // Cancelar modal
  // -----------------------------------------------------------------------------
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialGrupoCursoFormData());
      setShowFormFields(false);
      setGradoSeleccionado(null);
      clearAllErrors();
    }
  };

  // -----------------------------------------------------------------------------
  // Reintentar cargar lista
  // -----------------------------------------------------------------------------
  const handleRetry = async () => {
    try {
      MySwal.fire({ title: 'Recargando...', didOpen: () => MySwal.showLoading() });
      await fetchAll();
      MySwal.close();
      Toast.fire({ title: 'Lista actualizada' });
    } catch {
      MySwal.close();
      MySwal.fire({ title: 'No se pudo recargar' });
    }
  };

  // -----------------------------------------------------------------------------
  // Render del componente CRUD
  // -----------------------------------------------------------------------------
  return (
    <CrudPage
      title="Gestión de Grupos-Cursos"
      subtitle="Asignación de cursos por grado y sección - EduCore"
      addButtonText="Agregar Grupo-Curso"
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
      onDelete={handleDeleteGrupoCurso}
      onSave={handleSaveGrupoCurso}
      onCancel={handleCancelModal}
      onInputChange={handleInputChange}
      onRetry={handleRetry}
    />
  );
}
