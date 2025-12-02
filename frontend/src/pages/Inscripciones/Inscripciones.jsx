import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ClipboardList, School } from 'lucide-react';
import { theme } from '../../styles';
import inscripcionService from '../../services/inscripcionService';
import estudianteService from '../../services/estudianteService';
import grupoCursoService from '../../services/grupoCursoService';
import CrudPage from '../../components/organisms/CrudPage/CrudPage';
import { useCrud } from '../../hooks/useCrud';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useModal } from '../../hooks/useModal';
import { MySwal, Toast } from '../../utils/alerts';
import {
  inscripcionesColumns,
  inscripcionesSearchFields,
  getInscripcionesFormFields,
  inscripcionesValidationRules,
  getInitialInscripcionFormData,
  formatInscripcionForForm,
  formatInscripcionDataForAPI,
} from './inscripcionesConfig';
import InscripcionMasivaTab from './InscripcionMasivaTab';

// Estilos para los tabs
const TabsContainer = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  margin-bottom: ${theme.spacing.lg};
  overflow: hidden;
`;

const TabsList = styled.div`
  display: flex;
  border-bottom: 2px solid ${theme.colors.border};
`;

const Tab = styled.button`
  flex: 1;
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: ${props => props.$active ? theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : theme.colors.textSecondary};
  border: none;
  font-weight: 600;
  font-size: ${theme.fontSize.md};
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};

  &:hover {
    background: ${props => props.$active ? theme.colors.primaryDark : theme.colors.primary}10;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => props.$active ? theme.colors.primary : 'transparent'};
  }
`;

const TabContent = styled.div`
  display: ${props => props.$active ? 'block' : 'none'};
