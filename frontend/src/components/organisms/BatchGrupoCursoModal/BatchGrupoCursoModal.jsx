import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../../styles';
import { X, Plus, Check, AlertCircle, Loader } from 'lucide-react';
import { Toast, MySwal } from '../../../utils/alerts';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing.lg};
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: ${theme.shadows.xl};
`;

const ModalHeader = styled.div`
  padding: ${theme.spacing.xl};
  border-bottom: 2px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%);
`;

const Title = styled.h2`
  margin: 0;
  color: white;
  font-size: ${theme.fontSize.xl};
  font-weight: ${theme.fontWeight.bold};
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${theme.transition.normal};
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.xl};
  overflow-y: auto;
  flex: 1;
`;

const Section = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${theme.spacing.md};
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.lg};
  font-weight: ${theme.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSize.sm};
`;

const Select = styled.select`
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.md};
  transition: ${theme.transition.normal};
  background: white;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight};
  }

  &:disabled {
    background: ${theme.colors.backgroundAlt};
    cursor: not-allowed;
  }
`;

const InfoBox = styled.div`
  background: ${props => props.$type === 'error' 
    ? theme.colors.dangerLight 
    : theme.colors.infoLight};
  border: 2px solid ${props => props.$type === 'error' 
    ? theme.colors.danger 
    : theme.colors.info};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  color: ${props => props.$type === 'error' 
    ? theme.colors.danger 
    : theme.colors.info};
  font-size: ${theme.fontSize.sm};
  margin-bottom: ${theme.spacing.lg};
`;

const CursosGrid = styled.div`
  display: grid;
  gap: ${theme.spacing.md};
  max-height: 400px;
  overflow-y: auto;
  padding: ${theme.spacing.sm};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
`;

const CursoCard = styled.div`
  background: white;
  border: 2px solid ${props => props.$selected 
    ? theme.colors.primary 
    : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${theme.spacing.md};
  align-items: start;
  transition: ${theme.transition.normal};
  cursor: pointer;

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: ${theme.shadows.md};
  }
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: ${theme.colors.primary};
`;

const CursoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const CursoNombre = styled.div`
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.text};
`;

const CursoCodigo = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
`;

const CodigoPreview = styled.span`
  background: ${theme.colors.successLight};
  color: ${theme.colors.success};
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: ${theme.fontWeight.semibold};
  font-size: ${theme.fontSize.xs};
`;

const HorarioInput = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSize.sm};
  width: 100%;
  margin-top: ${theme.spacing.sm};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const ModalFooter = styled.div`
  padding: ${theme.spacing.xl};
  border-top: 2px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${theme.colors.background};
`;

const Summary = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

const SummaryBadge = styled.span`
  background: ${theme.colors.primary};
  color: white;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  font-weight: ${theme.fontWeight.bold};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

