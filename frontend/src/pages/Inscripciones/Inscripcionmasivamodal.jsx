import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles';
import aulaService from '../../services/aulaService';
import inscripcionService from '../../services/inscripcionService';
import { MySwal, Toast } from '../../utils/alerts';
import { CheckSquare, Square, Users, GraduationCap, X, AlertCircle, UserPen } from 'lucide-react';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing.lg};
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.xl};
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  padding: ${theme.spacing.xl};
  border-bottom: 2px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, ${theme.colors.primary}05 0%, ${theme.colors.accent}05 100%);
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const ModalTitle = styled.h2`
  font-size: ${theme.fontSize['2xl']};
  font-weight: 700;
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.xs} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const ModalSubtitle = styled.p`
  font-size: ${theme.fontSize.md};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${theme.colors.error}10;
    color: ${theme.colors.error};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.xl};
  overflow-y: auto;
  flex: 1;
`;

const SelectGroup = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.sm};
  font-size: ${theme.fontSize.md};
`;

const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.md};
  color: ${theme.colors.text};
  background: white;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 4px ${theme.colors.primary}15;
  }

  &:disabled {
    background: ${theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const Summary = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary}08 0%, ${theme.colors.accent}08 100%);
  border: 2px solid ${theme.colors.primary}20;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryItem = styled.div`
  text-align: center;
  padding: ${theme.spacing.md};
  background: white;
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.sm};
`;

const SummaryIcon = styled.div`
  font-size: 32px;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.primary};
`;

const SummaryValue = styled.div`
  font-size: ${theme.fontSize['3xl']};
  font-weight: 700;
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const SummaryLabel = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
  font-weight: 500;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const ListContainer = styled.div`
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  background: white;
  box-shadow: ${theme.shadows.sm};
`;

const ListHeader = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%);
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.div`
  font-weight: 600;
  color: #000;
  font-size: ${theme.fontSize.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const SelectAllButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: #1d079c;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const List = styled.div`
  max-height: 320px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.background};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: ${theme.borderRadius.sm};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.textSecondary};
  }
`;

const ListItem = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.primary}05;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Checkbox = styled.div`
  color: ${props => props.$checked ? theme.colors.primary : theme.colors.textSecondary};
  flex-shrink: 0;
  transition: all 0.2s;

  ${ListItem}:hover & {
    color: ${props => props.$checked ? theme.colors.primary : theme.colors.text};
  }
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemDetail = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSize.xs};
  font-weight: 600;
  background: ${props => props.$color}15;
  color: ${props => props.$color};
  border: 1px solid ${props => props.$color}30;
`;

const EmptyState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.textSecondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const EmptyIcon = styled.div`
  color: ${theme.colors.border};
`;

const ModalFooter = styled.div`
  padding: ${theme.spacing.xl};
  border-top: 2px solid ${theme.colors.border};
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  background: ${theme.colors.background};
`;

const Button = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-weight: 600;
  font-size: ${theme.fontSize.md};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  /* background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryDark} 100%); */
  background-color: #0303ac;
  color: #fff;
  box-shadow: ${theme.shadows.md};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(Button)`
  background: white;
  color: ${theme.colors.text};
  border: 2px solid ${theme.colors.border};

  &:hover:not(:disabled) {
    background: ${theme.colors.background};
    border-color: ${theme.colors.textSecondary};
  }
`;

const LoadingState = styled.div`
  padding: ${theme.spacing['2xl']};
  text-align: center;
  color: ${theme.colors.textSecondary};
