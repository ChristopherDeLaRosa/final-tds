import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles';
import aulaService from '../../services/aulaService';
import inscripcionService from '../../services/inscripcionService';
import { MySwal, Toast } from '../../utils/alerts';
import { CheckSquare, Square, Users, GraduationCap } from 'lucide-react';

const Container = styled.div`
  padding: ${theme.spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${theme.fontSize['2xl']};
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const Subtitle = styled.p`
  font-size: ${theme.fontSize.md};
  color: ${theme.colors.textSecondary};
`;

const Card = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.lg};
`;

const SelectGroup = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.sm};
  font-size: ${theme.fontSize.sm};
`;

const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.md};
  color: ${theme.colors.text};
  background: white;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}15;
  }

  &:disabled {
    background: ${theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ListContainer = styled.div`
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
`;

const ListHeader = styled.div`
  background: ${theme.colors.primary}10;
  padding: ${theme.spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid ${theme.colors.border};
`;

const HeaderTitle = styled.div`
  font-weight: 600;
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.md};
`;

const SelectAllButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.primaryDark};
  }

  &:disabled {
    background: ${theme.colors.disabled};
    cursor: not-allowed;
  }
`;

const List = styled.div`
  max-height: 500px;
  overflow-y: auto;
`;

const ListItem = styled.div`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${theme.colors.primary}05;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Checkbox = styled.div`
  font-size: 20px;
  color: ${props => props.$checked ? theme.colors.primary : theme.colors.textSecondary};
  flex-shrink: 0;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: ${theme.colors.text};
  margin-bottom: 2px;
`;

const ItemDetail = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

const Badge = styled.span`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
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
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-weight: 600;
  font-size: ${theme.fontSize.md};
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: ${theme.colors.primary};
  color: white;

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const SecondaryButton = styled(Button)`
  background: white;
  color: ${theme.colors.text};
  border: 2px solid ${theme.colors.border};

  &:hover:not(:disabled) {
    background: ${theme.colors.primary}05;
    border-color: ${theme.colors.primary};
  }
`;

const Summary = styled.div`
  background: ${theme.colors.primary}05;
  border: 2px solid ${theme.colors.primary}30;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
`;

const SummaryItem = styled.div`
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: ${theme.fontSize['2xl']};
  font-weight: 700;
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const SummaryLabel = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
  font-weight: 500;
`;