`;

export default function Inscripciones() {
  // Estado para controlar el tab activo
  const [activeTab, setActiveTab] = useState('individual');

  // Custom Hooks - Deshabilitar fetch inicial automático
  const { 
    data: inscripciones, 
    loading, 
    error, 
    create, 
    update, 
    remove,
    setData: setInscripciones,
    setLoading,
    setError,
  } = useCrud(inscripcionService, { initialFetch: false });

  const { 
    errors: formErrors, 
    validate, 
    clearError, 
    clearAllErrors 
  } = useFormValidation(inscripcionesValidationRules);

  const { 
    isOpen: isModalOpen, 
    modalData: selectedInscripcion, 
    open: openModal, 
    close: closeModal 
  } = useModal();

  // Estados del formulario
  const [formData, setFormData] = useState(getInitialInscripcionFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para datos relacionados
  const [estudiantes, setEstudiantes] = useState([]);
  const [gruposCursos, setGruposCursos] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // Función para cargar inscripciones con filtros
  const fetchInscripciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await inscripcionService.getAll();
      setInscripciones(data);
    } catch (err) {
      console.error('Error al cargar inscripciones:', err);
      setError('Error al cargar inscripciones');
      Toast.fire({
        title: 'Error al cargar inscripciones',
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar inscripciones al montar
  useEffect(() => {
    fetchInscripciones();
  }, []);

  // Cargar estudiantes y grupos al montar el componente
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        setLoadingRelated(true);
        const [estudiantesData, gruposData] = await Promise.all([
          estudianteService.getAll(),
          grupoCursoService.getAll(),
        ]);
        
        setEstudiantes(estudiantesData.filter(e => e.activo));
        setGruposCursos(gruposData.filter(g => g.activo));
      } catch (err) {
        console.error('Error al cargar datos relacionados:', err);
        Toast.fire({
          title: 'Error al cargar estudiantes y grupos',
        });
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedData();
  }, []);

  // Calcular estadísticas
  const totalInscripciones = inscripciones.length;
  const inscripcionesActivas = inscripciones.filter(i => i.activo && i.estado === 'Activo').length;
  const estudiantesRetirados = inscripciones.filter(i => i.estado === 'Retirado').length;
  const cursosCompletados = inscripciones.filter(i => i.estado === 'Completado').length;

  const stats = [
    {
      label: 'Total Inscripciones',
      value: totalInscripciones,
      color: theme.colors.accent,
    },
    {
      label: 'Inscripciones Activas',
      value: inscripcionesActivas,
      color: '#10b981',
    },
    {
      label: 'Estudiantes Retirados',
      value: estudiantesRetirados,
      color: '#ef4444',
    },
    {
      label: 'Cursos Completados',
      value: cursosCompletados,
      color: '#3b82f6',
    },
  ];

  // Handler para abrir modal de crear
  const handleAddInscripcion = () => {
    if (loadingRelated) {
      Toast.fire({
        title: 'Cargando estudiantes y grupos...',
      });
      return;
    }
    setFormData(getInitialInscripcionFormData());
    clearAllErrors();
    openModal(null);
  };

  // Handler para abrir modal de editar
  const handleEditInscripcion = (inscripcion) => {
    if (loadingRelated) {
      Toast.fire({
        title: 'Cargando estudiantes y grupos...',
      });
      return;
    }
    setFormData(formatInscripcionForForm(inscripcion));
    clearAllErrors();
    openModal(inscripcion);
  };

  // Handler para cambios en el formulario
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

  // Handler para guardar inscripción
  const handleSaveInscripcion = async () => {
    if (!validate(formData)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = formatInscripcionDataForAPI(formData);

      if (selectedInscripcion) {
        await update(selectedInscripcion.id, dataToSend);
      } else {
        await create(dataToSend);
      }
      
      await fetchInscripciones();
      
      closeModal();
      setFormData(getInitialInscripcionFormData());
    } catch (err) {
      console.error('Error saving inscripción:', err);
      
      if (err.response?.data?.message?.includes('inscrito')) {
        Toast.fire({
          title: 'El estudiante ya está inscrito en este grupo',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para eliminar inscripción
  const handleDeleteInscripcion = async (inscripcion) => {
    const nombre = `${inscripcion.nombreEstudiante} - ${inscripcion.nombreCurso}`;
    const result = await remove(inscripcion.id, nombre);
    
    if (result) {
      await fetchInscripciones();
    }
  };

  // Handler para cerrar modal
  const handleCancelModal = () => {
    if (!isSubmitting) {
      closeModal();
      setFormData(getInitialInscripcionFormData());
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
      await fetchInscripciones();
      MySwal.close();
      Toast.fire({ title: 'Lista actualizada' });
    } catch {
      MySwal.close();
      MySwal.fire({
        title: 'No se pudo recargar',
        text: 'Verifica tu conexión.',
      });
    }
  };

  // Handler para cuando se completa la inscripción masiva
  const handleInscripcionMasivaCompleted = () => {
    fetchInscripciones();
  };

  return (
    <>
      <TabsContainer>
        <TabsList>
          <Tab 
            $active={activeTab === 'individual'} 
            onClick={() => setActiveTab('individual')}
          >
            <ClipboardList size={18} />
            Inscripciones Individuales
          </Tab>
          <Tab 
            $active={activeTab === 'masiva'} 
            onClick={() => setActiveTab('masiva')}
          >
            <School size={18} />
            Inscripción Masiva por Aula
          </Tab>
        </TabsList>
      </TabsContainer>

      <TabContent $active={activeTab === 'individual'}>
        <CrudPage
          title="Gestión de Inscripciones"
          subtitle="Matrícula de estudiantes en grupos-cursos - EduCore"
          addButtonText="Agregar Inscripción"
          emptyMessage="No hay inscripciones registradas. ¡Agrega la primera!"
          loadingMessage="Cargando inscripciones..."
          data={inscripciones}
          loading={loading}
          error={error}
          stats={stats}
          columns={inscripcionesColumns}
          searchFields={inscripcionesSearchFields}
          isModalOpen={isModalOpen}
          modalTitle={selectedInscripcion ? 'Editar Inscripción' : 'Nueva Inscripción'}
          formFields={getInscripcionesFormFields(!!selectedInscripcion, estudiantes, gruposCursos)}
          formData={formData}
          formErrors={formErrors}
          isSubmitting={isSubmitting || loadingRelated}
          onAdd={handleAddInscripcion}
          onEdit={handleEditInscripcion}
          onDelete={handleDeleteInscripcion}
          onSave={handleSaveInscripcion}
          onCancel={handleCancelModal}
          onInputChange={handleInputChange}
          onRetry={handleRetry}
        />
      </TabContent>

      <TabContent $active={activeTab === 'masiva'}>
        <InscripcionMasivaTab onInscripcionCompleted={handleInscripcionMasivaCompleted} />
      </TabContent>
    </>
  );
}