`;

export default function InscripcionMasivaModal({ isOpen, onClose, onSuccess }) {
  const [aulas, setAulas] = useState([]);
  const [aulaSeleccionada, setAulaSeleccionada] = useState('');
  const [detalleAula, setDetalleAula] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAulas, setLoadingAulas] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState(new Set());
  const [gruposSeleccionados, setGruposSeleccionados] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      cargarAulas();
    }
  }, [isOpen]);

  const cargarAulas = async () => {
    try {
      setLoadingAulas(true);
      const data = await aulaService.getAll();
      const aulasActivas = data.filter(a => a.activo);
      setAulas(aulasActivas);
    } catch (error) {
      console.error('Error al cargar aulas:', error);
      Toast.fire({ icon: 'error', title: 'Error al cargar aulas' });
    } finally {
      setLoadingAulas(false);
    }
  };

  const cargarDetalleAula = async (aulaId) => {
    try {
      setLoading(true);
      const detalle = await aulaService.getDetalle(aulaId);
      setDetalleAula(detalle);
      setEstudiantesSeleccionados(new Set());
      setGruposSeleccionados(new Set());
    } catch (error) {
      console.error('Error al cargar detalle del aula:', error);
      Toast.fire({ icon: 'error', title: 'Error al cargar información del aula' });
    } finally {
      setLoading(false);
    }
  };

  const handleAulaChange = (e) => {
    const aulaId = e.target.value;
    setAulaSeleccionada(aulaId);
    
    if (aulaId) {
      cargarDetalleAula(aulaId);
    } else {
      setDetalleAula(null);
      setEstudiantesSeleccionados(new Set());
      setGruposSeleccionados(new Set());
    }
  };

  const toggleEstudiante = (estudianteId) => {
    setEstudiantesSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(estudianteId)) {
        nuevo.delete(estudianteId);
      } else {
        nuevo.add(estudianteId);
      }
      return nuevo;
    });
  };

  const toggleGrupo = (grupoId) => {
    setGruposSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(grupoId)) {
        nuevo.delete(grupoId);
      } else {
        nuevo.add(grupoId);
      }
      return nuevo;
    });
  };

  const seleccionarTodosEstudiantes = () => {
    if (!detalleAula?.estudiantes) return;
    
    const todosSeleccionados = estudiantesSeleccionados.size === detalleAula.estudiantes.length;
    
    if (todosSeleccionados) {
      setEstudiantesSeleccionados(new Set());
    } else {
      setEstudiantesSeleccionados(new Set(detalleAula.estudiantes.map(e => e.id)));
    }
  };

  const seleccionarTodosGrupos = () => {
    if (!detalleAula?.gruposCursos) return;
    
    const todosSeleccionados = gruposSeleccionados.size === detalleAula.gruposCursos.length;
    
    if (todosSeleccionados) {
      setGruposSeleccionados(new Set());
    } else {
      setGruposSeleccionados(new Set(detalleAula.gruposCursos.map(g => g.id)));
    }
  };

  const procesarInscripciones = async () => {
    if (estudiantesSeleccionados.size === 0 || gruposSeleccionados.size === 0) {
      Toast.fire({ icon: 'warning', title: 'Debes seleccionar al menos un estudiante y un grupo' });
      return;
    }

    const totalInscripciones = estudiantesSeleccionados.size * gruposSeleccionados.size;

    const result = await MySwal.fire({
      title: '¿Confirmar inscripciones?',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="margin-bottom: 15px;">Se crearán <strong>${totalInscripciones}</strong> inscripciones:</p>
          <ul style="margin: 0;">
            <li><strong>${estudiantesSeleccionados.size}</strong> estudiantes seleccionados</li>
            <li><strong>${gruposSeleccionados.size}</strong> Secciones seleccionadas</li>
          </ul>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, inscribir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: theme.colors.primary,
    });

    if (!result.isConfirmed) return;

    try {
      setProcesando(true);
      
      MySwal.fire({
        title: 'Procesando inscripciones...',
        html: 'Por favor espera mientras se procesan las inscripciones',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      const estudiantesArray = Array.from(estudiantesSeleccionados);
      const gruposArray = Array.from(gruposSeleccionados);
      
      let exitosas = 0;
      let fallidas = 0;
      const errores = [];

      for (const estudianteId of estudiantesArray) {
        for (const grupoCursoId of gruposArray) {
          try {
            await inscripcionService.create({
              estudianteId,
              grupoCursoId,
              estado: 'Activo',
              activo: true,
            });
            exitosas++;
          } catch (error) {
            fallidas++;
            const estudiante = detalleAula.estudiantes.find(e => e.id === estudianteId);
            const grupo = detalleAula.gruposCursos.find(g => g.id === grupoCursoId);
            errores.push({
              estudiante: estudiante?.nombreCompleto || 'Desconocido',
              grupo: grupo?.nombreCurso || 'Desconocido',
              error: error.response?.data?.message || 'Error desconocido'
            });
          }
        }
      }

      MySwal.close();

      if (fallidas === 0) {
        await MySwal.fire({
          title: '¡Inscripciones completadas!',
          html: `Se crearon <strong>${exitosas}</strong> inscripciones exitosamente.`,
          icon: 'success',
          confirmButtonColor: theme.colors.primary,
        });
        
        handleClose();
        
        if (onSuccess) {
          onSuccess();
        }
        
      } else {
        const detalleErrores = errores.slice(0, 5).map(e => 
          `<li style="margin-bottom: 8px;"><strong>${e.estudiante}</strong> en <strong>${e.grupo}</strong>: ${e.error}</li>`
        ).join('');
        
        await MySwal.fire({
          title: 'Inscripciones completadas con errores',
          html: `
            <div style="text-align: left;">
              <p>Exitosas: <strong style="color: #10b981;">${exitosas}</strong></p>
              <p>Fallidas: <strong style="color: #ef4444;">${fallidas}</strong></p>
              ${fallidas > 0 ? `
                <div style="margin-top: 15px;">
                  <p><strong>Primeros errores:</strong></p>
                  <ul style="font-size: 13px; max-height: 200px; overflow-y: auto; padding-left: 20px;">
                    ${detalleErrores}
                  </ul>
                </div>
              ` : ''}
            </div>
          `,
          icon: 'warning',
          confirmButtonColor: theme.colors.primary,
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }

    } catch (error) {
      console.error('Error al procesar inscripciones:', error);
      MySwal.fire({
        title: 'Error',
        text: 'Ocurrió un error al procesar las inscripciones',
        icon: 'error',
        confirmButtonColor: theme.colors.primary,
      });
    } finally {
      setProcesando(false);
    }
  };

  const handleClose = () => {
    if (!procesando) {
      setAulaSeleccionada('');
      setDetalleAula(null);
      setEstudiantesSeleccionados(new Set());
      setGruposSeleccionados(new Set());
      onClose();
    }
  };

  const limpiarSeleccion = () => {
    setEstudiantesSeleccionados(new Set());
    setGruposSeleccionados(new Set());
  };

  const totalInscripciones = estudiantesSeleccionados.size * gruposSeleccionados.size;

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderContent>
            <ModalTitle>
              <UserPen size={28}/>
              Inscripción Masiva por Aula
            </ModalTitle>
            <ModalSubtitle>
              Inscribe múltiples estudiantes en varios grupos-cursos de forma rápida
            </ModalSubtitle>
          </HeaderContent>
          <CloseButton onClick={handleClose} disabled={procesando}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <SelectGroup>
            <Label>Selecciona un Aula</Label>
            <Select 
              value={aulaSeleccionada} 
              onChange={handleAulaChange}
              disabled={loadingAulas || procesando}
            >
              <option value="">-- Selecciona un aula --</option>
              {aulas.map(aula => (
                <option key={aula.id} value={aula.id}>
                  {aula.grado}° {aula.seccion} - {aula.periodo} 
                  ({aula.cantidadEstudiantes || 0} estudiantes)
                </option>
              ))}
            </Select>
          </SelectGroup>

          {loading && (
            <LoadingState>Cargando información del aula...</LoadingState>
          )}

          {!loading && detalleAula && (
            <>
              {totalInscripciones > 0 && (
                <Summary>
                  <SummaryGrid>
                    <SummaryItem>
                      <SummaryIcon><Users /></SummaryIcon>
                      <SummaryValue>{estudiantesSeleccionados.size}</SummaryValue>
                      <SummaryLabel>Estudiantes</SummaryLabel>
                    </SummaryItem>
                    <SummaryItem>
                      <SummaryIcon><GraduationCap /></SummaryIcon>
                      <SummaryValue>{gruposSeleccionados.size}</SummaryValue>
                      <SummaryLabel>Grupos-Cursos</SummaryLabel>
                    </SummaryItem>
                    <SummaryItem>
                      <SummaryIcon><CheckSquare /></SummaryIcon>
                      <SummaryValue>{totalInscripciones}</SummaryValue>
                      <SummaryLabel>Total Inscripciones</SummaryLabel>
                    </SummaryItem>
                  </SummaryGrid>
                </Summary>
              )}

              <Grid>
                <ListContainer>
                  <ListHeader>
                    <HeaderTitle>
                      <Users size={18} />
                      Estudiantes ({detalleAula.estudiantes?.length || 0})
                    </HeaderTitle>
                    <SelectAllButton 
                      onClick={seleccionarTodosEstudiantes}
                      disabled={!detalleAula.estudiantes?.length || procesando}
                    >
                      {estudiantesSeleccionados.size === detalleAula.estudiantes?.length 
                        ? 'Deseleccionar' 
                        : 'Seleccionar todos'}
                    </SelectAllButton>
                  </ListHeader>
                  <List>
                    {detalleAula.estudiantes?.length > 0 ? (
                      detalleAula.estudiantes.map(estudiante => {
                        const isSelected = estudiantesSeleccionados.has(estudiante.id);
                        return (
                          <ListItem 
                            key={estudiante.id}
                            onClick={() => !procesando && toggleEstudiante(estudiante.id)}
                          >
                            <Checkbox $checked={isSelected}>
                              {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                            </Checkbox>
                            <ItemInfo>
                              <ItemName>{estudiante.nombreCompleto}</ItemName>
                              <ItemDetail>
                                {estudiante.matricula} • {estudiante.grado}° {estudiante.seccion}
                              </ItemDetail>
                            </ItemInfo>
                          </ListItem>
                        );
                      })
                    ) : (
                      <EmptyState>
                        <EmptyIcon><AlertCircle size={48} /></EmptyIcon>
                        <div>No hay estudiantes en esta aula</div>
                      </EmptyState>
                    )}
                  </List>
                </ListContainer>

                <ListContainer>
                  <ListHeader>
                    <HeaderTitle>
                      <GraduationCap size={18} />
                      Grupos-Cursos ({detalleAula.gruposCursos?.length || 0})
                    </HeaderTitle>
                    <SelectAllButton 
                      onClick={seleccionarTodosGrupos}
                      disabled={!detalleAula.gruposCursos?.length || procesando}
                    >
                      {gruposSeleccionados.size === detalleAula.gruposCursos?.length 
                        ? 'Deseleccionar' 
                        : 'Seleccionar todos'}
                    </SelectAllButton>
                  </ListHeader>
                  <List>
                    {detalleAula.gruposCursos?.length > 0 ? (
                      detalleAula.gruposCursos.map(grupo => {
                        const isSelected = gruposSeleccionados.has(grupo.id);
                        return (
                          <ListItem 
                            key={grupo.id}
                            onClick={() => !procesando && toggleGrupo(grupo.id)}
                          >
                            <Checkbox $checked={isSelected}>
                              {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                            </Checkbox>
                            <ItemInfo>
                              <ItemName>{grupo.nombreCurso}</ItemName>
                              <ItemDetail>
                                <span>{grupo.codigo} • {grupo.nombreDocente}</span>
                                <Badge $color={theme.colors.primary}>
                                  {grupo.cantidadEstudiantes || 0} inscritos
                                </Badge>
                              </ItemDetail>
                            </ItemInfo>
                          </ListItem>
                        );
                      })
                    ) : (
                      <EmptyState>
                        <EmptyIcon><AlertCircle size={48} /></EmptyIcon>
                        <div>No hay grupos-cursos en esta aula</div>
                      </EmptyState>
                    )}
                  </List>
                </ListContainer>
              </Grid>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <SecondaryButton 
            onClick={limpiarSeleccion}
            disabled={procesando || (estudiantesSeleccionados.size === 0 && gruposSeleccionados.size === 0)}
          >
            Limpiar Selección
          </SecondaryButton>
          <SecondaryButton onClick={handleClose} disabled={procesando}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton 
            onClick={procesarInscripciones}
            disabled={procesando || estudiantesSeleccionados.size === 0 || gruposSeleccionados.size === 0}
          >
            {procesando ? 'Procesando...' : `Inscribir (${totalInscripciones})`}
          </PrimaryButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
}