export default function InscripcionMasivaTab({ onInscripcionCompleted }) {
  const [aulas, setAulas] = useState([]);
  const [aulaSeleccionada, setAulaSeleccionada] = useState('');
  const [detalleAula, setDetalleAula] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAulas, setLoadingAulas] = useState(true);
  const [procesando, setProcesando] = useState(false);

  // Estados para selección
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState(new Set());
  const [gruposSeleccionados, setGruposSeleccionados] = useState(new Set());

  // Cargar aulas al montar
  useEffect(() => {
    cargarAulas();
  }, []);

  const cargarAulas = async () => {
    try {
      setLoadingAulas(true);
      const data = await aulaService.getAll();
      const aulasActivas = data.filter(a => a.activo);
      setAulas(aulasActivas);
    } catch (error) {
      console.error('Error al cargar aulas:', error);
      Toast.fire({
        title: 'Error al cargar aulas',
      });
    } finally {
      setLoadingAulas(false);
    }
  };

  const cargarDetalleAula = async (aulaId) => {
    try {
      setLoading(true);
      const detalle = await aulaService.getDetalle(aulaId);
      setDetalleAula(detalle);
      
      // Limpiar selecciones previas
      setEstudiantesSeleccionados(new Set());
      setGruposSeleccionados(new Set());
    } catch (error) {
      console.error('Error al cargar detalle del aula:', error);
      Toast.fire({
        title: 'Error al cargar información del aula',
      });
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
      Toast.fire({
        title: 'Debes seleccionar al menos un estudiante y un grupo',
      });
      return;
    }

    const totalInscripciones = estudiantesSeleccionados.size * gruposSeleccionados.size;

    const result = await MySwal.fire({
      title: '¿Confirmar inscripciones?',
      html: `
        <p>Se crearán <strong>${totalInscripciones}</strong> inscripciones:</p>
        <ul style="text-align: left; margin-top: 15px;">
          <li><strong>${estudiantesSeleccionados.size}</strong> estudiantes</li>
          <li><strong>${gruposSeleccionados.size}</strong> grupos-cursos</li>
        </ul>
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
        html: 'Por favor espera',
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      const estudiantesArray = Array.from(estudiantesSeleccionados);
      const gruposArray = Array.from(gruposSeleccionados);
      
      let exitosas = 0;
      let fallidas = 0;
      const errores = [];

      // Procesar inscripciones una por una
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

      // Mostrar resultado
      if (fallidas === 0) {
        await MySwal.fire({
          title: '¡Inscripciones completadas!',
          html: `Se crearon <strong>${exitosas}</strong> inscripciones exitosamente.`,
          icon: 'success',
          confirmButtonColor: theme.colors.primary,
        });
        
        // Limpiar selecciones
        setEstudiantesSeleccionados(new Set());
        setGruposSeleccionados(new Set());
        setAulaSeleccionada('');
        setDetalleAula(null);
        
        // Notificar al componente padre
        if (onInscripcionCompleted) {
          onInscripcionCompleted();
        }
        
      } else {
        const detalleErrores = errores.slice(0, 5).map(e => 
          `<li><strong>${e.estudiante}</strong> en <strong>${e.grupo}</strong>: ${e.error}</li>`
        ).join('');
        
        await MySwal.fire({
          title: 'Inscripciones completadas con errores',
          html: `
            <p>Exitosas: <strong>${exitosas}</strong></p>
            <p>Fallidas: <strong>${fallidas}</strong></p>
            ${fallidas > 0 ? `
              <div style="text-align: left; margin-top: 15px;">
                <p><strong>Errores (mostrando primeros 5):</strong></p>
                <ul style="font-size: 12px; max-height: 200px; overflow-y: auto;">
                  ${detalleErrores}
                </ul>
              </div>
            ` : ''}
          `,
          icon: 'warning',
          confirmButtonColor: theme.colors.primary,
        });
        
        // Notificar al componente padre incluso con errores
        if (onInscripcionCompleted) {
          onInscripcionCompleted();
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

  const limpiarSeleccion = () => {
    setEstudiantesSeleccionados(new Set());
    setGruposSeleccionados(new Set());
  };

  const totalInscripciones = estudiantesSeleccionados.size * gruposSeleccionados.size;

  return (
    <Container>
      <Header>
        <Title>Inscripción Masiva por Aula</Title>
        <Subtitle>Inscribe múltiples estudiantes en varios grupos-cursos de forma rápida</Subtitle>
      </Header>

      <Card>
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
          <EmptyState>Cargando información del aula...</EmptyState>
        )}

        {!loading && detalleAula && (
          <>
            {totalInscripciones > 0 && (
              <Summary>
                <SummaryGrid>
                  <SummaryItem>
                    <SummaryValue>{estudiantesSeleccionados.size}</SummaryValue>
                    <SummaryLabel>Estudiantes</SummaryLabel>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryValue>{gruposSeleccionados.size}</SummaryValue>
                    <SummaryLabel>Grupos-Cursos</SummaryLabel>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryValue>{totalInscripciones}</SummaryValue>
                    <SummaryLabel>Total Inscripciones</SummaryLabel>
                  </SummaryItem>
                </SummaryGrid>
              </Summary>
            )}

            <Grid>
              {/* Lista de Estudiantes */}
              <ListContainer>
                <ListHeader>
                  <HeaderTitle>
                    <Users style={{ marginRight: '8px' }} size={18} />
                    Estudiantes ({detalleAula.estudiantes?.length || 0})
                  </HeaderTitle>
                  <SelectAllButton 
                    onClick={seleccionarTodosEstudiantes}
                    disabled={!detalleAula.estudiantes?.length || procesando}
                  >
                    {estudiantesSeleccionados.size === detalleAula.estudiantes?.length 
                      ? 'Deseleccionar todos' 
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
                    <EmptyState>No hay estudiantes en esta aula</EmptyState>
                  )}
                </List>
              </ListContainer>

              {/* Lista de Grupos-Cursos */}
              <ListContainer>
                <ListHeader>
                  <HeaderTitle>
                    <GraduationCap style={{ marginRight: '8px' }} size={18} />
                    Grupos-Cursos ({detalleAula.gruposCursos?.length || 0})
                  </HeaderTitle>
                  <SelectAllButton 
                    onClick={seleccionarTodosGrupos}
                    disabled={!detalleAula.gruposCursos?.length || procesando}
                  >
                    {gruposSeleccionados.size === detalleAula.gruposCursos?.length 
                      ? 'Deseleccionar todos' 
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
                              {grupo.codigo} • {grupo.nombreDocente}
                              <Badge $color={theme.colors.primary} style={{ marginLeft: '8px' }}>
                                {grupo.cantidadEstudiantes || 0} inscritos
                              </Badge>
                            </ItemDetail>
                          </ItemInfo>
                        </ListItem>
                      );
                    })
                  ) : (
                    <EmptyState>No hay grupos-cursos en esta aula</EmptyState>
                  )}
                </List>
              </ListContainer>
            </Grid>

            <ButtonGroup>
              <SecondaryButton 
                onClick={limpiarSeleccion}
                disabled={procesando || (estudiantesSeleccionados.size === 0 && gruposSeleccionados.size === 0)}
              >
                Limpiar Selección
              </SecondaryButton>
              <PrimaryButton 
                onClick={procesarInscripciones}
                disabled={procesando || estudiantesSeleccionados.size === 0 || gruposSeleccionados.size === 0}
              >
                {procesando ? 'Procesando...' : `Inscribir (${totalInscripciones})`}
              </PrimaryButton>
            </ButtonGroup>
          </>
        )}
      </Card>
    </Container>
  );
}