const Button = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.fontWeight.semibold};
  font-size: ${theme.fontSize.md};
  cursor: pointer;
  transition: ${theme.transition.normal};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  border: none;

  ${props => props.$variant === 'primary' && `
    background: ${theme.colors.primary};
    color: white;

    &:hover:not(:disabled) {
      background: ${theme.colors.primaryHover};
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.md};
    }
  `}

  ${props => props.$variant === 'secondary' && `
    background: ${theme.colors.secondaryLight};
    color: ${theme.colors.secondary};

    &:hover:not(:disabled) {
      background: ${theme.colors.secondary};
      color: white;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textMuted};
`;

export default function BatchGrupoCursoModal({
  isOpen,
  onClose,
  periodos = [],
  aulas = [],
  docentes = [],
  cursos = [],
  onSuccess
}) {
  const [formData, setFormData] = useState({
    periodoId: '',
    aulaId: '',
    docenteId: ''
  });

  const [selectedCursos, setSelectedCursos] = useState([]);
  const [horarios, setHorarios] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aulaSeleccionada, setAulaSeleccionada] = useState(null);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setFormData({ periodoId: '', aulaId: '', docenteId: '' });
      setSelectedCursos([]);
      setHorarios({});
      setAulaSeleccionada(null);
    }
  }, [isOpen]);

  // Cuando se selecciona un aula
  useEffect(() => {
    if (formData.aulaId && Array.isArray(aulas)) {
      const aula = aulas.find(a => a.id === parseInt(formData.aulaId));
      setAulaSeleccionada(aula || null);
      setSelectedCursos([]);
      setHorarios({});
    } else {
      setAulaSeleccionada(null);
    }
  }, [formData.aulaId, aulas]);

  // Filtrar cursos por grado del aula - VERSIÓN CORREGIDA
  const cursosFiltrados = (() => {
    if (!aulaSeleccionada) return [];
    if (!Array.isArray(cursos)) return [];
    if (cursos.length === 0) return [];

    return cursos.filter(curso => {
      if (!curso) return false;
      if (typeof curso !== 'object') return false;
      if (!curso.hasOwnProperty('nivelGrado')) return false;
      if (!curso.hasOwnProperty('activo')) return false;

      return curso.nivelGrado === aulaSeleccionada.grado && curso.activo === true;
    });
  })();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCursoToggle = (cursoId) => {
    setSelectedCursos(prev => {
      if (prev.includes(cursoId)) {
        const newHorarios = { ...horarios };
        delete newHorarios[cursoId];
        setHorarios(newHorarios);
        return prev.filter(id => id !== cursoId);
      } else {
        return [...prev, cursoId];
      }
    });
  };

  const handleHorarioChange = (cursoId, horario) => {
    setHorarios(prev => ({ ...prev, [cursoId]: horario }));
  };

  const getCodigoPreview = (curso) => {
    if (!aulaSeleccionada || !curso || !curso.codigo) return '';
    return `${aulaSeleccionada.grado}${aulaSeleccionada.seccion.toUpperCase()}-${curso.codigo}`;
  };

  const handleSubmit = async () => {
    if (!formData.periodoId || !formData.aulaId || !formData.docenteId) {
      Toast.fire({
        icon: 'error',
        title: 'Completa todos los campos obligatorios'
      });
      return;
    }

    if (selectedCursos.length === 0) {
      Toast.fire({
        icon: 'error',
        title: 'Selecciona al menos un curso'
      });
      return;
    }

    const result = await MySwal.fire({
      title: '¿Crear secciones?',
      html: `Se crearán <strong>${selectedCursos.length}</strong> secciones académicas`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: theme.colors.primary,
      cancelButtonColor: theme.colors.secondary,
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);

    try {
      const batchData = {
        periodoId: parseInt(formData.periodoId),
        aulaId: parseInt(formData.aulaId),
        docenteId: parseInt(formData.docenteId),
        cursos: selectedCursos.map(cursoId => ({
          cursoId,
          horario: horarios[cursoId] || null
        }))
      };

      const response = await onSuccess(batchData);

      if (response && response.totalCreados > 0) {
        await MySwal.fire({
          title: '¡Éxito!',
          html: `
            <div style="text-align: left; margin-top: 16px;">
              <p><strong>✓ Creados:</strong> ${response.totalCreados} secciones</p>
              ${response.totalFallidos > 0 
                ? `<p><strong>✗ Fallidos:</strong> ${response.totalFallidos}</p>` 
                : ''}
              ${response.errores && response.errores.length > 0 
                ? `<div style="margin-top: 12px; max-height: 200px; overflow-y: auto;">
                    <strong>Errores:</strong>
                    <ul style="margin: 8px 0; padding-left: 20px;">
                      ${response.errores.map(e => 
                        `<li>${e.nombreCurso || 'Curso'}: ${e.mensaje || 'Error desconocido'}</li>`
                      ).join('')}
                    </ul>
                  </div>`
                : ''}
            </div>
          `,
          icon: response.totalFallidos > 0 ? 'warning' : 'success',
          confirmButtonColor: theme.colors.primary,
        });

        onClose();
      } else {
        MySwal.fire({
          title: 'No se crearon secciones',
          text: 'Revisa los errores e intenta nuevamente',
          icon: 'error',
          confirmButtonColor: theme.colors.danger,
        });
      }
    } catch (error) {
      console.error('Error en batch:', error);
      MySwal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Error al crear las secciones',
        icon: 'error',
        confirmButtonColor: theme.colors.danger,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const canSubmit = formData.periodoId && formData.aulaId && formData.docenteId && selectedCursos.length > 0;

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}>
      <ModalContainer>
        <ModalHeader>
          <Title>
            <Plus size={28} style={{ display: 'inline', marginRight: '8px' }} />
            Creación Masiva de Secciones
          </Title>
          <CloseButton onClick={onClose} disabled={isSubmitting}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <Section>
            <SectionTitle>1. Configuración General</SectionTitle>
            <FormRow>
              <FormGroup>
                <Label>Período Académico *</Label>
                <Select
                  name="periodoId"
                  value={formData.periodoId}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                >
                  <option value="">Selecciona un período</option>
                  {Array.isArray(periodos) && periodos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} - {p.trimestre}{p.esActual ? ' (Actual)' : ''}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Aula (Grado y Sección) *</Label>
                <Select
                  name="aulaId"
                  value={formData.aulaId}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                >
                  <option value="">Selecciona un aula</option>
                  {Array.isArray(aulas) && aulas.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.grado}° {a.seccion} - {a.periodo} ({a.aulaFisica || 'Sin aula física'})
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Docente Responsable *</Label>
                <Select
                  name="docenteId"
                  value={formData.docenteId}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                >
                  <option value="">Selecciona un docente</option>
                  {Array.isArray(docentes) && docentes.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.codigo} - {d.nombreCompleto || `${d.nombres} ${d.apellidos}`}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </FormRow>

            {aulaSeleccionada && (
              <InfoBox>
                <AlertCircle size={20} />
                <div>
                  Aula seleccionada: <strong>{aulaSeleccionada.grado}° {aulaSeleccionada.seccion}</strong> 
                  {' '}• Capacidad: <strong>{aulaSeleccionada.capacidadMaxima} estudiantes</strong>
                  {' '}• Se mostrarán solo cursos de {aulaSeleccionada.grado}°
                </div>
              </InfoBox>
            )}
          </Section>

          {aulaSeleccionada && (
            <Section>
              <SectionTitle>
                2. Selecciona los Cursos ({cursosFiltrados.length} disponibles)
              </SectionTitle>

              {cursosFiltrados.length === 0 ? (
                <EmptyState>
                  <AlertCircle size={48} style={{ margin: '0 auto 16px' }} />
                  <div>No hay cursos disponibles para el grado {aulaSeleccionada.grado}°</div>
                </EmptyState>
              ) : (
                <CursosGrid>
                  {cursosFiltrados.map(curso => {
                    if (!curso || !curso.id) return null;
                    
                    return (
                      <CursoCard
                        key={curso.id}
                        $selected={selectedCursos.includes(curso.id)}
                        onClick={() => handleCursoToggle(curso.id)}
                      >
                        <Checkbox
                          type="checkbox"
                          checked={selectedCursos.includes(curso.id)}
                          onChange={() => handleCursoToggle(curso.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <CursoInfo>
                          <CursoNombre>{curso.nombre || 'Sin nombre'}</CursoNombre>
                          <CursoCodigo>
                            {curso.codigo || 'N/A'} • {curso.areaConocimiento || 'Sin área'}
                            {' '}• Código: <CodigoPreview>{getCodigoPreview(curso)}</CodigoPreview>
                          </CursoCodigo>
                          {selectedCursos.includes(curso.id) && (
                            <HorarioInput
                              type="text"
                              placeholder="Horario (opcional): Ej: Lun-Mie 8:00-9:30"
                              value={horarios[curso.id] || ''}
                              onChange={(e) => handleHorarioChange(curso.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              maxLength={200}
                            />
                          )}
                        </CursoInfo>
                      </CursoCard>
                    );
                  })}
                </CursosGrid>
              )}
            </Section>
          )}
        </ModalBody>

        <ModalFooter>
          <Summary>
            {selectedCursos.length > 0 && (
              <>
                <Check size={20} style={{ color: theme.colors.success }} />
                <span>
                  Se crearán <SummaryBadge>{selectedCursos.length}</SummaryBadge> secciones
                </span>
              </>
            )}
          </Summary>

          <ButtonGroup>
            <Button
              $variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              $variant="primary"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader size={20} className="spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Crear {selectedCursos.length > 0 ? selectedCursos.length : ''} Secciones
                </>
              )}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}